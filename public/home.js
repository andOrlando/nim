// Holds UI logic and communicates with nim.js
GAMESTATE = 0;

const MENU = 0;
const GAME = 1;
const SETTINGS = 2;
const ABOUT = 3;

const SELECTED_MENU_HL = 'var(--selected-item-color)';
const SELECTED_LINE_HL = 'var(--selected-item-color)';
const SELECTED_ROW_HL = 'var(--selected-item-color)';
const ALGO_SELECTED_HL= 'var(--algo-selected-item-color)';

// Deep clone method for initial heap tracking
function clone(heap) {
	return Array.from(heap, (row) => Array.from(row));
}

/**********************
 *     MENU LOGIC     *
 **********************/

let md = {
	xi: 0,
	yi: 0,
	selectedIndex: 0,
	yOffsets: [0, 1, 3, 4],
};

function redrawMenu() {
	// Clear screen
	clearScreen();

	// Get starting positions
	md.yi = Math.ceil((geo.y - 5) / 2);
	md.xi = Math.ceil((geo.x - 13) / 2);

	// Draw menu options
	drawAt(md.xi, md.yi + md.yOffsets[0], 'vs. player');
	drawAt(md.xi, md.yi + md.yOffsets[1], 'vs. algorithm');
	// These two are right-aligned for now
	drawAt(md.xi + 13 - 8, md.yi + md.yOffsets[2], 'settings');
	drawAt(md.xi + 13 - 5, md.yi + md.yOffsets[3], 'about');

	// Highlight the first menu option
	styleAt(
		md.xi - 1, 
		md.yi + md.yOffsets[md.selectedIndex], 
		15, { backgroundColor: SELECTED_MENU_HL }
	);
}

function keydownMenu(event) {
	//TODO: Less hardcoding? May not be necessary
	if (event.code === 'KeyW' || event.code === 'ArrowUp') {

		// Clear highlighting on previously selected row
		styleAt(
			md.xi - 1, 
			md.yi + md.yOffsets[md.selectedIndex], 
			15, { backgroundColor: null }
		);

		// Update internallly which row is selected
		md.selectedIndex += md.selectedIndex !== 0 ? -1 : 3;

		// Highlight new row
		styleAt(
			md.xi - 1, 
			md.yi + md.yOffsets[md.selectedIndex], 
			15, { backgroundColor: SELECTED_MENU_HL }
		);

	} else if (event.code === 'KeyS' || event.code === 'ArrowDown') {

		styleAt(
			md.xi - 1, 
			md.yi + md.yOffsets[md.selectedIndex], 
			15, { backgroundColor: null }
		);

		md.selectedIndex += md.selectedIndex !== 3 ? 1 : -3;

		styleAt(
			md.xi - 1, 
			md.yi + md.yOffsets[md.selectedIndex], 
			15, { backgroundColor: SELECTED_MENU_HL }
		);

	} else if (event.code === 'Enter' || event.code === 'Space') {
		if (md.selectedIndex === 0) {
			GAMESTATE = GAME;
			resetGame(false);
		} else if (md.selectedIndex === 1) {
			GAMESTATE = GAME;
			resetGame(true);
		} 
		else if (md.selectedIndex === 2) GAMESTATE = SETTINGS;
		else if (md.selectedIndex === 3) GAMESTATE = ABOUT;

		redrawScreen();
	}
}

function keyupMenu(event) {}

/*********************
 *    GAME LOGIC     *
 *********************/
const ROW_SEL = 0;
const LINE_SEL = 1;
const AI = 2;
const GAME_OVER = 3;
const UP = true;
const DOWN = false;

let gd; // Game Data

/**
 * Reset state of game including line highlighting and any changes to heaps
 * @param {bool} vsAI Whether the new game will be against AI or not
 */
function resetGame(vsAI) {
	gd = {
		xi: 0, //x-initial
		yi: 0, //y-initial
		row: 0, //selected row
		col: 0, //selected column
		editedRow: null, //which row has been edited
		player: 1, //which player is going rn
		vsAI: vsAI, //if it's an AI game
		isAI: false, //if it's currently the AI's turn
		textLength: 13, //length of heap
		highlightLength: 15, //length of heap + padding

		// TODO: Better heap initialization
		heap: [[1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1], [1]],
		heapOld: [[1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1], [1]],

		state: ROW_SEL //gamestate
	};
}

