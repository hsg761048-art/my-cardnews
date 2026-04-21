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

// 데이터 URI(base64) 인지 확인
function isDataUri(url: string | undefined): boolean {
  return !!url && url.startsWith("data:")
}

// 슬라이드에서 공유 URL 에 담기엔 너무 큰 필드(base64 이미지) 를 제거한다.
// http(s) 로 시작하는 외부 URL(Pexels, CDN 등) 은 그대로 유지.
// 반환값: 슬림화된 슬라이드 + 제거된 이미지 개수 (UX 안내용)
export function slimSlidesForShare(slides: Slide[]): { slides: Slide[]; strippedCount: number } {
  let strippedCount = 0
  const slimmed = slides.map((s) => {
    const next = { ...s }
    if (isDataUri(next.logoUrl)) {
      delete next.logoUrl
      strippedCount++
    }
    if (isDataUri(next.bgImageUrl)) {
      delete next.bgImageUrl
      strippedCount++
    }
    if (isDataUri(next.productImageUrl)) {
      delete next.productImageUrl
      strippedCount++
    }
    return next
  })
  return { slides: slimmed, strippedCount }
}

// ─── 공유 링크 생성 ───────────────────────────────────────────
export interface CreateShareUrlResult {
  url: string
  strippedCount: number
}

export function createShareUrl(slides: Slide[], title: string): CreateShareUrlResult {
  // 업로드된 이미지(데이터 URI) 는 공유 페이로드에 담기에 너무 커서 제거
  const { slides: slimmed, strippedCount } = slimSlidesForShare(slides)
  const payload: SharePayload = {
    title,
    slides: slimmed,
    createdAt: Date.now(),
  }
  const encoded = encodeShareData(payload)
  const base = typeof window !== "undefined" ? window.location.origin : ""
  return { url: `${base}/share?d=${encoded}`, strippedCount }
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
