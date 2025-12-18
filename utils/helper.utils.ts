export const timeAgo = (iso: string) => {
  const created = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - created) / 1000;
  const d = Math.floor(diff / 86400);
  if (d >= 1) return `${d} ngày trước`;
  const h = Math.floor(diff / 3600);
  if (h >= 1) return `${h} tiếng trước`;
  const m = Math.floor(diff / 60);
  if (m >= 1) return `${m} phút trước`;
  return "Vừa xong";
};