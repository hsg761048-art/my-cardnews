"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, ArrowRight, Plus, X, Sparkles, RotateCcw, Save } from "lucide-react"

interface FormInputModeProps {
  onGenerate: (userPrompt: string) => void
}

const STORAGE_KEY = "draft-form"

const DEFAULT_STATE = {
  title: "",
  subtitle: "",
  mainCopy: "",
  benefits: [""],
  cta: "",
}

export function FormInputMode({ onGenerate }: FormInputModeProps) {
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [mainCopy, setMainCopy] = useState("")
  const [benefits, setBenefits] = useState<string[]>([""])
  const [cta, setCta] = useState("")
  const [savedAt, setSavedAt] = useState<string | null>(null)

  // ── 마운트 시 저장된 내용 복원 ────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const { data, savedAt: at } = JSON.parse(saved)
        if (data?.title || data?.mainCopy) {
          setTitle(data.title ?? "")
          setSubtitle(data.subtitle ?? "")
          setMainCopy(data.mainCopy ?? "")
          setBenefits(data.benefits?.length ? data.benefits : [""])
          setCta(data.cta ?? "")
          setSavedAt(at)
        }
      }
    } catch {}
  }, [])

  // ── 내용 변경 시 자동 저장 ───────────────────────────────────
  useEffect(() => {
    if (!title.trim() && !mainCopy.trim()) return
    const at = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        data: { title, subtitle, mainCopy, benefits, cta },
        savedAt: at,
      }))
      setSavedAt(at)
    } catch {}
  }, [title, subtitle, mainCopy, benefits, cta])

  // ── 초기화 ───────────────────────────────────────────────────
  const handleReset = () => {
    setTitle(DEFAULT_STATE.title)
    setSubtitle(DEFAULT_STATE.subtitle)
    setMainCopy(DEFAULT_STATE.mainCopy)
    setBenefits(DEFAULT_STATE.benefits)
    setCta(DEFAULT_STATE.cta)
    setSavedAt(null)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }

  const addBenefit = () => {
    if (benefits.length < 5) setBenefits([...benefits, ""])
  }

  const removeBenefit = (index: number) => {
    if (benefits.length > 1) setBenefits(benefits.filter((_, i) => i !== index))
  }

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...benefits]
    newBenefits[index] = value
    setBenefits(newBenefits)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !mainCopy.trim()) return

    const filledBenefits = benefits.filter(b => b.trim())
    const parts = [
      `주제: ${title.trim()}`,
      subtitle.trim() ? `서브타이틀: ${subtitle.trim()}` : null,
      `핵심 내용: ${mainCopy.trim()}`,
      filledBenefits.length > 0
        ? `주요 포인트:\n${filledBenefits.map((b, i) => `${i + 1}. ${b}`).join("\n")}`
        : null,
      cta.trim() ? `CTA 버튼: ${cta.trim()}` : null,
    ].filter(Boolean)

    onGenerate(parts.join("\n\n"))
  }

  const isValid = title.trim() && mainCopy.trim()
  const hasContent = title || subtitle || mainCopy || benefits.some(b => b) || cta

  const inputClass =
    "rounded-xl bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-300 focus:border-sky-400 focus:ring-sky-400/20 focus:bg-white transition-all"

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg shadow-sky-100/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-8 py-5 border-b border-slate-100 bg-gradient-to-r from-sky-50/80 to-cyan-50/80">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center shadow-md shadow-sky-200">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-800">내용 입력하면 디자인은 AI가</h2>
          <p className="text-base text-slate-500">폼을 채우면 AI가 전문가급으로 디자인해드려요</p>
        </div>
        {/* 저장 상태 + 초기화 */}
        <div className="flex items-center gap-2">
          {savedAt && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Save className="w-3 h-3" />
              {savedAt} 저장
            </span>
          )}
          {hasContent && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 border border-red-200 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              초기화
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-5">
        {/* Title */}
        <div className="space-y-2">
          <Label className="text-base font-semibold text-slate-700">
            메인 타이틀 <span className="text-pink-400">*</span>
          </Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: NEW ARRIVAL"
            className={`h-12 ${inputClass}`}
          />
        </div>

        {/* Subtitle */}
        <div className="space-y-2">
          <Label className="text-base font-semibold text-slate-700">
            서브 타이틀 <span className="text-slate-300 font-normal">(선택)</span>
          </Label>
          <Input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="예: 특별한 시작을 위해"
            className={`h-12 ${inputClass}`}
          />
        </div>

        {/* Main Copy */}
        <div className="space-y-2">
          <Label className="text-base font-semibold text-slate-700">
            메인 내용 <span className="text-pink-400">*</span>
          </Label>
          <Textarea
            value={mainCopy}
            onChange={(e) => setMainCopy(e.target.value)}
            placeholder="카드뉴스의 핵심 내용을 작성하세요..."
            className={`min-h-[120px] resize-none ${inputClass}`}
          />
        </div>

        {/* Benefits */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold text-slate-700">주요 혜택 / 포인트</Label>
            <button
              type="button"
              onClick={addBenefit}
              disabled={benefits.length >= 5}
              className="flex items-center gap-1 text-xs text-sky-500 font-medium hover:text-sky-600 disabled:opacity-30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              항목 추가
            </button>
          </div>
          <div className="space-y-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-2 items-center">
                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </span>
                <Input
                  value={benefit}
                  onChange={(e) => updateBenefit(index, e.target.value)}
                  placeholder={`포인트 ${index + 1}`}
                  className={`h-10 ${inputClass}`}
                />
                {benefits.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBenefit(index)}
                    className="w-6 h-6 rounded-full bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center flex-shrink-0 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-2">
          <Label className="text-base font-semibold text-slate-700">
            CTA 텍스트 <span className="text-slate-300 font-normal">(선택)</span>
          </Label>
          <Input
            value={cta}
            onChange={(e) => setCta(e.target.value)}
            placeholder="예: 지금 확인하기"
            className={`h-12 ${inputClass}`}
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full h-12 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-slate-900 font-extrabold text-base shadow-lg shadow-sky-300 hover:shadow-xl transition-all border-0 disabled:opacity-40"
          disabled={!isValid}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          카드뉴스 생성하기
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>
    </div>
  )
}
