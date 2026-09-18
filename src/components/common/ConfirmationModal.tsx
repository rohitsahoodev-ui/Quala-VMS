import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  requireTypedConfirmation?: string; // If set, user must type this string (e.g. VM name)
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  isDestructive = true,
  requireTypedConfirmation,
  onConfirm,
  onCancel,
}) => {
  const [typedInput, setTypedInput] = useState('');

  if (!isOpen) return null;

  const isConfirmDisabled = Boolean(
    requireTypedConfirmation && typedInput.trim() !== requireTypedConfirmation.trim()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md glass-panel rounded-2xl p-6 border border-purple-500/20 shadow-2xl bg-[#0c0c1a]">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl shrink-0 ${
              isDestructive
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white font-sans">{title}</h3>
            <p className="mt-1 text-sm text-slate-300 leading-relaxed">{message}</p>
          </div>
        </div>

        {requireTypedConfirmation && (
          <div className="mt-4 pt-3 border-t border-white/5">
            <p className="text-xs text-slate-400 mb-2">
              To proceed, please type{' '}
              <span className="font-mono text-purple-400 font-semibold select-all">
                {requireTypedConfirmation}
              </span>{' '}
              to confirm:
            </p>
            <input
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder={requireTypedConfirmation}
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-purple-500/30 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
              autoFocus
            />
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isConfirmDisabled}
            onClick={() => {
              onConfirm();
              setTypedInput('');
            }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all shadow-md font-sans ${
              isConfirmDisabled
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/40'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
