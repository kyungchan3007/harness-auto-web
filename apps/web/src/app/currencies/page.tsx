import { CurrencyDetail } from "@/features/currencies/currency-detail";
import { loadDetail } from "@/features/currencies/load";
import { DEFAULT_CODE } from "@/features/currencies/route";

// /currencies — 달러를 먼저 보여 줌
export default async function Page() {
  return <CurrencyDetail {...await loadDetail(DEFAULT_CODE)} />;
}
