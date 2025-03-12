import {Button, ButtonGroup, cn, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@heroui/react";
import Location, {InventoryRecord} from "../../ts/data/Location.ts";
import {useDatabaseView} from "../../providers/DatabaseViewProvider.tsx";
import {useEffect, useState} from "react";
import {useToast} from "../../providers/ToastProvider.tsx";
import Column from "../../ts/data/Column.ts";
import ExtendedSwitch from "../Extends/ExtendedSwitch.tsx";
import {Icon} from "@iconify/react";

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
    const [loading, setLoading] = useState(false);
    const {toast} = useToast();
    const [database, setDatabase] = useState<Location | undefined>(undefined);
    // Track modified fields
    const [modifiedFields, setModifiedFields] = useState<Record<string, any>>({});

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
            setDatabase(db);
            Column.all(databaseId).then(columns => setColumns(columns));
        });
        setInventory(props.editRecord ?? {} as InventoryRecord);
        // Reset modified fields when modal opens or editRecord changes
        setModifiedFields({});
    }, [props.editRecord, props.isOpen]);

    const handleInputChange = (columnName: string, value: string) =>
    {
        setInventory(prev =>
        {
            if (!prev) return prev;
            return {...prev, [columnName]: value};
        });

        // Track this field as modified
        setModifiedFields(prev => ({
            ...prev,
            [columnName]: value
        }));
    };

    const handleSubmit = async () =>
    {
        if (!inventory || !database) return;

        setLoading(true);
        try
        {
            let success = false;

            if (props.editRecord && "id" in props.editRecord)
            {
                // Only send modified fields instead of the entire inventory object
                success = await database.editRecord(props.editRecord.id, modifiedFields);
                if (success)
                {
                    toast({
                        title: "Record updated",
                        description: "The record has been successfully updated",
                        type: "success"
                    });
                }
            } else
            {
                // Create a new record using the addRecord method
                const recordId = await database.addRecord(inventory);
                success = recordId !== null;

                if (success)
                {
                    // Add the ID to the inventory object if returned
                    if (recordId)
                    {
                        setInventory(prev => prev ? {...prev, id: recordId.toString()} : prev);
                    }

                    toast({
                        title: "Record created",
                        description: "The new record has been successfully added",
                        type: "success"
                    });
                }
            }

            if (success)
            {
                props.onClose(inventory);
            } else
            {
                toast({
                    title: "Error",
                    description: "Failed to save the record",
                    type: "error"
                });
            }
        } catch (error)
        {
            console.error("Error saving record:", error);
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                type: "error"
            });
        } finally
        {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={props.isOpen} onClose={() => props.onClose(inventory)} scrollBehavior={"inside"}>
            <ModalContent>
                {onClose => (
                    <>
                        <ModalHeader>{!!props.editRecord ? "Edit Record" : "New Record"}</ModalHeader>
                        <ModalBody>
                            {columns.filter(i => !i.attributes.includes("readonly")).map(column =>
                            {
                                if (column.attributes.includes("quantity"))
                                {
                                    return (
                                        <ButtonGroup key={column.displayName} className={"flex flex-row gap-2"}>
                                            <Button
                                                radius={"full"}
                                                className={"min-w-0 min-h-0 aspect-square my-auto p-0 flex-shrink-0"}
                                                onPress={() => handleInputChange(column.name, (parseInt(inventory?.[column.name] || "0") - 1).toString())}
                                            >
                                                <Icon icon="mage:minus"/>
                                            </Button>
                                            <Input
                                                key={`${column.displayName}-input`}
                                                label={<>{column.displayName} <span className={"opacity-50 italic"}>({column.name})</span></>}
                                                placeholder={`Enter ${column.displayName}`}
                                                size={"sm"}
                                                value={modifiedFields[column.name]}
                                                defaultValue={props.editRecord?.[column.name]}
                                                onChange={(e) => handleInputChange(column.name, e.target.value)}
                                            />
                                            <Button
                                                radius={"full"}
                                                className={"min-w-0 min-h-0 aspect-square my-auto p-0 flex-shrink-0"}
                                                onPress={() => handleInputChange(column.name, (parseInt(inventory?.[column.name] || "0") + 1).toString())}
                                            >
                                                <Icon icon="mage:plus"/>
                                            </Button>
                                        </ButtonGroup>
                                    );
                                }
                                return (
                                    column.visible ? (
                                        <Input
                                            key={column.displayName}
                                            label={<>{column.displayName} <span className={"opacity-50 italic"}>({column.name})</span></>}
                                            placeholder={`Enter ${column.displayName}`}
                                            radius={"full"}
                                            defaultValue={props.editRecord?.[column.name]}
                                            onChange={(e) => handleInputChange(column.name, e.target.value)}
                                        />
                                    ) : null
                                );
                            })}
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
                                        {columns.filter(i => !i.visible && !i.attributes.includes("readonly")).map(column =>
                                            (
                                                <Input
                                                    key={column.displayName}
                                                    label={<>{column.displayName} <span className={"opacity-50 italic"}>({column.name})</span></>}
                                                    placeholder={`Enter ${column.displayName}`}
                                                    radius={"full"}
                                                    defaultValue={props.editRecord?.[column.name]}
                                                    onChange={(e) => handleInputChange(column.name, e.target.value)}
                                                />
                                            )
                                        )}
                                    </div>
                                </>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onPress={handleSubmit} isLoading={loading}>
                                {props.editRecord ? "Save Changes" : "Create Record"}
                            </Button>
                            <Button color="danger" variant="light" onPress={() =>
                            {
                                setInventory(undefined);
                                onClose();
                            }}>
                                Cancel
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}