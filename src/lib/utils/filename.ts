/**
 * Builds a clean, filesystem-safe download filename from a product title
 * and its stored file path (e.g. "products/1699999999.pdf" -> keeps the
 * ".pdf" extension, swaps the title in for the timestamp).
 */
export function buildDownloadFilename(title: string, filePath: string): string {
  const extension = filePath.split(".").pop() ?? "";
  const safeTitle = title.replace(/[\\/:*?"<>|]+/g, "").trim() || "download";
  return extension ? `${safeTitle}.${extension}` : safeTitle;
}
