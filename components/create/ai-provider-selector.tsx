"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Settings2, Key, Check, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import type { AIProvider } from "@/lib/ai-providers"

interface AIProviderSelectorProps {
  provider: AIProvider
  apiKey: string
  onProviderChange: (provider: AIProvider) => void
  onApiKeyChange: (key: string) => void
}

const providers = [
  {
    id: "gemini" as AIProvider,
    name: "Gemini Flash",
    desc: "무료 · 빠름",
    badge: "FREE",
    badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
    docsUrl: "https://aistudio.google.com/app/apikey",
    docsLabel: "Google AI Studio에서 무료 발급",
    placeholder: "AIza...",
  },
  {
    id: "claude" as AIProvider,
    name: "Claude Haiku",
    desc: "높은 품질 · 유료",
    badge: "PAID",
    badgeColor: "bg-violet-100 text-violet-700 border-violet-200",
    docsUrl: "https://console.anthropic.com/",
    docsLabel: "Anthropic Console에서 발급",
    placeholder: "sk-ant-...",
  },
]

export function AIProviderSelector({
  provider,
  apiKey,
  onProviderChange,
  onApiKeyChange,
}: AIProviderSelectorProps) {
  const [expanded, setExpanded] = useState(false)
  const [inputValue, setInputValue] = useState(apiKey)
  const [saved, setSaved] = useState(false)

  const current = providers.find((p) => p.id === provider)!

  const handleSaveKey = () => {
    onApiKeyChange(inputValue)
    try {
      localStorage.setItem(`ai-key-${provider}`, inputValue)
    } catch {}
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleProviderChange = (next: AIProvider) => {
    onProviderChange(next)
    // 저장된 키 불러오기
    try {
      const saved = localStorage.getItem(`ai-key-${next}`) ?? ""
      setInputValue(saved)
      onApiKeyChange(saved)
    } catch {}
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* 헤더 토글 */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-black/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Settings2 className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-foreground">AI 모델</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">{current.name}</span>
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded border",
                  current.badgeColor
                )}
              >
                {current.badge}
              </span>
              {apiKey && (
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
          {/* Provider 선택 */}
          <div className="pt-4 grid grid-cols-2 gap-3">
            {providers.map((p) => (
              <button
                key={p.id}
                onClick={() => handleProviderChange(p.id)}
                className={cn(
                  "flex flex-col items-start gap-1 p-3 rounded-xl border-2 transition-all text-left",
                  provider === p.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 bg-transparent"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-bold text-foreground">{p.name}</span>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded border",
                      p.badgeColor
                    )}
                  >
                    {p.badge}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{p.desc}</span>
                {provider === p.id && (
                  <div className="w-full flex justify-end">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* API 키 입력 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Key className="w-3 h-3" />
                {current.name} API 키
              </label>
              <a
                href={current.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                {current.docsLabel}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={current.placeholder}
                className="flex-1 h-9 px-3 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 font-mono"
              />
              <button
                onClick={handleSaveKey}
                disabled={!inputValue}
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
              키는 브라우저에만 저장되며 서버로 전송되지 않습니다. API 키 없이도 데모 모드로 사용 가능해요.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
