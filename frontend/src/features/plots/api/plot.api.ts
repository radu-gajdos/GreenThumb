import http from "@/api/http";
import { ToastService } from "@/services/toast.service";
import { Plot } from "../interfaces/plot";

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
      // GET /plots → { data: { data: Plot[] } }
      const response = await http.get("/plots");
      return response.data.data;
    } catch (error) {
      // Notify user of failure, but don't throw so UI can handle an empty list gracefully
      ToastService.error("Nu s-au putut încărca terenurile.");
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
      ToastService.error("Nu s-a putut încărca terenul.");
      // Casting to Plot to satisfy return type; caller should handle missing fields
      return {} as Plot;
    }
  }

  /**
   * Create a new plot.
   * @param data - Partial plot data (e.g. name, boundary, etc.)
   * @returns Promise resolving to the newly created Plot object.
   * @throws Propagates HTTP errors for upstream handling after showing toast.
   */
  async create(data: Partial<Plot>): Promise<Plot> {
    try {
      const response = await http.post("/plots", data);
      ToastService.success("Terenul a fost creat.");
      return response.data.data;
    } catch (error) {
      ToastService.error("Crearea terenului a eșuat.");
      throw error;
    }
  }

  /**
   * Update an existing plot.
   * @param data - Partial plot object including an ID
   * @returns Promise resolving to the updated Plot object.
   * @throws Propagates HTTP errors after showing toast.
   */
  async update(data: Partial<Plot>): Promise<Plot> {
    try {
      // Note: endpoint expects PUT /plots with full or partial payload
      const response = await http.put(`/plots`, data);
      ToastService.success("Terenul a fost actualizat.");
      return response.data.data;
    } catch (error) {
      ToastService.error("Actualizarea terenului a eșuat.");
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
      ToastService.success("Terenul a fost șters.");
    } catch (error) {
      ToastService.error("Ștergerea terenului a eșuat.");
    }
  }
}
