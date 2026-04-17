import { U as generateUtilityClass } from "./styled-Cfnrj_1B.js";
//#region node_modules/@mui/utils/esm/generateUtilityClasses/generateUtilityClasses.js
function generateUtilityClasses(componentName, slots, globalStatePrefix = "Mui") {
	const result = {};
	slots.forEach((slot) => {
		result[slot] = generateUtilityClass(componentName, slot, globalStatePrefix);
	});
	return result;
}
//#endregion
export { generateUtilityClasses as t };

//# sourceMappingURL=generateUtilityClasses-D3p2lmXT.js.map