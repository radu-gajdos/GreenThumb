/**
 * @module FormContent
 * Renders a plot‐editing form, auto‐calculates area in hectares as the user draws a polygon,
 * and validates inputs via Zod + React Hook Form.
 */

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
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
import { PlotFormType, formSchema } from "../constants/formSchema";
import MapInput from "./MapInput";
import { polygon } from "@turf/helpers";
import area from "@turf/area";

interface FormContentProps {
    /**
     * Called when the user submits valid data.
     * @param data - The plot form data, including id, name, size, boundary, etc.
     */
    onSubmit: (data: PlotFormType) => void;
    /** Unique HTML `id` for the <form> element */
    formId: string;
    /** Pre-populate the form when editing an existing plot */
    initialData?: PlotFormType | null;
}

/**
 * Ensures a GeoJSON ring is closed by repeating the first coordinate at the end if needed.
 * @param ring - Array of [lng, lat] pairs
 * @returns A ring guaranteed to have identical first and last point
 */
function closeRing(ring: number[][]): number[][] {
    const [firstLng, firstLat] = ring[0];
    const [lastLng, lastLat] = ring[ring.length - 1];

    // If the ring isn't already closed, append the first coordinate again
    if (firstLng !== lastLng || firstLat !== lastLat) {
        return [...ring, [firstLng, firstLat]];
    }

    return ring;
}

const FormContent: React.FC<FormContentProps> = ({
    onSubmit,
    formId,
    initialData,
}) => {
    const { t } = useTranslation();

    // Initialize RHF with Zod schema and optional default values
    const form = useForm<PlotFormType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: initialData?.id || "",
            name: initialData?.name || "",
            size: initialData?.size || 0,
            boundary: initialData?.boundary || { type: "Polygon", coordinates: [] },
            topography: initialData?.topography || "",
            soilType: initialData?.soilType || "",
        },
    });

    // When initialData changes (i.e. editing an existing plot), reset the form
    useEffect(() => {
        if (initialData) {
            form.reset({
                id: initialData.id,
                name: initialData.name,
                size: initialData.size,
                boundary: initialData.boundary,
                topography: initialData.topography || "",
                soilType: initialData.soilType || "",
            });
        }
    }, [initialData, form]);

    // Watch plot boundary so we can auto-recalculate area
    const boundary = form.watch("boundary");
    useEffect(() => {
        // Only run if there's at least one ring drawn
        if (boundary?.coordinates?.[0]?.length) {
            const rawRing = boundary.coordinates[0];

            // Ensure the polygon ring is closed before computing area
            const closedRing = closeRing(rawRing);

            // Create a Turf polygon and compute area in square meters
            const turfPoly = polygon([closedRing]);
            const sqm = area(turfPoly);

            // Convert to hectares (1 ha = 10,000 m²) and round to 2 decimals
            const ha = parseFloat((sqm / 10000).toFixed(2));

            // Update the size field in the form (marks it dirty + validates)
            form.setValue("size", ha, {
                shouldDirty: true,
                shouldTouch: false,
                shouldValidate: true,
            });
        }
    }, [boundary, form]);

    /** Handler for when the PlotEditor component emits a new boundary */
    const handleBoundaryChange = (b: PlotFormType["boundary"]) => {
        form.setValue("boundary", b, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
    };

    return (
        <Form {...form}>
            <form
                id={formId}
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 px-1"
            >
                {/* Plot name input */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('plotForm.fields.name')}</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder={t('plotForm.placeholders.name')} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Auto-calculated size (ha) */}
                <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('plotForm.fields.area')}</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    {...field}
                                    // Ensure the value is stored as a number
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Free-text topography notes */}
                <FormField
                    control={form.control}
                    name="topography"
                    render={({ field }) => (
                        <FormItem className="col-span-1">
                            <FormLabel>{t('plotForm.fields.topography')}</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    value={field.value || ""}
                                    placeholder={t('plotForm.placeholders.topography')}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Free-text soil type */}
                <FormField
                    control={form.control}
                    name="soilType"
                    render={({ field }) => (
                        <FormItem className="col-span-1">
                            <FormLabel>{t('plotForm.fields.soilType')}</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    value={field.value || ""}
                                    placeholder={t('plotForm.placeholders.soilType')}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Polygon drawing widget */}
                <FormField
                    control={form.control}
                    name="boundary"
                    render={({ field }) => (
                        <FormItem className="md:col-span-4">
                            <FormLabel>{t('plotForm.fields.boundary')}</FormLabel>
                            <MapInput value={field.value} onChange={handleBoundaryChange} />
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
};

export default FormContent;