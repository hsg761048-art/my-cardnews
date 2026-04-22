/**
 * Firestore 기반 라이브러리 — 로그인한 사용자의 카드뉴스 클라우드 저장
 *
 * 구조: users/{uid}/cardnews/{id}
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  orderBy,
  query,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import type { Slide } from "@/components/editor/editor-types"

export interface CloudLibraryItem {
  id: string
  title: string
  slides: Slide[]
  createdAt: number
  updatedAt: number
  thumbnail?: string
}

function getCollection(uid: string) {
  if (!db) throw new Error("Firestore가 설정되지 않았습니다")
  return collection(db, "users", uid, "cardnews")
}

export async function saveCloudLibraryItem(uid: string, item: CloudLibraryItem): Promise<void> {
  if (!db) return
  const ref = doc(getCollection(uid), item.id)
  await setDoc(ref, {
    title: item.title,
    slides: item.slides,
    thumbnail: item.thumbnail || null,
    createdAt: item.createdAt,
    updatedAt: serverTimestamp(),
  })
}

export async function listCloudLibrary(uid: string): Promise<CloudLibraryItem[]> {
  if (!db) return []
  const q = query(getCollection(uid), orderBy("updatedAt", "desc"))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data() as DocumentData
    return {
      id: d.id,
      title: data.title || "제목 없음",
      slides: data.slides || [],
      thumbnail: data.thumbnail || undefined,
      createdAt: data.createdAt || Date.now(),
      updatedAt: typeof data.updatedAt?.toMillis === "function" ? data.updatedAt.toMillis() : Date.now(),
    }
  })
}

export async function getCloudLibraryItem(uid: string, id: string): Promise<CloudLibraryItem | null> {
  if (!db) return null
  const ref = doc(getCollection(uid), id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const data = snap.data() as DocumentData
  return {
    id: snap.id,
    title: data.title || "제목 없음",
    slides: data.slides || [],
    thumbnail: data.thumbnail || undefined,
    createdAt: data.createdAt || Date.now(),
    updatedAt: typeof data.updatedAt?.toMillis === "function" ? data.updatedAt.toMillis() : Date.now(),
  }
}

export async function deleteCloudLibraryItem(uid: string, id: string): Promise<void> {
  if (!db) return
  const ref = doc(getCollection(uid), id)
  await deleteDoc(ref)
}
