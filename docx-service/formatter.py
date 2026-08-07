import io
import logging
from collections import Counter

from docx import Document
from docx.shared import Pt, RGBColor
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

logger = logging.getLogger(__name__)

KNOWN_HEADERS = {"experience", "education", "skills", "summary", "certifications"}

# Signals required to classify a paragraph as a section header candidate
_MAX_HEADER_LEN = 40


def _run_is_bold(run):
    if run.bold is not None:
        return run.bold
    # Check paragraph-level bold via style
    style = run.style
    while style:
        if style.font.bold is not None:
            return style.font.bold
        style = style.base_style
    return False


def _run_font_size(run):
    """Return font size in half-points (as Pt object) or None."""
    if run.font.size:
        return run.font.size
    style = run.style
    while style:
        if style.font.size:
            return style.font.size
        style = style.base_style
    return None


def _para_is_bold(para):
    runs = [r for r in para.runs if r.text.strip()]
    if not runs:
        return False
    return all(_run_is_bold(r) for r in runs)


def _para_font_size(para):
    """Return the most common font size among runs, or None."""
    sizes = [_run_font_size(r) for r in para.runs if r.text.strip() and _run_font_size(r)]
    if not sizes:
        return None
    return Counter(sizes).most_common(1)[0][0]


def _para_font_name(para):
    for run in para.runs:
        if run.text.strip() and run.font.name:
            return run.font.name
    style = para.style
    while style:
        if style.font.name:
            return style.font.name
        style = style.base_style
    return None


def _para_color(para):
    for run in para.runs:
        if run.text.strip() and run.font.color and run.font.color.type is not None:
            try:
                return run.font.color.rgb
            except Exception:
                pass
    return None


def _para_all_caps(para):
    for run in para.runs:
        if run.text.strip():
            if run.font.all_caps:
                return True
    return para.text == para.text.upper() and para.text.strip().isalpha()


def _is_header_candidate(para, body_size):
    text = para.text.strip()
    if not text or len(text) > _MAX_HEADER_LEN:
        return False

    signals = 0
    if _para_is_bold(para):
        signals += 1
    if text.upper() == text and text.replace(" ", "").isalpha():
        signals += 1  # all-caps alphabetic
    size = _para_font_size(para)
    if size and body_size and size > body_size * 1.1:
        signals += 1

    return signals >= 1 and (
        _para_is_bold(para)
        or (text.upper() == text and text.replace(" ", "").isalpha())
    )


def _style_key(font_name, font_size, bold):
    return (font_name, font_size, bold)


def detect_header_style(doc, body_font_name, body_font_size, filename="<unknown>"):
    """
    Returns a dict with keys: font_name, font_size, bold, color, all_caps.
    Falls back to plain 12pt bold body font if no confident pattern found.
    """
    candidates = []
    for para in doc.paragraphs:
        if _is_header_candidate(para, body_font_size):
            text_lower = para.text.strip().lower()
            # Prefer known section header words
            if any(h in text_lower for h in KNOWN_HEADERS):
                candidates.insert(0, para)
            else:
                candidates.append(para)

    if not candidates:
        logger.warning("Header fallback used for '%s': no header candidates found.", filename)
        print(f"[docx-service] Header fallback used for '{filename}': no header candidates found.")
        return {
            "font_name": body_font_name or "Calibri",
            "font_size": Pt(12),
            "bold": True,
            "color": None,
            "all_caps": False,
        }

    # Tally styles among candidates to find dominant pattern
    style_counts = Counter()
    style_map = {}
    for para in candidates:
        fn = _para_font_name(para) or body_font_name or "Calibri"
        fs = _para_font_size(para) or Pt(12)
        bold = _para_is_bold(para)
        key = _style_key(fn, fs, bold)
        style_counts[key] += 1
        if key not in style_map:
            style_map[key] = {
                "font_name": fn,
                "font_size": fs,
                "bold": bold,
                "color": _para_color(para),
                "all_caps": _para_all_caps(para),
            }

    dominant_key = style_counts.most_common(1)[0][0]
    return style_map[dominant_key]


def detect_body_style(doc, filename="<unknown>"):
    """
    Returns (font_name, font_size) of the dominant non-header body text.
    Falls back to Calibri 12pt if inconclusive.
    """
    tally = Counter()
    first_font = None

    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            continue
        fn = _para_font_name(para)
        fs = _para_font_size(para)
        if fn and fs:
            if first_font is None:
                first_font = fn
            tally[(fn, fs)] += 1

    if not tally:
        logger.warning("Body fallback used for '%s': no body paragraphs found.", filename)
        print(f"[docx-service] Body fallback used for '{filename}': no body paragraphs found.")
        return first_font or "Calibri", Pt(12)

    (dominant_fn, dominant_fs), _ = tally.most_common(1)[0]
    return dominant_fn, dominant_fs


def _apply_run_style(run, font_name, font_size, bold, color, all_caps):
    run.font.name = font_name
    run.font.size = font_size
    run.font.bold = bold
    if color:
        run.font.color.rgb = color
    if all_caps:
        run.font.all_caps = True


def insert_core_competencies(docx_bytes, bullet_lines, filename="<unknown>"):
    """
    Inserts a CORE COMPETENCIES section at the end of the document.

    Args:
        docx_bytes: bytes of the original .docx file
        bullet_lines: list of plain-text bullet strings (without leading "• ")
        filename: used only for fallback logging

    Returns:
        bytes of the modified .docx
    """
    doc = Document(io.BytesIO(docx_bytes))

    body_font_name, body_font_size = detect_body_style(doc, filename)
    header_style = detect_header_style(doc, body_font_name, body_font_size, filename)

    # Append header paragraph
    header_para = doc.add_paragraph()
    header_run = header_para.add_run("CORE COMPETENCIES")
    _apply_run_style(
        header_run,
        header_style["font_name"],
        header_style["font_size"],
        header_style["bold"],
        header_style["color"],
        header_style["all_caps"],
    )

    # Append one paragraph per bullet
    for line in bullet_lines:
        line = line.strip()
        if not line:
            continue
        bullet_para = doc.add_paragraph()
        bullet_run = bullet_para.add_run(f"\u2022 {line}")
        _apply_run_style(
            bullet_run,
            body_font_name,
            body_font_size,
            False,
            None,
            False,
        )

    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)
    return buf.read()
