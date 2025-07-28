import React, { useEffect } from 'react';

import './Modal.scss';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
    }
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="atom-modal__backdrop" onClick={onClose}>
      <div className="atom-modal__content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default Modal; 