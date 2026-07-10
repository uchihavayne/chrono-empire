import { type ReactNode } from 'react';
import { useT } from '../hooks';

export function Modal({ children }: { children: ReactNode }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">{children}</div>
    </div>
  );
}

export function ConfirmModal(props: {
  icon: string;
  title: string;
  text: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useT();
  return (
    <Modal>
      <div className="m-icon">{props.icon}</div>
      <h3>{props.title}</h3>
      <p>{props.text}</p>
      <div className="m-actions">
        <button className="m-secondary" onClick={props.onCancel}>{t('cancel')}</button>
        <button className={props.danger ? 'm-danger' : 'm-primary'} onClick={props.onConfirm}>
          {props.confirmLabel ?? t('confirm')}
        </button>
      </div>
    </Modal>
  );
}