// The function called in redrawScreen for this gamestate
function redrawGame() {
	if (gd.state === ROW_SEL) redrawRowSel();
	else if (gd.state === LINE_SEL) redrawLineSel();
	else if (gd.state === GAME_OVER) redrawGameOver();
}

/* Base function for redrawing the heap, used in multiple places
 * Also updates xi and yi
 */
function redrawHeap() {
	let x, y; // I don't like redefining them in n^2
	gd.xi = Math.ceil((geo.x - gd.textLength) / 2);
	gd.yi = Math.ceil((geo.y - gd.heap.length) / 2); //TODO: Use values from settings

	// TODO: Allow for AI instead of player 2?
	drawAt(0, 0, `Player ${gd.player}'s Turn`);

	for (let i = 0; i < gd.heap.length; i++) {
		for (let j = 0; j < gd.heap[i].length; j++) {
			x = gd.xi + 2 * i + 2 * j;
			y = gd.yi + i;
			drawAt(x, y, gd.heap[i][j] ? '|' : '+');

			if (!gd.heap[i][j] && j !== 0 && !gd.heap[i][j - 1])
				drawAt(x - 1, y, '-');
		}
	}

	drawAt(
		gd.xi + gd.heap[0].length * 2 - 9,
		gd.yi + gd.heap.length + 1,
		'End Turn',
		{ onclick:  endTurn }
	);
}

// Ends turn by player and performs move by AI
function endTurn() {
	console.log("called3")
	// Checks if there are no more 1s
	if (![].concat(...gd.heap).includes(1)) {
		gd.state = GAME_OVER;
		redrawGame();
		return;
	}

	// Doesn't end turn if no move was done
	if (gd.heap.toString() == gd.heapOld.toString()) {
		drawAt(0, geo.y - 1, ': Must make a move to end turn' )
		return;
	}
	gd.heapOld = clone(gd.heap);
	gd.state = ROW_SEL;
	gd.player = gd.player ^ 3;
	gd.editedRow = null;
	gd.col = 0;
	gd.isAI = false;

	// If AI and it's player 2's turn, run algorithm sequence
	if (gd.player === 2 && gd.vsAI) {
		gd.isAI = true;
		runAlgorithm();
	}

	// If color depends on player, we wanna redraw the screen
	redrawRowSel()
}

/* Redraws the row selection screen */
function redrawRowSel() {
	// Clear Screen and draw heap
	clearScreen();
	redrawHeap();

	// Higlights selected row
	styleAt(
		gd.xi - 1, 
		gd.yi + gd.row, 
		gd.highlightLength, 
		{ backgroundColor: gd.isAI ? ALGO_SELECTED_HL : SELECTED_LINE_HL }
	);
}

/* Redraws the line selection menu */
function redrawLineSel() {
	// Clear screen and draw heap
	clearScreen();
	redrawHeap();

	// Highlights selected character
	styleAt(
		gd.xi + gd.col * 2 + gd.row * 2 - 1, 
		gd.yi + gd.row, 
		3, { backgroundColor: gd.isAI ? ALGO_SELECTED_HL : SELECTED_ROW_HL }
	);
}

function redrawGameOver() {
	clearScreen();
	drawAt(
		Math.ceil((geo.x - 14) / 2),
		Math.ceil(geo.y / 2),
		`Player ${gd.player ^ 3} Wins!`
	);
}

function uiActionRowSel(up, color) {
	// Unhiglight old stuff
	styleAt(
		gd.xi - 1, 
		gd.yi + gd.row, 
		gd.highlightLength, 
		{ backgroundColor: null }
	);

	if (up) gd.row += gd.row !== 0 ? -1 : gd.heap.length - 1;
	else gd.row += gd.row !== gd.heap.length - 1 ? 1 : 1 - gd.heap.length;

	styleAt(
		gd.xi - 1, 
		gd.yi + gd.row, 
		gd.highlightLength, 
		{ backgroundColor: color || SELECTED_ROW_HL }
	);

}

function uiActionLineSel(up, color) {
	// TODO: Make clickable
	styleAt(
		gd.xi + gd.col * 2 + gd.row * 2 - 1,
		gd.yi + gd.row,
		3, { backgroundColor: null }
	);

	if (up) gd.col += gd.col !== 0 ? -1 : gd.heap[gd.row].length - 1;
	else  gd.col += gd.col !== gd.heap[gd.row].length - 1 ? 1 : 1 - gd.heap[gd.row].length;

	styleAt(gd.xi + gd.col * 2 + gd.row * 2 - 1,
		gd.yi + gd.row,
		3, { backgroundColor: color || SELECTED_ROW_HL }
	);

}

