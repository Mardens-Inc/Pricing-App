import {DatabaseItem} from "./DatabaseManagement.ts";
import $ from "jquery";
import Icon from "./icons.ts";

export default class DatabaseList
{
    static async get(): Promise<DatabaseItem[]>
    {
        let items = await $.get(`/api/list`) as DatabaseItem[];
        const icons = await Icon.all();

        for (const item of items)
        {
            item.image = (await Icon.get(item.image, icons))?.url ?? "";
        }

        return items;
    }
}