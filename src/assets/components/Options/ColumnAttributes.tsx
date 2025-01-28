import React from "react";
import {IndexedColumnItem} from "./ColumnsList.tsx";
import {Button, Tooltip} from "@heroui/react";
import {Icon} from "@iconify/react";

export interface ColumnAttribute
{
    key: string;
    description: string | React.ReactNode;
    icon: string;
    selected: boolean;
    selectionMode: "single" | "multiple";
}

interface ColumnAttributesProps
{
    selected?: string[];
    onSelectionChange?: (attribute: string[]) => void;
}

export const DefaultAttributes: ColumnAttribute[] = [
    {
        key: "primary",
        description: (
            <p>Mark this item as the primary key, which will be used to uniquely identify each item.<br/><b>There can only be one primary key.</b></p>
        ),
        icon: "mage:key-fill",
        selected: false,
        selectionMode: "single"
    },
    {
        key: "price",
        description: "Mark this item as a price column, which will be used to format it as currency.",
        icon: "mage:tag-2-fill",
        selected: false,
        selectionMode: "multiple"
    },
    {
        key: "search",
        description: "Mark this item as a search column, which will be used to search for items.",
        icon: "mage:search",
        selected: false,
        selectionMode: "multiple"
    },
    {
        key: "quantity",
        description: (
            <p>Mark this item as a quantity column, which will be used to calculate the total price of an item and incrementing and decrementing inventory.<br/><b>There can only be one quantity column.</b></p>
        ),
        icon: "iconamoon:number-1",
        selected: false,
        selectionMode: "single"
    },
    {
        key: "description",
        description: (
            <p>Mark this as the description column, this will be used for voice search.<br/><b>There can only be one description column.</b></p>
        ),
        icon: "mage:align-left",
        selected: false,
        selectionMode: "single"
    },
    {
        key: "department",
        description: (
            <p>Mark this as the department column, which will be used in printing.<br/><b>There can only be one department column.</b></p>
        ),
        icon: "mage:shop-fill",
        selected: false,
        selectionMode: "single"
    },
    {
        key: "mardensPrice",
        description: (
            <p>Mark this as the Marden's Price column.<br/><b>There can only be one Marden's Price column.</b></p>
        ),
        icon: "lsicon:percent-filled",
        selected: false,
        selectionMode: "single"
    },
    {
        key: "category",
        description: (
            <p>Mark this column for use in the <b>Dynamically Generate Mardens Price</b> section.<br/><b>There can only be one category column.</b></p>
        ),
        icon: "famicons:layers",
        selected: false,
        selectionMode: "single"
    },
    {
        key: "readonly",
        description: "Mark this item as readonly, which will prevent it from being edited and remove it from the addition form.",
        icon: "mage:lock-fill",
        selected: false,
        selectionMode: "multiple"
    }
];
export default function ColumnAttributes(props: ColumnAttributesProps)
{
    const attributes: ColumnAttribute[] = [...DefaultAttributes];
    for (const attribute of attributes)
    {
        attribute.selected = props.selected?.some(attr => attr === attribute.key) ?? attribute.selected;
    }


    return (
        <div className="attributes flex flex-row gap-1">
            {attributes.map((attribute) => (
                <Tooltip content={attribute.description} closeDelay={0} classNames={{base: "pointer-events-none"}}>
                    <Button
                        key={attribute.key}
                        className={"w-12 h-12 min-w-0 opacity-50 hover:opacity-100 transition-all data-[selected=true]:opacity-100 data-[selected=true]:!bg-primary/30"}
                        radius={"full"}
                        variant={"light"}
                        data-selected={attribute.selected}
                        onPress={() =>
                        {
                            if (props.onSelectionChange)
                            {
                                const newAttributes = [...attributes];
                                const index = newAttributes.findIndex((a) => a.key === attribute.key);
                                newAttributes[index].selected = !newAttributes[index].selected;
                                props.onSelectionChange(newAttributes.flatMap((a) => a.selected ? [a.key] : []));
                            }
                        }}
                    >
                        <Icon icon={attribute.icon} width={16} height={16}/>
                    </Button>
                </Tooltip>
            ))}
        </div>
    );
}

export function enforceAttributesSingleSelectionMode(columns: IndexedColumnItem[]): IndexedColumnItem[]
{
    for (const column of columns)
    {
        if (!column?.attributes || column.attributes.length === 0) continue;
        const attributes = column.attributes.map(i => DefaultAttributes.find(j => j.key === i)).filter(i => i);
        if (!attributes) continue;

        for (const attribute of attributes)
        {
            if (!attribute) continue;
            if (attribute.selectionMode === "single")
            {
                const otherColumns = columns.filter(i => i.id !== column.id && i.attributes.includes(attribute.key));
                for (const otherColumn of otherColumns)
                {
                    otherColumn.attributes = otherColumn.attributes.filter(i => i !== attribute.key);
                    console.log("Enforcing single selection mode: ", otherColumn);
                }

            }
        }
    }

    return columns;
}