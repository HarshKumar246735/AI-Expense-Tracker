import Modal from "./Modal";
import "./ConfirmDialog.css";

export default function ConfirmDialog({ title = "Are you sure?", message, confirmLabel = "Delete", loading, onConfirm, onCancel }) {
  return (
    <Modal title={title} onClose={onCancel} width={420}>
      <p className="confirm-message">{message}</p>
      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? "Please wait..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
