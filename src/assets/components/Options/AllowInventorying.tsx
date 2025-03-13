import ExtendedSwitch from "../Extends/ExtendedSwitch.tsx";
import {useState} from "react";

export default function AllowInventorying()
{
    const [allowInventorying, setAllowInventorying] = useState<boolean>(false);
    const [allowAdditions, setAllowAdditions] = useState<boolean>(false);
    const [addItemsIfMissing, setAddItemsIfMissing] = useState<boolean>(false);
    const [removeIfZero, setRemoveIfZero] = useState<boolean>(false);

    return (
        <>
            <ExtendedSwitch
                label={"Allow Inventorying?"}
                description={"Allow users to inventory this database."}
                isSelected={allowInventorying}
                onValueChange={setAllowInventorying}
                className={"max-w-full"}
            />
            {allowInventorying && (
                <div className={"bg-foreground/10 p-4 rounded-md flex flex-col gap-4"}>
                    <ExtendedSwitch
                        label={"Allow Additions"}
                        description={"Enable adding items to the inventory."}
                        isSelected={allowAdditions}
                        onValueChange={setAllowAdditions}
                        className={"w-full"}
                    />
                    <ExtendedSwitch
                        label={"Add Items If Missing"}
                        description={"Automatically add missing items to the inventory."}
                        isSelected={addItemsIfMissing}
                        onValueChange={setAddItemsIfMissing}
                        className={"w-full"}
                    />
                    <ExtendedSwitch
                        label={"Remove Items If Zero"}
                        description={"Remove items if their count reaches zero."}
                        isSelected={removeIfZero}
                        onValueChange={setRemoveIfZero}
                        className={"w-full"}
                    />
                </div>
            )}
        </>
    );
}