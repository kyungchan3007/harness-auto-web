"use client";

import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import type { ReactElement, ReactNode } from "react";

/** 툴팁 — 보조 설명만 (터치에서는 안 뜸: 꼭 필요한 정보는 화면에 직접 쓴다) */
export function Tooltip({ content, children }: { content: ReactNode; children: ReactElement }) {
  return (
    <BaseTooltip.Provider>
      <BaseTooltip.Root>
        <BaseTooltip.Trigger render={children} />
        <BaseTooltip.Portal>
          <BaseTooltip.Positioner sideOffset={10}>
            <BaseTooltip.Popup className="max-w-xs rounded-xl bg-surface-2 px-3 py-2 text-sm text-fg shadow-lg ring-1 ring-line transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0">
              {content}
            </BaseTooltip.Popup>
          </BaseTooltip.Positioner>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
  );
}
