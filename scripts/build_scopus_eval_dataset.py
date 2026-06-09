"""
Build eval/data/ from Scopus consultation zip contents.

Reads SCOPUS DATA.pdf + Set_*.m4a, writes:
  eval/data/audio/session_NNN.m4a
  eval/data/references/session_NNN.ref.json
  eval/data/manifest.json

Re-run after updating source files under eval/_scopus_source/.
"""

from __future__ import annotations

import json
import re
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = REPO_ROOT / "eval" / "_scopus_source" / "Scopus Data"
DATA_DIR = REPO_ROOT / "eval" / "data"
AUDIO_DIR = DATA_DIR / "audio"
REFS_DIR = DATA_DIR / "references"

SET_HEADER = re.compile(r"^Set\s+(\d+):\s*(.+)$", re.MULTILINE)
PAGE_MARKER = re.compile(r"^--\s+\d+\s+of\s+\d+\s+--\s*$", re.MULTILINE)
SUMMARY_FIELD = re.compile(
    r"●\s*(CONCERN|ACTION TAKEN|OUTCOME|REMARKS|OVERALL SUMMARY):\s*(.+?)(?=\n●\s*(?:CONCERN|ACTION TAKEN|OUTCOME|REMARKS|OVERALL SUMMARY):|\Z)",
    re.DOTALL | re.IGNORECASE,
)

FIELD_MAP = {
    "CONCERN": "concern",
    "ACTION TAKEN": "action_taken",
    "OUTCOME": "outcome",
    "REMARKS": "remarks",
    "OVERALL SUMMARY": "overall_summary",
}


def extract_pdf_text(pdf_path: Path) -> str:
    try:
        from pypdf import PdfReader
    except ImportError:
        from PyPDF2 import PdfReader  # type: ignore

    reader = PdfReader(str(pdf_path))
    parts: list[str] = []
    for page in reader.pages:
        text = page.extract_text() or ""
        parts.append(text)
    return "\n".join(parts)


