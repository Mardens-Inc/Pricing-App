import {cn, Switch, SwitchProps} from "@heroui/react";

interface IExpandedSwitchProps extends SwitchProps
{
    label?: string;
    description?: string;
}

export default function ExtendedSwitch(props: IExpandedSwitchProps)
{
    const updatedProps = {...props};
    delete updatedProps.label;
    delete updatedProps.description;
    return (
        <Switch
            {...updatedProps}
            classNames={{
                ...props.classNames,
                base: cn(
                    "inline-flex flex-row-reverse w-full max-w-md bg-foreground/5 hover:bg-foreground/10 items-center",
                    "justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent",
                    "data-[selected=true]:border-primary",
                    props.classNames?.base
                ),
                wrapper: cn("p-0 h-4 overflow-visible bg-foreground/20", props.classNames?.wrapper),
                thumb: cn(
                    "w-6 h-6 border-2 shadow-lg",
                    "group-data-[hover=true]:border-primary",
                    //selected
                    "group-data-[selected=true]:ms-6",
                    // pressed
                    "group-data-[pressed=true]:w-7",
                    "group-data-[selected]:group-data-[pressed]:ms-4",
                    props.classNames?.thumb
                )
            }}
        >
            <div className="flex flex-col gap-1">
                <p className="text-medium">{props.label}</p>
                <p className="text-tiny text-foreground/50">
                    {props.description}
                </p>
            </div>
        </Switch>
    );
}