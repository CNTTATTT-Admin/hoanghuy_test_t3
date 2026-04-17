import { t as ownerWindow } from "./ownerWindow-C0KgEvKm.js";
//#region node_modules/@mui/utils/esm/debounce/debounce.js
function debounce(func, wait = 166) {
	let timeout;
	function debounced(...args) {
		const later = () => {
			func.apply(this, args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	}
	debounced.clear = () => {
		clearTimeout(timeout);
	};
	return debounced;
}
//#endregion
//#region node_modules/@mui/material/esm/utils/debounce.js
var debounce_default = debounce;
//#endregion
//#region node_modules/@mui/material/esm/utils/ownerWindow.js
var ownerWindow_default = ownerWindow;
//#endregion
export { debounce_default as n, debounce as r, ownerWindow_default as t };

//# sourceMappingURL=ownerWindow-Be0gh_y7.js.map