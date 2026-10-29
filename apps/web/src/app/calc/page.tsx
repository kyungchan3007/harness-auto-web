import type { Metadata } from "next";
import { CalcPage } from "@/features/import-calc/calc-page";
import { api } from "@/shared/api";

export const metadata: Metadata = {
  title: "직구 계산기 · Tripfx",
  description: "해외 직구 물건 값을 원화로 · 면세 한도 안인지 · 넘으면 관세 · 부가세 예상",
};

// 환율은 빌드 때 우리 API 에서 · 입력 · 계산은 브라우저 안에서만 (IMP-01)
export default async function Page() {
  return <CalcPage latest={await api.latest()} />;
}
