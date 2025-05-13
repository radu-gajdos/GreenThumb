// src/api/PlotApi.ts
import http from "../../../api/http";
import { ToastService } from "../../../services/toast.service";
import { Plot } from "../interfaces/Plot"; // define a Plot interface matching your DTOs

export default class PlotApi {
    /**
     * Fetch all plots
     */
    public async fetchAll(
        callback: (plots: Plot[]) => void
    ): Promise<void> {
        try {
            const response = await http.get("/plots");
            callback(response.data.data);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Fetch single plot by id
     */
    public async fetchById(
        id: number,
        callback: (plot: Plot) => void
    ): Promise<void> {
        try {
            const response = await http.get<Plot>(`/plots/${id}`);
            callback(response.data);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Create a new plot
     */
    public async create(
        payload: Partial<Plot>,
        callback: (plot: Plot) => void
    ): Promise<void> {
        try {
            const response = await http.post<Plot>("/plots", payload);
            callback(response.data);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Update an existing plot
     */
    public async update(
        id: number,
        payload: Partial<Plot>,
        callback: (plot: Plot) => void
    ): Promise<void> {
        try {
            const response = await http.put<Plot>("/plots", { id, ...payload });
            callback(response.data);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Delete a plot
     */
    public async remove(
        id: number,
        callback: () => void
    ): Promise<void> {
        try {
            await http.delete(`/plots/${id}`);
            callback();
        } catch (error: any) {
            this.handleError(error);
        }
    }

    private handleError(error: any) {
        if (error?.response?.data?.message) {
            ToastService.error(error.response.data.message);
        } else {
            ToastService.error(error.message);
        }
    }
}