import {createContext, ReactNode, useContext, useState} from "react";
import {Alert, cn} from "@heroui/react";

export type ToastOptions = {
    title?: string;
    description?: string;
    type?: "success" | "error" | "info" | "warning";
    duration?: number;
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";

}

interface ToastContextType
{
    toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({children}: { children: ReactNode })
{
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("Test");
    const [type, setType] = useState("info" as "success" | "error" | "info" | "warning");
    const [description, setDescription] = useState("Hello World");
    const [position, setPosition] = useState("bottom-right");
    const toast = (options: ToastOptions) =>
    {
        setTitle(options.title ?? "");
        setType(options.type ?? "info");
        setDescription(options.description ?? "");
        setPosition(options.position ?? "bottom-right");
        setOpen(true);
        setTimeout(() =>
        {
            setOpen(false);
            setTitle("");
            setType("info");
            setDescription("");
            setPosition("bottom-right");
            console.log("Toast closed");
        }, options.duration ?? 5000);
    };

    return (
        <ToastContext.Provider value={{toast}}>
            <Alert
                title={title}
                color={type === "info" ? "primary" : type === "error" ? "danger" : type === "success" ? "success" : type === "warning" ? "warning" : "default"}
                description={description}

                className={
                    cn(
                        "fixed max-w-md z-50 opacity-0 transition-all duration-300 ease-in-out translate-y-12 pointer-events-none",
                        "data-[position='top-right']:top-10 data-[position='top-right']:right-10",
                        "data-[position='top-left']:top-10 data-[position='top-left']:left-10",
                        "data-[position='bottom-left']:bottom-10 data-[position='bottom-left']:left-10",
                        "data-[position='bottom-right']:bottom-10 data-[position='bottom-right']:right-10",
                        "data-[open=true]:opacity-100 data-[open=true]:translate-y-0 data-[open=true]:pointer-events-auto"
                    )
                }
                data-position={position}
                data-open={open}
                isClosable={false}
            />
            {children}
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextType
{
    const context = useContext(ToastContext);
    if (!context)
    {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}