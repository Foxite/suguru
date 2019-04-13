// Helper functions
var loopId = null;
var blockIndex = null;
var blockValuesPresent = null;
var blockSizes = null;
var nothingChanged = false;

function excludeValue(cell, value) {
	if (cell.textContent != "") {
		return;
	}

	var possibleValues = cell.getAttribute("data-possiblevalues");
	possibleValues = possibleValues.replace(value, "");

	if (possibleValues != cell.getAttribute("data-possiblevalues")) {
		nothingChanged = false;
	}

	cell.setAttribute("data-possiblevalues", possibleValues);

	if (possibleValues.length == 1) {
		setCell(cell, possibleValues);
	} else if (possibleValues.length == 0) {
		// Shouldn't happen
		throw new Error("Cell at " + cell.getAttribute("data-x") + ", " + cell.getAttribute("data-y") + " has no possible values");
	}
}

function setCell(cell, value) {
	cell.innerHTML = value;
	var block = cell.getAttribute("data-block");
	blockValuesPresent[block] += value;
	
	for (var i = 0; i < blockIndex[block].length; i++) {
		excludeValue(blockIndex[block][i], value);
	}

	nothingChanged = false;
}

function stop() {
	clearInterval(loopId);
	loopId = null;

	var enable = ["resetButton", "loadButton", "nextButton", "autoButton"];
	for (var i = 0; i < enable.length; i++) {
		document.getElementById(enable[i]).disabled = false;
	}
	document.getElementById("stopButton").disabled = true;
}

// All the characters in str in an array
function stringToArray(str) {
	var ret = [];
	for (var i = 0; i < str.length; i++) {
		ret.push(str[i]);
	}
	return ret;
}

function cellsAreNeighbors(cell1, cell2) {
	var x1 = parseInt(cell1.getAttribute("data-x"));
	var x2 = parseInt(cell2.getAttribute("data-x"));
	var y1 = parseInt(cell1.getAttribute("data-y"));
	var y2 = parseInt(cell2.getAttribute("data-y"));

	return Math.abs(x1 - x2) <= 1 && Math.abs(y1 - y2) <= 1;
}

// Like array.includes, but uses == instead of ===
function weakIncludes(arr, value) {
	return arr.some(item => item == value);
}

// Return all items in an array, without duplicates
// https://stackoverflow.com/a/1584377/3141917
function arrayUnique(array) {
    var a = array.concat();
    for (var i = 0; i < a.length; i++) {
        for (var j = i + 1; j < a.length; j++) {
            if (a[i] === a[j]) {
				a.splice(j--, 1);
			}
        }
    }

    return a;
}

// Algorithm
function solve() {
	var disable = ["resetButton", "loadButton", "nextButton", "autoButton"];
	for (var i = 0; i < disable.length; i++) {
		document.getElementById(disable[i]).disabled = true;
	}
	document.getElementById("stopButton").disabled = false;

	blockValuesPresent = {};
	blockSizes = {};
	blockIndex = {};

	// Setup part 1: initialize block index
	// The block index keeps track of what values are already present in each block, as well as the size of that block.
	for (var x = 0; x < currentLevel.xSize; x++) {
		for (var y = 0; y < currentLevel.ySize; y++) {
			var cell = getCell(x, y);
			var block = cell.getAttribute("data-block");
			if (block in blockSizes) {
				blockSizes[block]++;
				blockIndex[block].push(cell);
			} else {
				blockSizes[block] = 1;
				blockValuesPresent[block] = "";
				blockIndex[block] = [ cell ];
			}
		}
	}

	// Setup part 2: add cell value to block index (for non-empty cells), and initialize data-possiblevalues attribute (for empty cells)
	// This attribute represents what values the cell could possibly have.
	for (var x = 0; x < currentLevel.xSize; x++) {
		for (var y = 0; y < currentLevel.ySize; y++) {
			var cell = getCell(x, y);
			var block = cell.getAttribute("data-block");

			if (cell.textContent == "") {
				cell.setAttribute("data-possiblevalues", "123456789".substring(0, blockSizes[block]));
			} else {
				blockValuesPresent[block] += cell.innerHTML;
			}
		}
	}

	// Setup part 3: fill in possiblevalues based on block index
	for (var x = 0; x < currentLevel.xSize; x++) {
		for (var y = 0; y < currentLevel.ySize; y++) {
			var cell = getCell(x, y);
			var block = cell.getAttribute("data-block");

			if (cell.textContent == "") {
				for (var i = 0; i < blockValuesPresent[block].length; i++) {
					excludeValue(cell, blockValuesPresent[block][i]);
				}
			}
		}
	}
	loopId = setInterval(function() {
		try {
			nothingChanged = true;

			analyze();

			if (nothingChanged) {
				console.log("Unable to solve");
				stop();
			}

			var solved = true;
			solvedCheck:
			for (var x = 0; x < currentLevel.xSize; x++) {
				for (var y = 0; y < currentLevel.ySize; y++) {
					if (getCell(x, y).textContent == "") {
						solved = false;
						break solvedCheck;
					}
				}
			}

			if (solved) {
				console.log("Auto solve complete");
				stop();
				/*setTimeout(function() {
					nextLevel();
					solve();
				}, 2000);*/
			}
		} catch (e) {
			console.log("Error occured, stopping loop");
			stop();
			throw e;
		}
	}, 500);
}

