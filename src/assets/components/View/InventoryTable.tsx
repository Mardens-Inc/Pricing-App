import {Button, cn, getKeyValue, SortDescriptor, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@heroui/react";
import {useSearch} from "../../providers/SearchProvider.tsx";
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {DepartmentDropdown} from "./TableComponents/DepartmentDropdown.tsx";
import PrintButton from "./TableComponents/PrintButton.tsx";
import $ from "jquery";
import {Icon} from "@iconify/react";
import Column from "../../ts/data/Column.ts";
import Options from "../../ts/data/Options.ts";
import Location, {InventoryRecord} from "../../ts/data/Location.ts";
import PrintDropdown from "./TableComponents/PrintDropdown.tsx";

interface InventoryTableProps
{
    onItemSelected: (id: string | null) => void;
    options: Options;
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
    const [items, setItems] = useState<InventoryRecord[]>([]);
    const [location, setLocation] = useState<Location | undefined>(undefined);
    const [columns, setColumns] = useState<Column[]>([]);

    const [searchColumns, setSearchColumns] = useState<string[]>([]);
    const [_primaryKey, setPrimaryKey] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({column: "last_modified_date", direction: "ascending"});

    let abortController = new AbortController();


    useEffect(() =>
    {
        Location.get(id).then(setLocation);
        return () =>
        {
            // Clean up on component unmount
            abortController.abort();
        };
    }, [id]);

    useEffect(() =>
    {
        setIsLoading(true);
        if (location)
        {
            if (!search)
            {
                Column.all(id).then(columns =>
                {
                    setColumns(columns.filter(i => i.visible));
                    setSearchColumns(columns.filter(i => i.attributes.includes("search")).flatMap(i => i.name));
                    setPrimaryKey(columns.find(i => i.attributes.includes("primary"))?.name ?? "id");
                });

                abortController.abort();
                abortController = new AbortController();
                location
                    .records({limit: 10, sort: sortDescriptor.column.toString(), ascending: sortDescriptor.direction === "ascending", offset: 0}, abortController.signal)
                    .then(i => i.data)
                    .then(setItems)
                    .finally(() => setIsLoading(false));
            } else
            {
                abortController.abort();
                abortController = new AbortController();
                location
                    .search({limit: 10, sort: sortDescriptor.column.toString(), ascending: sortDescriptor.direction === "ascending", offset: 0, search: search, columns: searchColumns}, abortController.signal)
                    .then(i => i.data)
                    .then(setItems)
                    .finally(() => setIsLoading(false));
            }
        }

        return () =>
        {
            // Abort the fetch on component unmount or dependency change
            abortController.abort();
        };
    }, [search, location, sortDescriptor]);

    useEffect(() =>
    {

        if (localStorage.getItem(`print-auto-print-${id}`) === "true" && items?.length === 1)
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

    if (!location)
    {
        return <></>;
    }


    // console.log(props.options);
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
            sortDescriptor={sortDescriptor}
            onSortChange={(descriptor) =>
            {
                console.log("Sort changed", descriptor);
                setSortDescriptor(descriptor);
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
                    <TableColumn key={column.name} allowsSorting>{column.displayName}</TableColumn>
                ), (<TableColumn key="actions" className={"min-w-0 w-0"}>Actions</TableColumn>)]}

            </TableHeader>

            <TableBody emptyContent={<p>No Results Found!</p>} isLoading={isLoading} loadingContent={<Spinner size={"lg"}/>} items={items}>
                {isLoading ? <></> :
                    (items ?? []).map((row: InventoryRecord) =>
                        <TableRow key={row.id} id={row.id}>
                            {
                                [...columns
                                    .filter(c => c.visible)
                                    .map((column) =>
                                    {
                                        let value = getKeyValue(row, column.name);
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

                                        if (column.attributes.includes("department"))
                                        {
                                            value = <DepartmentDropdown id={row.id}/>;
                                        }

                                        return <TableCell key={column.name} {...column.attributes.reduce((acc, attr) => ({...acc, [`data-${attr}`]: true}), {})}>{value}</TableCell>;
                                    }),
                                    (
                                        <TableCell key={`${row.id}-actions`}>
                                            <div className={"flex flex-row gap-2"}>
                                                {(() =>
                                                {
                                                    if (props.options.printForm && props.options.isPrintingEnabled())
                                                    {
                                                        if (props.options.printForm?.length === 1)
                                                        {
                                                            return <PrintButton databaseId={id} row={row} columns={columns} printOptions={props.options.printForm[0]}/>;
                                                        } else
                                                        {
                                                            return <PrintDropdown databaseId={id} row={row} columns={columns} printOptions={props.options.printForm}/>;
                                                        }
                                                    }
                                                    return <></>;
                                                })()}
                                                <Button radius={"full"} className={"min-w-0 w-12 h-12"}><Icon icon="mage:dots"/></Button>
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