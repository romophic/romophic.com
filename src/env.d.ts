/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ServiceWorkerGlobalScope {
  __WB_MANIFEST: (string | { url: string; revision: string | null })[]
}

