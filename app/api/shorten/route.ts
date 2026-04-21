import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "url 필드가 필요합니다" }, { status: 400 })
    }

    // TinyURL API — 인증 불필요, 무료
    const res = await fetch(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`,
      { method: "GET" }
    )

    if (!res.ok) {
      throw new Error(`TinyURL 응답 오류: ${res.status}`)
    }

    const shortUrl = await res.text()

    // tinyurl.com/... 형식인지 확인
    if (!shortUrl.startsWith("https://tinyurl.com/")) {
      throw new Error("단축 URL 형식이 올바르지 않습니다")
    }

    return NextResponse.json({ shortUrl })
  } catch (err) {
    console.error("[/api/shorten] 오류:", err)
    return NextResponse.json({ error: "URL 단축에 실패했습니다" }, { status: 500 })
  }
}
