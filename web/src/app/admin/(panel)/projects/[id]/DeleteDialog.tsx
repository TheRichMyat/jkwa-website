"use client";

import { useEffect, useRef, useState } from "react";
import { AdminButton, inputClass } from "@/components/admin/ui";

interface DeleteDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  /** Resolves true when the project was deleted */
  onConfirm: (typedTitle: string) => Promise<boolean>;
}

/** "Type the project title to confirm" dialog (native <dialog>: focus trap and Escape built in) */
export default function DeleteDialog({ open, title, onClose, onConfirm }: DeleteDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setTyped("");
      dialog.showModal();
    } else if (!open && dialog.open) dialog.close();
  }, [open]);

  const matches = typed.trim() === title.trim();

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="delete-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-sm border border-line bg-paper p-6 shadow-2xl backdrop:bg-ink/50"
    >
      <form
        method="dialog"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!matches) return;
          setDeleting(true);
          const done = await onConfirm(typed);
          setDeleting(false);
          if (done) onClose();
        }}
      >
        <h2 id="delete-title" className="font-sans text-lg font-medium text-ink">
          Delete this project?
        </h2>
        <p className="mt-2 font-sans text-sm leading-relaxed text-body">
          The project and all its photos will be deleted for good. To confirm, type its title:{" "}
          <strong className="font-medium text-ink">{title}</strong>
        </p>
        <input
          aria-label="Project title"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoComplete="off"
          className={`${inputClass} mt-4`}
        />
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <AdminButton variant="secondary" onClick={onClose} disabled={deleting}>
            Cancel
          </AdminButton>
          <AdminButton type="submit" variant="danger" disabled={!matches} pending={deleting}>
            {deleting ? "Deleting…" : "Delete for good"}
          </AdminButton>
        </div>
      </form>
    </dialog>
  );
}
