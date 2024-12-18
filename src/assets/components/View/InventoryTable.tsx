import {Button, cn, getKeyValue, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@nextui-org/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEllipsisV} from "@fortawesome/free-solid-svg-icons";
import {useSearch} from "../../providers/SearchProvider.tsx";
import {useEffect, useState} from "react";
import DatabaseRecords, {Column, DatabaseOptions} from "../../ts/DatabaseRecords.ts";
import {useNavigate, useParams} from "react-router-dom";
import DepartmentDropdown from "./TableComponents/DepartmentDropdown.tsx";
import PrintButton from "./TableComponents/PrintButton.tsx";
import $ from "jquery";

interface InventoryTableProps
{
    onItemSelected: (id: string | null) => void;
    options: DatabaseOptions;
}

export type RowValue = {
    value: string;
    attributes: string[];
}

export default function InventoryTable(props: InventoryTableProps)
{
    const id = useParams().id ?? "";
    const navigate = useNavigate();
    const {search} = useSearch();
    const [items, setItems] = useState<any[]>([]);
    const [columns, setColumns] = useState<Column[]>([]);

    const [searchColumns, setSearchColumns] = useState<string[]>([]);
    const [primaryKey, setPrimaryKey] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    let abortController = new AbortController();
    let signal = abortController.signal;


    useEffect(() =>
    {
        return () =>
        {
            // Clean up on component unmount
            abortController.abort();
        };
    }, [id]);

    useEffect(() =>
    {
        if (!search)
        {
            // Perform the main data fetch without search
            DatabaseRecords.data(id, false)
                .then(items =>
                {
                    setSearchColumns(items.options.columns.filter(i => i.attributes.includes("search")).flatMap(i => i.real_name));
                    setPrimaryKey(items.options.columns.find(i => i.attributes.includes("primary"))?.real_name ?? "id");

                    if (items.columns) setColumns(items.options.columns);
                    if (items.results?.items) setItems(items.results?.items);
                })
                .finally(() => setIsLoading(false));
        } else
        {
            setIsLoading(true);
            DatabaseRecords.search(id, search, searchColumns, 100, 0, true, primaryKey, signal)
                .then((results) =>
                {
                    if (results?.items)
                    {
                        setItems(results.items);
                    } else
                        setItems([]);
                })
                .finally(() => setIsLoading(false));
        }

        return () =>
        {
            // Abort the fetch on component unmount or dependency change
            abortController.abort();
        };
    }, [search]);

    useEffect(() =>
    {

        if (localStorage.getItem(`print-auto-print-${id}`) === "true" && items.length === 1)
        {
            const firstPrintButton = $(`button[data-print-form]`)[0] as HTMLButtonElement;
            console.log("Auto Printing", firstPrintButton);
            if (firstPrintButton)
            {
                firstPrintButton.click();
            }
        }
    }, [items]);

    if (!id)
    {
        console.error("No id provided for DatabaseViewPage");
        navigate("/");
        return <></>;
    }

    return (
        <Table
            removeWrapper
            isStriped
            isHeaderSticky
            className={"w-auto mx-8 mt-4 grow"}
            classNames={{
                td: cn(
                    "data-[price]:!text-danger data-[mp]:!text-success data-[price]:!font-bold data-[mp]:!font-bold",
                    "before:!bg-transparent"
                ),
                tr: cn(
                    "data-[selected=true]:!bg-primary/20 data-[selected=true]:data-[hover=true]:!bg-primary/30",
                    "data-[odd=true]:bg-foreground/5 data-[hover=true]:hover:bg-foreground/10 transition-colors",
                    "dark:data-[odd=true]:bg-default-100/10 dark:data-[hover=true]:hover:bg-default-100/50"
                ),
                th: "dark:bg-background/50 backdrop-blur-md saturation-150 dark:brightness-150 mx-2",
                base: "max-h-[calc(100dvh_-_250px)] overflow-y-auto min-h-[250px]"
            }}
            onSortChange={(descriptor) =>
            {
                console.log(descriptor);
            }}
            selectionMode={"single"}
            onSelectionChange={(selected) =>
            {
                const item = [...selected];
                if (item.length > 0)
                {
                    props.onItemSelected(item[0] as string);
                } else
                {
                    props.onItemSelected(null);
                }
            }}
        >

            <TableHeader>
                {[...columns.filter(c => c.visible).map((column) =>
                    <TableColumn key={column.name}>{column.name}</TableColumn>
                ), (<TableColumn key="actions" className={"min-w-0 w-0"}>Actions</TableColumn>)]}

            </TableHeader>

            <TableBody emptyContent={<p>No Results Found!</p>} isLoading={isLoading} loadingContent={<Spinner size={"lg"}/>}>
                {items.map((row) =>
                    <TableRow key={row.id} id={row.id}>
                        {
                            [...columns
                                .filter(c => c.visible)
                                .map((column) =>
                                {
                                    let value = getKeyValue(row, column.real_name);
                                    if (!value)
                                    {
                                        value = "-";
                                    } else
                                    {
                                        if (column.attributes.includes("price") || column.attributes.includes("mp"))
                                        {
                                            value = `$${(+value.replace(/[^0-9.]/g, "")).toFixed(2)}`;
                                        }
                                    }

                                    if (props.options["print-form"].department?.id === -1 && column.attributes.includes("department"))
                                    {
                                        value = <DepartmentDropdown id={row.id}/>;
                                    }

                                    return (<TableCell key={column.name} {...column.attributes.reduce((acc, attr) => ({...acc, [`data-${attr}`]: true}), {})}>{value}</TableCell>);
                                }),
                                (
                                    <TableCell key={`${row.id}-actions`}>
                                        <div className={"flex flex-row gap-2"}>
                                            {props.options["print-form"].enabled &&
                                                <>
                                                    <PrintButton databaseId={id} row={row} columns={columns} printOptions={props.options["print-form"]}/>
                                                </>
                                            }
                                            <Button radius={"full"} className={"min-w-0 w-12 h-12"}><FontAwesomeIcon icon={faEllipsisV}/></Button>
                                        </div>
                                    </TableCell>
                                )
                            ]
                        }
                    </TableRow>
                )}
            </TableBody>

        </Table>
    );
}

