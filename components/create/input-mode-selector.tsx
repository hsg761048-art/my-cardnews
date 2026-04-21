"use client"

import { Link2, MessageSquare, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import type { InputMode } from "@/app/create/page"

interface InputModeSelectorProps {
  selectedMode: InputMode
  onModeChange: (mode: InputMode) => void
}

const modes = [
  {
    id: "url" as const,
    icon: Link2,
    title: "URL 입력",
    description: "블로그/기사에서 변환",
    gradient: "from-primary to-violet-400",
    bgColor: "bg-primary/10",
  },
  {
    id: "chat" as const,
    icon: MessageSquare,
    title: "대화형",
    description: "AI 대화로 생성",
    gradient: "from-pink-400 to-rose-400",
    bgColor: "bg-pink-400/10",
  },
  {
    id: "form" as const,
    icon: FileText,
    title: "스마트 폼",
    description: "직접 내용 입력",
    gradient: "from-sky-400 to-cyan-400",
    bgColor: "bg-sky-400/10",
  },
]

export function InputModeSelector({ selectedMode, onModeChange }: InputModeSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3 p-2 glass-card rounded-2xl">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={cn(
            "group relative flex flex-col items-center gap-3 p-4 md:p-5 rounded-xl transition-all duration-300",
            selectedMode === mode.id
              ? "glass-card shadow-lg"
              : "hover:bg-white/30 dark:hover:bg-white/5"
          )}
        >
          {/* Selected indicator blob */}
          {selectedMode === mode.id && (
            <div className={cn(
              "absolute inset-0 rounded-xl opacity-20",
              mode.bgColor
            )} />
          )}
          
          <div
            className={cn(
              "relative w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all duration-300",
              selectedMode === mode.id
                ? `bg-gradient-to-br ${mode.gradient} text-white shadow-lg`
                : `${mode.bgColor} group-hover:scale-105`
            )}
          >
            <mode.icon className={cn(
              "w-5 h-5",
              selectedMode !== mode.id && "text-muted-foreground"
            )} />
          </div>
          
          <div className="relative text-center">
            <p
              className={cn(
                "text-base font-bold transition-colors",
                selectedMode === mode.id
                  ? `bg-gradient-to-r ${mode.gradient} bg-clip-text text-transparent`
                  : "text-slate-600"
              )}
            >
              {mode.title}
            </p>
            <p className="text-base text-slate-400 font-medium mt-1 hidden sm:block">
              {mode.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  )
}
