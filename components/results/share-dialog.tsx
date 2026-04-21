"use client"

import { useState, useEffect, useRef } from "react"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Check, Link, MessageSquare, ExternalLink, AlertTriangle, Loader2, Info } from "lucide-react"
import { copyToClipboard } from "@/lib/slide-share"

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shareUrl?: string
  /** 공유 페이로드에서 제외된 업로드 이미지(데이터 URI) 개수 */
  strippedImages?: number
}

export function ShareDialog({ open, onOpenChange, shareUrl, strippedImages = 0 }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)
  const [url, setUrl] = useState("")
  const [isShortening, setIsShortening] = useState(false)
  const [shortenFailed, setShortenFailed] = useState(false)
  const [isLocalhost, setIsLocalhost] = useState(false)
  const [isMac, setIsMac] = useState(false)
  const shortenedRef = useRef<string | null>(null)

  // Mac 이면 Cmd+V, 그 외엔 Ctrl+V 안내
  const pasteKey = isMac ? "⌘ + V" : "Ctrl + V"

  useEffect(() => {
    if (!open) return

    const base = shareUrl || window.location.href
    const hostname = window.location.hostname
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1"
    setIsLocalhost(isLocal)
    // OS 감지 — 단축키 안내에 사용
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent))

    // 이미 단축된 URL이 있으면 재사용
    if (shortenedRef.current) {
      setUrl(shortenedRef.current)
      return
    }

    // 배포 환경에서만 단축 URL 생성
    if (!isLocal && shareUrl) {
      setIsShortening(true)
      setShortenFailed(false)
      setUrl(shareUrl) // 단축 전 임시로 원본 표시
      fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: shareUrl }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.shortUrl) {
            shortenedRef.current = data.shortUrl
            setUrl(data.shortUrl)
          } else {
            setShortenFailed(true)
          }
        })
        .catch(() => {
          // 단축 실패 시 원본 URL 그대로 사용
          setShortenFailed(true)
        })
        .finally(() => setIsShortening(false))
    } else {
      setUrl(base)
    }
  }, [open, shareUrl])

  const handleCopy = async () => {
    const ok = await copyToClipboard(url)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const [kakaoCopied, setKakaoCopied] = useState(false)

  const handleKakao = async () => {
    // 카카오 공유 API 종료됨 → 링크 복사 후 안내
    const ok = await copyToClipboard(url)
    if (ok) {
      setKakaoCopied(true)
      setTimeout(() => setKakaoCopied(false), 3000)
    }
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
                <p className="font-semibold">개발 환경에서는 같은 PC에서만 링크가 열려요</p>
                <p className="text-amber-600">배포 환경(Vercel)에서는 자동으로 짧은 링크가 생성됩니다.</p>
              </div>
            </div>
          )}

          {/* 업로드 이미지가 공유에서 제외되었다는 안내 */}
          {strippedImages > 0 && (
            <div className="flex gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800 space-y-1">
                <p className="font-semibold">직접 올린 이미지는 공유 링크에 포함되지 않아요</p>
                <p className="text-blue-700 leading-relaxed">
                  브랜드 로고와 업로드한 배경/제품 사진은 용량이 커서 링크에서 제외됐어요.
                  받는 분께는 텍스트와 기본 디자인만 표시됩니다.
                  이미지까지 그대로 공유하려면 <span className="font-semibold">ZIP 다운로드</span>로 이미지 파일을 보내주세요.
                </p>
              </div>
            </div>
          )}

          {/* 단축 실패 안내 */}
          {shortenFailed && !isLocalhost && (
            <div className="flex gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-700 space-y-1">
                <p className="font-semibold">링크 단축에 실패했어요</p>
                <p className="text-amber-600">원본 링크를 그대로 공유해도 동작하지만 조금 깁니다.</p>
              </div>
            </div>
          )}

          {/* 공유 링크 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">공유 링크</label>
              {isShortening && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  링크 단축 중...
                </span>
              )}
            </div>
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
                disabled={isShortening}
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
              className={`h-11 border-border gap-2 transition-colors ${kakaoCopied ? "bg-yellow-50 text-yellow-700 border-yellow-300" : "hover:bg-muted"}`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.5 3 2 6.58 2 11c0 2.11.89 4.03 2.36 5.45.61 2.52-.15 4.71-.64 5.55.66-.04 2.75-.25 4.82-1.63 1.08.31 2.23.47 3.46.47 5.5 0 10-3.58 10-8s-4.5-8-10-8z" />
              </svg>
              {kakaoCopied ? "복사됨!" : "카카오톡"}
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

          {/* 카카오톡 붙여넣기 안내 — 전체 너비 */}
          {kakaoCopied && (
            <div className="px-4 py-4 rounded-xl bg-yellow-50 border-2 border-yellow-300 text-center shadow-sm">
              <p className="text-base font-bold text-yellow-900 leading-relaxed">
                ✓ 링크가 복사됐어요!
              </p>
              <p className="mt-2 text-base font-semibold text-yellow-800 leading-relaxed">
                카카오톡 채팅창에서{" "}
                <kbd className="inline-block px-2.5 py-1 mx-0.5 rounded-md border-2 border-yellow-500 bg-white text-yellow-900 font-mono text-base font-bold align-middle shadow-sm">
                  {pasteKey}
                </kbd>{" "}
                로 붙여넣기 하세요
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
