import {createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState} from "react";
import {useLocation} from "react-router-dom";

interface SearchContextType
{
    search: string;
    setSearch: Dispatch<SetStateAction<string>>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({children}: { children: ReactNode })
{
    const {pathname} = useLocation();
    const [search, setSearch] = useState(() =>
    {
        const params = new URLSearchParams(window.location.search);
        return params.get("search") || "";
    });

    useEffect(() =>
    {
        setSearch("");
    }, [pathname]);

    useEffect(() =>
    {
        const params = new URLSearchParams(window.location.search);
        if (search)
        {
            params.set("search", search);
            window.history.replaceState(null, "", `?${params.toString()}`);
        } else
        {
            params.delete("search");
            const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
            window.history.replaceState(null, "", newUrl);
        }
    }, [search]);

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