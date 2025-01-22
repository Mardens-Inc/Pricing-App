import $ from "jquery";

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
        return $.get("/api/list");
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


}