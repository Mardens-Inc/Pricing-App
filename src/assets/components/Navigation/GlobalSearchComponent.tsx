import {Input, NavbarContent} from "@nextui-org/react";
import {useSearch} from "../../providers/SearchProvider.tsx";
import VoiceSearch from "./VoiceSearch.tsx";

export default function GlobalSearchComponent()
{
    const {search, setSearch} = useSearch();
    return (
        <NavbarContent className="hidden sm:flex gap-2 w-full" justify="center">
            <Input
                label={"Search"}
                placeholder="Search for a database"
                radius={"full"}
                className={"min-w-md w-1/2 max-w-4xl"}
                classNames={{
                    inputWrapper: "h-12"
                }}
                value={search}
                onValueChange={setSearch}
            />
            <VoiceSearch/>
        </NavbarContent>
    );
}