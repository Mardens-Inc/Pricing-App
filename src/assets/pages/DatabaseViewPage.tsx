import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import DatabaseRecords, {Column, DatabaseData} from "../ts/DatabaseRecords.ts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEllipsisV} from "@fortawesome/free-solid-svg-icons";
import {useSearch} from "../providers/SearchProvider.tsx";
import {useDatabaseView} from "../providers/DatabaseViewProvider.tsx";
import {setTitle} from "../../main.tsx";
import {Button, cn, getKeyValue, Image, Input, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@nextui-org/react";

export default function DatabaseViewPage()
{
    const id = useParams().id;
    const navigate = useNavigate();
    if (!id)
    {
        console.error("No id provided for DatabaseViewPage");
        navigate("/");
        return <></>;
    }

    const {search} = useSearch();
    const [items, setItems] = useState<any[]>([]);
    const [columns, setColumns] = useState<Column[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<DatabaseData | null>(null);
    const [searchColumns, setSearchColumns] = useState<string[]>([]);
    const [primaryKey, setPrimaryKey] = useState<string>("");

    let abortController = new AbortController();
    let signal = abortController.signal;

    const databaseView = useDatabaseView();
    setTitle(data?.name || "Database");

    useEffect(() =>
    {
        // Move the state update to useEffect to ensure it's not done during render
        databaseView.setDatabaseId(id);
        return () =>
        {
            // Clean up on component unmount
            abortController.abort();
        };
    }, [id, databaseView]);


    useEffect(() =>
    {
        if (!search)
        {
            // Perform the main data fetch without search
            DatabaseRecords.data(id, false)
                .then(items =>
                {
                    setData(items);
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


    return isLoading ? (<div className={"w-full h-[calc(100dvh_/_2)] min-h-40 flex justify-center items-center"}><Spinner label={"Loading database"} size={"lg"}/></div>)
        : (
            <div className={"flex flex-col gap-3"}>
                <div className={"flex flex-row mt-5 ml-8"}>
                    <Image src={data?.image} width={96}/>
                    <div className={"flex flex-col gap-2 m-4"}>
                        <h1 className={"text-4xl"}>{data?.name}</h1>
                        <div className={"flex flex-row gap-3 italic opacity-50"}>
                            <p>Location: <span className={"font-bold"}>{data?.location || "Unknown"}</span></p>
                            <p>PO#: <span className={"font-bold"}>{data?.po || "Unknown"}</span></p>
                        </div>
                    </div>
                </div>
                <div className={"flex flex-row"}>

                    <Table
                        removeWrapper
                        isStriped
                        isHeaderSticky
                        className={"w-auto mx-8 mt-4 grow"}
                        classNames={{
                            td: cn(
                                "data-[price]:!text-danger data-[mp]:!text-success data-[price]:!font-bold data-[mp]:!font-bold",
                                "dark:group-data-[odd=true]:before:bg-default-100/10"
                            ),
                            th: "dark:bg-background/50 backdrop-blur-md saturation-150 dark:brightness-150 mx-2",
                            base: "max-h-[calc(100dvh_-_230)] overflow-y-auto",
                        }}
                        onSortChange={(descriptor) =>
                        {
                            console.log(descriptor);
                        }}

                    >

                        <TableHeader>
                            {[...columns.filter(c => c.visible).map((column) =>
                                <TableColumn key={column.name}>{column.name}</TableColumn>
                            ), (<TableColumn key="actions" className={"min-w-0 w-0"}>Actions</TableColumn>)]}

                        </TableHeader>

                        <TableBody emptyContent={<p>No Results Found!</p>}>
                            {items.map((row) =>
                                <TableRow key={row.id}>


                                    {
                                        [...columns.filter(c => c.visible).map((column) =>
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

                                            return (<TableCell key={column.name} {...column.attributes.reduce((acc, attr) => ({...acc, [`data-${attr}`]: true}), {})}>{value}</TableCell>);
                                        }), (
                                            <TableCell key={`${row.id}-actions`}>
                                                <div className={"flex flex-row gap-2"}>
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

                    {data?.options["allow-inventorying"] && (
                        <div className={"min-w-[200px] w-1/3 max-w-[500px] flex flex-col gap-4 mr-6"}>
                            <h1>Inventorying</h1>
                            {data?.options.columns.filter(i => !i.attributes.includes("readonly")).map((column) => (
                                <>
                                    <Input
                                        key={column.name}
                                        label={column.name}
                                        placeholder={column.name}
                                        type={"text"}
                                        radius={"full"}
                                    />
                                </>
                            ))}
                            <Button radius={"full"} color={"primary"} className={"w-1/2 mx-auto"}>Update</Button>
                        </div>
                    )}

                </div>
            </div>
        );
}
