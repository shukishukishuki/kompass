/**
 * Google Fonts の text サブセット API から Noto Sans JP を取得する。
 * 返却は TTF（サブセット時の既定）でも next/og の ImageResponse で利用可能。
 */
export async function loadNotoSansJpForText(text: string): Promise<
  { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" }[]
> {
  const encoded = encodeURIComponent(text);
  const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap&text=${encoded}`;
  const css = await fetch(cssUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  }).then((res) => res.text());

  const fonts: {
    name: string;
    data: ArrayBuffer;
    weight: 400 | 700;
    style: "normal";
  }[] = [];

  for (const block of css.split("@font-face")) {
    const weightMatch = block.match(/font-weight:\s*(\d+)/);
    const srcMatch = block.match(
      /src:\s*url\(([^)]+)\)\s*format\(['"](?:truetype|woff2)['"]\)/
    );
    if (weightMatch === null || srcMatch === null) {
      continue;
    }
    const w = Number(weightMatch[1]);
    if (w !== 400 && w !== 700) {
      continue;
    }
    const fontFileUrl = srcMatch[1].replace(/^['"]|['"]$/g, "");
    const data = await fetch(fontFileUrl).then((r) => r.arrayBuffer());
    fonts.push({
      name: "Noto Sans JP",
      data,
      weight: w as 400 | 700,
      style: "normal",
    });
  }

  return fonts;
}
