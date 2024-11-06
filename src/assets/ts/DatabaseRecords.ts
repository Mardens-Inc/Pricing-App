import {baseUrl} from "../../main.tsx";
import $ from "jquery";
import {download} from "./FileSystem.ts";

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
    department?: Department;
    percentages: string[];
    "show-retail": boolean;
    "price-column": string;
    "show-price-label": boolean;
    "retail-price-column": string;
    "show-year-dropdown": boolean;
    "show-color-dropdown": boolean;
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
    results: DatabaseResults | null;
}


export default class DatabaseRecords
{

    /**
     * Performs a search query against a database.
     *
     * @param {string} id - The identifier for the database location.
     * @param {string} query - The search query string.
     * @param {string[]} columns - Array of column names to include in the result.
     * @param {number} limit - The maximum number of results to return.
     * @param {number} offset - The offset from the start of the results.
     * @param {boolean} ascending - Whether to sort the results in ascending order.
     * @param {string} sort - The column name to sort the results by.
     * @param {AbortSignal} signal - Signal object that allows the request to be aborted.
     * @return {Promise<DatabaseResults>} A promise that resolves to the search results.
     */
    static async search(id: string, query: string, columns: string[], limit: number, offset: number, ascending: boolean, sort: string, signal: AbortSignal): Promise<DatabaseResults | null>
    {
        const body = JSON.stringify({query, columns, limit, offset, asc: ascending, sort});

        try
        {
            const response = await fetch(`${baseUrl}/api/location/${id}/search`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: body,
                signal: signal
            });

            if (!response.ok)
            {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response.json();
        } catch (error: any)
        {
            if (error.name === "AbortError")
            {
                console.log("Fetch aborted");
            } else
            {
                console.error("Fetch error:", error);
                throw error;
            }
        }
        return null;
    }

    /**
     * Fetches data for a specific location with optional headings.
     *
     * @param {string} id - The unique identifier for the location.
     * @param {boolean} headings - If true, include headings in the data.
     * @return {Promise<DatabaseData>} A promise that resolves to the location data.
     */
    static async data(id: string, headings: boolean): Promise<DatabaseData>
    {
        return $.get(`${baseUrl}/api/location/${id}/${headings ? "?headings=true" : ""}`);
    }

    static async export(id: string): Promise<void>
    {
        const csv = (await $.get({
            url: `${baseUrl}/api/location/${id}/export`,
            headers: {"Accept": "text/csv"}
        })).toString();
        const headers = await this.data(id, true);
        const name = `${headers.name}-${headers.po}-${id}.csv`;
        download(name, csv);
    }

}