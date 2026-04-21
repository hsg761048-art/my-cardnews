"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

export function CTASection() {
  return (
    <section className="relative py-24 md:py-32 px-6 md:px-8 overflow-hidden">
      <div className="relative max-w-4xl mx-auto text-center px-4">
        {/* Floating icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-lime-500/20 via-white/10 to-[#c25a5a]/20 rounded-full blur-xl opacity-60 animate-gentle-breathe" />
            <div className="relative w-20 h-20 rounded-full bg-lime-500 flex items-center justify-center soft-shadow-lg">
              <Sparkles className="w-8 h-8 text-slate-900" />
            </div>
          </div>
        </div>

        {/* Content */}
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight animate-fade-in-up tracking-tight">
          아이디어를 <span className="text-lime-400">카드뉴스</span>로,
          <br className="hidden md:block" />
          지금 <span className="text-[#c25a5a]">바로</span> 만들어보세요
        </h2>
        <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up font-medium" style={{ animationDelay: "0.1s" }}>
          디자인에 시간 쓰지 마세요. 내 머리속 카드뉴스와 함께라면 누구나 전문가급
          <br />카드뉴스를 만들 수 있습니다.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <Button 
            size="lg" 
            asChild 
            className="group dew-hover rounded-full px-10 h-14 text-base font-bold bg-lime-500 hover:bg-lime-400 text-slate-900 soft-shadow-lg hover:scale-[1.02] transition-all duration-300"
          >
            <Link href="/create">
              카드뉴스 만들기
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            asChild 
            className="dew-hover rounded-full px-10 h-14 text-base font-bold glass-card border-white/20 text-white hover:bg-white/10 hover:border-lime-400/50 soft-shadow transition-all duration-300"
          >
            <Link href="/brand-kit">
              브랜드 키트 설정
            </Link>
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-white/70 font-medium animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          {[
            { text: "바로 시작 가능", color: "bg-lime-500" }
          ].map((item, idx) => (
            <span key={idx} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${item.color}`} />
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
