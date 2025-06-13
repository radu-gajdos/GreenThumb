import http from "@/api/http";
import { ToastService } from "@/services/toast.service";
import { Action } from "../interfaces/action";

/**
 * @class ActionApi
 * @description
 * Encapsulates all CRUD operations for Action entities via HTTP calls.
 * Uses a shared HTTP client and displays toast notifications on errors/success.
 */
export class ActionApi {
  /**
   * Update action status.
   * @param actionId - Unique identifier of the action
   * @param status - New status for the action
   * @returns Promise resolving to the updated Action object.
   */
  async updateStatus(actionId: string, status: 'planned' | 'in_progress' | 'completed' | 'cancelled'): Promise<Action> {
    try {
      const response = await http.patch(`/actions/${actionId}/status`, { status });
      ToastService.success("Statusul acțiunii a fost actualizat.");
      return response.data.data;
    } catch (error) {
      ToastService.error("Actualizarea statusului a eșuat.");
      throw error;
    }
  }

  /**
   * Fetch a single action by its ID.
   * @param actionId - Unique identifier of the action
   * @returns Promise resolving to an Action object.
   */
  async findOne(actionId: string): Promise<Action> {
    try {
      const response = await http.get(`/actions/${actionId}`);
      return response.data.data;
    } catch (error) {
      ToastService.error("Nu s-a putut încărca acțiunea.");
      throw error;
    }
  }

  /**
   * Fetch all actions.
   * @returns Promise resolving to an array of Action objects.
   */
  async findAll(): Promise<Action[]> {
    try {
      const response = await http.get("/actions");
      return response.data.data;
    } catch (error) {
      ToastService.error("Nu s-au putut încărca acțiunile.");
      return [];
    }
  }

  /**
   * Fetch actions for a specific plot.
   * @param plotId - Unique identifier of the plot
   * @returns Promise resolving to an array of Action objects.
   */
  async findByPlot(plotId: string): Promise<Action[]> {
    try {
      const response = await http.get(`/actions/plot/${plotId}`);
      return response.data.data;
    } catch (error) {
      ToastService.error("Nu s-au putut încărca acțiunile pentru teren.");
      return [];
    }
  }

  /**
   * Fetch actions by date range.
   * @param startDate - Start date for the range
   * @param endDate - End date for the range
   * @returns Promise resolving to an array of Action objects.
   */
  async getActionsByDateRange(startDate: Date, endDate: Date): Promise<Action[]> {
    try {
      const params = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };
      const response = await http.get("/actions", { params });
      return response.data.data;
    } catch (error) {
      ToastService.error("Nu s-au putut încărca acțiunile pentru perioada selectată.");
      return [];
    }
  }

  /**
   * Fetch overdue actions.
   * @returns Promise resolving to an array of overdue Action objects.
   */
  async getOverdueActions(): Promise<Action[]> {
    try {
      const response = await http.get("/actions/overdue");
      return response.data.data;
    } catch (error) {
      ToastService.error("Nu s-au putut încărca acțiunile întârziate.");
      return [];
    }
  }

  /**
   * Create a new action for a plot.
   * @param plotId - Unique identifier of the plot
   * @param actionData - Partial action data
   * @returns Promise resolving to the newly created Action object.
   */
  async create(plotId: string, actionData: Partial<Action>): Promise<Action> {
    try {
      delete actionData.id; // Ensure no ID is sent for creation
      const response = await http.post(`/actions/${plotId}`, actionData);
      ToastService.success("Acțiunea a fost creată.");
      return response.data.data;
    } catch (error) {
      ToastService.error("Crearea acțiunii a eșuat.");
      throw error;
    }
  }

  /**
   * Update an existing action.
   * @param actionId - Unique identifier of the action
   * @param actionData - Partial action data to update
   * @returns Promise resolving to the updated Action object.
   */
  async update(actionId: string, actionData: Partial<Action>): Promise<Action> {
    try {
      const response = await http.put(`/actions/${actionId}`, actionData);
      ToastService.success("Acțiunea a fost actualizată.");
      return response.data.data;
    } catch (error) {
      ToastService.error("Actualizarea acțiunii a eșuat.");
      throw error;
    }
  }

  /**
   * Delete an action by its ID.
   * @param actionId - Unique identifier of the action to remove
   * @returns Promise resolving to void.
   */
  async delete(actionId: string): Promise<void> {
    try {
      await http.delete(`/actions/${actionId}`);
      ToastService.success("Acțiunea a fost ștearsă.");
    } catch (error) {
      ToastService.error("Ștergerea acțiunii a eșuat.");
      throw error;
    }
  }
}