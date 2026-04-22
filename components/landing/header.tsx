"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X, Sparkles, User as UserIcon, LogOut, LayoutDashboard } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { user, signOut } = useAuth()

  // 외부 클릭 시 유저 메뉴 닫기
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled 
          ? "bg-black/70 backdrop-blur-xl border-b border-white/10 shadow-lg" 
          : "bg-black/30 backdrop-blur-md"
      )}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-lime-400/20 via-white/10 to-[#c25a5a]/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Sparkles className="relative w-5 h-5 text-lime-400" />
            </div>
            <span className="text-xl font-bold text-white">
              내 머리속 카드뉴스
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { href: "#features", label: "기능" },
              { href: "#how-it-works", label: "사용 방법" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative text-white/80 hover:text-lime-400 transition-colors duration-300 text-sm font-semibold group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-lime-400 to-lime-400/50 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-white/5 transition-colors"
                  aria-label="사용자 메뉴"
                >
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName || "프로필"}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full border border-white/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-slate-900" />
                    </div>
                  )}
                  <span className="text-sm font-semibold text-white/90 max-w-[120px] truncate">
                    {user.displayName || "사용자"}
                  </span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 py-2 rounded-xl bg-slate-900 border border-white/10 shadow-xl">
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />내 프로필
                    </Link>
                    <Link
                      href="/library"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />내 라이브러리
                    </Link>
                    <div className="my-1 border-t border-white/10" />
                    <button
                      onClick={async () => {
                        setUserMenuOpen(false)
                        await signOut()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="ghost"
                asChild
                className="text-white/80 hover:text-lime-400 hover:bg-white/5 text-sm font-semibold rounded-full"
              >
                <Link href="/login">로그인</Link>
              </Button>
            )}
            <Button
              asChild
              className="dew-hover rounded-full px-6 bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold soft-shadow hover:soft-shadow-lg transition-all duration-300"
            >
              <Link href="/create">시작하기</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white/80 hover:text-lime-400 transition-colors rounded-full hover:bg-white/5"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="메뉴 열기"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-6 pb-8 space-y-6 animate-fade-in-up">
            <nav className="flex flex-col gap-4">
              {[
                { href: "#features", label: "기능" },
                { href: "#how-it-works", label: "사용 방법" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-white/80 hover:text-lime-400 transition-colors text-lg py-2 font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
              {user ? (
                <>
                  <Button variant="ghost" asChild className="justify-start text-white/80 hover:text-lime-400 rounded-full font-semibold gap-2">
                    <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                      <UserIcon className="w-4 h-4" />내 프로필
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild className="justify-start text-white/80 hover:text-lime-400 rounded-full font-semibold gap-2">
                    <Link href="/library" onClick={() => setIsMenuOpen(false)}>
                      <LayoutDashboard className="w-4 h-4" />내 라이브러리
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      setIsMenuOpen(false)
                      await signOut()
                    }}
                    className="justify-start text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-full font-semibold gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    로그아웃
                  </Button>
                </>
              ) : (
                <Button variant="ghost" asChild className="justify-start text-white/80 hover:text-lime-400 rounded-full font-semibold">
                  <Link href="/login">로그인</Link>
                </Button>
              )}
              <Button
                asChild
                className="rounded-full bg-lime-500 text-slate-900 font-bold soft-shadow hover:bg-lime-400"
              >
                <Link href="/create" onClick={() => setIsMenuOpen(false)}>시작하기</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
