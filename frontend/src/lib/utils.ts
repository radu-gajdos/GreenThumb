import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { themeQuartz } from 'ag-grid-community';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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
      rowHoverColor: "#005AFF0D",
      selectedRowBackgroundColor: "#008AFF17",
      sideBarBackgroundColor: "#FFFFFF",
      sidePanelBorder: true,
      spacing: 7,
      wrapperBorderRadius: 6,
      rowVerticalPaddingScale: 1.3,
  });