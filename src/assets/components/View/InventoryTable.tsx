import {Button, cn, getKeyValue, Select, SelectItem, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip} from "@nextui-org/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEllipsisV, faPrint} from "@fortawesome/free-solid-svg-icons";
import {useSearch} from "../../providers/SearchProvider.tsx";
import {useEffect, useState} from "react";
import DatabaseRecords, {Column, DatabaseOptions, PrintForm} from "../../ts/DatabaseRecords.ts";
import {useNavigate, useParams} from "react-router-dom";
import {Departments} from "../../ts/printer.ts";
import $ from "jquery";

interface InventoryTableProps
{
    onItemSelected: (id: string | null) => void;
    options: DatabaseOptions;
}

type RowValue = {
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
                        setItems(results.items);
                    else
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
                                        value = (
                                            <Select
                                                key={`${row.id}-dept-selector`}
                                                label={"Department"}
                                                placeholder={"Select a department to print"}
                                                radius={"full"}
                                                classNames={{}}
                                                onSelectionChange={selection =>
                                                {
                                                    const dept = Departments.find(i => i.id === +(
                                                        ([...selection][0] as string)
                                                            .replace(`${row.id}-`, "")
                                                            .trim()
                                                    ))?.id ?? -1;
                                                    $(`tr#${row.id}`).attr("data-department", dept);
                                                }}
                                            >
                                                {
                                                    Departments
                                                        .filter(i => i.id > 0)
                                                        .map(
                                                            dept =>
                                                                <SelectItem
                                                                    key={`${row.id}-${dept.id}`}
                                                                    value={dept.name}
                                                                    textValue={dept.name}
                                                                >
                                                                    {dept.id} - {dept.name}
                                                                </SelectItem>
                                                        )
                                                }
                                            </Select>
                                        );
                                    }

                                    return (<TableCell key={column.name} {...column.attributes.reduce((acc, attr) => ({...acc, [`data-${attr}`]: true}), {})}>{value}</TableCell>);
                                }),
                                (
                                    <TableCell key={`${row.id}-actions`}>
                                        <div className={"flex flex-row gap-2"}>
                                            {props.options["print-form"].enabled &&
                                                <Tooltip content={"Print"} classNames={{base: "pointer-events-none"}} closeDelay={0}>
                                                    <Button radius={"full"} className={"min-w-0 w-12 h-12"} onClick={() =>
                                                    {
                                                        const rowData = columns.map(c => ({value: getKeyValue(row, c.real_name), attributes: c.attributes})) as RowValue[];
                                                        PrintData(id, rowData, props.options["print-form"], +($(`tr#${row.id}`).attr("data-department") ?? -1));
                                                    }}><FontAwesomeIcon icon={faPrint}/></Button>
                                                </Tooltip>
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

function PrintData(id: string, values: RowValue[], printOptions: PrintForm, department?: number)
{
    const uri: URL = new URL("https://pricetagger.mardens.com/api/");

    let price = values.find(v => v.attributes.includes("price"));
    if (price) uri.searchParams.append("price", price.value.replace(/[^0-9.]/g, ""));

    let mp = values.find(v => v.attributes.includes("mp"));
    if (mp) uri.searchParams.append("mp", mp.value.replace(/[^0-9.]/g, ""));

    if (printOptions.department && printOptions.department.id > 0) uri.searchParams.append("department", printOptions.department.id.toString());
    if (printOptions.label) uri.searchParams.append("label", printOptions.label);
    if (printOptions.year) uri.searchParams.append("year", printOptions.year);
    if (printOptions["show-price-label"]) uri.searchParams.append("showPriceLabel", "");

    const databasePrintYear = localStorage.getItem(`print-year-${id}`);
    const databasePrintColor = localStorage.getItem(`print-color-${id}`);
    if (databasePrintYear) uri.searchParams.append("year", databasePrintYear);
    if (databasePrintColor) uri.searchParams.append("color", databasePrintColor);

    if (department && department > 0) uri.searchParams.append("department", department.toString());

    uri.searchParams.append("v", Date.now().toString()); // Add a version to prevent caching

    window.open(uri.toString(), "_blank", "toolbar=no,scrollbars=no,resizable=no,width=1020,height=667");
}