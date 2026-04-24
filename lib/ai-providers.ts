// AI Provider 추상화 레이어
// SDK 없이 REST fetch로 Gemini / Claude 모두 지원

export type AIProvider = "gemini" | "claude"

// ─── AI가 생성하는 슬라이드별 디자인 ────────────────────────────
export interface GeneratedDesign {
  background: string      // CSS background 값 (solid color or gradient)
  textColor: string       // 본문 텍스트 색상
  titleColor: string      // 제목 텍스트 색상
  ctaBg: string           // CTA 버튼 배경색
  ctaText: string         // CTA 버튼 텍스트 색상
  fontFamily: "pretendard" | "noto-sans" | "nanum-gothic" | "nanum-myeongjo"
  bgImagePrompt: string   // DALL-E / Stability 등 이미지 생성용 영어 프롬프트
}

export interface GeneratedSlide {
  title: string
  subtitle?: string
  content: string
  cta?: string
  design?: GeneratedDesign
}

export interface BrandKitHint {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  font: string
  voiceStyle: string
}

export interface GenerateCardInput {
  mode: "chat" | "url" | "form"
  userPrompt: string       // 유저 입력 (대화 내용 or URL or 폼 데이터)
  slideCount?: number      // 기본 5장
  provider: AIProvider
  apiKey: string
  brandKit?: BrandKitHint  // 브랜드 키트 힌트 (선택 적용 토글)
  cardStyle?: "minimal" | "bold" | "elegant"  // 스타일별 다른 카피 어조
}

export interface GenerateCardResult {
  slides: GeneratedSlide[]
  title: string
  mainCopy: string
}

