"use client"

import { PenLine, Sparkles, Download } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  {
    number: "01",
    icon: PenLine,
    title: "입력",
    description: "원하는 방식을 선택하세요: URL 붙여넣기, 대화, 또는 스마트 폼.",
    details: ["URL 붙여넣기", "AI와 대화", "스마트 폼 작성"],
    color: "text-lime-400",
    bgColor: "bg-lime-500/10",
    iconBg: "bg-lime-500",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "AI 변환",
    description: "AI가 브랜드 보이스로 카피를 최적화하고 다양한 디자인 시안을 생성합니다.",
    details: ["콘텐츠 분석", "카피 최적화", "디자인 생성"],
    color: "text-[#c25a5a]",
    bgColor: "bg-[#c25a5a]/10",
    iconBg: "bg-[#c25a5a]",
  },
  {
    number: "03",
    icon: Download,
    title: "선택 & 다운로드",
    description: "3가지 스타일 옵션 중 선택하고 여러 비율로 내보내기 합니다.",
    details: ["3가지 스타일", "다중 비율 지원", "ZIP 다운로드"],
    color: "text-white",
    bgColor: "bg-white/5",
    iconBg: "bg-white",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32 px-6 md:px-8">
      <div className="relative max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <span className="inline-block px-4 py-2 rounded-full glass-card soft-shadow text-sm font-bold text-lime-400 mb-4 border border-lime-500/20">
            사용 방법
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight">
            <span className="text-lime-400">클릭 한번</span>의 <span className="text-[#c25a5a]">마법</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="relative grid md:grid-cols-3 gap-6 mb-20">
          {/* Connection Line - Desktop */}
          <div className="hidden md:block absolute top-[100px] left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-lime-500 via-[#c25a5a] to-white/50 opacity-30" />
          
          {steps.map((step, idx) => (
            <div 
              key={idx} 
              className="group relative animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.15}s` }}
            >
              {/* Step Card */}
              <div className={cn(
                "relative dew-hover glass-card p-8 rounded-2xl soft-shadow hover:soft-shadow-lg transition-all duration-500 hover:-translate-y-1 border border-white/5 hover:border-lime-500/20",
                step.bgColor
              )}>
                {/* Number */}
                <div className="flex items-center justify-between mb-6">
                  <span className={cn(
                    "text-5xl font-black opacity-20",
                    step.color
                  )}>
                    {step.number}
                  </span>
                </div>

                {/* Icon */}
                <div className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 soft-shadow",
                  step.iconBg
                )}>
                  <step.icon className={cn("w-6 h-6", idx === 2 ? "text-slate-900" : "text-white")} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-base text-white/75 mb-6 leading-relaxed font-medium">
                  {step.description}
                </p>

                {/* Details */}
                <ul className="space-y-2">
                  {step.details.map((detail, didx) => (
                    <li key={didx} className="flex items-center gap-3 text-base text-white/75 font-medium">
                      <div className={cn("w-1.5 h-1.5 rounded-full", step.iconBg)} />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Connection Dot */}
              <div className={cn(
                "hidden md:flex absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full items-center justify-center z-10 soft-shadow",
                step.iconBg
              )}>
                <div className="w-2 h-2 rounded-full bg-slate-900" />
              </div>
            </div>
          ))}
        </div>

        {/* Export Preview */}
        <div className="relative glass-card rounded-2xl p-8 md:p-12 overflow-hidden soft-shadow-lg border border-white/5">
          {/* Glow background */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-lime-500/10 via-transparent to-transparent rounded-full blur-3xl" />
          
          <div className="relative grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-4 tracking-tight">
                올인원 <span className="text-lime-400">패키지</span> <span className="text-[#c25a5a]">내보내기</span>
              </h3>
              <p className="text-base text-white/75 leading-relaxed mb-6 font-medium">
                클릭 한 번으로 인스타그램(1:1), 릴스/숏츠(9:16), 
                블로그(16:9)에 최적화된 파일을 ZIP으로 다운로드 합니다.
              </p>
              <div className="flex flex-wrap gap-3">
                {["1:1 정사각형", "9:16 스토리", "16:9 블로그"].map((format, idx) => (
                  <span
                    key={format}
                    className={cn(
                      "dew-hover px-5 py-2.5 text-base font-bold rounded-full glass-card soft-shadow transition-all duration-300 hover:scale-105 cursor-default border border-white/10",
                      idx === 0 ? "text-lime-400" :
                      idx === 1 ? "text-[#c25a5a]" :
                      "text-white"
                    )}
                  >
                    {format}
                  </span>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Preview */}
            <div className="relative flex justify-center items-end gap-6 md:gap-8 py-8">
              <div className="group animate-soft-float" style={{ animationDelay: '0s' }}>
                <div className="dew-hover w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-lime-500 flex items-center justify-center text-slate-900 text-base font-bold soft-shadow-lg group-hover:scale-105 transition-all duration-300">
                  1:1
                </div>
              </div>
              <div className="group animate-soft-float" style={{ animationDelay: '0.5s' }}>
                <div className="dew-hover w-20 h-36 md:w-24 md:h-44 rounded-2xl bg-[#c25a5a] flex items-center justify-center text-white text-base font-bold soft-shadow-lg group-hover:scale-105 transition-all duration-300">
                  9:16
                </div>
              </div>
              <div className="group animate-soft-float" style={{ animationDelay: '1s' }}>
                <div className="dew-hover w-40 h-24 md:w-48 md:h-28 rounded-2xl bg-white flex items-center justify-center text-slate-900 text-base font-bold soft-shadow-lg group-hover:scale-105 transition-all duration-300">
                  16:9
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
