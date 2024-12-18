import {Input, Select, SelectItem} from "@nextui-org/react";
import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {PrintLabelColors} from "../../ts/printer.ts";
import ExtendedSwitch from "../Extends/ExtendedSwitch.tsx";

export default function PrintLabelExtraOptions({showColor = true, showYear = true}: { showColor?: boolean, showYear?: boolean })
{
    const id = useParams().id ?? "";
    const [year, setYear] = useState<string>(localStorage.getItem(`print-year-${id}`) || "");
    const [color, setColor] = useState<string | null>(localStorage.getItem(`print-color-${id}`));
    const [autoPrintLabel, setAutoPrintLabel] = useState(localStorage.getItem(`print-auto-print-${id}`) === "true" || false);

    useEffect(() =>
    {
        localStorage.setItem(`print-auto-print-${id}`, autoPrintLabel.toString());
    }, [autoPrintLabel]);

    useEffect(() =>
    {
        if (!year) localStorage.removeItem(`print-year-${id}`);
        else localStorage.setItem(`print-year-${id}`, year);
    }, [year]);

    useEffect(() =>
    {
        console.log(color);
        if (!color || color === "No Color") localStorage.removeItem(`print-color-${id}`);
        else localStorage.setItem(`print-color-${id}`, color);
    }, [color]);


    return (

        <div className={"ml-auto mr-8 w-1/2 flex flex-row items-center justify-end gap-3"}>
            {showColor &&
                <Select
                    key={"page-color-selector"}
                    label={"Print Color"}
                    placeholder={"Select a print color"}
                    radius={"full"}
                    selectedKeys={[color || ""]}
                    onSelectionChange={(value) => setColor([...value][0] as string)}
                >
                    {
                        PrintLabelColors.map(
                            (color) => (
                                <SelectItem key={color} textValue={color} value={color}>{color}</SelectItem>
                            )
                        )
                    }
                </Select>
            }

            {showYear &&

                <Input
                    label={"Year"}
                    placeholder={"Enter the print year"}
                    radius={"full"}
                    value={year}
                    onValueChange={(value) => setYear(value.replace(/[^0-9]/g, ""))}
                    maxLength={2}
                />
            }

            <ExtendedSwitch
                label={"Auto Print"}
                description={"Automatically print labels when scanning a barcode."}
                toggle={autoPrintLabel}
                onToggle={setAutoPrintLabel}
            />
        </div>


    );
}