// ─── 카드뉴스 생성 프롬프트 ──────────────────────────────────────
function buildPrompt(input: GenerateCardInput): string {
  const count = input.slideCount ?? 5

  const modeContext =
    input.mode === "url"
      ? `다음 URL 또는 링크 내용을 바탕으로`
      : input.mode === "form"
      ? `다음 정보를 바탕으로`
      : `다음 요청을 바탕으로`

  // 브랜드 키트 힌트 섹션 (선택적)
  const brandKitSection = input.brandKit
    ? `
[브랜드 키트 - 디자인 반영 필수]
- 메인 컬러: ${input.brandKit.primaryColor}
- 서브 컬러: ${input.brandKit.secondaryColor}
- 강조 컬러: ${input.brandKit.accentColor}
- 폰트: ${input.brandKit.font}
- 보이스 스타일: ${input.brandKit.voiceStyle}
위 브랜드 컬러를 design 필드의 background, titleColor, ctaBg 등에 최대한 반영하세요.
폰트는 아래 fontFamily 목록 중 가장 유사한 것으로 매핑하세요.
`
    : ""

  // 스타일별 완전히 다른 카피 어조 + 디자인 방향
  const styleGuide = {
    minimal: `
[스타일: MINIMAL — 간결하고 직관적]
카피 원칙:
- 짧고 명확한 문장. 불필요한 형용사 제거. 핵심 한 줄로 전달.
- 여백의 미. 과하지 않게. 담백하고 신뢰감 있는 어조.
- 예) "지금 필요한 것, 딱 하나만." / "단순함이 답이다."
디자인 원칙:
- 밝고 깔끔한 배경. 흰색·아이보리·연한 그레이 계열.
- 포인트 컬러 1가지만 사용. 폰트: pretendard 또는 noto-sans.
- bgImagePrompt: 밝고 깔끔한 제품/장면 (clean, bright, minimal)`,

    bold: `
[스타일: BOLD — 강렬하고 임팩트 있는]
카피 원칙:
- 에너지 넘치는 강한 동사. 감탄사 활용. FOMO(놓치면 후회) 자극.
- 짧고 강렬한 슬로건. 행동 유도. 숫자/퍼센트 적극 활용.
- 예) "지금 안 사면 진짜 후회해!" / "50% 할인, 오늘 딱 하루!"
디자인 원칙:
- 강렬하고 대비 높은 색상. 비비드 레드/오렌지/옐로/퍼플.
- 어두운 배경도 OK. 눈에 띄는 CTA 버튼. 폰트: nanum-gothic.
- bgImagePrompt: 역동적이고 화려한 장면 (vibrant, colorful, dynamic)`,

    elegant: `
[스타일: ELEGANT — 세련되고 품격 있는]
카피 원칙:
- 고급스럽고 감성적인 언어. 격조 있는 표현. 품위 있는 어조.
- 감성 자극. 라이프스타일 소구. 부드럽고 여운 있는 문장.
- 예) "당신의 품격을 완성하는 선택." / "특별한 순간을 위한 스카프."
디자인 원칙:
- 고급스러운 색상: 크림/아이보리/골드/로즈골드/샴페인/딥네이비/버건디.
- 반드시 어두울 필요 없음 — 밝은 크림+골드도 엘레강스. 폰트: nanum-myeongjo.
- bgImagePrompt: 고급스럽고 세련된 연출 (luxury, premium, sophisticated — light OR dark)`,
  }

  const selectedStyleGuide = styleGuide[input.cardStyle ?? "minimal"]

  return `당신은 SNS 카드뉴스 콘텐츠 + 디자인 전문가입니다.
${modeContext} 한국어 카드뉴스 슬라이드 ${count}장을 만들어주세요.
각 슬라이드에는 텍스트 콘텐츠와 함께 디자인(색상·폰트·배경 이미지 프롬프트)도 반드시 생성하세요.
${selectedStyleGuide}

[사용자 입력]
${input.userPrompt}
${brandKitSection}
[콘텐츠 규칙]
1. 슬라이드는 정확히 ${count}장으로 구성하세요.
2. 첫 번째 슬라이드는 위 스타일 원칙에 맞는 강렬한 제목과 핵심 메시지로 시선을 끌어주세요.
3. 중간 슬라이드(2~${count - 1}장)는 핵심 포인트를 하나씩, 스타일에 맞는 어조로 전달하세요.
4. 마지막 슬라이드는 스타일에 맞는 행동 유도(CTA)로 마무리하세요.
5. 각 슬라이드의 content는 2~3문장, 80자 이내로 작성하세요.
6. 위 스타일 가이드의 어조와 표현 방식을 철저히 따르세요.
7. subtitle은 선택사항(짧은 태그라인, 10자 이내)입니다.
8. cta는 마지막 슬라이드에만 필수, 나머지는 선택사항입니다.

[디자인 규칙]
- 각 슬라이드마다 content 주제와 감성에 어울리는 고유한 색상 팔레트를 생성하세요.
- background는 CSS gradient 또는 solid color 값을 직접 작성하세요.
  예) "linear-gradient(135deg, #1a1a2e 0%, #2d0f5e 100%)" 또는 "#1a1a2e"
- titleColor, textColor, ctaBg, ctaText는 배경과 대비가 충분한 색상으로 지정하세요.
- fontFamily는 반드시 다음 중 하나: "pretendard" | "noto-sans" | "nanum-gothic" | "nanum-myeongjo"
- bgImagePrompt: THIS FIELD MUST BE WRITTEN IN ENGLISH ONLY. NO KOREAN CHARACTERS ALLOWED.
  This field is used to search for a BACKGROUND PHOTO for this slide. Choose a UNIQUE angle for each slide.
  ★ RULE 1: ALWAYS include the main product/subject (e.g., "scarf", "coffee", "apartment"). No exceptions.
  ★ RULE 2: Each slide must have a DIFFERENT bgImagePrompt — vary the angle, scene, and focus.
  ★ RULE 3: ENGLISH ONLY — never write Korean in this field.
  ★ RULE 4: 5–8 English words. Start with the product noun, then add visual style/scene details.

  CORRECT examples — all different angles for same topic "스카프 출시":
  - slide 1 (hero): "silk scarf neatly folded white background minimal"
  - slide 2 (detail): "close up scarf fabric texture soft pastel light"
  - slide 3 (lifestyle): "woman wearing elegant scarf street fashion portrait"
  - slide 4 (product): "colorful scarves hanging boutique display rack"
  - slide 5 (cta): "luxury scarf gift box gold ribbon premium packaging"

  WRONG (never do this):
  - "스카프 시즌 오프 세일" ← KOREAN TEXT FORBIDDEN
  - "dark cosmic nebula" ← product missing, unrelated
  - Same prompt repeated across slides ← must be UNIQUE per slide

[출력 형식] 반드시 아래 JSON만 출력하세요. 다른 텍스트는 절대 포함하지 마세요.
{
  "slides": [
    {
      "title": "슬라이드 제목 (15자 이내)",
      "subtitle": "태그라인 (선택사항, 10자 이내)",
      "content": "본문 내용 (80자 이내)",
      "cta": "행동 유도 버튼 텍스트 (선택사항, 10자 이내)",
      "design": {
        "background": "CSS background 값",
        "textColor": "#hex 또는 rgba()",
        "titleColor": "#hex",
        "ctaBg": "#hex",
        "ctaText": "#hex",
        "fontFamily": "pretendard",
        "bgImagePrompt": "영어 배경 이미지 프롬프트"
      }
    }
  ]
}`
}

