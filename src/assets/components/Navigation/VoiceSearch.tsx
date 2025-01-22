import {Button, cn, Tooltip} from "@heroui/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMicrophone} from "@fortawesome/free-solid-svg-icons";
import {useEffect, useState} from "react";
import {useSearch} from "../../providers/SearchProvider.tsx";

export default function VoiceSearch()
{
    const is_chrome = navigator.userAgent.toLowerCase().indexOf("chrome") > -1;

    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
    const {setSearch} = useSearch();

    useEffect(() =>
    {
        if (is_chrome)
        {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition() as SpeechRecognition;
            setRecognition(recognition);
        }
    }, []);

    useEffect(() =>
    {
        if (!recognition) return;
        if (isListening)
        {
            try
            {
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = "en-US";
                recognition.start();

                recognition.onresult = (event: any) =>
                {
                    const results = Array.from(event.results as SpeechRecognitionResultList);
                    let transcript = "";
                    for (let i = 0; i < results.length; i++)
                    {
                        if (results[i].isFinal)
                        {
                            transcript = results[i][0].transcript;
                            console.log("Final result   : " + results[i][0].transcript);
                        } else
                        {
                            transcript += results[i][0].transcript;
                            console.log("Intermediate result: " + results[i][0].transcript);
                        }
                    }

                    if (transcript)
                    {
                        console.log("Results: ", results);
                        setSearch(transcript);
                        console.log(transcript);
                    }
                };

                recognition.onend = () =>
                {
                    console.log("Speech recognition service disconnected");
                };
            } catch (e)
            {
                // This is most likely due to the recognition service already started
                setIsListening(false);
                try
                {
                    recognition.stop();
                } catch (e)
                {
                    console.error(e);
                }

            }
            return () =>
            {
                recognition.stop();
            };
        } else
        {
            recognition.stop();
        }

    }, [isListening, recognition]);

    if (!is_chrome) return null;
    return (
        <div className={"relative"}>
            {isListening && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>}
            <Tooltip content={"Voice Search"}>
                <Button
                    radius={"full"}
                    className={
                        cn(
                            "h-12 max-w-12 w-[150px] aspect-square p-0 min-w-0 overflow-hidden !transition-[max-width]",
                            "data-[listening=true]:bg-primary",
                            "data-[listening=true]:max-w-[150px]"
                        )
                    }
                    data-listening={isListening}
                    onClick={() => setIsListening(prev => !prev)}
                >
                    <FontAwesomeIcon icon={faMicrophone}/>
                    {isListening && <p>LISTENING</p>}
                </Button>
            </Tooltip>
        </div>
    );
}