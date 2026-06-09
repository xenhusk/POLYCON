"""Automatic metrics for consultation pipeline evaluation."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any

SPEAKER_PREFIX = re.compile(
    r"^(?:Teacher|Student(?:\s+\d+)?|Speaker\s+[A-Z0-9]+)\s*:\s*",
    re.IGNORECASE | re.MULTILINE,
)

FILLER_WORDS = re.compile(r"\b(?:um|uh|er|ah|hmm|like|you know)\b", re.IGNORECASE)

STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
    "by", "from", "as", "is", "was", "are", "were", "be", "been", "being", "have", "has",
    "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "must",
    "that", "this", "these", "those", "it", "its", "they", "them", "their", "we", "our",
    "you", "your", "he", "she", "his", "her", "not", "no", "yes", "so", "if", "then",
    "than", "when", "what", "which", "who", "how", "all", "each", "any", "some", "can",
}

CONTRACTION_MAP = [
    (r"\blet's\b", "let us"),
    (r"\bi'm\b", "i am"),
    (r"\bi've\b", "i have"),
    (r"\bi'll\b", "i will"),
    (r"\bdon't\b", "do not"),
    (r"\bdoesn't\b", "does not"),
    (r"\bdidn't\b", "did not"),
    (r"\bwon't\b", "will not"),
    (r"\bcan't\b", "cannot"),
    (r"\bisn't\b", "is not"),
    (r"\baren't\b", "are not"),
    (r"\bwasn't\b", "was not"),
    (r"\bweren't\b", "were not"),
    (r"\bhaven't\b", "have not"),
    (r"\bhasn't\b", "has not"),
    (r"\bwouldn't\b", "would not"),
    (r"\bshouldn't\b", "should not"),
    (r"\bit's\b", "it is"),
    (r"\bthat's\b", "that is"),
    (r"\bwhat's\b", "what is"),
    (r"\bthere's\b", "there is"),
]

TECH_ALIASES = [
    (r"socket\.?\s*io", "socketio"),
    (r"next\.?\s*js", "nextjs"),
    (r"node\.?\s*js", "nodejs"),
    (r"front\s*[- ]?\s*end", "frontend"),
    (r"back\s*[- ]?\s*end", "backend"),
    (r"web\s*[- ]?\s*sockets?", "websockets"),
    (r"data\s*[- ]?\s*updated", "dataupdated"),
    (r"update\s*[- ]?\s*data", "updatedata"),
    (r"cors\s*policy", "cors"),
    (r"real\s*[- ]?\s*time", "realtime"),
    (r"postgre\s*sql", "postgresql"),
    (r"\.env\b", "envfile"),
    (r"git\s*hub", "github"),
]

_semantic_model = None


def normalize_for_wer(text: str) -> str:
    """Strip role labels and normalize whitespace (strict baseline)."""
    if not text:
        return ""
    lines: list[str] = []
    for line in text.splitlines():
        line = SPEAKER_PREFIX.sub("", line).strip()
        if line:
            lines.append(line)
    joined = " ".join(lines)
    return re.sub(r"\s+", " ", joined).strip().lower()


def normalize_for_wer_fair(text: str) -> str:
    """Fairer WER normalization: fillers, contractions, tech term aliases."""
    text = normalize_for_wer(text)
    text = FILLER_WORDS.sub(" ", text)
    for pattern, replacement in CONTRACTION_MAP:
        text = re.sub(pattern, replacement, text)
    for pattern, replacement in TECH_ALIASES:
        text = re.sub(pattern, replacement, text)
    text = re.sub(r"[^\w\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def _wer_with_transform(reference: str, hypothesis: str, fair: bool) -> float | None:
    ref = normalize_for_wer_fair(reference) if fair else normalize_for_wer(reference)
    hyp = normalize_for_wer_fair(hypothesis) if fair else normalize_for_wer(hypothesis)
    if not ref:
        return None
    try:
        import jiwer
    except ImportError as exc:
        raise ImportError("Install eval deps: pip install -r eval/requirements-eval.txt") from exc
    transform = jiwer.Compose(
        [
            jiwer.ToLowerCase(),
            jiwer.RemovePunctuation(),
            jiwer.RemoveMultipleSpaces(),
            jiwer.Strip(),
        ]
    )
    return float(jiwer.wer(transform(ref), transform(hyp)))


def word_error_rate(reference: str, hypothesis: str, *, fair: bool = False) -> float | None:
    return _wer_with_transform(reference, hypothesis, fair)


def rouge_scores(reference: str, hypothesis: str) -> dict[str, float | None]:
    ref = (reference or "").strip()
    hyp = (hypothesis or "").strip()
    if not ref or not hyp:
        return {"rouge1": None, "rougeL": None}
    try:
        from rouge_score import rouge_scorer
    except ImportError as exc:
        raise ImportError("Install eval deps: pip install -r eval/requirements-eval.txt") from exc
    scorer = rouge_scorer.RougeScorer(["rouge1", "rougeL"], use_stemmer=True)
    scores = scorer.score(ref, hyp)
    return {
        "rouge1": float(scores["rouge1"].fmeasure),
        "rougeL": float(scores["rougeL"].fmeasure),
    }


def semantic_similarity(reference: str, hypothesis: str) -> float | None:
    """Cosine similarity of sentence embeddings (supplementary to ROUGE)."""
    global _semantic_model
    ref = (reference or "").strip()[:4000]
    hyp = (hypothesis or "").strip()[:4000]
    if not ref or not hyp:
        return None
    try:
        from sentence_transformers import SentenceTransformer, util

        if _semantic_model is None:
            _semantic_model = SentenceTransformer("all-MiniLM-L6-v2")
        e1 = _semantic_model.encode(ref, convert_to_tensor=True)
        e2 = _semantic_model.encode(hyp, convert_to_tensor=True)
        return float(util.cos_sim(e1, e2).item())
    except Exception:
        return None


def _significant_tokens(text: str) -> list[str]:
    tokens = re.findall(r"[a-z0-9]+", text.lower())
    return [t for t in tokens if len(t) > 4 and t not in STOPWORDS]


def structured_field_coverage(summary: str, structured_notes: dict[str, Any]) -> dict[str, float | None]:
    summary_l = (summary or "").lower()
    result: dict[str, float | None] = {}
    hits: list[float] = []
    for key in ("concern", "action_taken", "outcome"):
        tokens = _significant_tokens(str(structured_notes.get(key, "")))
        if not tokens:
            result[f"{key}_coverage"] = None
            continue
        matched = sum(1 for t in tokens if t in summary_l)
        score = matched / len(tokens)
        result[f"{key}_coverage"] = round(score, 4)
        hits.append(score)
    result["mean_coverage"] = round(sum(hits) / len(hits), 4) if hits else None
    return result


@dataclass
class SessionMetrics:
    session_id: str
    wer_assemblyai_raw: float | None
    wer_transcript_final: float | None
    wer_assemblyai_raw_fair: float | None
    wer_transcript_final_fair: float | None
    rouge1: float | None
    rougeL: float | None
    semantic_similarity: float | None
    rouge1_upper: float | None = None
    rougeL_upper: float | None = None
    semantic_similarity_upper: float | None = None
    concern_coverage: float | None = None
    action_taken_coverage: float | None = None
    outcome_coverage: float | None = None
    structured_mean_coverage: float | None = None

    def to_dict(self) -> dict[str, Any]:
        d = {
            "session_id": self.session_id,
            "wer_assemblyai_raw": self.wer_assemblyai_raw,
            "wer_assemblyai_raw_pct": _pct(self.wer_assemblyai_raw),
            "wer_transcript_final": self.wer_transcript_final,
            "wer_transcript_final_pct": _pct(self.wer_transcript_final),
            "wer_assemblyai_raw_fair": self.wer_assemblyai_raw_fair,
            "wer_assemblyai_raw_fair_pct": _pct(self.wer_assemblyai_raw_fair),
            "wer_transcript_final_fair": self.wer_transcript_final_fair,
            "wer_transcript_final_fair_pct": _pct(self.wer_transcript_final_fair),
            "rouge1": self.rouge1,
            "rouge1_pct": _pct(self.rouge1),
            "rougeL": self.rougeL,
            "rougeL_pct": _pct(self.rougeL),
            "semantic_similarity": self.semantic_similarity,
            "semantic_similarity_pct": _pct(self.semantic_similarity),
            "rouge1_upper": self.rouge1_upper,
            "rouge1_upper_pct": _pct(self.rouge1_upper),
            "rougeL_upper": self.rougeL_upper,
            "rougeL_upper_pct": _pct(self.rougeL_upper),
            "semantic_similarity_upper": self.semantic_similarity_upper,
            "semantic_similarity_upper_pct": _pct(self.semantic_similarity_upper),
            "concern_coverage": self.concern_coverage,
            "concern_coverage_pct": _pct(self.concern_coverage),
            "action_taken_coverage": self.action_taken_coverage,
            "action_taken_coverage_pct": _pct(self.action_taken_coverage),
            "outcome_coverage": self.outcome_coverage,
            "outcome_coverage_pct": _pct(self.outcome_coverage),
            "structured_mean_coverage": self.structured_mean_coverage,
            "structured_mean_coverage_pct": _pct(self.structured_mean_coverage),
        }
        return d


def _pct(value: float | None) -> float | None:
    if value is None:
        return None
    return round(value * 100, 2)


def compute_session_metrics(
    session_id: str,
    reference_transcript: str,
    assemblyai_raw: str,
    transcript_final: str,
    reference_summary: str,
    summary_raw: str,
    summary_upper_bound: str | None = None,
    structured_notes: dict[str, Any] | None = None,
) -> SessionMetrics:
    rouge = rouge_scores(reference_summary, summary_raw)
    rouge_upper = rouge_scores(reference_summary, summary_upper_bound or "")
    coverage = structured_field_coverage(summary_raw, structured_notes or {})

    return SessionMetrics(
        session_id=session_id,
        wer_assemblyai_raw=word_error_rate(reference_transcript, assemblyai_raw, fair=False),
        wer_transcript_final=word_error_rate(reference_transcript, transcript_final, fair=False),
        wer_assemblyai_raw_fair=word_error_rate(reference_transcript, assemblyai_raw, fair=True),
        wer_transcript_final_fair=word_error_rate(reference_transcript, transcript_final, fair=True),
        rouge1=rouge["rouge1"],
        rougeL=rouge["rougeL"],
        semantic_similarity=semantic_similarity(reference_summary, summary_raw),
        rouge1_upper=rouge_upper["rouge1"] if summary_upper_bound else None,
        rougeL_upper=rouge_upper["rougeL"] if summary_upper_bound else None,
        semantic_similarity_upper=semantic_similarity(reference_summary, summary_upper_bound or "")
        if summary_upper_bound
        else None,
        concern_coverage=coverage.get("concern_coverage"),
        action_taken_coverage=coverage.get("action_taken_coverage"),
        outcome_coverage=coverage.get("outcome_coverage"),
        structured_mean_coverage=coverage.get("mean_coverage"),
    )


def _stat_block(values: list[float]) -> dict[str, float | int | None]:
    import statistics

    if not values:
        return {"n": 0, "mean": None, "stdev": None, "min": None, "max": None}
    return {
        "n": len(values),
        "mean": round(statistics.mean(values) * 100, 2),
        "stdev": round(statistics.stdev(values) * 100, 2) if len(values) > 1 else 0.0,
        "min": round(min(values) * 100, 2),
        "max": round(max(values) * 100, 2),
    }


def aggregate_metrics(rows: list[SessionMetrics]) -> dict[str, Any]:
    def collect(attr: str) -> list[float]:
        return [getattr(r, attr) for r in rows if getattr(r, attr) is not None]

    return {
        "session_count": len(rows),
        "wer_assemblyai_raw": _stat_block(collect("wer_assemblyai_raw")),
        "wer_transcript_final": _stat_block(collect("wer_transcript_final")),
        "wer_assemblyai_raw_fair": _stat_block(collect("wer_assemblyai_raw_fair")),
        "wer_transcript_final_fair": _stat_block(collect("wer_transcript_final_fair")),
        "rouge1": _stat_block(collect("rouge1")),
        "rougeL": _stat_block(collect("rougeL")),
        "semantic_similarity": _stat_block(collect("semantic_similarity")),
        "rouge1_upper": _stat_block(collect("rouge1_upper")),
        "rougeL_upper": _stat_block(collect("rougeL_upper")),
        "semantic_similarity_upper": _stat_block(collect("semantic_similarity_upper")),
        "structured_mean_coverage": _stat_block(collect("structured_mean_coverage")),
    }
