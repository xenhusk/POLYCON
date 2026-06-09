"""
LLM provider for eval pipeline: Gemini (production default) or MiniMax (fallback).

Set EVAL_LLM_PROVIDER=gemini|minimax or pass --llm-provider on the CLI.
"""

from __future__ import annotations

import os
import re
from typing import Callable

ProviderName = str

_using_minimax_fallback = False


def reset_fallback_state() -> None:
    global _using_minimax_fallback
    _using_minimax_fallback = False


def get_provider_name() -> ProviderName:
    return (os.getenv("EVAL_LLM_PROVIDER") or "gemini").strip().lower()


def set_provider_name(name: str) -> None:
    os.environ["EVAL_LLM_PROVIDER"] = name.strip().lower()


def _gemini_generate(prompt: str) -> str:
    import google.generativeai as genai

    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel(model_name="gemini-flash-lite-latest")
    response = model.generate_content(prompt)
    return (response.text or "").strip()


def _minimax_generate(prompt: str) -> str:
    try:
        from openai import OpenAI
    except ImportError as exc:
        raise ImportError("pip install openai for MiniMax provider") from exc

    api_key = (
        os.getenv("MINIMAX_API_KEY")
        or os.getenv("EVAL_MINIMAX_API_KEY")
        or os.getenv("OPENAI_API_KEY")
    )
    if not api_key:
        raise RuntimeError("MINIMAX_API_KEY not set in backend/.env")

    base_url = os.getenv("MINIMAX_BASE_URL", "https://api.minimax.io/v1")
    model = os.getenv("MINIMAX_MODEL", "MiniMax-M2.5")

    client = OpenAI(base_url=base_url, api_key=api_key)
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_completion_tokens=4096,
        extra_body={"thinking": {"type": "disabled"}},
    )
    message = response.choices[0].message
    content = message.content
    if isinstance(content, list):
        parts = []
        for part in content:
            if isinstance(part, dict) and part.get("type") == "text":
                parts.append(part.get("text", ""))
            else:
                parts.append(str(part))
        return "".join(parts).strip()
    return (content or "").strip()


def _is_rate_limit_error(exc: Exception) -> bool:
    msg = str(exc).lower()
    return any(t in msg for t in ("rate", "quota", "429", "resource exhausted", "limit", "too many"))


def _minimax_configured() -> bool:
    return bool(
        os.getenv("MINIMAX_API_KEY")
        or os.getenv("EVAL_MINIMAX_API_KEY")
        or os.getenv("OPENAI_API_KEY")
    )


def generate_text(prompt: str) -> str:
    global _using_minimax_fallback

    provider = get_provider_name()
    if _using_minimax_fallback:
        provider = "minimax"

    if provider == "minimax":
        return _minimax_generate(prompt)
    if provider == "gemini":
        try:
            return _gemini_generate(prompt)
        except Exception as exc:
            if _is_rate_limit_error(exc) and _minimax_configured():
                _using_minimax_fallback = True
                print("Gemini rate limit — using MiniMax for this and subsequent LLM calls.")
                return _minimax_generate(prompt)
            raise
    raise ValueError(f"Unknown EVAL_LLM_PROVIDER: {provider}")


def model_label() -> str:
    if _using_minimax_fallback or get_provider_name() == "minimax":
        return os.getenv("MINIMAX_MODEL", "MiniMax-M2.5")
    return "gemini-flash-lite-latest"


def identify_roles_in_transcription(transcription: str) -> str:
    """Same rules as google_gemini.identify_roles_in_transcription."""
    if not transcription or len(transcription.strip()) < 10:
        return transcription

    prompt = (
        "You are provided with a transcript of a conversation between a teacher and one or more students. "
        "Your task is to ONLY annotate the EXISTING sentences in the transcript with role labels. "
        "CRITICAL RULES:\n"
        "1. DO NOT add, modify, or generate any new content\n"
        "2. DO NOT expand on what was said\n"
        "3. DO NOT add explanations or context\n"
        "4. ONLY prefix each existing sentence with 'Teacher:' or 'Student:' (or 'Student 1:', 'Student 2:', etc.)\n"
        "5. Preserve the exact original text - only add the role prefix\n"
        "6. If the transcript already has speaker labels (e.g., 'Speaker 0:', 'Speaker 1:'), map them to Teacher/Student\n\n"
        "For each sentence in the transcript, prefix it with either 'Teacher:' or 'Student:'. "
        "If there are multiple students, assign each a unique identifier (e.g., Student 1, Student 2, etc.) "
        "based on the speaker labels or context. \n\n"
        "Transcript to annotate:\n"
        f"{transcription}\n\n"
        "Output ONLY the annotated transcript with role prefixes. Do NOT add any other text, explanations, or content.\n"
        "Example output format:\n"
        "Teacher: [exact original text]\n"
        "Student 1: [exact original text]\n"
        "Student 2: [exact original text]\n"
    )

    try:
        annotated_text = generate_text(prompt)
        if len(annotated_text) > len(transcription) * 2:
            return _speaker_fallback(transcription)
        return annotated_text
    except Exception:
        return _speaker_fallback(transcription)


def _speaker_fallback(transcription: str) -> str:
    if "Speaker" not in transcription:
        return transcription
    lines = transcription.split("\n")
    result = []
    for line in lines:
        if not line.strip():
            continue
        if "Speaker 0:" in line or "Speaker A:" in line:
            result.append(line.replace("Speaker 0:", "Teacher:").replace("Speaker A:", "Teacher:"))
        else:
            line = re.sub(r"Speaker \d+:", "Student:", line)
            line = re.sub(r"Speaker [B-Z]:", "Student:", line)
            result.append(line)
    return "\n".join(result)


def generate_summary(text: str) -> str:
    prompt = (
        "Please read the following conversation transcript carefully. "
        "Generate a concise summary that captures the key points discussed during the session. "
        "Do not include the word 'Summary:' "
        "or any extraneous text in your output.\n\n"
        "Conversation Transcript:\n"
        f"{text}"
    )
    try:
        return generate_text(prompt)
    except Exception as e:
        return f"Error generating summary: {str(e)}"


def with_fallback_on_rate_limit(fn: Callable[[], str], fallback_provider: str = "minimax") -> str:
    """Try current provider; on rate-limit errors switch to fallback once."""
    try:
        return fn()
    except Exception as exc:
        msg = str(exc).lower()
        rate_limited = any(
            token in msg
            for token in ("rate", "quota", "429", "resource exhausted", "limit", "too many")
        )
        current = get_provider_name()
        if rate_limited and current != fallback_provider and os.getenv("MINIMAX_API_KEY"):
            set_provider_name(fallback_provider)
            try:
                return fn()
            finally:
                set_provider_name(current)
        raise
