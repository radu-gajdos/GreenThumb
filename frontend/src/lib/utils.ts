import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { themeQuartz } from 'ag-grid-community';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Light theme is the default, but dark theme is applied via CSS in custom.css
export const wingoTheme = themeQuartz.withParams({
      accentColor: "#007BFF",
      borderColor: "#E3E5E6",
      borderRadius: 6,
      cellHorizontalPaddingScale: 0.8,
      checkboxBorderRadius: 4,
      checkboxCheckedBackgroundColor: "#007BFF",
      checkboxCheckedBorderColor: "#007BFF",
      columnBorder: true,
      rowBorder: true,
      fontFamily: {
        googleFont: "Open Sans"
      },
      fontSize: 14,
      foregroundColor: "#1E222A",
      headerBackgroundColor: "#F5F7F9",
      headerFontSize: 13,
      headerFontWeight: 600,
      headerTextColor: "#282D30",
      headerVerticalPaddingScale: 0.75,
      iconSize: 15,
      inputPaddingStart: 6,
      menuBorder: true,
      oddRowBackgroundColor: "#A2C4F212",
      // rowHoverColor: "#005AFF0D",
      selectedRowBackgroundColor: "#008AFF17",
      sideBarBackgroundColor: "#FFFFFF",
      sidePanelBorder: true,
      spacing: 7,
      wrapperBorderRadius: 6,
      rowVerticalPaddingScale: 1.3,
});

/**
 * Formatează numărul de bytes într-un format ușor de citit (KB, MB, etc.)
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Formatează data într-un format ușor de citit
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ro-RO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    // hour: '2-digit',
    // minute: '2-digit'
  });
}
export function formatDateGeneral(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ro-RO', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    // hour: '2-digit',
    // minute: '2-digit'
  });
}