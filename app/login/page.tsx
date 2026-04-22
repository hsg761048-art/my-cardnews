"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Sparkles } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading, configured, signInWithGoogle, signInWithKakao, signInWithNaver } = useAuth()

  const redirectTo = searchParams.get("redirect") || "/"

  useEffect(() => {
    if (!loading && user) {
      router.replace(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <div className="text-white/70 text-sm">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-10">
          <Sparkles className="w-6 h-6 text-lime-400" />
          <span className="text-white text-lg font-bold">내 머리속 카드뉴스</span>
        </Link>

        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-8 space-y-6 backdrop-blur">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-white">로그인</h1>
            <p className="text-sm text-white/60">간편하게 소셜 계정으로 시작하세요</p>
          </div>

          {!configured && (
            <div className="flex gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200 space-y-1">
                <p className="font-semibold">Firebase 환경변수가 설정되지 않았어요</p>
                <p className="text-amber-200/80">
                  Vercel 환경변수에 Firebase 키를 추가한 후 다시 배포해주세요.
                  <br />
                  (자세한 설정은 SETUP_AUTH.md 참고)
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {/* 구글 로그인 */}
            <Button
              onClick={() => signInWithGoogle().catch(console.error)}
              disabled={!configured}
              variant="outline"
              className="w-full h-12 bg-white hover:bg-gray-50 text-slate-900 border-0 font-semibold gap-3 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              구글로 계속하기
            </Button>

            {/* 카카오 로그인 */}
            <Button
              onClick={signInWithKakao}
              disabled={!configured}
              className="w-full h-12 bg-[#FEE500] hover:bg-[#FFDC00] text-[#3C1E1E] border-0 font-semibold gap-3 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.5 3 2 6.58 2 11c0 2.11.89 4.03 2.36 5.45.61 2.52-.15 4.71-.64 5.55.66-.04 2.75-.25 4.82-1.63 1.08.31 2.23.47 3.46.47 5.5 0 10-3.58 10-8s-4.5-8-10-8z" />
              </svg>
              카카오로 계속하기
            </Button>

            {/* 네이버 로그인 */}
            <Button
              onClick={signInWithNaver}
              disabled={!configured}
              className="w-full h-12 bg-[#03C75A] hover:bg-[#04B050] text-white border-0 font-semibold gap-3 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.273 12.845 7.376 0H0v24h7.727V11.156L16.624 24H24V0h-7.727z" />
              </svg>
              네이버로 계속하기
            </Button>
          </div>

          <p className="text-xs text-white/40 text-center leading-relaxed">
            로그인하면{" "}
            <Link href="/terms" className="underline hover:text-white/60">
              이용약관
            </Link>{" "}
            및{" "}
            <Link href="/privacy" className="underline hover:text-white/60">
              개인정보처리방침
            </Link>
            에 동의하는 것으로 간주됩니다.
          </p>
        </div>

        <p className="text-center text-xs text-white/40 mt-6">
          <Link href="/" className="hover:text-white/70">
            ← 홈으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  )
}
