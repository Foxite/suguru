function resetLevel() {
	loadLevelReference(currentLevel)
}

function nextLevel() {
	var numberInput = document.getElementById("levelNumber");
	numberInput.value++;
	var levelNumber = numberInput.value;

	loadLevel(document.getElementById("difficulty").value, levelNumber);
}

function loadLevelUI() {
	loadLevel(document.getElementById("difficulty").value, document.getElementById("levelNumber").value);
}

function loadLevel(diff, number) {
	currentLevel.diff = diff;
	currentLevel.level = number;
	loadLevelReference(currentLevel);
}

function loadLevelReference(levelReference) {
	document.getElementById("wintext").style.visibility = "hidden";

	var level = allLevels[levelReference.diff - 1][levelReference.level - 1];
	
	levelReference.xSize = parseInt(level[0]);
	levelReference.ySize = parseInt(level[1]);
	var area = levelReference.ySize * levelReference.xSize;
	levelReference.blocks = level.substring(2, 2 + area)
	levelReference.digits = level.substring(2 + area, level.length);
	
	clearElement(table);
	
	var xSize = levelReference.xSize;
	var ySize = levelReference.ySize;
	// Fill cells with digits
	// Also, find borders and set cell classes
	for (var y = 0; y < ySize; y++) {
		var row = table.insertRow();
		for (var x = 0; x < xSize; x++) {
			var cell = row.insertCell();
			var digit = levelReference.digits[x * ySize + y];
			if (digit == 0) {
				cell.setAttribute("contenteditable", "true");
				cell.onkeydown = onCellKeyDown;
				cell.onkeyup = onCellKeyUp;
			} else {
				cell.innerHTML = digit;
			}

			var block = levelReference.blocks[x * ySize + y];
			cell.setAttribute("data-x", x);
			cell.setAttribute("data-y", y);
			cell.setAttribute("data-block", block);

			if (y > 0 && levelReference.blocks[x * ySize + y - 1] != block) {
				// Top border
				cell.classList.add("border-top");
			}
			if (x > 0 && levelReference.blocks[(x - 1) * ySize + y] != block) {
				// Left border
				cell.classList.add("border-left");
			}
			if (y < ySize - 1 && levelReference.blocks[x * ySize + y + 1] != block) {
				// Bottom border
				cell.classList.add("border-bottom");
			}
			if (x < xSize - 1 && levelReference.blocks[(x + 1) * ySize + y] != block) {
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

function onCellKeyDown(event) {
	event.preventDefault();
	if (!event.repeat) {
		if (event.key >= 1 && event.key <= 9) {
			event.currentTarget.innerHTML = event.key;
		} else if (event.key == "Backspace" || event.key == "Delete" || event.key == " " || event.key == "0") {
			event.currentTarget.innerHTML = "";
		}
	}
}

function onCellKeyUp(event) {
	validateCell(event.currentTarget);
}

// Returns: if a given cell is not invalid.
function validateCell(cell) {
	var value = cell.innerHTML;
	if (value == 0) {
		// Reset validity classes
		for (var x = 0; x < currentLevel.xSize; x++) {
			for (var y = 0; y < currentLevel.ySize; y++) {
				var checkCell = getCell(x, y);
				checkCell.classList.remove("invalid");
			}
		}
		return true;
	}
	var x = parseInt(cell.getAttribute("data-x"));
	var y = parseInt(cell.getAttribute("data-y"));
	var block = parseInt(cell.getAttribute("data-block"));

	// Validate neighbors
	for (var xOffset = -1; xOffset <= 1; xOffset++) {
		for (var yOffset = -1; yOffset <= 1; yOffset++) {
			var checkX = x + xOffset;
			var checkY = y + yOffset;
			if (checkX < 0 || checkX >= currentLevel.xSize || checkY < 0 || checkY >= currentLevel.ySize || (xOffset == 0 && yOffset == 0)) {
				continue;
			}
			
			var checkCell = getCell(checkX, checkY);
			checkCell.classList.remove("invalid");
			if (checkCell.innerHTML == value) {
				cell.classList.add("invalid");
				checkCell.classList.add("invalid");
				return false;
			}
		}
	}

	// Validate block
	// Also check if the player won
	var cellsInBlock = 1;
	var won = true;
	for (var searchX = 0; searchX < currentLevel.xSize; searchX++) {
		for (var searchY = 0; searchY < currentLevel.ySize; searchY++) {
			if (searchX == x && searchY == y) {
				continue;
			}
			
			var checkCell = getCell(searchX, searchY);
			checkCell.classList.remove("invalid");

			if (checkCell.innerHTML == "") {
				won = false;
			}

			if (checkCell.getAttribute("data-block") == block) {
				cellsInBlock++;
				if (checkCell.innerHTML == value) {
					checkCell.classList.add("invalid");
					cell.classList.add("invalid");
					return false;
				}
			}
		}
	}

	if (value <= cellsInBlock) {
		cell.classList.remove("invalid");

		if (won) {
			console.log("Won");
			document.getElementById("wintext").style.visibility = null;
		}

		return true;
	} else {
		cell.classList.add("invalid");
		return false;
	}
}
