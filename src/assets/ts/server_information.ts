import $ from "jquery";

export async function getServerVersion(): Promise<string>
{
    return (await $.get("/api/version")) as Promise<string>;
}