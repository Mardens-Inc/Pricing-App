import {Button, getKeyValue, Tooltip} from "@heroui/react";
import {OpenPrintWindow} from "../../../ts/printer.ts";
import $ from "jquery";
import {RowValue} from "../InventoryTable.tsx";
import {Icon} from "@iconify/react";
import Column from "../../../ts/data/Column.ts";
import {PrintForm} from "../../../ts/data/Options.ts";

export interface PrintButtonProps
{
    databaseId: string;
    row: any;
    columns: Column[];
    printOptions: PrintForm;
}

export default function PrintButton(props: PrintButtonProps)
{
    return (
        <Tooltip content={"Print"} classNames={{base: "pointer-events-none"}} closeDelay={0}>
            <Button id={`print-button-${props.databaseId}-${props.row.id}`} radius={"full"} className={"min-w-0 w-12 h-12"} data-print-form onPress={() =>
            {
                const rowData = props.columns.map(c => ({value: getKeyValue(props.row, c.name), attributes: c.attributes})) as RowValue[];
                OpenPrintWindow(props.databaseId, rowData, props.printOptions, +($(`tr#${props.row.id}`).attr("data-department") ?? -1));
            }}><Icon icon={"mage:printer-fill"}/></Button>
        </Tooltip>
    );
}