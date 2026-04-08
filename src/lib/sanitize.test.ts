import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "./sanitize";

describe("sanitizeHtml", () => {
  it("пропускает безопасный HTML без изменений", () => {
    const safe = "<p>Привет <strong>мир</strong></p>";
    expect(sanitizeHtml(safe)).toBe(safe);
  });

  it("сохраняет ссылки с href", () => {
    const html = '<a href="https://example.com">link</a>';
    expect(sanitizeHtml(html)).toBe(html);
  });

  it("сохраняет списки", () => {
    const html = "<ul><li>one</li><li>two</li></ul>";
    expect(sanitizeHtml(html)).toBe(html);
  });

  it("сохраняет заголовки h1-h6", () => {
    const html = "<h1>Title</h1><h2>Sub</h2><h3>Sub2</h3>";
    expect(sanitizeHtml(html)).toBe(html);
  });

  it("удаляет <script> тег полностью", () => {
    const dirty = '<p>Hello</p><script>alert("xss")</script>';
    expect(sanitizeHtml(dirty)).toBe("<p>Hello</p>");
  });

  it("удаляет inline обработчики событий (onerror, onclick)", () => {
    const dirty = '<img src=x onerror="alert(1)">';
    const result = sanitizeHtml(dirty);
    expect(result).not.toContain("onerror");
    expect(result).not.toContain("alert");
  });

  it("удаляет <iframe>", () => {
    const dirty = '<iframe src="https://evil.com"></iframe><p>ok</p>';
    expect(sanitizeHtml(dirty)).toBe("<p>ok</p>");
  });

  it("удаляет javascript: в href", () => {
    const dirty = '<a href="javascript:alert(1)">click</a>';
    const result = sanitizeHtml(dirty);
    expect(result).not.toContain("javascript:");
  });

  it("удаляет <style> тег", () => {
    const dirty = "<style>body{display:none}</style><p>text</p>";
    expect(sanitizeHtml(dirty)).toBe("<p>text</p>");
  });

  it("удаляет <svg> с onload", () => {
    const dirty = '<svg onload="alert(1)"><circle r="10"/></svg><p>safe</p>';
    const result = sanitizeHtml(dirty);
    expect(result).not.toContain("svg");
    expect(result).not.toContain("onload");
    expect(result).toContain("safe");
  });

  it("удаляет data-атрибуты", () => {
    const dirty = '<div data-exploit="payload">text</div>';
    const result = sanitizeHtml(dirty);
    expect(result).not.toContain("data-exploit");
  });

  it("обрабатывает пустую строку", () => {
    expect(sanitizeHtml("")).toBe("");
  });

  it("обрабатывает обычный текст без тегов", () => {
    expect(sanitizeHtml("just text")).toBe("just text");
  });

  it("удаляет вложенный script внутри легитимного HTML", () => {
    const dirty = '<p>before<script>document.cookie</script>after</p>';
    expect(sanitizeHtml(dirty)).toBe("<p>beforeafter</p>");
  });

  it("удаляет <form> тег", () => {
    const dirty = '<form action="https://evil.com"><input type="text"></form><p>ok</p>';
    const result = sanitizeHtml(dirty);
    expect(result).not.toContain("form");
    expect(result).not.toContain("input");
    expect(result).toContain("ok");
  });

  it("удаляет <object> и <embed>", () => {
    const dirty = '<object data="evil.swf"></object><embed src="evil.swf"><p>safe</p>';
    const result = sanitizeHtml(dirty);
    expect(result).not.toContain("object");
    expect(result).not.toContain("embed");
    expect(result).toContain("safe");
  });
});
