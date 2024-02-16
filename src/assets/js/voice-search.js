import Voice from "./Voice.js";

const searchInput = $("#search");

searchInput.on('keypress', async (event) => search(searchInput.val()));
$("#voice-search-button").on('click', () => {
    let voice = new Voice();
    if (voice.unsupported) {
        alert(`Your browser does not support voice recognition`);
        return;
    }
    const button = $("#voice-search-button");
    if (button.hasClass("primary")) {
        button.removeClass("primary");
        voice.stop();
        return;
    }
    button.addClass("primary");
    $(voice).on("interim", async (event, transcript) => {
        console.log("Interim: " + transcript);
        search(transcript)
    });
    $(voice).on("result", async (event, transcript) => {
        button.removeClass("primary");
        voice.stop();
    });
    $(voice).on("end", async (event) => {
        button.removeClass("primary");
        voice.stop();
    });

    voice.start();
})

export function search(query) {
    searchInput.val(query);
    $(document).trigger("search", [query]);
}