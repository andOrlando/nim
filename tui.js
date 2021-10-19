
// !!! THIS STUFF MIGHT NOT WORK !!! IT WAS WRITTEN IN CS50 IDE
var charGeo = {x: 1, y: 1}
function clearAt(x, y, length) {
    // length is hwo many characters to clear
}

function clearScreen(background_color) {
    for(let y = 0; y < charGeo.y; y++) {
        let row = document.querySelectorAll(`[y = ${y}]`);
        for( let x = 0; x < charGeo.x; x++) {
            col = row.querySelectorAll(`[x = ${x}]`);
            col.textContent = ' ';
            col.style.color = ""; // Not sure if this does what we want it to do
            col.style.backgroundColor = "";
        }
    }
    
}
/**
 * @param {int} x
 * @param {int} y
 * @param {String} text
 * @param {css variable} color
 * @param {css variable} background_color
 */
function drawAt(x, y, text, color, background_color) {
    const row = document.querySelectorAll(`[y = ${y}]`);
    // For each character in the string,
    // select the proper span element in the row and set the textContent to that character
    for(let char = 0; char< text.length; char++) {
        // Check if we are writing past the screen width
        if (x + char < charGeo.x) {
            let col = row.querySelectorAll(`[x = ${x + char}]`);
            col.textContent = text[char];
            col.style.backgroundColor = background_color;
            col.style.color = color;
        }
    }
}