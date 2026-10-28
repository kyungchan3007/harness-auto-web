"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost";

const VARIANT: Record<Variant, string> = {
  primary: "bg-accent text-on-accent hover:opacity-90",
  secondary: "border border-line text-fg hover:bg-surface-2",
  ghost: "text-accent hover:underline underline-offset-4",
};

/** 한 화면에 primary 는 하나만 (참고 페이지: 상단 버튼 하나) */
export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof BaseButton> & { variant?: Variant }) {
  return (
    <BaseButton
      className={`inline-flex items-center justify-center gap-2 rounded-pill px-5 py-2 text-sm font-semibold transition-opacity duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent data-disabled:opacity-40 ${VARIANT[variant]} ${className}`}
      {...props}
    />
  );
}
