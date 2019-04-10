var currentLevel = { "diff": 1, "level": 1 };

function resetLevel() {

}

function loadLevel(currentLevel) {
	var xSize = document.getElementById("xSize").value;
	var ySize = document.getElementById("ySize").value;
	var table = document.getElementById("suguru");

	clearElement(table);
	for (var y = 0; y < ySize; y++) {
		var row = table.insertRow();
		for (var x = 0; x < xSize; x++) {
			var cell = row.insertCell();
			cell.innerHTML = "bla";
		}
	}
}

// From https://stackoverflow.com/a/3955238/3141917
function clearElement(element) {
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}
}

