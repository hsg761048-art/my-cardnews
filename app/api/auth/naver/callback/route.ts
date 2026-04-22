import { NextRequest, NextResponse } from "next/server"
import { getAdminAuth, isAdminConfigured } from "@/lib/firebase/admin"

/**
 * 네이버 OAuth 콜백
 * 1. 네이버로부터 받은 code를 access token으로 교환
 * 2. access token으로 사용자 프로필 조회
 * 3. Firebase Admin SDK로 커스텀 토큰 발급
 * 4. /?token=xxx&auth=naver 로 리다이렉트
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  const state = req.nextUrl.searchParams.get("state")
  const site = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin

  if (!code || !state) {
    return NextResponse.redirect(`${site}/login?error=no_code`)
  }

  if (!isAdminConfigured) {
    return NextResponse.redirect(`${site}/login?error=firebase_not_configured`)
  }

  const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${site}/login?error=naver_not_configured`)
  }

  try {
    // 1. code → access token
    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      code,
      state,
    })

    const tokenRes = await fetch(`https://nid.naver.com/oauth2.0/token?${tokenParams.toString()}`, {
      method: "GET",
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      console.error("[naver] 토큰 교환 실패:", errText)
      return NextResponse.redirect(`${site}/login?error=naver_token_failed`)
    }

    const tokenData = await tokenRes.json()
    if (tokenData.error) {
      console.error("[naver] 토큰 오류:", tokenData)
      return NextResponse.redirect(`${site}/login?error=naver_token_failed`)
    }

    // 2. access token → 사용자 정보
    const userRes = await fetch("https://openapi.naver.com/v1/nid/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    if (!userRes.ok) {
      return NextResponse.redirect(`${site}/login?error=naver_user_failed`)
    }

    const naverUser = await userRes.json()
    const profile = naverUser.response
    if (!profile?.id) {
      return NextResponse.redirect(`${site}/login?error=naver_no_profile`)
    }

    const uid = `naver:${profile.id}`
    const email = profile.email
    const displayName = profile.nickname || profile.name
    const photoURL = profile.profile_image

    // 3. Firebase 커스텀 토큰 발급
    const adminAuth = getAdminAuth()
    if (!adminAuth) {
      return NextResponse.redirect(`${site}/login?error=admin_not_ready`)
    }

    try {
      await adminAuth.updateUser(uid, {
        displayName,
        photoURL,
        ...(email ? { email } : {}),
      })
    } catch {
      await adminAuth.createUser({
        uid,
        displayName,
        photoURL,
        ...(email ? { email } : {}),
      })
    }

    const customToken = await adminAuth.createCustomToken(uid, { provider: "naver" })

    // 4. 클라이언트로 토큰 전달
    return NextResponse.redirect(`${site}/?token=${customToken}&auth=naver`)
  } catch (err) {
    console.error("[naver] OAuth 처리 오류:", err)
    return NextResponse.redirect(`${site}/login?error=naver_internal`)
  }
}
