import {createContext, Dispatch, ReactNode, SetStateAction, useContext, useState} from "react";

interface NewRecordModalContextType
{
    newRecordModal: string | null;
    setNewRecordModal: Dispatch<SetStateAction<string | null>>;
}

const NewRecordModalContext = createContext<NewRecordModalContextType | undefined>(undefined);

export function NewRecordModalProvider({children}: { children: ReactNode })
{
    const [newRecordModal, setNewRecordModal] = useState<string | null>(null);

    return (
        <NewRecordModalContext.Provider value={{newRecordModal, setNewRecordModal}}>
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