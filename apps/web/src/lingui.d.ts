declare module "*.po" {
  export const messages: Record<string, any>
}

declare module "*?raw" {
  const content: string
  export default content
}
