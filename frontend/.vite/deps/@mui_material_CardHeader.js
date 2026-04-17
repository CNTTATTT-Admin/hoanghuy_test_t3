import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { Q as require_jsx_runtime, U as generateUtilityClass, ft as require_prop_types, t as styled } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
import { t as useDefaultProps } from "./DefaultPropsProvider-BNz8xLZO.js";
import { t as useSlot } from "./useSlot-B3bIL9ix.js";
import { r as typographyClasses, t as Typography } from "./Typography-CrsVQyni.js";
//#region node_modules/@mui/material/esm/CardHeader/cardHeaderClasses.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
function getCardHeaderUtilityClass(slot) {
	return generateUtilityClass("MuiCardHeader", slot);
}
var cardHeaderClasses = generateUtilityClasses("MuiCardHeader", [
	"root",
	"avatar",
	"action",
	"content",
	"title",
	"subheader"
]);
//#endregion
//#region node_modules/@mui/material/esm/CardHeader/CardHeader.js
var import_jsx_runtime = require_jsx_runtime();
var useUtilityClasses = (ownerState) => {
	const { classes } = ownerState;
	return composeClasses({
		root: ["root"],
		avatar: ["avatar"],
		action: ["action"],
		content: ["content"],
		title: ["title"],
		subheader: ["subheader"]
	}, getCardHeaderUtilityClass, classes);
};
var CardHeaderRoot = styled("div", {
	name: "MuiCardHeader",
	slot: "Root",
	overridesResolver: (props, styles) => {
		return [
			{ [`& .${cardHeaderClasses.title}`]: styles.title },
			{ [`& .${cardHeaderClasses.subheader}`]: styles.subheader },
			styles.root
		];
	}
})({
	display: "flex",
	alignItems: "center",
	padding: 16
});
var CardHeaderAvatar = styled("div", {
	name: "MuiCardHeader",
	slot: "Avatar"
})({
	display: "flex",
	flex: "0 0 auto",
	marginRight: 16
});
var CardHeaderAction = styled("div", {
	name: "MuiCardHeader",
	slot: "Action"
})({
	flex: "0 0 auto",
	alignSelf: "flex-start",
	marginTop: -4,
	marginRight: -8,
	marginBottom: -4
});
var CardHeaderContent = styled("div", {
	name: "MuiCardHeader",
	slot: "Content"
})({
	flex: "1 1 auto",
	[`.${typographyClasses.root}:where(& .${cardHeaderClasses.title}), .${typographyClasses.root}:where(& .${cardHeaderClasses.subheader})`]: { display: "block" }
});
var CardHeader = /* @__PURE__ */ import_react.forwardRef(function CardHeader(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiCardHeader"
	});
	const { action, avatar, component = "div", disableTypography = false, subheader: subheaderProp, subheaderTypographyProps, title: titleProp, titleTypographyProps, slots = {}, slotProps = {}, ...other } = props;
	const ownerState = {
		...props,
		component,
		disableTypography
	};
	const classes = useUtilityClasses(ownerState);
	const externalForwardedProps = {
		slots,
		slotProps: {
			title: titleTypographyProps,
			subheader: subheaderTypographyProps,
			...slotProps
		}
	};
	let title = titleProp;
	const [TitleSlot, titleSlotProps] = useSlot("title", {
		className: classes.title,
		elementType: Typography,
		externalForwardedProps,
		ownerState,
		additionalProps: {
			variant: avatar ? "body2" : "h5",
			component: "span"
		}
	});
	if (title != null && title.type !== Typography && !disableTypography) title = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleSlot, {
		...titleSlotProps,
		children: title
	});
	let subheader = subheaderProp;
	const [SubheaderSlot, subheaderSlotProps] = useSlot("subheader", {
		className: classes.subheader,
		elementType: Typography,
		externalForwardedProps,
		ownerState,
		additionalProps: {
			variant: avatar ? "body2" : "body1",
			color: "textSecondary",
			component: "span"
		}
	});
	if (subheader != null && subheader.type !== Typography && !disableTypography) subheader = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubheaderSlot, {
		...subheaderSlotProps,
		children: subheader
	});
	const [RootSlot, rootSlotProps] = useSlot("root", {
		ref,
		className: classes.root,
		elementType: CardHeaderRoot,
		externalForwardedProps: {
			...externalForwardedProps,
			...other,
			component
		},
		ownerState
	});
	const [AvatarSlot, avatarSlotProps] = useSlot("avatar", {
		className: classes.avatar,
		elementType: CardHeaderAvatar,
		externalForwardedProps,
		ownerState
	});
	const [ContentSlot, contentSlotProps] = useSlot("content", {
		className: classes.content,
		elementType: CardHeaderContent,
		externalForwardedProps,
		ownerState
	});
	const [ActionSlot, actionSlotProps] = useSlot("action", {
		className: classes.action,
		elementType: CardHeaderAction,
		externalForwardedProps,
		ownerState
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RootSlot, {
		...rootSlotProps,
		children: [
			avatar && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarSlot, {
				...avatarSlotProps,
				children: avatar
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ContentSlot, {
				...contentSlotProps,
				children: [title, subheader]
			}),
			action && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionSlot, {
				...actionSlotProps,
				children: action
			})
		]
	});
});
CardHeader.propTypes = {
	action: import_prop_types.default.node,
	avatar: import_prop_types.default.node,
	children: import_prop_types.default.node,
	classes: import_prop_types.default.object,
	component: import_prop_types.default.elementType,
	disableTypography: import_prop_types.default.bool,
	slotProps: import_prop_types.default.shape({
		action: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		avatar: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		content: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		root: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		subheader: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		title: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object])
	}),
	slots: import_prop_types.default.shape({
		action: import_prop_types.default.elementType,
		avatar: import_prop_types.default.elementType,
		content: import_prop_types.default.elementType,
		root: import_prop_types.default.elementType,
		subheader: import_prop_types.default.elementType,
		title: import_prop_types.default.elementType
	}),
	subheader: import_prop_types.default.node,
	subheaderTypographyProps: import_prop_types.default.object,
	sx: import_prop_types.default.oneOfType([
		import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
			import_prop_types.default.func,
			import_prop_types.default.object,
			import_prop_types.default.bool
		])),
		import_prop_types.default.func,
		import_prop_types.default.object
	]),
	title: import_prop_types.default.node,
	titleTypographyProps: import_prop_types.default.object
};
//#endregion
export { cardHeaderClasses, CardHeader as default, getCardHeaderUtilityClass };

//# sourceMappingURL=@mui_material_CardHeader.js.map