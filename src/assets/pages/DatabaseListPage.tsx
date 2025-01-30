import {useEffect, useState} from "react";
import Logo from "../images/Logo.svg.tsx";
import {useSearch} from "../providers/SearchProvider.tsx";
import {useAuth} from "../providers/AuthProvider.tsx";
import {useDatabaseView} from "../providers/DatabaseViewProvider.tsx";
import {Avatar, Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Link, Pagination, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip} from "@heroui/react";
import $ from "jquery";
import {setTitle} from "../../main.tsx";
import Location from "../ts/data/Location.ts";
import {Icon} from "@iconify/react";
import IconData from "../ts/data/Icon.ts";
import {useNavigate} from "react-router-dom";


export default function DatabaseListPage()
{
    setTitle();
    const navigate = useNavigate();
    const [icons, setIcons] = useState<IconData[]>([]);
    const [items, setItems] = useState<Location[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [currentItems, setCurrentItems] = useState<Location[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const {search} = useSearch();
    const {auth, isLoggedIn} = useAuth();
    useDatabaseView().setDatabaseId(undefined);

    useEffect(() =>
    {
        setItemsPerPage(calculateItemsPerPage());

        $(window)
            .off("resize")
            .on("resize", () =>
            {
                setItemsPerPage(calculateItemsPerPage());
            });

        setLoading(true);
        Location.all()
            .then(location =>
            {
                console.log("Loaded database list", location);
                setItems(location);
                setPage(1);
                setLoading(false);
            })
            .catch((error) =>
            {
                console.error(error);
                setLoading(false);
                alert("Failed to load database list.");
            })
            .finally(() =>
            {
                setItemsPerPage(calculateItemsPerPage());
            });

        IconData.all().then(setIcons);

    }, []);

    useEffect(() =>
    {
        console.log("Items per page changed", itemsPerPage);
        setCurrentItems(items.slice(0, itemsPerPage));
    }, [itemsPerPage, items]);

    useEffect(() =>
    {
        if (!items.length)
        {
            console.log("No items");
            return;
        }
        if (!search)
        {
            console.log("No search");
            return setCurrentItems(items.slice(0, itemsPerPage));
        }
        return setCurrentItems(items.filter((item) => `${item.name} ${item.po} ${item.location}`.toLowerCase().includes(search.toLowerCase())).splice(0, itemsPerPage));
    }, [search]);

    // Calculate the items per page based on the height of the row item and the height of the tables available space
    const calculateItemsPerPage = () =>
    {
        const viewportHeight = $(window).height() ?? 0;
        const tableHeight = viewportHeight - 150;
        const rowHeight = 56;
        console.log("Table Height", tableHeight, "Row Height", rowHeight, "Body Height", viewportHeight);
        return Math.max(Math.floor(tableHeight / rowHeight), 2);
    };

    return (
        <Table
            removeWrapper
            hideHeader
            isStriped
            className={"w-auto mx-8 mt-4"}
            classNames={{
                tr: "hover:bg-foreground/5 cursor-pointer transition-colors",
                td: "before:!bg-default-100/10",
                th: "dark:bg-background/50 backdrop-blur-md saturation-150 dark:brightness-150 mx-2"
            }}
            onSortChange={(descriptor) =>
            {
                console.log("Sort changed", descriptor);
            }}
            bottomContent={
                items.length > itemsPerPage ?
                    <Pagination
                        total={Math.ceil(items.length / itemsPerPage)}
                        page={page}
                        onChange={(newPage) =>
                        {
                            setPage(newPage);
                            setCurrentItems(items.slice((newPage - 1) * itemsPerPage, newPage * itemsPerPage));
                        }}
                        showControls
                        showShadow
                        className={"mx-auto"}
                        radius={"full"}
                    /> : <></>
            }
        >
            <TableHeader>
                <TableColumn key={"icon"} className={"w-12"}>Icon</TableColumn>
                <TableColumn key={"name"} allowsSorting>Name</TableColumn>
                <TableColumn key={"location"} allowsSorting>Location</TableColumn>
                <TableColumn key={"po"} allowsSorting>PO</TableColumn>
                <TableColumn key={"date"} allowsSorting>Post Date</TableColumn>
                <TableColumn key={"actions"} className={"w-0"}>Actions</TableColumn>
            </TableHeader>
            <TableBody
                isLoading={loading}
                loadingContent={<Spinner size={"lg"} label={"Loading database list..."}/>}
                emptyContent={"No databases found."}
            >
                {currentItems.map((item, index) =>
                {
                    return (
                        <TableRow key={item.id + index.toString()} className={"dark:group-hover:bg-default-100/10"} onClick={() => navigate(`/inv/${item.id}`)}>
                            <TableCell className={"w-12"}>
                                <LocationIcon location={item} icons={icons}/>
                            </TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.location || "Unknown"}</TableCell>
                            <TableCell>{item.po || "No PO# Found"}</TableCell>
                            <TableCell>
                                {
                                    new Intl.DateTimeFormat(
                                        "en-us",
                                        {
                                            month: "short",
                                            day: "2-digit", weekday: "short",
                                            year: "numeric", hourCycle: "h12",
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        }
                                    ).format(new Date(item.post_date))
                                }
                            </TableCell>
                            <TableCell className={"w-0"}>
                                <div className={"gap-2 flex flex-row"}>
                                    {isLoggedIn && auth.getUserProfile().admin ? (<>
                                        <Tooltip content={`Edit '${item.name}'`} closeDelay={0} classNames={{base: "pointer-events-none"}}>
                                            <Button radius={"full"} className={"min-w-0 p-0 w-10 h-10 text-[1rem]"} as={Link} href={`/inv/${item.id}/edit`}>
                                                <Icon icon="mage:edit-fill"/>
                                            </Button>
                                        </Tooltip>
                                        <Dropdown>
                                            <DropdownTrigger>
                                                <div>
                                                    <Tooltip content={`More Options`} closeDelay={0} classNames={{base: "pointer-events-none"}}>
                                                        <Button radius={"full"} className={"min-w-0 p-0 w-10 h-10 text-[2rem]"} onPressStart={(e) => e.continuePropagation()}>
                                                            <Icon icon="mynaui:dots"/>
                                                        </Button>
                                                    </Tooltip>
                                                </div>
                                            </DropdownTrigger>
                                            <DropdownMenu>
                                                <DropdownItem key={`${item.id}-history-dropdown-item`}>View History</DropdownItem>
                                                <DropdownItem as={Link} href={`/${item.id}/edit`} className={"text-inherit"} key={`${item.id}-edit-dropdown-item`}>Edit</DropdownItem>
                                                <DropdownItem key={`${item.id}-delete-dropdown-item`}>Delete</DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>
                                    </>) : (<></>)}
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}

function LocationIcon(props: { location: Location, icons: IconData[], size?: number })
{
    const [icon, setIcon] = useState<IconData | undefined>(undefined);
    useEffect(() =>
    {
        if (!props.location.image) return;
        IconData.get(props.location.image, props.icons).then(setIcon);
    }, []);

    if (!props.location.image || !icon)
        return <Logo size={props.size ?? 40}/>;

    return <Avatar src={icon.url} alt={props.location.name}/>;
}