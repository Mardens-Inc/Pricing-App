async function buildOptionsForm(id){
    const html = $(await $.ajax({url: "assets/html/database-options-form.html", method: "GET"}));
    await navigateToIconList(html);
    return html;
}

async function navigateToIconList(html)
{

}

export {buildOptionsForm}