// ─── Gemini API 호출 (자동 폴백 체인) ───────────────────────────
// 우선순위: 3.1 preview (최신·최저비용) → 2.5-flash (stable) → 2.5-flash-lite
// gemini-2.0-flash-lite, gemini-1.5-flash → deprecated/404, 제거됨
const GEMINI_MODELS = [
  "gemini-3.1-flash-lite-preview",   // 최신·최저비용 (2026년 3월 출시)
  "gemini-2.5-flash",                // stable 폴백
  "gemini-2.5-flash-lite",           // 경량 stable 폴백
]

async function callGeminiModel(prompt: string, apiKey: string, model: string): Promise<{ ok: boolean; slides?: GeneratedSlide[]; status?: number }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.8,
      maxOutputTokens: 4096,
    },
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!res.ok) return { ok: false, status: res.status }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) return { ok: false, status: 200 }

  // JSON만 추출 (마크다운 코드블록 또는 trailing 텍스트 대응)
  let jsonText = text.trim()

  // 1) 마크다운 코드블록 우선 시도
  const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (codeBlockMatch) {
    jsonText = codeBlockMatch[1]
  } else {
    // 2) 첫 번째 완전한 JSON 오브젝트를 brace-depth로 정확히 추출
    //    (lastIndexOf 방식은 JSON 뒤 trailing 텍스트가 있으면 실패)
    const start = jsonText.indexOf("{")
    if (start !== -1) {
      let depth = 0
      let inString = false
      let escaped = false
      let end = -1
      for (let i = start; i < jsonText.length; i++) {
        const ch = jsonText[i]
        if (escaped)          { escaped = false; continue }
        if (ch === "\\" && inString) { escaped = true; continue }
        if (ch === '"')       { inString = !inString; continue }
        if (inString)         { continue }
        if (ch === "{")       { depth++ }
        else if (ch === "}") {
          depth--
          if (depth === 0)    { end = i; break }
        }
      }
      if (end !== -1) jsonText = jsonText.slice(start, end + 1)
    }
  }

  const parsed = JSON.parse(jsonText)
  return { ok: true, slides: parsed.slides as GeneratedSlide[] }
}

async function callGemini(prompt: string, apiKey: string): Promise<GeneratedSlide[]> {
  let lastError = ""

  for (const model of GEMINI_MODELS) {
    const result = await callGeminiModel(prompt, apiKey, model)
    if (result.ok && result.slides) {
      // 폴백이 발생한 경우 서버 로그에 기록
      if (model !== GEMINI_MODELS[0]) {
        console.info(`[Gemini] 폴백 성공: ${model}`)
      }
      return result.slides
    }
    // 404(모델 없음/deprecated) / 503(과부하) / 429(할당량 초과) → 다음 모델로 폴백
    const shouldFallback = result.status === 404 || result.status === 503 || result.status === 429
    lastError = `${model} 오류 (${result.status})`
    console.warn(`[Gemini] ${lastError}${shouldFallback ? " → 다음 모델로 폴백" : ""}`)
    if (!shouldFallback) break
  }

  throw new Error(`Gemini API 오류: 모든 모델 시도 실패 (${lastError})`)
}

