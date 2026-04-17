import { r as __toESM } from "./react-TUYU05Ph.js";
import { G as GlobalStyles$1, Q as require_jsx_runtime, a as identifier_default, ft as require_prop_types, o as defaultTheme } from "./styled-Cfnrj_1B.js";
import { t as extendSxProp } from "./extendSxProp-Bza6fQcu.js";
//#region node_modules/@mui/material/esm/GlobalStyles/GlobalStyles.js
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
var import_jsx_runtime = require_jsx_runtime();
function GlobalStyles(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlobalStyles$1, {
		...props,
		defaultTheme,
		themeId: identifier_default
	});
}
GlobalStyles.propTypes = { styles: import_prop_types.default.oneOfType([
	import_prop_types.default.array,
	import_prop_types.default.func,
	import_prop_types.default.number,
	import_prop_types.default.object,
	import_prop_types.default.string,
	import_prop_types.default.bool
]) };
//#endregion
//#region node_modules/@mui/material/esm/zero-styled/index.js
function globalCss(styles) {
	return function GlobalStylesWrapper(props) {
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlobalStyles, { styles: typeof styles === "function" ? (theme) => styles({
			theme,
			...props
		}) : styles });
	};
}
function internal_createExtendSxProp() {
	return extendSxProp;
}
//#endregion
export { internal_createExtendSxProp as n, globalCss as t };

//# sourceMappingURL=zero-styled-BfBUcezv.js.map