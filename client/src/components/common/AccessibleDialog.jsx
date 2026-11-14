import React, { useEffect, useRef } from "react";

const AccessibleDialog = ({
  open,
  onClose,
  labelledBy,
  describedBy,
  panelClassName = "",
  children,
}) => {
  const dialogRef = useRef(null);
  const returnFocusRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return undefined;

    returnFocusRef.current = document.activeElement;
    dialog.showModal();

    const initialFocus = dialog.querySelector("[data-dialog-initial-focus]")
      || dialog.querySelector("button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href]");
    (initialFocus || dialog).focus({ preventScroll: true });

    return () => {
      if (dialog.open) dialog.close();
      const returnFocus = returnFocusRef.current;
      const focusTarget = returnFocus?.isConnected
        ? returnFocus
        : document.querySelector("main");
      if (focusTarget) {
        if (!returnFocus?.isConnected && !focusTarget.hasAttribute("tabindex")) {
          focusTarget.setAttribute("tabindex", "-1");
        }
        requestAnimationFrame(() => {
          if (focusTarget.isConnected) focusTarget.focus({ preventScroll: true });
        });
      }
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      tabIndex={-1}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className={`${open ? "flex" : "hidden"} fixed inset-0 m-0 h-full w-full max-h-none max-w-none items-center justify-center overflow-y-auto border-0 bg-transparent p-4 text-inherit backdrop:bg-black/40`}
    >
      <div className={`max-h-[calc(100vh-2rem)] max-h-[calc(100dvh-2rem)] w-full overflow-y-auto ${panelClassName}`}>
        {children}
      </div>
    </dialog>
  );
};

export default AccessibleDialog;
