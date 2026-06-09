"""Replay production consultation end-session processing for evaluation."""

from __future__ import annotations

import re
import shutil
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from eval.dataset import format_notes


def sanitize_text(text: str | None) -> str | None:
    if not text:
        return text
    return re.sub(r"[^\x00-\x7F]+", "", text)


@dataclass
class PipelineResult:
    session_id: str
    speaker_count: int
    transcription_enabled: bool
    assemblyai_raw: str
    transcript_final: str
    notes_block: str
    summary_raw: str
    summary_sanitized: str | None
    converted_audio_path: Path | None = None
    meta: dict[str, Any] = field(default_factory=dict)


def process_session(
    audio_path: Path,
    speaker_count: int,
    transcription_enabled: bool,
    structured_notes: dict[str, Any],
    session_id: str = "",
) -> PipelineResult:
    from eval.llm_provider import (
        generate_summary,
        identify_roles_in_transcription,
        model_label,
    )
    from services.audio_conversion_service import convert_audio
    from services.assemblyai_service import transcribe_audio_with_assemblyai

    converted_path = Path(convert_audio(str(audio_path)))
    assemblyai_raw = ""
    transcript_final = ""

    if transcription_enabled:
        data = transcribe_audio_with_assemblyai(str(converted_path), speaker_count)
        assemblyai_raw = data.get("full_text") or data.get("transcription_text") or ""
        transcript_final = identify_roles_in_transcription(assemblyai_raw)
    else:
        placeholder = "Transcription was disabled for this session."
        assemblyai_raw = placeholder
        transcript_final = placeholder

    notes_block = format_notes(structured_notes)
    if not transcript_final.strip():
        transcript_final = "No transcription available."

    summary_input = f"{transcript_final} {notes_block}"
    summary_raw = generate_summary(summary_input)
    summary_sanitized = sanitize_text(summary_raw)

    return PipelineResult(
        session_id=session_id,
        speaker_count=speaker_count,
        transcription_enabled=transcription_enabled,
        assemblyai_raw=assemblyai_raw,
        transcript_final=transcript_final,
        notes_block=notes_block,
        summary_raw=summary_raw,
        summary_sanitized=summary_sanitized,
        converted_audio_path=converted_path,
        meta={
            "run_at": datetime.now(timezone.utc).isoformat(),
            "llm_provider": model_label(),
            "gemini_model": model_label(),
            "assemblyai_speaker_labels": True,
            "assemblyai_speakers_expected": speaker_count,
        },
    )


def write_session_artifacts(result: PipelineResult, out_dir: Path) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)

    if result.converted_audio_path and result.converted_audio_path.is_file():
        shutil.copy2(result.converted_audio_path, out_dir / "01_converted.wav")

    files = {
        "02_assemblyai_raw.txt": result.assemblyai_raw,
        "03_transcript_final.txt": result.transcript_final,
        "04_notes_block.txt": result.notes_block,
        "05_summary_raw.txt": result.summary_raw,
        "06_summary_sanitized.txt": result.summary_sanitized or "",
    }
    for name, content in files.items():
        (out_dir / name).write_text(content or "", encoding="utf-8")

    import json

    (out_dir / "pipeline_meta.json").write_text(
        json.dumps(
            {
                "session_id": result.session_id,
                "speaker_count": result.speaker_count,
                "transcription_enabled": result.transcription_enabled,
                **result.meta,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    return out_dir


def generate_upper_bound_summary(reference_transcript: str, structured_notes: dict[str, Any]) -> str:
    """Upper-bound condition: perfect transcript + notes -> summary (isolates summarization)."""
    from eval.llm_provider import generate_summary

    notes_block = format_notes(structured_notes)
    return generate_summary(f"{reference_transcript} {notes_block}")
