import {createContext, ReactNode, useCallback, useContext, useState} from "react";
import NewRecordModal from "../components/Modals/NewRecordModal.tsx";
import {InventoryRecord} from "../ts/data/Location.ts";

interface NewRecordModalContextType
{
    create: (callback: (record: InventoryRecord | undefined) => void) => void;
    edit: (record: InventoryRecord, callback: (record: InventoryRecord) => void) => void;
    onClose: (record: InventoryRecord | undefined) => void;
}

const NewRecordModalContext = createContext<NewRecordModalContextType | undefined>(undefined);

export function NewRecordModalProvider({children}: { children: ReactNode })
{
    const [open, setOpen] = useState(false);
    const [record, setRecord] = useState<InventoryRecord | undefined>(undefined);
    const [callback, setCallback] = useState<((record: InventoryRecord | undefined) => void) | undefined>(undefined);


    const onClose = useCallback(() =>
    {
        setRecord(undefined);
        setOpen(false);
    }, []);

    // Function to handle creating a new record
    const handleNew = useCallback((callback: (record: InventoryRecord | undefined) => void) =>
    {
        setRecord(undefined); // Ensure no existing record is being edited
        setCallback(() => callback);
        setOpen(true);
    }, []);

    // Function to handle editing an existing record
    const handleEdit = useCallback(
        (record: InventoryRecord, callback: (record: InventoryRecord) => void) =>
        {
            setRecord(record); // Set the existing record for editing
            setCallback(() => callback); // Store the callback for when editing is complete
            setOpen(true);
        },
        []
    );

    const handleModalClose = useCallback(
        (updatedRecord: InventoryRecord | undefined) =>
        {
            if (callback)
            {
                callback(updatedRecord); // Call the provided callback with the updated (or newly created) record
            }
            setOpen(false); // Close the modal
        },
        [callback]
    );


    return (
        <NewRecordModalContext.Provider value={{create: handleNew, edit: handleEdit, onClose}}>
            <NewRecordModal
                isOpen={open}
                onClose={handleModalClose}
                editRecord={record}
            />
            {children}
        </NewRecordModalContext.Provider>

    );
}

export function useNewRecordModal(): NewRecordModalContextType
{
    const context = useContext(NewRecordModalContext);
    if (!context)
    {
        throw new Error("useNewRecordModal must be used within a NewRecordModalProvider");
    }
    return context;
}