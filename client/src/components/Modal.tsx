import React from "react";

export default function Modal({
  open,
  title,
  children,
  onClose
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      onMouseDown={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "grid",
        placeItems: "center",
        padding: 16,
        zIndex: 50
      }}
    >
      <div
        className="panel"
        onMouseDown={(e) => e.stopPropagation()}
        style={{ width: "min(720px, 100%)", maxHeight: "80vh", overflow: "auto" }}
      >
        <div className="row" style={{ justifyContent: "space-between" }}>
          <strong>{title}</strong>
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="hr" />
        {children}
      </div>
    </div>
  );
}

