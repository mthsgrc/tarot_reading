import { useEffect, useRef } from "react";
import type { MouseEvent } from "react";
import type { DrawnCard } from "../domain/types";
import { CardDetail } from "./CardDetail";
import styles from "./CardDetailDialog.module.css";

interface CardDetailDialogProps {
  drawn: DrawnCard | null;
  onClose: () => void;
}

export function CardDetailDialog({ drawn, onClose }: CardDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (drawn) {
      if (!dialog.open) {
        if (typeof dialog.showModal === "function") {
          dialog.showModal();
        } else {
          // jsdom does not implement the dialog methods, so keep the component testable.
          dialog.setAttribute("open", "");
        }
      }
      return;
    }

    if (dialog.open) {
      if (typeof dialog.close === "function") {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
      }
    }
  }, [drawn]);

  function closeDialog() {
    const dialog = dialogRef.current;

    if (dialog?.open) {
      if (typeof dialog.close === "function") {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
      }
    }

    onClose();
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      closeDialog();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="card-dialog-title"
      onClose={onClose}
      onClick={handleBackdropClick}
    >
      {drawn && (
        <div className={styles.content}>
          <button
            type="button"
            className={styles.close}
            onClick={closeDialog}
            aria-label="Close card details"
          >
            <span aria-hidden="true">×</span>
          </button>

          <CardDetail
            card={drawn.card}
            orientation={drawn.orientation}
            positionLabel={drawn.position.label}
            positionHint={drawn.position.hint}
            headingId="card-dialog-title"
          />

          <div className={styles.dialogFooter}>
            <button type="button" className="button button--small" onClick={closeDialog}>
              Back to the spread
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
