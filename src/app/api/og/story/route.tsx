import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1920px",
          background: "linear-gradient(175deg, #c8eeda 0%, #e8f7ef 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 60,
          color: "#1a1a2e",
        }}
      >
        KOMPASS TEST
      </div>
    ),
    { width: 1080, height: 1920 }
  );
}
