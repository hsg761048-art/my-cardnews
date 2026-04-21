"use client"

import { useState, useEffect } from "react"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Check, Link, MessageSquare, ExternalLink, AlertTriangle, Wifi } from "lucide-react"
import { copyToClipboard } from "@/lib/slide-share"

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shareUrl?: string
}

export function ShareDialog({ open, onOpenChange, shareUrl }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)
  const [url, setUrl] = useState("")
  const [isLocalhost, setIsLocalhost] = useState(false)
  const [localNetworkUrl, setLocalNetworkUrl] = useState("")

  useEffect(() => {
    if (open) {
      const base = shareUrl || window.location.href
      setUrl(base)
      const hostname = window.location.hostname
      const isLocal = hostname === "localhost" || hostname === "127.0.0.1"
      setIsLocalhost(isLocal)

      // shareUrl이 있으면(실제 /share?d=... 링크) 경로만 꺼내서 표시용 로컬네트워크 URL 만들기
      if (isLocal && shareUrl) {
        try {
          const path = new URL(shareUrl).pathname + new URL(shareUrl).search
          setLocalNetworkUrl(
            `(배포 후) https://your-domain.com${path}`
          )
        } catch {}
      }
    }
  }, [open, shareUrl])

  const handleCopy = async () => {
    const ok = await copyToClipboard(url)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const handleKakao = () => {
    // 카카오톡 링크 공유 (앱이 없으면 웹으로 폴백)
    window.open(
      `https://story.kakao.com/share?url=${encodeURIComponent(url)}`,
      "_blank"
    )
  }

  const handleEmail = () => {
    window.open(
      `mailto:?subject=카드뉴스 공유&body=링크를 확인해보세요:%0A${encodeURIComponent(url)}`,
      "_blank"
    )
  }

  const handleOpenLink = () => {
    window.open(url, "_blank")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">공유 링크 생성</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            링크를 받는 사람은 카드뉴스를 바로 볼 수 있어요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">

          {/* localhost 경고 */}
          {isLocalhost && (
            <div className="flex gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-700 space-y-1">
                <p className="font-semibold">개발 환경 (localhost) 에서는 같은 PC에서만 링크가 열려요</p>
                <p className="text-amber-600">다른 기기에서 공유하려면 앱을 배포(Vercel 등)한 후 사용하세요.</p>
                <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-amber-200">
                  <Wifi className="w-3 h-3 text-amber-500" />
                  <span className="text-amber-600">같은 Wi-Fi라면 IP 주소로 시도: </span>
                  <code className="font-mono bg-amber-100 px-1 rounded text-amber-700">
                    {typeof window !== "undefined"
                      ? window.location.href.replace("localhost", "컴퓨터IP주소")
                      : ""}
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* 공유 링크 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">공유 링크</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={url}
                  readOnly
                  className="pl-10 h-11 text-xs bg-muted/30 border-border"
                />
              </div>
              <Button
                onClick={handleCopy}
                variant="outline"
                className={`h-11 px-4 border-border transition-colors ${copied ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "hover:bg-muted"}`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button
                onClick={handleOpenLink}
                variant="outline"
                className="h-11 px-3 border-border hover:bg-muted"
                title="새 탭에서 열기"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-emerald-600 font-medium">✓ 클립보드에 복사됐어요!</p>
            )}
          </div>

          {/* 안내 */}
          <div className="p-4 bg-muted/50 border border-border rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 bg-foreground flex items-center justify-center rounded-md shrink-0">
                <Link className="w-3.5 h-3.5 text-background" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">링크 하나로 공유</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  앱 설치 없이 링크만으로 슬라이드 전체를 볼 수 있어요
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 bg-foreground flex items-center justify-center rounded-md shrink-0">
                <MessageSquare className="w-3.5 h-3.5 text-background" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">슬라이드 뷰어 포함</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  받는 분이 슬라이드를 넘겨보거나 전체 보기로 볼 수 있어요
                </p>
              </div>
            </div>
          </div>

          {/* 공유 옵션 */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleKakao}
              className="h-11 border-border hover:bg-muted gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.5 3 2 6.58 2 11c0 2.11.89 4.03 2.36 5.45.61 2.52-.15 4.71-.64 5.55.66-.04 2.75-.25 4.82-1.63 1.08.31 2.23.47 3.46.47 5.5 0 10-3.58 10-8s-4.5-8-10-8z" />
              </svg>
              카카오톡
            </Button>
            <Button
              variant="outline"
              onClick={handleEmail}
              className="h-11 border-border hover:bg-muted gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              이메일
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
