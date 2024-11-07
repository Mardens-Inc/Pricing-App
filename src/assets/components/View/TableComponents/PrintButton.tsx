import {Button, getKeyValue, Tooltip} from "@nextui-org/react";
import {OpenPrintWindow} from "../../../ts/printer.ts";
import $ from "jquery";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPrint} from "@fortawesome/free-solid-svg-icons";
import {RowValue} from "../InventoryTable.tsx";
import {Column, PrintForm} from "../../../ts/DatabaseRecords.ts";
import PrintPercentagesButton from "./PrintPercentagesButton.tsx";

export interface PrintButtonProps
{
    databaseId: string;
    row: any;
    columns: Column[];
    printOptions: PrintForm;
}

export default function PrintButton(props: PrintButtonProps)
{
    if (props.printOptions.percentages && props.printOptions.percentages.length > 0)
        return <PrintPercentagesButton {...props}/>;
    return (
        <Tooltip content={"Print"} classNames={{base: "pointer-events-none"}} closeDelay={0}>
            <Button radius={"full"} className={"min-w-0 w-12 h-12"} onClick={() =>
            {
                const rowData = props.columns.map(c => ({value: getKeyValue(props.row, c.real_name), attributes: c.attributes})) as RowValue[];
                OpenPrintWindow(props.databaseId, rowData, props.printOptions, +($(`tr#${props.row.id}`).attr("data-department") ?? -1));
            }}><FontAwesomeIcon icon={faPrint}/></Button>
        </Tooltip>
    );
}