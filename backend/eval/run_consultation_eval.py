"""
Run full consultation pipeline evaluation and export adviser-ready deliverables.

Usage (from backend/):
  python -m eval.run_consultation_eval
  python -m eval.run_consultation_eval --sessions 001,002
  python -m eval.run_consultation_eval --export-only   # re-build xlsx/docx/zip from existing artifacts
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

# Ensure backend/ is on path when invoked as script
_BACKEND = Path(__file__).resolve().parents[1]
if str(_BACKEND) not in sys.path:
    sys.path.insert(0, str(_BACKEND))

from dotenv import load_dotenv

load_dotenv(_BACKEND / ".env")

from eval.consultation_pipeline import (
    PipelineResult,
    generate_upper_bound_summary,
    process_session,
    write_session_artifacts,
)
from eval.dataset import audio_path, iter_sessions, load_reference, resolve_data_dir
from eval.export import SessionEvalRecord, export_all
from eval.metrics import compute_session_metrics


REPO_ROOT = _BACKEND.parent
DEFAULT_OUT = REPO_ROOT / "eval" / "results"


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="POLYCON consultation pipeline evaluation")
    p.add_argument("--data-dir", default=None, help="Gold dataset root (default: eval/data)")
    p.add_argument("--out-dir", default=str(DEFAULT_OUT), help="Output directory (default: eval/results)")
    p.add_argument("--sessions", default="", help="Comma-separated session ids, e.g. 001,003 (default: all)")
    p.add_argument("--export-only", action="store_true", help="Skip API pipeline; load existing session artifacts")
    p.add_argument(
        "--mock",
        action="store_true",
        help="Skip APIs; use gold references as pipeline output (for testing export layout only)",
    )
    p.add_argument("--run-label", default="production-like", help="Label shown in exports")
    p.add_argument(
        "--llm-provider",
        choices=["gemini", "minimax", "auto"],
        default="auto",
        help="LLM for role labels + summary (auto: Gemini, fallback to MiniMax on rate limit)",
    )
    p.add_argument(
        "--reuse-transcripts",
        action="store_true",
        help="Keep existing AssemblyAI artifacts; re-run LLM summary/upper-bound and recompute metrics",
    )
    return p.parse_args()


def _session_filter(session_id: str, allowed: set[str] | None) -> bool:
    if not allowed:
        return True
    sid = f"{int(session_id):03d}" if session_id.isdigit() else session_id
    return sid in allowed


def _load_artifact_text(artifact_dir: Path, name: str) -> str:
    path = artifact_dir / name
    return path.read_text(encoding="utf-8") if path.is_file() else ""


def _load_artifact_meta(artifact_dir: Path) -> dict:
    path = artifact_dir / "pipeline_meta.json"
    if not path.is_file():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def _configure_llm_provider(name: str) -> None:
    from eval.llm_provider import set_provider_name

    if name == "auto":
        set_provider_name("gemini")
    else:
        set_provider_name(name)


def _minimax_key_available() -> bool:
    return bool(os.getenv("MINIMAX_API_KEY") or os.getenv("EVAL_MINIMAX_API_KEY"))


def _switch_to_minimax_if_needed(exc: Exception) -> bool:
    msg = str(exc).lower()
    if not any(t in msg for t in ("rate", "quota", "429", "resource exhausted", "limit", "too many")):
        return False
    if not _minimax_key_available():
        return False
    from eval.llm_provider import set_provider_name

    print("Gemini rate limit hit — switching to MiniMax for remaining LLM calls.")
    set_provider_name("minimax")
    return True


def run_eval(args: argparse.Namespace) -> list[SessionEvalRecord]:
    data_dir = resolve_data_dir(args.data_dir)
    out_dir = Path(args.out_dir).resolve()
    allowed = None
    if args.sessions.strip():
        allowed = {f"{int(s.strip()):03d}" for s in args.sessions.split(",") if s.strip()}

    if not args.export_only and not args.mock:
        if not os.getenv("ASSEMBLYAI_API_KEY"):
            raise SystemExit("ASSEMBLYAI_API_KEY not set in backend/.env")
        if args.llm_provider in ("gemini", "auto") and not os.getenv("GEMINI_API_KEY"):
            raise SystemExit("GEMINI_API_KEY not set in backend/.env")
        if args.llm_provider == "minimax" and not _minimax_key_available():
            raise SystemExit("MINIMAX_API_KEY not set in backend/.env (required for --llm-provider minimax)")

    from eval.llm_provider import reset_fallback_state

    reset_fallback_state()
    _configure_llm_provider(args.llm_provider)

    records: list[SessionEvalRecord] = []

    for ref in iter_sessions(data_dir):
        if not _session_filter(ref["session_id"], allowed):
            continue

        sid = ref["session_id"]
        artifact_dir = out_dir / f"session_{sid}"

        if args.mock:
            from eval.dataset import format_notes

            print(f"Mock session {sid}: {ref.get('title', '')}...")
            assemblyai_raw = ref["reference_transcript"]
            transcript_final = ref["reference_transcript"]
            notes_block = format_notes(ref["structured_notes"])
            summary_raw = ref["reference_summary"]
            summary_sanitized = summary_raw
            meta = {"gemini_model": "mock", "run_mode": "mock"}

            mock_result = PipelineResult(
                session_id=sid,
                speaker_count=ref["speaker_count"],
                transcription_enabled=True,
                assemblyai_raw=assemblyai_raw,
                transcript_final=transcript_final,
                notes_block=notes_block,
                summary_raw=summary_raw,
                summary_sanitized=summary_sanitized,
                meta=meta,
            )
            write_session_artifacts(mock_result, artifact_dir)
        elif args.export_only or args.reuse_transcripts:
            if not artifact_dir.is_dir():
                if args.export_only:
                    print(f"Skip {sid}: no artifacts at {artifact_dir}")
                    continue
                print(f"Processing session {sid}: {ref.get('title', '')}...")
                result = process_session(
                    audio_path=audio_path(ref, data_dir),
                    speaker_count=ref["speaker_count"],
                    transcription_enabled=ref.get("transcription_enabled", True),
                    structured_notes=ref["structured_notes"],
                    session_id=sid,
                )
                write_session_artifacts(result, artifact_dir)
                assemblyai_raw = result.assemblyai_raw
                transcript_final = result.transcript_final
                notes_block = result.notes_block
                summary_raw = result.summary_raw
                summary_sanitized = result.summary_sanitized or ""
                meta = result.meta
            else:
                assemblyai_raw = _load_artifact_text(artifact_dir, "02_assemblyai_raw.txt")
                transcript_final = _load_artifact_text(artifact_dir, "03_transcript_final.txt")
                notes_block = _load_artifact_text(artifact_dir, "04_notes_block.txt")
                summary_raw = _load_artifact_text(artifact_dir, "05_summary_raw.txt")
                summary_sanitized = _load_artifact_text(artifact_dir, "06_summary_sanitized.txt")
                meta = _load_artifact_meta(artifact_dir)
                if args.reuse_transcripts and not args.export_only:
                    print(f"Reusing transcription for {sid}; refreshing summaries...")
        else:
            print(f"Processing session {sid}: {ref.get('title', '')}...")
            try:
                result = process_session(
                    audio_path=audio_path(ref, data_dir),
                    speaker_count=ref["speaker_count"],
                    transcription_enabled=ref.get("transcription_enabled", True),
                    structured_notes=ref["structured_notes"],
                    session_id=sid,
                )
            except Exception as exc:
                if args.llm_provider == "auto" and _switch_to_minimax_if_needed(exc):
                    result = process_session(
                        audio_path=audio_path(ref, data_dir),
                        speaker_count=ref["speaker_count"],
                        transcription_enabled=ref.get("transcription_enabled", True),
                        structured_notes=ref["structured_notes"],
                        session_id=sid,
                    )
                else:
                    raise
            write_session_artifacts(result, artifact_dir)
            assemblyai_raw = result.assemblyai_raw
            transcript_final = result.transcript_final
            notes_block = result.notes_block
            summary_raw = result.summary_raw
            summary_sanitized = result.summary_sanitized or ""
            meta = result.meta

        if not args.export_only:
            print(f"  Upper-bound summary for {sid}...")
            summary_upper = generate_upper_bound_summary(
                ref["reference_transcript"], ref["structured_notes"]
            )
            (artifact_dir / "07_summary_upper_bound.txt").write_text(
                summary_upper or "", encoding="utf-8"
            )
        else:
            summary_upper = _load_artifact_text(artifact_dir, "07_summary_upper_bound.txt") or None

        metrics = compute_session_metrics(
            sid,
            ref["reference_transcript"],
            assemblyai_raw,
            transcript_final,
            ref["reference_summary"],
            summary_raw,
            summary_upper_bound=summary_upper or None,
            structured_notes=ref["structured_notes"],
        )
        (artifact_dir / "metrics.json").write_text(
            json.dumps(metrics.to_dict(), indent=2) + "\n",
            encoding="utf-8",
        )

        records.append(
            SessionEvalRecord(
                session_id=sid,
                title=ref.get("title", ""),
                speaker_count=ref["speaker_count"],
                transcription_enabled=ref.get("transcription_enabled", True),
                reference_transcript=ref["reference_transcript"],
                reference_summary=ref["reference_summary"],
                assemblyai_raw=assemblyai_raw,
                transcript_final=transcript_final,
                notes_block=notes_block,
                summary_raw=summary_raw,
                summary_sanitized=summary_sanitized,
                summary_upper_bound=summary_upper or "",
                metrics=metrics,
                artifact_dir=artifact_dir,
                pipeline_meta=meta,
            )
        )

    return records


def main() -> int:
    args = parse_args()
    records = run_eval(args)
    if not records:
        print("No sessions processed.")
        return 1

    paths = export_all(records, Path(args.out_dir), run_label=args.run_label)
    print(f"\nDone - {len(records)} session(s)", flush=True)
    for label, p in paths.items():
        line = f"  {label}: {p.resolve()}"
        print(line.encode("ascii", errors="backslashreplace").decode("ascii"), flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
