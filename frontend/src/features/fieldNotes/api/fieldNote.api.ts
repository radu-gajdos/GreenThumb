import http from "@/api/http";
import { ToastService } from "@/services/toast.service";

/**
 * Represents a single field note stored in the backend.
 * 
 * Matches the backend’s FieldNote entity:
 *  - id: UUID string
 *  - title: Short summary of the note
 *  - message: Detailed observations
 *  - plotId: The plot this note belongs to
 *  - createdAt / updatedAt: Timestamps
 */
export interface FieldNote {
  id: string;
  title: string;
  message: string;
  plotId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for creating new field notes.
 * Must include:
 *  - title and message text
 *  - plotId of the associated plot
 */
export interface CreateFieldNoteDto {
  title: string;
  message: string;
  plotId: string;
}

/**
 * DTO for updating an existing field note.
 *  - id is required to identify which note to update
 *  - title/message are optional—only send fields you want to change
 */
export interface UpdateFieldNoteDto {
  id: string;
  title?: string;
  message?: string;
}

/**
 * @class FieldNoteApi
 * @description
 * Provides methods to create, read, update, and delete field notes via HTTP.
 * Uses a shared HTTP client (Axios) and shows toast notifications on errors/success.
 * Think of this as a “digital notebook” manager for storing plot observations.
 */
export class FieldNoteApi {
  /**
   * Create a new field note.
   * @param data - Payload containing title, message, and plotId
   * @returns The newly created FieldNote
   * @throws Re-throws any HTTP errors after showing a toast
   */
  async create(data: CreateFieldNoteDto): Promise<FieldNote> {
    try {
      const response = await http.post("/field-notes", data);
      ToastService.success("Notița a fost salvată cu succes.");
      return response.data.data;
    } catch (error) {
      ToastService.error("Nu s-a putut salva notița.");
      throw error;
    }
  }

  /**
   * Fetch all field notes for the authenticated user.
   * @returns An array of FieldNote objects (empty array on error)
   */
  async findAll(): Promise<FieldNote[]> {
    try {
      const response = await http.get("/field-notes");
      // If backend returns no data, default to empty array
      return response.data.data || [];
    } catch (error) {
      ToastService.error("Nu s-au putut încărca notițele.");
      return [];
    }
  }

  /**
   * Fetch all field notes for a specific plot.
   * @param plotId - The plot’s unique identifier
   * @returns An array of FieldNote (empty array on error)
   */
  async findAllForPlot(plotId: string): Promise<FieldNote[]> {
    try {
      const response = await http.get(`/field-notes/plot/${plotId}`);
      return response.data.data || [];
    } catch (error) {
      ToastService.error("Nu s-au putut încărca notițele pentru această parcelă.");
      return [];
    }
  }

  /**
   * Fetch a single field note by its ID.
   * @param id - FieldNote’s unique identifier
   * @returns The requested FieldNote (or a blank object on error)
   */
  async findOne(id: string): Promise<FieldNote> {
    try {
      const response = await http.get(`/field-notes/${id}`);
      return response.data.data;
    } catch (error) {
      ToastService.error("Nu s-a putut încărca notița.");
      // Return an empty object cast to FieldNote to satisfy the signature
      return {} as FieldNote;
    }
  }

  /**
   * Update an existing field note.
   * 
   * Note: The backend sometimes nests the updated entity under `data.data`,
   * but may also return it directly under `data`. We handle both cases.
   * 
   * @param data - Partial note object with an `id` and updated fields
   * @returns The updated FieldNote object
   * @throws Re-throws any HTTP errors after showing a toast
   */
  async update(data: UpdateFieldNoteDto): Promise<FieldNote> {
    try {
      const response = await http.put("/field-notes", data);

      // Debugging: log raw response to inspect nested structure
      console.log("Update API raw response:", response);

      ToastService.success("Notița a fost actualizată.");

      // If response.data.data exists, return that; otherwise return response.data
      return response.data.data || response.data;
    } catch (error) {
      ToastService.error("Actualizarea notiței a eșuat.");
      throw error;
    }
  }

  /**
   * Delete a field note by its ID.
   * @param id - Unique identifier of the FieldNote to remove
   * @returns void
   */
  async delete(id: string): Promise<void> {
    try {
      await http.delete(`/field-notes/${id}`);
      ToastService.success("Notița a fost ștearsă.");
    } catch (error) {
      ToastService.error("Ștergerea notiței a eșuat.");
    }
  }
}

export default FieldNoteApi;
