import $ from "jquery";
import {useEffect} from "react";
import {Button, cn, Divider} from "@heroui/react";
import {Icon} from "@iconify/react";

interface FileUploadInputProps
{
    onFileUpload?: (file: File) => void;
}

export default function FileUploadInput(props: FileUploadInputProps)
{
    const id = `drag-drop-file-input-${Math.random().toString(36).substring(7)}`;
    const openSelector = () =>
    {
        const input = $("<input type='file' accept='.csv'>");
        input.on("change", (e) =>
        {
            if (e.target instanceof HTMLInputElement && e.target.files)
            {
                const file = e.target.files[0];
                console.log("Uploading file",file);
            }
        });
        input.trigger("click");
    };

    useEffect(() =>
    {
        const dropArea = $(`#${id}`);
        dropArea.on("dragover", (e) =>
        {
            e.preventDefault();
            dropArea.attr("data-dragged", "");

        });
        dropArea.on("dragleave", () =>
        {
            dropArea.removeAttr("data-dragged");
        });

        dropArea.on("drop", (e) =>
        {
            e.preventDefault();
            dropArea.removeAttr("data-dragged");
            if (e.originalEvent instanceof DragEvent && e.originalEvent.dataTransfer)
            {
                const file = e.originalEvent.dataTransfer.files[0];
                console.log("Dragged file",file);
                if (props.onFileUpload) props.onFileUpload(file);
            }
        });

    }, []);

    return (
        <div
            id={id}
            className={
                cn(
                    "dark:outline-2 outline-3 outline-dotted dark:outline-white/50 outline-black/50",
                    "h-[200px] rounded-2xl flex flex-row p-4 gap-8 items-center justify-center",
                    "shadow-inner m-4 transition-colors",
                    "data-[dragged]:!bg-primary/10"
                )
            }
        >
            <div className={"flex flex-col"}>
                <p className={"text-4xl font-bold text-center px-4"}>Drag &amp; Drop</p>
                <p className={"text-center italic"}>(.csv)</p>
            </div>
            <Divider orientation={"vertical"} className={"mx-[100px]"}/>
            <div className={"flex flex-col"}>
                <Button
                    size={"lg"}
                    variant={"ghost"}
                    radius={"full"}
                    color={"primary"}
                    className={"p-8"}
                    onPress={openSelector}
                    startContent={<Icon icon="mage:file-upload"/>}
                >
                    Select CSV
                </Button>
            </div>
        </div>
    );
}