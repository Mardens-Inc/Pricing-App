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
                toggle={allowInventorying}
                onToggle={setAllowInventorying}
                className={"max-w-full"}
            />
            {allowInventorying && (
                <div className={"bg-foreground/10 p-4 rounded-md flex flex-col gap-2"}>
                    <ExtendedSwitch
                        label={"Allow Additions?"}
                        description={"Allow users to add items to the inventory."}
                        toggle={allowAdditions}
                        onToggle={setAllowAdditions}
                        className={"max-w-full"}
                    />
                    <ExtendedSwitch
                        label={"Add Items If Missing?"}
                        description={"Automatically add items to the inventory if they are missing."}
                        toggle={addItemsIfMissing}
                        onToggle={setAddItemsIfMissing}
                        className={"max-w-full"}
                    />
                    <ExtendedSwitch
                        label={"Remove Items If Zero?"}
                        description={"Automatically remove items from the inventory if they reach zero."}
                        toggle={removeIfZero}
                        onToggle={setRemoveIfZero}
                        className={"max-w-full"}
                    />
                </div>
            )}
        </>
    );
}