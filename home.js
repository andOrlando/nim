// Holds UI logic and communicates with nim.js
GAMESTATE = 0;

const MENU = 0;
const GAME = 1;

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
		} else if (md.selectedIndex === 2) {
			// Settings
		} else if (md.selectedIndex === 3) {
			// About
		}

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

let gd; // Game Data

/**
 * Reset state of game including line highlighting and any changes to heaps
 * @param {bool} vsAI Whether the new game will be against AI or not
 */
function resetGame(vsAI) {
	gd = {
		xi: 0,
		yi: 0,
		row: 0,
		col: 0,
		editedRow: null,
		player: 1,
		vsAI: vsAI,
		textLength: 13,
		highlightLength: 15,

		// TODO: Better heap initialization
		heap: [[1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1], [1]],
		heapOld: [[1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1], [1]],

		state: ROW_SEL
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
	// Checks for no more 1s
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
	// Perform move by algorithm
	makeAlgoMove(gd.heap);
	// Prepare screen for player input
	redrawRowSel();
}
/**
 * Completely rehighlights current row
 */
function redrawRowSel() {
	// Clear Screen and draw heap
	clearScreen();
	redrawHeap();

	styleAt(
		gd.xi - 1, 
		gd.yi + gd.row, 
		gd.highlightLength, 
		{ backgroundColor: SELECTED_LINE_HL }
	);
}
/**
 * Highlights current character
 */
function redrawLineSel() {
	// Clear screen and draw heap
	clearScreen();
	redrawHeap();

	styleAt(
		gd.xi + gd.col * 2 + gd.row * 2 - 1, 
		gd.yi + gd.row, 
		3, { backgroundColor: SELECTED_ROW_HL }
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

function keydownGame(event) {
	// TESTING SECTION UNTIL AUTOMATIC CALLING OF makeAlgoMove() IS IMPLEMENTED
	// TODO
	if (event.code == 'KeyP') {
		makeAlgoMove(gd.heap);
		return;
	}
	// If we are at the row level, not the individual character level
	if (gd.state === ROW_SEL) {

		// Selecting previous row
		if (event.code === 'KeyW' || event.code === 'ArrowUp') {
			styleAt(
				gd.xi - 1, 
				gd.yi + gd.row, 
				gd.highlightLength, 
				{ backgroundColor: null }
			);

			gd.row += gd.row !== 0 ? -1 : gd.heap.length - 1;

			styleAt(
				gd.xi - 1, 
				gd.yi + gd.row, 
				gd.highlightLength, 
				{ backgroundColor: SELECTED_LINE_HL }
			);
		}

		// Selecting next row
		else if (event.code === 'KeyS' || event.code == 'ArrowDown') {
			styleAt(
				gd.xi - 1,
				gd.yi + gd.row,
				gd.highlightLength,
				{ backgroundColor: null }
			);
			
			gd.row += gd.row !== gd.heap.length - 1 ? 1 : 1 - gd.heap.length;

			styleAt(
				gd.xi - 1,
				gd.yi + gd.row,
				gd.highlightLength,
				{ backgroundColor: SELECTED_LINE_HL }
			);
		}

		// Entering moves
		else if (event.code === 'Enter' || event.code === 'Space') {

			// disallow selecting already selected row
			if (!gd.heap[gd.row].includes(1)) {
				clearAt(0, geo.y - 1, geo.x);
				drawAt(0, geo.y - 1, ': Row is already crossed out');
			}

			// Discard changes in other row if need be
			else if (gd.editedRow !== null && gd.editedRow !== gd.row) {
				gd.heap = clone(gd.heapOld);
				gd.state = LINE_SEL;
				redrawLineSel();

				clearAt(0, geo.y - 1, geo.x);
				drawAt(0, geo.y - 1, `: Discarded changes in row ${gd.editedRow + 1}`);

				gd.editedRow = gd.row;
			}

			// Otherwise just do move normally
			else {
				gd.state = LINE_SEL;
				redrawLineSel();

				gd.editedRow = gd.row;
			}
		}

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
		{
			// TODO: Make clickable
			styleAt(
				gd.xi + gd.col * 2 + gd.row * 2 - 1,
				gd.yi + gd.row,
				3, { backgroundColor: null }
			);

			gd.col += gd.col !== 0 ? -1 : gd.heap[gd.row].length - 1;

			styleAt(gd.xi + gd.col * 2 + gd.row * 2 - 1,
				gd.yi + gd.row,
				3, { backgroundColor: SELECTED_ROW_HL }
			);
		}

		// Moving the selected character right
		else if (event.code === 'KeyD' || event.code === 'KeyW' ||
			event.code === 'ArrowRight' || event.code === 'ArrowUp')
		{
			styleAt(gd.xi + gd.col * 2 + gd.row * 2 - 1,
				gd.yi + gd.row,
				3, { backgroundColor: null, }
			);

			gd.col += gd.col !== gd.heap[gd.row].length - 1 ? 1 : 1 - gd.heap[gd.row].length;

			styleAt(
				gd.xi + gd.col * 2 + gd.row * 2 - 1,
				gd.yi + gd.row,
				3, { backgroundColor: SELECTED_ROW_HL }
			);
		}

		// Crossing out characters
		else if (event.code === 'Enter' || event.code === 'Space') {
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

/**
 * Communicates with nim.js to get move,
 * then executes it slowly so user can see what is being played
 * @param {Number[][]} game this should always be gd.heap
 */
// Kinda janky as if you call this really quickly multiple times, it does weird stuff
// However this would never happen in a game
function makeAlgoMove(game) {
	let heaps = convertToHeaps(game);
	let move = calculate_next_move(heaps);
	if (!move) {
		redrawGameOver()
		// TODO: decide what algorithm should do if it cannot win
		// Show loss screen or play out the game? Better user satisfaction that way probably
	} else {
		// If highlight is already on correct row change it's color
		if (gd.row == move.row) {
			styleAt(
				gd.xi - 1,
				gd.yi + gd.row,
				gd.highlightLength,
				{ backgroundColor: ALGO_SELECTED_HL}
			);
		}
		// TODO: make line move in steps (not sure why it isn't already)
		// TODO: make line move up or down depending on which way is faster
		while (gd.row != move.row) {
			styleAt(
				gd.xi - 1, 
				gd.yi + gd.row, 
				gd.highlightLength, 
				{ backgroundColor: null }
			);
			// Goes up a row	
			gd.row += gd.row !== 0 ? -1 : gd.heap.length - 1;

			styleAt(
				gd.xi - 1, 
				gd.yi + gd.row, 
				gd.highlightLength, 
				{ backgroundColor: ALGO_SELECTED_HL }
			);
		}
		
		// Using setTimeout() to stagger different parts of move
		// so that they are visible
		setTimeout(() => {
			styleAt(
				gd.xi - 1, 
				gd.yi + gd.row, 
				gd.highlightLength, 
				{ backgroundColor: null }
			);
		}, 500)

		setTimeout(() => {
			// Updating game state
			let removedIndices = [];
			for (let i = 0; i < gd.heap[move.row].length; i++) {
				if (removedIndices.length == move.removals) break;
				const line = gd.heap[move.row][i];
				if (line == 1) {
					styleAt(
						gd.xi + gd.col * 2 + gd.row * 2 - 1,
						gd.yi + gd.row,
						3, 
						{ backgroundColor: ALGO_SELECTED_HL }
					);
					gd.col += 1;
					removedIndices.push(i);
				} else {
					gd.col += 1;
				}
			}
			for (let i = 0; i < removedIndices.length; i++) {
				const index = removedIndices[i];
				gd.heap[move.row][index] = 0;
			}}, 500)
		
		// Updating screen
		// The setTimeout closure is identical to endTurn except
		// it doesn't include a call to makeAlgoMove() to prevent recursion
		setTimeout(() => {
			if (![].concat(...gd.heap).includes(1)) {
				gd.state = GAME_OVER;
				redrawGame();
				return;
			}
		
			gd.heapOld = clone(gd.heap);
			gd.state = ROW_SEL;
			gd.player = gd.player ^ 3;
			gd.editedRow = null;
			gd.col = 0;
			redrawRowSel();
		}, 1000)
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
}

window.addEventListener('resize', redrawScreen);
redrawScreen();

// Keydown listener, hands it to the appropriate screen
document.addEventListener('keydown', event => {
	if (GAMESTATE === MENU) keydownMenu(event);
	else if (GAMESTATE === GAME) keydownGame(event);
});

document.addEventListener('keyup', event => {
	// Nothing actually uses the keyup listener yet
});
