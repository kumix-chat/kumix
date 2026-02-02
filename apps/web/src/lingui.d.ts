declare module "*.po" {
  export const messages: Record<string, unknown>;
}

declare module "*?raw" {
  const content: string;
  export default content;
}
