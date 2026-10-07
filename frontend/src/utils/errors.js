export function getErrorMessage(err) {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.code === "ECONNABORTED") return "The request took too long. Please try again.";
  if (err?.request && !err?.response) return "Cannot reach the server. Check that the backend is running.";
  return err?.message || "Something went wrong";
}

// Triggers a browser download for a Blob
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
