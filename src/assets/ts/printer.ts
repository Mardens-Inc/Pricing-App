import {RowValue} from "../components/View/InventoryTable.tsx";
import {PrintForm} from "./data/Options.ts";

export interface PrintLabelSize
{
    width: number;
    height: number;
    name: string;
}

interface Department
{
    id: number;
    name: string;
}

export const Departments: Department[] = [
    {id: -1, name: "Use Department Column"},
    {id: 0, name: "No Dept."},
    {id: 1, name: "General"},
    {id: 2, name: "Clothing"},
    {id: 3, name: "Furniture"},
    {id: 4, name: "Grocery Taxable"},
    {id: 5, name: "Shoes"},
    {id: 6, name: "Fabric"},
    {id: 7, name: "Flooring/Carpet"},
    {id: 8, name: "Hardware"},
    {id: 9, name: "Special Sales"},
    {id: 14, name: "Grocery Non-Taxable"}
];
export const PrintLabels = [
    "Catalog Site Price",
    "Internet Site Price",
    "Office Store",
    "Big Box Price",
    "Drug Store Price",
    "Book Store Price",
    "Holiday Stock",
    "Supply Store Price",
    "Rug Store Price",
    "Garden Center Price",
    "Club Price",
    "Gift Shop Price",
    "Sporting Goods Store"
];
export const PrintLabelColors = [
    "No Color",
    "Peach",
    "Rose",
    "Light Purple",
    "Purple",
    "Dark Purple",
    "Light Blue",
    "Blue",
    "Dark Blue",
    "Aqua",
    "Brown",
    "Dark Brown", "Mint",
    "Green",
    "Dark Green",
    "Yellow",
    "Dark Yellow",
    "Light Pink",
    "Pink",
    "Dark Gray",
    "Teal",
    "Gray"
];

export const PrintLabelSize: PrintLabelSize[] = [
    {width: 1, height: 0.75, name: "Colored"},
    {width: 0.8, height: 0.5, name: "Orange"},
    {width: 1.25, height: 1, name: "Large"}
];

export function OpenPrintWindow(databaseId: string, values: RowValue[], printOptions: PrintForm)
{
    const uri: URL = new URL("https://pricetagger.mardens.com/api/");

    let price = values.find(v => v.attributes.includes("price"));
    if (price) uri.searchParams.append("price", price.value.replace(/[^0-9.]/g, ""));

    let mp = values.find(v => v.attributes.includes("mp"));
    if (mp && mp.value) uri.searchParams.append("mp", mp.value.replace(/[^0-9.]/g, ""));
    if (printOptions.label) uri.searchParams.append("label", printOptions.label);
    if (printOptions.year) uri.searchParams.append("year", printOptions.year.toString());
    if (printOptions.showPriceLabel) uri.searchParams.append("showPriceLabel", "");


    const databasePrintYear = localStorage.getItem(`print-year-${databaseId}`);
    const databasePrintColor = localStorage.getItem(`print-color-${databaseId}`);
    const databaseDepartment = localStorage.getItem(`print-department-${databaseId}`);
    if (databasePrintYear) uri.searchParams.append("year", databasePrintYear);
    if (databasePrintColor) uri.searchParams.append("color", databasePrintColor);

    // Departments
    if (databaseDepartment) uri.searchParams.append("department", databaseDepartment);
    else if (printOptions.department !== undefined && printOptions.department > 0) uri.searchParams.append("department", printOptions.department.toString());
    else
    {
        const department = values.find(i => i.attributes.includes("department"));
        if (department) uri.searchParams.append("department", department.value);
    }


    uri.searchParams.append("v", Date.now().toString()); // Add a version to prevent caching

    window.open(uri.toString(), "_blank", "toolbar=no,scrollbars=no,resizable=no,width=1020,height=667");
}