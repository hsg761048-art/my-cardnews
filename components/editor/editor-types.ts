// 에디터 공유 타입 정의

export type TextAlign = "left" | "center" | "right"
export type VerticalAlign = "top" | "middle" | "bottom"
export type FontSize = "sm" | "md" | "lg" | "xl"
export type FontFamily = "pretendard" | "noto-sans" | "nanum-gothic" | "nanum-myeongjo"

export interface BgStyle {
  type: "solid" | "gradient"
  background: string   // CSS background 값
  textColor: string    // 본문 텍스트 색상
  titleColor: string   // 제목 텍스트 색상
  ctaBg: string        // CTA 버튼 배경색
  ctaText: string      // CTA 버튼 텍스트 색상
}

export interface Slide {
  id: string
  title: string
  subtitle?: string
  content: string
  cta?: string
  bgStyle: BgStyle
  titleSize: FontSize
  contentSize: FontSize
  textAlign: TextAlign
  verticalAlign?: VerticalAlign
  fontFamily: FontFamily
  bgImagePrompt?: string  // AI가 생성한 배경 이미지 검색용 프롬프트
  bgImageUrl?: string     // 실제 로드된 배경 이미지 URL (Pexels / FLUX)
}

export interface EditorCardData {
  slides: Slide[]
  globalFont: FontFamily
}

// ─── 배경 프리셋 ───────────────────────────────────────────────
export const BG_PRESETS: { label: string; style: BgStyle }[] = [
  {
    label: "나이트 블루",
    style: {
      type: "solid",
      background: "#1a1a2e",
      textColor: "rgba(255,255,255,0.85)",
      titleColor: "#ffffff",
      ctaBg: "#84cc16",
      ctaText: "#1a1a2e",
    },
  },
  {
    label: "라임 그린",
    style: {
      type: "gradient",
      background: "linear-gradient(135deg, #1a1a2e 0%, #1e3a1e 100%)",
      textColor: "rgba(255,255,255,0.85)",
      titleColor: "#84cc16",
      ctaBg: "#84cc16",
      ctaText: "#1a1a2e",
    },
  },
  {
    label: "딥 퍼플",
    style: {
      type: "gradient",
      background: "linear-gradient(135deg, #1a0533 0%, #2d0f5e 100%)",
      textColor: "rgba(255,255,255,0.85)",
      titleColor: "#c084fc",
      ctaBg: "#a855f7",
      ctaText: "#ffffff",
    },
  },
  {
    label: "오션 블루",
    style: {
      type: "gradient",
      background: "linear-gradient(135deg, #0c1445 0%, #0e3460 100%)",
      textColor: "rgba(255,255,255,0.85)",
      titleColor: "#7dd3fc",
      ctaBg: "#0ea5e9",
      ctaText: "#ffffff",
    },
  },
  {
    label: "산호 레드",
    style: {
      type: "gradient",
      background: "linear-gradient(135deg, #2d0a0a 0%, #5c1c1c 100%)",
      textColor: "rgba(255,255,255,0.85)",
      titleColor: "#fca5a5",
      ctaBg: "#ef4444",
      ctaText: "#ffffff",
    },
  },
  {
    label: "골드 앰버",
    style: {
      type: "gradient",
      background: "linear-gradient(135deg, #1a1000 0%, #3d2c00 100%)",
      textColor: "rgba(255,255,255,0.85)",
      titleColor: "#fbbf24",
      ctaBg: "#f59e0b",
      ctaText: "#1a1000",
    },
  },
  {
    label: "미니멀 화이트",
    style: {
      type: "solid",
      background: "#ffffff",
      textColor: "#374151",
      titleColor: "#111827",
      ctaBg: "#111827",
      ctaText: "#ffffff",
    },
  },
  {
    label: "소프트 그레이",
    style: {
      type: "solid",
      background: "#f3f4f6",
      textColor: "#374151",
      titleColor: "#111827",
      ctaBg: "#6366f1",
      ctaText: "#ffffff",
    },
  },
  {
    label: "크림 베이지",
    style: {
      type: "solid",
      background: "#faf7f2",
      textColor: "#6b5e4e",
      titleColor: "#3d2e1e",
      ctaBg: "#92400e",
      ctaText: "#faf7f2",
    },
  },
  {
    label: "민트 그린",
    style: {
      type: "gradient",
      background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
      textColor: "#064e3b",
      titleColor: "#065f46",
      ctaBg: "#059669",
      ctaText: "#ffffff",
    },
  },
  {
    label: "로즈 핑크",
    style: {
      type: "gradient",
      background: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
      textColor: "#9f1239",
      titleColor: "#881337",
      ctaBg: "#e11d48",
      ctaText: "#ffffff",
    },
  },
  {
    label: "선셋 오렌지",
    style: {
      type: "gradient",
      background: "linear-gradient(135deg, #431407 0%, #7c2d12 50%, #9a3412 100%)",
      textColor: "rgba(255,255,255,0.85)",
      titleColor: "#fed7aa",
      ctaBg: "#ea580c",
      ctaText: "#ffffff",
    },
  },
]

export const FONT_OPTIONS: { label: string; value: FontFamily; css: string }[] = [
  { label: "Pretendard", value: "pretendard", css: "'Pretendard Variable', Pretendard, sans-serif" },
  { label: "Noto Sans KR", value: "noto-sans", css: "'Noto Sans KR', sans-serif" },
  { label: "나눔고딕", value: "nanum-gothic", css: "'Nanum Gothic', sans-serif" },
  { label: "나눔명조", value: "nanum-myeongjo", css: "'Nanum Myeongjo', serif" },
]

export const FONT_SIZE_MAP: Record<FontSize, { title: string; label: string }> = {
  sm: { title: "text-xl", label: "작게" },
  md: { title: "text-2xl", label: "보통" },
  lg: { title: "text-3xl", label: "크게" },
  xl: { title: "text-4xl", label: "매우 크게" },
}

export const CONTENT_SIZE_MAP: Record<FontSize, { content: string; label: string }> = {
  sm: { content: "text-sm", label: "작게" },
  md: { content: "text-base", label: "보통" },
  lg: { content: "text-lg", label: "크게" },
  xl: { content: "text-xl", label: "매우 크게" },
}

export const ALIGN_MAP: Record<TextAlign, string> = {
  left: "text-left items-start",
  center: "text-center items-center",
  right: "text-right items-end",
}

export const VERTICAL_ALIGN_MAP: Record<VerticalAlign, string> = {
  top: "justify-start",
  middle: "justify-center",
  bottom: "justify-end",
}

// 새 슬라이드 기본값
export function createDefaultSlide(overrides?: Partial<Slide>): Slide {
  return {
    id: Math.random().toString(36).slice(2),
    title: "새 슬라이드",
    subtitle: "",
    content: "내용을 입력해주세요.",
    cta: "",
    bgStyle: BG_PRESETS[0].style,
    titleSize: "lg",
    contentSize: "md",
    textAlign: "center",
    verticalAlign: "middle",
    fontFamily: "pretendard",
    ...overrides,
  }
}
