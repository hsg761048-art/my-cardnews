/**
 * 슬라이드 PNG 다운로드 유틸 (html2canvas + JSZip CDN 동적 로드)
 */
import type { Slide } from "@/components/editor/editor-types"
import { FONT_OPTIONS } from "@/components/editor/editor-types"

export const FORMAT_SIZES: Record<string, { width: number; height: number; label: string }> = {
  square: { width: 1080, height: 1080, label: "instagram_1x1" },
  story:  { width: 1080, height: 1920, label: "story_9x16" },
  blog:   { width: 1920, height: 1080, label: "blog_16x9" },
}

// ─── CDN 스크립트 동적 로드 ────────────────────────────────────
async function loadScript(src: string, globalKey: string): Promise<any> {
  if ((window as any)[globalKey]) return (window as any)[globalKey]
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      const interval = setInterval(() => {
        if ((window as any)[globalKey]) {
          clearInterval(interval)
          resolve((window as any)[globalKey])
        }
      }, 100)
      return
    }
    const s = document.createElement("script")
    s.src = src
    s.onload = () => resolve((window as any)[globalKey])
    s.onerror = () => reject(new Error(`CDN 로드 실패: ${src}`))
    document.head.appendChild(s)
  })
}

// ─── HTML 이스케이프 ───────────────────────────────────────────
function esc(str: string): string {
  return (str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br>")
}

// ─── 슬라이드 → HTML 문자열 (full-res 렌더용) ─────────────────
function slideToHTML(slide: Slide, W: number, H: number): string {
  const fontCss = FONT_OPTIONS.find((f) => f.value === slide.fontFamily)?.css ?? "sans-serif"
  const pad = Math.round(W * 0.09)

  const titleSizeMap: Record<string, number> = { sm: 0.07, md: 0.09, lg: 0.11, xl: 0.14 }
  const contentSizeMap: Record<string, number> = { sm: 0.034, md: 0.042, lg: 0.05, xl: 0.06 }
  const titlePx = Math.round(W * (titleSizeMap[slide.titleSize] ?? 0.09))
  const contentPx = Math.round(W * (contentSizeMap[slide.contentSize] ?? 0.042))
  const subtitlePx = Math.round(W * 0.038)
  const ctaPx = Math.round(W * 0.032)
  const ctaPadV = Math.round(W * 0.018)
  const ctaPadH = Math.round(W * 0.045)
  const gap = Math.round(W * 0.028)

  const ta = slide.textAlign ?? "left"
  const justifyContent =
    ta === "right" ? "flex-end" : ta === "center" ? "center" : "flex-start"

  const bgCSS = slide.bgImageUrl
    ? `background:url('${slide.bgImageUrl}') center/cover no-repeat;`
    : `background:${slide.bgStyle.background};`

  const overlay = slide.bgImageUrl
    ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,0.32);"></div>`
    : ""

  return `
<div style="width:${W}px;height:${H}px;${bgCSS}position:relative;overflow:hidden;font-family:${fontCss};box-sizing:border-box;">
  ${overlay}
  <div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:space-between;padding:${pad}px;text-align:${ta};box-sizing:border-box;z-index:1;">
    <div>
      ${slide.subtitle ? `<p style="font-size:${subtitlePx}px;font-weight:500;color:${slide.bgStyle.titleColor};opacity:.8;margin:0 0 ${Math.round(W * 0.015)}px;white-space:pre-line;">${esc(slide.subtitle)}</p>` : ""}
    </div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:${gap}px;">
      <h2 style="font-size:${titlePx}px;font-weight:900;color:${slide.bgStyle.titleColor};line-height:1.15;margin:0;white-space:pre-line;">${esc(slide.title)}</h2>
      <p style="font-size:${contentPx}px;color:${slide.bgStyle.textColor};line-height:1.6;margin:0;white-space:pre-line;">${esc(slide.content)}</p>
    </div>
    <div style="display:flex;justify-content:${justifyContent};">
      ${slide.cta ? `<span style="display:inline-block;padding:${ctaPadV}px ${ctaPadH}px;background:${slide.bgStyle.ctaBg};color:${slide.bgStyle.ctaText};font-size:${ctaPx}px;font-weight:700;border-radius:9999px;">${esc(slide.cta)}</span>` : ""}
    </div>
  </div>
</div>`
}

// ─── 메인 다운로드 함수 ────────────────────────────────────────
export async function downloadSlides(
  slides: Slide[],
  formats: string[],
  title: string,
  onProgress: (current: number, total: number) => void
): Promise<void> {
  // CDN에서 라이브러리 로드
  const [html2canvas, JSZip] = await Promise.all([
    loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
      "html2canvas"
    ),
    loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js",
      "JSZip"
    ),
  ])

  const zip = new JSZip()
  let current = 0
  const total = slides.length * formats.length

  for (const formatId of formats) {
    const fmt = FORMAT_SIZES[formatId]
    if (!fmt) continue
    const folder = zip.folder(fmt.label)!

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i]

      // 오프스크린 컨테이너 생성
      const wrapper = document.createElement("div")
      wrapper.style.cssText = `
        position: fixed;
        left: -${fmt.width + 500}px;
        top: 0;
        width: ${fmt.width}px;
        height: ${fmt.height}px;
        z-index: -9999;
        overflow: hidden;
        pointer-events: none;
      `
      wrapper.innerHTML = slideToHTML(slide, fmt.width, fmt.height)
      document.body.appendChild(wrapper)

      // 배경 이미지 로드 대기
      if (slide.bgImageUrl) {
        await new Promise<void>((resolve) => {
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.onload = () => resolve()
          img.onerror = () => resolve()
          img.src = slide.bgImageUrl!
          setTimeout(resolve, 4000)
        })
      }

      // 렌더링 대기
      await new Promise((r) => setTimeout(r, 150))

      try {
        const el = wrapper.firstElementChild as HTMLElement
        const canvas = await html2canvas(el, {
          width: fmt.width,
          height: fmt.height,
          useCORS: true,
          allowTaint: true,
          scale: 1,
          logging: false,
          backgroundColor: null,
        })

        const blob: Blob = await new Promise((r) =>
          canvas.toBlob((b) => r(b!), "image/png")
        )
        folder.file(`slide_${String(i + 1).padStart(2, "0")}.png`, blob)
      } catch (err) {
        console.error(`슬라이드 ${i + 1} 렌더 실패`, err)
      } finally {
        document.body.removeChild(wrapper)
      }

      current++
      onProgress(current, total)
    }
  }

  // ZIP 생성 및 다운로드
  const safeTitle = (title || "card_news")
    .replace(/[^\uAC00-\uD7A3a-zA-Z0-9]/g, "_")
    .slice(0, 24)
  const zipBlob: Blob = await zip.generateAsync({ type: "blob" })
  const url = URL.createObjectURL(zipBlob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${safeTitle}_카드뉴스.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
