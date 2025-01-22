import {useEffect, useState} from "react";
import $ from "jquery";
import {cn, Image, Skeleton} from "@heroui/react";

export interface Icon
{
    name: string;
    url: string;
    file: string;
}

interface IconListProps
{
    onSelect?: (icon: Icon | null) => void;
    value?: Icon;
    url?: string;
}

export default function IconList(props: IconListProps)
{
    const [selected, setSelected] = useState<Icon | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [icons, setIcons] = useState<Icon[]>([]);
    useEffect(() =>
    {
        setIsLoading(true);
        const url = `/api/icons`;
        $.get(url).then((data: Icon[]) =>
        {
            setIcons(data);
            if (props.url)
            {
                const url = new URL(props.url);
                url.search = "";
                const icon = data.find((icon) =>
                {
                    const iconUrl = new URL(icon.url);
                    iconUrl.search = "";
                    return iconUrl.toString() === url.toString();
                });
                console.log("Default Selected Icon: ", icon);
                if (icon)
                {
                    setSelected(icon);
                    if (props.onSelect) props.onSelect(icon);
                }
            }
            setIsLoading(false);
        });
    }, []);
    return (
        <div className={"w-full"}>
            <div className={"flex flex-row flex-wrap justify-evenly gap-2 mx-4 grow dark:bg-neutral-700 bg-neutral-200 rounded-md max-h-[400px] overflow-y-auto p-2"}>
                {isLoading ?
                    (
                        Array.from({length: 40}).map((_, i) => (
                            <div key={i} className={"flex flex-col gap-1 p-4"}>
                                <Skeleton className={"w-[128px] h-[128px] rounded-md "}/>
                                <Skeleton className={"h-4 w-full rounded-md"}/>
                            </div>
                        ))
                    ) :
                    (icons.map((icon) => (
                        <div
                            key={icon.name}
                            data-selected={selected?.name === icon.name}
                            className={
                                cn(
                                    "flex flex-col items-center",
                                    "dark:hover:bg-white/10 hover:bg-black/10",
                                    "cursor-pointer p-4 rounded-lg transition-colors",
                                    "border-[2px] data-[selected=true]:border-primary border-transparent data-[selected=true]:!bg-primary/30"
                                )
                            }
                            onClick={() =>
                            {
                                if (selected?.name === icon.name)
                                {
                                    if (props.onSelect) props.onSelect(null);
                                    setSelected(null);
                                } else
                                {
                                    if (props.onSelect) props.onSelect(icon);
                                    setSelected(icon);
                                }
                            }}
                        >
                            <Image src={icon.url} alt={icon.name} width={128} height={128} className={"object-center object-contain"}/>
                            <span>{icon.name}</span>
                        </div>
                    )))

                }
            </div>
        </div>
    );
}