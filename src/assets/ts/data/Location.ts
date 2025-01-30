import $ from "jquery";

export interface RecordOptions
{
    limit?: number;
    offset?: number;
    sort?: string;
    ascending?: boolean;
}

export interface RecordSearchOptions extends RecordOptions
{
    search?: string;
    columns?: string[];
}

export type InventoryRecord = {
    [key: string]: string;
}

export type FetchRecordResponse = {
    data: InventoryRecord[];
    total: number | null;
}


export default class Location
{
    public id: string;
    public name: string;
    public location: string;
    public po: string;
    public image: string;
    public post_date: string;


    constructor(id: string, name: string, location: string, po: string, image: string, post_date: string)
    {
        this.id = id;
        this.name = name;
        this.location = location;
        this.po = po;
        this.image = image;
        this.post_date = post_date;
    }

    static fromObj(obj: Location): Location
    {
        return new Location(obj.id, obj.name, obj.location, obj.po, obj.image, obj.post_date);
    }

    static async all(): Promise<Location[]>
    {
        try
        {
            const response: Location[] = await $.get("/api/list/");
            return response.map(Location.fromObj);
        } catch (e)
        {
            console.error("Failed to fetch locations", e);
        }
        return [];
    }

    static async get(id: string): Promise<Location | undefined>
    {
        try
        {
            const response = await $.get(`/api/list/${id}`);
            return Location.fromObj(response);
        } catch (e)
        {
            console.error("Failed to fetch location", e);
        }
        return undefined;
    }

    async delete(): Promise<boolean>
    {
        try
        {
            await $.ajax(`/api/list/${this.id}`, {
                method: "DELETE"
            });
            return true;
        } catch (e)
        {
            console.error("Failed to delete location", e);
            return false;
        }
    }

    async save(): Promise<boolean>
    {
        try
        {
            await $.ajax(`/api/list/${this.id}`, {
                method: "PATCH"
            });
            return true;
        } catch (e)
        {
            return false;
        }
    }

    async records(options: RecordOptions = {}, abortSignal?: AbortSignal): Promise<FetchRecordResponse>
    {
        const url = optionsToUrl(this.id, options).toString();

        try
        {
            const response = await fetch(url, {
                method: "GET",
                signal: abortSignal // Pass the AbortSignal here
            });

            if (!response.ok) throw new Error(`Failed to fetch records: ${response.status} - ${response.statusText}`);

            return await response.json();
        } catch (error: any)
        {
            if (error.name === "AbortError")
            {
                console.warn("Fetch request was aborted");
                return {} as FetchRecordResponse;
            }
            console.error("Failed to fetch records", error);
            throw error;
        }
    }

    async search(options: RecordSearchOptions = {}, abortSignal?: AbortSignal): Promise<FetchRecordResponse>
    {
        const url = optionsToUrl(this.id, options).toString();

        try
        {
            const response = await fetch(url, {
                method: "GET",
                signal: abortSignal // Pass the AbortSignal here
            });

            if (!response.ok) throw new Error(`Failed to fetch records: ${response.status} - ${response.statusText}`);

            return await response.json();
        } catch (error: any)
        {
            if (error.name === "AbortError")
            {
                console.warn("Fetch request was aborted");
                return {} as FetchRecordResponse;
            }
            console.error("Failed to fetch records", error);
            throw error;
        }
    }
}

function optionsToUrl(id: string, options: RecordOptions | RecordSearchOptions): URL
{
    let url: URL = new URL(`/api/inventory/${id}/`, window.location.origin);

    if ("search" in options || "columns" in options)
    {
        if (options.search != undefined)
            url.searchParams.append("query", options.search);
        if (options.columns != undefined)
            url.searchParams.append("query_columns", options.columns.join(","));
    }
    if (options.limit != undefined)
        url.searchParams.append("limit", options.limit.toString());
    if (options.offset != undefined)
        url.searchParams.append("offset", options.offset.toString());
    if (options.sort != undefined)
        url.searchParams.append("sort_by", options.sort);
    if (options.ascending != undefined)
        url.searchParams.append("sort_order", options.ascending ? "ASC" : "DESC");

    return url;
}
