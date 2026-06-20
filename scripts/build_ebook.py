from __future__ import annotations

import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Image, PageBreak, Paragraph, SimpleDocTemplate, Spacer

ROOT = Path(__file__).resolve().parents[1]
EBOOK_DIR = ROOT / "ebook"
SOURCE = EBOOK_DIR / "LeashingAI-ebook.md"
OUTPUT = EBOOK_DIR / "LeashingAI-ebook.pdf"
COVER = ROOT / "public" / "assets" / "cover-main.png"


def build_styles():
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="BookTitle",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=28,
            leading=32,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#08111c"),
            spaceAfter=18,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BookSubTitle",
            parent=styles["Heading2"],
            fontName="Helvetica",
            fontSize=14,
            leading=18,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#30455f"),
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BookH1",
            parent=styles["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=28,
            leading=36,
            textColor=colors.HexColor("#10243d"),
            spaceBefore=20,
            spaceAfter=14,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BookH2",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=24,
            leading=33,
            textColor=colors.HexColor("#163759"),
            spaceBefore=16,
            spaceAfter=12,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BookBody",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=19.5,
            leading=31,
            alignment=TA_LEFT,
            textColor=colors.HexColor("#1a2635"),
            spaceAfter=11,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BookBullet",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=19.5,
            leading=31,
            leftIndent=22,
            firstLineIndent=-10,
            bulletIndent=4,
            textColor=colors.HexColor("#1a2635"),
            spaceAfter=7,
        )
    )
    return styles


def sanitize(text: str) -> str:
    text = text.replace("&", "&amp;")
    text = text.replace("<", "&lt;")
    text = text.replace(">", "&gt;")
    text = text.replace("\u2014", "—")
    return text


def chapter_key(line: str) -> tuple[int, int]:
    nums = re.findall(r"\d+", line)
    if nums:
        return (0, int(nums[0]))
    return (1, 0)


def add_page_number(canvas, doc):
    page_num = canvas.getPageNumber()
    canvas.setFont("Helvetica", 9)
    canvas.setFillColor(colors.HexColor("#4a5d75"))
    canvas.drawRightString(7.75 * inch, 0.55 * inch, str(page_num))


def build_pdf():
    if not SOURCE.exists():
        raise SystemExit(f"Missing source markdown: {SOURCE}")

    styles = build_styles()
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=letter,
        rightMargin=1.28 * inch,
        leftMargin=1.28 * inch,
        topMargin=1.28 * inch,
        bottomMargin=1.28 * inch,
        title="Leashing AI",
        author="OpenClaw / Poly Mintman",
    )

    lines = SOURCE.read_text(encoding="utf-8").splitlines()
    story = []

    if COVER.exists():
        story.append(Spacer(1, 0.35 * inch))
        story.append(Image(str(COVER), width=6.3 * inch, height=3.95 * inch))
        story.append(Spacer(1, 0.35 * inch))
    story.append(Paragraph("Leashing AI", styles["BookTitle"]))
    story.append(
        Paragraph(
            "How to Control, Contain, and Profit from Artificial Intelligence Before It Controls Your Business",
            styles["BookSubTitle"],
        )
    )
    story.append(Paragraph("A practical field guide for founders, operators, consultants, and teams.", styles["BookSubTitle"]))
    story.append(PageBreak())

    pending_buffer: list[str] = []

    def flush_paragraph():
        nonlocal pending_buffer
        if pending_buffer:
            text = sanitize(" ".join(x.strip() for x in pending_buffer if x.strip()))
            if text:
                story.append(Paragraph(text, styles["BookBody"]))
            pending_buffer = []

    for raw in lines:
        line = raw.rstrip()
        stripped = line.strip()

        if not stripped:
            flush_paragraph()
            continue

        if stripped == "---":
            flush_paragraph()
            story.append(Spacer(1, 0.15 * inch))
            continue

        if stripped.startswith("# "):
            flush_paragraph()
            title = sanitize(stripped[2:])
            if story:
                story.append(PageBreak())
            story.append(Paragraph(title, styles["BookH1"]))
            continue

        if stripped.startswith("## "):
            flush_paragraph()
            heading = sanitize(stripped[3:])
            if heading.lower().startswith("chapter ") or heading.lower().startswith("appendix "):
                story.append(PageBreak())
            story.append(Paragraph(heading, styles["BookH2"]))
            continue

        if stripped.startswith(("- ", "* ")):
            flush_paragraph()
            bullet = sanitize(stripped[2:])
            story.append(Paragraph(bullet, styles["BookBullet"], bulletText="•"))
            continue

        pending_buffer.append(stripped)

    flush_paragraph()
    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    build_pdf()
