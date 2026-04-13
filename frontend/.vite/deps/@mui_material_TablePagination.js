import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { Q as require_jsx_runtime, T as useRtl, U as generateUtilityClass, dt as clsx, ft as require_prop_types, t as styled } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
import { t as memoTheme } from "./memoTheme-PLhiQ1dZ.js";
import { t as useDefaultProps } from "./DefaultPropsProvider-BNz8xLZO.js";
import { t as Toolbar } from "./Toolbar-BleUmwyZ.js";
import { i as integerPropType } from "./Paper-C4ekxLBX.js";
import { t as chainPropTypes } from "./chainPropTypes-Cq73wFmt.js";
import { t as useSlot } from "./useSlot-B3bIL9ix.js";
import { t as createSvgIcon } from "./createSvgIcon-DyCjgR6Z.js";
import { t as useId_default } from "./useId-Yj8UrI_X.js";
import { t as IconButton } from "./IconButton-8Pu1hMfn.js";
import { a as InputBase, t as Select } from "./Select-B-hzmRVJ.js";
import { n as KeyboardArrowLeft_default, t as KeyboardArrowRight_default } from "./KeyboardArrowRight-BpArmhYP.js";
import { t as MenuItem } from "./MenuItem-ChgRx3BV.js";
import { t as TableCell } from "./TableCell-Dd9Y3146.js";
//#region node_modules/@mui/material/esm/internal/svg-icons/LastPage.js
var import_jsx_runtime = require_jsx_runtime();
var LastPage_default = createSvgIcon(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z" }), "LastPage");
//#endregion
//#region node_modules/@mui/material/esm/internal/svg-icons/FirstPage.js
/**
* @ignore - internal component.
*/
var FirstPage_default = createSvgIcon(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z" }), "FirstPage");
//#endregion
//#region node_modules/@mui/material/esm/TablePaginationActions/tablePaginationActionsClasses.js
function getTablePaginationActionsUtilityClass(slot) {
	return generateUtilityClass("MuiTablePaginationActions", slot);
}
generateUtilityClasses("MuiTablePaginationActions", ["root"]);
//#endregion
//#region node_modules/@mui/material/esm/TablePaginationActions/TablePaginationActions.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
var useUtilityClasses$1 = (ownerState) => {
	const { classes } = ownerState;
	return composeClasses({ root: ["root"] }, getTablePaginationActionsUtilityClass, classes);
};
var TablePaginationActionsRoot = styled("div", {
	name: "MuiTablePaginationActions",
	slot: "Root"
})({});
var TablePaginationActions = /* @__PURE__ */ import_react.forwardRef(function TablePaginationActions(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiTablePaginationActions"
	});
	const { backIconButtonProps, className, count, disabled = false, getItemAriaLabel, nextIconButtonProps, onPageChange, page, rowsPerPage, showFirstButton, showLastButton, slots = {}, slotProps = {}, ...other } = props;
	const isRtl = useRtl();
	const classes = useUtilityClasses$1(props);
	const handleFirstPageButtonClick = (event) => {
		onPageChange(event, 0);
	};
	const handleBackButtonClick = (event) => {
		onPageChange(event, page - 1);
	};
	const handleNextButtonClick = (event) => {
		onPageChange(event, page + 1);
	};
	const handleLastPageButtonClick = (event) => {
		onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
	};
	const FirstButton = slots.firstButton ?? IconButton;
	const LastButton = slots.lastButton ?? IconButton;
	const NextButton = slots.nextButton ?? IconButton;
	const PreviousButton = slots.previousButton ?? IconButton;
	const FirstButtonIcon = slots.firstButtonIcon ?? FirstPage_default;
	const LastButtonIcon = slots.lastButtonIcon ?? LastPage_default;
	const NextButtonIcon = slots.nextButtonIcon ?? KeyboardArrowRight_default;
	const PreviousButtonIcon = slots.previousButtonIcon ?? KeyboardArrowLeft_default;
	const FirstButtonSlot = isRtl ? LastButton : FirstButton;
	const PreviousButtonSlot = isRtl ? NextButton : PreviousButton;
	const NextButtonSlot = isRtl ? PreviousButton : NextButton;
	const LastButtonSlot = isRtl ? FirstButton : LastButton;
	const firstButtonSlotProps = isRtl ? slotProps.lastButton : slotProps.firstButton;
	const previousButtonSlotProps = isRtl ? slotProps.nextButton : slotProps.previousButton;
	const nextButtonSlotProps = isRtl ? slotProps.previousButton : slotProps.nextButton;
	const lastButtonSlotProps = isRtl ? slotProps.firstButton : slotProps.lastButton;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TablePaginationActionsRoot, {
		ref,
		className: clsx(classes.root, className),
		...other,
		children: [
			showFirstButton && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FirstButtonSlot, {
				onClick: handleFirstPageButtonClick,
				disabled: disabled || page === 0,
				"aria-label": getItemAriaLabel("first", page),
				title: getItemAriaLabel("first", page),
				...firstButtonSlotProps,
				children: isRtl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LastButtonIcon, { ...slotProps.lastButtonIcon }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FirstButtonIcon, { ...slotProps.firstButtonIcon })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviousButtonSlot, {
				onClick: handleBackButtonClick,
				disabled: disabled || page === 0,
				color: "inherit",
				"aria-label": getItemAriaLabel("previous", page),
				title: getItemAriaLabel("previous", page),
				...previousButtonSlotProps ?? backIconButtonProps,
				children: isRtl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NextButtonIcon, { ...slotProps.nextButtonIcon }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviousButtonIcon, { ...slotProps.previousButtonIcon })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NextButtonSlot, {
				onClick: handleNextButtonClick,
				disabled: disabled || (count !== -1 ? page >= Math.ceil(count / rowsPerPage) - 1 : false),
				color: "inherit",
				"aria-label": getItemAriaLabel("next", page),
				title: getItemAriaLabel("next", page),
				...nextButtonSlotProps ?? nextIconButtonProps,
				children: isRtl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviousButtonIcon, { ...slotProps.previousButtonIcon }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NextButtonIcon, { ...slotProps.nextButtonIcon })
			}),
			showLastButton && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LastButtonSlot, {
				onClick: handleLastPageButtonClick,
				disabled: disabled || page >= Math.ceil(count / rowsPerPage) - 1,
				"aria-label": getItemAriaLabel("last", page),
				title: getItemAriaLabel("last", page),
				...lastButtonSlotProps,
				children: isRtl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FirstButtonIcon, { ...slotProps.firstButtonIcon }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LastButtonIcon, { ...slotProps.lastButtonIcon })
			})
		]
	});
});
TablePaginationActions.propTypes = {
	backIconButtonProps: import_prop_types.default.object,
	children: import_prop_types.default.node,
	classes: import_prop_types.default.object,
	className: import_prop_types.default.string,
	count: import_prop_types.default.number.isRequired,
	disabled: import_prop_types.default.bool,
	getItemAriaLabel: import_prop_types.default.func.isRequired,
	nextIconButtonProps: import_prop_types.default.object,
	onPageChange: import_prop_types.default.func.isRequired,
	page: import_prop_types.default.number.isRequired,
	rowsPerPage: import_prop_types.default.number.isRequired,
	showFirstButton: import_prop_types.default.bool.isRequired,
	showLastButton: import_prop_types.default.bool.isRequired,
	slotProps: import_prop_types.default.shape({
		firstButton: import_prop_types.default.object,
		firstButtonIcon: import_prop_types.default.object,
		lastButton: import_prop_types.default.object,
		lastButtonIcon: import_prop_types.default.object,
		nextButton: import_prop_types.default.object,
		nextButtonIcon: import_prop_types.default.object,
		previousButton: import_prop_types.default.object,
		previousButtonIcon: import_prop_types.default.object
	}),
	slots: import_prop_types.default.shape({
		firstButton: import_prop_types.default.elementType,
		firstButtonIcon: import_prop_types.default.elementType,
		lastButton: import_prop_types.default.elementType,
		lastButtonIcon: import_prop_types.default.elementType,
		nextButton: import_prop_types.default.elementType,
		nextButtonIcon: import_prop_types.default.elementType,
		previousButton: import_prop_types.default.elementType,
		previousButtonIcon: import_prop_types.default.elementType
	})
};
//#endregion
//#region node_modules/@mui/material/esm/TablePagination/tablePaginationClasses.js
function getTablePaginationUtilityClass(slot) {
	return generateUtilityClass("MuiTablePagination", slot);
}
var tablePaginationClasses = generateUtilityClasses("MuiTablePagination", [
	"root",
	"toolbar",
	"spacer",
	"selectLabel",
	"selectRoot",
	"select",
	"selectIcon",
	"input",
	"menuItem",
	"displayedRows",
	"actions"
]);
//#endregion
//#region node_modules/@mui/material/esm/TablePagination/TablePagination.js
var _InputBase;
var TablePaginationRoot = styled(TableCell, {
	name: "MuiTablePagination",
	slot: "Root"
})(memoTheme(({ theme }) => ({
	overflow: "auto",
	color: (theme.vars || theme).palette.text.primary,
	fontSize: theme.typography.pxToRem(14),
	"&:last-child": { padding: 0 }
})));
var TablePaginationToolbar = styled(Toolbar, {
	name: "MuiTablePagination",
	slot: "Toolbar",
	overridesResolver: (props, styles) => ({
		[`& .${tablePaginationClasses.actions}`]: styles.actions,
		...styles.toolbar
	})
})(memoTheme(({ theme }) => ({
	minHeight: 52,
	paddingRight: 2,
	[`${theme.breakpoints.up("xs")} and (orientation: landscape)`]: { minHeight: 52 },
	[theme.breakpoints.up("sm")]: {
		minHeight: 52,
		paddingRight: 2
	},
	[`& .${tablePaginationClasses.actions}`]: {
		flexShrink: 0,
		marginLeft: 20
	}
})));
var TablePaginationSpacer = styled("div", {
	name: "MuiTablePagination",
	slot: "Spacer"
})({ flex: "1 1 100%" });
var TablePaginationSelectLabel = styled("p", {
	name: "MuiTablePagination",
	slot: "SelectLabel"
})(memoTheme(({ theme }) => ({
	...theme.typography.body2,
	flexShrink: 0
})));
var TablePaginationSelect = styled(Select, {
	name: "MuiTablePagination",
	slot: "Select",
	overridesResolver: (props, styles) => ({
		[`& .${tablePaginationClasses.selectIcon}`]: styles.selectIcon,
		[`& .${tablePaginationClasses.select}`]: styles.select,
		...styles.input,
		...styles.selectRoot
	})
})({
	color: "inherit",
	fontSize: "inherit",
	flexShrink: 0,
	marginRight: 32,
	marginLeft: 8,
	[`& .${tablePaginationClasses.select}`]: {
		paddingLeft: 8,
		paddingRight: 24,
		textAlign: "right",
		textAlignLast: "right"
	}
});
var TablePaginationMenuItem = styled(MenuItem, {
	name: "MuiTablePagination",
	slot: "MenuItem"
})({});
var TablePaginationDisplayedRows = styled("p", {
	name: "MuiTablePagination",
	slot: "DisplayedRows"
})(memoTheme(({ theme }) => ({
	...theme.typography.body2,
	flexShrink: 0
})));
function defaultLabelDisplayedRows({ from, to, count }) {
	return `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`;
}
function defaultGetAriaLabel(type) {
	return `Go to ${type} page`;
}
var useUtilityClasses = (ownerState) => {
	const { classes } = ownerState;
	return composeClasses({
		root: ["root"],
		toolbar: ["toolbar"],
		spacer: ["spacer"],
		selectLabel: ["selectLabel"],
		select: ["select"],
		input: ["input"],
		selectIcon: ["selectIcon"],
		menuItem: ["menuItem"],
		displayedRows: ["displayedRows"],
		actions: ["actions"]
	}, getTablePaginationUtilityClass, classes);
};
/**
* A `TableCell` based component for placing inside `TableFooter` for pagination.
*/
var TablePagination = /* @__PURE__ */ import_react.forwardRef(function TablePagination(inProps, ref) {
	const props = useDefaultProps({
		props: inProps,
		name: "MuiTablePagination"
	});
	const { ActionsComponent = TablePaginationActions, backIconButtonProps, colSpan: colSpanProp, component = TableCell, count, disabled = false, getItemAriaLabel = defaultGetAriaLabel, labelDisplayedRows = defaultLabelDisplayedRows, labelRowsPerPage = "Rows per page:", nextIconButtonProps, onPageChange, onRowsPerPageChange, page, rowsPerPage, rowsPerPageOptions = [
		10,
		25,
		50,
		100
	], SelectProps = {}, showFirstButton = false, showLastButton = false, slotProps = {}, slots = {}, ...other } = props;
	const ownerState = props;
	const classes = useUtilityClasses(ownerState);
	const selectProps = slotProps?.select ?? SelectProps;
	const MenuItemComponent = selectProps.native ? "option" : TablePaginationMenuItem;
	let colSpan;
	if (component === TableCell || component === "td") colSpan = colSpanProp || 1e3;
	const selectId = useId_default(selectProps.id);
	const labelId = useId_default(selectProps.labelId);
	const getLabelDisplayedRowsTo = () => {
		if (count === -1) return (page + 1) * rowsPerPage;
		return rowsPerPage === -1 ? count : Math.min(count, (page + 1) * rowsPerPage);
	};
	const externalForwardedProps = {
		slots,
		slotProps
	};
	const [RootSlot, rootSlotProps] = useSlot("root", {
		ref,
		className: classes.root,
		elementType: TablePaginationRoot,
		externalForwardedProps: {
			...externalForwardedProps,
			component,
			...other
		},
		ownerState,
		additionalProps: { colSpan }
	});
	const [ToolbarSlot, toolbarSlotProps] = useSlot("toolbar", {
		className: classes.toolbar,
		elementType: TablePaginationToolbar,
		externalForwardedProps,
		ownerState
	});
	const [SpacerSlot, spacerSlotProps] = useSlot("spacer", {
		className: classes.spacer,
		elementType: TablePaginationSpacer,
		externalForwardedProps,
		ownerState
	});
	const [SelectLabelSlot, selectLabelSlotProps] = useSlot("selectLabel", {
		className: classes.selectLabel,
		elementType: TablePaginationSelectLabel,
		externalForwardedProps,
		ownerState,
		additionalProps: { id: labelId }
	});
	const [SelectSlot, selectSlotProps] = useSlot("select", {
		className: classes.select,
		elementType: TablePaginationSelect,
		externalForwardedProps,
		ownerState
	});
	const [MenuItemSlot, menuItemSlotProps] = useSlot("menuItem", {
		className: classes.menuItem,
		elementType: MenuItemComponent,
		externalForwardedProps,
		ownerState
	});
	const [DisplayedRows, displayedRowsProps] = useSlot("displayedRows", {
		className: classes.displayedRows,
		elementType: TablePaginationDisplayedRows,
		externalForwardedProps,
		ownerState
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RootSlot, {
		...rootSlotProps,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ToolbarSlot, {
			...toolbarSlotProps,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpacerSlot, { ...spacerSlotProps }),
				rowsPerPageOptions.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectLabelSlot, {
					...selectLabelSlotProps,
					children: labelRowsPerPage
				}),
				rowsPerPageOptions.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectSlot, {
					variant: "standard",
					...!selectProps.variant && { input: _InputBase || (_InputBase = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputBase, {})) },
					value: rowsPerPage,
					onChange: onRowsPerPageChange,
					id: selectId,
					labelId,
					...selectProps,
					classes: {
						...selectProps.classes,
						root: clsx(classes.input, classes.selectRoot, (selectProps.classes || {}).root),
						select: clsx(classes.select, (selectProps.classes || {}).select),
						icon: clsx(classes.selectIcon, (selectProps.classes || {}).icon)
					},
					disabled,
					...selectSlotProps,
					children: rowsPerPageOptions.map((rowsPerPageOption) => /* @__PURE__ */ (0, import_react.createElement)(MenuItemSlot, {
						...menuItemSlotProps,
						key: rowsPerPageOption.label ? rowsPerPageOption.label : rowsPerPageOption,
						value: rowsPerPageOption.value ? rowsPerPageOption.value : rowsPerPageOption
					}, rowsPerPageOption.label ? rowsPerPageOption.label : rowsPerPageOption))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DisplayedRows, {
					...displayedRowsProps,
					children: labelDisplayedRows({
						from: count === 0 ? 0 : page * rowsPerPage + 1,
						to: getLabelDisplayedRowsTo(),
						count: count === -1 ? -1 : count,
						page
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionsComponent, {
					className: classes.actions,
					backIconButtonProps,
					count,
					nextIconButtonProps,
					onPageChange,
					page,
					rowsPerPage,
					showFirstButton,
					showLastButton,
					slotProps: slotProps.actions,
					slots: slots.actions,
					getItemAriaLabel,
					disabled
				})
			]
		})
	});
});
TablePagination.propTypes = {
	ActionsComponent: import_prop_types.default.elementType,
	backIconButtonProps: import_prop_types.default.object,
	classes: import_prop_types.default.object,
	colSpan: import_prop_types.default.number,
	component: import_prop_types.default.elementType,
	count: integerPropType.isRequired,
	disabled: import_prop_types.default.bool,
	getItemAriaLabel: import_prop_types.default.func,
	labelDisplayedRows: import_prop_types.default.func,
	labelRowsPerPage: import_prop_types.default.node,
	nextIconButtonProps: import_prop_types.default.object,
	onPageChange: import_prop_types.default.func.isRequired,
	onRowsPerPageChange: import_prop_types.default.func,
	page: chainPropTypes(integerPropType.isRequired, (props) => {
		const { count, page, rowsPerPage } = props;
		if (count === -1) return null;
		const newLastPage = Math.max(0, Math.ceil(count / rowsPerPage) - 1);
		if (page < 0 || page > newLastPage) return /* @__PURE__ */ new Error(`MUI: The page prop of a TablePagination is out of range (0 to ${newLastPage}, but page is ${page}).`);
		return null;
	}),
	rowsPerPage: integerPropType.isRequired,
	rowsPerPageOptions: import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.shape({
		label: import_prop_types.default.string.isRequired,
		value: import_prop_types.default.number.isRequired
	})]).isRequired),
	SelectProps: import_prop_types.default.object,
	showFirstButton: import_prop_types.default.bool,
	showLastButton: import_prop_types.default.bool,
	slotProps: import_prop_types.default.shape({
		actions: import_prop_types.default.shape({
			firstButton: import_prop_types.default.object,
			firstButtonIcon: import_prop_types.default.object,
			lastButton: import_prop_types.default.object,
			lastButtonIcon: import_prop_types.default.object,
			nextButton: import_prop_types.default.object,
			nextButtonIcon: import_prop_types.default.object,
			previousButton: import_prop_types.default.object,
			previousButtonIcon: import_prop_types.default.object
		}),
		displayedRows: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		menuItem: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		root: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		select: import_prop_types.default.object,
		selectLabel: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		spacer: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]),
		toolbar: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object])
	}),
	slots: import_prop_types.default.shape({
		actions: import_prop_types.default.shape({
			firstButton: import_prop_types.default.elementType,
			firstButtonIcon: import_prop_types.default.elementType,
			lastButton: import_prop_types.default.elementType,
			lastButtonIcon: import_prop_types.default.elementType,
			nextButton: import_prop_types.default.elementType,
			nextButtonIcon: import_prop_types.default.elementType,
			previousButton: import_prop_types.default.elementType,
			previousButtonIcon: import_prop_types.default.elementType
		}),
		displayedRows: import_prop_types.default.elementType,
		menuItem: import_prop_types.default.elementType,
		root: import_prop_types.default.elementType,
		select: import_prop_types.default.elementType,
		selectLabel: import_prop_types.default.elementType,
		spacer: import_prop_types.default.elementType,
		toolbar: import_prop_types.default.elementType
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
export { TablePagination as default, getTablePaginationUtilityClass, tablePaginationClasses };

//# sourceMappingURL=@mui_material_TablePagination.js.map