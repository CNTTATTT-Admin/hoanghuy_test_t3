import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { Q as require_jsx_runtime, S as useId, U as generateUtilityClass, ft as require_prop_types, i as useTheme, it as _extends, t as styled } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { d as useThemeProps } from "./styles-2xPq3NO2.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
import { At as DEFAULT_X_AXIS_KEY, C as useChartId, Ct as number_default, Dt as useChartVisibilityManager, E as useYAxes, Et as selectorChartSeriesProcessed, M as getBarDimensions, N as getBandSize, Nt as createSelector, O as useStore, P as getColor, Q as useChartZAxis, S as useSvgRef, T as useXAxes, Z as useChartHighlight, _ as selectorChartSeriesHighlightedItem, _t as selectorChartYAxis, a as ChartsOverlay, c as ChartsLegend, ct as useChartCartesianAxis, d as useAnimate, et as useChartKeyboardNavigation, f as ANIMATION_TIMING_FUNCTION, g as selectorChartIsSeriesHighlighted, gt as selectorChartXAxis, h as selectorChartIsSeriesFaded, ht as getSVGPoint, i as ChartsSurface, it as selectorChartsItemIsFocused, jt as DEFAULT_Y_AXIS_KEY, k as useChartContext, kt as selectorChartDrawingArea, l as ChartsTooltip, m as useItemHighlighted, mt as useChartInteraction, n as useChartContainerProps, nt as useChartBrush, o as useSkipAnimation, r as ChartDataProvider, s as useInteractionItemProps, t as ChartsWrapper, tt as useChartTooltip, u as useFocusedItem, v as selectorChartSeriesUnfadedItem, w as useDrawingArea, wt as warnOnce, x as useAllSeriesOfType, yt as isBandScale } from "./ChartsWrapper-D-1cORDO.js";
import { r as _objectWithoutPropertiesLoose } from "./TransitionGroupContext-CmouUOv0.js";
import { t as useEventCallback } from "./useEventCallback-DApYgXZO.js";
import { a as useInternalIsZoomInteracting, i as ChartsAxis, n as ChartsClipPath, r as ChartsAxisHighlight, t as ChartsGrid } from "./ChartsGrid-Ra5GowwI.js";
import { t as useSlotProps } from "./useSlotProps-CORw1pTM.js";
//#region node_modules/@mui/x-charts/esm/hooks/useBarSeries.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
var import_jsx_runtime = require_jsx_runtime();
/**
* Get access to the internal state of bar series.
* The returned object contains:
* - series: a mapping from ids to series attributes.
* - seriesOrder: the array of series ids.
* - stackingGroups: the array of stacking groups. Each group contains the series ids stacked and the strategy to use.
* @returns the bar series
*/
function useBarSeriesContext() {
	return useAllSeriesOfType("bar");
}
//#endregion
//#region node_modules/@mui/x-charts/esm/hooks/animation/useAnimateBar.js
function barPropsInterpolator(from, to) {
	const interpolateX = number_default(from.x, to.x);
	const interpolateY = number_default(from.y, to.y);
	const interpolateWidth = number_default(from.width, to.width);
	const interpolateHeight = number_default(from.height, to.height);
	return (t) => {
		return {
			x: interpolateX(t),
			y: interpolateY(t),
			width: interpolateWidth(t),
			height: interpolateHeight(t)
		};
	};
}
/**
* Animates a bar from the start of the axis (x-axis for vertical layout, y-axis for horizontal layout) to its
* final position.
*
* The props object also accepts a `ref` which will be merged with the ref returned from this hook. This means you can
* pass the ref returned by this hook to the `path` element and the `ref` provided as argument will also be called.
*/
function useAnimateBar(props) {
	const initialProps = {
		x: props.layout === "vertical" ? props.x : props.xOrigin,
		y: props.layout === "vertical" ? props.yOrigin : props.y,
		width: props.layout === "vertical" ? props.width : 0,
		height: props.layout === "vertical" ? 0 : props.height
	};
	return useAnimate({
		x: props.x,
		y: props.y,
		width: props.width,
		height: props.height
	}, {
		createInterpolator: barPropsInterpolator,
		applyProps(element, animatedProps) {
			element.setAttribute("x", animatedProps.x.toString());
			element.setAttribute("y", animatedProps.y.toString());
			element.setAttribute("width", animatedProps.width.toString());
			element.setAttribute("height", animatedProps.height.toString());
		},
		transformProps: (p) => p,
		initialProps,
		skip: props.skipAnimation,
		ref: props.ref
	});
}
//#endregion
//#region node_modules/@mui/x-charts/esm/hooks/animation/useAnimateBarLabel.js
function barLabelPropsInterpolator(from, to) {
	const interpolateX = number_default(from.x, to.x);
	const interpolateY = number_default(from.y, to.y);
	const interpolateWidth = number_default(from.width, to.width);
	const interpolateHeight = number_default(from.height, to.height);
	return (t) => ({
		x: interpolateX(t),
		y: interpolateY(t),
		width: interpolateWidth(t),
		height: interpolateHeight(t)
	});
}
/**
* Animates a bar label from the start of the axis (x-axis for vertical layout, y-axis for horizontal layout) to the
* center of the bar it belongs to.
* The label is horizontally centered within the bar when the layout is vertical, and vertically centered for laid out
* horizontally.
*
* The props object also accepts a `ref` which will be merged with the ref returned from this hook. This means you can
* pass the ref returned by this hook to the `path` element and the `ref` provided as argument will also be called.
*/
function useAnimateBarLabel(props) {
	const { initialX, currentX, initialY, currentY } = props.placement === "outside" ? getOutsidePlacement(props) : getCenterPlacement(props);
	const initialProps = {
		x: initialX,
		y: initialY,
		width: props.width,
		height: props.height
	};
	return useAnimate({
		x: currentX,
		y: currentY,
		width: props.width,
		height: props.height
	}, {
		createInterpolator: barLabelPropsInterpolator,
		transformProps: (p) => p,
		applyProps(element, animatedProps) {
			element.setAttribute("x", animatedProps.x.toString());
			element.setAttribute("y", animatedProps.y.toString());
			element.setAttribute("width", animatedProps.width.toString());
			element.setAttribute("height", animatedProps.height.toString());
		},
		initialProps,
		skip: props.skipAnimation,
		ref: props.ref
	});
}
var LABEL_OFFSET = 4;
function getCenterPlacement(props) {
	return {
		initialX: props.layout === "vertical" ? props.x + props.width / 2 : props.xOrigin,
		initialY: props.layout === "vertical" ? props.yOrigin : props.y + props.height / 2,
		currentX: props.x + props.width / 2,
		currentY: props.y + props.height / 2
	};
}
function getOutsidePlacement(props) {
	let initialY = 0;
	let currentY = 0;
	let initialX = 0;
	let currentX = 0;
	if (props.layout === "vertical") {
		if (props.y < props.yOrigin) {
			initialY = props.yOrigin - LABEL_OFFSET;
			currentY = props.y - LABEL_OFFSET;
		} else {
			initialY = props.yOrigin + LABEL_OFFSET;
			currentY = props.y + props.height + LABEL_OFFSET;
		}
		return {
			initialX: props.x + props.width / 2,
			currentX: props.x + props.width / 2,
			initialY,
			currentY
		};
	}
	if (props.x < props.xOrigin) {
		initialX = props.xOrigin;
		currentX = props.x - LABEL_OFFSET;
	} else {
		initialX = props.xOrigin;
		currentX = props.x + props.width + LABEL_OFFSET;
	}
	return {
		initialX,
		currentX,
		initialY: props.y + props.height / 2,
		currentY: props.y + props.height / 2
	};
}
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/barClasses.js
function getBarUtilityClass(slot) {
	return generateUtilityClass("MuiBar", slot);
}
var barClasses = generateUtilityClasses("MuiBar", [
	"root",
	"series",
	"seriesLabels",
	"element",
	"label",
	"labelAnimate"
]);
var useUtilityClasses$2 = (options) => {
	const { skipAnimation, classes } = options ?? {};
	return composeClasses({
		root: ["root"],
		series: ["series"],
		seriesLabels: ["seriesLabels"],
		element: ["element"],
		label: ["label", !skipAnimation && "labelAnimate"]
	}, getBarUtilityClass, classes);
};
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/BarLabel/barLabelClasses.js
/**
* @deprecated Use `BarClasses` instead.
*/
/**
* @deprecated Use `BarClassKey` instead.
*/
/**
* @deprecated Use `getBarUtilityClass` instead.
*/
function getBarLabelUtilityClass(slot) {
	return generateUtilityClass("MuiBarLabel", slot);
}
/**
* @deprecated Use `barClasses` instead.
*/
var barLabelClasses = generateUtilityClasses("MuiBarLabel", [
	"root",
	"highlighted",
	"faded",
	"animate"
]);
/**
* @deprecated Use `useBarLabelUtilityClasses` instead.
*/
var useUtilityClasses$1 = (ownerState) => {
	const { classes, seriesId, isFaded, isHighlighted, skipAnimation } = ownerState;
	return composeClasses({ root: [
		"root",
		`series-${seriesId}`,
		isHighlighted && "highlighted",
		isFaded && "faded",
		!skipAnimation && "animate"
	] }, getBarLabelUtilityClass, classes);
};
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/BarLabel/getBarLabel.js
function getBarLabel(options) {
	const { barLabel, value, dataIndex, seriesId, height, width } = options;
	if (barLabel === "value") return value ? value?.toString() : null;
	return barLabel({
		seriesId,
		dataIndex,
		value
	}, { bar: {
		height,
		width
	} });
}
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/BarLabel/BarLabel.js
var _excluded$8 = [
	"seriesId",
	"dataIndex",
	"color",
	"isFaded",
	"isHighlighted",
	"classes",
	"skipAnimation",
	"layout",
	"xOrigin",
	"yOrigin",
	"placement",
	"hidden"
];
var BarLabelComponent = styled("text", {
	name: "MuiBarLabel",
	slot: "Root",
	overridesResolver: (_, styles) => [
		{ [`&.${barLabelClasses.faded}`]: styles.faded },
		{ [`&.${barLabelClasses.highlighted}`]: styles.highlighted },
		{ [`&[data-faded]`]: styles.faded },
		{ [`&[data-highlighted]`]: styles.highlighted },
		styles.root
	]
})(({ theme }) => _extends({}, theme?.typography?.body2, {
	stroke: "none",
	fill: (theme.vars || theme)?.palette?.text?.primary,
	transitionProperty: "opacity, fill",
	transitionDuration: `300ms`,
	transitionTimingFunction: ANIMATION_TIMING_FUNCTION,
	pointerEvents: "none"
}));
function BarLabel(inProps) {
	const props = useThemeProps({
		props: inProps,
		name: "MuiBarLabel"
	});
	const { isFaded, hidden } = props, otherProps = _objectWithoutPropertiesLoose(props, _excluded$8);
	const animatedProps = useAnimateBarLabel(props);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BarLabelComponent, _extends({
		textAnchor: getTextAnchor(props),
		dominantBaseline: getDominantBaseline(props),
		opacity: hidden ? 0 : isFaded ? .3 : 1
	}, otherProps, animatedProps));
}
function getTextAnchor({ placement, layout, xOrigin, x }) {
	if (placement === "outside") {
		if (layout === "horizontal") return x < xOrigin ? "end" : "start";
		return "middle";
	}
	return "middle";
}
function getDominantBaseline({ placement, layout, yOrigin, y }) {
	if (placement === "outside") {
		if (layout === "horizontal") return "central";
		return y < yOrigin ? "auto" : "hanging";
	}
	return "central";
}
BarLabel.propTypes = {
	classes: import_prop_types.default.object,
	dataIndex: import_prop_types.default.number.isRequired,
	height: import_prop_types.default.number.isRequired,
	hidden: import_prop_types.default.bool,
	isFaded: import_prop_types.default.bool.isRequired,
	isHighlighted: import_prop_types.default.bool.isRequired,
	layout: import_prop_types.default.oneOf(["horizontal", "vertical"]).isRequired,
	placement: import_prop_types.default.oneOf(["center", "outside"]),
	seriesId: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]).isRequired,
	skipAnimation: import_prop_types.default.bool.isRequired,
	width: import_prop_types.default.number.isRequired,
	x: import_prop_types.default.number.isRequired,
	xOrigin: import_prop_types.default.number.isRequired,
	y: import_prop_types.default.number.isRequired,
	yOrigin: import_prop_types.default.number.isRequired
};
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/BarLabel/BarLabelItem.js
var _excluded$7 = [
	"seriesId",
	"classes",
	"color",
	"dataIndex",
	"barLabel",
	"slots",
	"slotProps",
	"xOrigin",
	"yOrigin",
	"x",
	"y",
	"width",
	"height",
	"value",
	"skipAnimation",
	"layout",
	"barLabelPlacement",
	"hidden"
], _excluded2$1 = ["ownerState"];
/**
* @ignore - internal component.
*/
function BarLabelItem(props) {
	const { seriesId, classes: innerClasses, color, dataIndex, barLabel, slots, slotProps, xOrigin, yOrigin, x, y, width, height, value, skipAnimation, layout, barLabelPlacement, hidden } = props, other = _objectWithoutPropertiesLoose(props, _excluded$7);
	const { isFaded, isHighlighted } = useItemHighlighted({
		seriesId,
		dataIndex
	});
	const ownerState = {
		seriesId,
		classes: innerClasses,
		color,
		isFaded,
		isHighlighted,
		dataIndex,
		skipAnimation,
		layout
	};
	const classes = useUtilityClasses$2(ownerState);
	const deprecatedClasses = useUtilityClasses$1(ownerState);
	const Component = slots?.barLabel ?? BarLabel;
	const _useSlotProps = useSlotProps({
		elementType: Component,
		externalSlotProps: slotProps?.barLabel,
		additionalProps: _extends({}, other, {
			xOrigin,
			yOrigin,
			x,
			y,
			width,
			height,
			placement: barLabelPlacement,
			className: `${classes.label} ${deprecatedClasses.root}`,
			"data-highlighted": isHighlighted || void 0,
			"data-faded": isFaded || void 0
		}),
		ownerState
	}), { ownerState: barLabelOwnerState } = _useSlotProps, barLabelProps = _objectWithoutPropertiesLoose(_useSlotProps, _excluded2$1);
	if (!barLabel) return null;
	const formattedLabelText = getBarLabel({
		barLabel,
		value,
		dataIndex,
		seriesId,
		height,
		width
	});
	if (!formattedLabelText) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Component, _extends({}, barLabelProps, barLabelOwnerState, {
		hidden,
		children: formattedLabelText
	}));
}
BarLabelItem.propTypes = {
	barLabel: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["value"]), import_prop_types.default.func]),
	classes: import_prop_types.default.object,
	color: import_prop_types.default.string.isRequired,
	dataIndex: import_prop_types.default.number.isRequired,
	height: import_prop_types.default.number.isRequired,
	seriesId: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]).isRequired,
	slotProps: import_prop_types.default.object,
	slots: import_prop_types.default.object,
	value: import_prop_types.default.number,
	width: import_prop_types.default.number.isRequired
};
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/BarLabel/BarLabelPlot.js
var _excluded$6 = [
	"processedSeries",
	"className",
	"skipAnimation"
];
/**
* @ignore - internal component.
*/
function BarLabelPlot(props) {
	const { processedSeries, className, skipAnimation } = props, other = _objectWithoutPropertiesLoose(props, _excluded$6);
	const { seriesId, data, layout, xOrigin, yOrigin } = processedSeries;
	const barLabel = processedSeries.barLabel ?? props.barLabel;
	if (!barLabel) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
		className,
		"data-series": seriesId,
		children: data.map(({ x, y, dataIndex, color, value, width, height, hidden }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BarLabelItem, _extends({
			seriesId,
			dataIndex,
			value,
			color,
			xOrigin,
			yOrigin,
			x,
			y,
			width,
			height,
			skipAnimation: skipAnimation ?? false,
			layout: layout ?? "vertical",
			hidden
		}, other, {
			barLabel,
			barLabelPlacement: processedSeries.barLabelPlacement || "center"
		}), dataIndex))
	}, seriesId);
}
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/checkBarChartScaleErrors.js
var getAxisMessage = (axisDirection, axisId) => {
	const axisName = `${axisDirection}-axis`;
	const axisIdName = `${axisDirection}Axis`;
	return axisId === (axisDirection === "x" ? "DEFAULT_X_AXIS_KEY" : "DEFAULT_Y_AXIS_KEY") ? `The first \`${axisIdName}\`` : `The ${axisName} with id "${axisId}"`;
};
function checkBarChartScaleErrors(verticalLayout, seriesId, seriesDataLength, xAxisId, xAxis, yAxisId, yAxis) {
	const xAxisConfig = xAxis[xAxisId];
	const yAxisConfig = yAxis[yAxisId];
	const discreteAxisConfig = verticalLayout ? xAxisConfig : yAxisConfig;
	const continuousAxisConfig = verticalLayout ? yAxisConfig : xAxisConfig;
	const discreteAxisId = verticalLayout ? xAxisId : yAxisId;
	const continuousAxisId = verticalLayout ? yAxisId : xAxisId;
	const discreteAxisDirection = verticalLayout ? "x" : "y";
	const continuousAxisDirection = verticalLayout ? "y" : "x";
	if (discreteAxisConfig.scaleType !== "band") throw new Error(`MUI X Charts: ${getAxisMessage(discreteAxisDirection, discreteAxisId)} should be of type "band" to display the bar series of id "${seriesId}".`);
	if (discreteAxisConfig.data === void 0) throw new Error(`MUI X Charts: ${getAxisMessage(discreteAxisDirection, discreteAxisId)} should have data property.`);
	if (continuousAxisConfig.scaleType === "band" || continuousAxisConfig.scaleType === "point") throw new Error(`MUI X Charts: ${getAxisMessage(continuousAxisDirection, continuousAxisId)} should be a continuous type to display the bar series of id "${seriesId}".`);
	if (discreteAxisConfig.data.length < seriesDataLength) warnOnce([`MUI X Charts: ${getAxisMessage(discreteAxisDirection, discreteAxisId)} has less data (${discreteAxisConfig.data.length} values) than the bar series of id "${seriesId}" (${seriesDataLength} values).`, "The axis data should have at least the same length than the series using it."], "error");
}
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/useBarPlotData.js
function useBarPlotData(drawingArea, xAxes, yAxes) {
	const seriesData = useBarSeriesContext() ?? {
		series: {},
		stackingGroups: [],
		seriesOrder: []
	};
	const defaultXAxisId = useXAxes().xAxisIds[0];
	const defaultYAxisId = useYAxes().yAxisIds[0];
	return processBarDataForPlot(drawingArea, useChartId(), seriesData.stackingGroups, seriesData.series, xAxes, yAxes, defaultXAxisId, defaultYAxisId);
}
function processBarDataForPlot(drawingArea, chartId, stackingGroups, series, xAxes, yAxes, defaultXAxisId, defaultYAxisId) {
	const masks = {};
	return {
		completedData: stackingGroups.flatMap(({ ids: seriesIds }, groupIndex) => {
			const xMin = drawingArea.left;
			const xMax = drawingArea.left + drawingArea.width;
			const yMin = drawingArea.top;
			const yMax = drawingArea.top + drawingArea.height;
			const lastNegativePerIndex = /* @__PURE__ */ new Map();
			const lastPositivePerIndex = /* @__PURE__ */ new Map();
			return seriesIds.map((seriesId) => {
				const xAxisId = series[seriesId].xAxisId ?? defaultXAxisId;
				const yAxisId = series[seriesId].yAxisId ?? defaultYAxisId;
				const layout = series[seriesId].layout;
				const xAxisConfig = xAxes[xAxisId];
				const yAxisConfig = yAxes[yAxisId];
				const verticalLayout = series[seriesId].layout === "vertical";
				const reverse = (verticalLayout ? yAxisConfig.reverse : xAxisConfig.reverse) ?? false;
				checkBarChartScaleErrors(verticalLayout, seriesId, series[seriesId].stackedData.length, xAxisId, xAxes, yAxisId, yAxes);
				const baseScaleConfig = verticalLayout ? xAxisConfig : yAxisConfig;
				const xScale = xAxisConfig.scale;
				const yScale = yAxisConfig.scale;
				const xOrigin = Math.round(xScale(0) ?? 0);
				const yOrigin = Math.round(yScale(0) ?? 0);
				const colorGetter = getColor(series[seriesId], xAxes[xAxisId], yAxes[yAxisId]);
				const seriesDataPoints = [];
				for (let dataIndex = 0; dataIndex < baseScaleConfig.data.length; dataIndex += 1) {
					const barDimensions = getBarDimensions({
						verticalLayout,
						xAxisConfig,
						yAxisConfig,
						series: series[seriesId],
						dataIndex,
						numberOfGroups: stackingGroups.length,
						groupIndex
					});
					if (barDimensions == null) continue;
					const stackId = series[seriesId].stack;
					const result = _extends({
						seriesId,
						dataIndex,
						hidden: series[seriesId].hidden
					}, barDimensions, {
						color: colorGetter(dataIndex),
						value: series[seriesId].data[dataIndex],
						maskId: `${chartId}_${stackId || seriesId}_${groupIndex}_${dataIndex}`
					});
					if (result.x > xMax || result.x + result.width < xMin || result.y > yMax || result.y + result.height < yMin) continue;
					const lastNegative = lastNegativePerIndex.get(dataIndex);
					const lastPositive = lastPositivePerIndex.get(dataIndex);
					const sign = (reverse ? -1 : 1) * Math.sign(result.value ?? 0);
					if (sign > 0) {
						if (lastPositive) delete lastPositive.borderRadiusSide;
						result.borderRadiusSide = verticalLayout ? "top" : "right";
						lastPositivePerIndex.set(dataIndex, result);
					} else if (sign < 0) {
						if (lastNegative) delete lastNegative.borderRadiusSide;
						result.borderRadiusSide = verticalLayout ? "bottom" : "left";
						lastNegativePerIndex.set(dataIndex, result);
					}
					if (!masks[result.maskId]) masks[result.maskId] = {
						id: result.maskId,
						width: 0,
						height: 0,
						hasNegative: false,
						hasPositive: false,
						layout,
						xOrigin,
						yOrigin,
						x: 0,
						y: 0
					};
					const mask = masks[result.maskId];
					mask.width = layout === "vertical" ? result.width : mask.width + result.width;
					mask.height = layout === "vertical" ? mask.height + result.height : result.height;
					mask.x = Math.min(mask.x === 0 ? Infinity : mask.x, result.x);
					mask.y = Math.min(mask.y === 0 ? Infinity : mask.y, result.y);
					const value = result.value ?? 0;
					mask.hasNegative = mask.hasNegative || (reverse ? value > 0 : value < 0);
					mask.hasPositive = mask.hasPositive || (reverse ? value < 0 : value > 0);
					seriesDataPoints.push(result);
				}
				return {
					seriesId,
					barLabel: series[seriesId].barLabel,
					barLabelPlacement: series[seriesId].barLabelPlacement,
					data: seriesDataPoints,
					layout,
					xOrigin,
					yOrigin
				};
			});
		}),
		masksData: Object.values(masks)
	};
}
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/barElementClasses.js
/**
* @deprecated Use `BarClasses` instead.
*/
/**
* @deprecated Use `BarClassKey` instead.
*/
/**
* @deprecated Use `getBarUtilityClass` instead.
*/
function getBarElementUtilityClass(slot) {
	return generateUtilityClass("MuiBarElement", slot);
}
/**
* @deprecated Use `barClasses` instead.
*/
var barElementClasses = generateUtilityClasses("MuiBarElement", [
	"root",
	"highlighted",
	"faded",
	"series"
]);
/**
* @deprecated Use `useBarElementUtilityClasses` instead.
*/
var useUtilityClasses = (ownerState) => {
	const { classes, id, isHighlighted, isFaded } = ownerState;
	return composeClasses({ root: [
		"root",
		`series-${id}`,
		isHighlighted && "highlighted",
		isFaded && "faded"
	] }, getBarElementUtilityClass, classes);
};
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/AnimatedBarElement.js
var _excluded$5 = [
	"ownerState",
	"skipAnimation",
	"id",
	"dataIndex",
	"xOrigin",
	"yOrigin"
];
function AnimatedBarElement(props) {
	const { ownerState } = props, other = _objectWithoutPropertiesLoose(props, _excluded$5);
	const animatedProps = useAnimateBar(props);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", _extends({}, other, {
		filter: ownerState.isHighlighted ? "brightness(120%)" : void 0,
		opacity: ownerState.isFaded ? .3 : 1,
		"data-highlighted": ownerState.isHighlighted || void 0,
		"data-faded": ownerState.isFaded || void 0
	}, animatedProps));
}
//#endregion
//#region node_modules/@mui/x-charts/esm/hooks/useIsItemFocused.js
/**
* A hook to check if an item has the focus.
*
* If you need to process multiple points, use the `useIsItemFocusedGetter` hook instead.
*
* @param {FocusedItemIdentifier} item is the item to check
* @returns {boolean} the focus state
*/
function useIsItemFocused(item) {
	return useStore().use(selectorChartsItemIsFocused, item);
}
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/BarElement.js
var _excluded$4 = [
	"id",
	"dataIndex",
	"classes",
	"color",
	"slots",
	"slotProps",
	"style",
	"onClick",
	"skipAnimation",
	"layout",
	"x",
	"xOrigin",
	"y",
	"yOrigin",
	"width",
	"height",
	"hidden"
];
function BarElement(props) {
	const { id, dataIndex, classes: innerClasses, color, slots, slotProps, style, onClick, skipAnimation, layout, x, xOrigin, y, yOrigin, width, height, hidden } = props, other = _objectWithoutPropertiesLoose(props, _excluded$4);
	const itemIdentifier = import_react.useMemo(() => ({
		type: "bar",
		seriesId: id,
		dataIndex
	}), [id, dataIndex]);
	const interactionProps = useInteractionItemProps(itemIdentifier);
	const { isFaded, isHighlighted } = useItemHighlighted(itemIdentifier);
	const ownerState = {
		id,
		dataIndex,
		classes: innerClasses,
		color,
		isFaded,
		isHighlighted,
		isFocused: useIsItemFocused(import_react.useMemo(() => ({
			type: "bar",
			seriesId: id,
			dataIndex
		}), [id, dataIndex]))
	};
	const classes = useUtilityClasses$2(ownerState);
	const deprecatedClasses = useUtilityClasses(ownerState);
	const Bar = slots?.bar ?? AnimatedBarElement;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, _extends({}, useSlotProps({
		elementType: Bar,
		externalSlotProps: slotProps?.bar,
		externalForwardedProps: other,
		additionalProps: _extends({}, interactionProps, {
			id,
			dataIndex,
			color,
			x,
			xOrigin,
			y,
			yOrigin,
			width,
			height,
			style,
			onClick,
			cursor: onClick ? "pointer" : "unset",
			stroke: "none",
			fill: color,
			skipAnimation,
			layout,
			hidden
		}),
		className: `${classes.element} ${deprecatedClasses.root}`,
		ownerState
	})));
}
BarElement.propTypes = {
	classes: import_prop_types.default.object,
	dataIndex: import_prop_types.default.number.isRequired,
	id: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]).isRequired,
	layout: import_prop_types.default.oneOf(["horizontal", "vertical"]).isRequired,
	skipAnimation: import_prop_types.default.bool.isRequired,
	slotProps: import_prop_types.default.object,
	slots: import_prop_types.default.object,
	xOrigin: import_prop_types.default.number.isRequired,
	yOrigin: import_prop_types.default.number.isRequired
};
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/BarClipPath.js
function barClipPathPropsInterpolator(from, to) {
	const interpolateX = number_default(from.x, to.x);
	const interpolateY = number_default(from.y, to.y);
	const interpolateWidth = number_default(from.width, to.width);
	const interpolateHeight = number_default(from.height, to.height);
	const interpolateBorderRadius = number_default(from.borderRadius, to.borderRadius);
	return (t) => {
		return {
			x: interpolateX(t),
			y: interpolateY(t),
			width: interpolateWidth(t),
			height: interpolateHeight(t),
			borderRadius: interpolateBorderRadius(t)
		};
	};
}
function useAnimateBarClipPath(props) {
	const initialProps = {
		x: props.layout === "vertical" ? props.x : props.xOrigin,
		y: props.layout === "vertical" ? props.yOrigin : props.y,
		width: props.layout === "vertical" ? props.width : 0,
		height: props.layout === "vertical" ? 0 : props.height,
		borderRadius: props.borderRadius
	};
	return useAnimate({
		x: props.x,
		y: props.y,
		width: props.width,
		height: props.height,
		borderRadius: props.borderRadius
	}, {
		createInterpolator: barClipPathPropsInterpolator,
		transformProps: (p) => ({ d: generateClipPath(props.hasNegative, props.hasPositive, props.layout, p.x, p.y, p.width, p.height, props.xOrigin, props.yOrigin, p.borderRadius) }),
		applyProps(element, { d }) {
			if (d) element.setAttribute("d", d);
		},
		initialProps,
		skip: props.skipAnimation,
		ref: props.ref
	});
}
/**
* @ignore - internal component.
*/
function BarClipPath(props) {
	const { maskId, x, y, width, height, skipAnimation } = props;
	const { ref, d } = useAnimateBarClipPath({
		layout: props.layout ?? "vertical",
		hasNegative: props.hasNegative,
		hasPositive: props.hasPositive,
		xOrigin: props.xOrigin,
		yOrigin: props.yOrigin,
		x,
		y,
		width,
		height,
		borderRadius: props.borderRadius ?? 0,
		skipAnimation
	});
	if (!props.borderRadius || props.borderRadius <= 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("clipPath", {
		id: maskId,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			ref,
			d
		})
	});
}
function generateClipPath(hasNegative, hasPositive, layout, x, y, width, height, xOrigin, yOrigin, borderRadius) {
	if (layout === "vertical") {
		if (hasPositive && hasNegative) {
			const bR = Math.min(borderRadius, width / 2, height / 2);
			return `M${x},${y + height / 2} v${-(height / 2 - bR)} a${bR},${bR} 0 0 1 ${bR},${-bR} h${width - bR * 2} a${bR},${bR} 0 0 1 ${bR},${bR} v${height - 2 * bR} a${bR},${bR} 0 0 1 ${-bR},${bR} h${-(width - bR * 2)} a${bR},${bR} 0 0 1 ${-bR},${-bR} v${-(height / 2 - bR)}`;
		}
		const bR = Math.min(borderRadius, width / 2);
		if (hasPositive) return `M${x},${Math.max(yOrigin, y + bR)} v${Math.min(0, -(yOrigin - y - bR))} a${bR},${bR} 0 0 1 ${bR},${-bR} h${width - bR * 2} a${bR},${bR} 0 0 1 ${bR},${bR} v${Math.max(0, yOrigin - y - bR)} Z`;
		if (hasNegative) return `M${x},${Math.min(yOrigin, y + height - bR)} v${Math.max(0, height - bR)} a${bR},${bR} 0 0 0 ${bR},${bR} h${width - bR * 2} a${bR},${bR} 0 0 0 ${bR},${-bR} v${-Math.max(0, height - bR)} Z`;
	}
	if (layout === "horizontal") {
		if (hasPositive && hasNegative) {
			const bR = Math.min(borderRadius, width / 2, height / 2);
			return `M${x + width / 2},${y} h${width / 2 - bR} a${bR},${bR} 0 0 1 ${bR},${bR} v${height - bR * 2} a${bR},${bR} 0 0 1 ${-bR},${bR} h${-(width - 2 * bR)} a${bR},${bR} 0 0 1 ${-bR},${-bR} v${-(height - bR * 2)} a${bR},${bR} 0 0 1 ${bR},${-bR} h${width / 2 - bR}`;
		}
		const bR = Math.min(borderRadius, height / 2);
		if (hasPositive) return `M${Math.min(xOrigin, x - bR)},${y} h${width} a${bR},${bR} 0 0 1 ${bR},${bR} v${height - bR * 2} a${bR},${bR} 0 0 1 ${-bR},${bR} h${-width} Z`;
		if (hasNegative) return `M${Math.max(xOrigin, x + width + bR)},${y} h${-width} a${bR},${bR} 0 0 0 ${-bR},${bR} v${height - bR * 2} a${bR},${bR} 0 0 0 ${bR},${bR} h${width} Z`;
	}
}
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/IndividualBarPlot.js
var _excluded$3 = [
	"completedData",
	"masksData",
	"borderRadius",
	"onItemClick",
	"skipAnimation"
];
function IndividualBarPlot(_ref) {
	let { completedData, masksData, borderRadius, onItemClick, skipAnimation } = _ref, other = _objectWithoutPropertiesLoose(_ref, _excluded$3);
	const classes = useUtilityClasses$2();
	const withoutBorderRadius = !borderRadius || borderRadius <= 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [!withoutBorderRadius && masksData.map(({ id, x, y, xOrigin, yOrigin, width, height, hasPositive, hasNegative, layout }) => {
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BarClipPath, {
			maskId: id,
			borderRadius,
			hasNegative,
			hasPositive,
			layout,
			x,
			y,
			xOrigin,
			yOrigin,
			width,
			height,
			skipAnimation: skipAnimation ?? false
		}, id);
	}), completedData.map(({ seriesId, layout, xOrigin, yOrigin, data }) => {
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
			"data-series": seriesId,
			className: classes.series,
			children: data.map(({ dataIndex, color, maskId, x, y, width, height }) => {
				const barElement = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BarElement, _extends({
					id: seriesId,
					dataIndex,
					color,
					skipAnimation: skipAnimation ?? false,
					layout: layout ?? "vertical",
					x,
					xOrigin,
					y,
					yOrigin,
					width,
					height
				}, other, { onClick: onItemClick && ((event) => {
					onItemClick(event, {
						type: "bar",
						seriesId,
						dataIndex
					});
				}) }), dataIndex);
				if (withoutBorderRadius) return barElement;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
					clipPath: `url(#${maskId})`,
					children: barElement
				}, dataIndex);
			})
		}, seriesId);
	})] });
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/invertScale.js
/**
* Get the data index for a given value on an ordinal scale.
*/
function getDataIndexForOrdinalScaleValue(scale, value) {
	return scale.bandwidth() === 0 ? Math.floor((value - Math.min(...scale.range()) + scale.step() / 2) / scale.step()) : Math.floor((value - Math.min(...scale.range())) / scale.step());
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartCartesianAxis/useChartCartesianAxisPosition.selectors.js
var selectorBarItemAtPosition = createSelector(selectorChartXAxis, selectorChartYAxis, selectorChartSeriesProcessed, function selectorBarItemAtPosition({ axis: xAxes, axisIds: xAxisIds }, { axis: yAxes, axisIds: yAxisIds }, processedSeries, svgPoint) {
	const { series, stackingGroups = [] } = processedSeries?.bar ?? {};
	const defaultXAxisId = xAxisIds[0];
	const defaultYAxisId = yAxisIds[0];
	let item = void 0;
	for (let stackIndex = 0; stackIndex < stackingGroups.length; stackIndex += 1) {
		const seriesIds = stackingGroups[stackIndex].ids;
		for (const seriesId of seriesIds) {
			const aSeries = (series ?? {})[seriesId];
			const xAxisId = aSeries.xAxisId ?? defaultXAxisId;
			const yAxisId = aSeries.yAxisId ?? defaultYAxisId;
			const xAxis = xAxes[xAxisId];
			const yAxis = yAxes[yAxisId];
			const bandAxis = aSeries.layout === "horizontal" ? yAxis : xAxis;
			const continuousAxis = aSeries.layout === "horizontal" ? xAxis : yAxis;
			const bandScale = bandAxis.scale;
			const svgPointBandCoordinate = aSeries.layout === "horizontal" ? svgPoint.y : svgPoint.x;
			if (!isBandScale(bandScale)) continue;
			const dataIndex = getDataIndexForOrdinalScaleValue(bandScale, svgPointBandCoordinate);
			const { barWidth, offset } = getBandSize(bandScale.bandwidth(), stackingGroups.length, bandAxis.barGapRatio);
			const barOffset = stackIndex * (barWidth + offset);
			const bandValue = bandAxis.data?.[dataIndex];
			if (bandValue == null) continue;
			const bandStart = bandScale(bandValue);
			if (bandStart == null) continue;
			const bandBarStart = bandStart + barOffset;
			const bandBarEnd = bandBarStart + barWidth;
			if (svgPointBandCoordinate >= Math.min(bandBarStart, bandBarEnd) && svgPointBandCoordinate <= Math.max(bandBarStart, bandBarEnd)) {
				const svgPointContinuousCoordinate = aSeries.layout === "horizontal" ? svgPoint.x : svgPoint.y;
				const bar = aSeries.visibleStackedData[dataIndex];
				const start = continuousAxis.scale(bar[0]);
				const end = continuousAxis.scale(bar[1]);
				if (start == null || end == null) continue;
				if (svgPointContinuousCoordinate >= Math.min(start, end) && svgPointContinuousCoordinate <= Math.max(start, end)) item = {
					seriesId,
					dataIndex
				};
			}
		}
	}
	if (item) return {
		type: "bar",
		seriesId: item.seriesId,
		dataIndex: item.dataIndex
	};
});
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/useRegisterItemClickHandlers.js
/**
* Hook that registers pointer event handlers for chart item clicking.
* @param onItemClick Callback for item click events.
*/
function useRegisterItemClickHandlers(onItemClick) {
	const { instance } = useChartContext();
	const svgRef = useSvgRef();
	const store = useStore();
	import_react.useEffect(() => {
		const element = svgRef.current;
		if (!element || !onItemClick) return;
		let lastPointerUp = null;
		const onClick = function onClick(event) {
			let point = event;
			if (lastPointerUp) {
				if (Math.abs(event.clientX - lastPointerUp.clientX) <= 1 && Math.abs(event.clientY - lastPointerUp.clientY) <= 1) point = {
					clientX: lastPointerUp.clientX,
					clientY: lastPointerUp.clientY
				};
			}
			lastPointerUp = null;
			const svgPoint = getSVGPoint(element, point);
			if (!instance.isPointInside(svgPoint.x, svgPoint.y)) return;
			const item = selectorBarItemAtPosition(store.state, svgPoint);
			if (item) onItemClick(event, {
				type: "bar",
				seriesId: item.seriesId,
				dataIndex: item.dataIndex
			});
		};
		const onPointerUp = function onPointerUp(event) {
			lastPointerUp = event;
		};
		element.addEventListener("click", onClick);
		element.addEventListener("pointerup", onPointerUp);
		return () => {
			element.removeEventListener("click", onClick);
			element.removeEventListener("pointerup", onPointerUp);
		};
	}, [
		instance,
		onItemClick,
		store,
		svgRef
	]);
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/appendAtKey.js
/**
* Given a map of arrays, appends a value to the array at the given key.
* If no array exists at that key, one is created and the value appended.
* @param map Map of arrays
* @param key Key to append the value at
* @param value Value to append
*/
function appendAtKey(map, key, value) {
	let bucket = map.get(key);
	if (!bucket) {
		bucket = [value];
		map.set(key, bucket);
	} else bucket.push(value);
	return bucket;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/BatchBarPlot/useCreateBarPaths.js
var MAX_POINTS_PER_PATH = 1e3;
function generateBarPath(x, y, width, height, topLeftBorderRadius, topRightBorderRadius, bottomRightBorderRadius, bottomLeftBorderRadius) {
	const tLBR = Math.min(topLeftBorderRadius, width / 2, height / 2);
	const tRBR = Math.min(topRightBorderRadius, width / 2, height / 2);
	const bRBR = Math.min(bottomRightBorderRadius, width / 2, height / 2);
	const bLBR = Math.min(bottomLeftBorderRadius, width / 2, height / 2);
	return `M${x + tLBR},${y}
   h${width - tLBR - tRBR}
   a${tRBR},${tRBR} 0 0 1 ${tRBR},${tRBR}
   v${height - tRBR - bRBR}
   a${bRBR},${bRBR} 0 0 1 -${bRBR},${bRBR}
   h-${width - bRBR - bLBR}
   a${bLBR},${bLBR} 0 0 1 -${bLBR},-${bLBR}
   v-${height - bLBR - tLBR}
   a${tLBR},${tLBR} 0 0 1 ${tLBR},-${tLBR}
   Z`;
}
function createPath(barData, borderRadius) {
	return generateBarPath(barData.x, barData.y, barData.width, barData.height, barData.borderRadiusSide === "left" || barData.borderRadiusSide === "top" ? borderRadius : 0, barData.borderRadiusSide === "right" || barData.borderRadiusSide === "top" ? borderRadius : 0, barData.borderRadiusSide === "right" || barData.borderRadiusSide === "bottom" ? borderRadius : 0, barData.borderRadiusSide === "left" || barData.borderRadiusSide === "bottom" ? borderRadius : 0);
}
/**
* Hook that creates bar paths for a given series data. Used by the batch bar renderer.
* @param seriesData
* @param borderRadius
*/
function useCreateBarPaths(seriesData, borderRadius) {
	const paths = /* @__PURE__ */ new Map();
	const temporaryPaths = /* @__PURE__ */ new Map();
	for (let j = 0; j < seriesData.data.length; j += 1) {
		const barData = seriesData.data[j];
		const pathString = createPath(barData, borderRadius);
		const tempPath = appendAtKey(temporaryPaths, barData.color, pathString);
		if (tempPath.length >= MAX_POINTS_PER_PATH) {
			appendAtKey(paths, barData.color, tempPath.join(""));
			temporaryPaths.delete(barData.color);
		}
	}
	for (const [fill, tempPath] of temporaryPaths.entries()) if (tempPath.length > 0) appendAtKey(paths, fill, tempPath.join(""));
	return paths;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/BatchBarPlot/BarGroup.js
var _excluded$2 = [
	"skipAnimation",
	"layout",
	"xOrigin",
	"yOrigin"
], _excluded2 = [
	"children",
	"layout",
	"xOrigin",
	"yOrigin"
];
var PathGroup = styled("g")({
	"&[data-faded=\"true\"]": { opacity: .3 },
	"& path": { pointerEvents: "none" }
});
function BarGroup(_ref) {
	let { skipAnimation, layout, xOrigin, yOrigin } = _ref, props = _objectWithoutPropertiesLoose(_ref, _excluded$2);
	if (skipAnimation) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PathGroup, _extends({}, props));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedGroup, _extends({}, props, {
		layout,
		xOrigin,
		yOrigin
	}));
}
var AnimatedRect = styled("rect")({
	"@keyframes scaleInX": {
		from: { transform: "scaleX(0)" },
		to: { transform: "scaleX(1)" }
	},
	"@keyframes scaleInY": {
		from: { transform: "scaleY(0)" },
		to: { transform: "scaleY(1)" }
	},
	animationDuration: `300ms`,
	animationFillMode: "forwards",
	"&[data-orientation=\"horizontal\"]": { animationName: "scaleInX" },
	"&[data-orientation=\"vertical\"]": { animationName: "scaleInY" }
});
function AnimatedGroup(_ref2) {
	let { children, layout, xOrigin, yOrigin } = _ref2, props = _objectWithoutPropertiesLoose(_ref2, _excluded2);
	const drawingArea = useStore().use(selectorChartDrawingArea);
	const clipPathId = useId();
	const animateChildren = [];
	if (layout === "horizontal") {
		animateChildren.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedRect, {
			"data-orientation": "horizontal",
			x: drawingArea.left,
			width: xOrigin - drawingArea.left,
			y: drawingArea.top,
			height: drawingArea.height,
			style: { transformOrigin: `${xOrigin}px ${drawingArea.top + drawingArea.height / 2}px` }
		}, "left"));
		animateChildren.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedRect, {
			"data-orientation": "horizontal",
			x: xOrigin,
			width: drawingArea.left + drawingArea.width - xOrigin,
			y: drawingArea.top,
			height: drawingArea.height,
			style: { transformOrigin: `${xOrigin}px ${drawingArea.top + drawingArea.height / 2}px` }
		}, "right"));
	} else {
		animateChildren.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedRect, {
			"data-orientation": "vertical",
			x: drawingArea.left,
			width: drawingArea.width,
			y: drawingArea.top,
			height: yOrigin - drawingArea.top,
			style: { transformOrigin: `${drawingArea.left + drawingArea.width / 2}px ${yOrigin}px` }
		}, "top"));
		animateChildren.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedRect, {
			"data-orientation": "vertical",
			x: drawingArea.left,
			width: drawingArea.width,
			y: yOrigin,
			height: drawingArea.top + drawingArea.height - yOrigin,
			style: { transformOrigin: `${drawingArea.left + drawingArea.width / 2}px ${yOrigin}px` }
		}, "bottom"));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("clipPath", {
		id: clipPathId,
		children: animateChildren
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PathGroup, _extends({ clipPath: `url(#${clipPathId})` }, props, { children }))] });
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/shared/useRegisterPointerInteractions.js
/**
* Hook to get pointer interaction props for chart items.
*/
function useRegisterPointerInteractions(getItemAtPosition, onItemEnter, onItemLeave) {
	const { instance } = useChartContext();
	const svgRef = useSvgRef();
	const store = useStore();
	const interactionActive = import_react.useRef(false);
	const lastItemRef = import_react.useRef(void 0);
	const onItemEnterRef = useEventCallback(() => onItemEnter?.());
	const onItemLeaveRef = useEventCallback(() => onItemLeave?.());
	import_react.useEffect(() => {
		const svg = svgRef.current;
		if (!svg) return;
		function onPointerEnter() {
			interactionActive.current = true;
		}
		function reset() {
			const lastItem = lastItemRef.current;
			if (lastItem) {
				lastItemRef.current = void 0;
				instance.removeTooltipItem(lastItem);
				instance.clearHighlight();
				onItemLeaveRef();
			}
		}
		function onPointerLeave() {
			interactionActive.current = false;
			reset();
		}
		const onPointerMove = function onPointerMove(event) {
			const svgPoint = getSVGPoint(svg, event);
			if (!instance.isPointInside(svgPoint.x, svgPoint.y)) {
				reset();
				return;
			}
			const item = getItemAtPosition(store.state, svgPoint);
			if (item) {
				instance.setLastUpdateSource("pointer");
				instance.setTooltipItem(item);
				instance.setHighlight(item);
				onItemEnterRef();
				lastItemRef.current = item;
			} else reset();
		};
		svg.addEventListener("pointerleave", onPointerLeave);
		svg.addEventListener("pointermove", onPointerMove);
		svg.addEventListener("pointerenter", onPointerEnter);
		return () => {
			svg.removeEventListener("pointerenter", onPointerEnter);
			svg.removeEventListener("pointermove", onPointerMove);
			svg.removeEventListener("pointerleave", onPointerLeave);
			if (interactionActive.current) onPointerLeave();
		};
	}, [
		getItemAtPosition,
		instance,
		onItemEnterRef,
		onItemLeaveRef,
		store,
		svgRef
	]);
}
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/BatchBarPlot/BatchBarPlot.js
function BatchBarPlot({ completedData, borderRadius = 0, onItemClick, skipAnimation = false }) {
	const prevCursorRef = import_react.useRef(null);
	const svgRef = useSvgRef();
	useRegisterPointerInteractions(selectorBarItemAtPosition, onItemClick ? () => {
		const svg = svgRef.current;
		if (!svg) return;
		if (prevCursorRef.current == null) {
			prevCursorRef.current = svg.style.cursor;
			svg.style.cursor = "pointer";
		}
	} : void 0, onItemClick ? () => {
		const svg = svgRef.current;
		if (!svg) return;
		if (prevCursorRef.current != null) {
			svg.style.cursor = prevCursorRef.current;
			prevCursorRef.current = null;
		}
	} : void 0);
	useRegisterItemClickHandlers(onItemClick);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: completedData.map((series) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeriesBatchPlot, {
		series,
		borderRadius,
		skipAnimation
	}, series.seriesId)) });
}
var MemoFadedHighlightedBars = /* @__PURE__ */ import_react.memo(FadedHighlightedBars);
MemoFadedHighlightedBars.displayName = "MemoFadedHighlightedBars";
function SeriesBatchPlot({ series, borderRadius, skipAnimation }) {
	const classes = useUtilityClasses$2();
	const { store } = useChartContext();
	const isSeriesHighlighted = store.use(selectorChartIsSeriesHighlighted, series.seriesId);
	const isSeriesFaded = store.use(selectorChartIsSeriesFaded, series.seriesId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BarGroup, {
		className: classes.series,
		"data-series": series.seriesId,
		layout: series.layout,
		xOrigin: series.xOrigin,
		yOrigin: series.yOrigin,
		skipAnimation,
		"data-faded": isSeriesFaded || void 0,
		"data-highlighted": isSeriesHighlighted || void 0,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BatchBarSeriesPlot, {
			processedSeries: series,
			borderRadius
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemoFadedHighlightedBars, {
		processedSeries: series,
		borderRadius
	})] });
}
function BatchBarSeriesPlot({ processedSeries, borderRadius }) {
	const paths = useCreateBarPaths(processedSeries, borderRadius);
	const children = [];
	let i = 0;
	for (const [fill, dArray] of paths.entries()) for (const d of dArray) {
		children.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill,
			d
		}, i));
		i += 1;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children });
}
function FadedHighlightedBars({ processedSeries, borderRadius }) {
	const { store } = useChartContext();
	const seriesHighlightedDataIndex = store.use(selectorChartSeriesHighlightedItem, processedSeries.seriesId);
	const seriesUnfadedDataIndex = store.use(selectorChartSeriesUnfadedItem, processedSeries.seriesId);
	const seriesHighlightedItem = seriesHighlightedDataIndex != null ? processedSeries.data.find((v) => v.dataIndex === seriesHighlightedDataIndex) || null : null;
	const seriesUnfadedItem = seriesUnfadedDataIndex != null ? processedSeries.data.find((v) => v.dataIndex === seriesUnfadedDataIndex) || null : null;
	const siblings = [];
	if (seriesHighlightedItem != null) siblings.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		fill: seriesHighlightedItem.color,
		filter: "brightness(120%)",
		"data-highlighted": true,
		d: createPath(seriesHighlightedItem, borderRadius)
	}, `highlighted-${processedSeries.seriesId}`));
	if (seriesUnfadedItem != null) siblings.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		fill: seriesUnfadedItem.color,
		d: createPath(seriesUnfadedItem, borderRadius)
	}, `unfaded-${seriesUnfadedItem.seriesId}`));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: siblings });
}
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/BarPlot.js
var _excluded$1 = [
	"skipAnimation",
	"onItemClick",
	"borderRadius",
	"barLabel",
	"renderer"
];
var BarPlotRoot = styled("g", {
	name: "MuiBarPlot",
	slot: "Root"
})({ [`& .${barClasses.element}`]: {
	transitionProperty: "opacity, fill",
	transitionDuration: `300ms`,
	transitionTimingFunction: ANIMATION_TIMING_FUNCTION
} });
/**
* Demos:
*
* - [Bars](https://mui.com/x/react-charts/bars/)
* - [Bar demonstration](https://mui.com/x/react-charts/bar-demo/)
* - [Stacking](https://mui.com/x/react-charts/stacking/)
*
* API:
*
* - [BarPlot API](https://mui.com/x/api/charts/bar-plot/)
*/
function BarPlot(props) {
	const { skipAnimation: inSkipAnimation, onItemClick, borderRadius, barLabel, renderer } = props, other = _objectWithoutPropertiesLoose(props, _excluded$1);
	const skipAnimation = useSkipAnimation(useInternalIsZoomInteracting() || inSkipAnimation);
	const batchSkipAnimation = useSkipAnimation(inSkipAnimation);
	const { xAxis: xAxes } = useXAxes();
	const { yAxis: yAxes } = useYAxes();
	const { completedData, masksData } = useBarPlotData(useDrawingArea(), xAxes, yAxes);
	const classes = useUtilityClasses$2();
	const BarElementPlot = renderer === "svg-batch" ? BatchBarPlot : IndividualBarPlot;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarPlotRoot, {
		className: classes.root,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BarElementPlot, _extends({
			completedData,
			masksData,
			skipAnimation: renderer === "svg-batch" ? batchSkipAnimation : skipAnimation,
			onItemClick,
			borderRadius
		}, other)), completedData.map((processedSeries) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BarLabelPlot, _extends({
			className: classes.seriesLabels,
			processedSeries,
			skipAnimation,
			barLabel
		}, other), processedSeries.seriesId))]
	});
}
BarPlot.propTypes = {
	barLabel: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["value"]), import_prop_types.default.func]),
	borderRadius: import_prop_types.default.number,
	onItemClick: import_prop_types.default.func,
	renderer: import_prop_types.default.oneOf(["svg-batch", "svg-single"]),
	skipAnimation: import_prop_types.default.bool,
	slotProps: import_prop_types.default.object,
	slots: import_prop_types.default.object
};
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/BarChart.plugins.js
var BAR_CHART_PLUGINS = [
	useChartZAxis,
	useChartBrush,
	useChartTooltip,
	useChartInteraction,
	useChartCartesianAxis,
	useChartHighlight,
	useChartVisibilityManager,
	useChartKeyboardNavigation
];
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/useBarChartProps.js
var _excluded = [
	"xAxis",
	"yAxis",
	"series",
	"width",
	"height",
	"margin",
	"colors",
	"dataset",
	"sx",
	"axisHighlight",
	"grid",
	"children",
	"slots",
	"slotProps",
	"skipAnimation",
	"loading",
	"layout",
	"onItemClick",
	"highlightedItem",
	"onHighlightChange",
	"borderRadius",
	"barLabel",
	"className",
	"hideLegend",
	"showToolbar",
	"brushConfig",
	"renderer"
];
/**
* A helper function that extracts BarChartProps from the input props
* and returns an object with props for the children components of BarChart.
*
* @param props The input props for BarChart
* @returns An object with props for the children components of BarChart
*/
var useBarChartProps = (props) => {
	const { xAxis, yAxis, series, width, height, margin, colors, dataset, sx, axisHighlight, grid, children, slots, slotProps, skipAnimation, loading, layout, onItemClick, highlightedItem, onHighlightChange, borderRadius, barLabel, className, brushConfig, renderer } = props, other = _objectWithoutPropertiesLoose(props, _excluded);
	const clipPathId = `${useId()}-clip-path`;
	const hasHorizontalSeries = layout === "horizontal" || layout === void 0 && series.some((item) => item.layout === "horizontal");
	const defaultBandXAxis = import_react.useMemo(() => [{
		id: DEFAULT_X_AXIS_KEY,
		scaleType: "band",
		data: Array.from({ length: Math.max(...series.map((s) => (s.data ?? dataset ?? []).length)) }, (_, index) => index)
	}], [dataset, series]);
	const defaultBandYAxis = import_react.useMemo(() => [{
		id: DEFAULT_Y_AXIS_KEY,
		scaleType: "band",
		data: Array.from({ length: Math.max(...series.map((s) => (s.data ?? dataset ?? []).length)) }, (_, index) => index)
	}], [dataset, series]);
	const seriesWithDefault = import_react.useMemo(() => series.map((s) => _extends({ type: "bar" }, s, { layout: hasHorizontalSeries ? "horizontal" : "vertical" })), [hasHorizontalSeries, series]);
	const defaultXAxis = hasHorizontalSeries ? void 0 : defaultBandXAxis;
	const processedXAxis = import_react.useMemo(() => {
		if (!xAxis) return defaultXAxis;
		return hasHorizontalSeries ? xAxis : xAxis.map((axis) => _extends({ scaleType: "band" }, axis));
	}, [
		defaultXAxis,
		hasHorizontalSeries,
		xAxis
	]);
	const defaultYAxis = hasHorizontalSeries ? defaultBandYAxis : void 0;
	const chartContainerProps = _extends({}, other, {
		series: seriesWithDefault,
		width,
		height,
		margin,
		colors,
		dataset,
		xAxis: processedXAxis,
		yAxis: import_react.useMemo(() => {
			if (!yAxis) return defaultYAxis;
			return hasHorizontalSeries ? yAxis.map((axis) => _extends({ scaleType: "band" }, axis)) : yAxis;
		}, [
			defaultYAxis,
			hasHorizontalSeries,
			yAxis
		]),
		highlightedItem,
		onHighlightChange,
		disableAxisListener: slotProps?.tooltip?.trigger !== "axis" && axisHighlight?.x === "none" && axisHighlight?.y === "none",
		className,
		skipAnimation,
		brushConfig,
		plugins: BAR_CHART_PLUGINS
	});
	const barPlotProps = {
		onItemClick,
		slots,
		slotProps,
		borderRadius,
		renderer,
		barLabel
	};
	const gridProps = {
		vertical: grid?.vertical,
		horizontal: grid?.horizontal
	};
	const clipPathGroupProps = { clipPath: `url(#${clipPathId})` };
	const clipPathProps = { id: clipPathId };
	const overlayProps = {
		slots,
		slotProps,
		loading
	};
	const chartsAxisProps = {
		slots,
		slotProps
	};
	const axisHighlightProps = _extends({}, hasHorizontalSeries ? { y: "band" } : { x: "band" }, axisHighlight);
	const legendProps = {
		slots,
		slotProps
	};
	return {
		chartsWrapperProps: {
			sx,
			legendPosition: props.slotProps?.legend?.position,
			legendDirection: props.slotProps?.legend?.direction,
			hideLegend: props.hideLegend ?? false
		},
		chartContainerProps,
		barPlotProps,
		gridProps,
		clipPathProps,
		clipPathGroupProps,
		overlayProps,
		chartsAxisProps,
		axisHighlightProps,
		legendProps,
		children
	};
};
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/FocusedBar.js
function FocusedBar(props) {
	const theme = useTheme();
	const focusedItem = useFocusedItem();
	const barSeries = useBarSeriesContext();
	const { xAxis, xAxisIds } = useXAxes();
	const { yAxis, yAxisIds } = useYAxes();
	if (focusedItem === null || focusedItem.type !== "bar" || !barSeries) return null;
	const series = barSeries.series[focusedItem.seriesId];
	if (series.data[focusedItem.dataIndex] == null) return null;
	const xAxisId = series.xAxisId ?? xAxisIds[0];
	const yAxisId = series.yAxisId ?? yAxisIds[0];
	const xAxisConfig = xAxis[xAxisId];
	const yAxisConfig = yAxis[yAxisId];
	const verticalLayout = barSeries.series[focusedItem.seriesId].layout === "vertical";
	const groupIndex = barSeries.stackingGroups.findIndex((group) => group.ids.includes(focusedItem.seriesId));
	const barDimensions = getBarDimensions({
		verticalLayout,
		xAxisConfig,
		yAxisConfig,
		series,
		dataIndex: focusedItem.dataIndex,
		numberOfGroups: barSeries.stackingGroups.length,
		groupIndex
	});
	if (barDimensions === null) return null;
	const { x, y, height, width } = barDimensions;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", _extends({
		fill: "none",
		stroke: (theme.vars ?? theme).palette.text.primary,
		strokeWidth: 2,
		x: x - 3,
		y: y - 3,
		width: width + 6,
		height: height + 6,
		rx: 3,
		ry: 3
	}, props));
}
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/BarChart.js
/**
* Demos:
*
* - [Bars](https://mui.com/x/react-charts/bars/)
* - [Bar demonstration](https://mui.com/x/react-charts/bar-demo/)
* - [Stacking](https://mui.com/x/react-charts/stacking/)
*
* API:
*
* - [BarChart API](https://mui.com/x/api/charts/bar-chart/)
*/
var BarChart = /* @__PURE__ */ import_react.forwardRef(function BarChart(inProps, ref) {
	const props = useThemeProps({
		props: inProps,
		name: "MuiBarChart"
	});
	const { chartsWrapperProps, chartContainerProps, barPlotProps, gridProps, clipPathProps, clipPathGroupProps, overlayProps, chartsAxisProps, axisHighlightProps, legendProps, children } = useBarChartProps(props);
	const { chartDataProviderProps, chartsSurfaceProps } = useChartContainerProps(chartContainerProps, ref);
	const Tooltip = props.slots?.tooltip ?? ChartsTooltip;
	const Toolbar = props.slots?.toolbar;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartDataProvider, _extends({}, chartDataProviderProps, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ChartsWrapper, _extends({}, chartsWrapperProps, { children: [
		props.showToolbar && Toolbar ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toolbar, _extends({}, props.slotProps?.toolbar)) : null,
		!props.hideLegend && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsLegend, _extends({}, legendProps)),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ChartsSurface, _extends({}, chartsSurfaceProps, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsGrid, _extends({}, gridProps)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", _extends({}, clipPathGroupProps, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BarPlot, _extends({}, barPlotProps)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsOverlay, _extends({}, overlayProps)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsAxisHighlight, _extends({}, axisHighlightProps)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FocusedBar, {})
			] })),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsAxis, _extends({}, chartsAxisProps)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsClipPath, _extends({}, clipPathProps)),
			children
		] })),
		!props.loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, _extends({}, props.slotProps?.tooltip))
	] })) }));
});
BarChart.displayName = "BarChart";
BarChart.propTypes = {
	apiRef: import_prop_types.default.shape({ current: import_prop_types.default.object }),
	axisHighlight: import_prop_types.default.shape({
		x: import_prop_types.default.oneOf([
			"band",
			"line",
			"none"
		]),
		y: import_prop_types.default.oneOf([
			"band",
			"line",
			"none"
		])
	}),
	barLabel: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["value"]), import_prop_types.default.func]),
	borderRadius: import_prop_types.default.number,
	brushConfig: import_prop_types.default.shape({
		enabled: import_prop_types.default.bool,
		preventHighlight: import_prop_types.default.bool,
		preventTooltip: import_prop_types.default.bool
	}),
	children: import_prop_types.default.node,
	className: import_prop_types.default.string,
	colors: import_prop_types.default.oneOfType([import_prop_types.default.arrayOf(import_prop_types.default.string), import_prop_types.default.func]),
	dataset: import_prop_types.default.arrayOf(import_prop_types.default.object),
	desc: import_prop_types.default.string,
	disableAxisListener: import_prop_types.default.bool,
	enableKeyboardNavigation: import_prop_types.default.bool,
	grid: import_prop_types.default.shape({
		horizontal: import_prop_types.default.bool,
		vertical: import_prop_types.default.bool
	}),
	height: import_prop_types.default.number,
	hiddenItems: import_prop_types.default.arrayOf(import_prop_types.default.shape({
		dataIndex: import_prop_types.default.number,
		seriesId: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]),
		type: import_prop_types.default.oneOf(["bar"]).isRequired
	})),
	hideLegend: import_prop_types.default.bool,
	highlightedAxis: import_prop_types.default.arrayOf(import_prop_types.default.shape({
		axisId: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]).isRequired,
		dataIndex: import_prop_types.default.number.isRequired
	})),
	highlightedItem: import_prop_types.default.shape({
		dataIndex: import_prop_types.default.number,
		seriesId: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]).isRequired
	}),
	id: import_prop_types.default.string,
	initialHiddenItems: import_prop_types.default.arrayOf(import_prop_types.default.shape({
		dataIndex: import_prop_types.default.number,
		seriesId: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]),
		type: import_prop_types.default.oneOf(["bar"]).isRequired
	})),
	layout: import_prop_types.default.oneOf(["horizontal", "vertical"]),
	loading: import_prop_types.default.bool,
	localeText: import_prop_types.default.object,
	margin: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.shape({
		bottom: import_prop_types.default.number,
		left: import_prop_types.default.number,
		right: import_prop_types.default.number,
		top: import_prop_types.default.number
	})]),
	onAxisClick: import_prop_types.default.func,
	onHiddenItemsChange: import_prop_types.default.func,
	onHighlightChange: import_prop_types.default.func,
	onHighlightedAxisChange: import_prop_types.default.func,
	onItemClick: import_prop_types.default.func,
	onTooltipItemChange: import_prop_types.default.func,
	renderer: import_prop_types.default.oneOf(["svg-batch", "svg-single"]),
	series: import_prop_types.default.arrayOf(import_prop_types.default.object).isRequired,
	showToolbar: import_prop_types.default.bool,
	skipAnimation: import_prop_types.default.bool,
	slotProps: import_prop_types.default.object,
	slots: import_prop_types.default.object,
	sx: import_prop_types.default.oneOfType([
		import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
			import_prop_types.default.func,
			import_prop_types.default.object,
			import_prop_types.default.bool
		])),
		import_prop_types.default.func,
		import_prop_types.default.object
	]),
	theme: import_prop_types.default.oneOf(["dark", "light"]),
	title: import_prop_types.default.string,
	tooltipItem: import_prop_types.default.shape({
		dataIndex: import_prop_types.default.number.isRequired,
		seriesId: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]).isRequired,
		type: import_prop_types.default.oneOf(["bar"]).isRequired
	}),
	width: import_prop_types.default.number,
	xAxis: import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
		import_prop_types.default.shape({
			axis: import_prop_types.default.oneOf(["x"]),
			barGapRatio: import_prop_types.default.number,
			categoryGapRatio: import_prop_types.default.number,
			classes: import_prop_types.default.object,
			colorMap: import_prop_types.default.oneOfType([
				import_prop_types.default.shape({
					colors: import_prop_types.default.arrayOf(import_prop_types.default.string).isRequired,
					type: import_prop_types.default.oneOf(["ordinal"]).isRequired,
					unknownColor: import_prop_types.default.string,
					values: import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
						import_prop_types.default.instanceOf(Date),
						import_prop_types.default.number,
						import_prop_types.default.string
					]).isRequired)
				}),
				import_prop_types.default.shape({
					color: import_prop_types.default.oneOfType([import_prop_types.default.arrayOf(import_prop_types.default.string.isRequired), import_prop_types.default.func]).isRequired,
					max: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
					min: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
					type: import_prop_types.default.oneOf(["continuous"]).isRequired
				}),
				import_prop_types.default.shape({
					colors: import_prop_types.default.arrayOf(import_prop_types.default.string).isRequired,
					thresholds: import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]).isRequired).isRequired,
					type: import_prop_types.default.oneOf(["piecewise"]).isRequired
				})
			]),
			data: import_prop_types.default.array,
			dataKey: import_prop_types.default.string,
			disableLine: import_prop_types.default.bool,
			disableTicks: import_prop_types.default.bool,
			domainLimit: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["nice", "strict"]), import_prop_types.default.func]),
			groups: import_prop_types.default.arrayOf(import_prop_types.default.shape({
				getValue: import_prop_types.default.func.isRequired,
				tickLabelStyle: import_prop_types.default.object,
				tickSize: import_prop_types.default.number
			})),
			height: import_prop_types.default.number,
			hideTooltip: import_prop_types.default.bool,
			id: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]),
			ignoreTooltip: import_prop_types.default.bool,
			label: import_prop_types.default.string,
			labelStyle: import_prop_types.default.object,
			offset: import_prop_types.default.number,
			ordinalTimeTicks: import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.oneOf([
				"biweekly",
				"days",
				"hours",
				"months",
				"quarterly",
				"weeks",
				"years"
			]), import_prop_types.default.shape({
				format: import_prop_types.default.func.isRequired,
				getTickNumber: import_prop_types.default.func.isRequired,
				isTick: import_prop_types.default.func.isRequired
			})]).isRequired),
			position: import_prop_types.default.oneOf([
				"bottom",
				"none",
				"top"
			]),
			reverse: import_prop_types.default.bool,
			scaleType: import_prop_types.default.oneOf(["band"]),
			slotProps: import_prop_types.default.object,
			slots: import_prop_types.default.object,
			sx: import_prop_types.default.oneOfType([
				import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
					import_prop_types.default.func,
					import_prop_types.default.object,
					import_prop_types.default.bool
				])),
				import_prop_types.default.func,
				import_prop_types.default.object
			]),
			tickInterval: import_prop_types.default.oneOfType([
				import_prop_types.default.oneOf(["auto"]),
				import_prop_types.default.array,
				import_prop_types.default.func
			]),
			tickLabelInterval: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["auto"]), import_prop_types.default.func]),
			tickLabelMinGap: import_prop_types.default.number,
			tickLabelPlacement: import_prop_types.default.oneOf(["middle", "tick"]),
			tickLabelStyle: import_prop_types.default.object,
			tickMaxStep: import_prop_types.default.number,
			tickMinStep: import_prop_types.default.number,
			tickNumber: import_prop_types.default.number,
			tickPlacement: import_prop_types.default.oneOf([
				"end",
				"extremities",
				"middle",
				"start"
			]),
			tickSize: import_prop_types.default.number,
			tickSpacing: import_prop_types.default.number,
			valueFormatter: import_prop_types.default.func
		}),
		import_prop_types.default.shape({
			axis: import_prop_types.default.oneOf(["x"]),
			classes: import_prop_types.default.object,
			colorMap: import_prop_types.default.oneOfType([
				import_prop_types.default.shape({
					colors: import_prop_types.default.arrayOf(import_prop_types.default.string).isRequired,
					type: import_prop_types.default.oneOf(["ordinal"]).isRequired,
					unknownColor: import_prop_types.default.string,
					values: import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
						import_prop_types.default.instanceOf(Date),
						import_prop_types.default.number,
						import_prop_types.default.string
					]).isRequired)
				}),
				import_prop_types.default.shape({
					color: import_prop_types.default.oneOfType([import_prop_types.default.arrayOf(import_prop_types.default.string.isRequired), import_prop_types.default.func]).isRequired,
					max: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
					min: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
					type: import_prop_types.default.oneOf(["continuous"]).isRequired
				}),
				import_prop_types.default.shape({
					colors: import_prop_types.default.arrayOf(import_prop_types.default.string).isRequired,
					thresholds: import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]).isRequired).isRequired,
					type: import_prop_types.default.oneOf(["piecewise"]).isRequired
				})
			]),
			data: import_prop_types.default.array,
			dataKey: import_prop_types.default.string,
			disableLine: import_prop_types.default.bool,
			disableTicks: import_prop_types.default.bool,
			domainLimit: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["nice", "strict"]), import_prop_types.default.func]),
			groups: import_prop_types.default.arrayOf(import_prop_types.default.shape({
				getValue: import_prop_types.default.func.isRequired,
				tickLabelStyle: import_prop_types.default.object,
				tickSize: import_prop_types.default.number
			})),
			height: import_prop_types.default.number,
			hideTooltip: import_prop_types.default.bool,
			id: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]),
			ignoreTooltip: import_prop_types.default.bool,
			label: import_prop_types.default.string,
			labelStyle: import_prop_types.default.object,
			offset: import_prop_types.default.number,
			ordinalTimeTicks: import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.oneOf([
				"biweekly",
				"days",
				"hours",
				"months",
				"quarterly",
				"weeks",
				"years"
			]), import_prop_types.default.shape({
				format: import_prop_types.default.func.isRequired,
				getTickNumber: import_prop_types.default.func.isRequired,
				isTick: import_prop_types.default.func.isRequired
			})]).isRequired),
			position: import_prop_types.default.oneOf([
				"bottom",
				"none",
				"top"
			]),
			reverse: import_prop_types.default.bool,
			scaleType: import_prop_types.default.oneOf(["point"]),
			slotProps: import_prop_types.default.object,
			slots: import_prop_types.default.object,
			sx: import_prop_types.default.oneOfType([
				import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
					import_prop_types.default.func,
					import_prop_types.default.object,
					import_prop_types.default.bool
				])),
				import_prop_types.default.func,
				import_prop_types.default.object
			]),
			tickInterval: import_prop_types.default.oneOfType([
				import_prop_types.default.oneOf(["auto"]),
				import_prop_types.default.array,
				import_prop_types.default.func
			]),
			tickLabelInterval: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["auto"]), import_prop_types.default.func]),
			tickLabelMinGap: import_prop_types.default.number,
			tickLabelPlacement: import_prop_types.default.oneOf(["middle", "tick"]),
			tickLabelStyle: import_prop_types.default.object,
			tickMaxStep: import_prop_types.default.number,
			tickMinStep: import_prop_types.default.number,
			tickNumber: import_prop_types.default.number,
			tickPlacement: import_prop_types.default.oneOf([
				"end",
				"extremities",
				"middle",
				"start"
			]),
			tickSize: import_prop_types.default.number,
			tickSpacing: import_prop_types.default.number,
			valueFormatter: import_prop_types.default.func
		}),
		import_prop_types.default.shape({
			axis: import_prop_types.default.oneOf(["x"]),
			classes: import_prop_types.default.object,
			colorMap: import_prop_types.default.oneOfType([import_prop_types.default.shape({
				color: import_prop_types.default.oneOfType([import_prop_types.default.arrayOf(import_prop_types.default.string.isRequired), import_prop_types.default.func]).isRequired,
				max: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
				min: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
				type: import_prop_types.default.oneOf(["continuous"]).isRequired
			}), import_prop_types.default.shape({
				colors: import_prop_types.default.arrayOf(import_prop_types.default.string).isRequired,
				thresholds: import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]).isRequired).isRequired,
				type: import_prop_types.default.oneOf(["piecewise"]).isRequired
			})]),
			data: import_prop_types.default.array,
			dataKey: import_prop_types.default.string,
			disableLine: import_prop_types.default.bool,
			disableTicks: import_prop_types.default.bool,
			domainLimit: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["nice", "strict"]), import_prop_types.default.func]),
			height: import_prop_types.default.number,
			hideTooltip: import_prop_types.default.bool,
			id: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]),
			ignoreTooltip: import_prop_types.default.bool,
			label: import_prop_types.default.string,
			labelStyle: import_prop_types.default.object,
			max: import_prop_types.default.number,
			min: import_prop_types.default.number,
			offset: import_prop_types.default.number,
			position: import_prop_types.default.oneOf([
				"bottom",
				"none",
				"top"
			]),
			reverse: import_prop_types.default.bool,
			scaleType: import_prop_types.default.oneOf(["log"]),
			slotProps: import_prop_types.default.object,
			slots: import_prop_types.default.object,
			sx: import_prop_types.default.oneOfType([
				import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
					import_prop_types.default.func,
					import_prop_types.default.object,
					import_prop_types.default.bool
				])),
				import_prop_types.default.func,
				import_prop_types.default.object
			]),
			tickInterval: import_prop_types.default.oneOfType([
				import_prop_types.default.oneOf(["auto"]),
				import_prop_types.default.array,
				import_prop_types.default.func
			]),
			tickLabelInterval: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["auto"]), import_prop_types.default.func]),
			tickLabelMinGap: import_prop_types.default.number,
			tickLabelPlacement: import_prop_types.default.oneOf(["middle", "tick"]),
			tickLabelStyle: import_prop_types.default.object,
			tickMaxStep: import_prop_types.default.number,
			tickMinStep: import_prop_types.default.number,
			tickNumber: import_prop_types.default.number,
			tickPlacement: import_prop_types.default.oneOf([
				"end",
				"extremities",
				"middle",
				"start"
			]),
			tickSize: import_prop_types.default.number,
			tickSpacing: import_prop_types.default.number,
			valueFormatter: import_prop_types.default.func
		}),
		import_prop_types.default.shape({
			axis: import_prop_types.default.oneOf(["x"]),
			classes: import_prop_types.default.object,
			colorMap: import_prop_types.default.oneOfType([import_prop_types.default.shape({
				color: import_prop_types.default.oneOfType([import_prop_types.default.arrayOf(import_prop_types.default.string.isRequired), import_prop_types.default.func]).isRequired,
				max: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
				min: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
				type: import_prop_types.default.oneOf(["continuous"]).isRequired
			}), import_prop_types.default.shape({
				colors: import_prop_types.default.arrayOf(import_prop_types.default.string).isRequired,
				thresholds: import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]).isRequired).isRequired,
				type: import_prop_types.default.oneOf(["piecewise"]).isRequired
			})]),
			constant: import_prop_types.default.number,
			data: import_prop_types.default.array,
			dataKey: import_prop_types.default.string,
			disableLine: import_prop_types.default.bool,
			disableTicks: import_prop_types.default.bool,
			domainLimit: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["nice", "strict"]), import_prop_types.default.func]),
			height: import_prop_types.default.number,
			hideTooltip: import_prop_types.default.bool,
			id: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]),
			ignoreTooltip: import_prop_types.default.bool,
			label: import_prop_types.default.string,
			labelStyle: import_prop_types.default.object,
			max: import_prop_types.default.number,
			min: import_prop_types.default.number,
			offset: import_prop_types.default.number,
			position: import_prop_types.default.oneOf([
				"bottom",
				"none",
				"top"
			]),
			reverse: import_prop_types.default.bool,
			scaleType: import_prop_types.default.oneOf(["symlog"]),
			slotProps: import_prop_types.default.object,
			slots: import_prop_types.default.object,
			sx: import_prop_types.default.oneOfType([
				import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
					import_prop_types.default.func,
					import_prop_types.default.object,
					import_prop_types.default.bool
				])),
				import_prop_types.default.func,
				import_prop_types.default.object
			]),
			tickInterval: import_prop_types.default.oneOfType([
				import_prop_types.default.oneOf(["auto"]),
				import_prop_types.default.array,
				import_prop_types.default.func
			]),
			tickLabelInterval: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["auto"]), import_prop_types.default.func]),
			tickLabelMinGap: import_prop_types.default.number,
			tickLabelPlacement: import_prop_types.default.oneOf(["middle", "tick"]),
			tickLabelStyle: import_prop_types.default.object,
			tickMaxStep: import_prop_types.default.number,
			tickMinStep: import_prop_types.default.number,
			tickNumber: import_prop_types.default.number,
			tickPlacement: import_prop_types.default.oneOf([
				"end",
				"extremities",
				"middle",
				"start"
			]),
			tickSize: import_prop_types.default.number,
			tickSpacing: import_prop_types.default.number,
			valueFormatter: import_prop_types.default.func
		}),
		import_prop_types.default.shape({
			axis: import_prop_types.default.oneOf(["x"]),
			classes: import_prop_types.default.object,
			colorMap: import_prop_types.default.oneOfType([import_prop_types.default.shape({
				color: import_prop_types.default.oneOfType([import_prop_types.default.arrayOf(import_prop_types.default.string.isRequired), import_prop_types.default.func]).isRequired,
				max: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
				min: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
				type: import_prop_types.default.oneOf(["continuous"]).isRequired
			}), import_prop_types.default.shape({
				colors: import_prop_types.default.arrayOf(import_prop_types.default.string).isRequired,
				thresholds: import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]).isRequired).isRequired,
				type: import_prop_types.default.oneOf(["piecewise"]).isRequired
			})]),
			data: import_prop_types.default.array,
			dataKey: import_prop_types.default.string,
			disableLine: import_prop_types.default.bool,
			disableTicks: import_prop_types.default.bool,
			domainLimit: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["nice", "strict"]), import_prop_types.default.func]),
			height: import_prop_types.default.number,
			hideTooltip: import_prop_types.default.bool,
			id: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]),
			ignoreTooltip: import_prop_types.default.bool,
			label: import_prop_types.default.string,
			labelStyle: import_prop_types.default.object,
			max: import_prop_types.default.number,
			min: import_prop_types.default.number,
			offset: import_prop_types.default.number,
			position: import_prop_types.default.oneOf([
				"bottom",
				"none",
				"top"
			]),
			reverse: import_prop_types.default.bool,
			scaleType: import_prop_types.default.oneOf(["pow"]),
			slotProps: import_prop_types.default.object,
			slots: import_prop_types.default.object,
			sx: import_prop_types.default.oneOfType([
				import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
					import_prop_types.default.func,
					import_prop_types.default.object,
					import_prop_types.default.bool
				])),
				import_prop_types.default.func,
				import_prop_types.default.object
			]),
			tickInterval: import_prop_types.default.oneOfType([
				import_prop_types.default.oneOf(["auto"]),
				import_prop_types.default.array,
				import_prop_types.default.func
			]),
			tickLabelInterval: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["auto"]), import_prop_types.default.func]),
			tickLabelMinGap: import_prop_types.default.number,
			tickLabelPlacement: import_prop_types.default.oneOf(["middle", "tick"]),
			tickLabelStyle: import_prop_types.default.object,
			tickMaxStep: import_prop_types.default.number,
			tickMinStep: import_prop_types.default.number,
			tickNumber: import_prop_types.default.number,
			tickPlacement: import_prop_types.default.oneOf([
				"end",
				"extremities",
				"middle",
				"start"
			]),
			tickSize: import_prop_types.default.number,
			tickSpacing: import_prop_types.default.number,
			valueFormatter: import_prop_types.default.func
		}),
		import_prop_types.default.shape({
			axis: import_prop_types.default.oneOf(["x"]),
			classes: import_prop_types.default.object,
			colorMap: import_prop_types.default.oneOfType([import_prop_types.default.shape({
				color: import_prop_types.default.oneOfType([import_prop_types.default.arrayOf(import_prop_types.default.string.isRequired), import_prop_types.default.func]).isRequired,
				max: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
				min: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
				type: import_prop_types.default.oneOf(["continuous"]).isRequired
			}), import_prop_types.default.shape({
				colors: import_prop_types.default.arrayOf(import_prop_types.default.string).isRequired,
				thresholds: import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]).isRequired).isRequired,
				type: import_prop_types.default.oneOf(["piecewise"]).isRequired
			})]),
			data: import_prop_types.default.array,
			dataKey: import_prop_types.default.string,
			disableLine: import_prop_types.default.bool,
			disableTicks: import_prop_types.default.bool,
			domainLimit: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["nice", "strict"]), import_prop_types.default.func]),
			height: import_prop_types.default.number,
			hideTooltip: import_prop_types.default.bool,
			id: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]),
			ignoreTooltip: import_prop_types.default.bool,
			label: import_prop_types.default.string,
			labelStyle: import_prop_types.default.object,
			max: import_prop_types.default.number,
			min: import_prop_types.default.number,
			offset: import_prop_types.default.number,
			position: import_prop_types.default.oneOf([
				"bottom",
				"none",
				"top"
			]),
			reverse: import_prop_types.default.bool,
			scaleType: import_prop_types.default.oneOf(["sqrt"]),
			slotProps: import_prop_types.default.object,
			slots: import_prop_types.default.object,
			sx: import_prop_types.default.oneOfType([
				import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
					import_prop_types.default.func,
					import_prop_types.default.object,
					import_prop_types.default.bool
				])),
				import_prop_types.default.func,
				import_prop_types.default.object
			]),
			tickInterval: import_prop_types.default.oneOfType([
				import_prop_types.default.oneOf(["auto"]),
				import_prop_types.default.array,
				import_prop_types.default.func
			]),
			tickLabelInterval: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["auto"]), import_prop_types.default.func]),
			tickLabelMinGap: import_prop_types.default.number,
			tickLabelPlacement: import_prop_types.default.oneOf(["middle", "tick"]),
			tickLabelStyle: import_prop_types.default.object,
			tickMaxStep: import_prop_types.default.number,
			tickMinStep: import_prop_types.default.number,
			tickNumber: import_prop_types.default.number,
			tickPlacement: import_prop_types.default.oneOf([
				"end",
				"extremities",
				"middle",
				"start"
			]),
			tickSize: import_prop_types.default.number,
			tickSpacing: import_prop_types.default.number,
			valueFormatter: import_prop_types.default.func
		}),
		import_prop_types.default.shape({
			axis: import_prop_types.default.oneOf(["x"]),
			classes: import_prop_types.default.object,
			colorMap: import_prop_types.default.oneOfType([import_prop_types.default.shape({
				color: import_prop_types.default.oneOfType([import_prop_types.default.arrayOf(import_prop_types.default.string.isRequired), import_prop_types.default.func]).isRequired,
				max: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
				min: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
				type: import_prop_types.default.oneOf(["continuous"]).isRequired
			}), import_prop_types.default.shape({
				colors: import_prop_types.default.arrayOf(import_prop_types.default.string).isRequired,
				thresholds: import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]).isRequired).isRequired,
				type: import_prop_types.default.oneOf(["piecewise"]).isRequired
			})]),
			data: import_prop_types.default.array,
			dataKey: import_prop_types.default.string,
			disableLine: import_prop_types.default.bool,
			disableTicks: import_prop_types.default.bool,
			domainLimit: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["nice", "strict"]), import_prop_types.default.func]),
			height: import_prop_types.default.number,
			hideTooltip: import_prop_types.default.bool,
			id: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]),
			ignoreTooltip: import_prop_types.default.bool,
			label: import_prop_types.default.string,
			labelStyle: import_prop_types.default.object,
			max: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.shape({ valueOf: import_prop_types.default.func.isRequired })]),
			min: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.shape({ valueOf: import_prop_types.default.func.isRequired })]),
			offset: import_prop_types.default.number,
			position: import_prop_types.default.oneOf([
				"bottom",
				"none",
				"top"
			]),
			reverse: import_prop_types.default.bool,
			scaleType: import_prop_types.default.oneOf(["time"]),
			slotProps: import_prop_types.default.object,
			slots: import_prop_types.default.object,
			sx: import_prop_types.default.oneOfType([
				import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
					import_prop_types.default.func,
					import_prop_types.default.object,
					import_prop_types.default.bool
				])),
				import_prop_types.default.func,
				import_prop_types.default.object
			]),
			tickInterval: import_prop_types.default.oneOfType([
				import_prop_types.default.oneOf(["auto"]),
				import_prop_types.default.array,
				import_prop_types.default.func
			]),
			tickLabelInterval: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["auto"]), import_prop_types.default.func]),
			tickLabelMinGap: import_prop_types.default.number,
			tickLabelPlacement: import_prop_types.default.oneOf(["middle", "tick"]),
			tickLabelStyle: import_prop_types.default.object,
			tickMaxStep: import_prop_types.default.number,
			tickMinStep: import_prop_types.default.number,
			tickNumber: import_prop_types.default.number,
			tickPlacement: import_prop_types.default.oneOf([
				"end",
				"extremities",
				"middle",
				"start"
			]),
			tickSize: import_prop_types.default.number,
			tickSpacing: import_prop_types.default.number,
			valueFormatter: import_prop_types.default.func
		}),
		import_prop_types.default.shape({
			axis: import_prop_types.default.oneOf(["x"]),
			classes: import_prop_types.default.object,
			colorMap: import_prop_types.default.oneOfType([import_prop_types.default.shape({
				color: import_prop_types.default.oneOfType([import_prop_types.default.arrayOf(import_prop_types.default.string.isRequired), import_prop_types.default.func]).isRequired,
				max: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
				min: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
				type: import_prop_types.default.oneOf(["continuous"]).isRequired
			}), import_prop_types.default.shape({
				colors: import_prop_types.default.arrayOf(import_prop_types.default.string).isRequired,
				thresholds: import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]).isRequired).isRequired,
				type: import_prop_types.default.oneOf(["piecewise"]).isRequired
			})]),
			data: import_prop_types.default.array,
			dataKey: import_prop_types.default.string,
			disableLine: import_prop_types.default.bool,
			disableTicks: import_prop_types.default.bool,
			domainLimit: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["nice", "strict"]), import_prop_types.default.func]),
			height: import_prop_types.default.number,
			hideTooltip: import_prop_types.default.bool,
			id: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]),
			ignoreTooltip: import_prop_types.default.bool,
			label: import_prop_types.default.string,
			labelStyle: import_prop_types.default.object,
			max: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.shape({ valueOf: import_prop_types.default.func.isRequired })]),
			min: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.shape({ valueOf: import_prop_types.default.func.isRequired })]),
			offset: import_prop_types.default.number,
			position: import_prop_types.default.oneOf([
				"bottom",
				"none",
				"top"
			]),
			reverse: import_prop_types.default.bool,
			scaleType: import_prop_types.default.oneOf(["utc"]),
			slotProps: import_prop_types.default.object,
			slots: import_prop_types.default.object,
			sx: import_prop_types.default.oneOfType([
				import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
					import_prop_types.default.func,
					import_prop_types.default.object,
					import_prop_types.default.bool
				])),
				import_prop_types.default.func,
				import_prop_types.default.object
			]),
			tickInterval: import_prop_types.default.oneOfType([
				import_prop_types.default.oneOf(["auto"]),
				import_prop_types.default.array,
				import_prop_types.default.func
			]),
			tickLabelInterval: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["auto"]), import_prop_types.default.func]),
			tickLabelMinGap: import_prop_types.default.number,
			tickLabelPlacement: import_prop_types.default.oneOf(["middle", "tick"]),
			tickLabelStyle: import_prop_types.default.object,
			tickMaxStep: import_prop_types.default.number,
			tickMinStep: import_prop_types.default.number,
			tickNumber: import_prop_types.default.number,
			tickPlacement: import_prop_types.default.oneOf([
				"end",
				"extremities",
				"middle",
				"start"
			]),
			tickSize: import_prop_types.default.number,
			tickSpacing: import_prop_types.default.number,
			valueFormatter: import_prop_types.default.func
		}),
		import_prop_types.default.shape({
			axis: import_prop_types.default.oneOf(["x"]),
			classes: import_prop_types.default.object,
			colorMap: import_prop_types.default.oneOfType([import_prop_types.default.shape({
				color: import_prop_types.default.oneOfType([import_prop_types.default.arrayOf(import_prop_types.default.string.isRequired), import_prop_types.default.func]).isRequired,
				max: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
				min: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
				type: import_prop_types.default.oneOf(["continuous"]).isRequired
			}), import_prop_types.default.shape({
				colors: import_prop_types.default.arrayOf(import_prop_types.default.string).isRequired,
				thresholds: import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]).isRequired).isRequired,
				type: import_prop_types.default.oneOf(["piecewise"]).isRequired
			})]),
			data: import_prop_types.default.array,
			dataKey: import_prop_types.default.string,
			disableLine: import_prop_types.default.bool,
			disableTicks: import_prop_types.default.bool,
			domainLimit: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["nice", "strict"]), import_prop_types.default.func]),
			height: import_prop_types.default.number,
			hideTooltip: import_prop_types.default.bool,
			id: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]),
			ignoreTooltip: import_prop_types.default.bool,
			label: import_prop_types.default.string,
			labelStyle: import_prop_types.default.object,
			max: import_prop_types.default.number,
			min: import_prop_types.default.number,
			offset: import_prop_types.default.number,
			position: import_prop_types.default.oneOf([
				"bottom",
				"none",
				"top"
			]),
			reverse: import_prop_types.default.bool,
			scaleType: import_prop_types.default.oneOf(["linear"]),
			slotProps: import_prop_types.default.object,
			slots: import_prop_types.default.object,
			sx: import_prop_types.default.oneOfType([
				import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
					import_prop_types.default.func,
					import_prop_types.default.object,
					import_prop_types.default.bool
				])),
				import_prop_types.default.func,
				import_prop_types.default.object
			]),
			tickInterval: import_prop_types.default.oneOfType([
				import_prop_types.default.oneOf(["auto"]),
				import_prop_types.default.array,
				import_prop_types.default.func
			]),
			tickLabelInterval: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["auto"]), import_prop_types.default.func]),
			tickLabelMinGap: import_prop_types.default.number,
			tickLabelPlacement: import_prop_types.default.oneOf(["middle", "tick"]),
			tickLabelStyle: import_prop_types.default.object,
			tickMaxStep: import_prop_types.default.number,
			tickMinStep: import_prop_types.default.number,
			tickNumber: import_prop_types.default.number,
			tickPlacement: import_prop_types.default.oneOf([
				"end",
				"extremities",
				"middle",
				"start"
			]),
			tickSize: import_prop_types.default.number,
			tickSpacing: import_prop_types.default.number,
			valueFormatter: import_prop_types.default.func
		})
	]).isRequired),
	yAxis: import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
		import_prop_types.default.shape({
			axis: import_prop_types.default.oneOf(["y"]),
			barGapRatio: import_prop_types.default.number,
			categoryGapRatio: import_prop_types.default.number,
			classes: import_prop_types.default.object,
			colorMap: import_prop_types.default.oneOfType([
				import_prop_types.default.shape({
					colors: import_prop_types.default.arrayOf(import_prop_types.default.string).isRequired,
					type: import_prop_types.default.oneOf(["ordinal"]).isRequired,
					unknownColor: import_prop_types.default.string,
					values: import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
						import_prop_types.default.instanceOf(Date),
						import_prop_types.default.number,
						import_prop_types.default.string
					]).isRequired)
				}),
				import_prop_types.default.shape({
					color: import_prop_types.default.oneOfType([import_prop_types.default.arrayOf(import_prop_types.default.string.isRequired), import_prop_types.default.func]).isRequired,
					max: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
					min: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
					type: import_prop_types.default.oneOf(["continuous"]).isRequired
				}),
				import_prop_types.default.shape({
					colors: import_prop_types.default.arrayOf(import_prop_types.default.string).isRequired,
					thresholds: import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]).isRequired).isRequired,
					type: import_prop_types.default.oneOf(["piecewise"]).isRequired
				})
			]),
			data: import_prop_types.default.array,
			dataKey: import_prop_types.default.string,
			disableLine: import_prop_types.default.bool,
			disableTicks: import_prop_types.default.bool,
			domainLimit: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["nice", "strict"]), import_prop_types.default.func]),
			groups: import_prop_types.default.arrayOf(import_prop_types.default.shape({
				getValue: import_prop_types.default.func.isRequired,
				tickLabelStyle: import_prop_types.default.object,
				tickSize: import_prop_types.default.number
			})),
			hideTooltip: import_prop_types.default.bool,
			id: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]),
			ignoreTooltip: import_prop_types.default.bool,
			label: import_prop_types.default.string,
			labelStyle: import_prop_types.default.object,
			offset: import_prop_types.default.number,
			ordinalTimeTicks: import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.oneOf([
				"biweekly",
				"days",
				"hours",
				"months",
				"quarterly",
				"weeks",
				"years"
			]), import_prop_types.default.shape({
				format: import_prop_types.default.func.isRequired,
				getTickNumber: import_prop_types.default.func.isRequired,
				isTick: import_prop_types.default.func.isRequired
			})]).isRequired),
			position: import_prop_types.default.oneOf([
				"left",
				"none",
				"right"
			]),
			reverse: import_prop_types.default.bool,
			scaleType: import_prop_types.default.oneOf(["band"]),
			slotProps: import_prop_types.default.object,
			slots: import_prop_types.default.object,
			sx: import_prop_types.default.oneOfType([
				import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
					import_prop_types.default.func,
					import_prop_types.default.object,
					import_prop_types.default.bool
				])),
				import_prop_types.default.func,
				import_prop_types.default.object
			]),
			tickInterval: import_prop_types.default.oneOfType([
				import_prop_types.default.oneOf(["auto"]),
				import_prop_types.default.array,
				import_prop_types.default.func
			]),
			tickLabelInterval: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["auto"]), import_prop_types.default.func]),
			tickLabelPlacement: import_prop_types.default.oneOf(["middle", "tick"]),
			tickLabelStyle: import_prop_types.default.object,
			tickMaxStep: import_prop_types.default.number,
			tickMinStep: import_prop_types.default.number,
			tickNumber: import_prop_types.default.number,
			tickPlacement: import_prop_types.default.oneOf([
				"end",
				"extremities",
				"middle",
				"start"
			]),
			tickSize: import_prop_types.default.number,
			tickSpacing: import_prop_types.default.number,
			valueFormatter: import_prop_types.default.func,
			width: import_prop_types.default.number
		}),
		import_prop_types.default.shape({
			axis: import_prop_types.default.oneOf(["y"]),
			classes: import_prop_types.default.object,
			colorMap: import_prop_types.default.oneOfType([
				import_prop_types.default.shape({
					colors: import_prop_types.default.arrayOf(import_prop_types.default.string).isRequired,
					type: import_prop_types.default.oneOf(["ordinal"]).isRequired,
					unknownColor: import_prop_types.default.string,
					values: import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
						import_prop_types.default.instanceOf(Date),
						import_prop_types.default.number,
						import_prop_types.default.string
					]).isRequired)
				}),
				import_prop_types.default.shape({
					color: import_prop_types.default.oneOfType([import_prop_types.default.arrayOf(import_prop_types.default.string.isRequired), import_prop_types.default.func]).isRequired,
					max: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
					min: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
					type: import_prop_types.default.oneOf(["continuous"]).isRequired
				}),
				import_prop_types.default.shape({
					colors: import_prop_types.default.arrayOf(import_prop_types.default.string).isRequired,
					thresholds: import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]).isRequired).isRequired,
					type: import_prop_types.default.oneOf(["piecewise"]).isRequired
				})
			]),
			data: import_prop_types.default.array,
			dataKey: import_prop_types.default.string,
			disableLine: import_prop_types.default.bool,
			disableTicks: import_prop_types.default.bool,
			domainLimit: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["nice", "strict"]), import_prop_types.default.func]),
			groups: import_prop_types.default.arrayOf(import_prop_types.default.shape({
				getValue: import_prop_types.default.func.isRequired,
				tickLabelStyle: import_prop_types.default.object,
				tickSize: import_prop_types.default.number
			})),
			hideTooltip: import_prop_types.default.bool,
			id: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]),
			ignoreTooltip: import_prop_types.default.bool,
			label: import_prop_types.default.string,
			labelStyle: import_prop_types.default.object,
			offset: import_prop_types.default.number,
			ordinalTimeTicks: import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.oneOf([
				"biweekly",
				"days",
				"hours",
				"months",
				"quarterly",
				"weeks",
				"years"
			]), import_prop_types.default.shape({
				format: import_prop_types.default.func.isRequired,
				getTickNumber: import_prop_types.default.func.isRequired,
				isTick: import_prop_types.default.func.isRequired
			})]).isRequired),
			position: import_prop_types.default.oneOf([
				"left",
				"none",
				"right"
			]),
			reverse: import_prop_types.default.bool,
			scaleType: import_prop_types.default.oneOf(["point"]),
			slotProps: import_prop_types.default.object,
			slots: import_prop_types.default.object,
			sx: import_prop_types.default.oneOfType([
				import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
					import_prop_types.default.func,
					import_prop_types.default.object,
					import_prop_types.default.bool
				])),
				import_prop_types.default.func,
				import_prop_types.default.object
			]),
			tickInterval: import_prop_types.default.oneOfType([
				import_prop_types.default.oneOf(["auto"]),
				import_prop_types.default.array,
				import_prop_types.default.func
			]),
			tickLabelInterval: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["auto"]), import_prop_types.default.func]),
			tickLabelPlacement: import_prop_types.default.oneOf(["middle", "tick"]),
			tickLabelStyle: import_prop_types.default.object,
			tickMaxStep: import_prop_types.default.number,
			tickMinStep: import_prop_types.default.number,
			tickNumber: import_prop_types.default.number,
			tickPlacement: import_prop_types.default.oneOf([
				"end",
				"extremities",
				"middle",
				"start"
			]),
			tickSize: import_prop_types.default.number,
			tickSpacing: import_prop_types.default.number,
			valueFormatter: import_prop_types.default.func,
			width: import_prop_types.default.number
		}),
		import_prop_types.default.shape({
			axis: import_prop_types.default.oneOf(["y"]),
			classes: import_prop_types.default.object,
			colorMap: import_prop_types.default.oneOfType([import_prop_types.default.shape({
				color: import_prop_types.default.oneOfType([import_prop_types.default.arrayOf(import_prop_types.default.string.isRequired), import_prop_types.default.func]).isRequired,
				max: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
				min: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
				type: import_prop_types.default.oneOf(["continuous"]).isRequired
			}), import_prop_types.default.shape({
				colors: import_prop_types.default.arrayOf(import_prop_types.default.string).isRequired,
				thresholds: import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]).isRequired).isRequired,
				type: import_prop_types.default.oneOf(["piecewise"]).isRequired
			})]),
			data: import_prop_types.default.array,
			dataKey: import_prop_types.default.string,
			disableLine: import_prop_types.default.bool,
			disableTicks: import_prop_types.default.bool,
			domainLimit: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["nice", "strict"]), import_prop_types.default.func]),
			hideTooltip: import_prop_types.default.bool,
			id: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]),
			ignoreTooltip: import_prop_types.default.bool,
			label: import_prop_types.default.string,
			labelStyle: import_prop_types.default.object,
			max: import_prop_types.default.number,
			min: import_prop_types.default.number,
			offset: import_prop_types.default.number,
			position: import_prop_types.default.oneOf([
				"left",
				"none",
				"right"
			]),
			reverse: import_prop_types.default.bool,
			scaleType: import_prop_types.default.oneOf(["log"]),
			slotProps: import_prop_types.default.object,
			slots: import_prop_types.default.object,
			sx: import_prop_types.default.oneOfType([
				import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
					import_prop_types.default.func,
					import_prop_types.default.object,
					import_prop_types.default.bool
				])),
				import_prop_types.default.func,
				import_prop_types.default.object
			]),
			tickInterval: import_prop_types.default.oneOfType([
				import_prop_types.default.oneOf(["auto"]),
				import_prop_types.default.array,
				import_prop_types.default.func
			]),
			tickLabelInterval: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["auto"]), import_prop_types.default.func]),
			tickLabelPlacement: import_prop_types.default.oneOf(["middle", "tick"]),
			tickLabelStyle: import_prop_types.default.object,
			tickMaxStep: import_prop_types.default.number,
			tickMinStep: import_prop_types.default.number,
			tickNumber: import_prop_types.default.number,
			tickPlacement: import_prop_types.default.oneOf([
				"end",
				"extremities",
				"middle",
				"start"
			]),
			tickSize: import_prop_types.default.number,
			tickSpacing: import_prop_types.default.number,
			valueFormatter: import_prop_types.default.func,
			width: import_prop_types.default.number
		}),
		import_prop_types.default.shape({
			axis: import_prop_types.default.oneOf(["y"]),
			classes: import_prop_types.default.object,
			colorMap: import_prop_types.default.oneOfType([import_prop_types.default.shape({
				color: import_prop_types.default.oneOfType([import_prop_types.default.arrayOf(import_prop_types.default.string.isRequired), import_prop_types.default.func]).isRequired,
				max: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
				min: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
				type: import_prop_types.default.oneOf(["continuous"]).isRequired
			}), import_prop_types.default.shape({
				colors: import_prop_types.default.arrayOf(import_prop_types.default.string).isRequired,
				thresholds: import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]).isRequired).isRequired,
				type: import_prop_types.default.oneOf(["piecewise"]).isRequired
			})]),
			constant: import_prop_types.default.number,
			data: import_prop_types.default.array,
			dataKey: import_prop_types.default.string,
			disableLine: import_prop_types.default.bool,
			disableTicks: import_prop_types.default.bool,
			domainLimit: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["nice", "strict"]), import_prop_types.default.func]),
			hideTooltip: import_prop_types.default.bool,
			id: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]),
			ignoreTooltip: import_prop_types.default.bool,
			label: import_prop_types.default.string,
			labelStyle: import_prop_types.default.object,
			max: import_prop_types.default.number,
			min: import_prop_types.default.number,
			offset: import_prop_types.default.number,
			position: import_prop_types.default.oneOf([
				"left",
				"none",
				"right"
			]),
			reverse: import_prop_types.default.bool,
			scaleType: import_prop_types.default.oneOf(["symlog"]),
			slotProps: import_prop_types.default.object,
			slots: import_prop_types.default.object,
			sx: import_prop_types.default.oneOfType([
				import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
					import_prop_types.default.func,
					import_prop_types.default.object,
					import_prop_types.default.bool
				])),
				import_prop_types.default.func,
				import_prop_types.default.object
			]),
			tickInterval: import_prop_types.default.oneOfType([
				import_prop_types.default.oneOf(["auto"]),
				import_prop_types.default.array,
				import_prop_types.default.func
			]),
			tickLabelInterval: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["auto"]), import_prop_types.default.func]),
			tickLabelPlacement: import_prop_types.default.oneOf(["middle", "tick"]),
			tickLabelStyle: import_prop_types.default.object,
			tickMaxStep: import_prop_types.default.number,
			tickMinStep: import_prop_types.default.number,
			tickNumber: import_prop_types.default.number,
			tickPlacement: import_prop_types.default.oneOf([
				"end",
				"extremities",
				"middle",
				"start"
			]),
			tickSize: import_prop_types.default.number,
			tickSpacing: import_prop_types.default.number,
			valueFormatter: import_prop_types.default.func,
			width: import_prop_types.default.number
		}),
		import_prop_types.default.shape({
			axis: import_prop_types.default.oneOf(["y"]),
			classes: import_prop_types.default.object,
			colorMap: import_prop_types.default.oneOfType([import_prop_types.default.shape({
				color: import_prop_types.default.oneOfType([import_prop_types.default.arrayOf(import_prop_types.default.string.isRequired), import_prop_types.default.func]).isRequired,
				max: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
				min: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
				type: import_prop_types.default.oneOf(["continuous"]).isRequired
			}), import_prop_types.default.shape({
				colors: import_prop_types.default.arrayOf(import_prop_types.default.string).isRequired,
				thresholds: import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]).isRequired).isRequired,
				type: import_prop_types.default.oneOf(["piecewise"]).isRequired
			})]),
			data: import_prop_types.default.array,
			dataKey: import_prop_types.default.string,
			disableLine: import_prop_types.default.bool,
			disableTicks: import_prop_types.default.bool,
			domainLimit: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["nice", "strict"]), import_prop_types.default.func]),
			hideTooltip: import_prop_types.default.bool,
			id: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]),
			ignoreTooltip: import_prop_types.default.bool,
			label: import_prop_types.default.string,
			labelStyle: import_prop_types.default.object,
			max: import_prop_types.default.number,
			min: import_prop_types.default.number,
			offset: import_prop_types.default.number,
			position: import_prop_types.default.oneOf([
				"left",
				"none",
				"right"
			]),
			reverse: import_prop_types.default.bool,
			scaleType: import_prop_types.default.oneOf(["pow"]),
			slotProps: import_prop_types.default.object,
			slots: import_prop_types.default.object,
			sx: import_prop_types.default.oneOfType([
				import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
					import_prop_types.default.func,
					import_prop_types.default.object,
					import_prop_types.default.bool
				])),
				import_prop_types.default.func,
				import_prop_types.default.object
			]),
			tickInterval: import_prop_types.default.oneOfType([
				import_prop_types.default.oneOf(["auto"]),
				import_prop_types.default.array,
				import_prop_types.default.func
			]),
			tickLabelInterval: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["auto"]), import_prop_types.default.func]),
			tickLabelPlacement: import_prop_types.default.oneOf(["middle", "tick"]),
			tickLabelStyle: import_prop_types.default.object,
			tickMaxStep: import_prop_types.default.number,
			tickMinStep: import_prop_types.default.number,
			tickNumber: import_prop_types.default.number,
			tickPlacement: import_prop_types.default.oneOf([
				"end",
				"extremities",
				"middle",
				"start"
			]),
			tickSize: import_prop_types.default.number,
			tickSpacing: import_prop_types.default.number,
			valueFormatter: import_prop_types.default.func,
			width: import_prop_types.default.number
		}),
		import_prop_types.default.shape({
			axis: import_prop_types.default.oneOf(["y"]),
			classes: import_prop_types.default.object,
			colorMap: import_prop_types.default.oneOfType([import_prop_types.default.shape({
				color: import_prop_types.default.oneOfType([import_prop_types.default.arrayOf(import_prop_types.default.string.isRequired), import_prop_types.default.func]).isRequired,
				max: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
				min: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
				type: import_prop_types.default.oneOf(["continuous"]).isRequired
			}), import_prop_types.default.shape({
				colors: import_prop_types.default.arrayOf(import_prop_types.default.string).isRequired,
				thresholds: import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]).isRequired).isRequired,
				type: import_prop_types.default.oneOf(["piecewise"]).isRequired
			})]),
			data: import_prop_types.default.array,
			dataKey: import_prop_types.default.string,
			disableLine: import_prop_types.default.bool,
			disableTicks: import_prop_types.default.bool,
			domainLimit: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["nice", "strict"]), import_prop_types.default.func]),
			hideTooltip: import_prop_types.default.bool,
			id: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]),
			ignoreTooltip: import_prop_types.default.bool,
			label: import_prop_types.default.string,
			labelStyle: import_prop_types.default.object,
			max: import_prop_types.default.number,
			min: import_prop_types.default.number,
			offset: import_prop_types.default.number,
			position: import_prop_types.default.oneOf([
				"left",
				"none",
				"right"
			]),
			reverse: import_prop_types.default.bool,
			scaleType: import_prop_types.default.oneOf(["sqrt"]),
			slotProps: import_prop_types.default.object,
			slots: import_prop_types.default.object,
			sx: import_prop_types.default.oneOfType([
				import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
					import_prop_types.default.func,
					import_prop_types.default.object,
					import_prop_types.default.bool
				])),
				import_prop_types.default.func,
				import_prop_types.default.object
			]),
			tickInterval: import_prop_types.default.oneOfType([
				import_prop_types.default.oneOf(["auto"]),
				import_prop_types.default.array,
				import_prop_types.default.func
			]),
			tickLabelInterval: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["auto"]), import_prop_types.default.func]),
			tickLabelPlacement: import_prop_types.default.oneOf(["middle", "tick"]),
			tickLabelStyle: import_prop_types.default.object,
			tickMaxStep: import_prop_types.default.number,
			tickMinStep: import_prop_types.default.number,
			tickNumber: import_prop_types.default.number,
			tickPlacement: import_prop_types.default.oneOf([
				"end",
				"extremities",
				"middle",
				"start"
			]),
			tickSize: import_prop_types.default.number,
			tickSpacing: import_prop_types.default.number,
			valueFormatter: import_prop_types.default.func,
			width: import_prop_types.default.number
		}),
		import_prop_types.default.shape({
			axis: import_prop_types.default.oneOf(["y"]),
			classes: import_prop_types.default.object,
			colorMap: import_prop_types.default.oneOfType([import_prop_types.default.shape({
				color: import_prop_types.default.oneOfType([import_prop_types.default.arrayOf(import_prop_types.default.string.isRequired), import_prop_types.default.func]).isRequired,
				max: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
				min: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
				type: import_prop_types.default.oneOf(["continuous"]).isRequired
			}), import_prop_types.default.shape({
				colors: import_prop_types.default.arrayOf(import_prop_types.default.string).isRequired,
				thresholds: import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]).isRequired).isRequired,
				type: import_prop_types.default.oneOf(["piecewise"]).isRequired
			})]),
			data: import_prop_types.default.array,
			dataKey: import_prop_types.default.string,
			disableLine: import_prop_types.default.bool,
			disableTicks: import_prop_types.default.bool,
			domainLimit: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["nice", "strict"]), import_prop_types.default.func]),
			hideTooltip: import_prop_types.default.bool,
			id: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]),
			ignoreTooltip: import_prop_types.default.bool,
			label: import_prop_types.default.string,
			labelStyle: import_prop_types.default.object,
			max: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.shape({ valueOf: import_prop_types.default.func.isRequired })]),
			min: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.shape({ valueOf: import_prop_types.default.func.isRequired })]),
			offset: import_prop_types.default.number,
			position: import_prop_types.default.oneOf([
				"left",
				"none",
				"right"
			]),
			reverse: import_prop_types.default.bool,
			scaleType: import_prop_types.default.oneOf(["time"]),
			slotProps: import_prop_types.default.object,
			slots: import_prop_types.default.object,
			sx: import_prop_types.default.oneOfType([
				import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
					import_prop_types.default.func,
					import_prop_types.default.object,
					import_prop_types.default.bool
				])),
				import_prop_types.default.func,
				import_prop_types.default.object
			]),
			tickInterval: import_prop_types.default.oneOfType([
				import_prop_types.default.oneOf(["auto"]),
				import_prop_types.default.array,
				import_prop_types.default.func
			]),
			tickLabelInterval: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["auto"]), import_prop_types.default.func]),
			tickLabelPlacement: import_prop_types.default.oneOf(["middle", "tick"]),
			tickLabelStyle: import_prop_types.default.object,
			tickMaxStep: import_prop_types.default.number,
			tickMinStep: import_prop_types.default.number,
			tickNumber: import_prop_types.default.number,
			tickPlacement: import_prop_types.default.oneOf([
				"end",
				"extremities",
				"middle",
				"start"
			]),
			tickSize: import_prop_types.default.number,
			tickSpacing: import_prop_types.default.number,
			valueFormatter: import_prop_types.default.func,
			width: import_prop_types.default.number
		}),
		import_prop_types.default.shape({
			axis: import_prop_types.default.oneOf(["y"]),
			classes: import_prop_types.default.object,
			colorMap: import_prop_types.default.oneOfType([import_prop_types.default.shape({
				color: import_prop_types.default.oneOfType([import_prop_types.default.arrayOf(import_prop_types.default.string.isRequired), import_prop_types.default.func]).isRequired,
				max: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
				min: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
				type: import_prop_types.default.oneOf(["continuous"]).isRequired
			}), import_prop_types.default.shape({
				colors: import_prop_types.default.arrayOf(import_prop_types.default.string).isRequired,
				thresholds: import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]).isRequired).isRequired,
				type: import_prop_types.default.oneOf(["piecewise"]).isRequired
			})]),
			data: import_prop_types.default.array,
			dataKey: import_prop_types.default.string,
			disableLine: import_prop_types.default.bool,
			disableTicks: import_prop_types.default.bool,
			domainLimit: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["nice", "strict"]), import_prop_types.default.func]),
			hideTooltip: import_prop_types.default.bool,
			id: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]),
			ignoreTooltip: import_prop_types.default.bool,
			label: import_prop_types.default.string,
			labelStyle: import_prop_types.default.object,
			max: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.shape({ valueOf: import_prop_types.default.func.isRequired })]),
			min: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.shape({ valueOf: import_prop_types.default.func.isRequired })]),
			offset: import_prop_types.default.number,
			position: import_prop_types.default.oneOf([
				"left",
				"none",
				"right"
			]),
			reverse: import_prop_types.default.bool,
			scaleType: import_prop_types.default.oneOf(["utc"]),
			slotProps: import_prop_types.default.object,
			slots: import_prop_types.default.object,
			sx: import_prop_types.default.oneOfType([
				import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
					import_prop_types.default.func,
					import_prop_types.default.object,
					import_prop_types.default.bool
				])),
				import_prop_types.default.func,
				import_prop_types.default.object
			]),
			tickInterval: import_prop_types.default.oneOfType([
				import_prop_types.default.oneOf(["auto"]),
				import_prop_types.default.array,
				import_prop_types.default.func
			]),
			tickLabelInterval: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["auto"]), import_prop_types.default.func]),
			tickLabelPlacement: import_prop_types.default.oneOf(["middle", "tick"]),
			tickLabelStyle: import_prop_types.default.object,
			tickMaxStep: import_prop_types.default.number,
			tickMinStep: import_prop_types.default.number,
			tickNumber: import_prop_types.default.number,
			tickPlacement: import_prop_types.default.oneOf([
				"end",
				"extremities",
				"middle",
				"start"
			]),
			tickSize: import_prop_types.default.number,
			tickSpacing: import_prop_types.default.number,
			valueFormatter: import_prop_types.default.func,
			width: import_prop_types.default.number
		}),
		import_prop_types.default.shape({
			axis: import_prop_types.default.oneOf(["y"]),
			classes: import_prop_types.default.object,
			colorMap: import_prop_types.default.oneOfType([import_prop_types.default.shape({
				color: import_prop_types.default.oneOfType([import_prop_types.default.arrayOf(import_prop_types.default.string.isRequired), import_prop_types.default.func]).isRequired,
				max: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
				min: import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]),
				type: import_prop_types.default.oneOf(["continuous"]).isRequired
			}), import_prop_types.default.shape({
				colors: import_prop_types.default.arrayOf(import_prop_types.default.string).isRequired,
				thresholds: import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.number]).isRequired).isRequired,
				type: import_prop_types.default.oneOf(["piecewise"]).isRequired
			})]),
			data: import_prop_types.default.array,
			dataKey: import_prop_types.default.string,
			disableLine: import_prop_types.default.bool,
			disableTicks: import_prop_types.default.bool,
			domainLimit: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["nice", "strict"]), import_prop_types.default.func]),
			hideTooltip: import_prop_types.default.bool,
			id: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]),
			ignoreTooltip: import_prop_types.default.bool,
			label: import_prop_types.default.string,
			labelStyle: import_prop_types.default.object,
			max: import_prop_types.default.number,
			min: import_prop_types.default.number,
			offset: import_prop_types.default.number,
			position: import_prop_types.default.oneOf([
				"left",
				"none",
				"right"
			]),
			reverse: import_prop_types.default.bool,
			scaleType: import_prop_types.default.oneOf(["linear"]),
			slotProps: import_prop_types.default.object,
			slots: import_prop_types.default.object,
			sx: import_prop_types.default.oneOfType([
				import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
					import_prop_types.default.func,
					import_prop_types.default.object,
					import_prop_types.default.bool
				])),
				import_prop_types.default.func,
				import_prop_types.default.object
			]),
			tickInterval: import_prop_types.default.oneOfType([
				import_prop_types.default.oneOf(["auto"]),
				import_prop_types.default.array,
				import_prop_types.default.func
			]),
			tickLabelInterval: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["auto"]), import_prop_types.default.func]),
			tickLabelPlacement: import_prop_types.default.oneOf(["middle", "tick"]),
			tickLabelStyle: import_prop_types.default.object,
			tickMaxStep: import_prop_types.default.number,
			tickMinStep: import_prop_types.default.number,
			tickNumber: import_prop_types.default.number,
			tickPlacement: import_prop_types.default.oneOf([
				"end",
				"extremities",
				"middle",
				"start"
			]),
			tickSize: import_prop_types.default.number,
			tickSpacing: import_prop_types.default.number,
			valueFormatter: import_prop_types.default.func,
			width: import_prop_types.default.number
		})
	]).isRequired)
};
//#endregion
export { BAR_CHART_PLUGINS, BarChart, BarElement, BarLabel, BarPlot, FocusedBar, barClasses, barElementClasses, barLabelClasses, getBarElementUtilityClass, getBarLabelUtilityClass, useUtilityClasses };

//# sourceMappingURL=@mui_x-charts_BarChart.js.map