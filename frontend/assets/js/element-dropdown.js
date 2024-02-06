// Function to initialize a dropdown menu
function loadDropdown() {

    // Creating a dropdown element
    const dropdown = $(`<div class="dropdown-items"> </div>`)

    if ($(".dropdown-items").length == 0) {
        // Appending the dropdown to the body of the HTML
        $('body').append(dropdown)
    }

    // Selecting elements that have a dropdown attribute but are not marked
    const elementsWithDropdowns = $("[dropdown]:not([marked])")

    // Iterating over each element and attaching necessary attributes
    elementsWithDropdowns.each((i, element) => {
        element = $(element);
        // marking the element as processed
        element.attr('marked', true)
        // Adding a tabindex attribute for focus
        element.attr('tabindex', 0);
    });

    // Adding event handler for focus and blur events
    elementsWithDropdowns.on('focus', showDropdown);
    elementsWithDropdowns.on('blur', hideDropdown);

    // Function to handle focus event and show dropdown menu
    function showDropdown(e) {
        e.preventDefault();
        // Get the current target of the event
        const element = $(e.currentTarget)
        element.addClass("active")
        // Extract the current dropdown items by splitting the dropdown attribute of the element
        const items = element.attr('dropdown').split(';')
        // Populate HTML content inside the dropdown element
        dropdown.html(items.map(item => `<div class="dropdown-item" onclick="${element.attr(`action-${item.replace(/\s/g, '-')}`)}">${item}</div>`).join(''))
        dropdown[0].scrollTo({top: 0, behavior: 'auto'});
        // Logic for positioning the dropdown menu.
        let x = element.offset().left + element.width() / 2 - dropdown.width() / 2
        let y = element.offset().top + element.height() + 40
        if (y + dropdown.height() > window.innerHeight) {
            y = window.innerHeight - dropdown.height() - 10
        }
        if (x + dropdown.width() > window.innerWidth) {
            x = window.innerWidth - dropdown.width() - 10
        }
        // Apply CSS styles to position the dropdown correctly
        dropdown.css({
            top: y,
            left: x,
            opacity: 1,
            "pointer-events": "all"
        })
    }

    // Function to handle blur event and hide dropdown menu
    function hideDropdown() {
        // Delay the hiding process to allow for click events
        setTimeout(() => {
            dropdown.css({
                opacity: 0,
                "pointer-events": "none"
            })
        }, 100)
    }
}