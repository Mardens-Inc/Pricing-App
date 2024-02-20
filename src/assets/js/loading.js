function startLoading(message = "Loading...") {
    if ($(".loading").length > 0) return;
    const loading = $(`<div class="loading">${message}</div>`);
    $("body").append(loading);
}

function stopLoading() {
    $(".loading").remove();
}

export {startLoading, stopLoading}