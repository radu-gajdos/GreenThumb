import http from "@/api/http";
import { ToastService } from "@/services/toast.service";
import { $t } from "@/i18n";

/**
 * Represents a single field note stored in the backend.
 */
export interface FieldNote {
  id: string;
  title: string;
  message: string;
  plotId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFieldNoteDto {
  title: string;
  message: string;
  plotId: string;
}

export interface UpdateFieldNoteDto {
  id: string;
  title?: string;
  message?: string;
}

/**
 * @class FieldNoteApi
 * @description
 * Provides methods to create, read, update, and delete field notes via HTTP.
 */
export class FieldNoteApi {
  async create(data: CreateFieldNoteDto): Promise<FieldNote> {
    try {
      const response = await http.post("/field-notes", data);
      ToastService.success($t("fieldNoteApi.create.success"));
      return response.data.data;
    } catch (error) {
      ToastService.error($t("fieldNoteApi.create.error"));
      throw error;
    }
  }

  async findAll(): Promise<FieldNote[]> {
    try {
      const response = await http.get("/field-notes");
      return response.data.data || [];
    } catch (error) {
      ToastService.error($t("fieldNoteApi.findAll.error"));
      return [];
    }
  }

  async findAllForPlot(plotId: string): Promise<FieldNote[]> {
    try {
      const response = await http.get(`/field-notes/plot/${plotId}`);
      return response.data.data || [];
    } catch (error) {
      ToastService.error($t("fieldNoteApi.findAllForPlot.error"));
      return [];
    }
  }

  async findOne(id: string): Promise<FieldNote> {
    try {
      const response = await http.get(`/field-notes/${id}`);
      return response.data.data;
    } catch (error) {
      ToastService.error($t("fieldNoteApi.findOne.error"));
      return {} as FieldNote;
    }
  }

  async update(data: UpdateFieldNoteDto): Promise<FieldNote> {
    try {
      const response = await http.put("/field-notes", data);
      ToastService.success($t("fieldNoteApi.update.success"));
      return response.data.data || response.data;
    } catch (error) {
      ToastService.error($t("fieldNoteApi.update.error"));
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await http.delete(`/field-notes/${id}`);
      ToastService.success($t("fieldNoteApi.delete.success"));
    } catch (error) {
      ToastService.error($t("fieldNoteApi.delete.error"));
    }
  }
}

export default FieldNoteApi;
