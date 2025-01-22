import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {useDatabaseView} from "../providers/DatabaseViewProvider.tsx";
import {setTitle} from "../../main.tsx";
import {Image, Spinner} from "@heroui/react";
import InventoryingForm from "../components/View/InventoryingForm.tsx";
import InventoryTable from "../components/View/InventoryTable.tsx";
import Logo from "../images/Logo.svg.tsx";
import PrintLabelExtraOptions from "../components/View/PrintLabelExtraOptions.tsx";
import {useAuth} from "../providers/AuthProvider.tsx";
import Location from "../ts/data/Location.ts";

export default function DatabaseViewPage()
{
    const id = useParams().id;
    const navigate = useNavigate();

    const {isLoggedIn} = useAuth();

    if (!id)
    {
        console.error("No id provided for DatabaseViewPage");
        navigate("/");
        return <></>;
    }

    const [data, setData] = useState<Location | null | undefined>(null);
    const [isLoading, setIsLoading] = useState(true);


    const databaseView = useDatabaseView();
    setTitle(data?.name || "Database");

    useEffect(() =>
    {
        setIsLoading(true);
        // Move the state update to useEffect to ensure it's not done during render
        databaseView.setDatabaseId(id);

        Location.get(id)
            .then(setData)
            .finally(() => setIsLoading(false));

    }, [id, databaseView]);


    return isLoading ? (<div className={"w-full h-[calc(100dvh_/_2)] min-h-40 flex justify-center items-center"}><Spinner label={"Loading database"} size={"lg"}/></div>)
        : (
            <div className={"flex flex-col gap-3"}>
                <div className={"flex flex-row mt-5 ml-8"}>
                    {data?.image === "" ? <Logo size={96}/> : <Image src={data?.image} width={96}/>}
                    <div className={"flex flex-col gap-2 m-4"}>
                        <h1 className={"text-4xl"}>{data?.name}</h1>
                        <div className={"flex flex-row gap-3 italic opacity-50"}>
                            <p>Location: <span className={"font-bold"}>{data?.location || "Unknown"}</span></p>
                            <p>PO#: <span className={"font-bold"}>{data?.po || "Unknown"}</span></p>
                        </div>
                    </div>
                    <PrintLabelExtraOptions
                        showYear={data?.options["print-form"]["show-year-dropdown"] ?? false}
                        showColor={data?.options["print-form"]["show-color-dropdown"] ?? false}
                        isPrintingEnabled={data?.options["print-form"]["enabled"] ?? false}
                    />
                </div>
                <div className={"flex flex-row"}>

                    <InventoryTable onItemSelected={console.log} options={data?.options ?? ({} as DatabaseOptions)}/>

                    {isLoggedIn && data?.options["allow-inventorying"] && (
                        <InventoryingForm columns={data?.options.columns} onSubmit={data =>
                        {
                            console.log(data);
                        }}/>
                    )}

                </div>
            </div>
        );
}
