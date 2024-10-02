import {Button, Tooltip} from "@nextui-org/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEllipsisV, faPlus} from "@fortawesome/free-solid-svg-icons";
import ColumnItem from "./ColumnItem.tsx";
import {useEffect, useState} from "react";
import {closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors} from "@dnd-kit/core";
import {arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy} from "@dnd-kit/sortable";

interface Item
{
    id: number;
    text: string;
}

export default function ColumnsList()
{
    const [items, setItems] = useState<Item[]>([
        {id: 1, text: "Item 1"},
        {id: 2, text: "Item 2"},
        {id: 3, text: "Item 3"}
    ]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    const handleDragEnd = (event: any) =>
    {
        const {active, over} = event;
        console.log("Drag ended: ", active, over);
        if (active && over && active.id !== over.id)
        {
            console.log("Moving item");
            setItems((items) =>
            {
                const oldIndex = items.findIndex(item => item.id === parseInt(active.id));
                const newIndex = items.findIndex(item => item.id === parseInt(over.id));
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    useEffect(() =>
    {
        console.log("Items changed", items);
    }, [items]);

    return (
        <div className={"flex flex-col"}>
            <div className={"flex flex-row items-center"}>
                <p className={"text-2xl mr-auto"}>Columns</p>
                <Tooltip content={"Add column"}>
                    <Button radius={"full"} className={"min-w-0 w-12 h-12"}><FontAwesomeIcon icon={faPlus}/></Button>
                </Tooltip>
            </div>
            <div className={"flex flex-col gap-2"}>
                <p>Drag columns around to order them or click the <FontAwesomeIcon icon={faEllipsisV}/> for more information.</p>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={items.map(item => item.id.toString())}
                        strategy={verticalListSortingStrategy}
                    >
                        {items.map(item => (
                            <ColumnItem key={item.id} id={item.id.toString()} text={item.text}/>
                        ))}
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    );
}

