"use client";

// 공유 — 휴대폰은 공유 창(Web Share) · 안 되면 주소 복사 (작업 0093) · 아무것도 보내지 않음 (브라우저 기능만)
import { useState } from "react";

export function ShareButton({ title, text }: { title: string; text: string }) {
  const [done, setDone] = useState<"copied" | "failed" | null>(null);
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return; // 사용자가 닫음
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setDone("copied");
    } catch {
      setDone("failed");
    }
    setTimeout(() => setDone(null), 2500);
  };
  return (
    <button type="button" onClick={share} className="inline-flex items-center gap-1.5 rounded-pill border border-line px-3 py-1 text-xs font-semibold text-fg-2 transition-colors hover:text-fg">
      <svg aria-hidden viewBox="0 0 16 16" className="size-3.5">
        <path d="M8 2v8M5 5l3-3 3 3M3 9v4h10V9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span aria-live="polite">{done === "copied" ? "주소를 복사했습니다" : done === "failed" ? "복사하지 못했습니다" : "공유"}</span>
    </button>
  );
}
