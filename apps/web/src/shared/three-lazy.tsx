"use client";

// 3D 는 첫 화면 로드에 넣지 않고 화면 가까이 올 때 브라우저가 한가할 때 불러온다 (정적 HTML 에는 글자 · 빈 칸만)
// 장면 · 늦게 불러오기 틀 모두 디자인 시스템(@hav/ui/three/* · @hav/ui/lazy-near) · 여기는 어떤 장면을 쓰는지만
import { lazyNear } from "@hav/ui/lazy-near";
import type { CoinProps } from "@hav/ui/three/coin";
import type { GlobeProps } from "@hav/ui/three/globe";
import type { PiggyProps } from "@hav/ui/three/piggy";
import type { StationsProps } from "@hav/ui/three/stations";
import type { SuitcaseProps } from "@hav/ui/three/suitcase";

export const GlobeLazy = lazyNear<GlobeProps>(() => import("@hav/ui/three/globe"));
export const SuitcaseLazy = lazyNear<SuitcaseProps>(() => import("@hav/ui/three/suitcase"));
export const StationsLazy = lazyNear<StationsProps>(() => import("@hav/ui/three/stations"));
export const CoinLazy = lazyNear<CoinProps>(() => import("@hav/ui/three/coin"));
export const PiggyLazy = lazyNear<PiggyProps>(() => import("@hav/ui/three/piggy"));
