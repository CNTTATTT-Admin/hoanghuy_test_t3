import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { Q as require_jsx_runtime, U as generateUtilityClass, dt as clsx, ft as require_prop_types, t as styled } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
import { t as memoTheme } from "./memoTheme-PLhiQ1dZ.js";
import { t as useDefaultProps } from "./DefaultPropsProvider-BNz8xLZO.js";
import { t as Tablelvl2Context } from "./Tablelvl2Context-DHJ4KbZL.js";
//#region node_modules/@mui/material/esm/TableRow/tableRowClasses.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
function getTableRowUtilityClass(slot) {
	return generateUtilityClass("MuiTableRow", slot);
}
var tableRowClasses = generateUtilityClasses("MuiTableRow", [
	"root",
	"selected",
	"hover",
	"head",
	"footer"
]);
//#endregion
//#region node_modules/@mui/material/esm/TableRow/TableRow.js
var import_jsx_runtime = require_jsx_runtime();
var useUtilityClasses = (ownerState) => {
	const { classes, selected, hover, head, footer } = ownerState;
	return composeClasses({ root: [
		"root",
		selected && "selected",
		hover && "hover",
		head && "head",
		footer && "footer"
	] }, getTableRowUtilityClass, classes);
};
var TableRowRoot = styled("tr", {
	name: "MuiTableRow",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			styles.root,
			ownerState.head && styles.head,
			ownerState.footer && styles.footer
		];
	}
})(memoTheme(({ theme }) => ({
	color: "inherit",
	display: "table-row",
	verticalAlign: "middle",
	outline: 0,
	[`&.${tableRowClasses.hover}:hover`]: { backgroundColor: (theme.vars || theme).palette.action.hover },
	[`&.${tableRowClasses.selected}`]: {
		backgroundColor: theme.alpha((theme.vars || theme).palette.primary.main, (theme.vars || theme).palette.action.selectedOpacity),
		"&:hover": { backgroundColor: theme.alpha((theme.vars || theme).palette.primary.main, `${(theme.vars || theme).palette.action.selectedOpacity} + ${(theme.vars || theme).palette.action.hoverOpacity}`) }
	}
})));
var defaultComponent = "tr";
/**
* Will automatically set dynamic row height
* based on the material table element parent (head, body, etc).
*/
var TableRow = /* @__PURE__ */ import_react.forwardRef(function TableRow(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiTableRow"
	});
	const { className, component = defaultComponent, hover = false, selected = false, ...other } = props;
	const tablelvl2 = import_react.useContext(Tablelvl2Context);
	const ownerState = {
		...props,
		component,
		hover,
		selected,
		head: tablelvl2 && tablelvl2.variant === "head",
		footer: tablelvl2 && tablelvl2.variant === "footer"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRowRoot, {
		as: component,
		ref,
		className: clsx(useUtilityClasses(ownerState).root, className),
		role: component === defaultComponent ? null : "row",
		ownerState,
		...other
	});
});
TableRow.propTypes = {
	children: import_prop_types.default.node,
	classes: import_prop_types.default.object,
	className: import_prop_types.default.string,
	component: import_prop_types.default.elementType,
	hover: import_prop_types.default.bool,
	selected: import_prop_types.default.bool,
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
export { TableRow as default, getTableRowUtilityClass, tableRowClasses };

//# sourceMappingURL=@mui_material_TableRow.js.map