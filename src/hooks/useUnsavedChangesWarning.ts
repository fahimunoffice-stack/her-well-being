import * as React from "react";

/**
 * Shows a native browser warning when the user tries to close/refresh the tab with unsaved changes.
 * Note: Browsers ignore custom text and show their own message.
 */
export function useUnsavedChangesWarning(enabled: boolean) {
  React.useEffect(() => {
    if (!enabled) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Required for Chrome
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [enabled]);
}
