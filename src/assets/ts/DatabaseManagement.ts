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
    "show-retail": boolean;
    "price-column": string;
    "show-price-label": boolean;
    "retail-price-column": string;
}

export interface Options
{
    columns: Column[];
    "print-form": PrintForm;
    "voice-search": boolean;
    "mardens-price": any[];
    "add-if-missing": boolean;
    "remove-if-zero": boolean;
    "allow-additions": boolean;
    "allow-inventorying": boolean;
}

export interface DatabaseItem
{
    id: string;
    name: string;
    location: string;
    po: string;
    image: string;
    post_date: string;
}
