import {Button, Link, NavbarContent, NavbarItem} from "@heroui/react";
import LoginModal from "../LoginModal/LoginModal.tsx";
import AlertModal from "../AlertModal.tsx";
import {useAuth} from "../../providers/AuthProvider.tsx";
import {useEffect, useState} from "react";
import {applyTheme, getCurrentTheme, Theme} from "../../ts/Theme.ts";
import {useDatabaseView} from "../../providers/DatabaseViewProvider.tsx";
import {Icon} from "@iconify/react";
import Location from "../../ts/data/Location.ts";
import ExpandableButton from "../Extends/ExpandableButton.tsx";

export default function GlobalActionsComponent()
{
    const id = useDatabaseView().databaseId;
    const {auth, isLoggedIn, setIsLoggedIn} = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isLogoutAlertOpen, setIsLogoutAlertOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(getCurrentTheme() === Theme.dark);
    const [isLoadingExport, setIsLoadingExport] = useState(false);


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
                        <Button radius={"full"} color={"danger"} onPress={() =>
                        {
                            auth.logout();
                            setIsLoggedIn(false);
                            setIsLogoutAlertOpen(false);
                        }}>Logout</Button>
                        <Button radius={"full"} onPress={() => setIsLogoutAlertOpen(false)}>Cancel</Button>
                    </>
                }
            />
            <NavbarContent justify="end" className={"gap-2"}>
                {isLoggedIn ? (
                    <div className={"flex flex-row gap-2"}>
                        {auth.getUserProfile().admin && (
                            <>
                                {id != undefined ? (
                                    <>
                                        <NavbarItem>
                                            <ExpandableButton
                                                radius={"full"}
                                                className={"h-12"}
                                                as={Link}
                                                href={`/inv/${id}/edit`}
                                                startContent={<Icon icon="mage:edit-fill"/>}
                                            >
                                                Edit Database
                                            </ExpandableButton>
                                        </NavbarItem>
                                        <NavbarItem>
                                            <ExpandableButton
                                                radius={"full"}
                                                className={"h-12"}
                                                isLoading={isLoadingExport}
                                                onPress={async () =>
                                                {
                                                    setIsLoadingExport(true);
                                                    await Location.export(id);
                                                    setIsLoadingExport(false);
                                                }}
                                                startContent={<Icon icon="mage:save-floppy-fill"/>}
                                            >
                                                Export Database
                                            </ExpandableButton>
                                        </NavbarItem>
                                    </>
                                ) : (
                                    <NavbarItem>
                                        <ExpandableButton
                                            radius={"full"}
                                            className={"h-12"}
                                            as={Link}
                                            href={"/new"}
                                            startContent={<Icon icon="mage:plus"/>}
                                        >
                                            New Database
                                        </ExpandableButton>
                                    </NavbarItem>
                                )}
                            </>
                        )}
                        <NavbarItem>
                            <ExpandableButton
                                radius={"full"}
                                className={"h-12"}
                                onPress={() => setIsLogoutAlertOpen(true)}
                                startContent={<Icon icon="humbleicons:logout"/>}
                            >
                                Logout
                            </ExpandableButton>
                        </NavbarItem>
                    </div>
                ) : (
                    <NavbarItem>
                        <ExpandableButton
                            radius={"full"}
                            className={"h-12"}
                            onPress={() => setIsLoginModalOpen(true)}
                            startContent={<Icon icon="mage:lock-fill"/>}
                        >
                            Login
                        </ExpandableButton>
                    </NavbarItem>
                )}
                <NavbarItem>
                    <ExpandableButton
                        radius={"full"}
                        className={"h-12"}
                        onPress={() => setDarkMode(prev => !prev)}
                        startContent={<Icon icon={darkMode ? "mage:moon-fill" : "mage:sun-fill"}/>}
                        color={"primary"}
                    >
                        Toggle {darkMode ? "Light" : "Dark"} Mode
                    </ExpandableButton>
                </NavbarItem>
            </NavbarContent>
        </>
    );
}
