import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { Q as require_jsx_runtime, U as generateUtilityClass, dt as clsx, ft as require_prop_types, t as styled } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
import { t as useDefaultProps } from "./DefaultPropsProvider-BNz8xLZO.js";
import { t as Tablelvl2Context } from "./Tablelvl2Context-DHJ4KbZL.js";
//#region node_modules/@mui/material/esm/TableHead/tableHeadClasses.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
function getTableHeadUtilityClass(slot) {
	return generateUtilityClass("MuiTableHead", slot);
}
var tableHeadClasses = generateUtilityClasses("MuiTableHead", ["root"]);
//#endregion
//#region node_modules/@mui/material/esm/TableHead/TableHead.js
var import_jsx_runtime = require_jsx_runtime();
var useUtilityClasses = (ownerState) => {
	const { classes } = ownerState;
	return composeClasses({ root: ["root"] }, getTableHeadUtilityClass, classes);
};
var TableHeadRoot = styled("thead", {
	name: "MuiTableHead",
	slot: "Root"
})({ display: "table-header-group" });
var tablelvl2 = { variant: "head" };
var defaultComponent = "thead";
var TableHead = /* @__PURE__ */ import_react.forwardRef(function TableHead(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiTableHead"
	});
	const { className, component = defaultComponent, ...other } = props;
	const ownerState = {
		...props,
		component
	};
	const classes = useUtilityClasses(ownerState);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tablelvl2Context.Provider, {
		value: tablelvl2,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeadRoot, {
			as: component,
			className: clsx(classes.root, className),
			ref,
			role: component === defaultComponent ? null : "rowgroup",
			ownerState,
			...other
		})
	});
});
TableHead.propTypes = {
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
export { TableHead as default, getTableHeadUtilityClass, tableHeadClasses };

//# sourceMappingURL=@mui_material_TableHead.js.map