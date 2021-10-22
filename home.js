// Holds UI logic and communicates with nim.js

const gs = {
    MENU: 0,
    GAME: 1,
}
GAMESTATE = gs.MENU

/**********************
 *     MENU LOGIC     *
 **********************/

let menuData = {
    xi: 0,
    yi: 0,
    selectedIndex: 0,
    yOffsets: [0, 1, 3, 4]
}

function redrawMenu() {
    // Get starting positions
    menuData.yi = Math.ceil((geo.y - 5) / 2)
    menuData.xi = Math.ceil((geo.x - 13) / 2)

    // Draw menu options
    drawAt(menuData.xi, menuData.yi + menuData.yOffsets[0], "vs. player")
    drawAt(menuData.xi, menuData.yi + menuData.yOffsets[1], "vs. algorithm")
    // These two are left-aligned for now
    drawAt(menuData.xi + 13 - 8, menuData.yi + menuData.yOffsets[2], "settings")
    drawAt(menuData.xi + 13 - 6, menuData.yi + menuData.yOffsets[3], "about")

    // Highlight the first menu option
    styleAt(menuData.xi - 1, menuData.yi, 15, {backgroundColor: "var(--selected-item-color)"})
}

function keydownMenu(event) {
    //TODO: Less hardcoding? May not be necessary
    if (event.code == "KeyW" || event.code == "ArrowUp") {
        styleAt(menuData.xi - 1, menuData.yi + menuData.yOffsets[menuData.selectedIndex], 15, {backgroundColor: null})
        menuData.selectedIndex += menuData.selectedIndex !== 0 ? -1 : 3
        styleAt(menuData.xi - 1, menuData.yi + menuData.yOffsets[menuData.selectedIndex], 15, {backgroundColor: "var(--selected-item-color)"})
    }
    else if (event.code == "KeyS" || event.code == "ArrowDown") {
        styleAt(menuData.xi - 1, menuData.yi + menuData.yOffsets[menuData.selectedIndex], 15, {backgroundColor: null})
        menuData.selectedIndex += menuData.selectedIndex !== 3 ? 1 : -3
        styleAt(menuData.xi - 1, menuData.yi + menuData.yOffsets[menuData.selectedIndex], 15, {backgroundColor: "var(--selected-item-color)"})
    }
    else if (event.code == "Enter") {
        switch (menuData.selectedIndex) {
        case 0: GAMESTATE = gs.GAME; AI = false; break;
        case 1: GAMESTATE = gs.GAME; AI = true; break;
        case 2: //settings (heap size?)
        case 3: //about (cool stuff about us)
        }

        redrawScreen()
    }
}

function keyupMenu(event) {

}

/*********************
 *    NIM LOGIC      *
 *********************/

let gameData = {
    xi: 0,
    yi: 0,
    //TODO: Better heap initialization
    heap: [[1, 0, 1, 1, 1, 1, 1], [1, 0, 0, 0, 1], [1, 1, 1], [1]]
}

function redrawGame() {
    let x, y // I don't like redefining them in n^2
    gameData.xi = Math.ceil((geo.x - 13) / 2)
    gameData.yi = Math.ceil((geo.y - gameData.heap.length) / 2)

    drawAt(0, 0, "Player 1's Turn")
    for (let i = 0; i < gameData.heap.length; i++) {
        for (let j = 0; j < gameData.heap[i].length; j++) {
            x = gameData.xi + 2*i + 2*j
            y = gameData.yi + i
            drawAt(x, y,  gameData.heap[i][j] ? "|" : "┼")
            
            if (!gameData.heap[i][j] && j !== 0 && !gameData.heap[i][j-1]) drawAt(x-1, y, "─")
        }
    }
}

function keydownGame(event) {
    if (event.code = "Escape") {
        GAMESTATE = gs.MENU
        redrawScreen()
    }
}


/*******************
 *  GENERAL LOGIC  *
 *******************/

// General screen redraw function
function redrawScreen() {
    // First clear the screen
    clearScreen()

    // Hand to appropriate screen
    switch (GAMESTATE) {
        case gs.MENU: redrawMenu(); break;
        case gs.GAME: redrawGame(); break;
    }
}

window.addEventListener("resize", redrawScreen)
redrawScreen()

// Keydown listener, hands it to the appropriate screen
document.addEventListener('keydown', event => {
    switch (GAMESTATE) {
    case gs.MENU: keydownMenu(event); break;
    case gs.GAME: keydownGame(event); break;
    }
})

// Keyup listener, hands it to the appropriate screen
document.addEventListener('keyup', event => {
    // Nothing actually uses the keyup listener yet
})
