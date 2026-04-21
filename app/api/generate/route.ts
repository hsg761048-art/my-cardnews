import { NextRequest, NextResponse } from "next/server"
import { generateCardNews } from "@/lib/ai-providers"
import type { AIProvider, BrandKitHint } from "@/lib/ai-providers"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      mode,
      userPrompt,
      provider = "gemini",
      apiKey,
      geminiApiKey,
      claudeApiKey,
      slideCount = 5,
      brandKit,
    } = body

    if (!userPrompt || userPrompt.trim().length === 0) {
      return NextResponse.json({ error: "userPrompt가 필요합니다." }, { status: 400 })
    }

    // ── API 키 해석 ──────────────────────────────────────────────
    // 우선순위: 클라이언트 명시 키 > 클라이언트 저장 키 > 서버 환경변수
    const resolvedGeminiKey =
      (provider === "gemini" ? apiKey : undefined) ||
      geminiApiKey ||
      process.env.GEMINI_API_KEY ||
      "mock"

    const resolvedClaudeKey =
      (provider === "claude" ? apiKey : undefined) ||
      claudeApiKey ||
      process.env.ANTHROPIC_API_KEY ||
      ""

    const commonInput = {
      mode,
      userPrompt: userPrompt.trim(),
      slideCount,
      brandKit: brandKit as BrandKitHint | undefined,
    }

    const styles = ["minimal", "bold", "elegant"] as const

    // 스타일별 생성 함수 (폴백 포함)
    async function generateWithFallback(cardStyle: typeof styles[number]) {
      const input = { ...commonInput, cardStyle }
      try {
        return await generateCardNews({
          ...input,
          provider: provider as AIProvider,
          apiKey: provider === "gemini" ? resolvedGeminiKey : resolvedClaudeKey,
        })
      } catch (primaryErr: unknown) {
        const msg = primaryErr instanceof Error ? primaryErr.message : String(primaryErr)
        const isRetriable = msg.includes("503") || msg.includes("429") || msg.includes("UNAVAILABLE") || msg.includes("RESOURCE_EXHAUSTED")
        const hasFallback = provider === "gemini"
          ? resolvedClaudeKey && resolvedClaudeKey !== "mock"
          : resolvedGeminiKey && resolvedGeminiKey !== "mock"

        if (!isRetriable || !hasFallback) throw primaryErr

        console.info(`[generate:${cardStyle}] ${provider} 실패 → 폴백`)
        const fallbackProvider: AIProvider = provider === "gemini" ? "claude" : "gemini"
        const fallbackKey = fallbackProvider === "claude" ? resolvedClaudeKey : resolvedGeminiKey
        return generateCardNews({ ...input, provider: fallbackProvider, apiKey: fallbackKey })
      }
    }

    // ── 3가지 스타일 동시 생성 ───────────────────────────────────
    const [minimalResult, boldResult, elegantResult] = await Promise.all(
      styles.map(s => generateWithFallback(s))
    )

    const result = {
      slidesByStyle: {
        minimal: minimalResult.slides,
        bold:    boldResult.slides,
        elegant: elegantResult.slides,
      },
      title:    minimalResult.title,
      mainCopy: minimalResult.mainCopy,
    }
    return NextResponse.json(result)
  } catch (err: unknown) {
    console.error("[/api/generate] 오류:", err)
    const message = err instanceof Error ? err.message : "알 수 없는 오류"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
