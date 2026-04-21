import { NextRequest, NextResponse } from "next/server"

// Vercel 서버리스 타임아웃 연장 (FLUX 폴링 대응)
export const maxDuration = 60

// ─── 스타일별 설정 ───────────────────────────────────────────────

// Pexels 색상 필터 (elegant: 어둡지 않아도 됨 → 필터 제거로 다양한 고급 이미지 허용)
const STYLE_COLOR_FILTER: Record<string, string> = {
  minimal: "white",
  bold: "",
  elegant: "",
}

// Pexels 폴백 키워드
const STYLE_FALLBACK_KEYWORDS: Record<string, string[]> = {
  minimal: ["clean minimal workspace", "simple light interior", "white flat lay aesthetic"],
  bold: ["vibrant street photography", "colorful festival crowd", "dynamic sports action"],
  elegant: ["luxury interior dark", "premium product dark background", "moody portrait studio"],
}

// FLUX.1 Pro 스타일별 프롬프트 구조
// 핵심 원칙: [촬영방식] + [콘텐츠/피사체] + [품질]
const FLUX_STYLE_CONFIG: Record<string, { prefix: string; suffix: string }> = {
  minimal: {
    prefix: "clean product photography of",
    suffix: ", pure white background, soft diffused studio lighting, sharp focus, high resolution 4k, professional commercial photo",
  },
  bold: {
    prefix: "dynamic vibrant editorial photo of",
    suffix: ", bold saturated colors, strong contrast, energetic composition, high resolution, striking visual impact",
  },
  elegant: {
    prefix: "luxury high-end editorial photography of",
    suffix: ", sophisticated premium styling, refined elegant composition, high-fashion aesthetic — could be cream ivory gold rose champagne or deep navy, professional commercial photography, 4k",
  },
}

// ─── Pexels API ──────────────────────────────────────────────────
async function searchPexels(
  query: string,
  apiKey: string,
  color?: string
): Promise<string | null> {
  try {
    const params: Record<string, string> = {
      query,
      per_page: "20",
      orientation: "square",
      size: "large",
    }
    if (color) params.color = color

    const res = await fetch(
      `https://api.pexels.com/v1/search?${new URLSearchParams(params)}`,
      { headers: { Authorization: apiKey } }
    )
    if (!res.ok) return null

    const data = await res.json()
    const photos = data?.photos
    if (!photos || photos.length === 0) return null

    const random = photos[Math.floor(Math.random() * photos.length)]
    return random.src?.large2x || random.src?.large || null
  } catch {
    return null
  }
}

// 한국어 포함 여부
function hasKorean(text: string): boolean {
  return /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(text)
}

// ─── 검색어 전략 ─────────────────────────────────────────────────
//
// Pexels 최적 전략:
//   1순위: bgImagePrompt (영어, 슬라이드별 고유, AI가 제품+맥락 생성)
//          → "minimalist silk scarf draped on white marble" 같은 슬라이드별 다른 쿼리
//          → 슬라이드마다 다른 이미지 + 제품 관련 이미지 보장
//   2순위: originalTopic (한국어 가능, 모든 슬라이드가 동일해지는 단점)
//   3순위: slideTitle (감성 카피라 Pexels엔 부적합하지만 최후 수단)
//
// ⚠️ 주의: originalTopic을 1순위로 쓰면 모든 슬라이드가 같은 이미지 풀에서
//          선택되어 동일한 배경이 반복됨 → 반드시 bgImagePrompt를 우선시!

function buildPexelsQuery(
  originalTopic: string,
  bgImagePrompt: string,
  slideTitle: string
): string {
  // 1순위: 영어 bgImagePrompt — 슬라이드별 고유 키워드 + 제품 맥락 포함
  if (bgImagePrompt && !hasKorean(bgImagePrompt) && bgImagePrompt.split(" ").length >= 2) {
    return bgImagePrompt
  }
  // 2순위: 원본 주제 — 제품 관련성은 보장되나 모든 슬라이드가 동일해짐
  if (originalTopic && originalTopic.trim().length >= 2) {
    return originalTopic.trim()
  }
  // 3순위: 폴백
  return slideTitle || "fashion lifestyle"
}

// FLUX용: bgImagePrompt 우선, 없으면 originalTopic
function buildFluxPrompt(
  originalTopic: string,
  bgImagePrompt: string,
  slideTitle: string
): string {
  if (bgImagePrompt && !hasKorean(bgImagePrompt) && bgImagePrompt.split(" ").length >= 2) {
    return bgImagePrompt
  }
  return originalTopic || slideTitle || "beautiful fashion lifestyle"
}