def normalize_whitespace(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def normalize_pdf_extract(text: str) -> str:
    """Fix pypdf line breaks and double spaces while keeping section headers."""
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Join hard-wrapped lines (single word per line) into flowing text
    text = re.sub(r"(?<=[a-zA-Z0-9,;])\n(?=[a-z])", " ", text)
    text = re.sub(r"(?<=[a-z])\n(?=[a-z])", " ", text)
    text = re.sub(r" {2,}", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def collapse_inline(text: str) -> str:
    return " ".join(text.split())


def parse_script_block(block: str) -> str:
    """Turn Teacher:/Student: segments into reference_transcript."""
    block = re.sub(r"Participants:\s*Teacher\s*&\s*Student\s*", "", block, flags=re.I)
    block = re.sub(r"^Consultation\s+Script\s*", "", block, flags=re.I)
    segment_re = re.compile(
        r"(Teacher|Student):\s*(.*?)(?=(?:Teacher|Student):|Consultation\s+Summary|\Z)",
        re.DOTALL | re.IGNORECASE,
    )
    lines: list[str] = []
    for match in segment_re.finditer(block):
        role = match.group(1).capitalize()
        if role.lower() == "teacher":
            role = "Teacher"
        else:
            role = "Student"
        content = collapse_inline(match.group(2))
        if content:
            lines.append(f"{role}: {content}")
    return "\n".join(lines)


def parse_summary_block(block: str) -> dict[str, str]:
    block = re.sub(r"^Consultation\s+Summary\s*", "", block, flags=re.I)
    block = block.replace("●", "\n●")
    fields: dict[str, str] = {}
    for match in SUMMARY_FIELD.finditer(block):
        label = match.group(1).upper()
        value = collapse_inline(match.group(2))
        key = FIELD_MAP.get(label)
        if key:
            fields[key] = value
    return fields


def split_set_sections(text: str) -> list[tuple[int, str, str]]:
    """Return [(set_num, title, body), ...] from full PDF text."""
    text = normalize_pdf_extract(PAGE_MARKER.sub("", text))
    # Drop cover title before first Set
    first = SET_HEADER.search(text)
    if not first:
        raise ValueError("No 'Set N:' headers found in PDF text")
    text = text[first.start() :]

    matches = list(SET_HEADER.finditer(text))
    sections: list[tuple[int, str, str]] = []
    for i, m in enumerate(matches):
        set_num = int(m.group(1))
        title = m.group(2).strip()
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        sections.append((set_num, title, text[start:end].strip()))
    return sections


def parse_set_body(set_num: int, title: str, body: str) -> dict:
    body = normalize_pdf_extract(body)
    title = collapse_inline(title)
    parts = re.split(r"Consultation\s+Summary", body, maxsplit=1, flags=re.IGNORECASE)
    if len(parts) != 2:
        raise ValueError(f"Set {set_num}: could not split script and summary")

    script_raw, summary_raw = parts
    reference_transcript = parse_script_block(script_raw)
    if not reference_transcript:
        raise ValueError(f"Set {set_num}: empty reference_transcript")

    summary_fields = parse_summary_block(summary_raw)
    required = {"concern", "action_taken", "outcome", "remarks", "overall_summary"}
    missing = required - set(summary_fields)
    if missing:
        raise ValueError(f"Set {set_num}: missing summary fields: {sorted(missing)}")

    session_id = f"{set_num:03d}"
    return {
        "session_id": session_id,
        "source_set": set_num,
        "title": title,
        "speaker_count": 2,
        "transcription_enabled": True,
        "participants": ["Teacher", "Student"],
        "audio_file": f"audio/session_{session_id}.m4a",
        "structured_notes": {
            "concern": summary_fields["concern"],
            "action_taken": summary_fields["action_taken"],
            "outcome": summary_fields["outcome"],
            "remarks": summary_fields["remarks"],
        },
        "reference_transcript": reference_transcript,
        "reference_summary": summary_fields["overall_summary"],
        "metadata": {
            "source": "Scopus Data-20260609T070025Z-3-001",
            "dataset": "academic_consultation_scripts",
            "dialogue_turns": reference_transcript.count("\n") + 1,
        },
    }


def copy_audio(source_dir: Path, session_id: str, set_num: int) -> Path:
    src = source_dir / f"Set_{set_num}.m4a"
    if not src.is_file():
        raise FileNotFoundError(f"Missing audio: {src}")
    dest = AUDIO_DIR / f"session_{session_id}.m4a"
    shutil.copy2(src, dest)
    return dest


def build_dataset(source_dir: Path) -> dict:
    pdf_path = source_dir / "SCOPUS DATA.pdf"
    if not pdf_path.is_file():
        raise FileNotFoundError(f"Missing PDF: {pdf_path}")

    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    REFS_DIR.mkdir(parents=True, exist_ok=True)

    text = extract_pdf_text(pdf_path)
    sections = split_set_sections(text)

    sessions: list[dict] = []
    for set_num, title, body in sections:
        ref = parse_set_body(set_num, title, body)
        copy_audio(source_dir, ref["session_id"], set_num)
        ref_path = REFS_DIR / f"session_{ref['session_id']}.ref.json"
        with ref_path.open("w", encoding="utf-8") as f:
            json.dump(ref, f, indent=2, ensure_ascii=False)
            f.write("\n")
        sessions.append(
            {
                "session_id": ref["session_id"],
                "source_set": set_num,
                "title": title,
                "audio": ref["audio_file"],
                "reference": f"references/session_{ref['session_id']}.ref.json",
                "speaker_count": ref["speaker_count"],
                "dialogue_turns": ref["metadata"]["dialogue_turns"],
            }
        )

    manifest = {
        "version": "1.0",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_archive": "Scopus Data-20260609T070025Z-3-001.zip",
        "source_pdf": "SCOPUS DATA.pdf",
        "session_count": len(sessions),
        "audio_format": "m4a",
        "sessions": sessions,
    }
    manifest_path = DATA_DIR / "manifest.json"
    with manifest_path.open("w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
        f.write("\n")

    return manifest


def main() -> int:
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_SOURCE
    if not source.is_dir():
        print(f"Source directory not found: {source}", file=sys.stderr)
        return 1
    manifest = build_dataset(source)
    print(f"Built {manifest['session_count']} sessions under eval/data")
    for s in manifest["sessions"]:
        print(f"  {s['session_id']}: {s['title']}", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
