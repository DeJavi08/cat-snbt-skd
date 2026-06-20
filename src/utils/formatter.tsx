import React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

// Function to render KaTeX HTML synchronously using the bundled 'katex' NPM package
function renderKatexHtml(math: string, displayMode: boolean): string {
  try {
    return katex.renderToString(math, {
      throwOnError: false,
      displayMode: displayMode,
    });
  } catch (e) {
    console.error("KaTeX Rendering Error:", e);
    return `<code class="font-mono text-xs text-red-500 bg-red-50 dark:bg-red-950/20 px-1 py-0.5 rounded">${math}</code>`;
  }
}

// Low-level parser for inline and display LaTeX math inside strings
export function parseTextWithLatex(text: string): React.ReactNode[] {
  if (!text) return [];

  const displayParts = text.split("$$");
  const result: React.ReactNode[] = [];

  displayParts.forEach((displayPart, dIdx) => {
    if (dIdx % 2 !== 0) {
      // Display Math Block
      const html = renderKatexHtml(displayPart, true);
      result.push(
        <div 
          key={`display-math-${dIdx}`}
          className="my-3 overflow-x-auto text-center"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } else {
      // Check for inline math $...$
      const inlineParts = displayPart.split("$");
      inlineParts.forEach((inlinePart, iIdx) => {
        if (iIdx % 2 !== 0) {
          // Inline Math Block
          const html = renderKatexHtml(inlinePart, false);
          result.push(
            <span 
              key={`inline-math-${dIdx}-${iIdx}`}
              className="inline-block px-0.5"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } else {
          // Plain Text - Let's also check for images here so that images can be embedded anywhere
          const imgRegex = /\[IMAGE:\s*([^\]]+)\]/g;
          const imgParts = inlinePart.split(imgRegex);
          
          if (imgParts.length === 1) {
            result.push(<React.Fragment key={`text-${dIdx}-${iIdx}`}>{inlinePart}</React.Fragment>);
          } else {
            imgParts.forEach((imgPart, imgIdx) => {
              if (imgIdx % 2 !== 0) {
                // This is an image path
                const imgPath = imgPart.trim();
                result.push(
                  <span key={`image-${dIdx}-${iIdx}-${imgIdx}`} className="block my-4 flex flex-col items-center">
                    <img
                      src={`/${imgPath}`}
                      alt="Ilustrasi Soal"
                      referrerPolicy="no-referrer"
                      className="max-h-72 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-805 object-contain bg-white dark:bg-slate-950 p-3 hover:scale-101 transition duration-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const container = target.parentElement;
                        if (container) {
                          if (!container.querySelector(".img-fallback")) {
                            const fallback = document.createElement("div");
                            fallback.className = "img-fallback w-full max-w-md p-6 bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 gap-2";
                            fallback.innerHTML = `
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                              <span class="text-xs font-semibold text-slate-550 dark:text-slate-400">Berkas Gambar Statis</span>
                              <span class="text-[10px] text-slate-400 dark:text-slate-500 font-mono">${imgPath}</span>
                            `;
                            container.appendChild(fallback);
                          }
                        }
                      }}
                    />
                  </span>
                );
              } else {
                result.push(<React.Fragment key={`text-img-${dIdx}-${iIdx}-${imgIdx}`}>{imgPart}</React.Fragment>);
              }
            });
          }
        }
      });
    }
  });

  return result;
}

// Function to render a Markdown-style pipe table structure
function renderTable(tableBlock: string, key: string): React.ReactNode {
  const lines = tableBlock.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length === 0) return null;

  // Split each line into cells by vertical bar
  const parsedRows = lines.map(line => {
    let cellStr = line;
    if (cellStr.startsWith("|")) cellStr = cellStr.substring(1);
    if (cellStr.endsWith("|")) cellStr = cellStr.slice(0, -1);
    return cellStr.split("|").map(col => col.trim());
  });

  // Filter out any separator divider lines e.g. "---|---|---"
  const actualRows = parsedRows.filter(row => {
    const isDivider = row.every(cell => cell.match(/^[-=:\s]+$/));
    return !isDivider && row.length > 0;
  });

  if (actualRows.length === 0) return null;

  const headerRow = actualRows[0];
  const bodyRows = actualRows.slice(1);

  return (
    <div key={key} className="my-5 w-full overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
        <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400">
          <tr>
            {headerRow.map((cell, idx) => (
              <th 
                key={`th-${idx}`} 
                className="px-4 py-3 text-left font-extrabold uppercase tracking-wider text-xs border-b border-slate-200 dark:border-slate-805"
              >
                {parseTextWithLatex(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
          {bodyRows.map((row, rIdx) => (
            <tr 
              key={`tr-${rIdx}`} 
              className="odd:bg-white even:bg-slate-50/40 dark:odd:bg-slate-900/10 dark:even:bg-slate-950/25 hover:bg-slate-100/40 dark:hover:bg-slate-800/10 transition"
            >
              {row.map((cell, cIdx) => (
                <td 
                  key={`td-${rIdx}-${cIdx}`} 
                  className="px-4 py-3 text-slate-705 dark:text-slate-300 font-medium leading-relaxed"
                >
                  {parseTextWithLatex(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Main high-level renderer to handle nested paragraphs, tables, images, and math
export function renderFormattedContent(text: string): React.ReactNode {
  if (!text) return null;

  // Split by double newlines to segment block elements (paragraphs and tables)
  const blocks = text.split(/\r?\n\s*\r?\n/);

  return (
    <div className="space-y-4">
      {blocks.map((block, bIdx) => {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) return null;

        // Check if block represents a table
        const lines = trimmedBlock.split(/\r?\n/);
        const hasPipe = lines.some(line => line.includes("|"));

        if (hasPipe && lines.length >= 1) {
          return renderTable(trimmedBlock, `block-table-${bIdx}`);
        } else {
          return (
            <div key={`block-p-${bIdx}`} className="whitespace-pre-line leading-relaxed text-slate-700 dark:text-slate-300">
              {parseTextWithLatex(trimmedBlock)}
            </div>
          );
        }
      })}
    </div>
  );
}
