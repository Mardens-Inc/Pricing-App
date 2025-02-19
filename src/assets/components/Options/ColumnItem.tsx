import {useSortable} from "@dnd-kit/sortable";
import React, {useEffect, useRef, useState} from "react";
import ColumnAttributes from "./ColumnAttributes.tsx";
import $ from "jquery";
import {IndexedColumnItem} from "./ColumnsList.tsx";
import {Button, cn, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Tooltip} from "@heroui/react";
import {Icon} from "@iconify/react";

interface ColumnItemProps extends React.HTMLAttributes<HTMLDivElement>
{
    id: string;
    column: IndexedColumnItem;
    onColumnChange?: (column: IndexedColumnItem) => void;
}


export default function ColumnItem(props: ColumnItemProps)
{
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: props.id});
    const [column, setColumn] = useState<IndexedColumnItem>(props.column);


    const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const style = {
        transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined,
        transition
    };

    useEffect(() =>
    {
        if (props.onColumnChange) props.onColumnChange(column);
    }, [column]);


    useEffect(() =>
    {
        if (isEditingDisplayName)
        {
            setTimeout(() =>
            {
                if (inputRef.current)
                {
                    $(inputRef.current)
                        .trigger("focus")
                        .on("blur", () => setIsEditingDisplayName(false));
                }
            }, 200);
        }
    }, [isEditingDisplayName]);

    return (
        <div
            ref={setNodeRef} style={style}
            {...attributes}
            {...listeners}
             className={cn(
                 "rounded-md h-16 bg-foreground/10 backdrop-blur-lg p-4 flex flex-row items-center aria-[pressed]:z-10",
                 "data-[visible=false]:!opacity-25",
                 props.className
             )}
            data-visible={column.visible}
        >
            {isEditingDisplayName ? (
                <Input
                    ref={inputRef}
                    value={props.column.name}
                    onValueChange={value => setColumn({...column, name: value})}
                    autoFocus
                />
            ) : (<p className={"mr-auto"} onDoubleClick={() => setIsEditingDisplayName(true)}>{props.column.name}</p>)}
            <ColumnAttributes
                selected={props.column.attributes}
                onSelectionChange={attributes => setColumn({...column, attributes})}
            />
            <div className={"flex flex-row gap-2"}>
                <Dropdown>
                    <DropdownTrigger>
                        <div>
                            <Tooltip content={"More options"} closeDelay={0} classNames={{base: "pointer-events-none"}}>
                                <Button radius={"full"} className={"min-w-0 w-12 h-12"} onPressStart={e => e.continuePropagation()}><Icon icon="mage:dots"/></Button>
                            </Tooltip>
                        </div>
                    </DropdownTrigger>
                    <DropdownMenu>
                        <DropdownItem key={"change-display-name-dropdown-item"} onPress={() => setIsEditingDisplayName(true)}>Change Display Name</DropdownItem>
                        <DropdownItem key={"toggle-visibility-dropdown-item"}>Toggle Visibility</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
        </div>
    );
}