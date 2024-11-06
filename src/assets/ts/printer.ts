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