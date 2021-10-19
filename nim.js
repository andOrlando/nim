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

console.log(calculateNimSum(newGame(6)));
