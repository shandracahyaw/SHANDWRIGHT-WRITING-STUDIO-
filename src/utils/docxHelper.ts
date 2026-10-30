import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from 'docx';
import mammoth from 'mammoth';
import { Chapter, VolumeArc } from '../types/novel';

export async function exportNovelToDocx(
  bookTitle: string,
  bookSubtitle: string | undefined,
  authorName: string,
  chapters: Chapter[],
  arcs: VolumeArc[]
): Promise<Blob> {
  const sectionsChildren: Paragraph[] = [];

  // Title Page
  sectionsChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 2400, after: 400 },
      children: [
        new TextRun({
          text: bookTitle.toUpperCase(),
          bold: true,
          size: 44, // 22pt
          font: 'EB Garamond',
          color: '1A1A1A',
        }),
      ],
    })
  );

  if (bookSubtitle) {
    sectionsChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 1200 },
        children: [
          new TextRun({
            text: bookSubtitle,
            italics: true,
            size: 28,
            font: 'EB Garamond',
            color: '4A4A4A',
          }),
        ],
      })
    );
  }

  sectionsChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1200, after: 2400 },
      children: [
        new TextRun({
          text: `Ditulis oleh: ${authorName || 'Penulis Shandwright'}`,
          size: 24,
          font: 'EB Garamond',
          color: '555555',
        }),
      ],
      pageBreakBefore: false,
    })
  );

  // Group chapters by Arc
  const sortedArcs = [...arcs].sort((a, b) => a.order - b.order);

  for (const arc of sortedArcs) {
    const arcChapters = chapters.filter((c) => c.arcId === arc.id);
    if (arcChapters.length === 0) continue;

    // Arc Header Page Break
    sectionsChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 2800, after: 800 },
        pageBreakBefore: true,
        children: [
          new TextRun({
            text: arc.title.toUpperCase(),
            bold: true,
            size: 32,
            font: 'EB Garamond',
            color: '222222',
          }),
        ],
      })
    );

    if (arc.description) {
      sectionsChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 1600 },
          children: [
            new TextRun({
              text: arc.description,
              italics: true,
              size: 22,
              font: 'EB Garamond',
              color: '666666',
            }),
          ],
        })
      );
    }

    // Chapters inside Arc
    for (const chap of arcChapters) {
      sectionsChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { before: 2000, after: 800 },
          pageBreakBefore: true,
          children: [
            new TextRun({
              text: `Bab ${chap.chapterNumber}: ${chap.title}`,
              bold: true,
              size: 28,
              font: 'EB Garamond',
              color: '111111',
            }),
          ],
        })
      );

      // Paragraphs
      const paragraphs = chap.content.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
      for (const pText of paragraphs) {
        sectionsChildren.push(
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 720 }, // 0.5 inch first line indent
            spacing: { line: 360, after: 120 }, // 1.5 line spacing
            children: [
              new TextRun({
                text: pText.trim(),
                size: 24, // 12pt
                font: 'EB Garamond',
                color: '222222',
              }),
            ],
          })
        );
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: sectionsChildren,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

export interface ParsedChapter {
  title: string;
  content: string;
}

export async function parseDocxFile(file: File): Promise<ParsedChapter[]> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const rawText = result.value;

  if (!rawText || rawText.trim().length === 0) {
    throw new Error('Dokumen Word kosong atau tidak dapat diekstrak.');
  }

  // Detect chapter markers like "Bab 1", "Chapter 1", "BAB I", "CHAPTER ONE", etc.
  const lines = rawText.split(/\r?\n/);
  const chapters: ParsedChapter[] = [];

  let currentTitle = 'Bab 1: Draf Impor';
  let currentParagraphs: string[] = [];

  const chapterPattern = /^(bab\s+\d+|chapter\s+\d+|arc\s+\d+|bagian\s+\d+|prolog|epilog)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (currentParagraphs.length > 0 && currentParagraphs[currentParagraphs.length - 1] !== '') {
        currentParagraphs.push('');
      }
      continue;
    }

    if (chapterPattern.test(line) && line.length < 100) {
      // If we already have content, save existing chapter
      if (currentParagraphs.length > 0) {
        chapters.push({
          title: currentTitle,
          content: currentParagraphs.join('\n').trim(),
        });
        currentParagraphs = [];
      }
      currentTitle = line;
    } else {
      currentParagraphs.push(line);
    }
  }

  // Push final chapter
  if (currentParagraphs.length > 0) {
    chapters.push({
      title: currentTitle,
      content: currentParagraphs.join('\n').trim(),
    });
  }

  // If no chapter markers were found, treat whole text as 1 chapter
  if (chapters.length === 0 && rawText.trim().length > 0) {
    chapters.push({
      title: file.name.replace(/\.[^/.]+$/, ''),
      content: rawText.trim(),
    });
  }

  return chapters;
}
