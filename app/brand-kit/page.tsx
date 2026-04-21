"use client"

import { useState, useEffect } from "react"
import { CreateHeader } from "@/components/create/create-header"
import { LogoUploader } from "@/components/brand-kit/logo-uploader"
import { ColorPicker } from "@/components/brand-kit/color-picker"
import { FontSelector } from "@/components/brand-kit/font-selector"
import { BrandVoice } from "@/components/brand-kit/brand-voice"
import { Button } from "@/components/ui/button"
import { WatercolorBackground } from "@/components/ui/watercolor-background"
import { Check, ArrowRight, Palette, RotateCcw } from "lucide-react"
import Link from "next/link"

export interface BrandKitData {
  logo: string | null
  primaryColor: string
  secondaryColor: string
  accentColor: string
  font: string
  voiceStyle: string
}

const defaultBrandKit: BrandKitData = {
  logo: null,
  primaryColor: "#A78BFA",
  secondaryColor: "#FFFFFF",
  accentColor: "#F472B6",
  font: "Noto Sans KR",
  voiceStyle: "professional",
}

export default function BrandKitPage() {
  const [brandKit, setBrandKit] = useState<BrandKitData>(defaultBrandKit)
  const [isSaved, setIsSaved] = useState(false)

  // 페이지 열 때 저장된 브랜드 키트 불러오기
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nuance-brand-kit")
      if (saved) {
        const parsed = JSON.parse(saved)
        setBrandKit({ ...defaultBrandKit, ...parsed })
      }
    } catch {}
  }, [])

  const updateBrandKit = (updates: Partial<BrandKitData>) => {
    setBrandKit(prev => ({ ...prev, ...updates }))
    setIsSaved(false)
  }

  const handleSave = () => {
    localStorage.setItem("nuance-brand-kit", JSON.stringify(brandKit))
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const handleReset = () => {
    if (confirm("브랜드 키트를 초기화할까요? 저장된 설정이 모두 삭제됩니다.")) {
      localStorage.removeItem("nuance-brand-kit")
      setBrandKit(defaultBrandKit)
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <WatercolorBackground intensity="light" />
      
      <div className="relative z-10">
        <CreateHeader variant="brand-kit" />

        <main className="max-w-3xl mx-auto px-6 md:px-8 py-8 pt-28">
          {/* Header */}
          <div className="mb-10 text-center md:text-left">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-base font-bold text-white mb-4">
              <Palette className="w-4 h-4" />
              브랜드 설정
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
              브랜드 키트 <span className="bg-gradient-to-r from-primary via-pink-400 to-sky-400 bg-clip-text text-transparent">설정</span>
            </h1>
            <p className="text-slate-600 font-medium text-lg mt-3">
              한 번 설정하면 모든 카드뉴스에 자동 적용됩니다
            </p>
          </div>

          {/* Settings */}
          <div className="space-y-6">
            {/* Logo Upload */}
            <LogoUploader
              logo={brandKit.logo}
              onLogoChange={(logo) => updateBrandKit({ logo })}
            />

            {/* Colors */}
            <div className="glass-card rounded-2xl p-6 md:p-8">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-pink-400 flex items-center justify-center">
                  <Palette className="w-4 h-4 text-white" />
                </div>
                브랜드 컬러
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <ColorPicker
                  label="메인"
                  color={brandKit.primaryColor}
                  onChange={(color) => updateBrandKit({ primaryColor: color })}
                />
                <ColorPicker
                  label="서브"
                  color={brandKit.secondaryColor}
                  onChange={(color) => updateBrandKit({ secondaryColor: color })}
                />
                <ColorPicker
                  label="강조"
                  color={brandKit.accentColor}
                  onChange={(color) => updateBrandKit({ accentColor: color })}
                />
              </div>
            </div>

            {/* Font */}
            <FontSelector
              selectedFont={brandKit.font}
              onFontChange={(font) => updateBrandKit({ font })}
            />

            {/* Brand Voice */}
            <BrandVoice
              selectedVoice={brandKit.voiceStyle}
              onVoiceChange={(voiceStyle) => updateBrandKit({ voiceStyle })}
            />
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleSave}
              className="flex-1 h-12 rounded-full bg-gradient-to-r from-primary to-pink-400 hover:from-primary/90 hover:to-pink-400/90 text-white shadow-lg shadow-primary/25 transition-all duration-300"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  저장됨!
                </>
              ) : (
                "설정 저장"
              )}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="h-12 rounded-full border-red-200 text-red-400 hover:bg-red-50 hover:text-red-500 hover:border-red-300 transition-all"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              초기화
            </Button>
            <Button 
              variant="outline" 
              asChild 
              className="flex-1 h-12 rounded-full glass-card border-primary/20 hover:bg-primary/5 hover:border-primary/40"
            >
              <Link href="/create">
                카드뉴스 만들기
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Preview */}
          <div className="mt-12">
            <h2 className="text-lg font-bold text-slate-800 mb-5">미리보기</h2>
            <div className="glass-card rounded-2xl p-8">
              <div
                className="aspect-square max-w-xs mx-auto p-6 rounded-2xl flex flex-col justify-between shadow-2xl animate-ink-spread pointer-events-none select-none"
                style={{ backgroundColor: brandKit.primaryColor }}
              >
                <div>
                  {brandKit.logo ? (
                    <img
                      src={brandKit.logo}
                      alt="브랜드 로고"
                      className="h-8 object-contain"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-lg"
                      style={{ backgroundColor: brandKit.accentColor }}
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <p
                    className="text-base font-bold"
                    style={{ color: brandKit.secondaryColor, fontFamily: brandKit.font }}
                  >
                    서브타이틀
                  </p>
                  <p
                    className="text-3xl font-bold"
                    style={{ color: brandKit.secondaryColor, fontFamily: brandKit.font }}
                  >
                    메인 타이틀
                  </p>
                </div>
                <p
                  className="text-base font-bold px-4 py-2 rounded-full text-center"
                  style={{
                    backgroundColor: brandKit.accentColor,
                    color: brandKit.secondaryColor,
                    fontFamily: brandKit.font
                  }}
                >
                  지금 바로 시작하기 →
                </p>
              </div>
              <p className="text-center text-base font-semibold text-white mt-6">
                👆 클릭 불가 — 브랜드 키트 적용 미리보기
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
