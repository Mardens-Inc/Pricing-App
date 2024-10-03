import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import DatabaseRecords, {Column, DatabaseData} from "../ts/DatabaseRecords.ts";
import {Button, cn, getKeyValue, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@nextui-org/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEllipsisV} from "@fortawesome/free-solid-svg-icons";
import {useSearch} from "../providers/SearchProvider.tsx";

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

    useEffect(() =>
    {
        DatabaseRecords.data(id, false)
            .then(items =>
            {
                setData(items);
                if (items.columns)
                    setColumns(items.options.columns);
                if (items.results?.items)
                    setItems(items.results?.items);
            })
            .finally(() => setIsLoading(false));
    }, []);


    return isLoading ? (<div className={"w-full h-[calc(100dvh_/_2)] min-h-40 flex justify-center items-center"}><Spinner label={"Loading database"} size={"lg"}/></div>)
        : (
            <div className={"flex flex-col gap-3"}>
                <div className={"flex flex-col gap-2 m-4"}>
                    <h1 className={"text-4xl"}>{data?.name}</h1>
                    <div className={"flex flex-row gap-3 italic opacity-50"}>
                        <p>Location: <span className={"font-bold"}>{data?.location || "Unknown"}</span></p>
                        <p>PO#: <span className={"font-bold"}>{data?.po || "Unknown"}</span></p>
                    </div>
                </div>

                <Table
                    removeWrapper
                    isStriped
                    className={"w-auto mx-8 mt-4"}
                    classNames={{
                        tr: "hover:bg-foreground/5 cursor-pointer transition-colors",
                        td: cn(
                            "data-[price]:!text-danger data-[mp]:!text-success data-[price]:!font-bold data-[mp]:!font-bold",
                            "dark:group-data-[odd=true]:before:bg-default-100/10"
                        ),
                        th: "dark:bg-background/50 backdrop-blur-md saturation-150 dark:brightness-150 mx-2"
                    }}
                    onSortChange={(descriptor) =>
                    {
                        console.log(descriptor);
                    }}
                >

                    {/*
                     group-data-[odd=true]:before:bg-default-100 group-data-[odd=true]:before:opacity-100 group-data-[odd=true]:before:-z-10 first:before:rounded-s-lg last:before:rounded-e-lg text-start group-data-[odd=true]:data-[selected=true]:before:bg-default/60 data-[price]:!text-danger data-[mp]:!text-success data-[price]:!font-bold data-[mp]:!font-bold

                     */}

                    <TableHeader>
                        {[...columns.filter(c => c.visible).map((column) =>
                            <TableColumn key={column.name}>{column.name}</TableColumn>
                        ), (<TableColumn key="actions" className={"min-w-0 w-0"}>Actions</TableColumn>)]}

                    </TableHeader>

                    <TableBody>
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

            </div>
        );
}