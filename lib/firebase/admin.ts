/**
 * Firebase Admin SDK 초기화 (서버 전용)
 * - 카카오/네이버 OAuth 콜백에서 커스텀 토큰 발급에 사용
 * - 서비스 계정 자격증명 필요
 */
import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getAuth, type Auth } from "firebase-admin/auth"

function getAdminApp(): App | null {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (!projectId || !clientEmail || !privateKey) {
    return null
  }

  if (getApps().length) {
    return getApps()[0]
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  })
}

export function getAdminAuth(): Auth | null {
  const app = getAdminApp()
  if (!app) return null
  return getAuth(app)
}

export const isAdminConfigured = Boolean(
  process.env.FIREBASE_ADMIN_PROJECT_ID &&
  process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
  process.env.FIREBASE_ADMIN_PRIVATE_KEY
)
