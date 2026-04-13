import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { Q as require_jsx_runtime, U as generateUtilityClass, dt as clsx, ft as require_prop_types, t as styled } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
import { t as useDefaultProps } from "./DefaultPropsProvider-BNz8xLZO.js";
import { t as Paper } from "./Paper-C4ekxLBX.js";
import { t as chainPropTypes } from "./chainPropTypes-Cq73wFmt.js";
//#region node_modules/@mui/material/esm/Card/cardClasses.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
function getCardUtilityClass(slot) {
	return generateUtilityClass("MuiCard", slot);
}
var cardClasses = generateUtilityClasses("MuiCard", ["root"]);
//#endregion
//#region node_modules/@mui/material/esm/Card/Card.js
var import_jsx_runtime = require_jsx_runtime();
var useUtilityClasses = (ownerState) => {
	const { classes } = ownerState;
	return composeClasses({ root: ["root"] }, getCardUtilityClass, classes);
};
var CardRoot = styled(Paper, {
	name: "MuiCard",
	slot: "Root"
})({ overflow: "hidden" });
var Card = /* @__PURE__ */ import_react.forwardRef(function Card(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiCard"
	});
	const { className, raised = false, ...other } = props;
	const ownerState = {
		...props,
		raised
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardRoot, {
		className: clsx(useUtilityClasses(ownerState).root, className),
		elevation: raised ? 8 : void 0,
		ref,
		ownerState,
		...other
	});
});
Card.propTypes = {
	children: import_prop_types.default.node,
	classes: import_prop_types.default.object,
	className: import_prop_types.default.string,
	raised: chainPropTypes(import_prop_types.default.bool, (props) => {
		if (props.raised && props.variant === "outlined") return /* @__PURE__ */ new Error("MUI: Combining `raised={true}` with `variant=\"outlined\"` has no effect.");
		return null;
	}),
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
export { cardClasses, Card as default, getCardUtilityClass };

//# sourceMappingURL=@mui_material_Card.js.map