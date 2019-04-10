var currentLevel = { "diff": 1, "level": 1 };

var allLevels = [ levels1, levels2, levels3, levels4, levels5, levels6 ];

function resetLevel() {
	loadLevel(currentLevel)
}

function nextLevel() {
	var difficulty = document.getElementById("difficulty").value;
	if (currentLevel.diff == difficulty) {
		currentLevel.level++;
	} else {
		currentLevel.diff = difficulty;
		currentLevel.level = 1;
	}
	loadLevel(currentLevel);
}

function loadLevel(levelReference) {
	var level = allLevels[levelReference.diff][levelReference.level];
	
	var xSize = parseInt(level[0]);
	var ySize = parseInt(level[1]);
	var area = ySize * xSize;
	var blocks = level.substring(2, 2 + area)
	var digits = level.substring(2 + area, level.length);
	var table = document.getElementById("suguru");
	clearElement(table);

	// Fill cells with digits
	// Also, find borders and set cell classes
	for (var y = 0; y < ySize; y++) {
		var row = table.insertRow();
		for (var x = 0; x < xSize; x++) {
			var cell = row.insertCell();
			cell.innerHTML = digits[x * ySize + y];

			if (y > 0 && blocks[x * ySize + y - 1] != blocks[x * ySize + y]) {
				// Top border
				cell.classList.add("border-top");
			}
			if (x > 0 && blocks[(x - 1) * ySize + y] != blocks[x * ySize + y]) {
				// Left border
				cell.classList.add("border-left");
			}
			if (y < ySize - 1 && blocks[x * ySize + y + 1] != blocks[x * ySize + y]) {
				// Bottom border
				cell.classList.add("border-bottom");
			}
			if (x < xSize - 1 && blocks[(x + 1) * ySize + y] != blocks[x * ySize + y]) {
				// Right border
				cell.classList.add("border-right");
			}
		}
	}
}

// From https://stackoverflow.com/a/3955238/3141917
function clearElement(element) {
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}
}

