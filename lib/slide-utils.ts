// AI 생성 슬라이드 → 에디터 Slide 포맷 변환 공통 유틸
import {
  createDefaultSlide,
  BG_PRESETS,
} from "@/components/editor/editor-types"
import type {
  Slide,
  BgStyle,
  FontFamily,
} from "@/components/editor/editor-types"
import type { GeneratedSlide, GeneratedDesign } from "@/lib/ai-providers"

// GeneratedDesign → BgStyle 변환
export function designToBgStyle(design: GeneratedDesign | undefined): BgStyle {
  if (!design) return BG_PRESETS[0].style
  return {
    type: design.background.includes("gradient") ? "gradient" : "solid",
    background: design.background,
    textColor: design.textColor,
    titleColor: design.titleColor,
    ctaBg: design.ctaBg,
    ctaText: design.ctaText,
  }
}

// fontFamily 문자열 → FontFamily 타입
export function toFontFamily(font: string | undefined): FontFamily {
  const valid: FontFamily[] = [
    "pretendard",
    "noto-sans",
    "nanum-gothic",
    "nanum-myeongjo",
  ]
  return valid.includes(font as FontFamily) ? (font as FontFamily) : "pretendard"
}

// AI 슬라이드 배열 + 배경 이미지 맵 → 에디터 Slide[] 변환
export function aiSlidesToSlides(
  aiSlides: GeneratedSlide[],
  slideImages: Record<number, string> = {}
): Slide[] {
  return aiSlides.map((s, i) => {
    const bgStyle = designToBgStyle(s.design)
    const fontFamily = toFontFamily(s.design?.fontFamily)
    const raw = s as GeneratedSlide & { logoUrl?: string }
    return createDefaultSlide({
      title: s.title,
      subtitle: s.subtitle ?? "",
      content: s.content,
      cta: s.cta ?? "",
      bgStyle,
      fontFamily,
      textAlign: i === 0 ? "center" : "left",
      bgImagePrompt: s.design?.bgImagePrompt,
      bgImageUrl: slideImages[i] || undefined,
      logoUrl: raw.logoUrl || undefined,
    })
  })
}
