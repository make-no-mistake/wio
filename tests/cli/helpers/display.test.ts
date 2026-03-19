import { describe, expect, test } from "bun:test";
import { stripAnsi, padRight } from "../../../cli/helpers/display";

describe("stripAnsi", () => {
  test("passes through plain strings unchanged", () => {
    expect(stripAnsi("hello")).toBe("hello");
  });

  test("strips a single color code", () => {
    expect(stripAnsi("\x1b[32mhello\x1b[0m")).toBe("hello");
  });

  test("strips multiple adjacent color codes", () => {
    expect(stripAnsi("\x1b[1m\x1b[34mbold blue\x1b[0m")).toBe("bold blue");
  });

  test("strips codes embedded in the middle of a string", () => {
    expect(stripAnsi("foo\x1b[31mbar\x1b[0mbaz")).toBe("foobarbaz");
  });

  test("returns empty string for empty input", () => {
    expect(stripAnsi("")).toBe("");
  });

  test("returns empty string when input is only ANSI codes", () => {
    expect(stripAnsi("\x1b[0m\x1b[1m")).toBe("");
  });
});

describe("padRight", () => {
  test("pads a plain string to the given width", () => {
    expect(padRight("hi", 5)).toBe("hi   ");
  });

  test("does not pad when string already equals the target width", () => {
    expect(padRight("hello", 5)).toBe("hello");
  });

  test("does not truncate strings longer than the target width", () => {
    expect(padRight("toolong", 4)).toBe("toolong");
  });

  test("pads an ANSI-colored string based on visible width, not byte length", () => {
    const colored = "\x1b[32mhi\x1b[0m"; // 2 visible chars, many bytes
    const result = padRight(colored, 5);
    // visible portion should be padded to 5
    expect(stripAnsi(result)).toBe("hi   ");
  });

  test("width of 0 returns the string as-is", () => {
    expect(padRight("hi", 0)).toBe("hi");
  });
});
