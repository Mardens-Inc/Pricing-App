import {Departments} from "../../../ts/printer.ts";
import {Select, SelectItem} from "@heroui/react";

import {memo, useMemo, useState} from "react";

export const DepartmentDropdown = memo(function DepartmentDropdown({id}: { id: string })
{
    const [selectedDepartment, setSelectedDepartment] = useState<string | null>(localStorage.getItem(`print-department-${id}`));
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
            className={"w-40"}
            selectionMode={"single"}
            selectedKeys={[selectedDepartment ?? ""]}
            onSelectionChange={selection =>
            {
                const keys = [...selection] as string[];
                console.log(keys);
                if (keys.length === 0)
                {
                    localStorage.removeItem(`print-department-${id}`);
                    setSelectedDepartment(null);

                } else
                {
                    if (keys[0] === "-1")
                    {
                        localStorage.removeItem(`print-department-${id}`);
                        setSelectedDepartment(null);
                        return;
                    }

                    const dept = Departments.find(i => i.id === +(
                        (keys[0] as string)
                            .replace(`${id}-`, "")
                            .trim()
                    ))?.id ?? -1;
                    localStorage.setItem(`print-department-${id}`, dept.toString());
                    setSelectedDepartment(dept.toString());
                }
            }}
        >
            {
                [...[
                    <SelectItem
                        key={"-1"}
                        textValue={"None"}
                    >
                        None
                    </SelectItem>
                ], ...filteredDepartments.map(
                    dept =>
                        <SelectItem
                            key={dept.id.toString()}
                            textValue={dept.name}
                        >
                            {dept.id} - {dept.name}
                        </SelectItem>
                )]
            }
        </Select>
    );
});

