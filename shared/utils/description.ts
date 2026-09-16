import { FilterXSS } from "xss";

const sanitizer = new FilterXSS({
  whiteList: {
    p: [],
    br: [],
    strong: [],
    b: [],
    em: [],
    i: [],
    u: [],
    s: [],
    code: [],
    pre: [],
    h2: [],
    h3: [],
    ul: [],
    ol: [],
    li: [],
    blockquote: [],
    hr: [],
    a: ["href", "title", "target", "rel"],
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script", "style", "iframe", "object", "embed", "form"],
  // Only allow safe link targets. Blocks javascript:, data:, vbscript: etc.
  safeAttrValue: (tag, name, value) => {
    if (tag === "a" && name === "href") {
      const v = value.trim();
      if (
        /^(https?:\/\/|mailto:|tel:|#|\/)/i.test(v) ||
        /^[\w\-.~:/?#[\]@!$&'()*+,;=%]+$/i.test(v)
      ) {
        // Still reject dangerous protocols that slipped through
        if (/^(javascript|data|vbscript|file):/i.test(v)) return "";
        return v;
      }
      return "";
    }
    // Fall back to default handling for everything else
    return FilterXSS.safeAttrValue(tag, name, value, false);
  },
  onTagAttr: (tag, name, _value) => {
    // Force safe link behaviour: open in new tab with noopener
    if (tag === "a" && name === "target") return 'target="_blank"';
    if (tag === "a" && name === "rel") return 'rel="noopener noreferrer"';
    return undefined;
  },
});

export function descriptionHtml(value = "") {
  const content = /<\/?[a-z][\s\S]*>/i.test(value)
    ? value
    : value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");
  return sanitizer.process(content);
}

/** Plain summaries for cards and metadata; rendering uses Vue text interpolation. */
export function descriptionText(value = "") {
  return descriptionHtml(value)
    .replace(/<\/(?:p|h2|h3|li|blockquote)>|<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}
