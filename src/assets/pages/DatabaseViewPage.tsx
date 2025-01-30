import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {useDatabaseView} from "../providers/DatabaseViewProvider.tsx";
import {setTitle} from "../../main.tsx";
import {Image, Spinner} from "@heroui/react";
import InventoryingForm from "../components/View/InventoryingForm.tsx";
import InventoryTable from "../components/View/InventoryTable.tsx";
import PrintLabelExtraOptions from "../components/View/PrintLabelExtraOptions.tsx";
import {useAuth} from "../providers/AuthProvider.tsx";
import Location from "../ts/data/Location.ts";
import Options from "../ts/data/Options.ts";
import IconData from "../ts/data/Icon.ts";

export default function DatabaseViewPage()
{
    const id = useParams().id;
    const navigate = useNavigate();
    const [location, setLocation] = useState<Location | null | undefined>(null);
    const [options, setOptions] = useState<Options | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const databaseView = useDatabaseView();
    const {isLoggedIn} = useAuth();

    if (!id)
    {
        console.error("No id provided for DatabaseViewPage");
        navigate("/");
        return <></>;
    }


    setTitle(location?.name || "Database");

    useEffect(() =>
    {
        setIsLoading(true);
        // Move the state update to useEffect to ensure it's not done during render
        databaseView.setDatabaseId(id);

        Location.get(id)
            .then(setLocation)
            .finally(() => setIsLoading(false));

        Options.get(id)
            .then(setOptions);

    }, [id, databaseView]);


    return isLoading ? (<div className={"w-full h-[calc(100dvh_/_2)] min-h-40 flex justify-center items-center"}><Spinner label={"Loading database"} size={"lg"}/></div>)
        : (
            <div className={"flex flex-col gap-3"}>
                <div className={"flex flex-row mt-5 ml-8"}>
                    <LocationIcon location={location!}/>
                    <div className={"flex flex-col gap-2 m-4"}>
                        <h1 className={"text-4xl"}>{location?.name}</h1>
                        <div className={"flex flex-row gap-3 italic opacity-50"}>
                            <p>Location: <span className={"font-bold"}>{location?.location || "Unknown"}</span></p>
                            <p>PO#: <span className={"font-bold"}>{location?.po || "Unknown"}</span></p>
                        </div>
                    </div>
                    <PrintLabelExtraOptions
                        showYear={options?.showYearInput ?? false}
                        showColor={options?.showColorDropdown ?? false}
                        isPrintingEnabled={options?.isPrintingEnabled() ?? false}
                    />
                </div>
                <div className={"flex flex-row"}>

                    {options &&
                        <InventoryTable onItemSelected={console.log} options={options}/>
                    }

                    {isLoggedIn && options?.inventorying?.allowAdditions && (
                        <InventoryingForm columns={[]} onSubmit={data =>
                        {
                            console.log("Submitted data: ", data);
                        }}/>
                    )}

                </div>
            </div>
        );
}

function LocationIcon(props: { location: Location })
{
    const [icon, setIcon] = useState<IconData | undefined>(undefined);
    useEffect(() =>
    {
        if (!props.location.image) return;
        IconData.get(props.location.image).then(setIcon);
    }, []);

    if (!props.location.image || !icon)
        return <></>;

    return <Image src={icon.url} alt={props.location.name} width={96} className={"bg-foreground/10"}/>;
}
