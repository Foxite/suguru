function switchTheme(element) {
	loadTheme(element.value);
	docCookies.setItem("theme", element.value);
}

function restoreTheme() {
	var theme = docCookies.getItem("theme");
	if (theme == null) {
		theme = "light";
	}
	loadTheme(theme);
	setCheckedValue(document.getElementsByName("theme"), theme);
}

function loadTheme(theme) {
	// Load CSS by JS
	// https://stackoverflow.com/a/577002/3141917
	var link = document.getElementById("theme");
	if (!link) {
		var head  = document.getElementsByTagName("head")[0];
		link  = document.createElement("link");
		head.appendChild(link);
	}

	link.id   = "theme";
	link.rel  = "stylesheet";
	link.type = "text/css";
	link.href = "suguru." + theme + ".css";
	link.media = "all";
}

// set the radio button with the given value as being checked
// do nothing if there are no radio buttons
// if the given value does not exist, all the radio buttons
// are reset to unchecked
// https://www.somacon.com/p143.php
function setCheckedValue(radioObj, newValue) {
	if(!radioObj)
		return;
	var radioLength = radioObj.length;
	if(radioLength == undefined) {
		radioObj.checked = (radioObj.value == newValue.toString());
		return;
	}
	for(var i = 0; i < radioLength; i++) {
		radioObj[i].checked = false;
		if(radioObj[i].value == newValue.toString()) {
			radioObj[i].checked = true;
		}
	}
}