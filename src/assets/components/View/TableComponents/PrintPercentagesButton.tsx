import {Badge, Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, getKeyValue, Tooltip} from "@heroui/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPrint} from "@fortawesome/free-solid-svg-icons";
import PrintButton, {PrintButtonProps} from "./PrintButton.tsx";
import {RowValue} from "../InventoryTable.tsx";
import {OpenPrintWindow} from "../../../ts/printer.ts";
import $ from "jquery";

export default function PrintPercentagesButton(props: PrintButtonProps)
{
    if (!props.printOptions.percentages || props.printOptions.percentages.length === 0) return <PrintButton {...props}/>;
    const rowData = props.columns.map(c => ({value: getKeyValue(props.row, c.real_name), attributes: c.attributes})) as RowValue[];
    let price = +((rowData.find(v => v.attributes.includes("price")) ?? {}).value ?? 0);
    let pricePercentage = props.printOptions.percentages.map(i => +i).map(p =>
    {
        return {percentage: p, price: price * (1 - p / 100)};
    });

    return (
        <Dropdown>
            <DropdownTrigger>
                <div>
                    <Badge content={"%"} color={"primary"} showOutline={false}>
                        <Tooltip content={"Show Print Options"} classNames={{base: "pointer-events-none"}} closeDelay={0}>
                            <Button
                                radius={"full"}
                                className={"min-w-0 w-12 h-12"}
                                onPressStart={e => e.continuePropagation()}
                            >
                                <FontAwesomeIcon icon={faPrint}/>
                            </Button>
                        </Tooltip>
                    </Badge>
                </div>
            </DropdownTrigger>
            <DropdownMenu>
                {pricePercentage.map((item, index) => (
                    <DropdownItem
                        key={index}
                        onPressStart={e => e.continuePropagation()}
                        onClick={
                            () =>
                            {
                                OpenPrintWindow(props.databaseId, rowData, props.printOptions, +($(`tr#${props.row.id}`).attr("data-department") ?? -1), item.price);
                            }
                        }
                    >
                        <div className={"flex flex-row items-center border-b-1 border-white/10"}>
                            <div className={"w-full"}>Print {item.percentage}%</div>
                            <div className={"ml-auto text-tiny opacity-50"}>${item.price.toFixed(2)}</div>
                        </div>
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    );
}