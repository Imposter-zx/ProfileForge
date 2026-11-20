// app/api/ascii/banner/route.ts
import { bannerSvg, type BannerSvgColor } from "ascii.rest/svg";
import type { FontName, ShadowName, Effect } from "ascii.rest/banner";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text")?.slice(0, 30).trim() || "WELCOME";
  const dark = searchParams.get("dark") !== "0";
  const font = (searchParams.get("font") as FontName) || "block";
  const shadow = (searchParams.get("shadow") as ShadowName) || "double";
  const effect = (searchParams.get("effect") as Effect) || "glint";
  const colorParam = searchParams.get("color");
  const tagline = searchParams.get("tagline")?.slice(0, 60) || undefined;

  let color: BannerSvgColor | undefined;
  if (colorParam) {
    const list = colorParam.split(",").map((c) => (c.startsWith("#") ? c : `#${c}`));
    color = list.length === 1 ? list[0] : list;
  }

  try {
    const svgContent = bannerSvg(text, {
      dark,
      font,
      shadow,
      effect,
      color,
      tagline,
    });

    return new Response(svgContent, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error generating banner SVG";
    return new Response(`Failed to generate banner: ${msg}`, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
