import { describe, expect, it } from "vitest";
import { monthChangeText } from "./change";

describe("홈 통화 칸 1개월 변화 (작업 0096)", () => {
  it("오르면 비싸짐 · 내리면 싸짐 · 아주 작으면 거의 같음", () => {
    expect(monthChangeText(1.234)).toEqual({ text: "+1.2%", tone: "up", label: "1개월 전보다 +1.2% 비싸짐" });
    expect(monthChangeText(-1.72)).toEqual({ text: "-1.7%", tone: "down", label: "1개월 전보다 1.7% 싸짐" });
    expect(monthChangeText(0.01).tone).toBe("flat");
  });
});
