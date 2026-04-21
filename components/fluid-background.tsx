"use client"

import { cn } from "@/lib/utils"

interface FluidBackgroundProps {
  className?: string
  variant?: "light" | "warm" | "futuristic"
}

export function FluidBackground({ className, variant = "light" }: FluidBackgroundProps) {
  const colorSchemes = {
    // 창의성과 신뢰 (라이트 모드) - 파스텔 블루 + 라벤더 + 피치
    light: {
      blob1: "bg-[#a5b4fc]", // 파스텔 블루
      blob2: "bg-[#c4b5fd]", // 라벤더
      blob3: "bg-[#fecdd3]", // 피치
      blob4: "bg-[#99f6e4]", // 민트
      blob5: "bg-[#ddd6fe]", // 연보라
      bgBase: "bg-slate-50",
    },
    // 따뜻함과 감성 (라이트 모드) - 코랄 핑크 + 베이지
    warm: {
      blob1: "bg-[#fda4af]", // 코랄 핑크 (채도 낮춤)
      blob2: "bg-[#fde68a]", // 샌드 베이지
      blob3: "bg-[#fed7aa]", // 웜 피치
      blob4: "bg-[#fbcfe8]", // 소프트 핑크
      blob5: "bg-[#fef3c7]", // 웜 화이트
      bgBase: "bg-amber-50/80",
    },
    // 미래지향적 모던함 (다크 모드) - 딥 인디고 + 네온 블루 + 에메랄드
    futuristic: {
      blob1: "bg-[#4f46e5]", // 딥 인디고
      blob2: "bg-[#7c3aed]", // 바이올렛
      blob3: "bg-[#0ea5e9]", // 네온 블루
      blob4: "bg-[#059669]", // 에메랄드
      blob5: "bg-[#6366f1]", // 인디고
      bgBase: "bg-slate-950",
    },
  }

  const scheme = colorSchemes[variant]
  const isDark = variant === "futuristic"

  return (
    <div className={cn("absolute inset-0 overflow-hidden", scheme.bgBase, className)}>
      {/* Blob 1 - 상단 좌측: 가장 큰 블롭, 느린 움직임 */}
      <div
        className={cn(
          "absolute -top-1/4 -left-1/4 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full",
          scheme.blob1,
          "blur-[120px] animate-fluid-ultra-slow",
          isDark ? "opacity-30" : "opacity-50"
        )}
      />
      
      {/* Blob 2 - 상단 우측: 중간 크기, 역방향 움직임 */}
      <div
        className={cn(
          "absolute -top-1/6 -right-1/5 w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full",
          scheme.blob2,
          "blur-[100px] animate-fluid-reverse",
          isDark ? "opacity-25" : "opacity-45"
        )}
        style={{ animationDelay: "-8s" }}
      />
      
      {/* Blob 3 - 중앙: 가장 크고 흐릿한 블롭, 배경 전체를 감싸는 느낌 */}
      <div
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] rounded-full",
          scheme.blob3,
          "blur-[150px] animate-fluid-slow",
          isDark ? "opacity-20" : "opacity-35"
        )}
        style={{ animationDelay: "-15s" }}
      />
      
      {/* Blob 4 - 하단 좌측: 중간 크기 */}
      <div
        className={cn(
          "absolute -bottom-1/5 -left-1/6 w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] rounded-full",
          scheme.blob4,
          "blur-[110px] animate-fluid",
          isDark ? "opacity-25" : "opacity-40"
        )}
        style={{ animationDelay: "-20s" }}
      />
      
      {/* Blob 5 - 하단 우측: 작은 블롭, 섬세한 악센트 */}
      <div
        className={cn(
          "absolute -bottom-1/4 -right-1/4 w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full",
          scheme.blob5,
          "blur-[130px] animate-fluid-reverse",
          isDark ? "opacity-20" : "opacity-35"
        )}
        style={{ animationDelay: "-12s" }}
      />

      {/* 다크모드에서 추가적인 미세한 빛 효과 */}
      {isDark && (
        <div
          className="absolute top-1/3 right-1/4 w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] rounded-full bg-cyan-500/10 blur-[100px] animate-fluid-ultra-slow"
          style={{ animationDelay: "-25s" }}
        />
      )}
    </div>
  )
}