// ─── Claude API 호출 ─────────────────────────────────────────────
async function callClaude(prompt: string, apiKey: string): Promise<GeneratedSlide[]> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Claude API 오류 (${res.status}): ${err}`)
  }

  const data = await res.json()
  const text = data?.content?.[0]?.text

  if (!text) throw new Error("Claude 응답이 비어있습니다.")

  // Claude는 JSON 블록을 마크다운 코드펜스로 감쌀 수 있으므로 추출
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, text]
  const parsed = JSON.parse(jsonMatch[1] ?? text)
  return parsed.slides as GeneratedSlide[]
}

// ─── Mock 데이터 (API 키 없을 때) ─────────────────────────────────
function getMockSlides(userPrompt: string): GeneratedSlide[] {
  const keyword = userPrompt.slice(0, 15) || "카드뉴스"
  return [
    {
      title: `${keyword}`,
      subtitle: "새로운 시작",
      content: "AI가 생성한 카드뉴스입니다. API 키를 설정하면 실제 콘텐츠와 맞춤 디자인이 생성됩니다.",
      cta: "자세히 보기",
      design: {
        background: "linear-gradient(135deg, #1a1a2e 0%, #2d0f5e 100%)",
        textColor: "rgba(255,255,255,0.85)",
        titleColor: "#c084fc",
        ctaBg: "#a855f7",
        ctaText: "#ffffff",
        fontFamily: "pretendard",
        bgImagePrompt: "dark cosmic purple nebula, soft glowing particles, cinematic, minimalist",
      },
    },
    {
      title: "핵심 포인트 1",
      content: "첫 번째 핵심 메시지입니다. 실제 API 연결 후 맞춤형 내용이 생성됩니다.",
      design: {
        background: "linear-gradient(135deg, #0c1445 0%, #0e3460 100%)",
        textColor: "rgba(255,255,255,0.85)",
        titleColor: "#7dd3fc",
        ctaBg: "#0ea5e9",
        ctaText: "#ffffff",
        fontFamily: "pretendard",
        bgImagePrompt: "deep ocean blue abstract waves, soft light reflections, minimal",
      },
    },
    {
      title: "핵심 포인트 2",
      content: "두 번째 핵심 메시지입니다. Gemini 무료 API 키를 발급받아 연결해보세요.",
      design: {
        background: "linear-gradient(135deg, #1a1000 0%, #3d2c00 100%)",
        textColor: "rgba(255,255,255,0.85)",
        titleColor: "#fbbf24",
        ctaBg: "#f59e0b",
        ctaText: "#1a1000",
        fontFamily: "pretendard",
        bgImagePrompt: "warm golden amber bokeh lights, dark background, luxury feel",
      },
    },
    {
      title: "핵심 포인트 3",
      content: "세 번째 핵심 메시지입니다. Google AI Studio에서 무료로 발급 가능합니다.",
      design: {
        background: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)",
        textColor: "rgba(255,255,255,0.85)",
        titleColor: "#6ee7b7",
        ctaBg: "#10b981",
        ctaText: "#ffffff",
        fontFamily: "pretendard",
        bgImagePrompt: "fresh green forest morning light, mist, serene nature photography",
      },
    },
    {
      title: "지금 시작하기",
      content: "더 알아볼 준비가 되셨나요? 설정에서 API 키를 입력해주세요.",
      cta: "지금 시작",
      design: {
        background: "linear-gradient(135deg, #431407 0%, #9a3412 100%)",
        textColor: "rgba(255,255,255,0.85)",
        titleColor: "#fed7aa",
        ctaBg: "#ea580c",
        ctaText: "#ffffff",
        fontFamily: "pretendard",
        bgImagePrompt: "vibrant sunset orange sky, dramatic clouds, inspiring, cinematic",
      },
    },
  ]
}

// ─── 메인 생성 함수 ──────────────────────────────────────────────
export async function generateCardNews(input: GenerateCardInput): Promise<GenerateCardResult> {
  const prompt = buildPrompt(input)

  let slides: GeneratedSlide[]

  // API 키가 없으면 Mock 반환
  if (!input.apiKey || input.apiKey === "mock") {
    slides = getMockSlides(input.userPrompt)
  } else if (input.provider === "gemini") {
    slides = await callGemini(prompt, input.apiKey)
  } else {
    slides = await callClaude(prompt, input.apiKey)
  }

  const first = slides[0]
  return {
    slides,
    title: first?.title ?? "AI 생성 카드뉴스",
    mainCopy: first?.content ?? "",
  }
}