// Techniques:
//  Implemented:
//   Cells that can only have one digit because of neighbors
//   Cells that can only have one digit because of block
//   Cells that can not have a digit because if it did, an adjacent block could not have that digit
//   Only cell in block that can hold a digit
function analyze() {
	// Go through empty cells and determine which cells cannot have a certain digit
	for (var x = 0; x < currentLevel.xSize; x++) {
		cellCheck:
		for (var y = 0; y < currentLevel.ySize; y++) {
			var cell = getCell(x, y);
			if (cell.textContent != "") {
				continue cellCheck;
			}
			
			// Technique 1: neighbor exclusion
			// As literally stated in the rules, a cell cannot have a digit that any of its neighbors have.
			for (var xOffset = -1; xOffset <= 1; xOffset++) {
				neighborCheck:
				for (var yOffset = -1; yOffset <= 1; yOffset++) {
					var neighborX = x + xOffset;
					var neighborY = y + yOffset;
					if (neighborX < 0 || neighborX >= currentLevel.xSize || neighborY < 0 || neighborY >= currentLevel.ySize || (xOffset == 0 && yOffset == 0)) {
						continue neighborCheck;
					}
					
					var neighborCell = getCell(neighborX, neighborY);
					if (neighborCell.textContent != "") {
						excludeValue(cell, neighborCell.textContent);
					}
				}
			}

			var block = cell.getAttribute("data-block");
			// Technique 2: block exclusion
			// As also literally stated in the rules, a cell cannot have a digit if any other cell in its block also has that digit.
			for (var i = 0; i < blockValuesPresent[block].length; i++) {
				excludeValue(cell, blockValuesPresent[block][i]);
			}
			
			// Technique 3: Cells that can not have a digit because if it did, an adjacent block could not have that digit
			// What we need to ask: Does cell border all cells in a certain block that can hold a certain digit? If so, cell cannot have that digit.
			var exclusions = {}; // For each neighboring block, an array of digits that all neighbors in that block can hold
			for (var xOffset = -1; xOffset <= 1; xOffset++) {
				neighborCheck:
				for (var yOffset = -1; yOffset <= 1; yOffset++) {
					var neighborX = x + xOffset;
					var neighborY = y + yOffset;
					if (neighborX < 0 || neighborX >= currentLevel.xSize ||
						neighborY < 0 || neighborY >= currentLevel.ySize ||
						(xOffset == 0 && yOffset == 0)) {
						continue neighborCheck;
					}
					
					var neighborCell = getCell(neighborX, neighborY);

					if (neighborCell.textContent != "") {
						continue neighborCheck;
					}

					var neighborBlock = neighborCell.getAttribute("data-block");

					if (neighborBlock == block) {
						continue neighborCheck;
					}

					var neighborCellPVs = stringToArray(neighborCell.getAttribute("data-possiblevalues"));

					if (neighborBlock in exclusions) {
						exclusions[neighborBlock] = arrayUnique(exclusions[neighborBlock].concat(neighborCellPVs));
					} else {
						exclusions[neighborBlock] = stringToArray(neighborCell.getAttribute("data-possiblevalues"));
					}
				}
			}
			// At this point, exclusions contains, for each neighboring block, all values that can be held by all of the neighboring cells in that block.
			// What we want is to remove values that can also be held by non-neighboring cells in those blocks.

			for (var exclBlock in exclusions) {
				if (exclusions[exclBlock].length != 0) {
					// Remove values that can also be held by non-neighboring cells in a block
					blockSearch:
					for (var checkCellIdx = 0; checkCellIdx < blockIndex[exclBlock].length; checkCellIdx++) {
						if (blockIndex[exclBlock][checkCellIdx].textContent != "" || cellsAreNeighbors(cell, blockIndex[exclBlock][checkCellIdx])) {
							continue blockSearch;
						}
						var possibleValues = stringToArray(blockIndex[exclBlock][checkCellIdx].getAttribute("data-possiblevalues"));
						exclusions[exclBlock] = exclusions[exclBlock].filter(val => possibleValues.indexOf(val) == -1);
					}

					// If not all exclusions have been removed, then apply those.
					for (var i = 0; i < exclusions[exclBlock].length; i++) {
						excludeValue(cell, exclusions[exclBlock][i]);
					}
				}
			}
		}
	}

	// Technique 4: Cells that are the only one in their blocks that can hold a certain digit
	for (blockKey in blockIndex) {
		digitBlockCheck:
		for (var digit = 1; digit <= blockSizes[blockKey]; digit++) {
			var cellsThatCanHoldDigit = [];
			digitCellCheck:
			for (var i = 0; i < blockIndex[blockKey].length; i++) {
				var cell = blockIndex[blockKey][i];
				if (cell.textContent != "") {
					if (cell.textContent == digit) {
						continue digitBlockCheck;
					} else {
						continue digitCellCheck;
					}
				}
				var possibleValues = stringToArray(cell.getAttribute("data-possiblevalues"));
				if (weakIncludes(possibleValues, digit)) {
					cellsThatCanHoldDigit.push(cell);
				}
			}
			if (cellsThatCanHoldDigit.length == 1) {
				var cell = cellsThatCanHoldDigit[0];
				var possibleValues = stringToArray(cell.getAttribute("data-possiblevalues"));
				for (var i = 0; i < possibleValues.length; i++) {
					if (possibleValues[i] != digit) {
						excludeValue(cellsThatCanHoldDigit[0], possibleValues[i]);
					}
				}
			}
		}
	}
}
