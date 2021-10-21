// Semi-library for creating a tui-like webpage

// Get the size of a character
let charGeo = {
    x: document.getElementById("tui-test").getBoundingClientRect().width,
    y: document.getElementById("tui-test").getBoundingClientRect().height,
};
// Remove the test element and update the CSS for the div
// I have no idea why I have to -1 for line height but there's 1px of whitespace if I don't
// Thank you CSS
document.getElementById("tui-test").remove()
document.querySelector(":root").style.setProperty("--tui-div-line-height", `${charGeo.y-1}px`)

// Initially no characters 
geo = {x: 0, y: 0};

// Recreates the screen intelligently taking into account the current size
function recreateScreen(x, y) {
	
	// Adjust xs
	if (x != geo.x) {

		// Get action for xs
		let action = x < geo.x ? 
			(x, div) => {div.querySelector(`[x='${x-1}']`).remove()} :
			(x, div) => {div.insertAdjacentHTML("beforeend", `<span x='${x}'>x</span>`)};

		// If we're removing extra, we only need to remove the earlier xs
		let yMax = y < geo.y ? y : geo.y;

		for (let i = 0; i < yMax; i++) {
			// Get the div
			let div = document.querySelector(`[y='${i}']`);

			for (let j = 0; j < Math.abs(x - geo.x); j++) {
				action(x > geo.x ? geo.x + j : geo.x - j, div);
			}
		}
	}
	
	// Adjust ys
	if (y != geo.y) {

		// Get action for ys
		// When adding new ones, it just creates a string containing the div and all the spans
		let action = y < geo.y ?
			(y) => {document.querySelector(`[y='${y-1}']`).remove()} : 
			(y) => {document.getElementById("tui").insertAdjacentHTML("beforeend", `<div y='${y}'>
				${Array.from({length:x}, (_, i) => `<span x='${i}'>y</span>`).join('')}</div>`)};

		for (let i = 0; i < Math.abs(y - geo.y); i++) {
			action(y > geo.y ? geo.y + i : geo.y - i);
		}
	}

	// Update geo.x with new values
	geo = {x: x, y: y};
	return true;
}

// Screen resize event listener and initial recreation
recreateScreen(
	Math.floor(window.innerWidth / charGeo.x), 
	Math.floor(window.innerHeight / charGeo.y));

window.addEventListener("resize", () => {

    // Get new possible x and y geometries
    let x = Math.floor(window.innerWidth / charGeo.x);
    let y = Math.floor(window.innerHeight / charGeo.y);

    if (geo.x != x || geo.y != y) {
        recreateScreen(x, y)
    }
})


/*****************************
 *         MAIN API          *
 *****************************/

/**
 * Clears some number of characters in a horizontal line
 *
 * @param {int} x The x-position
 * @param {int} y The y-position
 * @param {String} length The number of characters you want to clear
 */
function clearAt(x, y, length) {
    // length is how many characters to clear
}

/**
 * Clears the screen to --background-color or the color specified
 *
 * @param {String} background_color The background color to clear to
 */
function clearScreen(background_color) {
    for(let y = 0; y < charGeo.y; y++) {
        let row = document.querySelectorAll(`[y = '${y}]'`);
        for( let x = 0; x < charGeo.x; x++) {
            col = row.querySelectorAll(`[x = '${x}]'`);
            col.textContent = ' ';
            col.style.color = ""; // Not sure if this does what we want it to do
            col.style.backgroundColor = "";
        }
    }
    
}
/**
 * Draws a string at the target position
 *
 * @param {int} x The x-position
 * @param {int} y The y-position
 * @param {String} text The text to set it to
 * @param {String} color The color in string form of the text
 * @param {String} background_color The color in string form of the background
 */
function drawAt(x, y, text, color, background_color) {
    const row = document.querySelectorAll(`[y = '${y}]'`);
    // For each character in the string,
    // select the proper span element in the row and set the textContent to that character
    for(let char = 0; char< text.length; char++) {
        // Check if we are writing past the screen width
        if (x + char < charGeo.x) {
            let col = row.querySelectorAll(`[x = '${x + char}]'`);
            col.textContent = text[char];
            col.style.backgroundColor = background_color;
            col.style.color = color;
        }
    }
}
