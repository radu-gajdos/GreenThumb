import { $t } from "@/i18n";

/**
 * Lazily-evaluated translation for Zod error messages.
 * Use this in Zod schemas instead of directly calling $t("..."),
 * to prevent premature evaluation before i18n is ready.
 */
export const lazyT = (key: string) => () => $t(key);
