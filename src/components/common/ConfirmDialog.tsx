import React from 'react';
import { useNovel } from '../../context/NovelContext';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export const ConfirmDialog: React.FC = () => {
  const { confirmModal, closeConfirm } = useNovel();

  if (!confirmModal || !confirmModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-sm rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-5 shadow-2xl text-[var(--app-text)] space-y-4 scale-in duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                confirmModal.isDestructive
                  ? 'bg-red-500/15 text-red-500 border border-red-500/30'
                  : 'bg-[var(--app-accent-bg)] text-[var(--app-accent)] border border-[var(--app-border)]'
              }`}
            >
              {confirmModal.isDestructive ? (
                <Trash2 className="w-4 h-4 stroke-[2.2]" />
              ) : (
                <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--app-text)] leading-tight">
                {confirmModal.title}
              </h3>
            </div>
          </div>
          <button
            onClick={closeConfirm}
            className="p-1 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[var(--app-text-muted)] leading-relaxed">
          {confirmModal.message}
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--app-border)]">
          <button
            type="button"
            onClick={closeConfirm}
            className="px-3.5 py-1.5 rounded-xl border border-[var(--app-border)] text-xs font-medium text-[var(--app-text)] hover:bg-[var(--app-card-sub)] transition-colors"
          >
            {confirmModal.cancelLabel || 'Batal'}
          </button>
          <button
            type="button"
            onClick={() => {
              confirmModal.onConfirm();
              closeConfirm();
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm ${
              confirmModal.isDestructive
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-[var(--app-accent)] text-black hover:opacity-90'
            }`}
          >
            {confirmModal.confirmLabel || 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
};
