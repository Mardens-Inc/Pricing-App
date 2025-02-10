import {Button, cn, Tooltip} from "@heroui/react";
import {Icon} from "@iconify/react";
import {useState} from "react";

type PrintButtonProps = {
    id: string;
}
export default function AutoPrintButton(props: PrintButtonProps)
{
    const [autoPrintLabel, setAutoPrintLabel] = useState(localStorage.getItem(`print-auto-print-${props.id}`) === "true" || false);
    return (
        <Tooltip content={`${autoPrintLabel ? "Disable" : "Enable"} Auto Print Label`}>
            <Button
                radius={"full"}
                color={autoPrintLabel ? "primary" : "default"}
                className={cn(
                    "h-12 max-w-12 w-32 aspect-square p-0 min-w-12 text-[1rem] !transition-[max-width] duration-200",
                    "data-[hover]:max-w-32 data-[show=true]:max-w-32"
                )}
                onPress={() =>
                {

                    localStorage.setItem(`print-auto-print-${props.id}`, (!autoPrintLabel).toString());
                    setAutoPrintLabel(prev => !prev);
                }}
                data-show={autoPrintLabel}
            >
                <Icon icon={"mage:printer-fill"}/>
                <span
                    className={cn(
                        "opacity-0 hidden !transition-all duration-200",
                        "group-data-[hover]:block group-data-[hover]:opacity-100",
                        "data-[show=true]:block data-[show=true]:opacity-100"
                    )}
                    data-show={autoPrintLabel}
                >
                    Auto Print
                </span>
            </Button>
        </Tooltip>
    );
}