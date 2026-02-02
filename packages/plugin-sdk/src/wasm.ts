export type WasmSource = ArrayBuffer | Uint8Array | URL | string

function isArrayBuffer(value: unknown): value is ArrayBuffer {
  return value instanceof ArrayBuffer
}

function isUint8Array(value: unknown): value is Uint8Array {
  return value instanceof Uint8Array
}

export async function instantiateWasm(
  source: WasmSource,
  imports: WebAssembly.Imports = {}
): Promise<WebAssembly.WebAssemblyInstantiatedSource> {
  if (isUint8Array(source)) {
    return WebAssembly.instantiate(source, imports)
  }

  if (isArrayBuffer(source)) {
    return WebAssembly.instantiate(source, imports)
  }

  const url = typeof source === "string" ? source : source.toString()
  const response = await fetch(url)

  if (typeof WebAssembly.instantiateStreaming === "function") {
    try {
      return await WebAssembly.instantiateStreaming(response, imports)
    } catch {
      // Fallback to ArrayBuffer when server doesn't serve `application/wasm`.
    }
  }

  const bytes = await response.arrayBuffer()
  return WebAssembly.instantiate(bytes, imports)
}
