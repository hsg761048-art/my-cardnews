"use client"

import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 패널의 투명도 강도 */
  intensity?: "subtle" | "medium" | "strong"
  /** 다크모드 여부 */
  dark?: boolean
  /** 호버 시 효과 활성화 */
  hoverable?: boolean
}

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, intensity = "medium", dark = false, hoverable = false, children, ...props }, ref) => {
    const intensityStyles = {
      subtle: {
        light: "bg-white/5 border-white/10 backdrop-blur-xl",
        dark: "bg-white/[0.03] border-white/[0.08] backdrop-blur-xl",
      },
      medium: {
        light: "bg-white/10 border-white/20 backdrop-blur-2xl",
        dark: "bg-white/[0.06] border-white/[0.12] backdrop-blur-2xl",
      },
      strong: {
        light: "bg-white/20 border-white/30 backdrop-blur-3xl",
        dark: "bg-white/[0.08] border-white/[0.15] backdrop-blur-3xl",
      },
    }

    const mode = dark ? "dark" : "light"

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-3xl border shadow-2xl",
          intensityStyles[intensity][mode],
          dark 
            ? "shadow-black/25" 
            : "shadow-black/5",
          hoverable && "transition-all duration-500 ease-out hover:scale-[1.01] hover:shadow-3xl",
          hoverable && dark && "hover:border-white/25 hover:bg-white/[0.08]",
          hoverable && !dark && "hover:border-white/35 hover:bg-white/15",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

GlassPanel.displayName = "GlassPanel"
