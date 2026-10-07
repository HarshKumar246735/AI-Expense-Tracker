import client from "./client";
import { downloadBlob } from "../utils/errors";

export const preview = (params) => client.get("/reports", { params: { ...params, format: "json" } });

export async function download(params, format) {
  try {
    const res = await client.get("/reports", { params: { ...params, format }, responseType: "blob" });
    const match = /filename="?([^"]+)"?/.exec(res.headers["content-disposition"] || "");
    downloadBlob(res.data, match ? match[1] : `report.${format}`);
  } catch (err) {
    // error bodies arrive as Blobs when responseType is "blob"; turn them back into JSON
    if (err.response?.data instanceof Blob) {
      try {
        err.response.data = JSON.parse(await err.response.data.text());
      } catch {
        /* keep the original error */
      }
    }
    throw err;
  }
}
