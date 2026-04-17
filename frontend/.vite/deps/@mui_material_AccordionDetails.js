import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { Q as require_jsx_runtime, U as generateUtilityClass, dt as clsx, ft as require_prop_types, t as styled } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
import { t as memoTheme } from "./memoTheme-PLhiQ1dZ.js";
import { t as useDefaultProps } from "./DefaultPropsProvider-BNz8xLZO.js";
//#region node_modules/@mui/material/esm/AccordionDetails/accordionDetailsClasses.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
function getAccordionDetailsUtilityClass(slot) {
	return generateUtilityClass("MuiAccordionDetails", slot);
}
var accordionDetailsClasses = generateUtilityClasses("MuiAccordionDetails", ["root"]);
//#endregion
//#region node_modules/@mui/material/esm/AccordionDetails/AccordionDetails.js
var import_jsx_runtime = require_jsx_runtime();
var useUtilityClasses = (ownerState) => {
	const { classes } = ownerState;
	return composeClasses({ root: ["root"] }, getAccordionDetailsUtilityClass, classes);
};
var AccordionDetailsRoot = styled("div", {
	name: "MuiAccordionDetails",
	slot: "Root"
})(memoTheme(({ theme }) => ({ padding: theme.spacing(1, 2, 2) })));
var AccordionDetails = /* @__PURE__ */ import_react.forwardRef(function AccordionDetails(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiAccordionDetails"
	});
	const { className, ...other } = props;
	const ownerState = props;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionDetailsRoot, {
		className: clsx(useUtilityClasses(ownerState).root, className),
		ref,
		ownerState,
		...other
	});
});
AccordionDetails.propTypes = {
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
export { accordionDetailsClasses, AccordionDetails as default, getAccordionDetailsUtilityClass };

//# sourceMappingURL=@mui_material_AccordionDetails.js.map