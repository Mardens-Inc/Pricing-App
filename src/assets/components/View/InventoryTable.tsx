import {useEffect, useMemo, useState} from "react";
import {Button, cn, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, getKeyValue, SortDescriptor, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@heroui/react";
import {useSearch} from "../../providers/SearchProvider";
import {useNavigate, useParams} from "react-router-dom";
import PrintButton from "./TableComponents/PrintButton";
import $ from "jquery";
import {Icon} from "@iconify/react";
import Column from "../../ts/data/Column";
import Options from "../../ts/data/Options";
import Location, {InventoryRecord} from "../../ts/data/Location";
import {useNewRecordModal} from "../../providers/NewRecordModalProvider";
import {useAuth} from "../../providers/AuthProvider.tsx";

interface InventoryTableProps
{
    onItemSelected: (id: string | null) => void;
    options: Options;
}

export type RowValue = {
    value: string;
    attributes: string[];
};

export default function InventoryTable(props: InventoryTableProps)
{
    const id = useParams().id ?? "";
    const navigate = useNavigate();
    const {search} = useSearch();
    const [items, setItems] = useState<InventoryRecord[]>([]);
    const [location, setLocation] = useState<Location | undefined>(undefined);
    const [columns, setColumns] = useState<Column[]>([]);
    const {isLoggedIn} = useAuth();

    const [searchColumns, setSearchColumns] = useState<string[]>([]);
    const [_primaryKey, setPrimaryKey] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "last_modified_date",
        direction: "ascending"
    });

    const {edit} = useNewRecordModal();

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
                Column.all(id).then((columns) =>
                {
                    setColumns(columns.filter((i) => i.visible));
                    setSearchColumns(
                        columns
                            .filter((i) => i.attributes.includes("search"))
                            .flatMap((i) => i.name)
                    );
                    setPrimaryKey(
                        columns.find((i) => i.attributes.includes("primary"))?.name ?? "id"
                    );
                });

                abortController.abort();
                abortController = new AbortController();
                location
                    .records(
                        {
                            limit: 20,
                            sort: sortDescriptor.column.toString(),
                            ascending: sortDescriptor.direction === "ascending",
                            offset: 0
                        },
                        abortController.signal
                    )
                    .then((i) => i.data)
                    .then(setItems)
                    .finally(() => setIsLoading(false));
            } else
            {
                abortController.abort();
                abortController = new AbortController();
                location
                    .search(
                        {
                            limit: 20,
                            sort: sortDescriptor.column.toString(),
                            ascending: sortDescriptor.direction === "ascending",
                            offset: 0,
                            search: search,
                            columns: searchColumns
                        },
                        abortController.signal
                    )
                    .then((i) => i.data)
                    .then(setItems)
                    .finally(() => setIsLoading(false));
            }
        }

        return () =>
        {
            // Abort the fetch on component unmount or dependency change
            abortController.abort();
        };
    }, [search, location, sortDescriptor, isLoggedIn]);

    useEffect(() =>
    {
        if (
            localStorage.getItem(`print-auto-print-${id}`) === "true" &&
            items?.length === 1
        )
        {
            const firstPrintButton = $(`button[data-print-form]`)[0] as HTMLButtonElement;
            console.log("Auto Printing", firstPrintButton);
            if (firstPrintButton)
            {
                firstPrintButton.click();
            }
        }
    }, [items]);


    // Memoized Table Rows
    const rows = useMemo(() =>
    {
        if (!items || !items.length) return null;
        return items.map((row: InventoryRecord) => (
            <TableRow key={row.id} id={row.id} aria-labelledby={`row-${row.id}`}>
                {[
                    ...columns
                        .filter((c) => c.visible)
                        .map((column) =>
                        {
                            let value = getKeyValue(row, column.name);
                            if (!value)
                            {
                                value = "-";
                            } else
                            {
                                if (
                                    column.attributes.includes("price") ||
                                    column.attributes.includes("mp")
                                )
                                {
                                    value = `$${(+value.replace(/[^0-9.]/g, "")).toFixed(2)}`;
                                }
                            }

                            return (
                                <TableCell
                                    id={`${row.id}-${column.name.replace(/\s/g, "").toLowerCase()}`}
                                    key={column.name}
                                    {...column.attributes.reduce(
                                        (acc, attr) => ({...acc, [`data-${attr}`]: true}),
                                        {}
                                    )}
                                    aria-label={column.displayName}
                                >
                                    {value}
                                </TableCell>
                            );
                        }),
                    <TableCell key={`${row.id}-actions`}>
                        <div className={"flex flex-row gap-2"}>
                            {isLoggedIn &&
                                <Button
                                    radius={"full"}
                                    className={
                                        "h-12 w-12 aspect-square p-0 min-w-0 text-[1rem] my-auto"
                                    }
                                    onPress={async () =>
                                    {
                                        const record = await location?.single(row.id);
                                        if (record)
                                        {
                                            edit(record, (item) =>
                                            {
                                                for (const c of Object.keys(row) as (keyof InventoryRecord)[])
                                                {
                                                    const column = c as string;
                                                    const new_record = item[column];
                                                    const old_record = row[column];
                                                    const columnElement = $(`#${row.id}-${column.replace(/\s/g, "").toLowerCase()}`);
                                                    if (columnElement.length > 0 && new_record !== old_record)
                                                    {
                                                        columnElement.html(`<span>${new_record}</span>`);
                                                    }
                                                }
                                            });
                                        }
                                    }}
                                >
                                    <Icon icon={"mage:edit-fill"}/>
                                </Button>
                            }
                            {(() =>
                            {
                                if (props.options.printForm && props.options.isPrintingEnabled())
                                {
                                    return (
                                        <PrintButton
                                            databaseId={id}
                                            row={row}
                                            columns={columns}
                                            printOptions={props.options.printForm.find(form => form.hint === localStorage.getItem(`print-option-${id}`)) ?? props.options.printForm[0]}
                                        />
                                    );
                                }
                                return <></>;
                            })()}

                            {isLoggedIn &&
                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button
                                            radius={"full"}
                                            className={
                                                "h-12 w-12 aspect-square p-0 min-w-0 text-[1rem] my-auto"
                                            }
                                        >
                                            <Icon icon="mage:dots"/>
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu>
                                        <DropdownSection title={"record options"} showDivider>
                                            <DropdownItem key={`history-${id}-${row.id}`} endContent={<Icon icon="mage:clock-fill"/>}>
                                                View History
                                            </DropdownItem>
                                            <DropdownItem key={`copy-${id}-${row.id}`} endContent={<Icon icon="mage:copy-fill"/>}>
                                                Duplicate Record
                                            </DropdownItem>

                                        </DropdownSection>
                                        <DropdownSection title={"danger zone"} className={"text-danger"} key={"danger-zone"}>
                                            <DropdownItem key={`delete-${id}-${row.id}`} endContent={<Icon icon="mage:trash-3-fill"/>} color={"danger"}>
                                                Delete Record
                                            </DropdownItem>
                                        </DropdownSection>
                                    </DropdownMenu>
                                </Dropdown>

                            }

                        </div>
                    </TableCell>
                ]}
            </TableRow>
        ));
    }, [items, columns, edit, props.options, id]);
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
    // Render Table
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
                base: "max-h-[calc(100dvh_-_260px)] overflow-y-auto min-h-[250px]"
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
            aria-label="Inventory Table"
        >
            <TableHeader>
                {[
                    ...columns
                        .filter((c) => c.visible)
                        .map((column) => (
                            <TableColumn key={column.name} allowsSorting>
                                {column.displayName}
                            </TableColumn>
                        )),
                    <TableColumn key="actions" className={"min-w-0 w-0"}>
                        Actions
                    </TableColumn>
                ]}
            </TableHeader>
            <TableBody
                emptyContent={<p>No Results Found!</p>}
                isLoading={isLoading}
                loadingContent={<Spinner size={"lg"}/>}
                items={items}
                aria-label="Inventory Table Body"
            >
                {rows as any}
            </TableBody>
        </Table>
    );
}