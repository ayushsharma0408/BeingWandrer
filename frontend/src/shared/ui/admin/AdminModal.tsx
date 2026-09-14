import type { ReactNode } from 'react';

interface AdminModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  size?: 'default' | 'wide';
}

export const AdminModal = ({ title, children, onClose, size = 'default' }: AdminModalProps): JSX.Element => {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className={`modal-card admin-modal${size === 'wide' ? ' admin-modal-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <h2>{title}</h2>
          <button type="button" className="btn btn-ghost" onClick={onClose} aria-label="Close">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
