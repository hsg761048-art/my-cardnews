"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ColorPickerProps {
  label: string
  color: string
  onChange: (color: string) => void
}

const presetColors = [
  "#1A1A1A", "#525252", "#737373", "#A3A3A3",
  "#FAFAFA", "#F5F5F5", "#E5E5E5", "#D4D4D4",
  "#DC2626", "#EA580C", "#CA8A04", "#16A34A",
  "#0284C7", "#7C3AED", "#DB2777", "#0D9488",
]

export function ColorPicker({ label, color, onChange }: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(color)

  const handleInputChange = (value: string) => {
    setInputValue(value)
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      onChange(value)
    }
  }

  const handleColorSelect = (selectedColor: string) => {
    setInputValue(selectedColor)
    onChange(selectedColor)
  }

  return (
    <div className="space-y-3">
      <Label className="text-base font-bold text-slate-700">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <button className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 bg-white/80 hover:border-primary/50 hover:bg-slate-50 transition-all text-left group">
            <div
              className="w-10 h-10 rounded-lg border border-slate-200 shrink-0 shadow-sm"
              style={{ backgroundColor: color }}
            />
            <div className="flex-1">
              <p className="text-base font-bold text-slate-800 uppercase">
                {color}
              </p>
              <p className="text-sm font-medium text-slate-400 group-hover:text-primary transition-colors">
                클릭하여 변경
              </p>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4 rounded-2xl bg-white border border-slate-200 shadow-xl" align="start">
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorSelect(e.target.value)}
                className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer"
              />
              <Input
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="#000000"
                className="flex-1 h-10 rounded-xl uppercase bg-slate-50 border-slate-200 text-slate-800 font-bold focus:border-primary"
              />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-600 mb-2">프리셋 컬러</p>
              <div className="grid grid-cols-8 gap-1.5">
                {presetColors.map((presetColor) => (
                  <button
                    key={presetColor}
                    onClick={() => handleColorSelect(presetColor)}
                    className="w-6 h-6 rounded border border-slate-200 hover:scale-110 hover:border-primary transition-all shadow-sm"
                    style={{ backgroundColor: presetColor }}
                    aria-label={`${presetColor} 색상 선택`}
                  />
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
