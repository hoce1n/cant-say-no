import type { ReactNode } from "react";
import { Toaster } from "sonner";

/**
 * App-wide client provider mounted once near the top of the document shell.
 * Auth stays a passthrough; toasts live here so every route can call them.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-center"
        theme="light"
        toastOptions={{
          className:
            "!bg-card !text-foreground !shadow-[var(--shadow-paper)] !border-0 !font-sans",
        }}
      />
    </>
  );
}
