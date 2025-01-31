import {Button, Input, Select, SelectItem, Tooltip} from "@heroui/react";
import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {PrintLabelColors} from "../../ts/printer.ts";
import {Icon} from "@iconify/react";

export default function PrintLabelExtraOptions({showColor = true, showYear = true, isPrintingEnabled}: { showColor?: boolean, showYear?: boolean, isPrintingEnabled?: boolean })
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
        console.log("setting print color: ", color);
        if (!color || color === "No Color") localStorage.removeItem(`print-color-${id}`);
        else localStorage.setItem(`print-color-${id}`, color);
    }, [color]);


    return (

        <div className={"flex flex-row items-center justify-end gap-3"}>
            {showColor &&
                <Select
                    key={"page-color-selector"}
                    label={"Print Color"}
                    placeholder={"Select a print color"}
                    radius={"full"}
                    selectedKeys={[color || ""]}
                    onSelectionChange={(value) => setColor([...value][0] as string)}
                    className={"w-auto min-w-[200px]"}
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
                    className={"w-[170px] min-w-[170px]"}
                />
            }

            {isPrintingEnabled &&
                <Tooltip content={`${autoPrintLabel ? "Disable" : "Enable"} Auto Print Label`}>
                    <Button
                        radius={"full"}
                        color={autoPrintLabel ? "primary" : "default"}
                        className={"h-12 w-12 aspect-square p-0 min-w-12 text-[1rem]"}
                        onPress={() => setAutoPrintLabel(prev => !prev)}
                    >
                        <Icon icon={"mage:printer-fill"}/>
                    </Button>
                </Tooltip>
                // <ExtendedSwitch
                //     label={"Auto Print"}
                //     isSelected={autoPrintLabel}
                //     onValueChange={setAutoPrintLabel}
                //     classNames={{
                //         base: "rounded-full h-14"
                //     }}
                // />
            }
        </div>


    );
}
