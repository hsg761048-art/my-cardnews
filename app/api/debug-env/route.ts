import { NextResponse } from "next/server"

/**
 * 환경변수 설정 상태 진단 엔드포인트 (개발/디버깅용)
 * GET /api/debug-env
 */
export async function GET() {
  const check = (key: string, value: string | undefined) => ({
    set: Boolean(value),
    preview: value ? `${value.slice(0, 6)}...` : "(없음)",
  })

  return NextResponse.json({
    firebase_client: {
      NEXT_PUBLIC_FIREBASE_API_KEY: check("NEXT_PUBLIC_FIREBASE_API_KEY", process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: check("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: check("NEXT_PUBLIC_FIREBASE_PROJECT_ID", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
      NEXT_PUBLIC_FIREBASE_APP_ID: check("NEXT_PUBLIC_FIREBASE_APP_ID", process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
    },
    firebase_admin: {
      FIREBASE_ADMIN_PROJECT_ID: check("FIREBASE_ADMIN_PROJECT_ID", process.env.FIREBASE_ADMIN_PROJECT_ID),
      FIREBASE_ADMIN_CLIENT_EMAIL: check("FIREBASE_ADMIN_CLIENT_EMAIL", process.env.FIREBASE_ADMIN_CLIENT_EMAIL),
      FIREBASE_ADMIN_PRIVATE_KEY: {
        set: Boolean(process.env.FIREBASE_ADMIN_PRIVATE_KEY),
        has_newlines: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.includes("\n") ?? false,
        has_escaped_newlines: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.includes("\\n") ?? false,
        starts_with_begin: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.includes("BEGIN") ?? false,
      },
    },
    kakao: {
      NEXT_PUBLIC_KAKAO_REST_API_KEY: check("NEXT_PUBLIC_KAKAO_REST_API_KEY", process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY),
      KAKAO_CLIENT_SECRET: check("KAKAO_CLIENT_SECRET", process.env.KAKAO_CLIENT_SECRET),
    },
    site: {
      NEXT_PUBLIC_SITE_URL: check("NEXT_PUBLIC_SITE_URL", process.env.NEXT_PUBLIC_SITE_URL),
    },
  })
}
