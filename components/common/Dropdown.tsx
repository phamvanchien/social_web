"use client";
import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";

export type DropdownItem = {
  label: ReactNode;
  value: string;
  icon?: ReactNode;
};

type DropdownProps = {
  items: DropdownItem[];
  value: string;
  onChange: (value: string) => void;
  renderTrigger?: (selected: DropdownItem | undefined, open: boolean) => ReactNode;
  className?: string;
  buttonClassName?: string;
  placement?: "left" | "right"; // panel alignment relative to trigger
  panelClassName?: string;
};

export default function Dropdown({
  items,
  value,
  onChange,
  renderTrigger,
  className,
  buttonClassName,
  placement = "right",
  panelClassName,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = useMemo(() => items.find((i) => i.value === value), [items, value]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={rootRef} className={clsx("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className={clsx(
          "inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-sm text-gray-700 hover:bg-gray-100",
          buttonClassName
        )}
      >
        {renderTrigger ? (
          renderTrigger(selected, open)
        ) : (
          <>
            {selected?.icon}
            <span className="truncate max-w-[8rem]">{selected?.label}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </>
        )}
      </button>

      {open && (
        <div
          className={clsx(
            "absolute z-[1001] mt-1 min-w-[180px] rounded-xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden",
            placement === "right" ? "right-0" : "left-0",
            panelClassName
          )}
        >
          <ul className="py-1">
            {items.map((it) => (
              <li key={it.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(it.value);
                    setOpen(false);
                  }}
                  className={clsx(
                    "w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50",
                    value === it.value ? "bg-gray-50" : undefined
                  )}
                >
                  {it.icon}
                  <span>{it.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

