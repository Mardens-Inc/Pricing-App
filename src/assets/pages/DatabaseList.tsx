import DatabaseItem from "../ts/DatabaseItem.ts";
import {default as dbList} from "../ts/DatabaseList.ts";
import {useEffect, useState} from "react";
import {Avatar, Button, Pagination, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip} from "@nextui-org/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faEllipsisH} from "@fortawesome/free-solid-svg-icons";
import Logo from "../images/Logo.svg.tsx";

export default function DatabaseList()
{
    const [items, setItems] = useState<DatabaseItem[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [currentItems, setCurrentItems] = useState<DatabaseItem[]>([]);
    const itemsPerPage = 20;
    useEffect(() =>
    {
        setLoading(true);
        dbList.get().then((databases) =>
        {
            setItems(databases);
            setCurrentItems(databases.splice(0, itemsPerPage));
            setPage(1);
            setLoading(false);
        }).catch((error) =>
        {
            console.error(error);
            setLoading(false);
            alert("Failed to load database list.");
        });
    }, []);

    return (
        <Table
            removeWrapper
            className={"w-auto mx-8 mt-4"}
            classNames={{
                tr: "dark:hover:bg-white/5 hover:bg-black/5 cursor-pointer transition-colors"
            }}
            onSortChange={(descriptor) =>
            {
                console.log(descriptor);
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
                        classNames={{
                            cursor: "text-black"
                        }}
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
                {currentItems.map((item) =>
                {
                    return (
                        <TableRow key={item.id}>
                            <TableCell className={"w-12"}>
                                {item.image ? <Avatar src={item.image} alt={item.name}/> : <Logo size={40}/>}
                            </TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.location || "Unknown"}</TableCell>
                            <TableCell>{item.po || "No PO Found"}</TableCell>
                            <TableCell>{item.post_date}</TableCell>
                            <TableCell>
                                <div className={"gap-2 flex flex-row"}>
                                    <Tooltip content={`Edit '${item.name}'`} closeDelay={0}>
                                        <Button radius={"full"} className={"min-w-0 p-0 w-10 h-10"}><FontAwesomeIcon icon={faEdit} width={10}/></Button>
                                    </Tooltip>
                                    <Tooltip content={`More Options`} closeDelay={0}>
                                        <Button radius={"full"} className={"min-w-0 p-0 w-10 h-10"}><FontAwesomeIcon icon={faEllipsisH} width={10}/></Button>
                                    </Tooltip>
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}