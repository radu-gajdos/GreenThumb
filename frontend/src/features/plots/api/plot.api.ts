import http from "@/api/http";
import { ToastService } from "@/services/toast.service";
import { IAction, IFertilizing, IHarvesting, IPlanting, ISoilReading, ITreatment, IWatering, Plot } from "../interfaces/plot";
import { $t } from "@/i18n";

/**
 * @class PlotApi
 * @description
 * Encapsulates all CRUD operations for Plot entities via HTTP calls.
 * Uses a shared HTTP client and displays toast notifications on errors/success.
 */
export class PlotApi {
  /**
   * Fetch all plots.
   * @returns Promise resolving to an array of Plot objects. Returns an empty array on error.
   */
  async findAll(): Promise<Plot[]> {
    try {
      const response = await http.get("/plots");
      return response.data.data;
    } catch (error) {
      ToastService.error($t("plotApi.findAll.error"));
      return [];
    }
  }

  /**
   * Fetch a single plot by its ID.
   * @param id - Unique identifier of the plot
   * @returns Promise resolving to a Plot object. Returns a blank Plot object on error.
   */
  async findOne(id: string): Promise<Plot> {
    try {
      const response = await http.get(`/plots/${id}`);
      return response.data.data;
    } catch (error) {
      ToastService.error($t("plotApi.findOne.error"));
      return {} as Plot;
    }
  }

  /**
   * Create a new plot.
   * @param data - Partial plot data
   * @returns Promise resolving to the newly created Plot object.
   */
  async create(data: Partial<Plot>): Promise<Plot> {
    try {
      delete data.id;
      const response = await http.post("/plots", data);
      ToastService.success($t("plotApi.create.success"));
      return response.data.data;
    } catch (error) {
      ToastService.error($t("plotApi.create.error"));
      throw error;
    }
  }

  /**
   * Update an existing plot.
   * @param data - Partial plot object including an ID
   * @returns Promise resolving to the updated Plot object.
   */
  async update(data: Partial<Plot>): Promise<Plot> {
    try {
      const response = await http.put(`/plots`, data);
      ToastService.success($t("plotApi.update.success"));
      return response.data.data;
    } catch (error) {
      ToastService.error($t("plotApi.update.error"));
      throw error;
    }
  }

  /**
   * Delete a plot by its ID.
   * @param id - Unique identifier of the plot to remove
   * @returns Promise resolving to void.
   */
  async delete(id: string): Promise<void> {
    try {
      await http.delete(`/plots/${id}`);
      ToastService.success($t("plotApi.delete.success"));
    } catch (error) {
      ToastService.error($t("plotApi.delete.error"));
    }
  }
}

export const castAction = (action: IAction): IAction => {
  switch (action.type) {
    case 'planting':
      return action as IPlanting;
    case 'harvesting':
      return action as IHarvesting;
    case 'fertilizing':
      return action as IFertilizing;
    case 'treatment':
      return action as ITreatment;
    case 'watering':
      return action as IWatering;
    case 'soil_reading':
      return action as ISoilReading;
    default:
      return action;
  }
};
