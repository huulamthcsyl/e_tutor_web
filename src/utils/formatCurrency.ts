export function formatCurrency(tuition: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(tuition);
}
