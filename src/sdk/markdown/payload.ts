export interface MarkdownPayload {
  markdown: string;
}

export interface MarkdownResponse {
  html: string;
  error?: string;
}
