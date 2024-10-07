import {useNavigate, useParams} from "react-router-dom";
import {Button, Input, Link} from "@nextui-org/react";
import IconList from "../components/Options/IconList.tsx";
import FileUploadInput from "../components/Options/FileUploadInput.tsx";
import {useAuth} from "../providers/AuthProvider.tsx";
import {isProduction} from "../../main.tsx";
import ColumnsList from "../components/Options/ColumnsList.tsx";
import AllowInventorying from "../components/Options/AllowInventorying.tsx";
import CanPrintLabel from "../components/Options/CanPrintLabel.tsx";
import ExtendedSwitch from "../components/Extends/ExtendedSwitch.tsx";
import {useEffect, useState} from "react";
import DatabaseRecords, {Column, DatabaseData} from "../ts/DatabaseRecords.ts";

export default function DatabaseOptionsPage()
{
    const navigate = useNavigate();
    const {isLoggedIn, auth} = useAuth();
    const id = useParams().id;
    const [options, setOptions] = useState<DatabaseData | null>(null);
    const [name, setName] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [po, setPO] = useState<string>("");
    const [image, setImage] = useState<string>("");
    const [columns, setColumns] = useState<Column[]>([]);

    if (isProduction)
    {
        if (!isLoggedIn || !auth.getUserProfile().admin)
        {
            navigate("/");
            return <></>;
        }
    }

    const isNew: boolean = !id; // If the id is not null, then it is not a new database.

    if (!isNew)
    {
        useEffect(() =>
        {
            DatabaseRecords.data(id!, true).then(data =>
            {
                setOptions(data);
                setName(data.name);
                setLocation(data.location);
                setPO(data.po);
                setImage(data.image);
                setColumns(data.options.columns);
                console.log("Loading database options: ", data);
            });
        }, []);
    }


    return (
        <div className={"flex flex-col"}>
            <div className={"flex flex-col pb-[128px] mx-8 gap-4"}>
                <h1 className={"text-3xl m-4 font-bold"}>{isNew ? "New Database" : "Edit Database"}</h1>
                <FileUploadInput/>
                <IconList url={image}/>
                <div className={"flex flex-col gap-4"}>
                    <Input
                        label={"Database Name"}
                        placeholder={"Enter the name of the database"}
                        radius={"full"}
                        autoComplete={"off"}
                        value={name}
                        onValueChange={setName}
                    />
                    <div className={"flex flex-row gap-4"}>
                        <Input
                            label={"Location"}
                            placeholder={"Enter the location of the database"}
                            radius={"full"}
                            autoComplete={"off"}
                            value={location}
                            onValueChange={setLocation}
                        />
                        <Input
                            label={"Database PO#"}
                            placeholder={"Enter the PO# of the database"}
                            radius={"full"}
                            autoComplete={"off"}
                            value={po}
                            onValueChange={setPO}
                        />
                    </div>
                </div>

                <ColumnsList columns={columns}/>
                <h3 className={"text-2xl"}>Extra Options</h3>
                <AllowInventorying/>
                <CanPrintLabel/>
                <ExtendedSwitch
                    label={"Enable voice search?"}
                    description={"Allow users to search using voice commands."}
                    className={"max-w-full"}
                />

            </div>
            <div className={"flex flex-row items-center justify-end gap-2 fixed bottom-0 h-20 w-full pr-4 z-10 backdrop-blur-lg backdrop-saturate-150 bg-background/70"}>
                <Button radius={"full"} color={"primary"}>Save</Button>
                <Button radius={"full"} as={Link} href={isNew ? "/" : `/${id}`}>Cancel</Button>
            </div>
        </div>
    );
}