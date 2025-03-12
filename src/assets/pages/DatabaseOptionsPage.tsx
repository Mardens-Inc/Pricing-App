import {useNavigate, useParams} from "react-router-dom";
import IconList from "../components/Options/IconList.tsx";
import FileUploadInput from "../components/Options/FileUploadInput.tsx";
import {useAuth} from "../providers/AuthProvider.tsx";
import {isProduction, setTitle} from "../../main.tsx";
import ColumnsList from "../components/Options/ColumnsList.tsx";
import AllowInventorying from "../components/Options/AllowInventorying.tsx";
import CanPrintLabel from "../components/Options/CanPrintLabel.tsx";
import {useEffect, useState} from "react";
import {Button, Input, Link} from "@heroui/react";
import Location from "../ts/data/Location.ts";
import Options from "../ts/data/Options.ts";
import Column from "../ts/data/Column.ts";

export default function DatabaseOptionsPage() {
    const navigate = useNavigate();
    const {isLoggedIn, auth} = useAuth();
    const id = useParams().id;
    const [location, setLocation] = useState<Location | null>(null);
    const [_options, setOptions] = useState<Options | null>(null);
    const [name, setName] = useState<string>("");
    const [locationStr, setLocationStr] = useState<string>("");
    const [po, setPO] = useState<string>("");
    const [image, setImage] = useState<string>("");
    const [columns, setColumns] = useState<Column[]>([]);

    if (id) {
        setTitle(location?.name ? `Edit ${location.name}` : "Edit Database");
    } else {
        setTitle("New Database");
    }

    if (isProduction) {
        if (!isLoggedIn || !auth.getUserProfile().admin) {
            navigate("/");
            return <></>;
        }
    }

    const isNew: boolean = !id;

    useEffect(() => {
        if (!isNew) {
            // Load location data
            Location.get(id!)
                .then(loc => {
                    if (loc) {
                        setLocation(loc);
                        setName(loc.name);
                        setLocationStr(loc.location);
                        setPO(loc.po);
                        setImage(loc.image);
                    }
                });

            // Load options data
            Options.get(id!)
                .then(opt => {
                    if (opt) {
                        setOptions(opt);
                    }
                });

            // Load columns
            Column.all(id!)
                .then(cols => {
                    setColumns(cols);
                });
        }
    }, [id]);

    const handleSave = async () => {
        // Save implementation here
        // You'll need to create new Location and Options objects
        // and call their respective save methods
    };

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
                            value={locationStr}
                            onValueChange={setLocationStr}
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
            </div>
            <div className={"flex flex-row items-center justify-end gap-2 fixed bottom-0 h-20 w-full pr-4 z-10 backdrop-blur-lg backdrop-saturate-150 bg-background/70"}>
                <Button radius={"full"} color={"primary"} onPress={handleSave}>Save</Button>
                <Button radius={"full"} as={Link} href={`/inv/${id}`}>Cancel</Button>
            </div>
        </div>
    );
}