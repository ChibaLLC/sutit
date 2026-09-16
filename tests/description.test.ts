import assert from "node:assert/strict";
import { test } from "node:test";

import { descriptionHtml } from "../shared/utils/description";

test("keeps legacy plain text and line breaks readable", () => {
  assert.equal(
    descriptionHtml("Bring pen & paper\nArrive early"),
    "Bring pen &amp; paper<br>Arrive early",
  );
});
test("preserves supported formatting without executing user HTML", () => {
  const result = descriptionHtml(
    '<h2>Welcome</h2><p><strong>Bring a pen</strong></p><ul><li>Notebook</li></ul><script>alert(1)</script><img src=x onerror=alert(1)><a href="javascript:alert(1)">Link</a>',
  );
  assert.ok(result.includes("<strong>Bring a pen</strong>"));
  assert.ok(result.includes("<ul><li>Notebook</li></ul>"));
  assert.ok(!result.includes("script"));
  assert.ok(!result.includes("onerror"));
  assert.ok(!result.includes("alert"));
});
