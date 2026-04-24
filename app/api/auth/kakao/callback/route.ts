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

    console.log("[kakao] 토큰 교환 시작, redirect_uri:", `${site}/api/auth/kakao/callback`)

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

    const tokenData = await tokenRes.json()
    const { access_token } = tokenData
    console.log("[kakao] 토큰 교환 성공")

    // 2. access token → 사용자 정보
    const userRes = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    if (!userRes.ok) {
      const errText = await userRes.text()
      console.error("[kakao] 사용자 조회 실패:", errText)
      return NextResponse.redirect(`${site}/login?error=kakao_user_failed`)
    }

    const kakaoUser = await userRes.json()
    const uid = `kakao:${kakaoUser.id}`
    const email = kakaoUser.kakao_account?.email
    const displayName = kakaoUser.kakao_account?.profile?.nickname
    const photoURL = kakaoUser.kakao_account?.profile?.profile_image_url
    console.log("[kakao] 사용자 조회 성공, uid:", uid)

    // 3. Firebase Admin 초기화 확인
    let adminAuth
    try {
      adminAuth = getAdminAuth()
    } catch (adminInitErr) {
      console.error("[kakao] Firebase Admin 초기화 오류:", adminInitErr)
      return NextResponse.redirect(`${site}/login?error=admin_init_failed`)
    }

    if (!adminAuth) {
      console.error("[kakao] Firebase Admin 초기화 실패: getAdminAuth() returned null")
      return NextResponse.redirect(`${site}/login?error=admin_not_ready`)
    }

    // 4. 사용자 프로필 업데이트/생성
    try {
      await adminAuth.updateUser(uid, {
        displayName,
        photoURL,
        ...(email ? { email } : {}),
      })
      console.log("[kakao] 사용자 업데이트 성공")
    } catch {
      // 사용자가 없으면 생성
      try {
        await adminAuth.createUser({
          uid,
          displayName,
          photoURL,
          ...(email ? { email } : {}),
        })
        console.log("[kakao] 사용자 생성 성공")
      } catch (createErr) {
        console.error("[kakao] 사용자 생성 오류:", createErr)
        return NextResponse.redirect(`${site}/login?error=user_create_failed`)
      }
    }

    // 5. 커스텀 토큰 발급
    let customToken
    try {
      customToken = await adminAuth.createCustomToken(uid, { provider: "kakao" })
      console.log("[kakao] 커스텀 토큰 발급 성공")
    } catch (tokenErr) {
      console.error("[kakao] 커스텀 토큰 발급 오류:", tokenErr)
      return NextResponse.redirect(`${site}/login?error=custom_token_failed`)
    }

    // 6. 클라이언트로 토큰 전달 → 자동 로그인
    return NextResponse.redirect(`${site}/?token=${customToken}&auth=kakao`)
  } catch (err) {
    console.error("[kakao] OAuth 처리 오류 (예상치 못한 예외):", err)
    return NextResponse.redirect(`${site}/login?error=kakao_internal`)
  }
}
