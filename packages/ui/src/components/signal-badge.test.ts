import { describe, expect, it } from "vitest";
import { signalLabel } from "./signal-badge";

describe("signalLabel", () => {
  it("신호마다 글자가 있다 — 색만으로 전하지 않음", () => {
    expect(signalLabel("cheap")).toBe("싼 편");
    expect(signalLabel("normal")).toBe("보통");
    expect(signalLabel("expensive")).toBe("비싼 편");
  });
});
