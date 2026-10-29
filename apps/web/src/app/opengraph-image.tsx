// 공유 미리보기 이미지 — 빌드 때 한 번 그림 (정적) · 한글은 Pretendard 파일로 (기본 글꼴엔 한글이 없음)
// 숫자는 넣지 않음 — 이미지는 캐시돼 오래 남아서 그날 환율이 틀린 값으로 보일 수 있음 (FX-02 · 지어내지 않음)
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "Tripfx — 지금 환율이 싼 편인지, 여행 · 직구 전에 한눈에";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 빌드는 apps/web 에서 돌고 패키지는 저장소 맨 위 node_modules 로 올라가 있을 수 있음 — 번들러가 require.resolve 를 모듈 번호로 바꿔서 경로로 찾음
const FONT_DIRS = ["node_modules/pretendard/dist/public/static", "../../node_modules/pretendard/dist/public/static"].map((d) => join(process.cwd(), d));
const font = (weight: "Bold" | "Medium") => {
  const dir = FONT_DIRS.find((d) => existsSync(d));
  if (!dir) throw new Error("Pretendard 글꼴 파일을 찾지 못함 (pretendard 패키지)");
  return readFile(join(dir, `Pretendard-${weight}.otf`));
};

export default async function Image() {
  const [bold, medium] = await Promise.all([font("Bold"), font("Medium")]);
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 96px", background: "#000", color: "#f5f5f7", fontFamily: "Pretendard" }}>
      <div style={{ fontSize: 34, fontWeight: 500, color: "#a1a1a6" }}>Tripfx · 환율 · 여행 물가 · 직구 계산</div>
      <div style={{ marginTop: 28, fontSize: 84, fontWeight: 700, lineHeight: 1.15, display: "flex", flexDirection: "column" }}>
        <span>오늘, 그 통화는</span>
        <span style={{ backgroundImage: "linear-gradient(90deg, #4ff0e0, #9c8cff, #ff8ad8)", backgroundClip: "text", color: "transparent" }}>싼 편일까?</span>
      </div>
      <div style={{ marginTop: 36, fontSize: 32, fontWeight: 500, color: "#a1a1a6" }}>매일 받은 환율이 최근 흐름 중 어디쯤인지 · 예측 아님</div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Pretendard", data: bold, weight: 700, style: "normal" },
        { name: "Pretendard", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
}
