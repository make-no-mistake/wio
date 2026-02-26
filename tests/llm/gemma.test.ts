import { describe, expect, it, mock, beforeEach } from "bun:test";

// Mock the @google/genai module before importing our service
const generateContentMock = mock(async () => ({
  text: "Mocked AI response",
}));

mock.module("@google/genai", () => ({
  GoogleGenAI: class {
    constructor() {}
    models = {
      generateContent: generateContentMock,
    };
  },
}));

// Must import AFTER the mock is set up
const { generateText } = await import("../../src/llm/gemma");

describe("generateText", () => {
  beforeEach(() => {
    generateContentMock.mockClear();
  });

  it("should return the model's text response", async () => {
    const result = await generateText("What is 2+2?");

    expect(result).toEqual({
      success: true,
      response: "Mocked AI response",
    });
    expect(generateContentMock).toHaveBeenCalledWith({
      model: "gemma-3-27b-it",
      contents: "What is 2+2?",
    });
  });

  it("should return error on empty prompt", async () => {
    const result = await generateText("");
    expect(result).toEqual({
      success: false,
      error: "A non-empty 'prompt' string is required.",
      statusCode: 400,
    });
  });

  it("should return error on whitespace-only prompt", async () => {
    const result = await generateText("   ");
    expect(result).toEqual({
      success: false,
      error: "A non-empty 'prompt' string is required.",
      statusCode: 400,
    });
  });

  it("should return error when prompt exceeds max length", async () => {
    const longPrompt = "a".repeat(6768);
    const result = await generateText(longPrompt);
    expect(result).toEqual({
      success: false,
      error: "Prompt must not exceed 6767 characters.",
      statusCode: 400,
    });
  });

  it("should return error when model returns empty response", async () => {
    generateContentMock.mockImplementationOnce(async () => ({
      text: "",
    }));

    const result = await generateText("Hello");
    expect(result).toEqual({
      success: false,
      error: "The model returned an empty response.",
      statusCode: 500,
    });
  });

  it("should return a 503 error with friendly message on high traffic", async () => {
    generateContentMock.mockImplementationOnce(async () => {
      const error = new Error("ApiError") as Error & { status?: number };
      error.status = 503;
      throw error;
    });

    const result = await generateText("Hello");
    expect(result).toEqual({
      success: false,
      error:
        "The AI model is currently experiencing high traffic. Please try again later.",
      statusCode: 503,
    });
  });
});
