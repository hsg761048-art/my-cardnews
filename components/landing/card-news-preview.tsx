"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

const demoSteps = [
  {
    type: "input",
    content: "신제품 출시 이벤트\n- 30% 할인\n- 배송\n- 리뷰 포인트 적립",
  },
  {
    type: "loading",
    messages: [
      "콘텐츠 구조 분석 중...",
      "카피라이팅 최적화 중...",
      "디자인 레이아웃 생성 중...",
      "브랜드 보이스 적용 중...",
    ],
  },
  {
    type: "result",
    cards: [
      { title: "NEW ARRIVAL", subtitle: "특별한 시작을 위해", highlight: "30% OFF", color: "bg-primary" },
      { title: "GRAND OPEN", subtitle: "놓치지 마세요", highlight: "배송", color: "bg-[#4DB6AC]" },
      { title: "SPECIAL GIFT", subtitle: "리뷰를 남겨주세요", highlight: "포인트 적립", color: "bg-[#64B5F6]" },
    ],
  },
]

export function CardNewsPreview() {
  const [currentStep, setCurrentStep] = useState(0)
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [typedText, setTypedText] = useState("")
  const [showCards, setShowCards] = useState(false)
  const [activeBlobs, setActiveBlobs] = useState([false, false, false])

  useEffect(() => {
    const inputText = demoSteps[0].content as string
    
    if (currentStep === 0 && typedText.length < inputText.length) {
      const timeout = setTimeout(() => {
        setTypedText(inputText.slice(0, typedText.length + 1))
      }, 30)
      return () => clearTimeout(timeout)
    }
    
    if (currentStep === 0 && typedText.length === inputText.length) {
      const timeout = setTimeout(() => setCurrentStep(1), 800)
      return () => clearTimeout(timeout)
    }
    
    if (currentStep === 1) {
      const messages = demoSteps[1].messages as string[]
      if (loadingMessageIndex < messages.length) {
        const timeout = setTimeout(() => {
          setLoadingMessageIndex(loadingMessageIndex + 1)
          // Activate blobs one by one
          setActiveBlobs(prev => {
            const next = [...prev]
            next[Math.min(loadingMessageIndex, 2)] = true
            return next
          })
        }, 800)
        return () => clearTimeout(timeout)
      } else {
        const timeout = setTimeout(() => setCurrentStep(2), 500)
        return () => clearTimeout(timeout)
      }
    }
    
    if (currentStep === 2 && !showCards) {
      setShowCards(true)
      const timeout = setTimeout(() => {
        setCurrentStep(0)
        setTypedText("")
        setLoadingMessageIndex(0)
        setShowCards(false)
        setActiveBlobs([false, false, false])
      }, 6000)
      return () => clearTimeout(timeout)
    }
  }, [currentStep, typedText, loadingMessageIndex, showCards])

  return (
    <div className="relative animate-soft-float">
      {/* Mist blobs behind the preview */}
      <div className="absolute -inset-12 pointer-events-none overflow-hidden">
        <div 
          className={cn(
            "absolute w-40 h-40 rounded-full blur-3xl transition-all duration-1000",
            activeBlobs[0] ? "opacity-50 scale-100" : "opacity-0 scale-50"
          )}
          style={{
            background: "var(--mist-soft-blue)",
            top: "-10%",
            left: "10%",
          }}
        />
        <div 
          className={cn(
            "absolute w-32 h-32 rounded-full blur-3xl transition-all duration-1000 delay-300",
            activeBlobs[1] ? "opacity-40 scale-100" : "opacity-0 scale-50"
          )}
          style={{
            background: "var(--mist-water-blue)",
            bottom: "20%",
            right: "-5%",
          }}
        />
        <div 
          className={cn(
            "absolute w-36 h-36 rounded-full blur-3xl transition-all duration-1000 delay-500",
            activeBlobs[2] ? "opacity-40 scale-100" : "opacity-0 scale-50"
          )}
          style={{
            background: "var(--mist-pale-cyan)",
            bottom: "-10%",
            left: "20%",
          }}
        />
      </div>
      
      {/* Main Frame Container */}
      <div className="relative glass-card rounded-3xl soft-shadow-lg overflow-hidden border border-white/40">
        {/* Browser Chrome */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/50 dark:bg-white/5 border-b border-white/30">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary/60" />
            <div className="w-3 h-3 rounded-full bg-[#4DB6AC]/60" />
            <div className="w-3 h-3 rounded-full bg-[#64B5F6]/60" />
          </div>
          <div className="flex-1 mx-4">
            <div className="h-7 bg-white/70 dark:bg-white/10 rounded-full px-4 flex items-center justify-center backdrop-blur-sm border border-white/40 soft-shadow">
              <span className="text-xs text-muted-foreground">cardnews.ai/create</span>
            </div>
          </div>
          <div className="w-12" />
        </div>

        {/* Content Area */}
        <div className="relative p-6 md:p-8 min-h-[380px] bg-white/40 dark:bg-white/5 backdrop-blur-sm">
          {/* Step 1: Input */}
          {currentStep === 0 && (
            <div className="relative space-y-4 animate-fade-in-up">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs text-muted-foreground">입력 중...</span>
              </div>
              <div className="glass-card soft-shadow rounded-2xl p-5 font-mono text-sm whitespace-pre-wrap min-h-[120px]">
                <span className="text-foreground">{typedText}</span>
                <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
              </div>
            </div>
          )}

          {/* Step 2: Loading */}
          {currentStep === 1 && (
            <div className="relative space-y-6 py-6 animate-fade-in-up">
              <div className="flex justify-center">
                <div className="relative w-20 h-20">
                  {/* Mist loading spinner */}
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
                  <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-[#4DB6AC] animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
                  <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-[#64B5F6] animate-spin" style={{ animationDuration: "2s" }} />
                </div>
              </div>
              <div className="text-center space-y-2">
                {(demoSteps[1].messages as string[]).map((msg, idx) => (
                  <p
                    key={idx}
                    className={cn(
                      "text-sm transition-all duration-500",
                      idx < loadingMessageIndex
                        ? "text-foreground"
                        : idx === loadingMessageIndex
                        ? "text-primary animate-pulse"
                        : "text-muted-foreground/30"
                    )}
                  >
                    {idx < loadingMessageIndex && (
                      <span className="inline-block w-4 h-4 mr-2 text-primary">&#10003;</span>
                    )}
                    {msg}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Result - Mist Cards */}
          {currentStep === 2 && (
            <div className="relative space-y-4 animate-fade-in-up">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">3가지 스타일 시안</span>
                <span className="text-xs font-medium text-primary">완성!</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {/* Card 1 - Sale Event Style */}
                <div
                  className={cn(
                    "group relative dew-hover aspect-[4/5] rounded-2xl overflow-hidden transition-all duration-700 cursor-pointer soft-shadow",
                    showCards ? "opacity-100" : "opacity-0"
                  )}
                  style={{ 
                    animation: showCards ? `fade-in-up 0.6s ease-out forwards` : undefined,
                    background: "linear-gradient(135deg, #ec4899 0%, #d946ef 50%, #a855f7 100%)"
                  }}
                >
                  <div className="absolute inset-0 flex flex-col">
                    {/* Top decorative circles */}
                    <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/20" />
                    <div className="absolute top-6 right-6 w-4 h-4 rounded-full bg-white/15" />
                    
                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-center items-center p-3 text-center">
                      <p className="text-[7px] text-white/80 tracking-widest uppercase mb-1">SPECIAL SALE</p>
                      <p className="text-2xl font-black text-white leading-none">30%</p>
                      <p className="text-lg font-bold text-white leading-none">OFF</p>
                    </div>
                    
                    {/* Bottom band */}
                    <div className="bg-white/20 backdrop-blur-sm py-2 px-3">
                      <p className="text-[8px] text-white text-center font-medium">신제품 출시 기념</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white/10" />
                </div>

                {/* Card 2 - Free Shipping Style */}
                <div
                  className={cn(
                    "group relative dew-hover aspect-[4/5] rounded-2xl overflow-hidden transition-all duration-700 cursor-pointer soft-shadow",
                    showCards ? "opacity-100" : "opacity-0"
                  )}
                  style={{ 
                    animation: showCards ? `fade-in-up 0.6s ease-out 0.15s forwards` : undefined,
                    background: "linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%)"
                  }}
                >
                  <div className="absolute inset-0 flex flex-col">
                    {/* Decorative stripes */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-white/20" />
                    <div className="absolute top-3 left-0 right-0 h-0.5 bg-white/10" />
                    
                    {/* Icon area */}
                    <div className="flex-1 flex flex-col justify-center items-center p-3">
                      <div className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center mb-2">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </div>
                      <p className="text-[10px] font-bold text-white tracking-wide">배송</p>
                      <p className="text-[7px] text-white/80 mt-1">전 상품 배송</p>
                    </div>
                    
                    {/* Bottom tag */}
                    <div className="bg-white/25 py-2 px-3 mx-3 mb-3 rounded-lg">
                      <p className="text-[8px] text-white text-center font-semibold">FREE DELIVERY</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white/10" />
                </div>

                {/* Card 3 - Points Style */}
                <div
                  className={cn(
                    "group relative dew-hover aspect-[4/5] rounded-2xl overflow-hidden transition-all duration-700 cursor-pointer soft-shadow",
                    showCards ? "opacity-100" : "opacity-0"
                  )}
                  style={{ 
                    animation: showCards ? `fade-in-up 0.6s ease-out 0.3s forwards` : undefined,
                    background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)"
                  }}
                >
                  <div className="absolute inset-0 flex flex-col">
                    {/* Star decorations */}
                    <div className="absolute top-3 left-3">
                      <svg className="w-3 h-3 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                    <div className="absolute top-6 right-4">
                      <svg className="w-2 h-2 text-yellow-300/70" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-center items-center p-3 text-center">
                      <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center mb-2 shadow-lg">
                        <span className="text-xs font-bold text-yellow-900">P</span>
                      </div>
                      <p className="text-[10px] font-bold text-white">포인트 적립</p>
                      <p className="text-lg font-black text-yellow-300 mt-1">+500P</p>
                    </div>
                    
                    {/* Bottom */}
                    <div className="bg-white/20 backdrop-blur-sm py-2 px-3">
                      <p className="text-[7px] text-white/90 text-center">리뷰 작성시 즉시 적립</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white/10" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Soft white shadow glow */}
      <div className="absolute -bottom-6 left-6 right-6 h-12 bg-gradient-to-b from-white/30 to-transparent blur-xl rounded-full" />
    </div>
  )
}
