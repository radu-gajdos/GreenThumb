/**
 * FieldNotesSidebar.tsx
 *
 * Claude-style sidebar for browsing field notes organized by plots.
 * Each plot acts like a folder; expanding it reveals its field notes.
 */

import React from 'react';
import {
  ChevronDown,
  ChevronRight,
  MapPin,
  MessageSquare,
  Plus,
} from 'lucide-react';
import { FieldNote } from '../api/fieldNote.api';
import {
  PlotWithFieldNotes,
  SelectedFieldNote,
} from '../interfaces/fieldNote';
import { Button } from '@/components/ui/button';

interface FieldNotesSidebarProps {
  /** Array of plots, each containing its field notes and expanded state */
  plotsWithNotes: PlotWithFieldNotes[];
  /** Currently selected note (or null if none) */
  selectedNote: SelectedFieldNote | null;
  /** Toggle expand/collapse for a given plotId */
  onTogglePlot: (plotId: string) => void;
  /** Select a specific field note, passing note + its plot name */
  onSelectNote: (fieldNote: FieldNote, plotName: string) => void;
  /** Callback to trigger creation of a new field note */
  onCreateNew: () => void;
}

/**
 * FieldNotesSidebar
 *
 * Renders:
 *  - A “Create New Field Note” button at the top
 *  - A list of plots; each can be expanded to show its field notes
 *  - Each note shows a truncated title and a relative/short date
 */
const FieldNotesSidebar: React.FC<FieldNotesSidebarProps> = ({
  plotsWithNotes,
  selectedNote,
  onTogglePlot,
  onSelectNote,
  onCreateNew,
}) => {
  /**
   * Truncate note titles longer than 40 characters, appending "..."
   */
  const formatNoteTitle = (fieldNote: FieldNote) => {
    const maxLength = 40;
    let title = fieldNote.title;

    if (title.length > maxLength) {
      title = title.substring(0, maxLength).trim() + '...';
    }

    return title;
  };

  /**
   * Format creation date for display:
   *  - “Astăzi” if within 1 day
   *  - “Ieri” if within 2 days
   *  - “X zile în urmă” if within past week
   *  - Otherwise, “DD MMM” in Romanian locale
   */
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Astăzi';
    } else if (diffDays === 2) {
      return 'Ieri';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} zile în urmă`;
    } else {
      return d.toLocaleDateString('ro-RO', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Create New Field Note Button */}
      <div className="p-2 border-b border-gray-200">
        <Button
          variant="default"
          className="flex items-left gap-2 pl-3 pr-3 w-full"
          onClick={onCreateNew}
        >
          <Plus className="h-4 w-4" />
          Creează notiță nouă
        </Button>
      </div>

      {/* List of plots and their notes */}
      <div className="space-y-1 p-2">
        {plotsWithNotes.map((plot) => (
          <div key={plot.plotId} className="space-y-1">
            {/* Plot Header: toggles expand/collapse */}
            <button
              onClick={() => onTogglePlot(plot.plotId)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {plot.isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
              <MapPin className="w-4 h-4 text-green-600" />
              <span className="flex-1 truncate">{plot.plotName}</span>
              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                {plot.fieldNotes.length}
              </span>
            </button>

            {/* Field Notes List for expanded plot */}
            {plot.isExpanded && (
              <div className="ml-6 space-y-1">
                {plot.fieldNotes.map((fieldNote) => {
                  const isSelected =
                    selectedNote?.fieldNote.id === fieldNote.id;

                  return (
                    <button
                      key={fieldNote.id}
                      onClick={() => onSelectNote(fieldNote, plot.plotName)}
                      className={`w-full flex items-start gap-3 px-3 py-2.5 text-left rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Note icon changes color if selected */}
                      <MessageSquare
                        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          isSelected ? 'text-blue-600' : 'text-gray-400'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        {/* Truncated title */}
                        <div
                          className={`text-sm font-medium truncate ${
                            isSelected ? 'text-blue-900' : 'text-gray-900'
                          }`}
                        >
                          {formatNoteTitle(fieldNote)}
                        </div>
                        {/* Relative or short date */}
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(fieldNote.createdAt)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FieldNotesSidebar;
