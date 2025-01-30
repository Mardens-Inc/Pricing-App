import {Button, Input, ScrollShadow} from "@heroui/react";
import {useState} from "react";


interface InventoryingFormProps
{
    columns: Column[];
    onSubmit: (data: ColumnValue) => void;
}

export type ColumnValue = {
    [key: string]: string;
}

export default function InventoryingForm(props: InventoryingFormProps)
{
    const [columnValue, setColumnValue] = useState<ColumnValue>({});
    return (
        <ScrollShadow className={"min-w-[200px] w-1/3 max-w-[500px] flex flex-col gap-4 mr-6 max-h-[calc(100dvh_-_250px)] min-h-[250px] overflow-y-auto pb-4"}>
            <h1>Inventorying</h1>
            {props.columns.filter(i => !i.attributes.includes("readonly")).map((column) => (
                <>
                    <Input
                        key={column.name}
                        label={column.name}
                        placeholder={column.name}
                        type={"text"}
                        radius={"full"}
                        onValueChange={(value) => setColumnValue({...columnValue, [column.real_name]: value})}
                        value={columnValue[column.real_name] || ""}
                    />
                </>
            ))}
            <Button radius={"full"} color={"primary"} className={"w-1/2 mx-auto h-10 min-h-10"} onPress={() =>
            {
                props.onSubmit(columnValue);
                setColumnValue({});
            }}>Update</Button>
        </ScrollShadow>
    );
}