import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
//#region node_modules/@mui/utils/esm/isMuiElement/isMuiElement.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
function isMuiElement(element, muiNames) {
	return /* @__PURE__ */ import_react.isValidElement(element) && muiNames.indexOf(element.type.muiName ?? element.type?._payload?.value?.muiName) !== -1;
}
//#endregion
export { isMuiElement as t };

//# sourceMappingURL=isMuiElement-BRNofDVk.js.map