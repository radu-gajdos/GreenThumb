import http from "@/api/http";
import { ToastService } from "@/services/toast.service";
import { Action } from "../interfaces/action";
import { ActionFormValues } from "../constants/formSchema";
import { $t } from "@/i18n";

/**
 * @class ActionApi
 * @description
 * Encapsulates all CRUD operations for Action entities via HTTP calls.
 * Uses a shared HTTP client and displays toast notifications on errors/success.
 */
export class ActionApi {
  /**
   * Create a new action for a plot.
   * @param formData - Action form data
   * @param plotId - Unique identifier of the plot
   * @returns Promise resolving to the newly created Action object.
   */
  async create(formData: ActionFormValues, plotId: string): Promise<Action> {
    try {
      const actionData = {
        ...formData,
        date: formData.date instanceof Date ? formData.date.toISOString() : formData.date,
      };

      const response = await http.post(`/actions/${plotId}`, actionData);
      ToastService.success($t("actionApi.create.success"));
      return response.data.data || response.data;
    } catch (error) {
      ToastService.error($t("actionApi.create.error"));
      throw error;
    }
  }

  /**
   * Update an existing action.
   * @param formData - Action form data including ID
   * @returns Promise resolving to the updated Action object.
   */
  async update(formData: ActionFormValues & { id: string }): Promise<Action> {
    try {
      const actionData = {
        ...formData,
        date: formData.date instanceof Date ? formData.date.toISOString() : formData.date,
      };

      const response = await http.put(`/actions/${formData.id}`, actionData);
      ToastService.success($t("actionApi.update.success"));
      return response.data.data || response.data;
    } catch (error) {
      ToastService.error($t("actionApi.update.error"));
      throw error;
    }
  }

  /**
   * Update action status.
   * @param actionId - Unique identifier of the action
   * @param status - New status for the action
   * @returns Promise resolving to the updated Action object.
   */
  async updateStatus(actionId: string, status: 'planned' | 'in_progress' | 'completed' | 'cancelled'): Promise<Action> {
    try {
      const response = await http.patch(`/actions/${actionId}/status`, { status });
      ToastService.success($t("actionApi.updateStatus.success"));
      return response.data.data || response.data;
    } catch (error) {
      ToastService.error($t("actionApi.updateStatus.error"));
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
      return response.data.data || response.data;
    } catch (error) {
      ToastService.error($t("actionApi.findOne.error"));
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
      return response.data.data || response.data;
    } catch (error) {
      ToastService.error($t("actionApi.findAll.error"));
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
      return response.data.data || response.data;
    } catch (error) {
      ToastService.error($t("actionApi.findByPlot.error"));
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
      return response.data.data || response.data;
    } catch (error) {
      ToastService.error($t("actionApi.getByDateRange.error"));
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
      return response.data.data || response.data;
    } catch (error) {
      ToastService.error($t("actionApi.getOverdue.error"));
      return [];
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
      ToastService.success($t("actionApi.delete.success"));
    } catch (error) {
      ToastService.error($t("actionApi.delete.error"));
      throw error;
    }
  }
}
