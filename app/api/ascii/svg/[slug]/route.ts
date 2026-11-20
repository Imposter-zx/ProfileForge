// app/api/ascii/svg/[slug]/route.ts
import { load, isPiece, type PieceName } from "ascii.rest";
import { svg } from "ascii.rest/svg";

export async function GET(
  request: Request,
  props: { params: Promise<{ slug: string }> }
) {
  const { slug } = await props.params;

  if (!isPiece(slug)) {
    return new Response(`Piece "${slug}" not found in ascii.rest registry.`, {
      status: 404,
      headers: { "Content-Type": "text/plain" },
    });
  }

  const { searchParams } = new URL(request.url);
  const dark = searchParams.get("dark") !== "0"; // default to dark
  const fpsParam = searchParams.get("fps");
  const fps = fpsParam ? Math.min(60, Math.max(1, parseInt(fpsParam, 10))) : undefined;
  const ink = searchParams.get("ink") || undefined;

  try {
    const pieceModule = await load[slug as PieceName]();
    const svgContent = svg(pieceModule, {
      dark,
      fps,
      ink,
      label: `${pieceModule.meta?.name || slug} in ASCII`,
    });

    return new Response(svgContent, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error generating SVG";
    return new Response(`Failed to generate SVG: ${msg}`, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
