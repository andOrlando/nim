// Converts an array representing the exact state of the game to a heap representation
// +---+---+---+---+---+
// | 1 | 0 | 0 | 1 | 0 |
// +---+---+---+---+---+
//     | 1 | 0 | 1 |
//     +---+---+---+
//         | 1 |
//         +---+
// Would become
// [2, 2, 1]
function convertToHeaps(game) {
	var heaps = [];
	// Check if game array is 2d
	if (game[0].constructor == Array) {
		// heap sizes are lengths of subarrays
		for (let i = 0; i < game.length; i++) {
			heaps.push(game[i].length);
		}
	}
	// If array is 1d, heap size is simple its length
	else {
		heaps.push(game.length);
	}
	return heaps;
}

function calculate_nim_sum(heaps) {
	// ^ is the bitwise XOR operator
	return heaps.reduce((a, b) => a ^ b, 0);
}

// Finds the number of moves that can generate a nim sum of 0
// from the current heaps
function calculate_num_0_nim_sum_moves(heaps) {
	let num_0_nim_sum_moves = 0;
	let nim_sum = calculate_nim_sum(heaps);
	for (let i = 0; i < heaps.length; i++) {
		// If the nimsum of the nimsum of the game and heapsize is less than heapsize
		// There is a move that results in a nimsum of 0 on that heap
		// And thus we increase the number of optimal moves by one
		if (heaps[i] - (nim_sum ^ heaps[i]) > 0) {
			num_0_nim_sum_moves++;
		}
	}
	return num_0_nim_sum_moves;
}

// Find an optimal move for the current game state
// If there is no optimal move,
// Return the move that results in the fewest number of optimal moves
// stemming from the resultant position
// This move will be of the form {row: -1, removals: -1}
function calculate_next_move(heaps) {
	// Calculate the nim_sum of the game
	let nim_sum = calculate_nim_sum(heaps);

	// If the nimsum is 0, if the other person plays perfectly they will win
	// For the 7 | 5 | 3 | 1 initial setup, the second player will always
	// win if they play optimally
	if (nim_sum == 0) {
		// We should return the move that leaves the least
		// number of possible ways for the opponent to get to a nimsum of 0
		let lowest_num_optimal_moves = Number.MAX_SAFE_INTEGER;
		let best_move;
		for (let i = 0; i < heaps.length; i++) {
			// For each heap, we try removing every possible number
			// We go through every move
			for (let r = 1; r < heaps[i]; r++) {
				heaps[i] -= r; // Mutating array
				// If number of 0 nimsum moves from current is lower than the min
				// Change the min and update the best move
				if (
					calculate_num_0_nim_sum_moves(heaps) <
					lowest_num_optimal_moves
				) {
					lowest_num_optimal_moves =
						calculate_num_0_nim_sum_moves(heaps);
					best_move = {
						row: i,
						removals: r,
					};
				}
				heaps[i] += r; // Returning array back to orginial state
			}
		}
		return best_move;
	}

	// Calculate the number of heaps greater than one
	let nums_heaps_greater_than_one = heaps.filter((x) => x > 1).length;

	// If there is one or less piles with more than one stick,
	// We are in the endgame and must adjust strategy
	if (nums_heaps_greater_than_one <= 1) {
		let heaps_left = heaps.filter((x) => x > 0).length;
		let heaps_left_is_odd = heaps_left % 2 == 1;
		let largest_heap = Math.max(...heaps);
		let index_of_largest_heap = heaps.indexOf(largest_heap);
		// If the largest heap is only 1 and there is one heap left
		// the opponent has won
		if (largest_heap == 1 && heaps_left == 1) {
			return false;
		}
		// If execution reaches this point, the computer has not lost
		// The state of the game consists of all ones and one larger heap
		// If there is an odd number of heaps, we reduce the largest heap to one
		// If there is and even number of heaps, we completely reduce the largest heap
		return {
			row: index_of_largest_heap,
			removals: largest_heap - (heaps_left_is_odd ? 1 : 0),
		};
	}

	// If execution reaches this point, we are not in the endgame
	// And we proceed as normal
	for (let i = 0; i < heaps.length; i++) {
		// If the nimsum of the nimsum of the game and heapsize is less than heapsize
		// There is a move that results in a nimsum of 0 on that heap
		if (heaps[i] - (nim_sum ^ heaps[i]) > 0) {
			console.log(nim_sum ^ heaps[i]);
			return {
				row: i,
				removals: heaps[i] - (nim_sum ^ heaps[i]),
			};
		}
	}
}
