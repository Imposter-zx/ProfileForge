// components/studio/MarkdownRenderer.tsx
"use client";

import React, { useMemo } from "react";

export interface MarkdownRendererProps {
  markdown: string;
  theme?: "dark" | "light";
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^\s*(javascript|data|vbscript):/i.test(trimmed)) {
    return "#";
  }
  return trimmed;
}

function formatInline(line: string, isDark: boolean): string {
  // Preserve inline HTML tags like <img>, <a>, <sub>, <sup>, <br>, <strong>, <em>, <code>
  const htmlTokens: string[] = [];
  let out = line.replace(
    /<\/?(?:img|a|sub|sup|br|strong|em|b|i|code|kbd|span|picture|source)\b[^>]*>/gi,
    (tag) => {
      const safeTag = tag.replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "");
      const idx = htmlTokens.length;
      htmlTokens.push(safeTag);
      return `\u0000HTML${idx}\u0000`;
    }
  );

  // Inline code
  out = out.replace(/`([^`]+)`/g, (_m, code) => {
    const cls = isDark
      ? "px-1.5 py-0.5 rounded bg-slate-800/90 text-indigo-300 text-[12px] font-mono"
      : "px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[12px] font-mono";
    return `<code class="${cls}">${escapeHtml(code)}</code>`;
  });

  // Images: ![alt](url)
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, url) => {
    return `<img src="${sanitizeUrl(url)}" alt="${escapeHtml(alt)}" class="inline-block max-w-full my-1 rounded" loading="lazy" />`;
  });

  // Links: [text](url)
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, url) => {
    const cls = isDark
      ? "text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
      : "text-blue-600 hover:text-blue-700 underline underline-offset-2";
    return `<a href="${sanitizeUrl(url)}" target="_blank" rel="noopener noreferrer" class="${cls}">${text}</a>`;
  });

  // Bold + Italic, Bold, Italic, Strikethrough
  out = out.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
  out = out.replace(
    /\*\*(.*?)\*\*/g,
    `<strong class="${isDark ? "text-slate-100" : "text-slate-900"} font-semibold">$1</strong>`
  );
  out = out.replace(
    /\*(.*?)\*/g,
    `<em class="${isDark ? "text-slate-300" : "text-slate-700"}">$1</em>`
  );
  out = out.replace(/~~(.*?)~~/g, "<del>$1</del>");

  // Restore inline HTML tokens
  out = out.replace(/\u0000HTML(\d+)\u0000/g, (_m, idx) => htmlTokens[Number(idx)] || "");
  return out;
}

function parseTableRow(row: string): string[] {
  const trimmed = row.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

function isTableSeparator(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes("|") && !trimmed.includes("-")) return false;
  const cells = parseTableRow(trimmed);
  return cells.length > 0 && cells.every((c) => /^:?-{3,}:?$/.test(c));
}

function getColumnAlignment(cell: string): "left" | "center" | "right" {
  const t = cell.trim();
  if (t.startsWith(":") && t.endsWith(":")) return "center";
  if (t.endsWith(":")) return "right";
  return "left";
}

export function MarkdownRenderer({
  markdown,
  theme = "dark",
}: MarkdownRendererProps) {
  const isDark = theme === "dark";

  const sanitizedHtml = useMemo(() => {
    if (!markdown) return "";

    // 1. Strip dangerous tags & event handlers
    let clean = markdown
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "")
      .replace(/javascript:/gi, "");

    // 2. Resolve <picture> light/dark adaptive blocks based on active preview theme
    clean = clean.replace(
      /<picture\b[^>]*>([\s\S]*?)<\/picture>/gi,
      (_match, inner: string) => {
        const darkMatch = inner.match(
          /<source[^>]*prefers-color-scheme:\s*dark[^>]*srcset=["']([^"']+)["'][^>]*>/i
        );
        const lightMatch = inner.match(
          /<source[^>]*prefers-color-scheme:\s*light[^>]*srcset=["']([^"']+)["'][^>]*>/i
        );
        const imgMatch = inner.match(/<img\b([^>]*)>/i);
        const chosenSrc = isDark
          ? darkMatch?.[1] || lightMatch?.[1]
          : lightMatch?.[1] || darkMatch?.[1];

        if (imgMatch && chosenSrc) {
          const attrs = imgMatch[1].replace(/\bsrc=["'][^"']*["']/i, "");
          return `<img src="${sanitizeUrl(chosenSrc)}" ${attrs} />`;
        }
        return imgMatch ? imgMatch[0] : inner;
      }
    );

    // 3. Extract fenced code blocks so line-based parsing doesn't mangle them
    const codeBlocks: string[] = [];
    clean = clean.replace(
      /```([a-zA-Z0-9_-]*)\r?\n([\s\S]*?)```/g,
      (_m, lang, code) => {
        const idx = codeBlocks.length;
        const langBadge = lang
          ? `<div class="flex items-center justify-between px-3 py-1.5 border-b ${
              isDark
                ? "border-slate-800 bg-slate-900/90 text-slate-400"
                : "border-slate-200 bg-slate-100 text-slate-600"
            } text-[10px] font-mono uppercase tracking-wider">${escapeHtml(lang)}</div>`
          : "";
        codeBlocks.push(
          `<div class="my-3 rounded-xl overflow-hidden border ${
            isDark
              ? "border-slate-800 bg-slate-950/95"
              : "border-slate-200 bg-slate-50"
          }">${langBadge}<pre class="p-3.5 text-xs font-mono ${
            isDark ? "text-emerald-300" : "text-slate-800"
          } overflow-x-auto leading-relaxed"><code>${escapeHtml(
            code.replace(/\n$/, "")
          )}</code></pre></div>`
        );
        return `\n\u0000CODEBLOCK${idx}\u0000\n`;
      }
    );

    const lines = clean.split(/\r?\n/);
    const out: string[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Code block placeholder
      const codeMatch = trimmed.match(/^\u0000CODEBLOCK(\d+)\u0000$/);
      if (codeMatch) {
        out.push(codeBlocks[Number(codeMatch[1])] || "");
        i += 1;
        continue;
      }

      // Blank line
      if (!trimmed) {
        i += 1;
        continue;
      }

      // Horizontal rule
      if (/^(?:---|\*\*\*|___)$/.test(trimmed)) {
        out.push(
          `<hr class="my-5 ${isDark ? "border-slate-800" : "border-slate-200"}" />`
        );
        i += 1;
        continue;
      }

      // Headings
      const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const content = formatInline(headingMatch[2], isDark);
        const styles: Record<number, string> = {
          1: `text-2xl font-extrabold pb-2 border-b mt-6 mb-4 ${
            isDark ? "text-white border-slate-800" : "text-slate-900 border-slate-200"
          }`,
          2: `text-lg font-bold pb-1.5 border-b mt-6 mb-3 ${
            isDark ? "text-slate-100 border-slate-800" : "text-slate-900 border-slate-200"
          }`,
          3: `text-base font-semibold mt-4 mb-2 ${
            isDark ? "text-slate-100" : "text-slate-900"
          }`,
          4: `text-sm font-semibold mt-3 mb-1.5 ${
            isDark ? "text-slate-200" : "text-slate-800"
          }`,
          5: `text-xs font-semibold uppercase tracking-wide mt-3 mb-1 ${
            isDark ? "text-slate-300" : "text-slate-700"
          }`,
          6: `text-xs font-medium mt-2 mb-1 ${
            isDark ? "text-slate-400" : "text-slate-600"
          }`,
        };
        out.push(`<h${level} class="${styles[level]}">${content}</h${level}>`);
        i += 1;
        continue;
      }

      // Tables
      if (
        trimmed.includes("|") &&
        i + 1 < lines.length &&
        isTableSeparator(lines[i + 1])
      ) {
        const headers = parseTableRow(trimmed);
        const sepCells = parseTableRow(lines[i + 1]);
        const aligns = sepCells.map(getColumnAlignment);
        i += 2;

        const bodyRows: string[][] = [];
        while (i < lines.length && lines[i].trim().includes("|") && lines[i].trim() !== "") {
          bodyRows.push(parseTableRow(lines[i]));
          i += 1;
        }

        const thHtml = headers
          .map((h, colIdx) => {
            const align = aligns[colIdx] || "left";
            return `<th style="text-align:${align}" class="px-3 py-2 font-semibold border ${
              isDark
                ? "border-slate-800 bg-slate-900/90 text-slate-200"
                : "border-slate-200 bg-slate-100 text-slate-900"
            }">${formatInline(h, isDark)}</th>`;
          })
          .join("");

        const rowsHtml = bodyRows
          .map(
            (row, rowIdx) =>
              `<tr class="${
                rowIdx % 2 === 1
                  ? isDark
                    ? "bg-slate-900/40"
                    : "bg-slate-50/70"
                  : ""
              }">${headers
                .map((_, colIdx) => {
                  const cell = row[colIdx] || "";
                  const align = aligns[colIdx] || "left";
                  return `<td style="text-align:${align}" class="px-3 py-2 border ${
                    isDark
                      ? "border-slate-800 text-slate-300"
                      : "border-slate-200 text-slate-700"
                  }">${formatInline(cell, isDark)}</td>`;
                })
                .join("")}</tr>`
          )
          .join("");

        out.push(
          `<div class="my-4 overflow-x-auto rounded-lg border ${
            isDark ? "border-slate-800" : "border-slate-200"
          }"><table class="w-full border-collapse text-xs"><thead><tr>${thHtml}</tr></thead><tbody>${rowsHtml}</tbody></table></div>`
        );
        continue;
      }

      // Blockquotes & GitHub Alerts
      if (trimmed.startsWith(">")) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith(">")) {
          quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
          i += 1;
        }
        const first = quoteLines[0] || "";
        const alertMatch = first.match(
          /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]$/i
        );
        if (alertMatch) {
          const kind = alertMatch[1].toUpperCase();
          const colors: Record<string, string> = {
            NOTE: "border-blue-500 bg-blue-500/10 text-blue-300",
            TIP: "border-emerald-500 bg-emerald-500/10 text-emerald-300",
            IMPORTANT: "border-purple-500 bg-purple-500/10 text-purple-300",
            WARNING: "border-amber-500 bg-amber-500/10 text-amber-300",
            CAUTION: "border-rose-500 bg-rose-500/10 text-rose-300",
          };
          const body = quoteLines
            .slice(1)
            .map((ql) => formatInline(ql, isDark))
            .join("<br />");
          out.push(
            `<div class="my-3 rounded-lg border-l-4 px-4 py-2.5 text-sm ${
              colors[kind] || colors.NOTE
            }"><div class="text-xs font-bold uppercase tracking-wider mb-1">${kind}</div><div class="${
              isDark ? "text-slate-200" : "text-slate-800"
            }">${body}</div></div>`
          );
        } else {
          const body = quoteLines
            .map((ql) => formatInline(ql, isDark))
            .join("<br />");
          out.push(
            `<blockquote class="border-l-4 border-indigo-500 pl-3.5 py-1 my-3 ${
              isDark ? "text-slate-400" : "text-slate-600"
            } italic text-sm">${body}</blockquote>`
          );
        }
        continue;
      }

      // Unordered lists (including task lists)
      if (/^[-*+]\s+/.test(trimmed)) {
        const items: string[] = [];
        while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
          const rawItem = lines[i].trim().replace(/^[-*+]\s+/, "");
          const taskMatch = rawItem.match(/^\[( |x|X)\]\s+(.*)$/);
          if (taskMatch) {
            const checked = taskMatch[1].toLowerCase() === "x";
            items.push(
              `<li class="flex items-start gap-2 text-sm ${
                isDark ? "text-slate-300" : "text-slate-700"
              }"><input type="checkbox" ${
                checked ? "checked" : ""
              } disabled class="mt-1 accent-indigo-500" /><span>${formatInline(
                taskMatch[2],
                isDark
              )}</span></li>`
            );
          } else {
            items.push(
              `<li class="ml-5 list-disc text-sm ${
                isDark ? "text-slate-300" : "text-slate-700"
              } leading-relaxed">${formatInline(rawItem, isDark)}</li>`
            );
          }
          i += 1;
        }
        out.push(`<ul class="my-2.5 space-y-1">${items.join("")}</ul>`);
        continue;
      }

      // Ordered lists
      if (/^\d+\.\s+/.test(trimmed)) {
        const items: string[] = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
          const rawItem = lines[i].trim().replace(/^\d+\.\s+/, "");
          items.push(
            `<li class="ml-5 list-decimal text-sm ${
              isDark ? "text-slate-300" : "text-slate-700"
            } leading-relaxed">${formatInline(rawItem, isDark)}</li>`
          );
          i += 1;
        }
        out.push(`<ol class="my-2.5 space-y-1">${items.join("")}</ol>`);
        continue;
      }

      // Block HTML (<div>, <p>, <table>, <details>, <summary>, <a ...>)
      if (/^<\/?(?:div|p|table|thead|tbody|tr|th|td|details|summary|hr|br|center|h[1-6]|ul|ol|li|blockquote)\b/i.test(trimmed)) {
        const htmlLines: string[] = [line];
        const openBlock = trimmed.match(/^<(div|p|table|details|center)\b/i);
        if (openBlock && !trimmed.includes(`</${openBlock[1]}>`)) {
          const tagName = openBlock[1].toLowerCase();
          i += 1;
          while (i < lines.length) {
            htmlLines.push(lines[i]);
            if (lines[i].toLowerCase().includes(`</${tagName}>`)) {
              i += 1;
              break;
            }
            i += 1;
          }
        } else {
          i += 1;
        }
        out.push(htmlLines.join("\n"));
        continue;
      }

      // Normal paragraph
      const paraLines: string[] = [trimmed];
      i += 1;
      while (
        i < lines.length &&
        lines[i].trim() !== "" &&
        !/^(?:#{1,6}\s|```|>|[-*+]\s|\d+\.\s|---|\*\*\*|___|<(?:div|p|table|details|hr)\b|\u0000CODEBLOCK)/i.test(
          lines[i].trim()
        )
      ) {
        paraLines.push(lines[i].trim());
        i += 1;
      }
      out.push(
        `<p class="my-2 text-sm leading-relaxed ${
          isDark ? "text-slate-200" : "text-slate-800"
        }">${formatInline(paraLines.join(" "), isDark)}</p>`
      );
    }

    return out.join("\n");
  }, [markdown, isDark]);

  return (
    <div
      className={`max-w-none text-sm leading-relaxed break-words [&_img]:inline-block [&_div]:my-2 [&_a]:transition-colors ${
        isDark ? "text-slate-200" : "text-slate-800"
      }`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
