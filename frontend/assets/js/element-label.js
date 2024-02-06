// Create a new <div> with the class "label"
const label = $(`<div class="label"></div>`)

// Remove the "title" attribute from all elements and store the value in a "data-title" attribute
// This is done to prevent the default browser tooltip from showing.
$(`[title]`).each((i, element) => {
    const el = $(element)
    el.attr('data-title', el.attr('title'))
    el.attr('title', null)
});

// Select all elements that have a "title" attribute
const elementsWithTitles = $(`[data-title]`)

// Append the create "label" <div> to the <body> of the document
$('body').append(label)

// Add a "mouseover" event listener to all elements with a "title" attribute
elementsWithTitles.on('mouseover', e => {
    e.preventDefault();
    // Get the current target of the event, in this case the element with a title.
    const element = $(e.currentTarget)
    // Get the "title" attribute of the element which is moused over.
    const title = element.attr('data-title')
    // Set the text of the "label" to the "title" of the element
    label.text(title)

    // Calculate the initial x and y coordinates for the "label",
    // the location is calculated to be just below the element.
    let x = element.offset().left + element.width() / 2 - label.width() / 2
    let y = element.offset().top + element.height() + 44

    // Check if the "label" would exceed the right boundary of the window, if so adjust the x position.
    if (x + label.width() > window.innerWidth) {
        x = window.innerWidth - label.width() - 10
    }

    // Check if the "label" would exceed the bottom boundary of the window, if so adjust the y position.
    if (y + label.height() > window.innerHeight) {
        y = window.innerHeight - label.height() - 10
    }

    // Apply the calculated x and y as well as set the "label" to visible.
    label.css({
        top: y,
        left: x,
        opacity: 1
    })
})

// Add a "mouseout" event listener to all elements with a "title" attribute
elementsWithTitles.on('mouseout', e => {
    // Set the "label" to be invisible when the mouse is no longer over the element.
    label.css({
        opacity: 0
    });
});