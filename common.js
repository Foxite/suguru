var table = null;
var currentLevel = { "diff": 1, "level": 1, "xSize": 0, "ySize": 0, "blocks": "", "digits": "" };
var allLevels = [ levels1, levels2, levels3, levels4, levels5, levels6 ];

function onLoad() {
	table = document.getElementById("suguru");
}

function getCell(x, y) {
	return table.firstChild.childNodes[y].childNodes[x];
}
