export const normalizeHexColor = (hexColor?: string) => {
  if (!hexColor) return undefined;
  const trimmed = hexColor.trim();
  if (!/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(trimmed)) return undefined;

  if (trimmed.length === 4) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
  }

  return trimmed;
};

export const hexToRgba = (hexColor: string, alpha: number) => {
  const normalized = normalizeHexColor(hexColor);
  if (!normalized) return undefined;

  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getTagTextColor = (hexColor?: string) => {
  const normalized = normalizeHexColor(hexColor);
  if (!normalized) return undefined;

  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.65 ? "#111827" : "#F8FAFC";
};
