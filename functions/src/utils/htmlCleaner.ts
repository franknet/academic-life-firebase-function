import * as cheerio from "cheerio";

export interface HtmlCleanerOptions {
  /**
   * If true, removes <header>, <footer>, and <nav> tags.
   * Default: true
   */
  removeNavAndFooters?: boolean;

  /**
   * If true, removes hidden inputs (such as ASP.NET __VIEWSTATE, CSRF tokens).
   * Default: true
   */
  removeHiddenInputs?: boolean;

  /**
   * If true, replaces <input value="foo"> and <textarea> with plain text to simplify DOM.
   * Default: true
   */
  replaceInputsWithText?: boolean;
}

/**
 * Strips unnecessary nodes, scripts, styles, attributes, and whitespace
 * from raw HTML to significantly reduce the token count sent to OpenAI.
 */
export function cleanHtml(
  rawHtml: string,
  options: HtmlCleanerOptions = {}
): string {
  if (!rawHtml || typeof rawHtml !== "string") {
    return "";
  }

  const {
    removeNavAndFooters = true,
    removeHiddenInputs = true,
    replaceInputsWithText = true,
  } = options;

  // Quick check: if the input is trivial, skip cheerio overhead
  if (rawHtml.trim().length === 0) {
    return "";
  }

  const $ = cheerio.load(rawHtml, {
    xml: false,
  });

  // 1. Remove non-content, script, and style tags entirely
  const tagsToRemove = [
    "script",
    "style",
    "link",
    "meta",
    "noscript",
    "svg",
    "iframe",
    "object",
    "embed",
    "canvas",
    "video",
    "audio",
    "picture",
    "source",
    "template",
    "dialog",
  ];

  if (removeNavAndFooters) {
    tagsToRemove.push("header", "footer", "nav", "aside");
  }

  $(tagsToRemove.join(", ")).remove();

  // 2. Remove hidden inputs (ASP.NET __VIEWSTATE, __EVENTVALIDATION, CSRF tokens)
  if (removeHiddenInputs) {
    $('input[type="hidden"], input[style*="display: none"], input[style*="display:none"]').remove();
  }

  // 3. Remove base64 images and decorative icons
  $('img[src^="data:"], img[srcset^="data:"]').removeAttr("src").removeAttr("srcset");
  $("i, em").each((_, el) => {
    // If the element has no text (e.g. font-awesome icon <i class="fa fa-..."></i>), remove it
    if ($(el).text().trim().length === 0) {
      $(el).remove();
    }
  });

  // 4. Optionally replace form inputs (<input value="...">, <textarea>) with their values
  // In many academic portals (e.g. UNIP), student info is rendered inside readonly inputs.
  if (replaceInputsWithText) {
    $("input, textarea, select").each((_, el) => {
      const $el = $(el);
      const val = $el.val() || $el.attr("value");
      if (typeof val === "string" && val.trim().length > 0) {
        $el.replaceWith(`<span>${val.trim()}</span>`);
      } else {
        $el.remove();
      }
    });
  }

  // 5. Strip token-heavy attributes across all remaining elements
  const uselessAttributes = [
    "style",
    "class",
    "id",
    "role",
    "tabindex",
    "aria-hidden",
    "aria-label",
    "aria-labelledby",
    "aria-describedby",
    "target",
    "rel",
    "width",
    "height",
    "align",
    "valign",
    "border",
    "cellpadding",
    "cellspacing",
  ];

  $("*").each((_, el) => {
    if (!("attribs" in el) || !el.attribs) return;
    const attribs = el.attribs;
    for (const attr of Object.keys(attribs)) {
      // Remove inline JS event handlers (onclick, onchange, onload, etc.)
      if (attr.startsWith("on")) {
        $(el).removeAttr(attr);
        continue;
      }
      // Remove data-* attributes (data-v-xxx, data-bs-*, data-reactid)
      if (attr.startsWith("data-")) {
        $(el).removeAttr(attr);
        continue;
      }
      // Remove aria-* attributes
      if (attr.startsWith("aria-")) {
        $(el).removeAttr(attr);
        continue;
      }
      // Remove generic non-semantic styling/ID attributes
      if (uselessAttributes.includes(attr.toLowerCase())) {
        $(el).removeAttr(attr);
      }
    }
  });

  // 6. Clean javascript: and empty hrefs
  $('a[href^="javascript:"], a[href="#"]').removeAttr("href");

  // 7. Remove empty structural tags that contain only whitespace and no content
  $("div, span, p, section, article").each((_, el) => {
    const $el = $(el);
    if ($el.children().length === 0 && $el.text().trim().length === 0) {
      $el.remove();
    }
  });

  // Get cleaned HTML inside body or root
  const bodyHtml = $("body").length ? $("body").html() : $.html();

  // 8. Normalize whitespace to reduce token count
  return (bodyHtml || "")
    .replace(/<!--[\s\S]*?-->/g, "") // Remove remaining HTML comments
    .replace(/\r\n|\r/g, "\n")
    .replace(/[ \t]+/g, " ") // Collapse inline spaces & tabs
    .replace(/\n\s*\n+/g, "\n") // Collapse multiple blank lines
    .trim();
}
