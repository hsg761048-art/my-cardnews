import { NextRequest, NextResponse } from "next/server"
import { getAdminAuth, isAdminConfigured } from "@/lib/firebase/admin"

/**
 * 카카오 OAuth 콜백
 * 1. 카카오로부터 받은 code를 access token으로 교환
 * 2. access token으로 사용자 프로필 조회
 * 3. Firebase Admin SDK로 커스텀 토큰 발급
 * 4. /login?token=xxx&auth=kakao 로 리다이렉트 → 클라이언트에서 signInWithCustomToken
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  const site = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin

  if (!code) {
    return NextResponse.redirect(`${site}/login?error=no_code`)
  }

  if (!isAdminConfigured) {
    return NextResponse.redirect(`${site}/login?error=firebase_not_configured`)
  }

  const restKey = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY
  const clientSecret = process.env.KAKAO_CLIENT_SECRET
  if (!restKey) {
    return NextResponse.redirect(`${site}/login?error=kakao_not_configured`)
  }

  try {
    // 1. code → access token
    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: restKey,
      redirect_uri: `${site}/api/auth/kakao/callback`,
      code,
    })
    if (clientSecret) tokenParams.append("client_secret", clientSecret)

    const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
      body: tokenParams.toString(),
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      console.error("[kakao] 토큰 교환 실패:", errText)
      return NextResponse.redirect(`${site}/login?error=kakao_token_failed`)
    }

    const { access_token } = await tokenRes.json()

    // 2. access token → 사용자 정보
    const userRes = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    if (!userRes.ok) {
      return NextResponse.redirect(`${site}/login?error=kakao_user_failed`)
    }

    const kakaoUser = await userRes.json()
    const uid = `kakao:${kakaoUser.id}`
    const email = kakaoUser.kakao_account?.email
    const displayName = kakaoUser.kakao_account?.profile?.nickname
    const photoURL = kakaoUser.kakao_account?.profile?.profile_image_url

    // 3. Firebase 커스텀 토큰 발급
    const adminAuth = getAdminAuth()
    if (!adminAuth) {
      return NextResponse.redirect(`${site}/login?error=admin_not_ready`)
    }

    // 사용자 프로필 업데이트/생성
    try {
      await adminAuth.updateUser(uid, {
        displayName,
        photoURL,
        ...(email ? { email } : {}),
      })
    } catch {
      // 사용자가 없으면 생성
      await adminAuth.createUser({
        uid,
        displayName,
        photoURL,
        ...(email ? { email } : {}),
      })
    }

    const customToken = await adminAuth.createCustomToken(uid, { provider: "kakao" })

    // 4. 클라이언트로 토큰 전달 → 자동 로그인
    return NextResponse.redirect(`${site}/?token=${customToken}&auth=kakao`)
  } catch (err) {
    console.error("[kakao] OAuth 처리 오류:", err)
    return NextResponse.redirect(`${site}/login?error=kakao_internal`)
  }
}
