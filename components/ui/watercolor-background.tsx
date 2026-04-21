"use client"

import { useEffect, useState } from "react"

interface MistBackgroundProps {
  interactive?: boolean
  intensity?: "light" | "medium" | "strong"
}

export function WatercolorBackground({ 
  interactive = false, 
  intensity = "medium" 
}: MistBackgroundProps) {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (!interactive) return

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100
      const y = (e.clientY / window.innerHeight) * 100
      setMousePosition({ x, y })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [interactive])

  const opacityMap = {
    light: { blob: 0.35, hover: 0.45 },
    medium: { blob: 0.45, hover: 0.55 },
    strong: { blob: 0.55, hover: 0.65 }
  }

  const opacity = opacityMap[intensity]

  return (
    <div 
      className="mist-bg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Vivid violet - top left */}
      <div
        className="mist-blob animate-mist-drift w-[500px] h-[500px] md:w-[700px] md:h-[700px]"
        style={{
          background: "linear-gradient(135deg, rgba(168, 85, 247, 0.7), rgba(139, 92, 246, 0.55))",
          top: "-15%",
          left: "-10%",
          opacity: isHovered ? opacity.hover : opacity.blob,
          transition: "opacity 1.2s ease-out",
          transform: interactive
            ? `translate(${(mousePosition.x - 50) * 0.08}px, ${(mousePosition.y - 50) * 0.08}px)`
            : undefined
        }}
      />

      {/* Sky blue - top right */}
      <div
        className="mist-blob animate-mist-drift-delayed w-[450px] h-[450px] md:w-[650px] md:h-[650px]"
        style={{
          background: "linear-gradient(180deg, rgba(56, 189, 248, 0.7), rgba(99, 179, 255, 0.55))",
          top: "0%",
          right: "-5%",
          opacity: isHovered ? opacity.hover : opacity.blob,
          transition: "opacity 1.2s ease-out",
          transform: interactive
            ? `translate(${(mousePosition.x - 50) * -0.06}px, ${(mousePosition.y - 50) * 0.06}px)`
            : undefined
        }}
      />

      {/* Mint cyan - center */}
      <div
        className="mist-blob animate-mist-drift-slow w-[600px] h-[600px] md:w-[800px] md:h-[800px]"
        style={{
          background: "linear-gradient(225deg, rgba(34, 211, 238, 0.6), rgba(16, 185, 129, 0.45))",
          top: "25%",
          left: "25%",
          opacity: isHovered ? opacity.hover : opacity.blob * 0.85,
          transition: "opacity 1.2s ease-out",
          transform: interactive
            ? `translate(${(mousePosition.x - 50) * 0.1}px, ${(mousePosition.y - 50) * -0.1}px)`
            : undefined
        }}
      />

      {/* Hot pink - bottom left */}
      <div
        className="mist-blob animate-mist-drift w-[400px] h-[400px] md:w-[550px] md:h-[550px]"
        style={{
          background: "linear-gradient(45deg, rgba(236, 72, 153, 0.65), rgba(244, 114, 182, 0.5))",
          bottom: "-10%",
          left: "5%",
          opacity: isHovered ? opacity.hover : opacity.blob * 0.85,
          transition: "opacity 1.2s ease-out",
          animationDelay: "-5s",
          transform: interactive
            ? `translate(${(mousePosition.x - 50) * -0.05}px, ${(mousePosition.y - 50) * -0.08}px)`
            : undefined
        }}
      />

      {/* Peach orange - bottom right */}
      <div
        className="mist-blob animate-mist-drift-delayed w-[450px] h-[450px] md:w-[600px] md:h-[600px]"
        style={{
          background: "linear-gradient(315deg, rgba(251, 146, 60, 0.6), rgba(252, 129, 129, 0.5))",
          bottom: "5%",
          right: "-8%",
          opacity: isHovered ? opacity.hover : opacity.blob * 0.8,
          transition: "opacity 1.2s ease-out",
          animationDelay: "-12s",
          transform: interactive
            ? `translate(${(mousePosition.x - 50) * 0.04}px, ${(mousePosition.y - 50) * 0.06}px)`
            : undefined
        }}
      />

      {/* Interactive dew glow following cursor - 커서 따라가는 이슬 빛 */}
      {interactive && (
        <div 
          className="absolute w-[250px] h-[250px] md:w-[350px] md:h-[350px] rounded-full pointer-events-none transition-all duration-700 ease-out"
          style={{
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, rgba(173, 216, 230, 0.2) 50%, transparent 70%)",
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`,
            transform: "translate(-50%, -50%)",
            opacity: isHovered ? 0.7 : 0.3,
            filter: "blur(30px)"
          }}
        />
      )}
    </div>
  )
}
