import { FieldNote } from "../api/fieldNote.api";

/**
 * Field notes grouped by plot for sidebar display
 */
export interface PlotWithFieldNotes {
  plotId: string;
  plotName: string;
  fieldNotes: FieldNote[];
  isExpanded: boolean;
}

/**
 * Selected field note state for content display
 */
export interface SelectedFieldNote {
  fieldNote: FieldNote;
  plotName: string;
}