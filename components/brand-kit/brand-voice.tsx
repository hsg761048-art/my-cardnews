"use client"

import { cn } from "@/lib/utils"
import { Check, Briefcase, Heart, Zap, Smile } from "lucide-react"

interface BrandVoiceProps {
  selectedVoice: string
  onVoiceChange: (voice: string) => void
}

const voiceStyles = [
  {
    id: "professional",
    icon: Briefcase,
    title: "전문가",
    description: "신뢰감 있는 권위적 B2B 스타일",
    example: "업계 최고의 혁신적인 솔루션을 제공합니다.",
    color: "from-slate-500 to-slate-700",
    accentSelected: "bg-white/15 text-white border-white/20",
    accentDefault: "bg-slate-100 text-slate-700 border-slate-200",
  },
  {
    id: "friendly",
    icon: Heart,
    title: "친근함",
    description: "따뜻하고 접근하기 쉬운 B2C 스타일",
    example: "당신의 일상을 더 특별하게 만들어 드릴게요!",
    color: "from-pink-400 to-rose-500",
    accentSelected: "bg-white/15 text-white border-white/20",
    accentDefault: "bg-pink-50 text-pink-700 border-pink-200",
  },
  {
    id: "dynamic",
    icon: Zap,
    title: "다이나믹",
    description: "에너지 넘치고 활기찬 스타일",
    example: "지금 바로 행동하세요! 이 특별한 기회를 놓치지 마세요!",
    color: "from-amber-400 to-orange-500",
    accentSelected: "bg-white/15 text-white border-white/20",
    accentDefault: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    id: "casual",
    icon: Smile,
    title: "캐주얼",
    description: "가볍고 편안한 일상적 스타일",
    example: "오늘 뭐 먹을지 고민되시죠? 한번 들러보세요~",
    color: "from-lime-400 to-green-500",
    accentSelected: "bg-white/15 text-white border-white/20",
    accentDefault: "bg-lime-50 text-lime-700 border-lime-200",
  },
]

export function BrandVoice({ selectedVoice, onVoiceChange }: BrandVoiceProps) {
  return (
    <div className="glass-card rounded-2xl border border-white/30 p-6 md:p-8">
      <h2 className="text-lg font-bold text-slate-800 mb-1">브랜드 보이스</h2>
      <p className="text-base font-bold text-white mb-6">
        AI 카피라이팅의 어조와 말투를 선택하세요
      </p>

      <div className="grid md:grid-cols-2 gap-3">
        {voiceStyles.map((voice) => {
          const isSelected = selectedVoice === voice.id
          return (
            <button
              key={voice.id}
              onClick={() => onVoiceChange(voice.id)}
              className={cn(
                "group flex flex-col items-start gap-4 p-5 rounded-xl border-2 transition-all text-left",
                isSelected
                  ? "border-primary bg-transparent"
                  : "border-white/40 bg-white/70 hover:bg-white/90 hover:border-primary/50"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <div className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-sm",
                  voice.color
                )}>
                  <voice.icon className="w-5 h-5 text-white" />
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>

              <div>
                <p className={cn(
                  "text-lg font-bold transition-colors",
                  isSelected ? "text-white" : "text-slate-800"
                )}>
                  {voice.title}
                </p>
                <p className={cn(
                  "text-base font-semibold mt-0.5",
                  isSelected ? "text-white/90" : "text-slate-600"
                )}>
                  {voice.description}
                </p>
              </div>

              <div className={cn(
                "w-full px-4 py-3 rounded-xl border text-base font-semibold italic",
                isSelected ? voice.accentSelected : voice.accentDefault
              )}>
                &ldquo;{voice.example}&rdquo;
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
