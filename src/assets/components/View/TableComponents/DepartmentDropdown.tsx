import {Departments} from "../../../ts/printer.ts";
import $ from "jquery";
import {Select, SelectItem} from "@heroui/react";

import {memo, useMemo} from "react";

export const DepartmentDropdown = memo(function DepartmentDropdown({id}: { id: string })
{
    const filteredDepartments = useMemo(() =>
            Departments.filter(i => i.id > 0),
        [Departments]
    );

    return (
        <Select
            key={`${id}-dept-selector`}
            label={"Department"}
            placeholder={"Select a department to print"}
            radius={"full"}
            classNames={{}}
            onSelectionChange={selection =>
            {
                const dept = Departments.find(i => i.id === +(
                    ([...selection][0] as string)
                        .replace(`${id}-`, "")
                        .trim()
                ))?.id ?? -1;
                $(`tr#${id}`).attr("data-department", dept);
            }}
        >
            {
                filteredDepartments.map(
                    dept =>
                        <SelectItem
                            key={`${id}-${dept.id}`}
                            value={dept.name}
                            textValue={dept.name}
                        >
                            {dept.id} - {dept.name}
                        </SelectItem>
                )
            }
        </Select>
    );
});

