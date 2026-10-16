export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function api<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-EcoTwin-Request": "1",
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new ApiError(
      typeof payload.detail === "string"
        ? payload.detail
        : "Vérifiez les informations saisies et réessayez.",
      response.status,
    );
  return payload as T;
}
export const number = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 1,
});
export const valueText = (value: number | null | undefined) =>
  value == null ? "—" : number.format(value);
export const time = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Paris",
});
export const date = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Paris",
});
export function downloadCsv(name: string, rows: unknown[][]) {
  const csv =
    "\uFEFF" +
    rows
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
          .join(";"),
      )
      .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const anchor = Object.assign(document.createElement("a"), {
    href: url,
    download: name,
  });
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
