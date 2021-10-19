// Returns an ragged array representing the state of the game
// Subarrays represent rows
// Array structure represents a game such as this
// +---+---+---+---+---+---+---+
// | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
// +---+---+---+---+---+---+---+
//     | 1 | 1 | 1 | 1 | 1 |
//     +---+---+---+---+---+
//         | 1 | 1 | 1 |
//         +---+---+---+
//             | 1 |
//             +---+
const newGame = (numRows) => {
	let game = [];
	for (let row = 0; row < numRows; row++) {
		let heap = [];
		for (let col = 0; col < 2 * row + 1; col++) {
			heap.push(1);
		}
		game.unshift(heap);
	}
	return game;
};

// Calculate the nimsum of a game
const calculateNimSum = (game) => {
	let nimSum = 0;
	// Check if array is 2d to avoid calling reduce on an integer
	if ((game[0].constructor = Array)) {
		for (let row = 0; row < game.length; row++) {
			const heap = game[row]; // Selecting subarray, or row of the game
			const rowSum = heap.reduce((a, b) => a + b, 0); // Finding sum of array
			nimSum ^= rowSum; // ^ is the bitwise xor operator
		}
	}
	// If array is 1d, nimsum is simply the sum of the array
	else {
		return game.reduce((a, b) => {
			a + b;
		});
	}
	return nimSum;
};

// Takes in a game array and and returns how many
// lines need to be crossed and in which row
const calculateNextMove = (game) => {
	// Checking if array is 2d
	let baseNimSum = 0 // nimSUm of the game in its beginning state
	if ((game[0].constructor = Array)) {
		// Calculating the nimSum of the game in its beginning state
		for (let row = 0; row < game.length; row++) {
			const heap = game[row]; // Selecting subarray, or row of the game
			baseNimSum ^= heap.length; // ^ is the bitwise xor operator
		}
		console.log(`baseNimSum: ${baseNimSum}`)
		// Looping through rows,
		// If the the nimSum of the baseNimSum and the length of the row
		// is less than the length the of the row
		// The row should be reduced to the
		// nimSum of the baseNimSum and the length of the row
		for (let row = 0; row < game.length; row++) {
			const heap = game[row];
			console.log(`Complicated nimSum: ${baseNimSum ^ heap.length}\nHeap length ${heap.length}`);
			if ((baseNimSum ^ heap.length) < heap.length) {
				return {
					row : row,
					removals : heap.length - (baseNimSum ^ heap.length)
				}
			}
		}
	}
}

// !!! MORE TESTING REQUIRED !!!
// Simple Check
// Check with https://en.wikipedia.org/wiki/Nim
var game = [[1,1,1], [1,1,1,1], [1,1,1,1,1]]
console.log(calculateNimSum(game));
console.log(calculateNextMove(game));
