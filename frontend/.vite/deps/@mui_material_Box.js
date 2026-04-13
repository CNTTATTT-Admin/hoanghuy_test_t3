import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { K as useTheme, Q as require_jsx_runtime, W as ClassNameGenerator, Z as styled, a as identifier_default, at as styleFunctionSx, dt as clsx, ft as require_prop_types, s as createTheme } from "./styled-Cfnrj_1B.js";
import { t as extendSxProp } from "./extendSxProp-Bza6fQcu.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
//#region node_modules/@mui/system/esm/createBox/createBox.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function createBox(options = {}) {
	const { themeId, defaultTheme, defaultClassName = "MuiBox-root", generateClassName } = options;
	const BoxRoot = styled("div", { shouldForwardProp: (prop) => prop !== "theme" && prop !== "sx" && prop !== "as" })(styleFunctionSx);
	return /* @__PURE__ */ import_react.forwardRef(function Box(inProps, ref) {
		const theme = useTheme(defaultTheme);
		const { className, component = "div", ...other } = extendSxProp(inProps);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoxRoot, {
			as: component,
			ref,
			className: clsx(className, generateClassName ? generateClassName(defaultClassName) : defaultClassName),
			theme: themeId ? theme[themeId] || theme : theme,
			...other
		});
	});
}
//#endregion
//#region node_modules/@mui/material/esm/Box/boxClasses.js
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
var boxClasses = generateUtilityClasses("MuiBox", ["root"]);
//#endregion
//#region node_modules/@mui/material/esm/Box/Box.js
var Box = createBox({
	themeId: identifier_default,
	defaultTheme: createTheme(),
	defaultClassName: boxClasses.root,
	generateClassName: ClassNameGenerator.generate
});
Box.propTypes = {
	children: import_prop_types.default.node,
	component: import_prop_types.default.elementType,
	sx: import_prop_types.default.oneOfType([
		import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
			import_prop_types.default.func,
			import_prop_types.default.object,
			import_prop_types.default.bool
		])),
		import_prop_types.default.func,
		import_prop_types.default.object
	])
};
//#endregion
export { boxClasses, Box as default };

//# sourceMappingURL=@mui_material_Box.js.map