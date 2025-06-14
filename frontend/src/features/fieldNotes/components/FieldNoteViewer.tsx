/**
 * FieldNotesViewer.tsx
 *
 * A Claude-like interface for browsing and viewing saved field notes.
 * Think of this as your agricultural knowledge library—organized by plots
 * with easy access to all your documented wisdom.
 */

import { PlotApi } from '@/features/plots/api/plot.api';
import { Plot } from '@/features/plots/interfaces/plot';
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import FieldNoteApi, { FieldNote } from '../api/fieldNote.api';
import {
  PlotWithFieldNotes,
  SelectedFieldNote,
} from '../interfaces/fieldNote';
import FieldNoteContent from './FieldNoteContent';
import SaveMessageModal from './SaveMessageModal';
import FieldNotesSidebar from './FieldNoteSidebar';

const FieldNotesViewer: React.FC = () => {
  const { t } = useTranslation();

  /** Loading state for initial data fetch */
  const [loading, setLoading] = useState(true);

  /**
   * Array of plots that have field notes.
   * Each entry includes:
   *  - plotId, plotName
   *  - fieldNotes: sorted list of FieldNote
   *  - isExpanded: whether the plot's notes are visible in the sidebar
   */
  const [plotsWithNotes, setPlotsWithNotes] = useState<PlotWithFieldNotes[]>([]);

  /** The currently selected note (or null if none selected) */
  const [selectedNote, setSelectedNote] = useState<SelectedFieldNote | null>(null);

  /** All plots fetched from the backend—needed to look up plotName when creating notes */
  const [plots, setPlots] = useState<Plot[]>([]);

  /** Controls visibility of the "create new field note" modal */
  const [showCreateModal, setShowCreateModal] = useState(false);

  /** Memoized API clients to avoid re-instantiation */
  const fieldNoteApi = useMemo(() => new FieldNoteApi(), []);
  const plotApi = useMemo(() => new PlotApi(), []);

  /**
   * Load all plots and all field notes on component mount.
   * Groups notes by plot and auto-selects the first available note.
   */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        // Fetch plots and notes in parallel
        const [allPlots, allFieldNotes] = await Promise.all([
          plotApi.findAll(),
          fieldNoteApi.findAll(),
        ]);

        setPlots(allPlots);

        // Build PlotWithFieldNotes entries only for plots that have notes
        const plotsWithFieldNotes: PlotWithFieldNotes[] = [];

        for (const plot of allPlots) {
          // Filter notes belonging to this plot
          const plotFieldNotes = allFieldNotes.filter(
            (note) => note.plotId === plot.id
          );

          if (plotFieldNotes.length > 0) {
            // Sort notes by creation date descending (newest first)
            plotFieldNotes.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );

            plotsWithFieldNotes.push({
              plotId: plot.id,
              plotName: plot.name,
              fieldNotes: plotFieldNotes,
              isExpanded: false, // default collapsed
            });
          }
        }

        setPlotsWithNotes(plotsWithFieldNotes);

        // If any notes exist, auto-select the first note of the first plot
        if (
          plotsWithFieldNotes.length > 0 &&
          plotsWithFieldNotes[0].fieldNotes.length > 0
        ) {
          const firstPlot = plotsWithFieldNotes[0];
          setSelectedNote({
            fieldNote: firstPlot.fieldNotes[0],
            plotName: firstPlot.plotName,
          });

          // Expand the first plot to show its notes
          setPlotsWithNotes((prev) =>
            prev.map((plot, index) =>
              index === 0 ? { ...plot, isExpanded: true } : plot
            )
          );
        }
      } catch (error) {
        console.error('Error loading field notes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fieldNoteApi, plotApi]);

  /**
   * Toggle whether a given plot's notes are expanded in the sidebar.
   * @param plotId - The plot to expand/collapse
   */
  const togglePlotExpansion = (plotId: string) => {
    setPlotsWithNotes((prev) =>
      prev.map((plot) =>
        plot.plotId === plotId
          ? { ...plot, isExpanded: !plot.isExpanded }
          : plot
      )
    );
  };

  /**
   * User selects a field note to view.
   * @param fieldNote - The note object
   * @param plotName - Name of the plot it belongs to
   */
  const selectFieldNote = (fieldNote: FieldNote, plotName: string) => {
    setSelectedNote({ fieldNote, plotName });
  };

  /**
   * Handle successful creation of a new field note:
   *  - Add to existing plot group or create a new group
   *  - Expand that plot and auto-select the new note
   * @param newFieldNote - The newly created note
   */
  const handleFieldNoteCreated = async (newFieldNote: FieldNote) => {
    // Find plotName from all plots state
    const plot = plots.find((p) => p.id === newFieldNote.plotId);
    const plotName = plot?.name || 'Unknown Plot';

    setPlotsWithNotes((prev) => {
      const existingIndex = prev.findIndex(
        (p) => p.plotId === newFieldNote.plotId
      );

      if (existingIndex >= 0) {
        // Insert new note at top of existing plot's notes
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          fieldNotes: [newFieldNote, ...updated[existingIndex].fieldNotes],
          isExpanded: true,
        };
        return updated;
      } else {
        // Create new plot-with-notes entry
        const newPlotWithNotes: PlotWithFieldNotes = {
          plotId: newFieldNote.plotId,
          plotName,
          fieldNotes: [newFieldNote],
          isExpanded: true,
        };
        return [newPlotWithNotes, ...prev];
      }
    });

    // Auto-select the new note
    setSelectedNote({ fieldNote: newFieldNote, plotName });
  };

  /**
   * Handle updating an existing field note:
   *  - Replace note in the plotsWithNotes state
   *  - If that note is currently selected, update selectedNote state
   * @param updatedFieldNote - Note returned from API after update
   */
  const handleFieldNoteUpdated = (updatedFieldNote: FieldNote) => {
    console.log('Updating field note:', updatedFieldNote);

    setPlotsWithNotes((prev) =>
      prev.map((plot) => ({
        ...plot,
        fieldNotes: plot.fieldNotes.map((note) =>
          note.id === updatedFieldNote.id ? updatedFieldNote : note
        ),
      }))
    );

    // If this was the selected note, update it as well
    if (selectedNote?.fieldNote.id === updatedFieldNote.id) {
      setSelectedNote({
        fieldNote: updatedFieldNote,
        plotName: selectedNote.plotName,
      });
    }
  };

  /**
   * Handle deleting a field note:
   *  - Remove from plotsWithNotes; if a plot loses all notes, remove that plot group
   *  - If the deleted note was selected, auto-select another or clear
   * @param deletedNoteId - ID of note to remove
   */
  const handleFieldNoteDeleted = (deletedNoteId: string) => {
    console.log('Deleting field note:', deletedNoteId);

    setPlotsWithNotes((prev) => {
      // Remove note from each plot's list
      const updated = prev
        .map((plot) => ({
          ...plot,
          fieldNotes: plot.fieldNotes.filter(
            (note) => note.id !== deletedNoteId
          ),
        }))
        .filter((plot) => plot.fieldNotes.length > 0); // Remove empty plots

      // If the deleted note was selected, choose a new one or clear
      if (selectedNote?.fieldNote.id === deletedNoteId) {
        if (updated.length > 0 && updated[0].fieldNotes.length > 0) {
          const firstPlot = updated[0];
          setSelectedNote({
            fieldNote: firstPlot.fieldNotes[0],
            plotName: firstPlot.plotName,
          });
          // Ensure the first plot is expanded
          updated[0].isExpanded = true;
        } else {
          setSelectedNote(null);
        }
      }

      return updated;
    });
  };

  // --- Render Loading, Empty, or Main UI ---

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-180px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  // If no notes exist at all, show empty state
  if (plotsWithNotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-180px)] text-center">
        <div className="mb-4">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nicio notiță salvată
        </h3>
        <p className="text-gray-500 max-w-md">
          Nu aveți încă notițe salvate din conversațiile cu AI-ul.
          Începeți să salvați sfaturile utile din chat-ul AI pentru a le
          vedea aici.
        </p>
      </div>
    );
  }

  // Main UI with sidebar and content area
  return (
    <div className="flex h-[calc(100vh-180px)] bg-gray-50">
      {/* Left Sidebar - list of plots and notes */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-lg font-semibold text-gray-900">
            Notițele mele
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {/* Total count of all field notes */}
            {plotsWithNotes.reduce(
              (total, plot) => total + plot.fieldNotes.length,
              0
            )}{' '}
            notițe salvate
          </p>
        </div>

        <div className="flex-1 overflow-hidden">
          <FieldNotesSidebar
            key={`sidebar-${plotsWithNotes.length}-${
              selectedNote?.fieldNote.id || 'none'
            }`}
            plotsWithNotes={plotsWithNotes}
            selectedNote={selectedNote}
            onTogglePlot={togglePlotExpansion}
            onSelectNote={selectFieldNote}
            onCreateNew={() => setShowCreateModal(true)}
          />
        </div>
      </div>

      {/* Right Content Area - either show the selected note or a placeholder */}
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <FieldNoteContent
            selectedNote={selectedNote}
            onUpdate={(updatedNote) => {
              console.log(
                'FieldNotesViewer received onUpdate callback with:',
                updatedNote
              );
              handleFieldNoteUpdated(updatedNote);
            }}
            onDelete={(deletedId) => {
              console.log(
                'FieldNotesViewer received onDelete callback with:',
                deletedId
              );
              handleFieldNoteDeleted(deletedId);
            }}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selectați o notiță pentru a o vizualiza
              </h3>
              <p className="text-gray-500">
                Alegeți o notiță din sidebar pentru a vedea conținutul complet.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal for creating a new field note */}
      <SaveMessageModal
        showModal={showCreateModal}
        setShowModal={setShowCreateModal}
        mode="create"
        availablePlots={plots.map((plot) => ({ id: plot.id, name: plot.name }))}
        onSave={handleFieldNoteCreated}
      />
    </div>
  );
};

export default FieldNotesViewer;