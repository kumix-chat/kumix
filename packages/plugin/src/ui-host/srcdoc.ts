export const KUMIX_UI_BOOTSTRAP_GLOBAL = "__KUMIX_UI_BOOTSTRAP__";

export type KumixUiBootstrap = {
  extensionId: string;
  token: string;
  hostOrigin: string;
};

function safeJson(value: unknown): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

export function injectKumixUiBootstrap(html: string, bootstrap: KumixUiBootstrap): string {
  const payload = safeJson(bootstrap);
  const snippet = `<script>window.${KUMIX_UI_BOOTSTRAP_GLOBAL}=${payload};</script>`;

  const headMatch = html.match(/<head[^>]*>/iu);
  if (headMatch) {
    return html.replace(headMatch[0], `${headMatch[0]}\n    ${snippet}`);
  }

  const htmlMatch = html.match(/<html[^>]*>/iu);
  if (htmlMatch) {
    return html.replace(htmlMatch[0], `${htmlMatch[0]}\n  <head>\n    ${snippet}\n  </head>`);
  }

  return `${snippet}\n${html}`;
}
