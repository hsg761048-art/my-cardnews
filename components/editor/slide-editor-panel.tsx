"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Type, Palette, AlignLeft, AlignCenter, AlignRight, Check, ImageOff, Image } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Slide, FontSize, TextAlign, FontFamily } from "./editor-types"
import {
  BG_PRESETS,
  FONT_OPTIONS,
  FONT_SIZE_MAP,
  CONTENT_SIZE_MAP,
} from "./editor-types"

type PanelTab = "text" | "background" | "typography"

interface SlideEditorPanelProps {
  slide: Slide
  onChange: (updates: Partial<Slide>) => void
}

export function SlideEditorPanel({ slide, onChange }: SlideEditorPanelProps) {
  const [tab, setTab] = useState<PanelTab>("text")

  const tabs: { id: PanelTab; label: string; icon: React.ReactNode }[] = [
    { id: "text", label: "텍스트", icon: <Type className="w-3.5 h-3.5" /> },
    { id: "background", label: "배경", icon: <Palette className="w-3.5 h-3.5" /> },
    { id: "typography", label: "타이포", icon: <span className="text-xs font-bold">Aa</span> },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* 탭 헤더 */}
      <div className="flex border-b border-white/10">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all",
              tab === t.id
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-white/40 hover:text-white/70 border-b-2 border-transparent"
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">
        {tab === "text" && (
          <TextTab slide={slide} onChange={onChange} />
        )}
        {tab === "background" && (
          <BackgroundTab slide={slide} onChange={onChange} />
        )}
        {tab === "typography" && (
          <TypographyTab slide={slide} onChange={onChange} />
        )}
      </div>
    </div>
  )
}

