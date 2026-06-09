"""
Load gold evaluation sessions from eval/data/.

Used by run_consultation_eval.py and related scripts.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Iterator

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DATA_DIR = REPO_ROOT / "eval" / "data"

REQUIRED_REF_KEYS = {
    "session_id",
    "speaker_count",
    "transcription_enabled",
    "structured_notes",
    "reference_transcript",
    "reference_summary",
    "audio_file",
}


def resolve_data_dir(data_dir: str | Path | None = None) -> Path:
    if data_dir is None:
        return DEFAULT_DATA_DIR
    return Path(data_dir).resolve()


def load_manifest(data_dir: str | Path | None = None) -> dict[str, Any]:
    root = resolve_data_dir(data_dir)
    path = root / "manifest.json"
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def load_reference(session_id: str, data_dir: str | Path | None = None) -> dict[str, Any]:
    root = resolve_data_dir(data_dir)
    sid = session_id if session_id.isdigit() else session_id
    if sid.isdigit():
        sid = f"{int(sid):03d}"
    path = root / "references" / f"session_{sid}.ref.json"
    with path.open(encoding="utf-8") as f:
        ref = json.load(f)
    validate_reference(ref, root)
    return ref


def audio_path(ref: dict[str, Any], data_dir: str | Path | None = None) -> Path:
    root = resolve_data_dir(data_dir)
    rel = ref.get("audio_file", "")
    path = root / rel
    if not path.is_file():
        raise FileNotFoundError(f"Audio not found for session {ref.get('session_id')}: {path}")
    return path


def format_notes(structured_notes: dict[str, Any]) -> str:
    """Match Session.js generateSummary notes block (consultation_routes summarize input)."""
    concern = structured_notes.get("concern", "")
    action_taken = structured_notes.get("action_taken") or structured_notes.get("actionTaken", "")
    outcome = structured_notes.get("outcome", "")
    remarks = structured_notes.get("remarks") or "No remarks"
    return (
        f"Concern: {concern}\n"
        f"Action Taken: {action_taken}\n"
        f"Outcome: {outcome}\n"
        f"Remarks: {remarks}"
    )


def validate_reference(ref: dict[str, Any], data_dir: Path) -> None:
    missing = REQUIRED_REF_KEYS - set(ref)
    if missing:
        raise ValueError(f"session {ref.get('session_id')}: missing keys {sorted(missing)}")
    notes = ref["structured_notes"]
    for field in ("concern", "action_taken", "outcome"):
        if not str(notes.get(field, "")).strip():
            raise ValueError(f"session {ref['session_id']}: structured_notes.{field} is empty")
    audio_path(ref, data_dir)


def iter_sessions(data_dir: str | Path | None = None) -> Iterator[dict[str, Any]]:
    manifest = load_manifest(data_dir)
    for entry in manifest["sessions"]:
        yield load_reference(entry["session_id"], data_dir)
