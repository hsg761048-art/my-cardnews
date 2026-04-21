"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"

const loadingMessages = [
  { text: "콘텐츠 구조 분석 중...", duration: 1000, color: "text-primary" },
  { text: "카피라이팅 최적화 중...", duration: 1200, color: "text-pink-400" },
  { text: "디자인 레이아웃 생성 중...", duration: 1500, color: "text-sky-400" },
  { text: "브랜드 보이스 적용 중...", duration: 1000, color: "text-emerald-400" },
  { text: "3가지 스타일 시안 준비 중...", duration: 800, color: "text-amber-400" },
]

export function GeneratingOverlay() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const totalDuration = loadingMessages.reduce((acc, msg) => acc + msg.duration, 0)
    let elapsed = 0

    const interval = setInterval(() => {
      elapsed += 100
      setProgress((elapsed / totalDuration) * 100)
    }, 100)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (currentMessageIndex >= loadingMessages.length - 1) return

    const timeout = setTimeout(() => {
      setCurrentMessageIndex((prev) => prev + 1)
    }, loadingMessages[currentMessageIndex].duration)

    return () => clearTimeout(timeout)
  }, [currentMessageIndex])

  return (
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex items-center justify-center">
      {/* Background watercolor blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-blob-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl animate-blob-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-sky-400/20 rounded-full blur-3xl animate-blob-float-slow" />
      </div>
      
      <div className="relative max-w-md w-full mx-6 text-center space-y-10">
        {/* Watercolor logo animation */}
        <div className="relative w-28 h-28 mx-auto">
          {/* Outer glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-primary via-pink-400 to-sky-400 rounded-full blur-2xl opacity-40 animate-soft-pulse" />
          
          {/* Main logo */}
          <div className="relative w-28 h-28 rounded-full glass-card flex items-center justify-center shadow-2xl">
            <Sparkles className="w-10 h-10 text-primary animate-soft-pulse" />
          </div>
          
          {/* Spinning rings */}
          <div className="absolute -inset-2 rounded-full border-2 border-primary/30 animate-spin" style={{ animationDuration: '3s' }} />
          <div className="absolute -inset-4 rounded-full border border-pink-400/20 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
          <div className="absolute -inset-6 rounded-full border border-sky-400/10 animate-spin" style={{ animationDuration: '5s' }} />
        </div>

        {/* Progress Messages */}
        <div className="space-y-6">
          <div className="h-14 flex flex-col justify-center relative">
            {loadingMessages.map((msg, idx) => (
              <p
                key={idx}
                className={cn(
                  "text-lg font-medium transition-all duration-500",
                  idx === currentMessageIndex
                    ? `opacity-100 translate-y-0 ${msg.color}`
                    : "opacity-0 absolute inset-x-0",
                  idx < currentMessageIndex && "-translate-y-4",
                  idx > currentMessageIndex && "translate-y-4"
                )}
              >
                {idx < currentMessageIndex ? (
                  <span className="text-emerald-400 flex items-center justify-center gap-2">
                    <span>&#10003;</span>
                    {msg.text.replace("...", "")}
                  </span>
                ) : (
                  msg.text
                )}
              </p>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 rounded-full glass-card overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary via-pink-400 to-sky-400 transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center gap-3">
            {loadingMessages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all duration-500",
                  idx <= currentMessageIndex 
                    ? `bg-gradient-to-r ${
                        idx === 0 ? "from-primary to-primary" :
                        idx === 1 ? "from-pink-400 to-pink-400" :
                        idx === 2 ? "from-sky-400 to-sky-400" :
                        idx === 3 ? "from-emerald-400 to-emerald-400" :
                        "from-amber-400 to-amber-400"
                      } scale-110` 
                    : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>

        {/* Tip */}
        <p className="text-sm text-muted-foreground">
          AI가 아름다운 카드뉴스를 만들고 있습니다
        </p>
      </div>
    </div>
  )
}
