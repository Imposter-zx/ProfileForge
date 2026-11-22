// components/studio/MarkdownRenderer.tsx
"use client";

import React, { useMemo } from "react";

export function MarkdownRenderer({ markdown }: { markdown: string }) {
  // Convert standard markdown into safe HTML for GitHub-like preview
  const sanitizedHtml = useMemo(() => {
    if (!markdown) return "";

    let html = markdown;

    // Remove any <script> tags or on* handlers for security
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    html = html.replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "");

    // Process code blocks first (triple backtick)
    html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/g, (_match, lang, code) => {
      const escaped = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return `<pre class="my-3 p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed"><code>${escaped}</code></pre>`;
    });

    // Inline code (single backtick)
    html = html.replace(/`([^`]+)`/g, (_match, code) => {
      const escaped = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return `<code class="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 text-xs font-mono">${escaped}</code>`;
    });

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-semibold text-slate-100 mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-slate-100 pb-1.5 border-b border-slate-800 mt-6 mb-3">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-extrabold text-white pb-2 border-b border-slate-800 mt-6 mb-4">$1</h1>');

    // Bold & Italics
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-100 font-semibold">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>');

    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-indigo-500 pl-3 py-1 my-2 text-slate-400 italic text-sm">$1</blockquote>');

    // Markdown Links: [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">$1</a>');

    // Markdown Images: ![alt](url)
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="inline-block max-w-full my-1 rounded" />');

    // Unordered lists (- item or * item)
    html = html.replace(/^[\-\*] (.*$)/gim, '<li class="ml-4 list-disc text-sm text-slate-300 leading-relaxed">$1</li>');

    // Wrap consecutive list items in <ul>
    html = html.replace(/(<li[\s\S]*?<\/li>(\s*<li[\s\S]*?<\/li>)*)/g, '<ul class="my-2 space-y-1">$1</ul>');

    // Horizontal rule
    html = html.replace(/^---$/gim, '<hr class="my-6 border-slate-800" />');

    return html;
  }, [markdown]);

  return (
    <div
      className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed break-words [&_img]:inline-block [&_p]:my-2 [&_div]:my-2"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
