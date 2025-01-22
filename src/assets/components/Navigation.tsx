import {Navbar} from "@heroui/react";
import BrandComponent from "./Navigation/BrandComponent.tsx";
import GlobalSearchComponent from "./Navigation/GlobalSearchComponent.tsx";
import GlobalActionsComponent from "./Navigation/GlobalActionsComponent.tsx";

export default function Navigation()
{
    return (
        <>
            <Navbar maxWidth={"full"} height={80}>
                <BrandComponent/>
                <GlobalSearchComponent/>
                <GlobalActionsComponent/>
            </Navbar>
        </>
    );
}
