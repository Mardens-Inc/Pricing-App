import {Link, NavbarBrand, NavbarContent, Tooltip} from "@nextui-org/react";
import Logo from "../../images/Logo.svg.tsx";
import {useEffect, useState} from "react";
import {getServerVersion} from "../../ts/server_information.ts";

export default function BrandComponent()
{
    const [applicationVersion, setApplicationVersion] = useState("0.0.0");
    useEffect(() =>
    {
        getServerVersion().then(setApplicationVersion);
    }, []);
    return (
        <NavbarContent>
            <Tooltip content={"Navigate back home"} delay={1500}>
                <NavbarBrand className={"flex flex-row gap-2 dark:text-white text-black"} as={Link} href={"/"}>
                    <Logo size={72}/>
                    <div className={"flex flex-col"}>
                        <p className="font-bold">Pricing Database</p>
                        <p className="opacity-50 italic">v{applicationVersion}</p>
                    </div>
                </NavbarBrand>
            </Tooltip>
        </NavbarContent>
    );
}