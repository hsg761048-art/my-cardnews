"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface FontSelectorProps {
  selectedFont: string
  onFontChange: (font: string) => void
}

const fonts = [
  {
    name: "Noto Sans KR",
    preview: "가나다 ABC",
    style: { fontFamily: "'Noto Sans KR', sans-serif" },
    description: "깔끔한 고딕",
  },
  {
    name: "Pretendard",
    preview: "가나다 ABC",
    style: { fontFamily: "'Pretendard', sans-serif" },
    description: "세련된 고딕",
  },
  {
    name: "Playfair Display",
    preview: "Aa Serif",
    style: { fontFamily: "'Playfair Display', serif" },
    description: "고급 세리프",
  },
  {
    name: "Inter",
    preview: "Aa Sans",
    style: { fontFamily: "'Inter', sans-serif" },
    description: "모던 산세리프",
  },
  {
    name: "DM Sans",
    preview: "Aa DM",
    style: { fontFamily: "'DM Sans', sans-serif" },
    description: "기하학 고딕",
  },
  {
    name: "Space Grotesk",
    preview: "Aa Bold",
    style: { fontFamily: "'Space Grotesk', sans-serif" },
    description: "임팩트 디스플레이",
  },
]

export function FontSelector({ selectedFont, onFontChange }: FontSelectorProps) {
  return (
    <div className="glass-card rounded-2xl border border-white/30 p-6 md:p-8">
      <h2 className="text-lg font-bold text-slate-800 mb-1">브랜드 폰트</h2>
      <p className="text-base font-bold text-white mb-6">
        카드뉴스에 사용될 기본 폰트를 선택하세요
      </p>

      <div className="grid grid-cols-3 gap-3">
        {fonts.map((font) => {
          const isSelected = selectedFont === font.name
          return (
            <button
              key={font.name}
              onClick={() => onFontChange(font.name)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 transition-all text-center",
                isSelected
                  ? "border-primary bg-transparent"
                  : "border-white/40 bg-white/70 hover:bg-white/90 hover:border-primary/50"
              )}
            >
              {/* 선택 체크 */}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              {/* 폰트 미리보기 - 핵심 */}
              <p
                className={cn(
                  "text-3xl font-bold leading-tight",
                  isSelected ? "text-white" : "text-slate-800"
                )}
                style={font.style}
              >
                {font.preview}
              </p>

              {/* 폰트 이름 */}
              <p className={cn(
                "text-xs font-bold mt-1",
                isSelected ? "text-primary" : "text-slate-500"
              )}>
                {font.name}
              </p>

              {/* 설명 태그 */}
              <span className={cn(
                "text-base font-semibold px-3 py-1 rounded-full",
                isSelected
                  ? "bg-primary/20 text-white"
                  : "bg-slate-100 text-slate-600"
              )}>
                {font.description}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
