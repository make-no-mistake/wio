export async function convertToHtml(markdown: string) {
  if (markdown.length === 0) {
    return "";
  }

  return Bun.markdown.html(markdown, {
    code: (children, meta) => {
      const lang = meta?.language ?? "";
      return `<pre><code class="language-${lang}">${children}</code></pre>`;
    },
  });
}
