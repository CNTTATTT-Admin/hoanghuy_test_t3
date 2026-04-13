//#region node_modules/@mui/utils/esm/unsupportedProp/unsupportedProp.js
function unsupportedProp(props, propName, componentName, location, propFullName) {
	const propFullNameSafe = propFullName || propName;
	if (typeof props[propName] !== "undefined") return /* @__PURE__ */ new Error(`The prop \`${propFullNameSafe}\` is not supported. Please remove it.`);
	return null;
}
//#endregion
//#region node_modules/@mui/material/esm/utils/unsupportedProp.js
var unsupportedProp_default = unsupportedProp;
//#endregion
export { unsupportedProp_default as t };

//# sourceMappingURL=unsupportedProp-dilcjf8r.js.map