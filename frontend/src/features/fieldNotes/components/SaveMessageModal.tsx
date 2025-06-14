import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookMarked, Plus } from "lucide-react";
import SearchSelect from "@/components/ui/searchSelect";
import FieldNoteApi, { FieldNote } from "../api/fieldNote.api";
import { FieldNoteFormType, fieldNoteFormSchema } from "../constants/formSchema";

interface SaveMessageModalProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  messageText?: string;
  plotId?: string;
  availablePlots?: Array<{ id: string; name: string }>;
  onSave?: (fieldNote: FieldNote) => void;
  mode?: 'save' | 'create';
}

const SaveMessageModal: React.FC<SaveMessageModalProps> = ({
  showModal,
  setShowModal,
  messageText = '',
  plotId = '',
  availablePlots = [],
  onSave,
  mode = 'save',
}) => {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const fieldNoteApi = useMemo(() => new FieldNoteApi(), []);

  const form = useForm<FieldNoteFormType>({
    resolver: zodResolver(fieldNoteFormSchema),
    defaultValues: {
      title: "",
      message: messageText,
      plotId: plotId,
    },
  });

  useEffect(() => {
    if (showModal) {
      form.reset({
        title: "",
        message: messageText,
        plotId: plotId,
      });
    }
  }, [showModal, messageText, plotId, form]);

  const isCreateMode = mode === 'create';
  const modalTitle = isCreateMode ? t("saveMessageModal.createTitle") : t("saveMessageModal.saveTitle");
  const modalDescription = isCreateMode ? t("saveMessageModal.createDescription") : t("saveMessageModal.saveDescription");
  const modalIcon = isCreateMode ? <Plus className="w-4" /> : <BookMarked className="w-4" />;

  const onSubmit = async (data: FieldNoteFormType) => {
    setSaving(true);
    try {
      const savedFieldNote = await fieldNoteApi.create({
        title: data.title,
        message: data.message,
        plotId: data.plotId,
      });
      onSave?.(savedFieldNote);
      setShowModal(false);
    } catch (error) {
      console.error("Error saving field note:", error);
    } finally {
      setSaving(false);
    }
  };

  const generateSuggestedTitle = () => {
    if (isCreateMode) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('ro-RO', {
        day: 'numeric',
        month: 'short',
      });
      const timeStr = now.toLocaleTimeString('ro-RO', {
        hour: '2-digit',
        minute: '2-digit',
      });
      form.setValue("title", `${t("saveMessageModal.generatedTitlePrefix")} - ${dateStr} ${timeStr}`, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    const maxLength = 50;
    let suggested = messageText.trim();
    if (suggested.length > maxLength) {
      suggested = suggested.substring(0, maxLength).trim() + "...";
    }
    suggested = suggested.replace(/\s+/g, " ");
    form.setValue("title", suggested, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal} modal>
      <DialogContent className="sm:max-w-2xl dialog-animation">
        <DialogHeader className="flex flex-row items-start space-y-0 pb-2">
          <div className="flex items-start gap-3 flex-col">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background">
              {modalIcon}
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                {modalTitle}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {modalDescription}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            id="fieldNoteForm"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-2"
          >
            {isCreateMode && (
              <FormField
                control={form.control}
                name="plotId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("saveMessageModal.plot")}</FormLabel>
                    <FormControl>
                      <SearchSelect
                        options={availablePlots.map((plot) => ({
                          label: plot.name,
                          value: plot.id,
                        }))}
                        placeholder={t("saveMessageModal.selectPlot")}
                        value={field.value}
                        onValueChange={field.onChange}
                        modal={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>{t("saveMessageModal.title")}</FormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={generateSuggestedTitle}
                      className="text-xs h-auto p-1"
                    >
                      {isCreateMode ? t("saveMessageModal.generateFromDate") : t("saveMessageModal.generateFromMessage")}
                    </Button>
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t("saveMessageModal.titlePlaceholder")}
                      maxLength={100}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isCreateMode ? t("saveMessageModal.noteContent") : t("saveMessageModal.messageContent")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      readOnly={!isCreateMode}
                      className={`min-h-[200px] resize-none ${!isCreateMode ? "bg-gray-50" : ""}`}
                      placeholder={
                        isCreateMode
                          ? t("saveMessageModal.noteContentPlaceholder")
                          : t("saveMessageModal.messageContentPlaceholder")
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter className="grid grid-cols-2 gap-2 pt-0 pb-2">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="text-sm h-9"
              disabled={saving}
            >
              {t("saveMessageModal.cancel")}
            </Button>
          </DialogClose>
          <Button
            type="submit"
            size="sm"
            className="text-sm h-9"
            form="fieldNoteForm"
            disabled={saving}
          >
            {saving
              ? isCreateMode
                ? t("saveMessageModal.creating")
                : t("saveMessageModal.saving")
              : isCreateMode
              ? t("saveMessageModal.create")
              : t("saveMessageModal.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveMessageModal;
