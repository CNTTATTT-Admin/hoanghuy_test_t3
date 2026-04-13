import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { Q as require_jsx_runtime, U as generateUtilityClass, dt as clsx, ft as require_prop_types, t as styled } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
import { t as useDefaultProps } from "./DefaultPropsProvider-BNz8xLZO.js";
//#region node_modules/@mui/material/esm/TableContainer/tableContainerClasses.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
function getTableContainerUtilityClass(slot) {
	return generateUtilityClass("MuiTableContainer", slot);
}
var tableContainerClasses = generateUtilityClasses("MuiTableContainer", ["root"]);
//#endregion
//#region node_modules/@mui/material/esm/TableContainer/TableContainer.js
var import_jsx_runtime = require_jsx_runtime();
var useUtilityClasses = (ownerState) => {
	const { classes } = ownerState;
	return composeClasses({ root: ["root"] }, getTableContainerUtilityClass, classes);
};
var TableContainerRoot = styled("div", {
	name: "MuiTableContainer",
	slot: "Root"
})({
	width: "100%",
	overflowX: "auto"
});
var TableContainer = /* @__PURE__ */ import_react.forwardRef(function TableContainer(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiTableContainer"
	});
	const { className, component = "div", ...other } = props;
	const ownerState = {
		...props,
		component
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableContainerRoot, {
		ref,
		as: component,
		className: clsx(useUtilityClasses(ownerState).root, className),
		ownerState,
		...other
	});
});
TableContainer.propTypes = {
	children: import_prop_types.default.node,
	classes: import_prop_types.default.object,
	className: import_prop_types.default.string,
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
export { TableContainer as default, getTableContainerUtilityClass, tableContainerClasses };

//# sourceMappingURL=@mui_material_TableContainer.js.map