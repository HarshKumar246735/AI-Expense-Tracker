import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SearchX } from "lucide-react";
import toast from "react-hot-toast";
import * as transactionApi from "../api/transactionApi";
import { useFetch } from "../hooks/useFetch";
import { getErrorMessage } from "../utils/errors";
import PageHeader from "../components/PageHeader";
import AIExpenseInput from "../components/AIExpenseInput";
import TransactionForm from "../components/TransactionForm";
import SkeletonLoader from "../components/SkeletonLoader";
import EmptyState from "../components/EmptyState";
import "./TransactionFormPage.css";

export default function TransactionFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [prefill, setPrefill] = useState(null);
  const [prefillKey, setPrefillKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const existing = useFetch(() => transactionApi.get(id), [id], { enabled: isEdit });

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (isEdit) await transactionApi.update(id, values);
      else await transactionApi.create(values);
      toast.success(isEdit ? "Transaction updated" : "Transaction added");
      navigate("/transactions");
    } catch (err) {
      toast.error(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  const handleParsed = (transaction) => {
    setPrefill(transaction);
    setPrefillKey((k) => k + 1);
  };

  return (
    <div className="stack txn-page">
      <PageHeader title={isEdit ? "Edit transaction" : "Add transaction"} subtitle={isEdit ? "Update the details below." : "Type it in plain English, or fill in the form."} />

      {!isEdit && <AIExpenseInput onParsed={handleParsed} />}

      <section className="card">
        {isEdit && existing.loading && <SkeletonLoader count={5} height={40} />}
        {isEdit && existing.error && (
          <EmptyState icon={SearchX} title="Transaction not found" message={existing.error} action={<button type="button" className="btn" onClick={() => navigate("/transactions")}>Back to transactions</button>} />
        )}
        {isEdit && existing.data && (
          <TransactionForm key={existing.data.transaction._id} initial={existing.data.transaction} submitLabel="Save changes" submitting={submitting} onSubmit={handleSubmit} onCancel={() => navigate("/transactions")} />
        )}
        {!isEdit && (
          <TransactionForm key={`new-${prefillKey}`} initial={prefill} submitLabel="Add transaction" submitting={submitting} onSubmit={handleSubmit} onCancel={() => navigate("/transactions")} />
        )}
      </section>
    </div>
  );
}