function uiActionToScreen(ID) {
	gd.state = ID;
	redrawGame();
}

function uiActionEnter() {
	if (gd.state === ROW_SEL) {
		// disallow selecting already selected row
		if (!gd.heap[gd.row].includes(1) && gd.row !== gd.editedRow) {
			clearAt(0, geo.y - 1, geo.x);
			drawAt(0, geo.y - 1, ': Row is already crossed out');
		}

		// Discard changes in other row if need be
		else if (gd.editedRow !== null && gd.editedRow !== gd.row) {
			gd.heap = clone(gd.heapOld);

			uiActionToScreen(LINE_SEL);

			clearAt(0, geo.y - 1, geo.x);
			drawAt(0, geo.y - 1, `: Discarded changes in row ${gd.editedRow + 1}`);

			gd.editedRow = gd.row;
		}

		// Otherwise just do move normally
		else {
			uiActionToScreen(LINE_SEL)
			gd.editedRow = gd.row;
		}
	} 
	
	else if (gd.state === LINE_SEL) {

		if (!gd.heapOld[gd.row][gd.col]) {
			clearAt(0, geo.y - 1, geo.x);
			drawAt(0, geo.y - 1, ': That line has already been crossed out');
			return;
		}

		// Assigns both the heap value and `value` to the new value
		const value = (gd.heap[gd.row][gd.col] = gd.heap[gd.row][gd.col] ^ 1);

		drawAt(
			gd.xi + gd.col * 2 + gd.row * 2,
			gd.yi + gd.row,
			value ? '|' : '+'
		);

		// Check left and right for crossing possibilities
		if (gd.col !== 0)

			drawAt(
				gd.xi + gd.col * 2 + gd.row * 2 - 1,
				gd.yi + gd.row,
				gd.heap[gd.row][gd.col - 1] || value ? ' ' : '-'
			);

		if (gd.col !== gd.heap[gd.row].length - 1)

			drawAt(
				gd.xi + gd.col * 2 + gd.row * 2 + 1,
				gd.yi + gd.row,
				gd.heap[gd.row][gd.col + 1] || value ? ' ' : '-'
			);
	}
}

function keydownGame(event) {
	// TESTING SECTION UNTIL AUTOMATIC CALLING OF makeAlgoMove() IS IMPLEMENTED
	// TODO: remove
	if (event.code == 'KeyP') makeAlgoMove(gd.heap);

	else if (gd.isAI) {
		if (event.code === 'Escape' || event.code === 'KeyQ') {
			for (let i = 0; i < timeouts.length; i++)
				clearTimeout(timeouts[i])

			timeouts = [];

			GAMESTATE = MENU
			redrawScreen()
		}
	}

	// If we are at the row level, not the individual character level
	else if (gd.state === ROW_SEL) {

		// Selecting previous row
		if (event.code === 'KeyW' || event.code === 'ArrowUp') 
		
			uiActionRowSel(UP);

		// Selecting next row
		else if (event.code === 'KeyS' || event.code == 'ArrowDown') 
		
			uiActionRowSel(DOWN);

		// Entering moves
		else if (event.code === 'Enter' || event.code === 'Space') 
		
			uiActionEnter();

		// Exit the game
		else if (event.code === 'Escape' || event.code === 'KeyQ') {
			GAMESTATE = MENU;
			redrawScreen();
		}
	}

	// Selecting individual lines
	else if (gd.state === LINE_SEL) {

		// Moving the selected character left
		if (event.code === 'KeyA' || event.code === 'KeyS' ||
			event.code === 'ArrowLeft' || event.code === 'ArrowDown')
			
			uiActionLineSel(UP)

		// Moving the selected character right
		else if (event.code === 'KeyD' || event.code === 'KeyW' ||
			event.code === 'ArrowRight' || event.code === 'ArrowUp')

			uiActionLineSel(DOWN)

		// Crossing out characters
		else if (event.code === 'Enter' || event.code === 'Space')
			
			uiActionEnter();

		// Going back to row level
		else if (event.code === 'Escape' || event.code === 'KeyQ') {
			gd.state = ROW_SEL;
			gd.col = 0;
			redrawRowSel();
		}
	}

	// Game is over
	else if (gd.state === GAME_OVER) {
		GAMESTATE = MENU;
		redrawScreen();
	}
}

