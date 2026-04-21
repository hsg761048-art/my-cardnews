// 라이브러리: 저장된 카드뉴스 관리 (localStorage 기반)
import type { Slide } from "@/components/editor/editor-types"

export interface LibraryItem {
  id: string
  title: string          // 카드 표시 제목 (첫 슬라이드 제목)
  originalTopic: string  // 유저가 입력한 원본 주제
  style: string          // minimal | bold | elegant
  slides: Slide[]        // 에디터 포맷 슬라이드 (bgImageUrl 포함)
  thumbnail?: string     // 첫 슬라이드 배경 이미지 URL (미리보기용)
  createdAt: number
  updatedAt: number
}

const LIBRARY_KEY = "card-news-library"
const MAX_ITEMS = 30

export function getLibraryItems(): LibraryItem[] {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY)
    if (!raw) return []
    return JSON.parse(raw) as LibraryItem[]
  } catch {
    return []
  }
}

export function getLibraryItem(id: string): LibraryItem | null {
  const items = getLibraryItems()
  return items.find(item => item.id === id) ?? null
}

export function saveToLibrary(
  data: Omit<LibraryItem, "id" | "createdAt" | "updatedAt">
): LibraryItem {
  const items = getLibraryItems()
  const now = Date.now()
  const newItem: LibraryItem = {
    ...data,
    id: `lib_${now}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  }
  // 최신순, 최대 30개
  const updated = [newItem, ...items].slice(0, MAX_ITEMS)
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(updated))
  return newItem
}

export function updateLibraryItem(
  id: string,
  updates: Partial<Omit<LibraryItem, "id" | "createdAt">>
): void {
  const items = getLibraryItems()
  const updated = items.map(item =>
    item.id === id
      ? { ...item, ...updates, updatedAt: Date.now() }
      : item
  )
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(updated))
}

export function deleteLibraryItem(id: string): void {
  const items = getLibraryItems()
  localStorage.setItem(
    LIBRARY_KEY,
    JSON.stringify(items.filter(item => item.id !== id))
  )
}

// 현재 편집 중인 라이브러리 아이템 ID (에디터 ↔ 결과 페이지 연결용)
const CURRENT_LIB_ID_KEY = "library-current-id"

export function getCurrentLibraryId(): string | null {
  try { return localStorage.getItem(CURRENT_LIB_ID_KEY) } catch { return null }
}

export function setCurrentLibraryId(id: string | null): void {
  try {
    if (id) localStorage.setItem(CURRENT_LIB_ID_KEY, id)
    else localStorage.removeItem(CURRENT_LIB_ID_KEY)
  } catch {}
}
