"use client"

import { Link2, MessageSquare, FileText, Palette, Image, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"

const inputModes = [
  {
    icon: Link2,
    title: "URL만 넣으면 카드뉴스 완성",
    subtitle: "URL 붙여넣기",
    description: "블로그나 기사 링크를 넣으면 AI가 알아서 읽고, 핵심만 골라 5장짜리 카드뉴스로 만들어드려요.",
    color: "text-lime-400",
    bgColor: "bg-lime-500/10",
    iconBg: "bg-lime-500",
  },
  {
    icon: MessageSquare,
    title: "아이디어만 말해도 완성",
    subtitle: "대화로 만들기",
    description: "'이런 내용으로 카드뉴스 만들어줘'라고 말하면, 제목·본문·디자인까지 AI가 처음부터 만들어요.",
    color: "text-[#c25a5a]",
    bgColor: "bg-[#c25a5a]/10",
    iconBg: "bg-[#c25a5a]",
  },
  {
    icon: FileText,
    title: "내용 입력하면 디자인은 AI가",
    subtitle: "양식으로 만들기",
    description: "제목, 내용, 타겟 독자만 채우면 내용은 그대로 유지하면서 전문가 디자인으로 완성해드려요.",
    color: "text-white",
    bgColor: "bg-white/5",
    iconBg: "bg-white",
  },
]

const brandFeatures = [
  {
    icon: Palette,
    title: "브랜드 스타일 자동 적용",
    description: "로고, 색상, 폰트를 한 번만 저장해두면 이후 만드는 모든 카드뉴스에 자동으로 적용돼요.",
    color: "text-lime-400",
  },
  {
    icon: Wand2,
    title: "우리 브랜드 말투로 자동 변환",
    description: "대충 쓴 메모도 우리 회사 톤앤매너에 맞는 세련된 문장으로 자동 변환돼요.",
    color: "text-[#c25a5a]",
  },
  {
    icon: Image,
    title: "이미지 보정도 자동으로",
    description: "배경 제거, 밝기 보정, 어울리는 스톡 사진 추천까지 이미지 작업을 한 번에 처리해요.",
    color: "text-white",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 md:py-32 px-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <span className="inline-block px-4 py-2 rounded-full glass-card soft-shadow text-sm font-bold text-lime-400 mb-4 border border-lime-500/20">
            기능 소개
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4 tracking-tight">
            어떻게 만들고 싶으세요?
            <br />
            <span className="text-lime-400">3가지 방법</span> 중 <span className="text-[#c25a5a]">골라보세요</span>
          </h2>
        </div>

        {/* Input Modes */}
        <div className="grid md:grid-cols-3 gap-6 mb-24">
          {inputModes.map((mode, idx) => (
            <div
              key={idx}
              className="group relative dew-hover glass-card p-8 rounded-2xl soft-shadow hover:soft-shadow-lg transition-all duration-500 hover:-translate-y-1 animate-fade-in-up border border-white/5 hover:border-lime-500/20"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {/* Decorative glow */}
              <div className={cn(
                "absolute -top-6 -right-6 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-all duration-700",
                mode.bgColor
              )} />
              
              {/* Icon */}
              <div className={cn(
                "relative w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 soft-shadow",
                mode.iconBg
              )}>
                <mode.icon className={cn("w-6 h-6", idx === 2 ? "text-slate-900" : "text-white")} />
              </div>
              
              {/* Content */}
              <div className="relative space-y-3 mb-4">
                <span className={cn(
                  "text-sm font-bold tracking-wide",
                  mode.color
                )}>
                  {mode.subtitle}
                </span>
              <h3 className="text-lg font-bold text-white">
                {mode.title}
              </h3>
              </div>
              <p className="relative text-base text-white/75 leading-relaxed font-medium">
                {mode.description}
              </p>
            </div>
          ))}
        </div>

        {/* Brand Features */}
        <div className="relative glass-card rounded-2xl p-8 md:p-12 overflow-hidden soft-shadow-lg border border-white/5">
          {/* Background glow effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-lime-500/10 via-transparent to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#c25a5a]/10 via-transparent to-transparent rounded-full blur-3xl" />
          
          <div className="relative mb-10">
            <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-tight">
              한 번 설정하면,
              <span className="text-lime-400"> 모든 카드뉴스가</span> <span className="text-[#c25a5a]">우리 브랜드처럼.</span>
            </h3>
            <p className="text-base text-white/75 max-w-xl font-medium">
              매번 색상·폰트·말투를 맞출 필요 없어요. 한 번만 저장해두면 끝이에요.
            </p>
          </div>
          
          <div className="relative grid md:grid-cols-3 gap-8">
            {brandFeatures.map((feature, idx) => (
              <div key={idx} className="group">
                <div className={cn(
                  "w-12 h-12 rounded-xl glass-card soft-shadow flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-white/10",
                  feature.color
                )}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">
                  {feature.title}
                </h4>
                <p className="text-base text-white/75 leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
