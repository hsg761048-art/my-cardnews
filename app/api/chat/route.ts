import { NextRequest, NextResponse } from "next/server"

const GEMINI_MODELS = [
  "gemini-3.1-flash-lite-preview",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
]

const SYSTEM_PROMPT = `당신은 카드뉴스 제작 전문 어시스턴트입니다.
사용자가 원하는 카드뉴스를 만들 수 있도록 친근하고 전문적으로 대화하세요.

대화 목표:
1. 사용자가 원하는 카드뉴스 주제/목적 파악
2. 필요 시 아래 정보를 자연스럽게 질문하여 수집:
   - 핵심 메시지 또는 강조할 내용
   - 타겟 독자 (예: 20대 직장인, 부모님, 학생 등)
   - 사용할 플랫폼 (인스타그램, 블로그, 카카오채널 등)
   - 슬라이드 수 (기본 5장)
   - 톤앤매너 (친근하게, 전문적으로, 유머러스하게 등)
3. 충분한 정보가 모이면 생성 준비가 됐음을 알리기

중요한 규칙:
- 한 번에 너무 많은 질문을 하지 마세요. 1~2개씩 자연스럽게 물어보세요.
- 이미 사용자가 말한 내용은 다시 묻지 마세요.
- 충분한 정보(주제 + 핵심 내용)가 모이면 "이 정도면 카드뉴스를 만들 준비가 됐어요! '지금 카드뉴스 생성하기' 버튼을 눌러주세요 🎨" 라고 안내하세요.
- 응답은 간결하게 2~4문장 이내로 유지하세요.
- 이모지를 적절히 사용해 친근한 분위기를 만드세요.
- 반드시 한국어로 답하세요.`

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

async function callGemini(messages: ChatMessage[], apiKey: string, model: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  // Gemini multi-turn conversation format
  const contents = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }))

  const body = {
    system_instruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents,
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 512,
    },
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!res.ok) return null

  const data = await res.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null
}

export async function POST(req: NextRequest) {
  try {
    const { messages, geminiApiKey } = await req.json()

    const apiKey = geminiApiKey || process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === "mock") {
      // API 키 없을 때 기본 응답
      return NextResponse.json({
        reply: "안녕하세요! 어떤 카드뉴스를 만들고 싶으신가요? 주제와 핵심 내용을 알려주세요 😊",
      })
    }

    // 시스템 메시지 제외하고 실제 대화만 추출
    const chatMessages: ChatMessage[] = (messages || [])
      .filter((m: ChatMessage) => m.role === "user" || m.role === "assistant")

    // Gemini 모델 순차 시도
    for (const model of GEMINI_MODELS) {
      try {
        const reply = await callGemini(chatMessages, apiKey, model)
        if (reply) {
          return NextResponse.json({ reply })
        }
      } catch {
        continue
      }
    }

    return NextResponse.json({ reply: "잠시 후 다시 시도해주세요. 어떤 카드뉴스를 원하시나요? 😊" })
  } catch {
    return NextResponse.json({ reply: "오류가 발생했어요. 다시 말씀해주세요!" })
  }
}
