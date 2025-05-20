import http from "@/api/http";
import { ToastService } from "@/services/toast.service";
import { Action } from "../interfaces/action";
import { ActionFormValues } from "../constants/formSchema";

/**
 * @class ActionApi
 * @description
 * Encapsulates all CRUD operations for Action entities via HTTP calls.
 * Displays toast notifications on errors and successes.
 */
export class ActionApi {
  /**
   * Fetch all actions by the plot id.
   * @returns Promise resolving to an array of Action objects.
   *          Returns an empty array on error (toast shown).
   */
  async findAllByPlot(plotId: string): Promise<Action[]> {
    try {
      // GET /actions → { data: { data: Action[] } }
      const response = await http.get(`/actions/${plotId}`);
      return response.data.data;
    } catch (error) {
      // Notify user, but do not throw so the UI can handle an empty list gracefully
      ToastService.error("Nu s-au putut încărca acțiunile.");
      return [];
    }
  }

  /**
   * Fetch a single action by its ID.
   * @param id - Unique identifier of the action
   * @returns Promise resolving to an Action object.
   *          Returns a blank Action on error (toast shown).
   */
  async findOne(id: string): Promise<Action> {
    try {
      const response = await http.get(`/actions/${id}`);
      return response.data.data;
    } catch (error) {
      ToastService.error("Nu s-a putut încărca acțiunea.");
      // Casting to Action to satisfy the return type; caller should handle missing fields
      return {} as Action;
    }
  }

  /**
   * Create a new action for a given plot.
   * @param data   - Partial form values defining the action
   * @param plotId - ID of the plot to which this action belongs
   * @returns Promise resolving to the newly created Action object.
   * @throws Propagates HTTP errors after showing a toast.
   */
  async create(
    data: Partial<ActionFormValues>,
    plotId: string
  ): Promise<Action> {
    try {
      // POST /actions/:plotId with action data
      const response = await http.post(`/actions/${plotId}`, data);
      ToastService.success("Acțiunea a fost creată cu succes.");
      return response.data.data;
    } catch (error) {
      ToastService.error("Crearea acțiunii a eșuat.");
      throw error;
    }
  }

  /**
   * Update an existing action for a given plot.
   * @param data   - Partial form values (must include the action ID)
   * @param plotId - ID of the plot that owns this action
   * @returns Promise resolving to the updated Action object.
   * @throws Propagates HTTP errors after showing a toast.
   */
  async update(
    data: Partial<ActionFormValues>,
    plotId: string
  ): Promise<Action> {
    try {
      // PUT /actions/:plotId with updated data
      const response = await http.put(`/actions/${plotId}`, data);
      ToastService.success("Acțiunea a fost actualizată cu succes.");
      return response.data.data;
    } catch (error) {
      ToastService.error("Actualizarea acțiunii a eșuat.");
      throw error;
    }
  }

  /**
   * Delete an action by its ID.
   * @param id - Unique identifier of the action to remove
   * @returns Promise resolving to void. Shows a toast on success or failure.
   */
  async delete(id: string): Promise<void> {
    try {
      // DELETE /actions/:id
      await http.delete(`/actions/${id}`);
      ToastService.success("Acțiunea a fost ștearsă cu succes.");
    } catch (error) {
      ToastService.error("Ștergerea acțiunii a eșuat.");
    }
  }
}
