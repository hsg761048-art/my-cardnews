"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Image as ImageIcon } from "lucide-react"

interface LogoUploaderProps {
  logo: string | null
  onLogoChange: (logo: string | null) => void
}

export function LogoUploader({ logo, onLogoChange }: LogoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        onLogoChange(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemove = () => {
    onLogoChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="glass-card rounded-2xl border border-white/30 p-6 md:p-8">
      <h2 className="text-lg font-bold text-slate-800 mb-1">브랜드 로고</h2>
      <p className="text-base text-white font-bold mb-6">카드뉴스 상단에 자동으로 삽입됩니다</p>

      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="group w-full md:w-44 aspect-square border-2 border-dashed border-slate-300 hover:border-primary rounded-2xl bg-slate-50 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-primary/5"
        >
          {logo ? (
            <img
              src={logo}
              alt="브랜드 로고"
              className="w-full h-full object-contain p-4"
            />
          ) : (
            <>
              <ImageIcon className="w-10 h-10 text-slate-300 mb-3 group-hover:text-primary transition-colors" />
              <p className="text-base font-semibold text-slate-400 text-center px-4 group-hover:text-primary transition-colors">
                클릭하여 업로드
              </p>
            </>
          )}
        </div>

        {/* Info & Actions */}
        <div className="flex-1 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-lime-400" />
              <p className="text-base font-semibold text-white">PNG, SVG, JPG 형식 지원. 최대 5MB.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-400" />
              <p className="text-base font-semibold text-white">투명 배경 PNG 또는 SVG 권장.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full px-5 h-10 text-base font-bold border-primary/40 text-primary hover:bg-primary/5 hover:border-primary transition-all"
            >
              <Upload className="w-4 h-4 mr-2" />
              {logo ? "변경" : "업로드"}
            </Button>
            {logo && (
              <Button
                variant="ghost"
                onClick={handleRemove}
                className="rounded-full px-5 h-10 text-base font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
              >
                <X className="w-4 h-4 mr-2" />
                삭제
              </Button>
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/svg+xml,image/jpeg"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
