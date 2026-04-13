import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { Q as require_jsx_runtime, U as generateUtilityClass, dt as clsx, ft as require_prop_types, t as styled } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
import { t as memoTheme } from "./memoTheme-PLhiQ1dZ.js";
import { t as useDefaultProps } from "./DefaultPropsProvider-BNz8xLZO.js";
import { t as ListContext } from "./ListContext-CDJw1JA6.js";
//#region node_modules/@mui/material/esm/ListItemIcon/listItemIconClasses.js
function getListItemIconUtilityClass(slot) {
	return generateUtilityClass("MuiListItemIcon", slot);
}
var listItemIconClasses = generateUtilityClasses("MuiListItemIcon", ["root", "alignItemsFlexStart"]);
//#endregion
//#region node_modules/@mui/material/esm/ListItemIcon/ListItemIcon.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
var import_jsx_runtime = require_jsx_runtime();
var useUtilityClasses = (ownerState) => {
	const { alignItems, classes } = ownerState;
	return composeClasses({ root: ["root", alignItems === "flex-start" && "alignItemsFlexStart"] }, getListItemIconUtilityClass, classes);
};
var ListItemIconRoot = styled("div", {
	name: "MuiListItemIcon",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [styles.root, ownerState.alignItems === "flex-start" && styles.alignItemsFlexStart];
	}
})(memoTheme(({ theme }) => ({
	minWidth: 56,
	color: (theme.vars || theme).palette.action.active,
	flexShrink: 0,
	display: "inline-flex",
	variants: [{
		props: { alignItems: "flex-start" },
		style: { marginTop: 8 }
	}]
})));
/**
* A simple wrapper to apply `List` styles to an `Icon` or `SvgIcon`.
*/
var ListItemIcon = /* @__PURE__ */ import_react.forwardRef(function ListItemIcon(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiListItemIcon"
	});
	const { className, ...other } = props;
	const context = import_react.useContext(ListContext);
	const ownerState = {
		...props,
		alignItems: context.alignItems
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListItemIconRoot, {
		className: clsx(useUtilityClasses(ownerState).root, className),
		ownerState,
		ref,
		...other
	});
});
ListItemIcon.propTypes = {
	children: import_prop_types.default.node,
	classes: import_prop_types.default.object,
	className: import_prop_types.default.string,
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
export { getListItemIconUtilityClass as n, listItemIconClasses as r, ListItemIcon as t };

//# sourceMappingURL=ListItemIcon-B_RadQBI.js.map