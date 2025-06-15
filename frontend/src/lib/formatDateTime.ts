import i18n from '@/i18n';

/**
 * Formatează doar data, ex: "14 iunie 2025" (ro), "14. Juni 2025" (de)
 */
export const formatDate = (date: Date | string): string => {
  const locale = i18n.language;
  const d = new Date(date);
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Formatează doar ora, ex: "14:30"
 */
export const formatTime = (date: Date | string): string => {
  const locale = i18n.language;
  const d = new Date(date);
  return d.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formatează data + ora, ex: "14 iunie 2025, 14:30"
 */
export const formatDateTime = (date: Date | string): string => {
  const locale = i18n.language;
  const d = new Date(date);
  return d.toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
