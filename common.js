var table = null;

function onLoad() {
	table = document.getElementById("suguru");
}

function getCell(x, y) {
	return table.firstChild.childNodes[y].childNodes[x];
}
