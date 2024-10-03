import {createContext, Dispatch, ReactNode, SetStateAction, useContext, useState} from "react";

interface SearchContextType
{
    search: string;
    setSearch: Dispatch<SetStateAction<string>>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({children}: { children: ReactNode })
{
    const [search, setSearch] = useState("");
    return (
        <SearchContext.Provider value={{search, setSearch}}>
            {children}
        </SearchContext.Provider>
    );
}

export function useSearch(): SearchContextType
{
    const context = useContext(SearchContext);
    if (!context)
    {
        throw new Error("useSearch must be used within a SearchProvider");
    }
    return context;
}