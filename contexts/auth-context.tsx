"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCustomToken,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { auth, isFirebaseConfigured } from "@/lib/firebase/client"

type Provider = "google" | "kakao" | "naver"

interface AuthContextValue {
  user: User | null
  loading: boolean
  /** Firebase 환경변수 설정 여부 */
  configured: boolean
  signInWithGoogle: () => Promise<void>
  signInWithKakao: () => void
  signInWithNaver: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })

    // 커스텀 토큰 로그인 완료 감지 (kakao/naver 콜백 후)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const token = params.get("token")
      const provider = params.get("auth") as Provider | null
      if (token && provider && auth) {
        signInWithCustomToken(auth, token)
          .then(() => {
            // URL 에서 토큰 파라미터 정리
            const url = new URL(window.location.href)
            url.searchParams.delete("token")
            url.searchParams.delete("auth")
            window.history.replaceState({}, "", url.toString())
          })
          .catch((err) => {
            console.error("[auth] 커스텀 토큰 로그인 실패:", err)
          })
      }
    }

    return () => unsub()
  }, [])

  const signInWithGoogle = async () => {
    if (!auth) throw new Error("Firebase가 설정되지 않았습니다")
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: "select_account" })
    await signInWithPopup(auth, provider)
  }

  const signInWithKakao = () => {
    const key = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY
    const site = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    if (!key) {
      alert("카카오 로그인이 설정되지 않았습니다")
      return
    }
    const redirect = `${site}/api/auth/kakao/callback`
    const url = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${key}&redirect_uri=${encodeURIComponent(redirect)}`
    window.location.href = url
  }

  const signInWithNaver = () => {
    const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID
    const site = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    if (!clientId) {
      alert("네이버 로그인이 설정되지 않았습니다")
      return
    }
    const state = Math.random().toString(36).slice(2)
    if (typeof window !== "undefined") {
      sessionStorage.setItem("naver_oauth_state", state)
    }
    const redirect = `${site}/api/auth/naver/callback`
    const url = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirect)}&state=${state}`
    window.location.href = url
  }

  const signOut = async () => {
    if (!auth) return
    await firebaseSignOut(auth)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        configured: isFirebaseConfigured,
        signInWithGoogle,
        signInWithKakao,
        signInWithNaver,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth는 AuthProvider 안에서 사용해야 합니다")
  return ctx
}
