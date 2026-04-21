"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link2, ArrowRight, Globe, FileText, Sparkles, AlertCircle, RotateCcw, Save } from "lucide-react"

interface UrlInputModeProps {
  onGenerate: (userPrompt: string) => void
}

const STORAGE_KEY = "draft-url"

export function UrlInputMode({ onGenerate }: UrlInputModeProps) {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [fetchStatus, setFetchStatus] = useState<string>("")
  const [savedAt, setSavedAt] = useState<string | null>(null)

  // ── 마운트 시 저장된 내용 복원 ────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const { url: savedUrl, savedAt: at } = JSON.parse(saved)
        if (savedUrl) {
          setUrl(savedUrl)
          setSavedAt(at)
        }
      }
    } catch {}
  }, [])

  // ── 내용 변경 시 자동 저장 ───────────────────────────────────
  useEffect(() => {
    if (!url.trim()) return
    const at = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ url, savedAt: at }))
      setSavedAt(at)
    } catch {}
  }, [url])

  // ── 초기화 ───────────────────────────────────────────────────
  const handleReset = () => {
    setUrl("")
    setSavedAt(null)
    setFetchError(null)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setIsLoading(true)
    setFetchError(null)
    setFetchStatus("URL에서 내용을 가져오는 중...")

    try {
      const res = await fetch("/api/fetch-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        console.warn("[url-input] URL fetch 실패, URL만 전달:", data.error)
        setFetchStatus("직접 접근 불가 → AI에게 URL 전달 중...")
        onGenerate(`다음 URL의 내용을 바탕으로 카드뉴스를 만들어주세요: ${url.trim()}`)
        return
      }

      setFetchStatus(`${data.content.length}자 추출 완료 → AI 생성 중...`)
      onGenerate(
        `다음은 URL(${url.trim()})에서 가져온 내용입니다. 이 내용을 바탕으로 카드뉴스를 만들어주세요:\n\n${data.content}`
      )
    } catch {
      setFetchError("URL 가져오기 중 오류가 발생했어요.")
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg shadow-lime-100/50 p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center shadow-md shadow-lime-200">
            <Link2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-800">URL → 카드뉴스 변환</h2>
            <p className="text-base text-slate-500">블로그나 기사 링크를 붙여넣으세요</p>
          </div>
          {/* 저장 상태 + 초기화 */}
          <div className="flex items-center gap-2">
            {savedAt && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Save className="w-3 h-3" />
                {savedAt} 저장
              </span>
            )}
            {url && (
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="url"
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-11 h-13 rounded-xl text-base bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-300 focus:border-lime-400 focus:ring-lime-400/20 focus:bg-white transition-all"
            />
          </div>

          {fetchError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {fetchError}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-13 rounded-xl bg-lime-500 hover:bg-lime-600 text-slate-900 font-extrabold text-base shadow-lg shadow-lime-400/50 hover:shadow-xl hover:shadow-lime-400/60 transition-all border-0"
            style={{ height: "52px" }}
            disabled={!url.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin mr-2" />
                {fetchStatus || "URL 분석 중..."}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                카드뉴스로 변환하기
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Supported Sources */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">지원 소스</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "블로그 글", color: "text-lime-600 bg-lime-50 border-lime-100" },
            { label: "뉴스 기사", color: "text-sky-600 bg-sky-50 border-sky-100" },
            { label: "보도자료", color: "text-pink-600 bg-pink-50 border-pink-100" },
            { label: "문서", color: "text-violet-600 bg-violet-50 border-violet-100" },
          ].map((source) => (
            <div key={source.label} className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl border ${source.color}`}>
              <FileText className="w-3.5 h-3.5" />
              {source.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
