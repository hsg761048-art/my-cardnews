"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Sparkles, LogOut, ArrowLeft, Mail, User as UserIcon, Calendar } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=/profile")
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <div className="text-white/70 text-sm">로딩 중...</div>
      </div>
    )
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const providerLabel = user.providerData[0]?.providerId === "google.com"
    ? "구글"
    : user.uid.startsWith("kakao:")
    ? "카카오"
    : user.uid.startsWith("naver:")
    ? "네이버"
    : "소셜"

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      {/* 헤더 */}
      <header className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">홈으로</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-lime-400" />
            <span className="text-white text-sm font-bold">내 머리속 카드뉴스</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">내 프로필</h1>

        {/* 프로필 카드 */}
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur">
          <div className="flex items-center gap-5">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.displayName || "프로필"}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full border-2 border-lime-400/30"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center">
                <UserIcon className="w-10 h-10 text-slate-900" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-white">
                {user.displayName || "사용자"}
              </h2>
              <p className="text-sm text-lime-400 mt-1">{providerLabel} 계정</p>
            </div>
          </div>

          <div className="mt-8 space-y-3 text-sm">
            {user.email && (
              <div className="flex items-center gap-3 text-white/70">
                <Mail className="w-4 h-4 text-white/40" />
                <span>{user.email}</span>
              </div>
            )}
            {user.metadata.creationTime && (
              <div className="flex items-center gap-3 text-white/70">
                <Calendar className="w-4 h-4 text-white/40" />
                <span>
                  가입일: {new Date(user.metadata.creationTime).toLocaleDateString("ko-KR")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 액션 */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            asChild
            className="h-12 bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold"
          >
            <Link href="/library">내 라이브러리</Link>
          </Button>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="h-12 border-white/20 text-white hover:bg-white/5 gap-2"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </Button>
        </div>
      </main>
    </div>
  )
}
