const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

export const sanitizeExternalUrl = (value) => {
  if (!value || typeof value !== 'string') return null;

  try {
    const url = new URL(value);
    if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
};

export const sanitizeLocationPayload = (location) => {
  if (!location || typeof location !== 'object') return null;

  const lat = Number(location.lat);
  const lng = Number(location.lng);
  const url = sanitizeExternalUrl(location.url);

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !url) {
    return null;
  }

  return { lat, lng, url };
};

export const openSafeUrl = (value, target = '_blank') => {
  const safeUrl = sanitizeExternalUrl(value);
  if (!safeUrl) {
    return false;
  }

  window.open(safeUrl, target, 'noopener,noreferrer');
  return true;
};
