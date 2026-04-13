import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { Q as require_jsx_runtime, U as generateUtilityClass, dt as clsx, ft as require_prop_types, t as styled } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
import { t as memoTheme } from "./memoTheme-PLhiQ1dZ.js";
import { t as useDefaultProps } from "./DefaultPropsProvider-BNz8xLZO.js";
import { t as capitalize_default } from "./capitalize-C7D-9Jwf.js";
import { t as TableContext } from "./TableContext-DfqVFF_5.js";
import { t as Tablelvl2Context } from "./Tablelvl2Context-DHJ4KbZL.js";
//#region node_modules/@mui/material/esm/TableCell/tableCellClasses.js
function getTableCellUtilityClass(slot) {
	return generateUtilityClass("MuiTableCell", slot);
}
var tableCellClasses = generateUtilityClasses("MuiTableCell", [
	"root",
	"head",
	"body",
	"footer",
	"sizeSmall",
	"sizeMedium",
	"paddingCheckbox",
	"paddingNone",
	"alignLeft",
	"alignCenter",
	"alignRight",
	"alignJustify",
	"stickyHeader"
]);
//#endregion
//#region node_modules/@mui/material/esm/TableCell/TableCell.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
var import_jsx_runtime = require_jsx_runtime();
var useUtilityClasses = (ownerState) => {
	const { classes, variant, align, padding, size, stickyHeader } = ownerState;
	return composeClasses({ root: [
		"root",
		variant,
		stickyHeader && "stickyHeader",
		align !== "inherit" && `align${capitalize_default(align)}`,
		padding !== "normal" && `padding${capitalize_default(padding)}`,
		`size${capitalize_default(size)}`
	] }, getTableCellUtilityClass, classes);
};
var TableCellRoot = styled("td", {
	name: "MuiTableCell",
	slot: "Root",
	overridesResolver: (props, styles) => {
		const { ownerState } = props;
		return [
			styles.root,
			styles[ownerState.variant],
			styles[`size${capitalize_default(ownerState.size)}`],
			ownerState.padding !== "normal" && styles[`padding${capitalize_default(ownerState.padding)}`],
			ownerState.align !== "inherit" && styles[`align${capitalize_default(ownerState.align)}`],
			ownerState.stickyHeader && styles.stickyHeader
		];
	}
})(memoTheme(({ theme }) => ({
	...theme.typography.body2,
	display: "table-cell",
	verticalAlign: "inherit",
	borderBottom: theme.vars ? `1px solid ${theme.vars.palette.TableCell.border}` : `1px solid
    ${theme.palette.mode === "light" ? theme.lighten(theme.alpha(theme.palette.divider, 1), .88) : theme.darken(theme.alpha(theme.palette.divider, 1), .68)}`,
	textAlign: "left",
	padding: 16,
	variants: [
		{
			props: { variant: "head" },
			style: {
				color: (theme.vars || theme).palette.text.primary,
				lineHeight: theme.typography.pxToRem(24),
				fontWeight: theme.typography.fontWeightMedium
			}
		},
		{
			props: { variant: "body" },
			style: { color: (theme.vars || theme).palette.text.primary }
		},
		{
			props: { variant: "footer" },
			style: {
				color: (theme.vars || theme).palette.text.secondary,
				lineHeight: theme.typography.pxToRem(21),
				fontSize: theme.typography.pxToRem(12)
			}
		},
		{
			props: { size: "small" },
			style: {
				padding: "6px 16px",
				[`&.${tableCellClasses.paddingCheckbox}`]: {
					width: 24,
					padding: "0 12px 0 16px",
					"& > *": { padding: 0 }
				}
			}
		},
		{
			props: { padding: "checkbox" },
			style: {
				width: 48,
				padding: "0 0 0 4px"
			}
		},
		{
			props: { padding: "none" },
			style: { padding: 0 }
		},
		{
			props: { align: "left" },
			style: { textAlign: "left" }
		},
		{
			props: { align: "center" },
			style: { textAlign: "center" }
		},
		{
			props: { align: "right" },
			style: {
				textAlign: "right",
				flexDirection: "row-reverse"
			}
		},
		{
			props: { align: "justify" },
			style: { textAlign: "justify" }
		},
		{
			props: ({ ownerState }) => ownerState.stickyHeader,
			style: {
				position: "sticky",
				top: 0,
				zIndex: 2,
				backgroundColor: (theme.vars || theme).palette.background.default
			}
		}
	]
})));
/**
* The component renders a `<th>` element when the parent context is a header
* or otherwise a `<td>` element.
*/
var TableCell = /* @__PURE__ */ import_react.forwardRef(function TableCell(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiTableCell"
	});
	const { align = "inherit", className, component: componentProp, padding: paddingProp, scope: scopeProp, size: sizeProp, sortDirection, variant: variantProp, ...other } = props;
	const table = import_react.useContext(TableContext);
	const tablelvl2 = import_react.useContext(Tablelvl2Context);
	const isHeadCell = tablelvl2 && tablelvl2.variant === "head";
	let component;
	if (componentProp) component = componentProp;
	else component = isHeadCell ? "th" : "td";
	let scope = scopeProp;
	if (component === "td") scope = void 0;
	else if (!scope && isHeadCell) scope = "col";
	const variant = variantProp || tablelvl2 && tablelvl2.variant;
	const ownerState = {
		...props,
		align,
		component,
		padding: paddingProp || (table && table.padding ? table.padding : "normal"),
		size: sizeProp || (table && table.size ? table.size : "medium"),
		sortDirection,
		stickyHeader: variant === "head" && table && table.stickyHeader,
		variant
	};
	const classes = useUtilityClasses(ownerState);
	let ariaSort = null;
	if (sortDirection) ariaSort = sortDirection === "asc" ? "ascending" : "descending";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCellRoot, {
		as: component,
		ref,
		className: clsx(classes.root, className),
		"aria-sort": ariaSort,
		scope,
		ownerState,
		...other
	});
});
TableCell.propTypes = {
	align: import_prop_types.default.oneOf([
		"center",
		"inherit",
		"justify",
		"left",
		"right"
	]),
	children: import_prop_types.default.node,
	classes: import_prop_types.default.object,
	className: import_prop_types.default.string,
	component: import_prop_types.default.elementType,
	padding: import_prop_types.default.oneOf([
		"checkbox",
		"none",
		"normal"
	]),
	scope: import_prop_types.default.string,
	size: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["medium", "small"]), import_prop_types.default.string]),
	sortDirection: import_prop_types.default.oneOf([
		"asc",
		"desc",
		false
	]),
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
		"body",
		"footer",
		"head"
	]), import_prop_types.default.string])
};
//#endregion
export { getTableCellUtilityClass as n, tableCellClasses as r, TableCell as t };

//# sourceMappingURL=TableCell-Dd9Y3146.js.map