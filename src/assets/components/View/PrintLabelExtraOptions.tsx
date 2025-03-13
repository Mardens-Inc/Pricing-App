import {Input, Select, SelectItem, Tab, Tabs} from "@heroui/react";
import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {PrintLabelColors} from "../../ts/printer.ts";
import {DepartmentDropdown} from "./TableComponents/DepartmentDropdown.tsx";
import {PrintForm} from "../../ts/data/Options.ts";
import AutoPrintButton from "../Extends/AutoPrintButton.tsx";

type PrintLabelExtraOptionsProps = {
    showColor?: boolean,
    showYear?: boolean,
    showDepartment?: boolean,
    isPrintingEnabled?: boolean,
    printOptions?: PrintForm[]
};

export default function PrintLabelExtraOptions(props: PrintLabelExtraOptionsProps)
{
    const {showColor, showYear, showDepartment, isPrintingEnabled, printOptions} = props;
    const id = useParams().id ?? "";
    const [year, setYear] = useState<string>(localStorage.getItem(`print-year-${id}`) || "");
    const [color, setColor] = useState<string | null>(localStorage.getItem(`print-color-${id}`));
    const [selectedPrintOption, setSelectedPrintOption] = useState<string>(localStorage.getItem(`print-option-${id}`) || printOptions?.[0].hint || "");


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
            {printOptions && printOptions?.length > 1 &&
                <div className={"flex flex-col gap-1"}>
                    <p>Print Option</p>
                    <Tabs
                        selectedKey={selectedPrintOption}
                        onSelectionChange={key =>
                        {
                            setSelectedPrintOption(key as string);
                            localStorage.setItem(`print-option-${id}`, key as string);
                        }}
                    >
                        {printOptions.map(option => (
                            <Tab key={option.hint} title={option.hint}/>
                        ))}
                    </Tabs>
                    <p className={"text-tiny italic opacity-50"}>This controls the print button.</p>
                </div>
            }
            {showDepartment && <DepartmentDropdown id={id}/>}
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
                                <SelectItem key={color} textValue={color}>{color}</SelectItem>
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

            {isPrintingEnabled && <AutoPrintButton id={id}/>}
        </div>


    );
}
