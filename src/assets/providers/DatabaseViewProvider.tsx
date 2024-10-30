import {createContext, Dispatch, ReactNode, SetStateAction, useContext, useState} from "react";

interface DatabaseViewContextType
{
    databaseId: string | undefined;
    setDatabaseId: Dispatch<SetStateAction<string | undefined>>;
}

const DatabaseViewContext = createContext<DatabaseViewContextType | undefined>(undefined);

export function DatabaseViewProvider({children}: { children: ReactNode })
{
    const [databaseId, setDatabaseId] = useState<string | undefined>(undefined);
    return (
        <DatabaseViewContext.Provider value={{databaseId: databaseId, setDatabaseId}}>
            {children}
        </DatabaseViewContext.Provider>
    );
}

export function useDatabaseView(): DatabaseViewContextType
{
    const context = useContext(DatabaseViewContext);
    if (!context)
    {
        throw new Error("useDatabaseView must be used within a DatabaseViewProvider");
    }
    return context;
}