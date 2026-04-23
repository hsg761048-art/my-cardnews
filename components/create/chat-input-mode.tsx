"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Sparkles, User, RotateCcw, Save } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatInputModeProps {
  onGenerate: (userPrompt: string) => void
  geminiApiKey?: string
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const STORAGE_KEY = "draft-chat"

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "안녕하세요! 🎨 어떤 카드뉴스를 만들고 싶으세요?\n\n주제와 핵심 내용을 편하게 말씀해 주시면, 함께 멋진 카드뉴스를 만들어드릴게요!",
  },
  {
    id: "2",
    role: "assistant",
    content: "💡 이렇게 말해보세요:\n\n• \"우리 카페 신메뉴 출시 카드뉴스 만들어줘\"\n• \"직원 10명 뽑는 채용공고를 카드뉴스로\"\n• \"인스타용 봄 세일 이벤트 5장짜리로\"\n• \"스타트업 IR용 회사 소개 슬라이드\"",
  },
]

const suggestedPrompts = [
  "🛍️ 신제품 출시 공지",
  "🏢 회사/브랜드 소개",
  "🎉 이벤트·프로모션",
  "💼 채용 공고",
  "📊 업계 트렌드 정보",
  "📣 서비스 업데이트 안내",
]

export function ChatInputMode({ onGenerate, geminiApiKey }: ChatInputModeProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ── 마운트 시 저장된 대화 복원 ───────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const { messages: savedMsgs, savedAt: at } = JSON.parse(saved)
        if (savedMsgs && savedMsgs.length > initialMessages.length) {
          setMessages(savedMsgs)
          setSavedAt(at)
        }
      }
    } catch {}
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // ── 메시지 변경 시 자동 저장 (유저 입력이 있을 때만) ─────────
  useEffect(() => {
    const hasUserMsg = messages.some(m => m.role === "user")
    if (!hasUserMsg) return
    const at = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, savedAt: at }))
      setSavedAt(at)
    } catch {}
  }, [messages])

  // ── 초기화 ───────────────────────────────────────────────────
  const handleReset = () => {
    setMessages(initialMessages)
    setInput("")
    setSavedAt(null)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setIsTyping(true)

    try {
      // 시스템 초기 메시지 제외하고 실제 대화만 전송
      const conversationHistory = updatedMessages
        .slice(initialMessages.length)
        .map(m => ({ role: m.role, content: m.content }))

      const apiKey = geminiApiKey || (() => {
        try { return localStorage.getItem("ai-key-gemini") || undefined } catch { return undefined }
      })()

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversationHistory,
          geminiApiKey: apiKey,
        }),
      })

      const data = await res.json()
      const reply = data.reply || "죄송해요, 잠시 후 다시 시도해주세요."

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply,
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "네, 알겠습니다! 더 추가하실 내용이 있으신가요? 준비가 되시면 '지금 카드뉴스 생성하기' 버튼을 눌러주세요 🎨",
      }
      setMessages(prev => [...prev, assistantMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleGenerateNow = () => {
    // 전체 대화 내용을 요약해서 카드뉴스 생성 프롬프트로 전달
    const userMessages = messages
      .filter(m => m.role === "user")
      .map(m => m.content)
    const assistantInsights = messages
      .filter(m => m.role === "assistant" && !initialMessages.find(im => im.id === m.id))
      .map(m => m.content)

    const fullContext = [
      "=== 사용자 요청 ===",
      userMessages.join("\n"),
      assistantInsights.length > 0 ? "\n=== AI와 논의된 추가 내용 ===" : "",
      assistantInsights.join("\n"),
    ].filter(Boolean).join("\n")

    onGenerate(fullContext || "카드뉴스를 만들어주세요")
  }

  const handleSuggestion = (prompt: string) => {
    setInput(prompt)
    textareaRef.current?.focus()
  }

  const hasUserMsg = messages.some(m => m.role === "user")

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg shadow-pink-100/50 overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-pink-50/80 to-violet-50/80">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center shadow-md shadow-pink-200">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 text-lg">내머리속 AI</h2>
          <p className="text-sm text-slate-400">카드뉴스 생성 어시스턴트</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {savedAt && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Save className="w-3 h-3" />
              {savedAt} 저장
            </span>
          )}
          {hasUserMsg && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 border border-red-200 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              초기화
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-500 font-medium">온라인</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="h-72 overflow-y-auto px-6 py-5 space-y-4 bg-gradient-to-b from-slate-50/50 to-white/50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
              message.role === "user" && "flex-row-reverse"
            )}
          >
            <div className={cn(
              "w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-full shadow-sm",
              message.role === "assistant"
                ? "bg-gradient-to-br from-pink-400 to-violet-500"
                : "bg-gradient-to-br from-lime-400 to-green-500"
            )}>
              {message.role === "assistant" ? (
                <Sparkles className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <div className={cn(
              "px-4 py-3 max-w-[80%] rounded-2xl text-base leading-relaxed shadow-sm whitespace-pre-line",
              message.role === "assistant"
                ? "bg-white border border-slate-100 text-slate-700 rounded-tl-sm"
                : "bg-gradient-to-br from-lime-400 to-green-500 text-white rounded-tr-sm"
            )}>
              {message.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 animate-in fade-in duration-300">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-violet-500 rounded-full flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
              <div className="flex gap-1.5 items-center h-4">
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {!hasUserMsg && (
        <div className="px-6 pb-4 bg-white/50">
          <p className="text-sm font-semibold text-slate-500 mb-2">추천 프롬프트</p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, i) => {
              const colors = [
                "bg-lime-50 text-lime-700 border-lime-200 hover:bg-lime-100",
                "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100",
                "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100",
                "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100",
              ]
              return (
                <button
                  key={prompt}
                  onClick={() => handleSuggestion(prompt)}
                  className={`px-4 py-2 text-sm font-semibold rounded-full border transition-all ${colors[i % colors.length]}`}
                >
                  {prompt}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-slate-100 bg-white/70">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="예) 우리 카페 신메뉴 출시 카드뉴스 인스타용으로 만들어줘..."
            className="flex-1 min-h-[48px] max-h-32 resize-none rounded-xl bg-white border-lime-300 text-slate-800 placeholder:text-slate-400 placeholder:text-base focus:border-lime-400 focus:ring-lime-400/20 transition-all text-base"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isTyping}
            className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-400 to-violet-500 hover:from-pink-500 hover:to-violet-600 shadow-md shadow-pink-200 disabled:opacity-40 transition-all flex-shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
          </Button>
        </form>

        {hasUserMsg && (
          <Button
            onClick={handleGenerateNow}
            className="w-full mt-3 h-12 rounded-xl bg-gradient-to-r from-lime-400 to-green-500 text-slate-900 font-extrabold text-base hover:from-lime-500 hover:to-green-600 shadow-md shadow-lime-300 transition-all"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            지금 카드뉴스 생성하기
          </Button>
        )}
      </div>
    </div>
  )
}
