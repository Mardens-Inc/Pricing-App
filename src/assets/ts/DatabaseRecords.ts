import {baseUrl} from "../../main.tsx";
import $ from "jquery";

export interface DatabaseOptions
{
    columns: Column[];
    "print-form": PrintForm;
    "voice-search": boolean;
    "mardens-price": MardensPriceOption[];
    "add-if-missing": boolean;
    "remove-if-zero": boolean;
    "allow-additions": boolean;
    "allow-inventorying": boolean;
}

export interface Column
{
    name: string;
    visible: boolean;
    real_name: string;
    attributes: string[];
}

export interface PrintForm
{
    year: string;
    label: string;
    enabled: boolean;
    department: Department;
    percentages: string[];
    "show-retail": boolean;
    "price-column": string;
    "show-price-label": boolean;
    "retail-price-column": string;
}

export interface Department
{
    id: number;
    name: string;
}

export interface MardensPriceOption
{
    column: string;
    percent: number;
}

export interface DatabaseResults
{
    total_results: number;
    max_count: number;
    page: number;
    success: boolean;
    items: any[];
}


export interface DatabaseData
{
    id: string;
    name: string;
    location: string;
    po: string;
    image: string;
    options: DatabaseOptions;
    post_date: string;
    columns: string[];
    results: DatabaseResults|null;
}


export default class DatabaseRecords
{
    static async data(id: string, headings: boolean): Promise<DatabaseData>
    {
        return $.get(`${baseUrl}/api/location/${id}/${headings ? "headings=true" : ""}`);
    }

}