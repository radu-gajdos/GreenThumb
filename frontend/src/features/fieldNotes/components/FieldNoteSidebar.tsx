import React from 'react';
import { useTranslation } from 'react-i18next';
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
  plotsWithNotes: PlotWithFieldNotes[];
  selectedNote: SelectedFieldNote | null;
  onTogglePlot: (plotId: string) => void;
  onSelectNote: (fieldNote: FieldNote, plotName: string) => void;
  onCreateNew: () => void;
}

const FieldNotesSidebar: React.FC<FieldNotesSidebarProps> = ({
  plotsWithNotes,
  selectedNote,
  onTogglePlot,
  onSelectNote,
  onCreateNew,
}) => {
  const { t, i18n } = useTranslation();

  const formatNoteTitle = (fieldNote: FieldNote) => {
    const maxLength = 40;
    let title = fieldNote.title;
    return title.length > maxLength ? title.substring(0, maxLength).trim() + '...' : title;
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('fieldNotesSidebar.today');
    if (diffDays === 1) return t('fieldNotesSidebar.yesterday');
    if (diffDays > 1 && diffDays <= 7) return t('fieldNotesSidebar.daysAgo', { count: diffDays });

    return d.toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b border-gray-200 flex-shrink-0">
        <Button
          variant="default"
          className="flex items-left gap-2 pl-3 pr-3 w-full"
          onClick={onCreateNew}
        >
          <Plus className="h-4 w-4" />
          {t('fieldNotesSidebar.createNew')}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          {plotsWithNotes.map((plot) => (
            <div key={plot.plotId} className="space-y-1">
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

              {plot.isExpanded && (
                <div className="ml-6 space-y-1">
                  {plot.fieldNotes.map((fieldNote) => {
                    const isSelected = selectedNote?.fieldNote.id === fieldNote.id;
                    return (
                      <button
                        key={fieldNote.id}
                        onClick={() => onSelectNote(fieldNote, plot.plotName)}
                        className={`w-full flex items-start gap-3 px-3 py-2.5 text-left rounded-lg transition-colors ${
                          isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                        }`}
                      >
                        <MessageSquare
                          className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                            isSelected ? 'text-blue-600' : 'text-gray-400'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-sm font-medium truncate ${
                              isSelected ? 'text-blue-900' : 'text-gray-900'
                            }`}
                          >
                            {formatNoteTitle(fieldNote)}
                          </div>
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
    </div>
  );
};

export default FieldNotesSidebar;