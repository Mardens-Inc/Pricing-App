import {useSortable} from "@dnd-kit/sortable";
import React, {useEffect, useRef, useState} from "react";
import {Button, cn, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Tooltip} from "@nextui-org/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEllipsisV} from "@fortawesome/free-solid-svg-icons";
import ColumnAttributes, {ColumnAttribute} from "./ColumnAttributes.tsx";
import $ from "jquery";

interface ColumnItemProps extends React.HTMLAttributes<HTMLDivElement>
{
    id: string;
    text: string;
    onNameChange?: (name: string) => void;
}


export default function ColumnItem(props: ColumnItemProps)
{
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: props.id});
    const [selectedAttributes, setSelectedAttributes] = useState<ColumnAttribute[]>([]);

    const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const style = {
        transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined,
        transition
    };


    useEffect(() =>
    {
        if (isEditingDisplayName)
        {
            setTimeout(() =>
            {
                console.log("Input Ref: ", inputRef.current);
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
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}
             className={cn("rounded-md h-16 bg-foreground/10 backdrop-blur-lg p-4 flex flex-row items-center aria-[pressed]:z-10", props.className)}
        >
            {isEditingDisplayName ? (
                <Input
                    ref={inputRef}
                    value={props.text}
                    onValueChange={props.onNameChange}
                    autoFocus
                />
            ) : (<p className={"mr-auto"} onDoubleClick={() => setIsEditingDisplayName(true)}>{props.text}</p>)}
            <ColumnAttributes
                value={selectedAttributes}
                onChange={setSelectedAttributes}
            />
            <div className={"flex flex-row gap-2"}>
                <Dropdown>
                    <DropdownTrigger>
                        <div>
                            <Tooltip content={"More options"} closeDelay={0} classNames={{base: "pointer-events-none"}}>
                                <Button radius={"full"} className={"min-w-0 w-12 h-12"} onPressStart={e => e.continuePropagation()}><FontAwesomeIcon icon={faEllipsisV}/></Button>
                            </Tooltip>
                        </div>
                    </DropdownTrigger>
                    <DropdownMenu>
                        <DropdownItem onClick={() => setIsEditingDisplayName(true)}>Change Display Name</DropdownItem>
                        <DropdownItem>Toggle Visibility</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
        </div>
    );
}