// ─── 텍스트 탭 ─────────────────────────────────────────────────
function TextTab({ slide, onChange }: { slide: Slide; onChange: (u: Partial<Slide>) => void }) {
  return (
    <div className="p-4 space-y-5">
      {/* 서브타이틀 */}
      <div className="space-y-1.5">
        <Label className="text-xs text-white/50 font-semibold uppercase tracking-wider">
          서브타이틀
        </Label>
        <Textarea
          value={slide.subtitle ?? ""}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          placeholder="선택사항"
          rows={2}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/25 text-sm rounded-lg resize-none focus:border-primary/50 focus:bg-white/8"
        />
        <p className="text-[11px] text-white/30">Enter로 줄 바꿈 가능</p>
      </div>

      {/* 제목 */}
      <div className="space-y-1.5">
        <Label className="text-xs text-white/50 font-semibold uppercase tracking-wider">
          제목 <span className="text-primary">*</span>
        </Label>
        <Textarea
          value={slide.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="슬라이드 제목"
          rows={2}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/25 text-sm rounded-lg resize-none focus:border-primary/50 focus:bg-white/8"
        />
        <p className="text-[11px] text-white/30">Enter로 줄 바꿈 가능</p>
      </div>

      {/* 본문 내용 */}
      <div className="space-y-1.5">
        <Label className="text-xs text-white/50 font-semibold uppercase tracking-wider">
          본문 내용 <span className="text-primary">*</span>
        </Label>
        <Textarea
          value={slide.content}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder="슬라이드 내용을 입력하세요"
          rows={4}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/25 text-sm rounded-lg resize-none focus:border-primary/50 focus:bg-white/8"
        />
      </div>

      {/* CTA */}
      <div className="space-y-1.5">
        <Label className="text-xs text-white/50 font-semibold uppercase tracking-wider">
          CTA 버튼 텍스트
        </Label>
        <Input
          value={slide.cta ?? ""}
          onChange={(e) => onChange({ cta: e.target.value })}
          placeholder="예) 지금 시작하기"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/25 text-sm h-9 rounded-lg focus:border-primary/50 focus:bg-white/8"
        />
        <p className="text-[11px] text-white/30">비워두면 CTA 버튼이 표시되지 않습니다</p>
      </div>
    </div>
  )
}

// ─── 배경 탭 ───────────────────────────────────────────────────
function BackgroundTab({ slide, onChange }: { slide: Slide; onChange: (u: Partial<Slide>) => void }) {
  const currentBg = slide.bgStyle.background

  return (
    <div className="p-4 space-y-4">

      {/* 배경 이미지 상태 */}
      {slide.bgImageUrl && (
        <div className="space-y-2">
          <p className="text-xs text-white/50 font-semibold uppercase tracking-wider">배경 이미지</p>
          <div className="relative rounded-lg overflow-hidden border border-white/15">
            <img
              src={slide.bgImageUrl}
              alt="배경 이미지"
              className="w-full h-24 object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-end justify-between p-2">
              <div className="flex items-center gap-1.5">
                <Image className="w-3 h-3 text-white/70" />
                <span className="text-[10px] text-white/70">AI 생성 이미지</span>
              </div>
              <button
                onClick={() => onChange({ bgImageUrl: undefined })}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/80 hover:bg-red-500 text-white text-[10px] font-medium transition-colors"
              >
                <ImageOff className="w-3 h-3" />
                제거
              </button>
            </div>
          </div>
          <p className="text-[11px] text-white/30">이미지를 제거하면 아래 프리셋 색상이 표시됩니다</p>
        </div>
      )}

      <div>
        <p className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-3">
          배경 프리셋
        </p>
        <div className="grid grid-cols-3 gap-2">
          {BG_PRESETS.map((preset) => {
            const isSelected = currentBg === preset.style.background
            return (
              <button
                key={preset.label}
                onClick={() => onChange({ bgStyle: preset.style, bgImageUrl: undefined })}
                className={cn(
                  "group relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                  isSelected
                    ? "border-primary scale-105 shadow-lg shadow-primary/30"
                    : "border-transparent hover:border-white/30 hover:scale-102"
                )}
                title={preset.label}
              >
                <div
                  className="w-full h-full flex flex-col items-center justify-center gap-1 p-1"
                  style={{ background: preset.style.background }}
                >
                  <div
                    className="w-4/5 h-1.5 rounded-full opacity-90"
                    style={{ backgroundColor: preset.style.titleColor }}
                  />
                  <div
                    className="w-3/5 h-1 rounded-full opacity-60"
                    style={{ backgroundColor: preset.style.textColor }}
                  />
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </div>
                <span className="absolute bottom-0 left-0 right-0 text-[9px] text-center py-0.5 bg-black/50 text-white/70 truncate px-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {preset.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 선택된 배경 정보 */}
      <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
        <p className="text-[11px] text-white/40 font-medium">선택된 스타일 색상</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "제목", color: slide.bgStyle.titleColor },
            { label: "본문", color: slide.bgStyle.textColor },
            { label: "CTA 배경", color: slide.bgStyle.ctaBg },
            { label: "CTA 텍스트", color: slide.bgStyle.ctaText },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-sm border border-white/20 shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[11px] text-white/50">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── 타이포그래피 탭 ──────────────────────────────────────────
function TypographyTab({ slide, onChange }: { slide: Slide; onChange: (u: Partial<Slide>) => void }) {
  const titleSizes: { value: FontSize; label: string }[] = [
    { value: "sm", label: "S" },
    { value: "md", label: "M" },
    { value: "lg", label: "L" },
    { value: "xl", label: "XL" },
  ]

  const alignOptions: { value: TextAlign; icon: React.ReactNode }[] = [
    { value: "left", icon: <AlignLeft className="w-4 h-4" /> },
    { value: "center", icon: <AlignCenter className="w-4 h-4" /> },
    { value: "right", icon: <AlignRight className="w-4 h-4" /> },
  ]

  return (
    <div className="p-4 space-y-5">
      {/* 폰트 선택 */}
      <div className="space-y-2">
        <p className="text-xs text-white/50 font-semibold uppercase tracking-wider">폰트</p>
        <div className="space-y-1.5">
          {FONT_OPTIONS.map((font) => (
            <button
              key={font.value}
              onClick={() => onChange({ fontFamily: font.value as FontFamily })}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-all",
                slide.fontFamily === font.value
                  ? "border-primary/60 bg-primary/10 text-white"
                  : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white/80"
              )}
              style={{ fontFamily: font.css }}
            >
              <span>{font.label}</span>
              {slide.fontFamily === font.value && (
                <Check className="w-3.5 h-3.5 text-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 제목 크기 */}
      <div className="space-y-2">
        <p className="text-xs text-white/50 font-semibold uppercase tracking-wider">제목 크기</p>
        <div className="grid grid-cols-4 gap-1.5">
          {titleSizes.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onChange({ titleSize: value })}
              className={cn(
                "py-2 rounded-lg text-xs font-bold border transition-all",
                slide.titleSize === value
                  ? "border-primary/60 bg-primary/15 text-primary"
                  : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-white/30">{FONT_SIZE_MAP[slide.titleSize].label}</p>
      </div>

      {/* 본문 크기 */}
      <div className="space-y-2">
        <p className="text-xs text-white/50 font-semibold uppercase tracking-wider">본문 크기</p>
        <div className="grid grid-cols-4 gap-1.5">
          {titleSizes.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onChange({ contentSize: value })}
              className={cn(
                "py-2 rounded-lg text-xs font-bold border transition-all",
                slide.contentSize === value
                  ? "border-primary/60 bg-primary/15 text-primary"
                  : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-white/30">{CONTENT_SIZE_MAP[slide.contentSize].label}</p>
      </div>

      {/* 텍스트 정렬 */}
      <div className="space-y-2">
        <p className="text-xs text-white/50 font-semibold uppercase tracking-wider">텍스트 정렬</p>
        <div className="grid grid-cols-3 gap-1.5">
          {alignOptions.map(({ value, icon }) => (
            <button
              key={value}
              onClick={() => onChange({ textAlign: value })}
              className={cn(
                "flex items-center justify-center py-2.5 rounded-lg border transition-all",
                slide.textAlign === value
                  ? "border-primary/60 bg-primary/15 text-primary"
                  : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70"
              )}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
