"use client"

import Link from "next/link"
import { Sparkles, Plus, Library } from "lucide-react"

interface CreateHeaderProps {
  variant?: "create" | "brand-kit" | "results"
}

export function CreateHeader({ variant = "create" }: CreateHeaderProps) {
  const isDark = variant === "brand-kit"
  const isResults = variant === "results"

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-pink-300/20 to-sky-300/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Sparkles className={`relative w-5 h-5 ${isDark ? "text-pink-300" : "text-primary"}`} />
            </div>
            <span className={`text-xl font-bold ${isDark || isResults ? "text-white" : "text-violet-500"}`}>
              내 머리속 카드뉴스
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">

            {isResults ? (
              <>
                {/* 새 카드뉴스 버튼 */}
                <Link
                  href="/create"
                  className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full text-base font-bold bg-[#1a1a2e] text-lime-400 border border-white/20 shadow-sm transition-all hover:bg-transparent hover:border-lime-400 hover:text-white"
                >
                  <Plus className="w-4 h-4" />
                  새 카드뉴스
                </Link>
                {/* 라이브러리 버튼 */}
                <Link
                  href="/library"
                  className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full text-sm font-semibold bg-transparent text-white/70 border border-white/20 shadow-sm transition-all hover:bg-white/10 hover:text-white"
                >
                  <Library className="w-4 h-4" />
                  라이브러리
                </Link>
                {/* 브랜드 키트 버튼 */}
                <Link
                  href="/brand-kit"
                  className="inline-flex items-center h-10 px-5 rounded-full text-base font-bold bg-transparent text-white border border-lime-400 shadow-sm transition-all hover:bg-[#1a1a2e] hover:border-white/20 hover:text-lime-400"
                >
                  브랜드 키트
                </Link>
              </>
            ) : isDark ? (
              /* 브랜드 키트 페이지 */
              <Link
                href="/create"
                className="inline-flex items-center h-10 px-5 rounded-full text-base font-bold bg-[#1a1a2e] text-white border border-white/20 shadow-sm transition-all hover:bg-transparent hover:border-lime-400 hover:text-white"
              >
                카드뉴스
              </Link>
            ) : (
              /* 카드뉴스 만들기 페이지 */
              <Link
                href="/brand-kit"
                className="inline-flex items-center h-10 px-5 rounded-full text-base font-bold text-white bg-violet-500 border border-violet-500 shadow-sm transition-all hover:bg-violet-200/60 hover:text-violet-600 hover:border-violet-500"
              >
                브랜드 키트
              </Link>
            )}

            {/* 로그인 버튼 */}
            <button
              className={`h-10 px-4 rounded-full text-base font-semibold transition-all ${
                isDark
                  ? "text-white hover:text-white hover:bg-white/10"
                  : "text-slate-700 hover:text-violet-500 hover:bg-violet-50"
              }`}
            >
              로그인
            </button>

          </div>
        </div>
      </div>
    </header>
  )
}
