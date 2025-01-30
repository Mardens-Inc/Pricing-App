import $ from "jquery";

export interface PrintForm
{
    id?: number;
    hint?: string;
    label?: string;
    year?: number;
    department?: number;
    color?: string;
    size?: string;
    "show-retail": boolean;
    "show-price-label": boolean;
}


export interface Inventorying
{
    "add-if-missing": boolean;
    "remove-if-zero": boolean;
    "allow-additions": boolean;
}


export default class Options
{
    private databaseId?: string;
    public readonly printForm?: PrintForm[];
    public readonly inventorying?: Inventorying;
    public readonly showYearInput: boolean;
    public readonly showColorDropdown: boolean;


    constructor(printForm?: PrintForm[], inventorying?: Inventorying, showYearInput: boolean = true, showColorDropdown: boolean = true)
    {
        this.printForm = printForm;
        this.inventorying = inventorying;
        this.showYearInput = showYearInput;
        this.showColorDropdown = showColorDropdown;
    }

    static async get(databaseId: string): Promise<Options | null>
    {
        try
        {
            return Options.fromObj(databaseId, await $.get(`/api/inventory/${databaseId}/options/`));
        } catch (e)
        {
            console.error("Failed to fetch options for database", databaseId, e);
            return null;
        }
    }

    async save()
    {
        $.post(`/api/inventory/${this.databaseId}/options/`, this);
    }

    isPrintingEnabled(): boolean
    {
        return (this.printForm?.length ?? 0) > 0;
    }

    static fromObj(id: string, obj: Options): Options
    {
       let response = new Options(
            obj.printForm,
            obj.inventorying,
            obj.showYearInput,
            obj.showColorDropdown
        );
        response.databaseId = id;
        return response;
    }


}