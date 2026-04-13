import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { Q as require_jsx_runtime, U as generateUtilityClass, dt as clsx, ft as require_prop_types, t as styled } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
import { t as memoTheme } from "./memoTheme-PLhiQ1dZ.js";
import { t as useDefaultProps } from "./DefaultPropsProvider-BNz8xLZO.js";
import { t as TableContext } from "./TableContext-DfqVFF_5.js";
//#region node_modules/@mui/material/esm/Table/tableClasses.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
function getTableUtilityClass(slot) {
	return generateUtilityClass("MuiTable", slot);
}
var tableClasses = generateUtilityClasses("MuiTable", ["root", "stickyHeader"]);
//#endregion
//#region node_modules/@mui/material/esm/Table/Table.js
var import_jsx_runtime = require_jsx_runtime();
var useUtilityClasses = (ownerState) => {
	const { classes, stickyHeader } = ownerState;
	return composeClasses({ root: ["root", stickyHeader && "stickyHeader"] }, getTableUtilityClass, classes);
};
var TableRoot = styled("table", {
	name: "MuiTable",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [styles.root, ownerState.stickyHeader && styles.stickyHeader];
	}
})(memoTheme(({ theme }) => ({
	display: "table",
	width: "100%",
	borderCollapse: "collapse",
	borderSpacing: 0,
	"& caption": {
		...theme.typography.body2,
		padding: theme.spacing(2),
		color: (theme.vars || theme).palette.text.secondary,
		textAlign: "left",
		captionSide: "bottom"
	},
	variants: [{
		props: ({ ownerState }) => ownerState.stickyHeader,
		style: { borderCollapse: "separate" }
	}]
})));
var defaultComponent = "table";
var Table = /* @__PURE__ */ import_react.forwardRef(function Table(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiTable"
	});
	const { className, component = defaultComponent, padding = "normal", size = "medium", stickyHeader = false, ...other } = props;
	const ownerState = {
		...props,
		component,
		padding,
		size,
		stickyHeader
	};
	const classes = useUtilityClasses(ownerState);
	const table = import_react.useMemo(() => ({
		padding,
		size,
		stickyHeader
	}), [
		padding,
		size,
		stickyHeader
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableContext.Provider, {
		value: table,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRoot, {
			as: component,
			role: component === defaultComponent ? null : "table",
			ref,
			className: clsx(classes.root, className),
			ownerState,
			...other
		})
	});
});
Table.propTypes = {
	children: import_prop_types.default.node,
	classes: import_prop_types.default.object,
	className: import_prop_types.default.string,
	component: import_prop_types.default.elementType,
	padding: import_prop_types.default.oneOf([
		"checkbox",
		"none",
		"normal"
	]),
	size: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["medium", "small"]), import_prop_types.default.string]),
	stickyHeader: import_prop_types.default.bool,
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
export { Table as default, getTableUtilityClass, tableClasses };

//# sourceMappingURL=@mui_material_Table.js.map