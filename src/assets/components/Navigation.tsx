import {Navbar, NavbarBrand, NavbarContent, NavbarItem} from "@nextui-org/navbar";
import Logo from "../images/Logo.svg.tsx";
import {Button, Input, Link, Tooltip} from "@nextui-org/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLock, faMicrophone, faMoon, faPlus, faSignOut, faSun} from "@fortawesome/free-solid-svg-icons";
import {applyTheme, getCurrentTheme, Theme} from "../ts/Theme.ts";
import {useEffect, useState} from "react";
import LoginModal from "./LoginModal/LoginModal.tsx";
import AlertModal from "./AlertModal.tsx";
import {useAuth} from "./AuthProvider.tsx";

export default function Navigation()
{
    const {auth, isLoggedIn, setIsLoggedIn} = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isLogoutAlertOpen, setIsLogoutAlertOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(getCurrentTheme() === Theme.dark);
    useEffect(() =>
    {
        applyTheme(darkMode ? Theme.dark : Theme.light);
    }, [darkMode]);


    return (
        <>
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)}/>
            <AlertModal
                isOpen={isLogoutAlertOpen}
                onClose={() =>
                {
                    setIsLogoutAlertOpen(false);
                }}
                message={"Are you sure you want to logout"}
                buttons={
                    <>
                        <Button radius={"full"} color={"danger"} onClick={() =>
                        {
                            auth.logout();
                            setIsLoggedIn(false);
                            setIsLogoutAlertOpen(false);
                        }}>Logout</Button>
                        <Button radius={"full"} onClick={() => setIsLogoutAlertOpen(false)}>Cancel</Button>
                    </>
                }
            />
            <Navbar maxWidth={"full"} height={80}>
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

                <NavbarContent className="hidden sm:flex gap-2 w-full" justify="center">
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
                <NavbarContent justify="end" className={"gap-2"}>
                    {isLoggedIn ? (
                        <div className={"flex flex-row gap-2"}>
                            {auth.getUserProfile().admin && (
                                <NavbarItem>
                                    <Tooltip content={"Add new database"}>
                                        <Button radius={"full"} className={"h-12 w-12 aspect-square p-0 min-w-0"} as={Link} href={"/new"}>
                                            <FontAwesomeIcon icon={faPlus}/>
                                        </Button>
                                    </Tooltip>
                                </NavbarItem>
                            )}
                            <NavbarItem>
                                <Tooltip content={"Logout"}>
                                    <Button radius={"full"} className={"h-12 w-12 aspect-square p-0 min-w-0"} onClick={() => setIsLogoutAlertOpen(true)}>
                                        <FontAwesomeIcon icon={faSignOut}/>
                                    </Button>
                                </Tooltip>
                            </NavbarItem>
                        </div>
                    ) : (
                        <NavbarItem>
                            <Tooltip content={"Login"}>
                                <Button radius={"full"} className={"h-12 w-12 aspect-square p-0 min-w-0"} onClick={() => setIsLoginModalOpen(true)}>
                                    <FontAwesomeIcon icon={faLock}/>
                                </Button>
                            </Tooltip>
                        </NavbarItem>
                    )}
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
