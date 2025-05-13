import { ColDef } from "ag-grid-enterprise";
import { LucideIcon } from "lucide-react";

export interface ColDefType<T=any> extends ColDef<T> {
    icon?: LucideIcon;
    dataType?: string;
}