// This is the list of all timeouts to cancel if exits game
let timeouts = []

/**
 * Communicates with nim.js to get move,
 * then executes it slowly so user can see what is being played
 */
async function runAlgorithm() {
	// Calculates next move from algorithm
	let move = calculate_next_move(convertToHeaps(gd.heap));

	if (!move) {

		// TODO: Play out game
		redrawGameOver()

	} else {

		let offset = 0

		// Row movement
		for (let i = 0; i < Math.abs(gd.row - move.row); i++)
			timeouts.push(setTimeout(() => {uiActionRowSel(gd.row > move.row, ALGO_SELECTED_HL)}, 500 * ++offset))

		timeouts.push(setTimeout(() => {uiActionEnter()}, 500 * ++offset))

		// Column movement
		// Can't use gd.col because that's being updated asynchronously
		for (let col = 0; col < gd.heap[move.row].length; col++) {

			// If you can remove, remove
			if (gd.heap[move.row][col]) {
				timeouts.push(setTimeout(() => {uiActionEnter()}, 500 * ++offset));
				move.removals -= 1;
			}

			// If you're not at the last one, move left
			if (move.removals !== 0) {
				timeouts.push(setTimeout(() => {uiActionLineSel(DOWN, ALGO_SELECTED_HL)}, 500 * ++offset));
			}

			// If you are at the last one, break
			else break;

		}

		// Go back one screen
		timeouts.push(setTimeout(() => {uiActionToScreen(ROW_SEL)}, 500 * ++offset));

		//TODO: Navigate to End Turn button

		// End turn
		timeouts.push(setTimeout(() => {endTurn(); console.log(timeouts)}, 500 * ++offset));

	}
}

/*******************
 * SETTINGS LOGIC  *
 *******************/

function redrawSettings() {
	drawAt(2, 1, "Settings");
	drawAt(2, 2, "To be implemented");
	drawAt(2, 3, "(coding is hard!)");

	drawAt(0, geo.y-1, "Press Q or ESC to go back");
}

function keydownSettings(event) {
	if (event.code === "Escape" || event.code === "KeyQ") {
		GAMESTATE = MENU;
		redrawScreen();
	}
}

/*******************
 *   ABOUT LOGIC   *
 *******************/

function redrawAbout() {
	drawAt(2, 1, "About us");
	drawAt(2, 3, "This was made by:");
	drawAt(2, 4, "-");
	drawAt(4, 4, "andOrlando", 
		{onclick: () => {window.open("https://github.com/andOrlando", "_blank")}, color: "blue"});
	drawAt(16, 4, "(ui and tui library)");
	drawAt(2, 5, "-");
	drawAt(4, 5, "fprasx", 
		{onclick: () => {window.open("https://github.com/fprasx", "_blank")}, color: "blue"});
	drawAt(16, 5, "(ui and nim solver)");
	drawAt(2, 7, "Our Repository", 
		{onclick: () => {window.open("https://github.com/andOrlando/nim", "_blank")}, color: "blue"});
	drawAt(2, 8, "Thanks for playing!");

	drawAt(0, geo.y-1, "Press Q or ESC to go back");
}

function keydownAbout(event) {
	if (event.code === "Escape" || event.code === "KeyQ") {
		GAMESTATE = MENU;
		redrawScreen();
	}
}


/*******************
 *  GENERAL LOGIC  *
 *******************/

// General screen redraw function
function redrawScreen() {
	// First clear the screen
	clearScreen();

	// Hand to appropriate screen
	if (GAMESTATE === MENU) redrawMenu();
	else if (GAMESTATE === GAME) redrawGame();
	else if (GAMESTATE === SETTINGS) redrawSettings();
	else if (GAMESTATE === ABOUT) redrawAbout();
}

window.addEventListener('resize', redrawScreen);
redrawScreen();

// Keydown listener, hands it to the appropriate screen
document.addEventListener('keydown', event => {
	if (GAMESTATE === MENU) keydownMenu(event);
	else if (GAMESTATE === GAME) keydownGame(event);
	else if (GAMESTATE === SETTINGS) keydownSettings(event);
	else if (GAMESTATE === ABOUT) keydownAbout(event);
});

document.addEventListener('keyup', event => {
	// Nothing actually uses the keyup listener yet
});
