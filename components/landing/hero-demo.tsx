"use client"

import { useState, useEffect } from "react"
import { Send, Sparkles } from "lucide-react"

const PAINTINGS = [
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Magritte%20at%20Galerie%20Alexandre%20Iolas-yaWLkEPDFFe5Gp5JS2Svy6lYyHhPiO.jpeg",
    alt: "Magritte - The Son of Man"
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%84%89%E1%85%A6%E1%84%80%E1%85%A8%E1%84%8B%E1%85%A6%E1%84%89%E1%85%A5%20%E1%84%8B%E1%85%B5%E1%86%AB%E1%84%8C%E1%85%A5%E1%86%BC%E1%84%92%E1%85%A1%E1%84%82%E1%85%B3%E1%86%AB%20%E1%84%8E%E1%85%A9%E1%84%92%E1%85%A7%E1%86%AB%E1%84%89%E1%85%B5%E1%86%AF%E1%84%8C%E1%85%AE%E1%84%8B%E1%85%B4%20%E1%84%92%E1%85%AA%E1%84%80%E1%85%A1-fjbKmjLNVBximQOXAycBwIoQKUKzHE.jpeg",
    alt: "Vladimir Kush - Book Tree"
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Rafa%C5%82%20Olbin%CC%81ski-YamcWOQMQZv4gUKP0AWVNuCepESUvk.jpeg",
    alt: "Rafał Olbiński - Cloud Face Violin"
  }
]

const PROMPT_TEXT = "초현실주의 명화 또는 그림을 개인 소장품처럼 만들어줘"

type Phase = "typing" | "generating" | "showingImages"

export function HeroDemo() {
  const [typedText, setTypedText] = useState("")
  const [phase, setPhase] = useState<Phase>("typing")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageVisible, setImageVisible] = useState(false)
  const [cycleCount, setCycleCount] = useState(0)

  // 전체 애니메이션 초기화 함수
  const resetAnimation = () => {
    setImageVisible(false)
    setTimeout(() => {
      setTypedText("")
      setCurrentImageIndex(0)
      setCycleCount(0)
      setPhase("typing")
    }, 700)
  }

  // Phase 1: Typing animation
  useEffect(() => {
    if (phase !== "typing") return

    if (typedText.length < PROMPT_TEXT.length) {
      const timeout = setTimeout(() => {
        setTypedText(PROMPT_TEXT.slice(0, typedText.length + 1))
      }, 60)
      return () => clearTimeout(timeout)
    } else {
      // Typing complete, move to generating phase after a brief pause
      const timeout = setTimeout(() => {
        setPhase("generating")
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [typedText, phase])

  // Phase 2: Generating state (3 seconds)
  useEffect(() => {
    if (phase !== "generating") return

    const timeout = setTimeout(() => {
      setPhase("showingImages")
      setImageVisible(true)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [phase])

  // Phase 3: Cycle through images — 모두 보여준 뒤 전체 반복
  useEffect(() => {
    if (phase !== "showingImages") return

    const interval = setInterval(() => {
      setImageVisible(false)

      setTimeout(() => {
        const nextIndex = (currentImageIndex + 1) % PAINTINGS.length
        const nextCycle = cycleCount + 1

        // 모든 이미지를 한 바퀴 다 보여줬으면 처음부터 재시작
        if (nextCycle >= PAINTINGS.length) {
          resetAnimation()
        } else {
          setCurrentImageIndex(nextIndex)
          setCycleCount(nextCycle)
          setImageVisible(true)
        }
      }, 500)
    }, 4000)

    return () => clearInterval(interval)
  }, [phase, currentImageIndex, cycleCount])

  return (
    <div className="relative h-full w-full flex items-center justify-center">
      {/* Phase 1: Typing prompt */}
      {phase === "typing" && (
        <div className="w-full max-w-lg px-6 animate-fade-in">
          <div className="bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                <p className="text-white/90 text-base font-medium min-h-[1.5rem]">
                  {typedText}
                  <span className="inline-block w-0.5 h-5 bg-lime-400 ml-0.5 animate-pulse" />
                </p>
              </div>
              <button className="p-3 rounded-xl bg-white/10 text-white/40">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phase 2: Generating state */}
      {phase === "generating" && (
        <div className="flex flex-col items-center justify-center gap-6 animate-fade-in">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-lime-500/30 border-t-lime-500 animate-spin" />
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-lime-400 animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-white mb-2">카드뉴스 생성 중...</p>
            <p className="text-white/60 text-sm">AI가 작품을 분석하고 있습니다</p>
          </div>
        </div>
      )}

      {/* Phase 3: Showing images */}
      {phase === "showingImages" && (
        <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
          <div
            className={`relative transition-all duration-700 ease-out ${
              imageVisible
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95"
            }`}
          >
            <img
              src={PAINTINGS[currentImageIndex].src}
              alt={PAINTINGS[currentImageIndex].alt}
              className="object-cover rounded-xl"
              style={{ width: '480px', height: '640px' }}
            />
            {/* Image indicator dots */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {PAINTINGS.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    idx === currentImageIndex
                      ? "bg-lime-400 scale-125"
                      : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
