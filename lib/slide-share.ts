/**
 * 슬라이드 공유 유틸 — base64 URL 인코딩으로 실제 공유 링크 생성
 * 링크를 열면 /share 페이지에서 슬라이드를 바로 볼 수 있음
 */
import type { Slide } from "@/components/editor/editor-types"

export interface SharePayload {
  title: string
  slides: Slide[]
  createdAt: number
}

// ─── 인코딩 / 디코딩 ──────────────────────────────────────────
export function encodeShareData(payload: SharePayload): string {
  const json = JSON.stringify(payload)
  // TextEncoder → Uint8Array → base64
  const bytes = new TextEncoder().encode(json)
  let binary = ""
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

export function decodeShareData(encoded: string): SharePayload | null {
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/")
    const binary = atob(base64)
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    const json = new TextDecoder().decode(bytes)
    return JSON.parse(json) as SharePayload
  } catch {
    return null
  }
}

// ─── 공유 링크 생성 ───────────────────────────────────────────
export function createShareUrl(slides: Slide[], title: string): string {
  const payload: SharePayload = {
    title,
    slides,
    createdAt: Date.now(),
  }
  const encoded = encodeShareData(payload)
  const base = typeof window !== "undefined" ? window.location.origin : ""
  return `${base}/share?d=${encoded}`
}

// ─── 클립보드 복사 ────────────────────────────────────────────
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // fallback
    const ta = document.createElement("textarea")
    ta.value = text
    ta.style.position = "fixed"
    ta.style.opacity = "0"
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand("copy")
    document.body.removeChild(ta)
    return ok
  }
}
