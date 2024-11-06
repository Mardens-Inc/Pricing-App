import {Link, NavbarBrand, NavbarContent, Tooltip} from "@nextui-org/react";
import Logo from "../../images/Logo.svg.tsx";

export default function BrandComponent()
{
    return (
        <NavbarContent>
            <Tooltip content={"Navigate back home"} delay={1500}>
                <NavbarBrand className={"flex flex-row gap-2 dark:text-white text-black"} as={Link} href={"/"}>
                    <Logo size={72}/>
                    <div className={"flex flex-col"}>
                        <p className="font-bold">Pricing Database</p>
                        <p className="opacity-50 italic">v0.2.3</p>
                    </div>
                </NavbarBrand>
            </Tooltip>
        </NavbarContent>
    );
}