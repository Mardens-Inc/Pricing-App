import {Button, cn, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@heroui/react";
import Location, {InventoryRecord} from "../../ts/data/Location.ts";
import {useDatabaseView} from "../../providers/DatabaseViewProvider.tsx";
import {useEffect, useState} from "react";
import {useToast} from "../../providers/ToastProvider.tsx";
import Column from "../../ts/data/Column.ts";
import ExtendedSwitch from "../Extends/ExtendedSwitch.tsx";

type NewRecordProperties = {
    isOpen: boolean;
    onClose: (record: InventoryRecord | undefined) => void;
    editRecord?: InventoryRecord;
};

export default function NewRecordModal(props: NewRecordProperties)
{
    const {databaseId} = useDatabaseView();
    const [inventory, setInventory] = useState<InventoryRecord | undefined>(props.editRecord ?? {} as InventoryRecord);
    const [columns, setColumns] = useState<Column[]>([]);
    const [showInvisible, setShowInvisible] = useState(false);
    const {toast} = useToast();

    useEffect(() =>
    {
        if (!props.isOpen || !databaseId) return;
        Location.get(databaseId).then(db =>
        {
            if (!db)
            {
                props.onClose(inventory);
                console.error("Database not found");
                toast({
                    title: "Database not found",
                    description: "Please create a database first",
                    type: "error"
                });
                return;
            }
            Column.all(databaseId).then(columns => setColumns(columns));
        });
        setInventory(props.editRecord ?? {} as InventoryRecord);
    }, [props.editRecord, props.isOpen]);


    return (
        <Modal isOpen={props.isOpen} onClose={() => props.onClose(inventory)} scrollBehavior={"inside"}>
            <ModalContent>
                {onClose => (
                    <>
                        <ModalHeader>{!!props.editRecord ? "Edit Record" : "New Record"}</ModalHeader>
                        <ModalBody>
                            {columns.filter(i => !i.attributes.includes("readonly")).map(column => (
                                column.visible ? (
                                    <Input
                                        key={column.displayName}
                                        label={<>{column.displayName} <span className={"opacity-50 italic"}>({column.name})</span></>}
                                        placeholder={`Enter ${column.displayName}`}
                                        radius={"full"}
                                        defaultValue={props.editRecord?.[column.name]}
                                    />
                                ) : null
                            ))}
                            {columns.some(i => !i.visible && !i.attributes.includes("readonly")) && (
                                <>
                                    <ExtendedSwitch
                                        isSelected={showInvisible}
                                        onValueChange={setShowInvisible}
                                        label={"Show Additional Fields"}
                                        description={"Show fields that are not visible in the table"}
                                    />
                                    <div
                                        className={cn(
                                            "flex flex-col gap-2 bg-background rounded-lg max-h-0 overflow-y-hidden transition-all",
                                            "data-[show=true]:overflow-y-scroll data-[show=true]:max-h-[50dvh] data-[show=true]:min-h-[200px] data-[show=true]:p-2"
                                        )}
                                        data-show={showInvisible}
                                    >
                                        {columns.filter(i => !i.visible && !i.attributes.includes("readonly")).map(column => (
                                            <Input
                                                key={column.displayName}
                                                label={<>{column.displayName} <span className={"opacity-50 italic"}>({column.name})</span></>}
                                                placeholder={`Enter ${column.displayName}`}
                                                radius={"full"}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                color={"primary"}
                                onPress={onClose}
                                radius={"full"}
                            >
                                {!!props.editRecord ? "Save" : "Insert"}
                            </Button>
                            <Button
                                variant={"light"}
                                color={"danger"}
                                radius={"full"}
                                onPress={() =>
                                {
                                    setInventory(undefined);
                                    onClose();
                                }}
                            >
                                Cancel
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}