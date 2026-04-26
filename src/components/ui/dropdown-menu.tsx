"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext(): DropdownMenuContextValue {
  const ctx = React.useContext(DropdownMenuContext);
  if (!ctx) {
    throw new Error("DropdownMenu components must be used inside DropdownMenu");
  }
  return ctx;
}

function DropdownMenu({ children }: Readonly<{ children: React.ReactNode }>) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const value = React.useMemo(() => ({ open, setOpen }), [open]);

  React.useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!open) return;
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={value}>
      <div ref={rootRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

function DropdownMenuTrigger({
  asChild,
  children,
}: Readonly<{
  asChild?: boolean;
  children: React.ReactNode;
}>) {
  const { open, setOpen } = useDropdownMenuContext();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...(children.props as object),
      "aria-expanded": open,
      "aria-haspopup": "menu",
      onClick: (event: React.MouseEvent) => {
        const props = children.props as { onClick?: (e: React.MouseEvent) => void };
        props.onClick?.(event);
        if (!event.defaultPrevented) setOpen((prev) => !prev);
      },
    });
  }

  return (
    <button
      type="button"
      aria-expanded={open}
      aria-haspopup="menu"
      onClick={() => setOpen((prev) => !prev)}
    >
      {children}
    </button>
  );
}

function DropdownMenuContent({
  align = "center",
  className,
  children,
}: Readonly<{
  align?: "start" | "center" | "end";
  className?: string;
  children: React.ReactNode;
}>) {
  const { open } = useDropdownMenuContext();

  if (!open) return null;

  return (
    <div
      role="menu"
      className={cn(
        "absolute z-50 mt-2 min-w-32 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md",
        align === "end" && "right-0",
        align === "start" && "left-0",
        align === "center" && "left-1/2 -translate-x-1/2",
        className
      )}
    >
      {children}
    </div>
  );
}

function DropdownMenuItem({
  className,
  onClick,
  children,
}: Readonly<{
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}>) {
  const { setOpen } = useDropdownMenuContext();

  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        "w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted focus-visible:bg-muted outline-none",
        className
      )}
      onClick={() => {
        onClick?.();
        setOpen(false);
      }}
    >
      {children}
    </button>
  );
}

export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger };
