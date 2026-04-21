import { NextRequest, NextResponse } from "next/server"

export const maxDuration = 30

// ─── HTML → 순수 텍스트 추출 ───────────────────────────────────────
function extractText(html: string): string {
  // 스크립트·스타일·SVG·주석 제거
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")

  // 줄바꿈 유지 (블록 요소 → 줄바꿈)
  text = text
    .replace(/<\/(p|div|li|h[1-6]|br|tr|blockquote)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")

  // 모든 태그 제거
  text = text.replace(/<[^>]+>/g, " ")

  // HTML 엔티티 디코딩
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z]+;/gi, " ")

  // 연속 공백·빈 줄 정리
  text = text
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

  return text
}

// ─── Naver 블로그 전용 본문 추출 ──────────────────────────────────
// Naver 블로그는 iframe 구조라 모바일 버전 URL을 사용
function naverBlogMobileUrl(url: string): string {
  // https://blog.naver.com/id/postNo → https://m.blog.naver.com/id/postNo
  return url.replace("//blog.naver.com/", "//m.blog.naver.com/")
}

// ─── 메인 핸들러 ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL이 필요합니다." }, { status: 400 })
    }

    // Naver 블로그는 모바일 버전으로 접근 (iframe 우회)
    const isNaver = url.includes("blog.naver.com")
    const fetchUrl = isNaver ? naverBlogMobileUrl(url) : url

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15000)

    let html: string
    try {
      const res = await fetch(fetchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8",
          "Cache-Control": "no-cache",
        },
        signal: controller.signal,
      })
      clearTimeout(timer)

      if (!res.ok) {
        return NextResponse.json(
          { error: `URL 접근 실패 (${res.status}): ${fetchUrl}` },
          { status: 502 }
        )
      }
      html = await res.text()
    } catch (e) {
      clearTimeout(timer)
      const msg = e instanceof Error ? e.message : String(e)
      return NextResponse.json({ error: `URL 가져오기 실패: ${msg}` }, { status: 502 })
    }

    // 본문 텍스트 추출
    const rawText = extractText(html)

    // 너무 짧으면 실패로 간주 (로그인 페이지, 빈 페이지 등)
    if (rawText.length < 100) {
      return NextResponse.json(
        { error: "해당 페이지에서 충분한 내용을 가져오지 못했습니다. 비공개 글이거나 로그인이 필요할 수 있어요." },
        { status: 422 }
      )
    }

    // AI에게 전달할 분량 제한 (약 3000자 → ~2000 토큰 절약)
    const content = rawText.slice(0, 3000)

    console.info(`[fetch-url] ${url} → ${content.length}자 추출 완료`)
    return NextResponse.json({ content, url: fetchUrl })
  } catch (err: unknown) {
    console.error("[/api/fetch-url] 오류:", err)
    const message = err instanceof Error ? err.message : "알 수 없는 오류"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
