"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { XIcon } from "lucide-react";

function cn(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

type Ctx = { open: boolean; setOpen: (v: boolean) => void };
const DialogCtx = React.createContext<Ctx | null>(null);

type RootProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

function Dialog({ open = false, onOpenChange, children }: RootProps) {
  const [internalOpen, setInternalOpen] = React.useState(open);
  React.useEffect(() => {
    setInternalOpen(open);
    // Add class to body to isolate dialog
    if (open && typeof document !== "undefined") {
      document.body.classList.add("dialog-open");
    } else if (!open && typeof document !== "undefined") {
      document.body.classList.remove("dialog-open");
    }
  }, [open]);
  const setOpen = (v: boolean) => (onOpenChange ? onOpenChange(v) : setInternalOpen(v));
  return (
    <DialogCtx.Provider value={{ open: onOpenChange ? open : internalOpen, setOpen }}>
      {children}
    </DialogCtx.Provider>
  );
}

function useDialog() {
  const ctx = React.useContext(DialogCtx);
  if (!ctx) throw new Error("Dialog.* must be used within <Dialog>");
  return ctx;
}

export function DialogTrigger(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
) {
  const { setOpen } = useDialog();
  const { onClick, ...rest } = props;
  return (
    <button
      {...rest}
      data-slot="dialog-trigger"
      onClick={(e) => {
        onClick?.(e);
        setOpen(true);
      }}
    />
  );
}

function DialogPortal({ children }: { children?: React.ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

// Lock body scroll while open
function useBodyScrollLock(active: boolean) {
  React.useEffect(() => {
    if (!active || typeof window === "undefined") return;
    const body = document.body;
    const html = document.documentElement;
    const scrollY = window.scrollY;

    const prev = {
      bodyPos: body.style.position,
      bodyTop: body.style.top,
      bodyW: body.style.width,
      bodyOv: body.style.overflow,
      htmlOv: html.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";

    return () => {
      body.style.position = prev.bodyPos;
      body.style.top = prev.bodyTop;
      body.style.width = prev.bodyW;
      body.style.overflow = prev.bodyOv;
      html.style.overflow = prev.htmlOv;
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}

export const DialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="dialog-overlay"
    className={cn(
      "fixed inset-0 z-[2147483647] bg-black pointer-events-auto",
      className
    )}
    style={{
      backdropFilter: "none",
      WebkitBackdropFilter: "none",
      mixBlendMode: "normal",
    }}
    {...props}
  />
));
DialogOverlay.displayName = "DialogOverlay";

export const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => {
  const { open, setOpen } = useDialog();
  if (!open) return null;

  useBodyScrollLock(true);

  return (
    <DialogPortal>
      <div
        className={cn(
          "fixed inset-0 z-[2147483647] isolate bg-white dark:bg-neutral-900",
          "flex items-center justify-center p-4"
        )}
        aria-modal="true"
        role="dialog"
      >
        <DialogOverlay onClick={() => setOpen(false)} />
        <div
          ref={ref}
          data-slot="dialog-content"
          className={cn(
            "ka-dialog-root",
            "relative z-[2147483648] pointer-events-auto isolate", // Enable pointer events
            "w-full max-w-[calc(100%-2rem)] sm:max-w-2xl",
            "rounded-lg border p-6 shadow-xl",
            "max-h-[85vh] overflow-y-auto bg-white dark:bg-neutral-900",
            className
          )}
          style={{
            backgroundColor: "rgb(255, 255, 255)",
            mixBlendMode: "normal",
            backdropFilter: "none",
            WebkitBackdropFilter: "none",
            filter: "none",
            opacity: 1,
          }}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {/* HARD RESET: Stop any page blend/blur/opacity leakage */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
              .ka-dialog-root, .ka-dialog-root * {
                mix-blend-mode: normal !important;
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
                filter: none !important;
                opacity: 1 !important;
                background-color: inherit !important;
              }
              body:not(.dialog-open) * {
                z-index: auto !important;
              }
              body.dialog-open *:not(.ka-dialog-root) {
                z-index: 0 !important;
              }
              `,
            }}
          />
          {children}
          <button
            data-slot="dialog-close"
            className={cn(
              "absolute right-4 top-4 rounded-xs opacity-70 transition-opacity hover:opacity-100",
              "focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background"
            )}
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </DialogPortal>
  );
});
DialogContent.displayName = "DialogContent";

export function DialogHeader(props: React.ComponentProps<"div">) {
  const { className, ...rest } = props;
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...rest}
    />
  );
}

export function DialogFooter(props: React.ComponentProps<"div">) {
  const { className, ...rest } = props;
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...rest}
    />
  );
}

export const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<"h2">
>(({ className, ...props }, ref) => (
  <h2 ref={ref} data-slot="dialog-title" className={cn("text-lg font-semibold leading-none", className)} {...props} />
));
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<"p">
>(({ className, ...props }, ref) => (
  <p ref={ref} data-slot="dialog-description" className={cn("text-sm text-muted-foreground", className)} {...props} />
));
DialogDescription.displayName = "DialogDescription";

export function DialogClose(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useDialog();
  const { onClick, ...rest } = props;
  return (
    <button
      data-slot="dialog-close"
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        setOpen(false);
      }}
    />
  );
}

export { Dialog };