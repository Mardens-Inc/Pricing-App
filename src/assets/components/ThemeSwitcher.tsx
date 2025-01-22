import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMoon, faSun} from "@fortawesome/free-solid-svg-icons";
import {applyTheme, getCurrentTheme, Theme} from "../ts/Theme.ts";
import {Switch} from "@heroui/react";

export default function ThemeSwitcher()
{
    return (
        <Switch
            size="lg"
            color="primary"
            startContent={<FontAwesomeIcon icon={faSun}/>}
            endContent={<FontAwesomeIcon icon={faMoon}/>}
            defaultSelected={getCurrentTheme() === Theme.light}
            onValueChange={
                (value) =>
                {
                    applyTheme(value ? Theme.light : Theme.dark);
                }
            }
        />
    );
}
