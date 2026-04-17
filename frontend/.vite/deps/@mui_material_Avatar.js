import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { Q as require_jsx_runtime, U as generateUtilityClass, dt as clsx, ft as require_prop_types, t as styled } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
import { t as memoTheme } from "./memoTheme-PLhiQ1dZ.js";
import { t as useDefaultProps } from "./DefaultPropsProvider-BNz8xLZO.js";
import { t as useSlot } from "./useSlot-B3bIL9ix.js";
import { t as createSvgIcon } from "./createSvgIcon-DyCjgR6Z.js";
//#region node_modules/@mui/material/esm/internal/svg-icons/Person.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
var import_jsx_runtime = require_jsx_runtime();
var Person_default = createSvgIcon(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" }), "Person");
//#endregion
//#region node_modules/@mui/material/esm/Avatar/avatarClasses.js
function getAvatarUtilityClass(slot) {
	return generateUtilityClass("MuiAvatar", slot);
}
var avatarClasses = generateUtilityClasses("MuiAvatar", [
	"root",
	"colorDefault",
	"circular",
	"rounded",
	"square",
	"img",
	"fallback"
]);
//#endregion
//#region node_modules/@mui/material/esm/Avatar/Avatar.js
var useUtilityClasses = (ownerState) => {
	const { classes, variant, colorDefault } = ownerState;
	return composeClasses({
		root: [
			"root",
			variant,
			colorDefault && "colorDefault"
		],
		img: ["img"],
		fallback: ["fallback"]
	}, getAvatarUtilityClass, classes);
};
var AvatarRoot = styled("div", {
	name: "MuiAvatar",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			styles.root,
			styles[ownerState.variant],
			ownerState.colorDefault && styles.colorDefault
		];
	}
})(memoTheme(({ theme }) => ({
	position: "relative",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	flexShrink: 0,
	width: 40,
	height: 40,
	fontFamily: theme.typography.fontFamily,
	fontSize: theme.typography.pxToRem(20),
	lineHeight: 1,
	borderRadius: "50%",
	overflow: "hidden",
	userSelect: "none",
	variants: [
		{
			props: { variant: "rounded" },
			style: { borderRadius: (theme.vars || theme).shape.borderRadius }
		},
		{
			props: { variant: "square" },
			style: { borderRadius: 0 }
		},
		{
			props: { colorDefault: true },
			style: {
				color: (theme.vars || theme).palette.background.default,
				...theme.vars ? { backgroundColor: theme.vars.palette.Avatar.defaultBg } : {
					backgroundColor: theme.palette.grey[400],
					...theme.applyStyles("dark", { backgroundColor: theme.palette.grey[600] })
				}
			}
		}
	]
})));
var AvatarImg = styled("img", {
	name: "MuiAvatar",
	slot: "Img"
})({
	width: "100%",
	height: "100%",
	textAlign: "center",
	objectFit: "cover",
	color: "transparent",
	textIndent: 1e4
});
var AvatarFallback = styled(Person_default, {
	name: "MuiAvatar",
	slot: "Fallback"
})({
	width: "75%",
	height: "75%"
});
function useLoaded({ crossOrigin, referrerPolicy, src, srcSet }) {
	const [loaded, setLoaded] = import_react.useState(false);
	import_react.useEffect(() => {
		if (!src && !srcSet) return;
		setLoaded(false);
		let active = true;
		const image = new Image();
		image.onload = () => {
			if (!active) return;
			setLoaded("loaded");
		};
		image.onerror = () => {
			if (!active) return;
			setLoaded("error");
		};
		image.crossOrigin = crossOrigin;
		image.referrerPolicy = referrerPolicy;
		image.src = src;
		if (srcSet) image.srcset = srcSet;
		return () => {
			active = false;
		};
	}, [
		crossOrigin,
		referrerPolicy,
		src,
		srcSet
	]);
	return loaded;
}
var Avatar = /* @__PURE__ */ import_react.forwardRef(function Avatar(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiAvatar"
	});
	const { alt, children: childrenProp, className, component = "div", slots = {}, slotProps = {}, imgProps, sizes, src, srcSet, variant = "circular", ...other } = props;
	let children = null;
	const ownerState = {
		...props,
		component,
		variant
	};
	const loaded = useLoaded({
		...imgProps,
		...typeof slotProps.img === "function" ? slotProps.img(ownerState) : slotProps.img,
		src,
		srcSet
	});
	const hasImg = src || srcSet;
	const hasImgNotFailing = hasImg && loaded !== "error";
	ownerState.colorDefault = !hasImgNotFailing;
	delete ownerState.ownerState;
	const classes = useUtilityClasses(ownerState);
	const [RootSlot, rootSlotProps] = useSlot("root", {
		ref,
		className: clsx(classes.root, className),
		elementType: AvatarRoot,
		externalForwardedProps: {
			slots,
			slotProps,
			component,
			...other
		},
		ownerState
	});
	const [ImgSlot, imgSlotProps] = useSlot("img", {
		className: classes.img,
		elementType: AvatarImg,
		externalForwardedProps: {
			slots,
			slotProps: { img: {
				...imgProps,
				...slotProps.img
			} }
		},
		additionalProps: {
			alt,
			src,
			srcSet,
			sizes
		},
		ownerState
	});
	const [FallbackSlot, fallbackSlotProps] = useSlot("fallback", {
		className: classes.fallback,
		elementType: AvatarFallback,
		externalForwardedProps: {
			slots,
			slotProps
		},
		shouldForwardComponentProp: true,
		ownerState
	});
	if (hasImgNotFailing) children = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImgSlot, { ...imgSlotProps });
	else if (!!childrenProp || childrenProp === 0) children = childrenProp;
	else if (hasImg && alt) children = alt[0];
	else children = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FallbackSlot, { ...fallbackSlotProps });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RootSlot, {
		...rootSlotProps,
		children
	});
});
Avatar.propTypes = {
	alt: import_prop_types.default.string,
	children: import_prop_types.default.node,
	classes: import_prop_types.default.object,
	className: import_prop_types.default.string,
	component: import_prop_types.default.elementType,
	imgProps: import_prop_types.default.object,
	sizes: import_prop_types.default.string,
	slotProps: import_prop_types.default.shape({
		fallback: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		img: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		root: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object])
	}),
	slots: import_prop_types.default.shape({
		fallback: import_prop_types.default.elementType,
		img: import_prop_types.default.elementType,
		root: import_prop_types.default.elementType
	}),
	src: import_prop_types.default.string,
	srcSet: import_prop_types.default.string,
	sx: import_prop_types.default.oneOfType([
		import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
			import_prop_types.default.func,
			import_prop_types.default.object,
			import_prop_types.default.bool
		])),
		import_prop_types.default.func,
		import_prop_types.default.object
	]),
	variant: import_prop_types.default.oneOfType([import_prop_types.default.oneOf([
		"circular",
		"rounded",
		"square"
	]), import_prop_types.default.string])
};
//#endregion
export { avatarClasses, Avatar as default, getAvatarUtilityClass };

//# sourceMappingURL=@mui_material_Avatar.js.map