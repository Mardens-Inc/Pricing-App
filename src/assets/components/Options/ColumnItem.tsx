import {useSortable} from "@dnd-kit/sortable";
import React from "react";
import {Button, cn, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from "@nextui-org/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEllipsisV} from "@fortawesome/free-solid-svg-icons";
import ColumnAttributes, {ColumnAttribute} from "./ColumnAttributes.tsx";

interface ColumnItemProps extends React.HTMLAttributes<HTMLDivElement>
{
    id: string;
    text: string;
}


export default function ColumnItem(props: ColumnItemProps)
{
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: props.id});

    const [selectedAttributes, setSelectedAttributes] = React.useState<ColumnAttribute[]>([]);


    const style = {
        transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined,
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}
             className={cn("rounded-md h-16 bg-foreground/10 backdrop-blur-lg p-4 flex flex-row items-center aria-[pressed]:z-10", props.className)}
        >
            <p className={"mr-auto"}>{props.text}</p>
            <ColumnAttributes
                value={selectedAttributes}
                onChange={setSelectedAttributes}
            />
            <div className={"flex flex-row gap-2"}>
                <Dropdown>
                    <DropdownTrigger>
                        <Button radius={"full"} className={"min-w-0 w-12 h-12"}><FontAwesomeIcon icon={faEllipsisV}/></Button>
                    </DropdownTrigger>
                    <DropdownMenu>
                        <DropdownItem>Change Display Name</DropdownItem>
                        <DropdownItem>Toggle Visibility</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
        </div>
    );
}