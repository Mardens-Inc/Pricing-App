import ExtendedSwitch from "../Extends/ExtendedSwitch.tsx";
import {useState} from "react";
import {Input, Select, SelectItem} from "@nextui-org/react";
import {Departments, PrintLabelColors, PrintLabels, PrintLabelSize} from "../../ts/printer.ts";

export default function CanPrintLabel()
{
    const [canPrintLabel, setCanPrintLabel] = useState<boolean>(false);
    const [department, setDepartment] = useState<number>(0);
    const [label, setLabel] = useState<string>("");
    const [color, setColor] = useState<string>("");
    const [year, setYear] = useState<string>("");
    const [sticker, setSticker] = useState<PrintLabelSize | null>(null);
    const [showPriceLabel, setShowPriceLabel] = useState<boolean>(false);
    return (
        <>
            <ExtendedSwitch
                label={"Can Print Label?"}
                description={"Allow users to print labels for this database."}
                toggle={canPrintLabel}
                onToggle={setCanPrintLabel}
                className={"max-w-full"}
            />

            {canPrintLabel && (
                <div className={"bg-foreground/10 p-4 rounded-md flex flex-col gap-4"}>
                    <div className={"flex flex-row gap-2"}>
                        <Select
                            label={"Department"}
                            placeholder={"Select the department to print labels"}
                            radius={"full"}
                            autoComplete={"off"}
                            value={department}
                            onSelectionChange={(e) => setDepartment(parseInt([...e][0] as string))}

                        >
                            {Departments.map((department) => (
                                <SelectItem key={department.id} value={department.id} description={`Department ${department.id}`}>{department.name}</SelectItem>
                            ))}
                        </Select>

                        <Select
                            label={"Label"}
                            placeholder={"Select the label to print"}
                            radius={"full"}
                            autoComplete={"off"}
                            value={label}
                            onSelectionChange={(e) => setLabel([...e][0] as string)}
                        >
                            {PrintLabels.map((label) => (
                                <SelectItem key={label} value={label}>{label}</SelectItem>
                            ))}
                        </Select>
                    </div>
                    <div className={"flex flex-row gap-2"}>
                        <Select
                            label={"Color"}
                            placeholder={"Select the color of the label"}
                            radius={"full"}
                            autoComplete={"off"}
                            value={color}
                            onSelectionChange={(e) => setColor([...e][0] as string)}

                        >
                            {PrintLabelColors.map((color) => (
                                <SelectItem key={color} value={color}>{color}</SelectItem>
                            ))}
                        </Select>

                        <Input
                            label={"Year"}
                            placeholder={"Enter the year to print labels"}
                            radius={"full"}
                            autoComplete={"off"}
                            value={year}
                            onValueChange={(e) => setYear(e.replace(/\D/g, ""))}
                            maxLength={2}
                        />
                    </div>
                    <div className={"flex flex-row gap-2"}>
                        <Select
                            label={"Sticker"}
                            placeholder={"Select the color of the label"}
                            radius={"full"}
                            autoComplete={"off"}
                            value={sticker?.name}
                            onSelectionChange={(e) => setSticker(PrintLabelSize.find((size) => size.name === [...e][0] as string) ?? null)}

                        >
                            {PrintLabelSize.map((size) => (
                                <SelectItem key={size.name} value={size.name}>{size.name} ({size.width} x {size.height})</SelectItem>
                            ))}
                        </Select>

                        <ExtendedSwitch
                            label={"Show Price Label"}
                            description={"Show the price label on the printed label."}
                            toggle={showPriceLabel}
                            onToggle={setShowPriceLabel}
                            className={"max-w-full"}
                        />

                    </div>
                </div>
            )}
        </>
    );
}