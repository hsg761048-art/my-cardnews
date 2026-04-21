"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { HeroDemo } from "./hero-demo"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-0 pb-0">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 items-center gap-0 h-screen">
        {/* Left: text content */}
        <div className="relative px-10 md:px-16 lg:px-20 flex flex-col items-start justify-center h-full">
          <div className="space-y-6 text-left max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card animate-fade-in-up soft-shadow border border-white/10">
              <Sparkles className="w-4 h-4 text-lime-400 animate-soft-float" />
              <span className="text-sm font-semibold text-lime-400">
                AI 카드뉴스 자동화
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-very-tight tracking-tighter">
                <span className="text-white block">내 머리속의</span>
                <span className="text-white block">카드뉴스</span>
                <span className="text-lime-400 block mt-3">클릭 한번으로</span>
                <span className="text-[#c25a5a]">완성</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 max-w-md leading-relaxed font-medium">
                대충 적은 아이디어를 전문가급 카드뉴스로 변환합니다.
                <br className="hidden md:block" />
                시간 없는 마케터와 CEO를 위한 <span className="text-lime-400">AI 파트너</span>.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-start animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <Button 
                size="lg" 
                asChild 
                className="group dew-hover rounded-full px-8 h-14 text-base font-bold bg-lime-500 hover:bg-lime-400 text-slate-900 soft-shadow-lg hover:scale-[1.02] transition-all duration-300"
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
                className="dew-hover rounded-full px-8 h-14 text-base font-bold glass-card border-white/20 text-white hover:bg-white/10 hover:border-lime-400/50 transition-all duration-300"
              >
                <Link href="#how-it-works">
                  작동 방식 보기
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-start gap-6 pt-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center gap-2 text-sm text-white/70 font-medium">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-8 h-8 rounded-full border-2 border-white/20 soft-shadow"
                      style={{
                        background: `linear-gradient(135deg, ${
                          ['#84cc16', '#c25a5a', '#a3e635', '#e57373'][i]
                        }, ${
                          ['#a3e635', '#e57373', '#84cc16', '#c25a5a'][i]
                        })`
                      }}
                    />
                  ))}
                </div>
                <span><strong className="text-white">1,200+</strong> 크리에이터</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/30" />
              <div className="text-sm text-white/70 font-medium">
                <span className="text-lime-400 font-bold">지금</span> 시작하기
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interactive Demo */}
        <div className="hidden lg:block h-full overflow-hidden">
          <HeroDemo />
        </div>
      </div>
    </section>
  )
}
