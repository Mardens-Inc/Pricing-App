import $ from "jquery";

export default class Icon
{
    public readonly name: string;
    public readonly url: string;

    private constructor(name: string, url: string)
    {
        this.name = name;
        this.url = url;
    }

    public static async all(): Promise<Icon[]>
    {
        return $.get("/api/icons");
    }


    public static async get(name: string, icons?: Icon[]): Promise<Icon | undefined>
    {
        return (icons ?? await this.all()).find(icon => icon.name === name);
    }

}