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

    static async all(): Promise<Location[]>
    {
        return $.get("/api/list/");
    }

    static async get(id: string): Promise<Location | undefined>
    {
        return $.get(`/api/list/${id}`);
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

    async records(options: RecordOptions = {}): Promise<InventoryRecord[]>
    {
        return $.get(optionsToUrl(this.id, options).toString());
    }

    async search(options: RecordSearchOptions = {}): Promise<InventoryRecord[]>
    {
        return $.get(optionsToUrl(this.id, options).toString());
    }
}

function optionsToUrl(id: string, options: RecordOptions | RecordSearchOptions): URL
{
    let url: URL = new URL(`/api/list/${id}`);

    if ("search" in options || "columns" in options)
    {
        if (options.search)
            url.searchParams.append("search", options.search);
        if (options.columns)
            url.searchParams.append("query_columns", options.columns.join(","));
    }
    if (options.limit)
        url.searchParams.append("limit", options.limit.toString());
    if (options.offset)
        url.searchParams.append("offset", options.offset.toString());
    if (options.sort)
        url.searchParams.append("sort_by", options.sort);
    if (options.ascending)
        url.searchParams.append("sort_order", options.ascending ? "ASC" : "DESC");

    return url;
}
