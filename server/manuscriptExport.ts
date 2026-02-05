import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from "docx";
import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getManuscriptById } from "./db";

export const manuscriptExportRouter = router({
  // Export as Word document (.docx)
  exportWord: protectedProcedure
    .input(z.object({ manuscriptId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const manuscript = await getManuscriptById(input.manuscriptId, ctx.user.id);
      if (!manuscript) {
        throw new Error("Manuscript not found");
      }

      // Create document with title page and content
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              // Title
              new Paragraph({
                text: manuscript.title,
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
              }),
              // Content paragraphs
              ...manuscript.content.split("\n\n").map(
                (para: string) =>
                  new Paragraph({
                    children: [new TextRun(para)],
                    spacing: { after: 200 },
                  })
              ),
            ],
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);
      return {
        data: buffer.toString("base64"),
        filename: `${manuscript.title.replace(/[^a-z0-9]/gi, "_")}.docx`,
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      };
    }),

  // Export as HTML
  exportHtml: protectedProcedure
    .input(z.object({ manuscriptId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const manuscript = await getManuscriptById(input.manuscriptId, ctx.user.id);
      if (!manuscript) {
        throw new Error("Manuscript not found");
      }

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${manuscript.title}</title>
  <style>
    body {
      font-family: Georgia, serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
    }
    h1 {
      text-align: center;
      margin-bottom: 2rem;
    }
    p {
      margin-bottom: 1rem;
      text-indent: 2em;
    }
  </style>
</head>
<body>
  <h1>${manuscript.title}</h1>
  ${manuscript.content
    .split("\n\n")
    .map((para: string) => `<p>${para.replace(/\n/g, "<br>")}</p>`)
    .join("\n  ")}
</body>
</html>`;

      return {
        data: Buffer.from(html).toString("base64"),
        filename: `${manuscript.title.replace(/[^a-z0-9]/gi, "_")}.html`,
        mimeType: "text/html",
      };
    }),

  // Export as LaTeX
  exportLatex: protectedProcedure
    .input(z.object({ manuscriptId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const manuscript = await getManuscriptById(input.manuscriptId, ctx.user.id);
      if (!manuscript) {
        throw new Error("Manuscript not found");
      }

      const latex = `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1in]{geometry}
\\usepackage{setspace}
\\doublespacing

\\title{${manuscript.title}}
\\author{}
\\date{}

\\begin{document}

\\maketitle

${manuscript.content
  .split("\n\n")
  .map((para: string) => para.trim())
  .filter((p: string) => p)
  .join("\n\n")}

\\end{document}`;

      return {
        data: Buffer.from(latex).toString("base64"),
        filename: `${manuscript.title.replace(/[^a-z0-9]/gi, "_")}.tex`,
        mimeType: "application/x-latex",
      };
    }),

  // Export as Standard Manuscript Format (text file with proper formatting)
  exportManuscript: protectedProcedure
    .input(z.object({ manuscriptId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const manuscript = await getManuscriptById(input.manuscriptId, ctx.user.id);
      if (!manuscript) {
        throw new Error("Manuscript not found");
      }

      const wordCount = manuscript.content.split(/\s+/).length;
      const currentYear = new Date().getFullYear();

      const formatted = `Author Name (Real name only here)                    Approx. ${wordCount.toLocaleString()} words
123 Main Street, Big City
555-123-4567
author@example.com
https://www.example.com





                        ${manuscript.title.toUpperCase()}
                                  by
                  Author Name (If you have a pen name, put it here instead)










                              © ${currentYear} Author Name






${manuscript.content}`;

      return {
        data: Buffer.from(formatted).toString("base64"),
        filename: `${manuscript.title.replace(/[^a-z0-9]/gi, "_")}_manuscript.txt`,
        mimeType: "text/plain",
      };
    }),
});
