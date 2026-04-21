/**
 * 사용자 업로드 이미지를 캔버스로 리사이즈하여 base64로 변환하는 유틸.
 * localStorage 용량을 절약하기 위해 긴 변을 기준으로 최대 크기를 제한하고
 * JPEG 품질을 낮춰 저장 크기를 줄인다.
 */

export interface ProcessImageOptions {
  /** 긴 변 기준 최대 픽셀 (기본값 1200) */
  maxSize?: number
  /** JPEG 품질 (0~1, 기본값 0.82) */
  quality?: number
  /** 투명도를 살려야 하면 true 로 지정 (PNG 로 저장) */
  preservePng?: boolean
}

const DEFAULT_MAX_SIZE = 1200
const DEFAULT_QUALITY = 0.82

/** File → HTMLImageElement */
function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("파일을 읽을 수 없습니다."))
    reader.onload = () => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error("이미지를 불러올 수 없습니다."))
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

/**
 * 사용자가 업로드한 이미지 파일을 리사이즈된 base64 문자열로 변환한다.
 * - 긴 변이 maxSize 를 초과하면 비율 유지하면서 축소
 * - 기본은 JPEG 이며 preservePng=true 일 때만 PNG 로 저장 (로고/투명 배경 제품컷용)
 */
export async function processImageFile(
  file: File,
  options: ProcessImageOptions = {}
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.")
  }

  const maxSize = options.maxSize ?? DEFAULT_MAX_SIZE
  const quality = options.quality ?? DEFAULT_QUALITY
  const preservePng = options.preservePng ?? file.type === "image/png"

  const img = await fileToImage(file)

  // 비율 유지하면서 긴 변을 maxSize 이하로 축소
  const longEdge = Math.max(img.naturalWidth, img.naturalHeight)
  const scale = longEdge > maxSize ? maxSize / longEdge : 1
  const targetW = Math.round(img.naturalWidth * scale)
  const targetH = Math.round(img.naturalHeight * scale)

  const canvas = document.createElement("canvas")
  canvas.width = targetW
  canvas.height = targetH
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("캔버스를 초기화할 수 없습니다.")

  // PNG 가 아닌 경우 흰 배경으로 채워서 JPEG 변환 시 검은 영역이 생기지 않게 함
  if (!preservePng) {
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, targetW, targetH)
  }
  ctx.drawImage(img, 0, 0, targetW, targetH)

  const mime = preservePng ? "image/png" : "image/jpeg"
  return canvas.toDataURL(mime, preservePng ? undefined : quality)
}

/** 업로드 제한(약 3MB) 초과 여부 체크용 */
export function isFileTooLarge(file: File, maxBytes = 10 * 1024 * 1024): boolean {
  return file.size > maxBytes
}
