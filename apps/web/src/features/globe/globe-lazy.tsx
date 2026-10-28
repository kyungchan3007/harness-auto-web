"use client";

// 3D 코드는 첫 화면 로드에 넣지 않고 브라우저에서 나중에 불러온다 (정적 HTML 에는 글자만)
import dynamic from "next/dynamic";
import type { ArcSignal } from "./globe";

const Globe = dynamic(() => import("./globe"), { ssr: false, loading: () => null });

export function GlobeLazy(props: { arcs: ArcSignal[]; className?: string }) {
  return <Globe {...props} />;
}
