import {Button, Link, NavbarContent, NavbarItem, Tooltip} from "@heroui/react";
import LoginModal from "../LoginModal/LoginModal.tsx";
import AlertModal from "../AlertModal.tsx";
import {useAuth} from "../../providers/AuthProvider.tsx";
import {useEffect, useState} from "react";
import {applyTheme, getCurrentTheme, Theme} from "../../ts/Theme.ts";
import {useDatabaseView} from "../../providers/DatabaseViewProvider.tsx";
import {Icon} from "@iconify/react";

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
                                            <Tooltip content={"Edit database"}>
                                                <Button radius={"full"} className={"h-12 w-12 aspect-square p-0 min-w-0"} as={Link} href={`/${id}/edit`}>
                                                    <Icon icon="mage:edit-pen-fill"/>
                                                </Button>
                                            </Tooltip>
                                        </NavbarItem>
                                        <NavbarItem>
                                            <Tooltip content={"Export database"}>
                                                <Button radius={"full"} className={"h-12 w-12 aspect-square p-0 min-w-0"} isLoading={isLoadingExport} onPress={async () =>
                                                {
                                                    setIsLoadingExport(true);
                                                    // await DatabaseRecords.export(id);
                                                    setIsLoadingExport(false);
                                                }}>
                                                    {!isLoadingExport && (
                                                        <Icon icon="humbleicons:download"/>
                                                    )}
                                                </Button>
                                            </Tooltip>
                                        </NavbarItem>
                                    </>
                                ) : (
                                    <NavbarItem>
                                        <Tooltip content={"Add new database"}>
                                            <Button radius={"full"} className={"h-12 w-12 aspect-square p-0 min-w-0"} as={Link} href={"/new"}>
                                                <Icon icon="ic:round-plus"/>
                                            </Button>
                                        </Tooltip>
                                    </NavbarItem>
                                )}
                            </>
                        )}
                        <NavbarItem>
                            <Tooltip content={"Logout"}>
                                <Button radius={"full"} className={"h-12 w-12 aspect-square p-0 min-w-0"} onPress={() => setIsLogoutAlertOpen(true)}>
                                    <Icon icon="mage:logout"/>
                                </Button>
                            </Tooltip>
                        </NavbarItem>
                    </div>
                ) : (
                    <NavbarItem>
                        <Tooltip content={"Login"}>
                            <Button radius={"full"} className={"h-12 w-12 aspect-square p-0 min-w-0"} onPress={() => setIsLoginModalOpen(true)}>
                                <Icon icon="mage:lock"/>
                            </Button>
                        </Tooltip>
                    </NavbarItem>
                )}
                <NavbarItem>
                    <Tooltip content={`Toggle ${darkMode ? "Light" : "Dark"} Mode`}>
                        <Button radius={"full"} className={"h-12 w-12 aspect-square p-0 min-w-0"} onPress={() => setDarkMode(prev => !prev)} color={"primary"}>
                            <Icon icon={darkMode ? "mage:moon-fill" : "mage:sun-fill"}/>
                        </Button>
                    </Tooltip>
                </NavbarItem>
            </NavbarContent>
        </>
    );
}
