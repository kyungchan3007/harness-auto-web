"use client";

// 3D 는 첫 화면 로드에 넣지 않고 화면 가까이 올 때 브라우저가 한가할 때 불러온다 (정적 HTML 에는 글자 · 빈 칸만)
// 장면 · 늦게 불러오기 틀 모두 디자인 시스템(@hav/ui/three/* · @hav/ui/lazy-near) · 여기는 어떤 장면을 쓰는지만
import { lazyNear } from "@hav/ui/lazy-near";
import type { BlockTowerProps } from "@hav/ui/three/block-tower";
import type { CoinProps } from "@hav/ui/three/coin";
import type { GlobeProps } from "@hav/ui/three/globe";
import type { MoneyCatProps } from "@hav/ui/three/money-cat";
import type { StationsProps } from "@hav/ui/three/stations";
import type { WorkerCatProps } from "@hav/ui/three/worker-cat";

export const GlobeLazy = lazyNear<GlobeProps>(() => import("@hav/ui/three/globe"));
export const WorkerCatLazy = lazyNear<WorkerCatProps>(() => import("@hav/ui/three/worker-cat"));
export const StationsLazy = lazyNear<StationsProps>(() => import("@hav/ui/three/stations"));
export const CoinLazy = lazyNear<CoinProps>(() => import("@hav/ui/three/coin"));
export const MoneyCatLazy = lazyNear<MoneyCatProps>(() => import("@hav/ui/three/money-cat"));
export const BlockTowerLazy = lazyNear<BlockTowerProps>(() => import("@hav/ui/three/block-tower"));
