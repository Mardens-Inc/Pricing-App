import {Button, Tooltip} from "@nextui-org/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";
import {fa1, faAlignJustify, faKey, faLayerGroup, faLock, faMagnifyingGlass, faPercent, faShop, faTag} from "@fortawesome/free-solid-svg-icons";
import {IconProp} from "@fortawesome/fontawesome-svg-core";

export interface ColumnAttribute
{
    key: string;
    description: string | React.ReactNode;
    icon: IconProp;
    selected: boolean;
}

interface ColumnAttributesProps
{
    value?: ColumnAttribute[];
    onChange?: (attribute: ColumnAttribute[]) => void;
}

export default function ColumnAttributes(props: ColumnAttributesProps)
{
    const attributes: ColumnAttribute[] = [
        {
            key: "primaryKey",
            description: (
                <p>Mark this item as the primary key, which will be used to uniquely identify each item.<br/><b>There can only be one primary key.</b></p>
            ),
            icon: faKey,
            selected: props.value?.some(attr => attr.key === "primaryKey" && attr.selected) ?? false
        },
        {
            key: "price",
            description: "Mark this item as a price column, which will be used to format it as currency.",
            icon: faTag,
            selected: props.value?.some(attr => attr.key === "price" && attr.selected) ?? false
        },
        {
            key: "search",
            description: "Mark this item as a search column, which will be used to search for items.",
            icon: faMagnifyingGlass,
            selected: props.value?.some(attr => attr.key === "search" && attr.selected) ?? false
        },
        {
            key: "quantity",
            description: (
                <p>Mark this item as a quantity column, which will be used to calculate the total price of an item and incrementing and decrementing inventory.<br/><b>There can only be one quantity column.</b></p>
            ),
            icon: fa1,
            selected: props.value?.some(attr => attr.key === "quantity" && attr.selected) ?? false
        },
        {
            key: "description",
            description: (
                <p>Mark this as the description column, this will be used for voice search.<br/><b>There can only be one description column.</b></p>
            ),
            icon: faAlignJustify,
            selected: props.value?.some(attr => attr.key === "description" && attr.selected) ?? false
        },
        {
            key: "department",
            description: (
                <p>Mark this as the department column, which will be used in printing.<br/><b>There can only be one department column.</b></p>
            ),
            icon: faShop,
            selected: props.value?.some(attr => attr.key === "department" && attr.selected) ?? false
        },
        {
            key: "mardensPrice",
            description: (
                <p>Mark this as the Marden's Price column.<br/><b>There can only be one Marden's Price column.</b></p>
            ),
            icon: faPercent,
            selected: props.value?.some(attr => attr.key === "mardensPrice" && attr.selected) ?? false
        },
        {
            key: "category",
            description: (
                <p>Mark this column for use in the <b>Dynamically Generate Mardens Price</b> section.<br/><b>There can only be one category column.</b></p>
            ),
            icon: faLayerGroup,
            selected: props.value?.some(attr => attr.key === "category" && attr.selected) ?? false
        },
        {
            key: "readonly",
            description: "Mark this item as readonly, which will prevent it from being edited and remove it from the addition form.",
            icon: faLock,
            selected: props.value?.some(attr => attr.key === "readonly" && attr.selected) ?? false
        }
    ];

    return (
        <div className="attributes flex flex-row gap-1">
            {attributes.map((attribute) => (
                <Tooltip content={attribute.description} closeDelay={0}>
                    <Button
                        key={attribute.key}
                        className={"w-12 h-12 min-w-0 opacity-50 hover:opacity-100 transition-all data-[selected=true]:opacity-100 data-[selected=true]:!bg-primary/30"}
                        radius={"full"}
                        variant={"light"}
                        data-selected={attribute.selected}
                        onClick={() =>
                        {
                            if (props.onChange)
                            {
                                const newAttributes = [...attributes];
                                const index = newAttributes.findIndex((a) => a.key === attribute.key);
                                newAttributes[index].selected = !newAttributes[index].selected;
                                props.onChange(newAttributes);
                            }
                        }}
                    >
                        <FontAwesomeIcon icon={attribute.icon} width={16} height={16}/>
                    </Button>
                </Tooltip>
            ))}
        </div>
    );
}