// ─── FLUX.1 Pro via fal.ai (동기 방식) ──────────────────────────
// fal.run = 동기 엔드포인트 (결과를 바로 반환, 폴링 불필요)
// queue.fal.run = 비동기 (폴링 필요, 타임아웃 위험 있음)
async function callFlux(
  contentPrompt: string,
  style: string,
  apiKey: string
): Promise<string | null> {
  try {
    const config = FLUX_STYLE_CONFIG[style] ?? FLUX_STYLE_CONFIG.minimal

    // 한국어 프롬프트 감지 → 그대로 사용하되 경고 (FLUX는 한국어 이해 가능)
    if (hasKorean(contentPrompt)) {
      console.warn(`[FLUX] 한국어 프롬프트 감지: "${contentPrompt}" — 영어로 생성해야 더 정확합니다`)
    }

    // 프롬프트: "[촬영방식] [피사체]" — 피사체가 반드시 주인공
    const fullPrompt = `${config.prefix} ${contentPrompt}${config.suffix}`
    console.info(`[FLUX] 프롬프트: "${fullPrompt}"`)

    // 동기 엔드포인트 사용 — 폴링 없이 결과 직접 반환 (응답시간 15~30초)
    const res = await fetch("https://fal.run/fal-ai/flux-pro/v1.1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Key ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        image_size: "square_hd",  // 1024×1024
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        safety_tolerance: 5,
        output_format: "jpeg",
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("[FLUX] 오류:", res.status, err)
      return null
    }

    const data = await res.json()
    const imageUrl = data?.images?.[0]?.url ?? data?.image?.url ?? null
    console.info(`[FLUX] 완료 → ${imageUrl}`)
    return imageUrl
  } catch (e) {
    console.error("[FLUX] 예외:", e)
    return null
  }
}

// ─── Pollinations.ai 최종 폴백 ───────────────────────────────────
function getPollinationsUrl(prompt: string): string {
  const seed = Math.floor(Math.random() * 100000)
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nologo=true&enhance=true`
}

// ─── Pexels 4단계 폴백 체인 ──────────────────────────────────────
async function pexelsFallbackChain(theme: string, style: string): Promise<string | null> {
  const pexelsKey = process.env.PEXELS_API_KEY
  if (!pexelsKey) return null

  const styleColor   = STYLE_COLOR_FILTER[style] ?? ""
  const fallbackList = STYLE_FALLBACK_KEYWORDS[style] ?? STYLE_FALLBACK_KEYWORDS.minimal
  const fallback     = fallbackList[Math.floor(Math.random() * fallbackList.length)]

  if (theme) {
    const u = await searchPexels(theme, pexelsKey, styleColor || undefined)
    if (u) return u
  }
  if (theme && styleColor) {
    const u = await searchPexels(theme, pexelsKey)
    if (u) return u
  }
  const u3 = await searchPexels(fallback, pexelsKey, styleColor || undefined)
  if (u3) return u3
  return searchPexels(fallback, pexelsKey)
}

// ─── 메인 핸들러 ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      style = "minimal",
      theme = "",           // AI bgImagePrompt
      slideTitle = "",      // 슬라이드 감성 카피 제목 (이미지 검색엔 부적합)
      originalTopic = "",   // 유저 원본 입력 ("새로운 스카프 출시") → 1순위
      bgSource = "pexels",
      fluxApiKey = "",
    } = body

    // Pexels용: 원본 주제 → bgImagePrompt → slideTitle 순
    const pexelsQuery = buildPexelsQuery(originalTopic, theme, slideTitle)
    // FLUX용: bgImagePrompt(슬라이드별 맥락) → 원본 주제 순
    const fluxPromptBase = buildFluxPrompt(originalTopic, theme, slideTitle)

    console.info(
      `[generate-bg] topic="${originalTopic}" title="${slideTitle}" theme="${theme}"` +
      ` → pexels="${pexelsQuery}" flux="${fluxPromptBase}"`
    )

    let imageUrl: string | null = null

    if (bgSource === "flux") {
      const key = fluxApiKey || process.env.FLUX_API_KEY || ""

      if (!key) {
        return NextResponse.json(
          { error: "FLUX API 키가 없습니다. 결과 페이지에서 키를 입력해주세요." },
          { status: 400 }
        )
      }

      imageUrl = await callFlux(fluxPromptBase, style, key)

      if (!imageUrl) {
        console.warn("[generate-bg] FLUX 실패 → Pexels 폴백")
        imageUrl = await pexelsFallbackChain(pexelsQuery, style)
      }
    } else {
      imageUrl = await pexelsFallbackChain(pexelsQuery, style)
    }

    // 최종 폴백: Pollinations
    if (!imageUrl) {
      imageUrl = getPollinationsUrl(originalTopic || theme || "abstract background")
    }

    return NextResponse.json({ imageUrl })
  } catch (err: unknown) {
    console.error("[/api/generate-bg] 오류:", err)
    const message = err instanceof Error ? err.message : "알 수 없는 오류"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
