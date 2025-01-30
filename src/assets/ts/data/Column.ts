import $ from "jquery";
import {snakeToCamel} from "../object-utilities.ts";

export default class Column
{
    public name: string;
    public displayName: string;
    public visible: boolean;
    public attributes: string[];


    constructor(name: string, displayName: string, visible: boolean, attributes: string[])
    {
        this.name = name;
        this.displayName = displayName;
        this.visible = visible;
        this.attributes = attributes;
    }

    public static async all(databaseId: string): Promise<Column[]>
    {
        const col = JSON.parse(snakeToCamel(JSON.stringify(await $.get(`/api/inventory/${databaseId}/columns/`))));
        console.log("Fetched columns", col);
        return col;
    }

}