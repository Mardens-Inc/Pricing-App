import {Navbar, NavbarBrand, NavbarContent, NavbarItem} from "@nextui-org/navbar";
import Logo from "../images/Logo.svg.tsx";
import {Button, Input, Tooltip} from "@nextui-org/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLock, faMicrophone, faMoon, faSun} from "@fortawesome/free-solid-svg-icons";
import {applyTheme, getCurrentTheme, Theme} from "../ts/Theme.ts";
import {useEffect, useState} from "react";
import LoginModal from "./LoginModal/LoginModal.tsx";

export default function Navigation()
{
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(getCurrentTheme() === Theme.dark);
    useEffect(() =>
    {
        applyTheme(darkMode ? Theme.dark : Theme.light);
    }, [darkMode]);


    return (
        <>
            <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}/>
            <Navbar maxWidth={"full"} height={80}>
                <NavbarContent>
                    <NavbarBrand className={"flex flex-row gap-2"}>
                        <Logo size={72}/>
                        <div className={"flex flex-col"}>
                            <p className="font-bold text-inherit">Pricing Database</p>
                            <p className="opacity-50 italic">v0.2.3</p>
                        </div>
                    </NavbarBrand>
                </NavbarContent>

                <NavbarContent className="hidden sm:flex gap-4 w-full" justify="center">
                    <Input
                        label={"Search"}
                        placeholder="Search for a database"
                        radius={"full"}
                        className={"min-w-md w-1/2 max-w-4xl"}
                        classNames={{
                            inputWrapper: "h-12"
                        }}
                    />
                    <Tooltip content={"Voice Search"}>
                        <Button radius={"full"} className={"h-12 w-12 aspect-square p-0 min-w-0"}>
                            <FontAwesomeIcon icon={faMicrophone}/>
                        </Button>
                    </Tooltip>
                </NavbarContent>
                <NavbarContent justify="end">
                    <NavbarItem>
                        <Tooltip content={"Login"}>
                            <Button radius={"full"} className={"h-12 w-12 aspect-square p-0 min-w-0"} onClick={() => setIsModalOpen(true)}>
                                <FontAwesomeIcon icon={faLock}/>
                            </Button>
                        </Tooltip>
                    </NavbarItem>
                    <NavbarItem>
                        <Tooltip content={`Toggle ${darkMode ? "Light" : "Dark"} Mode`}>
                            <Button radius={"full"} className={"h-12 w-12 aspect-square p-0 min-w-0"} onClick={() => setDarkMode(prev => !prev)} color={"primary"}>
                                <FontAwesomeIcon icon={darkMode ? faMoon : faSun}/>
                            </Button>
                        </Tooltip>
                    </NavbarItem>
                </NavbarContent>
            </Navbar>
        </>
    );
}
