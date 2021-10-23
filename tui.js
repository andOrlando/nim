// Semi-library for creating a tui-like webpage

// Get the size of a character
const charGeo = {
	x: document.getElementById('tui-test').getBoundingClientRect().width,
	y: document.getElementById('tui-test').getBoundingClientRect().height,
};
// Remove the test element and update the CSS for the div
// I have no idea why I have to -1 for line height but there's 1px of whitespace if I don't
// Thank you CSS
document.getElementById('tui-test').remove();
document
	.querySelector(':root')
	.style.setProperty('--tui-div-line-height', `${charGeo.y - 1}px`);

// Initially no characters
let geo = { x: 0, y: 0 };

// Recreates the screen intelligently taking into account the current size
function recreateScreen(x, y) {
	// Adjust xs
	if (x != geo.x) {
		// Get action for xs
		const action =
			x < geo.x
				? (x, div) => {
						div.querySelector(`[x='${x - 1}']`).remove();
				  }
				: (x, div) => {
						div.insertAdjacentHTML(
							'beforeend',
							`<span x='${x}'> </span>`
						);
				  };

		// If we're removing extra, we only need to remove the earlier xs
		const yMax = y < geo.y ? y : geo.y;

		for (let i = 0; i < yMax; i++) {
			// Get the div
			const div = document.querySelector(`[y='${i}']`);

			for (let j = 0; j < Math.abs(x - geo.x); j++) {
				action(x > geo.x ? geo.x + j : geo.x - j, div);
			}
		}
	}

	// Adjust ys
	if (y != geo.y) {
		// Get action for ys
		// When adding new ones, it just creates a string containing the div and all the spans
		const action =
			y < geo.y
				? (y) => {
						document.querySelector(`[y='${y - 1}']`).remove();
				  }
				: (y) => {
						document.getElementById('tui').insertAdjacentHTML(
							'beforeend',
							`<div y='${y}'>
				${Array.from({ length: x }, (_, i) => `<span x='${i}'> </span>`).join(
					''
				)}</div>`
						);
				  };

		for (let i = 0; i < Math.abs(y - geo.y); i++) {
			action(y > geo.y ? geo.y + i : geo.y - i);
		}
	}

	// Update geo.x with new values
	geo = { x: x, y: y };
	return true;
}

// Screen resize event listener and initial recreation
recreateScreen(
	Math.floor(window.innerWidth / charGeo.x),
	Math.floor(window.innerHeight / charGeo.y)
);

window.addEventListener('resize', () => {
	// Get new possible x and y geometries
	const x = Math.floor(window.innerWidth / charGeo.x);
	const y = Math.floor(window.innerHeight / charGeo.y);

	if (geo.x != x || geo.y != y) {
		recreateScreen(x, y);
	}
});

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
	const row = document.querySelector(`[y='${y}']`);

	for (let i = 0; i < length; i++) {
		const char = row.querySelector(`[x='${x + i}']`);
		char.textContent = ' ';
		char.style.color = null;
		char.style.backgroundColor = 'var(--background-color)';
	}
}

/* Clears the screen */
function clearScreen() {
	for (let i = 0; i < geo.y; i++) clearAt(0, i, geo.x);
}

/**
 * Draws a string at the target position
 *
 * @param {int} x The x-position
 * @param {int} y The y-position
 * @param {String} text The text to set it to
 * @param {Object} style Takes color or backgroundColor
 */
function drawAt(x, y, text, style = {}) {
	const row = document.querySelector(`[y='${y}']`);

	// For each character in the string,
	// select the proper span element in the row and set the textContent to that character
	for (let i = 0; i < text.length; i++) {
		// Ensure it doesn't go out of bounds
		if (x + i > geo.x) break;

		const char = row.querySelector(`[x='${x + i}']`);
		char.textContent = text[i];
		if (style.color !== undefined) char.style.color = style.color;
		if (style.backgroundColor !== undefined) char.style.backgroundColor = style.backgroundColor;

		if (style.onclick !== undefined) char.addEventListener("click", style.onclick)
	}
}

/**
 * Style some number of characters at a specified index
 *
 * @param {int} x The x-position
 * @param {int} y The y-position
 * @param {int} length Number of characters to style
 * @param {Object} style Takes color or backgroundColor
 */
function styleAt(x, y, length, style = {}) {
	const row = document.querySelector(`[y='${y}']`);
	for (let i = 0; i < length; i++) {
		if (x + i > geo.x) break;

		const char = row.querySelector(`[x='${x + i}']`);
		if (style.color !== undefined) char.style.color = style.color;
		if (style.backgroundColor !== undefined) char.style.backgroundColor = style.backgroundColor;

		if (style.onclick !== undefined) char.addEventListener("click", style.onclick)
		else if (style.onclick === null) char.removeEventListener("click")
	}
}
