import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { Q as require_jsx_runtime, dt as clsx, ft as require_prop_types, t as styled } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { t as useDefaultProps } from "./DefaultPropsProvider-BNz8xLZO.js";
import { t as Typography } from "./Typography-CrsVQyni.js";
import { t as DialogContext } from "./DialogContext-CHKa0_dM.js";
import { n as getDialogTitleUtilityClass, t as dialogTitleClasses } from "./dialogTitleClasses-CYof_xD4.js";
//#region node_modules/@mui/material/esm/DialogTitle/DialogTitle.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
var import_jsx_runtime = require_jsx_runtime();
var useUtilityClasses = (ownerState) => {
	const { classes } = ownerState;
	return composeClasses({ root: ["root"] }, getDialogTitleUtilityClass, classes);
};
var DialogTitleRoot = styled(Typography, {
	name: "MuiDialogTitle",
	slot: "Root"
})({
	padding: "16px 24px",
	flex: "0 0 auto"
});
var DialogTitle = /* @__PURE__ */ import_react.forwardRef(function DialogTitle(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiDialogTitle"
	});
	const { className, id: idProp, ...other } = props;
	const ownerState = props;
	const classes = useUtilityClasses(ownerState);
	const { titleId = idProp } = import_react.useContext(DialogContext);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitleRoot, {
		component: "h2",
		className: clsx(classes.root, className),
		ownerState,
		ref,
		variant: "h6",
		id: idProp ?? titleId,
		...other
	});
});
DialogTitle.propTypes = {
	children: import_prop_types.default.node,
	classes: import_prop_types.default.object,
	className: import_prop_types.default.string,
	id: import_prop_types.default.string,
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
export { DialogTitle as default, dialogTitleClasses, getDialogTitleUtilityClass };

//# sourceMappingURL=@mui_material_DialogTitle.js.map