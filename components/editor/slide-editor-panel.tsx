"use client"

import { useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Type, Palette, AlignLeft, AlignCenter, AlignRight, AlignStartVertical, AlignCenterVertical, AlignEndVertical, Check, ImageOff, Image, Upload, Package, Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Slide, FontSize, TextAlign, VerticalAlign, FontFamily, ProductImagePosition, ProductImageSize } from "./editor-types"
import {
  BG_PRESETS,
  FONT_OPTIONS,
  FONT_SIZE_MAP,
  CONTENT_SIZE_MAP,
  PRODUCT_IMAGE_SIZE_MAP,
} from "./editor-types"
import { processImageFile, isFileTooLarge } from "@/lib/image-upload"

type PanelTab = "text" | "background" | "product" | "typography"

interface SlideEditorPanelProps {
  slide: Slide
  onChange: (updates: Partial<Slide>) => void
}

export function SlideEditorPanel({ slide, onChange }: SlideEditorPanelProps) {
  const [tab, setTab] = useState<PanelTab>("text")

  const tabs: { id: PanelTab; label: string; icon: React.ReactNode }[] = [
    { id: "text", label: "텍스트", icon: <Type className="w-3.5 h-3.5" /> },
    { id: "background", label: "배경", icon: <Palette className="w-3.5 h-3.5" /> },
    { id: "product", label: "제품", icon: <Package className="w-3.5 h-3.5" /> },
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
        {tab === "product" && (
          <ProductImageTab slide={slide} onChange={onChange} />
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
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  // 업로드한 이미지인지(=base64 data:) 또는 AI 생성 이미지인지 구분
  const isUserUploaded = !!slide.bgImageUrl?.startsWith("data:")

  const handleUploadClick = () => {
    setUploadError(null)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // input 을 같은 파일로도 다시 선택할 수 있게 value 를 비움
    e.target.value = ""
    if (!file) return
    if (isFileTooLarge(file)) {
      setUploadError("파일이 너무 큽니다. 10MB 이하 이미지를 선택해주세요.")
      return
    }
    setUploading(true)
    setUploadError(null)
    try {
      // 배경 이미지는 좀 더 크게 저장(1600px) — JPEG 로 변환
      const dataUrl = await processImageFile(file, { maxSize: 1600, quality: 0.82 })
      onChange({ bgImageUrl: dataUrl })
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "이미지 처리 중 오류가 발생했습니다.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

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
                <span className="text-[10px] text-white/70">
                  {isUserUploaded ? "내가 업로드한 이미지" : "AI 생성 이미지"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleUploadClick}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/20 hover:bg-white/30 text-white text-[10px] font-medium transition-colors"
                >
                  <Upload className="w-3 h-3" />
                  변경
                </button>
                <button
                  onClick={() => onChange({ bgImageUrl: undefined })}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/80 hover:bg-red-500 text-white text-[10px] font-medium transition-colors"
                >
                  <ImageOff className="w-3 h-3" />
                  제거
                </button>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-white/30">이미지를 제거하면 아래 프리셋 색상이 표시됩니다</p>
        </div>
      )}

      {/* 배경 이미지 업로드 (이미지가 없을 때) */}
      {!slide.bgImageUrl && (
        <div className="space-y-2">
          <p className="text-xs text-white/50 font-semibold uppercase tracking-wider">내 이미지 업로드</p>
          <button
            onClick={handleUploadClick}
            disabled={uploading}
            className="w-full flex flex-col items-center justify-center gap-1.5 py-5 rounded-lg border border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 transition-all disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 text-white/60 animate-spin" />
                <span className="text-[11px] text-white/50">이미지 처리 중...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 text-white/60" />
                <span className="text-[11px] text-white/60 font-medium">직접 찍은 배경/제품 사진 올리기</span>
                <span className="text-[10px] text-white/30">JPG · PNG · 최대 10MB</span>
              </>
            )}
          </button>
          {uploadError && (
            <p className="text-[11px] text-red-400">{uploadError}</p>
          )}
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

// ─── 제품 이미지 탭 ───────────────────────────────────────────
function ProductImageTab({ slide, onChange }: { slide: Slide; onChange: (u: Partial<Slide>) => void }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const position = slide.productImagePosition ?? "top"
  const size = slide.productImageSize ?? "md"

  const handleUploadClick = () => {
    setUploadError(null)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (isFileTooLarge(file)) {
      setUploadError("파일이 너무 큽니다. 10MB 이하 이미지를 선택해주세요.")
      return
    }
    setUploading(true)
    setUploadError(null)
    try {
      // 제품 이미지는 투명 배경이 중요할 수 있으므로 PNG 유지
      const isPng = file.type === "image/png"
      const dataUrl = await processImageFile(file, {
        maxSize: 1200,
        quality: 0.85,
        preservePng: isPng,
      })
      onChange({
        productImageUrl: dataUrl,
        // 기본 위치/크기가 없으면 채워줌
        productImagePosition: slide.productImagePosition ?? "top",
        productImageSize: slide.productImageSize ?? "md",
      })
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "이미지 처리 중 오류가 발생했습니다.")
    } finally {
      setUploading(false)
    }
  }

  const positionOptions: { value: ProductImagePosition; label: string }[] = [
    { value: "top", label: "위" },
    { value: "center", label: "가운데" },
    { value: "bottom", label: "아래" },
  ]

  const sizeOptions: { value: ProductImageSize; label: string }[] = [
    { value: "sm", label: "작게" },
    { value: "md", label: "보통" },
    { value: "lg", label: "크게" },
  ]

  return (
    <div className="p-4 space-y-5">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 업로드 / 미리보기 */}
      {!slide.productImageUrl ? (
        <div className="space-y-2">
          <Label className="text-xs text-white/50 font-semibold uppercase tracking-wider">
            제품 이미지
          </Label>
          <button
            onClick={handleUploadClick}
            disabled={uploading}
            className="w-full flex flex-col items-center justify-center gap-1.5 py-8 rounded-lg border border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 transition-all disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 text-white/60 animate-spin" />
                <span className="text-xs text-white/50">이미지 처리 중...</span>
              </>
            ) : (
              <>
                <Package className="w-5 h-5 text-white/60" />
                <span className="text-xs text-white/70 font-medium">제품 사진 올리기</span>
                <span className="text-[10px] text-white/30">JPG · PNG · 최대 10MB</span>
              </>
            )}
          </button>
          {uploadError && <p className="text-[11px] text-red-400">{uploadError}</p>}
          <p className="text-[11px] text-white/30 leading-relaxed">
            배경 위에 제품 이미지가 텍스트와 함께 표시됩니다.
            투명 배경(PNG)을 그대로 유지합니다.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-white/50 font-semibold uppercase tracking-wider">제품 이미지</Label>
            <button
              onClick={() => onChange({ productImageUrl: undefined })}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/80 hover:bg-red-500 text-white text-[10px] font-medium transition-colors"
            >
              <ImageOff className="w-3 h-3" />
              제거
            </button>
          </div>
          <div className="relative rounded-lg overflow-hidden border border-white/15 bg-[repeating-conic-gradient(#222_0%_25%,#333_0%_50%)] bg-[length:16px_16px]">
            <img
              src={slide.productImageUrl}
              alt="제품 이미지"
              className="w-full h-36 object-contain p-2"
            />
          </div>
          <button
            onClick={handleUploadClick}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white/80 text-xs font-medium transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                처리 중...
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                다른 이미지로 변경
              </>
            )}
          </button>
          {uploadError && <p className="text-[11px] text-red-400">{uploadError}</p>}
        </div>
      )}

      {/* 위치 / 크기 조정 (이미지가 있을 때만) */}
      {slide.productImageUrl && (
        <>
          <div className="space-y-2">
            <p className="text-xs text-white/50 font-semibold uppercase tracking-wider">위치</p>
            <div className="grid grid-cols-3 gap-1.5">
              {positionOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onChange({ productImagePosition: value })}
                  className={cn(
                    "py-2 rounded-lg text-xs font-medium border transition-all",
                    position === value
                      ? "border-primary/60 bg-primary/15 text-primary"
                      : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-white/30">텍스트와 겹치지 않게 위치를 선택하세요</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-white/50 font-semibold uppercase tracking-wider">크기</p>
            <div className="grid grid-cols-3 gap-1.5">
              {sizeOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onChange({ productImageSize: value })}
                  className={cn(
                    "py-2 rounded-lg text-xs font-medium border transition-all",
                    size === value
                      ? "border-primary/60 bg-primary/15 text-primary"
                      : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-white/30">
              슬라이드 너비의 약 {PRODUCT_IMAGE_SIZE_MAP[size]}%
            </p>
          </div>
        </>
      )}
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

  const verticalAlignOptions: { value: VerticalAlign; icon: React.ReactNode; label: string }[] = [
    { value: "top",    icon: <AlignStartVertical  className="w-4 h-4" />, label: "위" },
    { value: "middle", icon: <AlignCenterVertical className="w-4 h-4" />, label: "중앙" },
    { value: "bottom", icon: <AlignEndVertical    className="w-4 h-4" />, label: "아래" },
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
        {/* 수평 정렬 */}
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
        {/* 수직 위치 */}
        <div className="grid grid-cols-3 gap-1.5 mt-1.5">
          {verticalAlignOptions.map(({ value, icon, label }) => (
            <button
              key={value}
              onClick={() => onChange({ verticalAlign: value })}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 rounded-lg border transition-all text-[10px] font-medium",
                (slide.verticalAlign ?? "middle") === value
                  ? "border-primary/60 bg-primary/15 text-primary"
                  : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70"
              )}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
