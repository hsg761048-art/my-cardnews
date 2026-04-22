const apiResponse = {
  slidesByStyle: {
    minimal: [
      {title: "새로운 시작, 기다림 끝", subtitle: "NEW ARRIVAL", content: "드디어 공개합니다.", cta: "자세히 보기",
        design: { background: "#fff", textColor: "#000", titleColor: "#000", ctaBg: "#84cc16", ctaText: "#000", fontFamily: "pretendard", bgImagePrompt: "clean" }},
      {title: "본질에 집중하다", content: "핵심에만 집중합니다.", design: {}},
      {title: "일상의 작은 변화", content: ".", design: {}},
      {title: "취향을 완성하다", content: ".", design: {}},
      {title: "지금 만나보세요", content: ".", cta: "지금 시작", design: {}}
    ],
    bold: [],
    elegant: [],
  },
};

const brandKit = { primaryColor: "#a855f7", secondaryColor: "#fff", accentColor: "#84cc16", font: "Pretendard", voiceStyle: "friendly", logo: null };
const useBrandKit = true;

const applyBrandKit = (slides) => {
  if (!useBrandKit || !brandKit || !Array.isArray(slides)) return slides;
  return slides.map((slide) => {
    const design = slide.design ?? {};
    return { ...slide, logoUrl: brandKit.logo ?? undefined, design: { ...design, background: brandKit.primaryColor }};
  });
};

const slidesByStyle = apiResponse.slidesByStyle ?? {};
const brandApplied = {
  minimal: applyBrandKit(slidesByStyle.minimal ?? []),
  bold: applyBrandKit(slidesByStyle.bold ?? []),
  elegant: applyBrandKit(slidesByStyle.elegant ?? []),
};
const stripLogoUrl = (slides) => slides.map((s) => { const { logoUrl, ...rest } = s; return rest; });
const slidesToStore = { minimal: stripLogoUrl(brandApplied.minimal), bold: stripLogoUrl(brandApplied.bold), elegant: stripLogoUrl(brandApplied.elegant) };
const storedData = { slidesByStyle: slidesToStore, slides: slidesToStore.minimal, provider: "gemini", generatedAt: Date.now() };

console.log("parsed.slides length:", storedData.slides.length);
console.log("slide titles:", storedData.slides.map(s => s.title));
console.log("JSON size:", JSON.stringify(storedData).length, "bytes");
