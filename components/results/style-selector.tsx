"use client"

import { cn } from "@/lib/utils"
import type { CardStyle } from "@/app/results/page"

interface StyleSelectorProps {
  selectedStyle: CardStyle
  onStyleChange: (style: CardStyle) => void
}

const styles = [
  {
    id: "minimal" as const,
    name: "미니멀",
    description: "깔끔하고 단순한 디자인",
    preview: {
      bg: "bg-muted",
      accent: "bg-foreground/20",
    },
    unselectedName: "text-white",
    unselectedDesc: "text-white/90",
  },
  {
    id: "bold" as const,
    name: "볼드",
    description: "강렬하고 임팩트있는 스타일",
    preview: {
      bg: "bg-foreground",
      accent: "bg-background/30",
    },
    unselectedName: "text-slate-900",
    unselectedDesc: "text-slate-700",
  },
  {
    id: "elegant" as const,
    name: "엘레강스",
    description: "세련되고 고급스러운",
    preview: {
      bg: "bg-muted border border-border",
      accent: "bg-foreground/30",
    },
    unselectedName: "text-slate-800",
    unselectedDesc: "text-slate-600",
  },
]

export function StyleSelector({ selectedStyle, onStyleChange }: StyleSelectorProps) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {styles.map((style) => (
        <button
          key={style.id}
          onClick={() => onStyleChange(style.id)}
          className={cn(
            "group relative flex items-center gap-5 p-5 border-2 transition-all min-w-[220px] shadow-md",
            selectedStyle === style.id
              ? "border-violet-500 shadow-violet-300/40 bg-card"
              : "border-transparent bg-card/50 hover:bg-card hover:border-violet-300/50"
          )}
        >
          {/* Style Preview */}
          <div
            className={cn(
              "w-14 h-18 flex flex-col justify-between p-2.5 shadow-sm",
              style.preview.bg
            )}
          >
            <div className={cn("w-3 h-0.5 rounded-full", style.preview.accent)} />
            <div className="space-y-1">
              <div className={cn("w-6 h-0.5 rounded-full", style.preview.accent)} />
              <div className={cn("w-4 h-0.5 rounded-full opacity-60", style.preview.accent)} />
            </div>
          </div>

          {/* Style Info */}
          <div className="text-left">
            <p className={cn(
              "text-lg font-extrabold transition-colors",
              selectedStyle === style.id ? "text-white drop-shadow-sm" : style.unselectedName
            )}>
              {style.name}
            </p>
            <p className={cn(
              "text-sm mt-1 font-medium transition-colors",
              selectedStyle === style.id ? "text-white" : style.unselectedDesc
            )}>
              {style.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  )
}
