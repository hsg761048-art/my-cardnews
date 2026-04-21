"use client"

import { useState, useEffect } from "react"
import { CreateHeader } from "@/components/create/create-header"
import { InputModeSelector } from "@/components/create/input-mode-selector"
import { UrlInputMode } from "@/components/create/url-input-mode"
import { ChatInputMode } from "@/components/create/chat-input-mode"
import { FormInputMode } from "@/components/create/form-input-mode"
import { GeneratingOverlay } from "@/components/create/generating-overlay"
import { AIProviderSelector } from "@/components/create/ai-provider-selector"
import { WatercolorBackground } from "@/components/ui/watercolor-background"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Palette, ChevronRight } from "lucide-react"
import Link from "next/link"
import type { AIProvider } from "@/lib/ai-providers"
import type { BrandKitData } from "@/app/brand-kit/page"

export type InputMode = "url" | "chat" | "form"

// 입력 모드별 유저 입력 → API 호출용 문자열 변환
export interface RawInput {
  mode: InputMode
  userPrompt: string  // AI에게 넘길 텍스트
}

export default function CreatePage() {
  const [selectedMode, setSelectedMode] = useState<InputMode>("chat")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

  // AI Provider 설정
  const [provider, setProvider] = useState<AIProvider>("gemini")
  const [apiKey, setApiKey] = useState("")

  // 브랜드 키트 상태
  const [useBrandKit, setUseBrandKit] = useState(false)
  const [brandKit, setBrandKit] = useState<BrandKitData | null>(null)

  // 저장된 API 키 불러오기
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`ai-key-${provider}`) ?? ""
      setApiKey(saved)
    } catch {}
  }, [provider])

  // 브랜드 키트 + 토글 상태 불러오기
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nuance-brand-kit")
      if (saved) {
        const parsed = JSON.parse(saved) as BrandKitData
        setBrandKit(parsed)
      }
      // 마지막 토글 상태 복원
      const toggleSaved = localStorage.getItem("brand-kit-toggle")
      if (toggleSaved === "true" && saved) {
        setUseBrandKit(true)
      }
    } catch {}
  }, [])

  // 토글 변경 시 localStorage에 저장
  const handleBrandKitToggle = (val: boolean) => {
    setUseBrandKit(val)
    try {
      localStorage.setItem("brand-kit-toggle", val ? "true" : "false")
    } catch {}
  }

  const handleGenerate = async (raw: RawInput) => {
    setIsGenerating(true)
    setGenerateError(null)

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: raw.mode,
          userPrompt: raw.userPrompt,
          provider,
          apiKey: apiKey || undefined,
          // 폴백용으로 두 키 모두 전달
          geminiApiKey: (() => { try { return localStorage.getItem("ai-key-gemini") || undefined } catch { return undefined } })(),
          claudeApiKey: (() => { try { return localStorage.getItem("ai-key-claude") || undefined } catch { return undefined } })(),
          slideCount: 5,
          // 브랜드 키트 토글이 ON이고 키트가 있을 때만 전달
          brandKit: useBrandKit && brandKit
            ? {
                primaryColor: brandKit.primaryColor,
                secondaryColor: brandKit.secondaryColor,
                accentColor: brandKit.accentColor,
                font: brandKit.font,
                voiceStyle: brandKit.voiceStyle,
              }
            : undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "생성 실패")
      }

      const data = await res.json()

      // 폴백 발생 시 알림 (예: Gemini 과부하 → Claude로 대신 생성)
      const usedProvider = data._fallback ?? provider
      if (data._fallback) {
        const fallbackName = data._fallback === "claude" ? "Claude" : "Gemini"
        console.info(`[폴백] ${provider} 실패 → ${fallbackName}로 생성 완료`)
        // 에러 대신 가벼운 안내 표시 (생성은 성공이므로 진행)
        setGenerateError(`⚡ ${provider === "gemini" ? "Gemini" : "Claude"} 과부하로 ${fallbackName}가 대신 생성했어요.`)
        setTimeout(() => setGenerateError(null), 4000)
      }

      // 원본 주제 저장 → 결과 페이지에서 이미지 검색 앵커로 사용
      localStorage.setItem("card-original-topic", raw.userPrompt.trim())
      // 브랜드 키트 활성 여부 저장 → 결과 페이지에서 이미지 로딩 스킵 판단용
      localStorage.setItem("brand-kit-active", useBrandKit && !!brandKit ? "true" : "false")
      // 새 카드뉴스이므로 이전 라이브러리 연결 초기화
      localStorage.removeItem("library-current-id")
      localStorage.removeItem("library-editor-slides")

      // 브랜드 키트 폰트명 → GeneratedDesign fontFamily 매핑
      const mapFont = (font: string): string => {
        if (font.includes("Pretendard")) return "pretendard"
        if (font.includes("Nanum Myeongjo") || font.includes("Playfair")) return "nanum-myeongjo"
        if (font.includes("Nanum Gothic")) return "nanum-gothic"
        return "noto-sans" // Noto Sans KR, Inter, DM Sans, Space Grotesk → noto-sans 계열로 처리
      }

      // 브랜드 키트 색상·폰트 강제 적용 함수
      // GeneratedSlide 포맷: design.background / design.titleColor 등
      const applyBrandKit = (slides: unknown[]) => {
        if (!useBrandKit || !brandKit || !Array.isArray(slides)) return slides
        return slides.map((slide: unknown) => {
          const s = slide as Record<string, unknown>
          const design = (s.design ?? {}) as Record<string, unknown>
          return {
            ...s,
            design: {
              ...design,
              background: brandKit.primaryColor,
              titleColor: brandKit.secondaryColor,
              textColor: brandKit.secondaryColor,
              ctaBg: brandKit.accentColor,
              ctaText: brandKit.primaryColor,
              fontFamily: mapFont(brandKit.font),
            },
          }
        })
      }

      const slidesByStyle = data.slidesByStyle ?? {}
      const brandApplied = {
        minimal: applyBrandKit(slidesByStyle.minimal ?? []),
        bold:    applyBrandKit(slidesByStyle.bold ?? []),
        elegant: applyBrandKit(slidesByStyle.elegant ?? []),
      }

      // 생성된 슬라이드를 localStorage에 저장 → 에디터/결과 페이지가 읽음
      localStorage.setItem(
        "generated-card-slides",
        JSON.stringify({
          slidesByStyle: brandApplied,
          slides: brandApplied.minimal,
          provider: usedProvider,
          generatedAt: Date.now(),
        })
      )

      // 결과 페이지로 이동
      const title = encodeURIComponent(data.title ?? "AI 생성 카드뉴스")
      const mainCopy = encodeURIComponent(data.mainCopy ?? "")
      window.location.href = `/results?title=${title}&mainCopy=${mainCopy}`
    } catch (err) {
      const message = err instanceof Error ? err.message : "알 수 없는 오류가 발생했어요."
      setGenerateError(message)
      setIsGenerating(false)
    }
  }

  return (
    <div className="create-page min-h-screen bg-background relative overflow-hidden">
      <WatercolorBackground interactive intensity="light" />

      <div className="relative z-10">
        <CreateHeader />

        <main className="max-w-3xl mx-auto px-6 md:px-8 py-8 pt-28">
          {/* Page Title */}
          <div className="mb-10 text-center md:text-left">
            <span className="inline-block px-4 py-2 rounded-full glass-card text-base font-bold text-lime-600 mb-4">
              새 카드뉴스 만들기
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              아이디어의{" "}
              <span className="bg-gradient-to-r from-primary via-pink-400 to-sky-400 bg-clip-text text-transparent">
                외모
              </span>
              를 바꿔드립니다
            </h1>
            <p className="text-foreground/70 font-medium text-xl mt-4">
              어떻게 만들고 싶으세요? 방법을 골라보세요 👇
            </p>
          </div>

          {/* AI Provider 선택 */}
          <div className="mb-8">
            <AIProviderSelector
              provider={provider}
              apiKey={apiKey}
              onProviderChange={setProvider}
              onApiKeyChange={setApiKey}
            />
          </div>

          {/* 브랜드 키트 선택 적용 토글 */}
          <div className="mb-8">
            <div className="glass-card rounded-2xl p-5 flex items-center justify-between gap-4">
              {/* 왼쪽: 아이콘 + 설명 */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-pink-400/20 flex items-center justify-center">
                  <Palette className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">브랜드 키트 적용</p>
                  {brandKit ? (
                    <p className="text-xs text-foreground/50 truncate">
                      AI가 브랜드 컬러·폰트를 디자인에 반영합니다
                    </p>
                  ) : (
                    <p className="text-xs text-foreground/40 truncate">
                      설정된 브랜드 키트가 없어요 —{" "}
                      <Link href="/brand-kit" className="underline underline-offset-2 hover:text-primary transition-colors">
                        지금 설정하기
                      </Link>
                    </p>
                  )}
                </div>
              </div>

              {/* 오른쪽: 토글 + 색상 미리보기 */}
              <div className="flex items-center gap-3 shrink-0">
                {/* 브랜드 컬러 미리보기 점 (키트 있을 때만) */}
                {brandKit && (
                  <div className="flex items-center gap-1">
                    <span
                      className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: brandKit.primaryColor }}
                      title="메인 컬러"
                    />
                    <span
                      className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: brandKit.accentColor }}
                      title="강조 컬러"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Label htmlFor="brand-kit-toggle" className="text-xs font-medium text-foreground/60 select-none">
                    {useBrandKit ? "적용 중" : "미적용"}
                  </Label>
                  <Switch
                    id="brand-kit-toggle"
                    checked={useBrandKit}
                    onCheckedChange={handleBrandKitToggle}
                    disabled={!brandKit}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>

                {/* 브랜드 키트 설정 바로가기 */}
                <Link
                  href="/brand-kit"
                  className="text-foreground/30 hover:text-primary transition-colors"
                  title="브랜드 키트 설정"
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* 브랜드 키트 활성화 시 상세 힌트 */}
            {useBrandKit && brandKit && (
              <div className="mt-2 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/15 flex items-center gap-2">
                <span className="text-xs text-primary/80 font-medium">
                  ✦ AI가 색상·폰트·배경 이미지 프롬프트를 브랜드 키트 기준으로 맞춤 생성합니다
                </span>
              </div>
            )}
          </div>

          {/* Mode Selector */}
          <InputModeSelector
            selectedMode={selectedMode}
            onModeChange={setSelectedMode}
          />

          {/* 에러 / 폴백 안내 메시지 */}
          {generateError && (
            <div className={`mt-4 p-4 rounded-xl text-sm font-medium ${
              generateError.startsWith("⚡")
                ? "bg-blue-50 border border-blue-200 text-blue-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}>
              {generateError.startsWith("⚡") ? "" : "⚠️ "}{generateError}
            </div>
          )}

          {/* Input Area */}
          <div className="mt-8">
            {selectedMode === "url" && (
              <UrlInputMode onGenerate={(p) => handleGenerate({ mode: "url", userPrompt: p })} />
            )}
            {selectedMode === "chat" && (
              <ChatInputMode onGenerate={(p) => handleGenerate({ mode: "chat", userPrompt: p })} />
            )}
            {selectedMode === "form" && (
              <FormInputMode onGenerate={(p) => handleGenerate({ mode: "form", userPrompt: p })} />
            )}
          </div>
        </main>
      </div>

      {/* Generating Overlay */}
      {isGenerating && <GeneratingOverlay />}
    </div>
  )
}
