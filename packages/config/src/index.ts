export type RuntimeConfig = {
  homeserverUrl: string;
};

export function defaultRuntimeConfig(): RuntimeConfig {
  return { homeserverUrl: "https://example.com" };
}
