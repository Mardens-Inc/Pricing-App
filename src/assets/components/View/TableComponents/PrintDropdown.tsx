import {Badge, Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, getKeyValue, Tooltip} from "@heroui/react";
import {RowValue} from "../InventoryTable.tsx";
import {Icon} from "@iconify/react";
import Column from "../../../ts/data/Column.ts";
import {PrintForm} from "../../../ts/data/Options.ts";
import {OpenPrintWindow} from "../../../ts/printer.ts";

export interface PrintDropdownProps
{
    databaseId: string;
    row: any;
    columns: Column[];
    printOptions: PrintForm[];
}

export default function PrintDropdown(props: PrintDropdownProps)
{
    const rowData = props.columns.map(c => ({value: getKeyValue(props.row, c.name), attributes: c.attributes})) as RowValue[];
    let price = +((rowData.find(v => v.attributes.includes("price")) ?? {}).value ?? 0);

    return (
        <Dropdown>
            <DropdownTrigger>
                <div>
                    <Badge content={"+"} color={"primary"} showOutline={false}>
                        <Tooltip content={"Show Print Options"} classNames={{base: "pointer-events-none"}} closeDelay={0}>
                            <Button
                                radius={"full"}
                                className={"min-w-0 w-12 h-12"}
                                onPressStart={e => e.continuePropagation()}
                            >
                                <Icon icon={"mage:printer-fill"}/>
                            </Button>
                        </Tooltip>
                    </Badge>
                </div>
            </DropdownTrigger>
            <DropdownMenu>
                {props.printOptions.map(form =>
                {
                    let mp = +((rowData.find(v => v.attributes.includes("mp")) ?? {}).value ?? 0);

                    if (form.percentOffRetail)
                    {
                        mp = price * (form.percentOffRetail / 100);
                    }

                    return <DropdownItem
                        key={`print-item-${form.id}-${form.hint}`} id={`print-item-${form.id}-${form.hint}`}
                        endContent={<Icon icon={"mage:printer-fill"}/>}
                        onPressStart={e => e.continuePropagation()}
                        onPress={() =>
                        {
                            OpenPrintWindow(props.databaseId, rowData, form);
                        }}
                    >
                        <div className={"flex flex-row items-center border-b-1 border-white/10"}>
                            <div className={"w-full"}>Print {form.hint}</div>
                            <div className={"ml-auto text-tiny opacity-50"}>${mp.toFixed(2)}</div>
                        </div>
                    </DropdownItem>;
                })}
            </DropdownMenu>
        </Dropdown>
    );
}

//        <Dropdown>
//             <DropdownTrigger>
//                 <div>
//                     <Badge content={"%"} color={"primary"} showOutline={false}>
//                         <Tooltip content={"Show Print Options"} classNames={{base: "pointer-events-none"}} closeDelay={0}>
//                             <Button
//                                 radius={"full"}
//                                 className={"min-w-0 w-12 h-12"}
//                                 onPressStart={e => e.continuePropagation()}
//                             >
//                                 <Icon icon={"mage:printer-fill"}/>
//                             </Button>
//                         </Tooltip>
//                     </Badge>
//                 </div>
//             </DropdownTrigger>
//             <DropdownMenu>
//                 {pricePercentage.map((item, index) => (
//                     <DropdownItem
//                         key={index}
//                         onPressStart={e => e.continuePropagation()}
//                         onPress={
//                             () =>
//                             {
//                                 OpenPrintWindow(props.databaseId, rowData, props.printOptions, +($(`tr#${props.row.id}`).attr("data-department") ?? -1), item.price);
//                             }
//                         }
//                     >
//                         <div className={"flex flex-row items-center border-b-1 border-white/10"}>
//                             <div className={"w-full"}>Print {item.percentage}%</div>
//                             <div className={"ml-auto text-tiny opacity-50"}>${item.price.toFixed(2)}</div>
//                         </div>
//                     </DropdownItem>
//                 ))}
//             </DropdownMenu>
//         </Dropdown>