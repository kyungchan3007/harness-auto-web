"use client";

// 3D 는 첫 화면 로드에 넣지 않고 브라우저에서 나중에 불러온다 (정적 HTML 에는 글자만)
// 장면 자체는 디자인 시스템(@hav/ui/three/*) · 늦게 불러오기(next/dynamic)만 앱에서 (디자인 시스템은 Next 를 모름)
import type { GlobeProps } from "@hav/ui/three/globe";
import type { SuitcaseProps } from "@hav/ui/three/suitcase";
import dynamic from "next/dynamic";

export const GlobeLazy = dynamic<GlobeProps>(() => import("@hav/ui/three/globe"), { ssr: false, loading: () => null });
export const SuitcaseLazy = dynamic<SuitcaseProps>(() => import("@hav/ui/three/suitcase"), { ssr: false, loading: () => null });
