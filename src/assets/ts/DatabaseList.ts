import DatabaseItem from "./DatabaseItem.ts";
import $ from "jquery";
import {baseUrl} from "../../main.tsx";

export default class DatabaseList
{
    static async get(): Promise<DatabaseItem[]>
    {
        return await $.get(`${baseUrl}/api/locations/all`) as DatabaseItem[];
    }
}