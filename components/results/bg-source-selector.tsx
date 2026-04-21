"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Image as ImageIcon, Sparkles, Key, Check, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"

export type BgSource = "pexels" | "flux"

interface BgSourceSelectorProps {
  bgSource: BgSource
  fluxApiKey: string
  onBgSourceChange: (source: BgSource) => void
  onFluxApiKeyChange: (key: string) => void
}

const sources = [
  {
    id: "pexels" as BgSource,
    name: "Pexels",
    desc: "실사 사진 · 무료",
    badge: "FREE",
    badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
    detail: "내용과 일치하는 고품질 스톡 사진을 자동 검색합니다",
  },
  {
    id: "flux" as BgSource,
    name: "FLUX.1 Pro",
    desc: "AI 생성 이미지 · 유료",
    badge: "AI",
    badgeColor: "bg-violet-100 text-violet-700 border-violet-200",
    detail: "fal.ai를 통해 FLUX.1 Pro 모델로 슬라이드 내용에 딱 맞는 독창적인 AI 배경 이미지를 생성합니다",
  },
]

export function BgSourceSelector({
  bgSource,
  fluxApiKey,
  onBgSourceChange,
  onFluxApiKeyChange,
}: BgSourceSelectorProps) {
  const [expanded, setExpanded] = useState(false)
  const [keyInput, setKeyInput] = useState(fluxApiKey)
  const [saved, setSaved] = useState(false)

  // localStorage에서 FLUX 키 복원
  useEffect(() => {
    try {
      const stored = localStorage.getItem("bg-key-flux") ?? ""
      if (stored) {
        setKeyInput(stored)
        onFluxApiKeyChange(stored)
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSaveKey = () => {
    onFluxApiKeyChange(keyInput)
    try {
      localStorage.setItem("bg-key-flux", keyInput)
    } catch {}
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const current = sources.find((s) => s.id === bgSource)!

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* 헤더 토글 */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-black/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400/20 to-violet-400/20 flex items-center justify-center">
            {bgSource === "flux" ? (
              <Sparkles className="w-4 h-4 text-violet-500" />
            ) : (
              <ImageIcon className="w-4 h-4 text-sky-500" />
            )}
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-foreground">배경 이미지 소스</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">{current.name}</span>
              <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border", current.badgeColor)}>
                {current.badge}
              </span>
              {bgSource === "flux" && fluxApiKey && (
                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> 키 설정됨
                </span>
              )}
            </div>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* 확장 패널 */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-border/50">
          {/* 소스 선택 카드 */}
          <div className="pt-4 grid grid-cols-2 gap-3">
            {sources.map((s) => (
              <button
                key={s.id}
                onClick={() => onBgSourceChange(s.id)}
                className={cn(
                  "flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 transition-all text-left",
                  bgSource === s.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 bg-transparent"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-bold text-foreground">{s.name}</span>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border", s.badgeColor)}>
                    {s.badge}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{s.desc}</span>
                <span className="text-[11px] text-muted-foreground/70 leading-snug">{s.detail}</span>
                {bgSource === s.id && (
                  <div className="w-full flex justify-end mt-0.5">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* FLUX API 키 입력 (FLUX 선택 시에만) */}
          {bgSource === "flux" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Key className="w-3 h-3" />
                  fal.ai API 키
                </label>
                <a
                  href="https://fal.ai/dashboard/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  fal.ai에서 무료 발급
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:xxxx"
                  className="flex-1 h-9 px-3 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 font-mono"
                />
                <button
                  onClick={handleSaveKey}
                  disabled={!keyInput}
                  className={cn(
                    "h-9 px-4 rounded-lg text-xs font-bold transition-all",
                    saved
                      ? "bg-emerald-500 text-white"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
                  )}
                >
                  {saved ? <Check className="w-3.5 h-3.5" /> : "저장"}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                키는 브라우저에만 저장됩니다. FLUX.1 Pro는 이미지 1장당 약 $0.05 (fal.ai 기준).
              </p>

              {/* FLUX 경고: 키 없을 때 */}
              {!fluxApiKey && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
                  ⚠️ fal.ai API 키를 입력하고 저장해야 FLUX.1 Pro 이미지가 생성됩니다. 키가 없으면 Pexels로 자동 전환됩니다.
                </div>
              )}
            </div>
          )}

          {/* Pexels 안내 */}
          {bgSource === "pexels" && (
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-700">
              ✓ Pexels는 서버에 API 키가 설정되어 있어 별도 입력 없이 바로 사용 가능합니다.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
