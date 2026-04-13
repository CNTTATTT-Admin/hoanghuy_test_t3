import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { Q as require_jsx_runtime, T as useRtl, U as generateUtilityClass, ft as require_prop_types, i as useTheme, it as _extends, t as styled, z as useEnhancedEffect } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { d as useThemeProps } from "./styles-2xPq3NO2.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
import { $ as deg2rad, D as clampAngle, E as useYAxes, Nt as createSelector, O as useStore, Pt as createSelectorMemoized, T as useXAxes, _t as selectorChartYAxis, at as selectorChartsKeyboardXAxisIndex, bt as isOrdinalScale, dt as selectorChartsInteractionYAxisIndex, ft as selectorChartsInteractionYAxisValue, gt as selectorChartXAxis, k as useChartContext, lt as selectorChartsInteractionXAxisIndex, ot as selectorChartsKeyboardYAxisIndex, pt as selectorChartsLastInteraction, rt as selectorBrushShouldPreventAxisHighlight, ut as selectorChartsInteractionXAxisValue, vt as selectorChartZoomIsInteracting, w as useDrawingArea, wt as warnOnce, xt as isDateData } from "./ChartsWrapper-D-1cORDO.js";
import { r as _objectWithoutPropertiesLoose } from "./TransitionGroupContext-CmouUOv0.js";
import { t as useSlotProps } from "./useSlotProps-CORw1pTM.js";
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartCartesianAxis/useChartCartesianHighlight.selectors.js
/**
* The return type of the `selectAxisHighlightWithValue`.
*/
function getAxisHighlight(lastInteractionUpdate, pointerHighlight, keyboardHighlight) {
	if (lastInteractionUpdate === "pointer") {
		if (pointerHighlight) return [pointerHighlight];
		if (keyboardHighlight) return [keyboardHighlight];
	}
	if (lastInteractionUpdate === "keyboard") {
		if (keyboardHighlight) return [keyboardHighlight];
		if (pointerHighlight) return [pointerHighlight];
	}
	return [];
}
var selectorChartControlledCartesianAxisHighlight = (state) => state.controlledCartesianAxisHighlight;
var selectAxisHighlight = (computedIndex, axis, controlledAxisItems, keyboardAxisItem, lastInteractionUpdate, isBrushSelectionActive) => {
	if (isBrushSelectionActive) return [];
	if (controlledAxisItems !== void 0) return controlledAxisItems.filter((item) => axis.axis[item.axisId] !== void 0).map((item) => item);
	return getAxisHighlight(lastInteractionUpdate, computedIndex !== null && {
		axisId: axis.axisIds[0],
		dataIndex: computedIndex
	}, keyboardAxisItem != null && keyboardAxisItem);
};
var selectorChartsHighlightXAxisIndex = createSelectorMemoized(selectorChartsInteractionXAxisIndex, selectorChartXAxis, selectorChartControlledCartesianAxisHighlight, selectorChartsKeyboardXAxisIndex, selectorChartsLastInteraction, selectorBrushShouldPreventAxisHighlight, selectAxisHighlight);
createSelectorMemoized(selectorChartsInteractionYAxisIndex, selectorChartYAxis, selectorChartControlledCartesianAxisHighlight, selectorChartsKeyboardYAxisIndex, selectorChartsLastInteraction, selectorBrushShouldPreventAxisHighlight, selectAxisHighlight);
var selectAxisHighlightWithValue = (computedIndex, computedValue, axis, controlledAxisItems, keyboardAxisItem, lastInteractionUpdate, isBrushSelectionActive) => {
	if (isBrushSelectionActive) return [];
	if (controlledAxisItems !== void 0) return controlledAxisItems.map((item) => _extends({}, item, { value: axis.axis[item.axisId]?.data?.[item.dataIndex] })).filter(({ value }) => value !== void 0);
	const pointerHighlight = computedValue != null && {
		axisId: axis.axisIds[0],
		value: computedValue
	};
	if (pointerHighlight && computedIndex != null) pointerHighlight.dataIndex = computedIndex;
	const keyboardValue = keyboardAxisItem != null && axis.axis[keyboardAxisItem.axisId]?.data?.[keyboardAxisItem.dataIndex];
	return getAxisHighlight(lastInteractionUpdate, pointerHighlight, keyboardAxisItem != null && keyboardValue != null && _extends({}, keyboardAxisItem, { value: keyboardValue }));
};
var selectorChartsHighlightXAxisValue = createSelectorMemoized(selectorChartsInteractionXAxisIndex, selectorChartsInteractionXAxisValue, selectorChartXAxis, selectorChartControlledCartesianAxisHighlight, selectorChartsKeyboardXAxisIndex, selectorChartsLastInteraction, selectorBrushShouldPreventAxisHighlight, selectAxisHighlightWithValue);
var selectorChartsHighlightYAxisValue = createSelectorMemoized(selectorChartsInteractionYAxisIndex, selectorChartsInteractionYAxisValue, selectorChartYAxis, selectorChartControlledCartesianAxisHighlight, selectorChartsKeyboardYAxisIndex, selectorChartsLastInteraction, selectorBrushShouldPreventAxisHighlight, selectAxisHighlightWithValue);
/**
* Get the scale of the axis with highlight if controlled. The default axis otherwise.
* @param controlledItem The controlled value of highlightedAxis
* @param axis The axis state after all the processing
* @returns axis state
*/
var selectAxis = (axisItems, axis) => {
	if (axisItems === void 0) return [axis.axis[axis.axisIds[0]]];
	return axisItems.map((item) => axis.axis[item.axisId] ?? null).filter((item) => item !== null);
};
createSelector(selectorChartControlledCartesianAxisHighlight, selectorChartXAxis, selectAxis);
createSelector(selectorChartControlledCartesianAxisHighlight, selectorChartYAxis, selectAxis);
//#endregion
//#region node_modules/@mui/x-charts/esm/hooks/useScale.js
/**
* For a given scale return a function that map value to their position.
* Useful when dealing with specific scale such as band.
* @param {D3Scale} scale The scale to use
* @returns {(value: any) => number} A function that map value to their position
*/
function getValueToPositionMapper(scale) {
	if (isOrdinalScale(scale)) return (value) => (scale(value) ?? 0) + scale.bandwidth() / 2;
	const domain = scale.domain();
	if (domain[0] === domain[1]) return (value) => value === domain[0] ? scale(value) : NaN;
	return (value) => scale(value);
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartCartesianAxis/useInternalIsZoomInteracting.js
/**
* Check if the zoom is interacting.
*
* This should probably be moved/merged to the AnimationContext when we move it to the new API.
*
* @ignore Internal hook, similar to the PRO one.
*
* @returns {boolean} Inform the zoom is interacting.
*/
function useInternalIsZoomInteracting() {
	return useStore().use(selectorChartZoomIsInteracting);
}
//#endregion
//#region node_modules/@mui/x-charts/esm/hooks/useIsHydrated.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/** Returns true after hydration is done on the client.
*
* Basically a implementation of Option 2 of this gist: https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85#option-2-lazily-show-component-with-uselayouteffect. */
function useIsHydrated() {
	const [isHydrated, setIsHydrated] = import_react.useState(false);
	import_react.useEffect(() => {
		setIsHydrated(true);
	}, []);
	return isHydrated;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/isInfinity.js
function isInfinity(v) {
	return typeof v === "number" && !Number.isFinite(v);
}
//#endregion
//#region node_modules/@mui/x-charts/esm/utils/timeTicks.js
function yearNumber(from, to) {
	return Math.abs(to.getFullYear() - from.getFullYear());
}
function monthNumber(from, to) {
	return Math.abs(to.getFullYear() * 12 + to.getMonth() - 12 * from.getFullYear() - from.getMonth());
}
function dayNumber(from, to) {
	return Math.abs(to.getTime() - from.getTime()) / (1e3 * 60 * 60 * 24);
}
function hourNumber(from, to) {
	return Math.abs(to.getTime() - from.getTime()) / (1e3 * 60 * 60);
}
var tickFrequencies = {
	years: {
		getTickNumber: yearNumber,
		isTick: (prev, value) => value.getFullYear() !== prev.getFullYear(),
		format: (d) => d.getFullYear().toString()
	},
	quarterly: {
		getTickNumber: (from, to) => Math.floor(monthNumber(from, to) / 3),
		isTick: (prev, value) => value.getMonth() !== prev.getMonth() && value.getMonth() % 3 === 0,
		format: new Intl.DateTimeFormat("default", { month: "short" }).format
	},
	months: {
		getTickNumber: monthNumber,
		isTick: (prev, value) => value.getMonth() !== prev.getMonth(),
		format: new Intl.DateTimeFormat("default", { month: "short" }).format
	},
	biweekly: {
		getTickNumber: (from, to) => dayNumber(from, to) / 14,
		isTick: (prev, value) => (value.getDay() < prev.getDay() || dayNumber(value, prev) > 7) && Math.floor(value.getDate() / 7) % 2 === 1,
		format: new Intl.DateTimeFormat("default", { day: "numeric" }).format
	},
	weeks: {
		getTickNumber: (from, to) => dayNumber(from, to) / 7,
		isTick: (prev, value) => value.getDay() < prev.getDay() || dayNumber(value, prev) >= 7,
		format: new Intl.DateTimeFormat("default", { day: "numeric" }).format
	},
	days: {
		getTickNumber: dayNumber,
		isTick: (prev, value) => value.getDate() !== prev.getDate(),
		format: new Intl.DateTimeFormat("default", { day: "numeric" }).format
	},
	hours: {
		getTickNumber: hourNumber,
		isTick: (prev, value) => value.getHours() !== prev.getHours(),
		format: new Intl.DateTimeFormat("default", {
			hour: "2-digit",
			minute: "2-digit"
		}).format
	}
};
//#endregion
//#region node_modules/@mui/x-charts/esm/hooks/useTicks.js
var offsetRatio$1 = {
	start: 0,
	extremities: 0,
	end: 1,
	middle: .5
};
function getTickPosition(scale, value, placement) {
	return scale(value) - (scale.step() - scale.bandwidth()) / 2 + offsetRatio$1[placement] * scale.step();
}
/**
* Returns a new domain where each tick is at least {@link tickSpacing}px from the next one.
* Assumes tick spacing is greater than 0.
* @param domain Domain of the scale.
* @param range Range of the scale.
* @param tickSpacing Spacing in pixels.
*/
function applyTickSpacing(domain, range, tickSpacing) {
	const rangeSpan = Math.abs(range[1] - range[0]);
	const every = Math.ceil(domain.length / (rangeSpan / tickSpacing));
	if (Number.isNaN(every) || every <= 1) return domain;
	return domain.filter((_, index) => index % every === 0);
}
function getTimeTicks(domain, tickNumber, ticksFrequencies, scale, isInside) {
	if (ticksFrequencies.length === 0) return [];
	const isReversed = scale.range()[0] > scale.range()[1];
	const startIndex = domain.findIndex((value) => {
		return isInside(getTickPosition(scale, value, isReversed ? "start" : "end"));
	});
	const endIndex = domain.findLastIndex((value) => isInside(getTickPosition(scale, value, isReversed ? "end" : "start")));
	const start = domain[0];
	const end = domain[domain.length - 1];
	if (!(start instanceof Date) || !(end instanceof Date)) return [];
	let startFrequencyIndex = 0;
	for (let i = 0; i < ticksFrequencies.length; i += 1) if (ticksFrequencies[i].getTickNumber(start, end) !== 0) {
		startFrequencyIndex = i;
		break;
	}
	let endFrequencyIndex = startFrequencyIndex;
	for (let i = startFrequencyIndex; i < ticksFrequencies.length; i += 1) {
		if (i === ticksFrequencies.length - 1) {
			endFrequencyIndex = i;
			break;
		}
		const prevTickCount = ticksFrequencies[i].getTickNumber(start, end);
		const nextTickCount = ticksFrequencies[i + 1].getTickNumber(start, end);
		if (nextTickCount > tickNumber || tickNumber / prevTickCount < nextTickCount / tickNumber) {
			endFrequencyIndex = i;
			break;
		}
	}
	const ticks = [];
	for (let tickIndex = Math.max(1, startIndex); tickIndex <= endIndex; tickIndex += 1) for (let i = startFrequencyIndex; i <= endFrequencyIndex; i += 1) {
		const prevDate = domain[tickIndex - 1];
		const currentDate = domain[tickIndex];
		if (prevDate instanceof Date && currentDate instanceof Date && ticksFrequencies[i].isTick(prevDate, currentDate)) {
			ticks.push({
				index: tickIndex,
				formatter: ticksFrequencies[i].format
			});
			break;
		}
	}
	return ticks;
}
function getTicks(options) {
	const { scale, tickNumber, valueFormatter, tickInterval, tickPlacement: tickPlacementProp, tickLabelPlacement: tickLabelPlacementProp, tickSpacing, isInside, ordinalTimeTicks } = options;
	if (ordinalTimeTicks !== void 0 && isDateData(scale.domain()) && isOrdinalScale(scale)) {
		const domain = scale.domain();
		if (domain.length === 0 || domain.length === 1) return [];
		const tickPlacement = "middle";
		return getTimeTicks(domain, tickNumber, ordinalTimeTicks.map((tickDef) => typeof tickDef === "string" ? tickFrequencies[tickDef] : tickDef), scale, isInside).map(({ index, formatter }) => {
			const value = domain[index];
			return {
				value,
				formattedValue: formatter(value),
				offset: getTickPosition(scale, value, tickPlacement),
				labelOffset: 0
			};
		});
	}
	const tickPlacement = tickPlacementProp ?? "extremities";
	if (isOrdinalScale(scale)) {
		const domain = scale.domain();
		const tickLabelPlacement = tickLabelPlacementProp ?? "middle";
		let filteredDomain = domain;
		if (typeof tickInterval === "object" && tickInterval != null) filteredDomain = tickInterval;
		else {
			if (typeof tickInterval === "function") filteredDomain = filteredDomain.filter(tickInterval);
			if (tickSpacing !== void 0 && tickSpacing > 0) filteredDomain = applyTickSpacing(filteredDomain, scale.range(), tickSpacing);
		}
		if (filteredDomain.length === 0) return [];
		if (scale.bandwidth() > 0) {
			const isReversed = scale.range()[0] > scale.range()[1];
			const startIndex = filteredDomain.findIndex((value) => {
				return isInside(getTickPosition(scale, value, isReversed ? "start" : "end"));
			});
			const endIndex = filteredDomain.findLastIndex((value) => isInside(getTickPosition(scale, value, isReversed ? "end" : "start")));
			return [...filteredDomain.slice(startIndex, endIndex + 1).map((value) => {
				const defaultTickLabel = `${value}`;
				return {
					value,
					formattedValue: valueFormatter?.(value, {
						location: "tick",
						scale,
						tickNumber,
						defaultTickLabel
					}) ?? defaultTickLabel,
					offset: getTickPosition(scale, value, tickPlacement),
					labelOffset: tickLabelPlacement === "tick" ? 0 : scale.step() * (offsetRatio$1[tickLabelPlacement] - offsetRatio$1[tickPlacement])
				};
			}), ...tickPlacement === "extremities" && endIndex === domain.length - 1 && isInside(scale.range()[1]) ? [{
				formattedValue: void 0,
				offset: scale.range()[1],
				labelOffset: 0
			}] : []];
		}
		return filteredDomain.map((value) => {
			const defaultTickLabel = `${value}`;
			return {
				value,
				formattedValue: valueFormatter?.(value, {
					location: "tick",
					scale,
					tickNumber,
					defaultTickLabel
				}) ?? defaultTickLabel,
				offset: scale(value),
				labelOffset: 0
			};
		});
	}
	if (scale.domain().some(isInfinity)) return [];
	const tickLabelPlacement = tickLabelPlacementProp;
	const ticks = typeof tickInterval === "object" ? tickInterval : getDefaultTicks(scale, tickNumber);
	const visibleTicks = [];
	for (let i = 0; i < ticks.length; i += 1) {
		const value = ticks[i];
		const offset = scale(value);
		if (isInside(offset)) {
			const defaultTickLabel = scale.tickFormat(tickNumber)(value);
			visibleTicks.push({
				value,
				formattedValue: valueFormatter?.(value, {
					location: "tick",
					scale,
					tickNumber,
					defaultTickLabel
				}) ?? defaultTickLabel,
				offset,
				labelOffset: tickLabelPlacement === "middle" ? scale(ticks[i - 1] ?? 0) - (offset + scale(ticks[i - 1] ?? 0)) / 2 : 0
			});
		}
	}
	return visibleTicks;
}
function getDefaultTicks(scale, tickNumber) {
	const domain = scale.domain();
	if (domain[0] === domain[1]) return [domain[0]];
	return scale.ticks(tickNumber);
}
function useTicks(options) {
	const { scale, tickNumber, valueFormatter, tickInterval, tickPlacement = "extremities", tickLabelPlacement, tickSpacing, direction, ordinalTimeTicks } = options;
	const { instance } = useChartContext();
	const isInside = direction === "x" ? instance.isXInside : instance.isYInside;
	return import_react.useMemo(() => getTicks({
		scale,
		tickNumber,
		tickPlacement,
		tickInterval,
		tickLabelPlacement,
		tickSpacing,
		valueFormatter,
		isInside,
		ordinalTimeTicks
	}), [
		scale,
		tickNumber,
		tickPlacement,
		tickInterval,
		tickLabelPlacement,
		tickSpacing,
		valueFormatter,
		isInside,
		ordinalTimeTicks
	]);
}
//#endregion
//#region node_modules/@mui/x-charts/esm/hooks/useMounted.js
function useMounted(defer = false) {
	const [mountedState, setMountedState] = import_react.useState(false);
	useEnhancedEffect(() => {
		if (!defer) setMountedState(true);
	}, [defer]);
	import_react.useEffect(() => {
		if (defer) setMountedState(true);
	}, [defer]);
	return mountedState;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/getGraphemeCount.js
var segmenter$1 = typeof window !== "undefined" && "Intl" in window && "Segmenter" in Intl ? new Intl.Segmenter(void 0, { granularity: "grapheme" }) : null;
function getGraphemeCountFallback(text) {
	return text.length;
}
function getGraphemeCountModern(text) {
	const segments = segmenter$1.segment(text);
	let count = 0;
	for (const _unused of segments) count += 1;
	return count;
}
/** Returns the number of graphemes (basically characters) present in {@link text}. */
var getGraphemeCount = segmenter$1 ? getGraphemeCountModern : getGraphemeCountFallback;
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/degToRad.js
/** Converts degrees to radians. */
function degToRad(degrees) {
	return degrees * (Math.PI / 180);
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/sliceUntil.js
var segmenter = typeof window !== "undefined" && "Intl" in window && "Segmenter" in Intl ? new Intl.Segmenter(void 0, { granularity: "grapheme" }) : null;
function sliceUntilFallback(text, endIndex) {
	return text.slice(0, endIndex);
}
function sliceUntilModern(text, endIndex) {
	const segments = segmenter.segment(text);
	let newText = "";
	let i = 0;
	for (const segment of segments) {
		newText += segment.segment;
		i += 1;
		if (i >= endIndex) break;
	}
	return newText;
}
/** Creates a slice of {@link text} from the start until the {@link endIndex}th grapheme (basically character). */
var sliceUntil = segmenter ? sliceUntilModern : sliceUntilFallback;
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/ellipsize.js
var ELLIPSIS = "…";
function doesTextFitInRect(text, config) {
	const { width, height, measureText } = config;
	const angle = degToRad(config.angle);
	const textSize = measureText(text);
	const angledWidth = Math.abs(textSize.width * Math.cos(angle)) + Math.abs(textSize.height * Math.sin(angle));
	const angledHeight = Math.abs(textSize.width * Math.sin(angle)) + Math.abs(textSize.height * Math.cos(angle));
	return angledWidth <= width && angledHeight <= height;
}
/** This function finds the best place to clip the text to add an ellipsis.
*  This function assumes that the {@link doesTextFit} never returns true for longer text after returning false for
*  shorter text.
*
*  @param text Text to ellipsize if needed
*  @param doesTextFit a function that returns whether a string fits inside a container.
*/
function ellipsize(text, doesTextFit) {
	if (doesTextFit(text)) return text;
	let shortenedText = text;
	let step = 1;
	let by = 1 / 2;
	const graphemeCount = getGraphemeCount(text);
	let newLength = graphemeCount;
	let lastLength = graphemeCount;
	let longestFittingText = null;
	do {
		lastLength = newLength;
		newLength = Math.floor(graphemeCount * by);
		if (newLength === 0) break;
		shortenedText = sliceUntil(text, newLength).trim();
		const fits = doesTextFit(shortenedText + ELLIPSIS);
		step += 1;
		if (fits) {
			longestFittingText = shortenedText;
			by += 1 / 2 ** step;
		} else by -= 1 / 2 ** step;
	} while (Math.abs(newLength - lastLength) !== 1);
	return longestFittingText ? longestFittingText + ELLIPSIS : "";
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/domUtils.js
function isSsr() {
	return typeof window === "undefined";
}
var stringCache = /* @__PURE__ */ new Map();
var MAX_CACHE_NUM = 2e3;
var PIXEL_STYLES = new Set([
	"minWidth",
	"maxWidth",
	"width",
	"minHeight",
	"maxHeight",
	"height",
	"top",
	"left",
	"fontSize",
	"padding",
	"margin",
	"paddingLeft",
	"paddingRight",
	"paddingTop",
	"paddingBottom",
	"marginLeft",
	"marginRight",
	"marginTop",
	"marginBottom"
]);
/**
* Convert number value to pixel value for certain CSS properties
* @param name CSS property name
* @param value
* @returns add 'px' for distance properties
*/
function convertPixelValue(name, value) {
	if (PIXEL_STYLES.has(name) && value === +value) return `${value}px`;
	return value;
}
/**
* Converts camelcase to dash-case
* @param text camelcase css property
*/
var AZ = /([A-Z])/g;
function camelCaseToDashCase(text) {
	return String(text).replace(AZ, (match) => `-${match.toLowerCase()}`);
}
/**
* Converts a style object into a string to be used as a cache key
* @param style React style object
* @returns CSS styling string
*/
function getStyleString(style) {
	let result = "";
	for (const key in style) if (Object.hasOwn(style, key)) {
		const k = key;
		const value = style[k];
		if (value === void 0) continue;
		result += `${camelCaseToDashCase(k)}:${convertPixelValue(k, value)};`;
	}
	return result;
}
/**
*
* @param text The string to estimate
* @param style The style applied
* @returns width and height of the text
*/
var getStringSize = (text, style = {}) => {
	if (text === void 0 || text === null || isSsr()) return {
		width: 0,
		height: 0
	};
	const str = String(text);
	const cacheKey = `${str}-${getStyleString(style)}`;
	const size = stringCache.get(cacheKey);
	if (size) return size;
	try {
		const measurementSpanContainer = getMeasurementContainer();
		const measurementElem = document.createElementNS("http://www.w3.org/2000/svg", "text");
		Object.keys(style).map((styleKey) => {
			measurementElem.style[camelCaseToDashCase(styleKey)] = convertPixelValue(styleKey, style[styleKey]);
			return styleKey;
		});
		measurementElem.textContent = str;
		measurementSpanContainer.replaceChildren(measurementElem);
		const result = measureSVGTextElement(measurementElem);
		stringCache.set(cacheKey, result);
		if (stringCache.size + 1 > MAX_CACHE_NUM) stringCache.clear();
		return result;
	} catch {
		return {
			width: 0,
			height: 0
		};
	}
};
function batchMeasureStrings(texts, style = {}) {
	if (isSsr()) return new Map(Array.from(texts).map((text) => [text, {
		width: 0,
		height: 0
	}]));
	const sizeMap = /* @__PURE__ */ new Map();
	const textToMeasure = [];
	const styleString = getStyleString(style);
	for (const text of texts) {
		const cacheKey = `${text}-${styleString}`;
		const size = stringCache.get(cacheKey);
		if (size) sizeMap.set(text, size);
		else textToMeasure.push(text);
	}
	const measurementContainer = getMeasurementContainer();
	const measurementSpanStyle = _extends({}, style);
	Object.keys(measurementSpanStyle).map((styleKey) => {
		measurementContainer.style[camelCaseToDashCase(styleKey)] = convertPixelValue(styleKey, measurementSpanStyle[styleKey]);
		return styleKey;
	});
	const measurementElements = [];
	for (const string of textToMeasure) {
		const measurementElem = document.createElementNS("http://www.w3.org/2000/svg", "text");
		measurementElem.textContent = `${string}`;
		measurementElements.push(measurementElem);
	}
	measurementContainer.replaceChildren(...measurementElements);
	for (let i = 0; i < textToMeasure.length; i += 1) {
		const text = textToMeasure[i];
		const measurementElem = measurementContainer.children[i];
		const result = measureSVGTextElement(measurementElem);
		const cacheKey = `${text}-${styleString}`;
		stringCache.set(cacheKey, result);
		sizeMap.set(text, result);
	}
	if (stringCache.size + 1 > MAX_CACHE_NUM) stringCache.clear();
	return sizeMap;
}
/**
* Measures an SVG text element using getBBox() with fallback to getBoundingClientRect()
* @param element SVG text element to measure
* @returns width and height of the text element
*/
function measureSVGTextElement(element) {
	try {
		const result = element.getBBox();
		return {
			width: result.width,
			height: result.height
		};
	} catch {
		const result = element.getBoundingClientRect();
		return {
			width: result.width,
			height: result.height
		};
	}
}
var measurementContainer = null;
/**
* Get (or create) a hidden span element to measure text size.
*/
function getMeasurementContainer() {
	if (measurementContainer === null) {
		measurementContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		measurementContainer.setAttribute("aria-hidden", "true");
		measurementContainer.style.position = "absolute";
		measurementContainer.style.top = "-20000px";
		measurementContainer.style.left = "0";
		measurementContainer.style.padding = "0";
		measurementContainer.style.margin = "0";
		measurementContainer.style.border = "none";
		measurementContainer.style.pointerEvents = "none";
		measurementContainer.style.visibility = "hidden";
		measurementContainer.style.contain = "strict";
		document.body.appendChild(measurementContainer);
	}
	return measurementContainer;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsXAxis/shortenLabels.js
function shortenLabels$1(visibleLabels, drawingArea, maxHeight, isRtl, tickLabelStyle) {
	const shortenedLabels = /* @__PURE__ */ new Map();
	const angle = clampAngle(tickLabelStyle?.angle ?? 0);
	let leftBoundFactor = 1;
	let rightBoundFactor = 1;
	if (tickLabelStyle?.textAnchor === "start") {
		leftBoundFactor = Infinity;
		rightBoundFactor = 1;
	} else if (tickLabelStyle?.textAnchor === "end") {
		leftBoundFactor = 1;
		rightBoundFactor = Infinity;
	} else {
		leftBoundFactor = 2;
		rightBoundFactor = 2;
	}
	if (angle > 90 && angle < 270) [leftBoundFactor, rightBoundFactor] = [rightBoundFactor, leftBoundFactor];
	if (isRtl) [leftBoundFactor, rightBoundFactor] = [rightBoundFactor, leftBoundFactor];
	for (const item of visibleLabels) if (item.formattedValue) {
		const width = Math.min((item.offset + item.labelOffset) * leftBoundFactor, (drawingArea.left + drawingArea.width + drawingArea.right - item.offset - item.labelOffset) * rightBoundFactor);
		const doesTextFit = (text) => doesTextFitInRect(text, {
			width,
			height: maxHeight,
			angle,
			measureText: (string) => getStringSize(string, tickLabelStyle)
		});
		shortenedLabels.set(item, ellipsize(item.formattedValue.toString(), doesTextFit));
	}
	return shortenedLabels;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/geometry.js
var ANGLE_APPROX = 5;
/**
* Return the minimal translation along the x-axis to avoid overflow of a rectangle of a given width, height, and rotation.
* This assumes that all rectangles have the same height and angle between -90 and 90.
* Otherwise it would be problematic because you need the height/width of the next rectangle to do the correct computation.
* @param width the side along the x-axis.
* @param height the side along the y-axis.
* @param angle the rotation in degrees.
*/
function getMinXTranslation(width, height, angle = 0) {
	if (angle > 90 && angle < -90) warnOnce([
		`MUI X Charts: It seems you applied an angle larger than 90° or smaller than -90° to an axis text.`,
		`This could cause some text overlapping.`,
		`If you encounter a use case where it's needed, please open an issue.`
	]);
	const standardAngle = Math.min(Math.abs(angle) % 180, Math.abs(Math.abs(angle) % 180 - 180) % 180);
	if (standardAngle < ANGLE_APPROX) return width;
	if (standardAngle > 90 - ANGLE_APPROX) return height;
	const radAngle = deg2rad(standardAngle);
	if (radAngle < Math.atan2(height, width)) return width / Math.cos(radAngle);
	return height / Math.sin(radAngle);
}
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsXAxis/getVisibleLabels.js
function getVisibleLabels(xTicks, { tickLabelStyle: style, tickLabelInterval, tickLabelMinGap, reverse, isMounted, isXInside }) {
	if (typeof tickLabelInterval === "function") return new Set(xTicks.filter((item, index) => tickLabelInterval(item.value, index)));
	let previousTextLimit = 0;
	const direction = reverse ? -1 : 1;
	const candidateTickLabels = xTicks.filter((item) => {
		const { offset, labelOffset, formattedValue } = item;
		if (formattedValue === "") return false;
		return isXInside(offset + labelOffset);
	});
	const sizeMap = measureTickLabels(candidateTickLabels, style);
	return new Set(candidateTickLabels.filter((item, labelIndex) => {
		const { offset, labelOffset } = item;
		const textPosition = offset + labelOffset;
		if (labelIndex > 0 && direction * textPosition < direction * (previousTextLimit + tickLabelMinGap)) return false;
		const { width, height } = isMounted ? getTickLabelSize(sizeMap, item) : {
			width: 0,
			height: 0
		};
		const distance = getMinXTranslation(width, height, style?.angle);
		const currentTextLimit = textPosition - direction * distance / 2;
		if (labelIndex > 0 && direction * currentTextLimit < direction * (previousTextLimit + tickLabelMinGap)) return false;
		previousTextLimit = textPosition + direction * distance / 2;
		return true;
	}));
}
function getTickLabelSize(sizeMap, tick) {
	if (tick.formattedValue === void 0) return {
		width: 0,
		height: 0
	};
	let width = 0;
	let height = 0;
	for (const line of tick.formattedValue.split("\n")) {
		const lineSize = sizeMap.get(line);
		if (lineSize) {
			width = Math.max(width, lineSize.width);
			height += lineSize.height;
		}
	}
	return {
		width,
		height
	};
}
function measureTickLabels(ticks, style) {
	const strings = /* @__PURE__ */ new Set();
	for (const tick of ticks) if (tick.formattedValue) tick.formattedValue.split("\n").forEach((line) => strings.add(line));
	return batchMeasureStrings(strings, style);
}
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsAxis/axisClasses.js
function getAxisUtilityClass(slot) {
	return generateUtilityClass("MuiChartsAxis", slot);
}
var axisClasses = generateUtilityClasses("MuiChartsAxis", [
	"root",
	"line",
	"tickContainer",
	"tick",
	"tickLabel",
	"label",
	"directionX",
	"directionY",
	"top",
	"bottom",
	"left",
	"right",
	"id"
]);
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsXAxis/utilities.js
var useUtilityClasses$3 = (ownerState) => {
	const { classes, position, id } = ownerState;
	return composeClasses({
		root: [
			"root",
			"directionX",
			position,
			`id-${id}`
		],
		line: ["line"],
		tickContainer: ["tickContainer"],
		tick: ["tick"],
		tickLabel: ["tickLabel"],
		label: ["label"]
	}, getAxisUtilityClass, classes);
};
var defaultProps$1 = {
	disableLine: false,
	disableTicks: false,
	tickSize: 6,
	tickLabelMinGap: 4
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/getWordsByLines.js
function getWordsByLines({ style, needsComputation, text }) {
	return text.split("\n").map((subText) => _extends({ text: subText }, needsComputation ? getStringSize(subText, style) : {
		width: 0,
		height: 0
	}));
}
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsText/ChartsText.js
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
var import_jsx_runtime = require_jsx_runtime();
var _excluded$5 = [
	"x",
	"y",
	"style",
	"text",
	"ownerState"
], _excluded2$2 = [
	"angle",
	"textAnchor",
	"dominantBaseline"
];
/**
* Helper component to manage multiline text in SVG
*/
function ChartsText(props) {
	const { x, y, style: styleProps, text } = props, textProps = _objectWithoutPropertiesLoose(props, _excluded$5);
	const _ref = styleProps ?? {}, { angle, textAnchor, dominantBaseline } = _ref, style = _objectWithoutPropertiesLoose(_ref, _excluded2$2);
	const isHydrated = useIsHydrated();
	const wordsByLines = import_react.useMemo(() => getWordsByLines({
		style,
		needsComputation: isHydrated && text.includes("\n"),
		text
	}), [
		style,
		text,
		isHydrated
	]);
	let startDy;
	switch (dominantBaseline) {
		case "hanging":
		case "text-before-edge":
			startDy = 0;
			break;
		case "central":
			startDy = (wordsByLines.length - 1) / 2 * -wordsByLines[0].height;
			break;
		default:
			startDy = (wordsByLines.length - 1) * -wordsByLines[0].height;
			break;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", _extends({}, textProps, {
		transform: angle ? `rotate(${angle}, ${x}, ${y})` : void 0,
		x,
		y,
		textAnchor,
		dominantBaseline,
		style,
		children: wordsByLines.map((line, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tspan", {
			x,
			dy: `${index === 0 ? startDy : wordsByLines[0].height}px`,
			dominantBaseline,
			children: line.text
		}, index))
	}));
}
ChartsText.propTypes = {
	lineHeight: import_prop_types.default.number,
	needsComputation: import_prop_types.default.bool,
	ownerState: import_prop_types.default.any,
	style: import_prop_types.default.object,
	text: import_prop_types.default.string.isRequired
};
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsText/defaultTextPlacement.js
/**
* Provide the text-anchor based on the angle between the text and the associated element.
* - 0 means the element is on top of the text, 180 bellow, and 90 on the right of the text.
* @param {number} angle The angle between the text and the element.
* @returns
*/
function getDefaultTextAnchor(angle) {
	const adjustedAngle = clampAngle(angle);
	if (adjustedAngle <= 30 || adjustedAngle >= 330) return "middle";
	if (adjustedAngle <= 210 && adjustedAngle >= 150) return "middle";
	if (adjustedAngle <= 180) return "end";
	return "start";
}
function getDefaultBaseline(angle) {
	const adjustedAngle = clampAngle(angle);
	if (adjustedAngle <= 30 || adjustedAngle >= 330) return "hanging";
	if (adjustedAngle <= 210 && adjustedAngle >= 150) return "auto";
	return "central";
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/invertTextAnchor.js
function invertTextAnchor(textAnchor) {
	switch (textAnchor) {
		case "start": return "end";
		case "end": return "start";
		default: return textAnchor;
	}
}
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsXAxis/useAxisTicksProps.js
var _excluded$4 = [
	"scale",
	"tickNumber",
	"reverse"
];
function useAxisTicksProps$1(inProps) {
	const { xAxis, xAxisIds } = useXAxes();
	const _xAxis = xAxis[inProps.axisId ?? xAxisIds[0]], { scale: xScale, tickNumber, reverse } = _xAxis;
	const defaultizedProps = _extends({}, defaultProps$1, useThemeProps({
		props: _extends({}, _objectWithoutPropertiesLoose(_xAxis, _excluded$4), inProps),
		name: "MuiChartsXAxis"
	}));
	const { position, tickLabelStyle, slots, slotProps } = defaultizedProps;
	const theme = useTheme();
	const isRtl = useRtl();
	const classes = useUtilityClasses$3(defaultizedProps);
	const positionSign = position === "bottom" ? 1 : -1;
	const Tick = slots?.axisTick ?? "line";
	const TickLabel = slots?.axisTickLabel ?? ChartsText;
	const defaultTextAnchor = getDefaultTextAnchor((position === "bottom" ? 0 : 180) - (tickLabelStyle?.angle ?? 0));
	const defaultDominantBaseline = getDefaultBaseline((position === "bottom" ? 0 : 180) - (tickLabelStyle?.angle ?? 0));
	return {
		xScale,
		defaultizedProps,
		tickNumber,
		positionSign,
		classes,
		Tick,
		TickLabel,
		axisTickLabelProps: useSlotProps({
			elementType: TickLabel,
			externalSlotProps: slotProps?.axisTickLabel,
			additionalProps: { style: _extends({}, theme.typography.caption, {
				fontSize: 12,
				lineHeight: 1.25,
				textAnchor: isRtl ? invertTextAnchor(defaultTextAnchor) : defaultTextAnchor,
				dominantBaseline: defaultDominantBaseline
			}, tickLabelStyle) },
			className: classes.tickLabel,
			ownerState: {}
		}),
		reverse
	};
}
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsXAxis/ChartsSingleXAxisTicks.js
/**
* @ignore - internal component.
*/
function ChartsSingleXAxisTicks(inProps) {
	const { axisLabelHeight, ordinalTimeTicks } = inProps;
	const { xScale, defaultizedProps, tickNumber, positionSign, classes, Tick, TickLabel, axisTickLabelProps, reverse } = useAxisTicksProps$1(inProps);
	const isRtl = useRtl();
	const isMounted = useMounted();
	const { disableTicks, tickSize: tickSizeProp, valueFormatter, slotProps, tickInterval, tickLabelInterval, tickPlacement, tickLabelPlacement, tickLabelMinGap, tickSpacing, height: axisHeight } = defaultizedProps;
	const drawingArea = useDrawingArea();
	const { instance } = useChartContext();
	const isHydrated = useIsHydrated();
	const tickSize = disableTicks ? 4 : tickSizeProp;
	const xTicks = useTicks({
		scale: xScale,
		tickNumber,
		valueFormatter,
		tickInterval,
		tickPlacement,
		tickLabelPlacement,
		tickSpacing,
		direction: "x",
		ordinalTimeTicks
	});
	const visibleLabels = getVisibleLabels(xTicks, {
		tickLabelStyle: axisTickLabelProps.style,
		tickLabelInterval,
		tickLabelMinGap,
		reverse,
		isMounted,
		isXInside: instance.isXInside
	});
	const tickLabelsMaxHeight = Math.max(0, axisHeight - (axisLabelHeight > 0 ? axisLabelHeight + 4 : 0) - tickSize - 3);
	const tickLabels = isHydrated ? shortenLabels$1(visibleLabels, drawingArea, tickLabelsMaxHeight, isRtl, axisTickLabelProps.style) : new Map(Array.from(visibleLabels).map((item) => [item, item.formattedValue]));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: xTicks.map((item, index) => {
		const { offset: tickOffset, labelOffset } = item;
		const xTickLabel = labelOffset ?? 0;
		const yTickLabel = positionSign * (tickSize + 3);
		const showTick = instance.isXInside(tickOffset);
		const tickLabel = tickLabels.get(item);
		const showTickLabel = visibleLabels.has(item);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
			transform: `translate(${tickOffset}, 0)`,
			className: classes.tickContainer,
			children: [!disableTicks && showTick && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tick, _extends({
				y2: positionSign * tickSize,
				className: classes.tick
			}, slotProps?.axisTick)), tickLabel !== void 0 && showTickLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TickLabel, _extends({
				x: xTickLabel,
				y: yTickLabel
			}, axisTickLabelProps, { text: tickLabel }))]
		}, index);
	}) });
}
//#endregion
//#region node_modules/@mui/x-charts/esm/hooks/useTicksGrouped.js
var offsetRatio = {
	start: 0,
	extremities: 0,
	end: 1,
	middle: .5,
	tick: 0
};
function useTicksGrouped(options) {
	const { scale, tickInterval, tickLabelPlacement = "middle", tickPlacement = "extremities", groups } = options;
	return import_react.useMemo(() => {
		const domain = scale.domain();
		const filteredDomain = typeof tickInterval === "function" && domain.filter(tickInterval) || typeof tickInterval === "object" && tickInterval || domain;
		if (scale.bandwidth() > 0) {
			const entries = mapToGrouping(filteredDomain, groups, tickPlacement, tickLabelPlacement, scale);
			if (entries[0]) entries[0].ignoreTick = true;
			return [
				{
					formattedValue: void 0,
					offset: scale.range()[0],
					labelOffset: 0,
					groupIndex: groups.length - 1
				},
				...entries,
				{
					formattedValue: void 0,
					offset: scale.range()[1],
					labelOffset: 0,
					groupIndex: groups.length - 1
				}
			];
		}
		return mapToGrouping(filteredDomain, groups, tickPlacement, tickLabelPlacement, scale);
	}, [
		scale,
		tickInterval,
		groups,
		tickPlacement,
		tickLabelPlacement
	]);
}
function mapToGrouping(tickValues, groups, tickPlacement, tickLabelPlacement, scale) {
	const allTickItems = [];
	const dataIndexToTickIndex = /* @__PURE__ */ new Map();
	let currentValueCount = 0;
	for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) for (let dataIndex = 0; dataIndex < tickValues.length; dataIndex += 1) {
		const tickValue = tickValues[dataIndex];
		const groupValue = groups[groupIndex].getValue(tickValue, dataIndex);
		const lastItem = allTickItems[allTickItems.length - 1];
		if (lastItem?.value !== groupValue || lastItem?.groupIndex !== groupIndex) {
			currentValueCount = 1;
			const tickOffset = isOrdinalScale(scale) ? scale(tickValue) - (scale.step() - scale.bandwidth()) / 2 + offsetRatio[tickPlacement] * scale.step() : scale(tickValue);
			const labelOffset = scale.step() * currentValueCount * (offsetRatio[tickLabelPlacement] - offsetRatio[tickPlacement]);
			allTickItems.push({
				value: groupValue,
				formattedValue: `${groupValue}`,
				offset: tickOffset,
				groupIndex,
				dataIndex,
				ignoreTick: false,
				labelOffset
			});
			if (!dataIndexToTickIndex.has(dataIndex)) dataIndexToTickIndex.set(dataIndex, /* @__PURE__ */ new Set());
			const tickIndexes = dataIndexToTickIndex.get(dataIndex);
			for (const previousIndex of tickIndexes.values()) allTickItems[previousIndex].ignoreTick = true;
			tickIndexes.add(allTickItems.length - 1);
		} else {
			currentValueCount += 1;
			lastItem.labelOffset = scale.step() * currentValueCount * (offsetRatio[tickLabelPlacement] - offsetRatio[tickPlacement]);
		}
	}
	return allTickItems;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsXAxis/ChartsGroupedXAxisTicks.js
var DEFAULT_GROUPING_CONFIG$1 = { tickSize: 6 };
var getGroupingConfig$1 = (groups, groupIndex, tickSize) => {
	const config = groups[groupIndex] ?? {};
	const defaultTickSize = tickSize ?? DEFAULT_GROUPING_CONFIG$1.tickSize;
	const calculatedTickSize = defaultTickSize * groupIndex * 2 + defaultTickSize;
	return _extends({}, DEFAULT_GROUPING_CONFIG$1, config, { tickSize: config.tickSize ?? calculatedTickSize });
};
/**
* @ignore - internal component.
*/
function ChartsGroupedXAxisTicks(inProps) {
	const { xScale, defaultizedProps, tickNumber, positionSign, classes, Tick, TickLabel, axisTickLabelProps } = useAxisTicksProps$1(inProps);
	if (!isOrdinalScale(xScale)) throw new Error("MUI X Charts: ChartsGroupedXAxis only supports the `band` and `point` scale types.");
	const { disableTicks, tickSize, valueFormatter, slotProps, tickInterval, tickPlacement, tickLabelPlacement } = defaultizedProps;
	const groups = defaultizedProps.groups;
	const { instance } = useChartContext();
	const xTicks = useTicksGrouped({
		scale: xScale,
		tickNumber,
		valueFormatter,
		tickInterval,
		tickPlacement,
		tickLabelPlacement,
		direction: "x",
		groups
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: xTicks.map((item, index) => {
		const { offset: tickOffset, labelOffset } = item;
		const xTickLabel = labelOffset ?? 0;
		const showTick = instance.isXInside(tickOffset);
		const tickLabel = item.formattedValue;
		const ignoreTick = item.ignoreTick ?? false;
		const groupIndex = item.groupIndex ?? 0;
		const groupConfig = getGroupingConfig$1(groups, groupIndex, tickSize);
		const tickYSize = positionSign * groupConfig.tickSize;
		const labelPositionY = positionSign * (groupConfig.tickSize + 3);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
			transform: `translate(${tickOffset}, 0)`,
			className: classes.tickContainer,
			"data-group-index": groupIndex,
			children: [!disableTicks && !ignoreTick && showTick && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tick, _extends({
				y2: tickYSize,
				className: classes.tick
			}, slotProps?.axisTick)), tickLabel !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TickLabel, _extends({
				x: xTickLabel,
				y: labelPositionY
			}, axisTickLabelProps, {
				style: _extends({}, axisTickLabelProps.style, groupConfig.tickLabelStyle),
				text: tickLabel
			}))]
		}, index);
	}) });
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/components/AxisSharedComponents.js
var AxisRoot = styled("g", {
	name: "MuiChartsAxis",
	slot: "Root"
})(({ theme }) => ({
	[`& .${axisClasses.tickLabel}`]: _extends({}, theme.typography.caption, { fill: (theme.vars || theme).palette.text.primary }),
	[`& .${axisClasses.label}`]: { fill: (theme.vars || theme).palette.text.primary },
	[`& .${axisClasses.line}`]: {
		stroke: (theme.vars || theme).palette.text.primary,
		shapeRendering: "crispEdges",
		strokeWidth: 1
	},
	[`& .${axisClasses.tick}`]: {
		stroke: (theme.vars || theme).palette.text.primary,
		shapeRendering: "crispEdges"
	}
}));
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsXAxis/ChartsXAxisImpl.js
var _excluded$3 = ["axis"], _excluded2$1 = [
	"scale",
	"tickNumber",
	"reverse",
	"ordinalTimeTicks"
];
var XAxisRoot = styled(AxisRoot, {
	name: "MuiChartsXAxis",
	slot: "Root"
})({});
/**
* @ignore - internal component. Use `ChartsXAxis` instead.
*/
function ChartsXAxisImpl(_ref) {
	let { axis } = _ref, inProps = _objectWithoutPropertiesLoose(_ref, _excluded$3);
	const { scale: xScale, ordinalTimeTicks } = axis;
	const defaultizedProps = _extends({}, defaultProps$1, useThemeProps({
		props: _extends({}, _objectWithoutPropertiesLoose(axis, _excluded2$1), inProps),
		name: "MuiChartsXAxis"
	}));
	const { position, labelStyle, offset, slots, slotProps, sx, disableLine, label, height: axisHeight } = defaultizedProps;
	const theme = useTheme();
	const classes = useUtilityClasses$3(defaultizedProps);
	const { left, top, width, height } = useDrawingArea();
	const positionSign = position === "bottom" ? 1 : -1;
	const Line = slots?.axisLine ?? "line";
	const Label = slots?.axisLabel ?? ChartsText;
	const axisLabelProps = useSlotProps({
		elementType: Label,
		externalSlotProps: slotProps?.axisLabel,
		additionalProps: { style: _extends({}, theme.typography.body1, {
			lineHeight: 1,
			fontSize: 14,
			textAnchor: "middle",
			dominantBaseline: position === "bottom" ? "text-after-edge" : "text-before-edge"
		}, labelStyle) },
		ownerState: {}
	});
	if (position === "none") return null;
	const labelHeight = label ? getStringSize(label, axisLabelProps.style).height : 0;
	const domain = xScale.domain();
	const skipTickRendering = isOrdinalScale(xScale) ? domain.length === 0 : domain.some(isInfinity);
	let children = null;
	if (!skipTickRendering) children = "groups" in axis && Array.isArray(axis.groups) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsGroupedXAxisTicks, _extends({}, inProps)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsSingleXAxisTicks, _extends({}, inProps, {
		axisLabelHeight: labelHeight,
		ordinalTimeTicks
	}));
	const labelRefPoint = {
		x: left + width / 2,
		y: positionSign * axisHeight
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(XAxisRoot, {
		transform: `translate(0, ${position === "bottom" ? top + height + offset : top - offset})`,
		className: classes.root,
		"data-axis-id": defaultizedProps.id,
		sx,
		children: [
			!disableLine && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, _extends({
				x1: left,
				x2: left + width,
				className: classes.line
			}, slotProps?.axisLine)),
			children,
			label && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
				className: classes.label,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, _extends({}, labelRefPoint, axisLabelProps, { text: label }))
			})
		]
	});
}
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsXAxis/ChartsXAxis.js
/**
* Demos:
*
* - [Axis](https://mui.com/x/react-charts/axis/)
*
* API:
*
* - [ChartsXAxis API](https://mui.com/x/api/charts/charts-x-axis/)
*/
function ChartsXAxis(inProps) {
	const { xAxis, xAxisIds } = useXAxes();
	const axis = xAxis[inProps.axisId ?? xAxisIds[0]];
	if (!axis) {
		warnOnce(`MUI X Charts: No axis found. The axisId "${inProps.axisId}" is probably invalid.`);
		return null;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsXAxisImpl, _extends({}, inProps, { axis }));
}
ChartsXAxis.propTypes = {
	axis: import_prop_types.default.oneOf(["x"]),
	axisId: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]),
	classes: import_prop_types.default.object,
	disableLine: import_prop_types.default.bool,
	disableTicks: import_prop_types.default.bool,
	label: import_prop_types.default.string,
	labelStyle: import_prop_types.default.object,
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
	tickSize: import_prop_types.default.number
};
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsYAxis/shortenLabels.js
function shortenLabels(visibleLabels, drawingArea, maxWidth, isRtl, tickLabelStyle) {
	const shortenedLabels = /* @__PURE__ */ new Map();
	const angle = clampAngle(tickLabelStyle?.angle ?? 0);
	let topBoundFactor = 1;
	let bottomBoundFactor = 1;
	if (tickLabelStyle?.textAnchor === "start") {
		topBoundFactor = Infinity;
		bottomBoundFactor = 1;
	} else if (tickLabelStyle?.textAnchor === "end") {
		topBoundFactor = 1;
		bottomBoundFactor = Infinity;
	} else {
		topBoundFactor = 2;
		bottomBoundFactor = 2;
	}
	if (angle > 180) [topBoundFactor, bottomBoundFactor] = [bottomBoundFactor, topBoundFactor];
	if (isRtl) [topBoundFactor, bottomBoundFactor] = [bottomBoundFactor, topBoundFactor];
	for (const item of visibleLabels) if (item.formattedValue) {
		const height = Math.min((item.offset + item.labelOffset) * topBoundFactor, (drawingArea.top + drawingArea.height + drawingArea.bottom - item.offset - item.labelOffset) * bottomBoundFactor);
		const doesTextFit = (text) => doesTextFitInRect(text, {
			width: maxWidth,
			height,
			angle,
			measureText: (string) => getStringSize(string, tickLabelStyle)
		});
		shortenedLabels.set(item, ellipsize(item.formattedValue.toString(), doesTextFit));
	}
	return shortenedLabels;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsYAxis/utilities.js
var useUtilityClasses$2 = (ownerState) => {
	const { classes, position, id } = ownerState;
	return composeClasses({
		root: [
			"root",
			"directionY",
			position,
			`id-${id}`
		],
		line: ["line"],
		tickContainer: ["tickContainer"],
		tick: ["tick"],
		tickLabel: ["tickLabel"],
		label: ["label"]
	}, getAxisUtilityClass, classes);
};
var defaultProps = {
	disableLine: false,
	disableTicks: false,
	tickSize: 6
};
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsYAxis/useAxisTicksProps.js
var _excluded$2 = [
	"scale",
	"tickNumber",
	"reverse"
];
function useAxisTicksProps(inProps) {
	const { yAxis, yAxisIds } = useYAxes();
	const _yAxis = yAxis[inProps.axisId ?? yAxisIds[0]], { scale: yScale, tickNumber } = _yAxis;
	const defaultizedProps = _extends({}, defaultProps, useThemeProps({
		props: _extends({}, _objectWithoutPropertiesLoose(_yAxis, _excluded$2), inProps),
		name: "MuiChartsYAxis"
	}));
	const { position, tickLabelStyle, slots, slotProps } = defaultizedProps;
	const theme = useTheme();
	const isRtl = useRtl();
	const classes = useUtilityClasses$2(defaultizedProps);
	const positionSign = position === "right" ? 1 : -1;
	const tickFontSize = typeof tickLabelStyle?.fontSize === "number" ? tickLabelStyle.fontSize : 12;
	const Tick = slots?.axisTick ?? "line";
	const TickLabel = slots?.axisTickLabel ?? ChartsText;
	const defaultTextAnchor = getDefaultTextAnchor((position === "right" ? -90 : 90) - (tickLabelStyle?.angle ?? 0));
	const defaultDominantBaseline = getDefaultBaseline((position === "right" ? -90 : 90) - (tickLabelStyle?.angle ?? 0));
	return {
		yScale,
		defaultizedProps,
		tickNumber,
		positionSign,
		classes,
		Tick,
		TickLabel,
		axisTickLabelProps: useSlotProps({
			elementType: TickLabel,
			externalSlotProps: slotProps?.axisTickLabel,
			additionalProps: { style: _extends({}, theme.typography.caption, {
				fontSize: tickFontSize,
				textAnchor: isRtl ? invertTextAnchor(defaultTextAnchor) : defaultTextAnchor,
				dominantBaseline: defaultDominantBaseline
			}, tickLabelStyle) },
			className: classes.tickLabel,
			ownerState: {}
		})
	};
}
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsYAxis/ChartsSingleYAxisTicks.js
/**
* @ignore - internal component.
*/
function ChartsSingleYAxisTicks(inProps) {
	const { axisLabelHeight, ordinalTimeTicks } = inProps;
	const { yScale, defaultizedProps, tickNumber, positionSign, classes, Tick, TickLabel, axisTickLabelProps } = useAxisTicksProps(inProps);
	const isRtl = useRtl();
	const { disableTicks, tickSize: tickSizeProp, valueFormatter, slotProps, tickPlacement, tickLabelPlacement, tickInterval, tickLabelInterval, tickSpacing, width: axisWidth } = defaultizedProps;
	const drawingArea = useDrawingArea();
	const { instance } = useChartContext();
	const isHydrated = useIsHydrated();
	const tickSize = disableTicks ? 4 : tickSizeProp;
	const yTicks = useTicks({
		scale: yScale,
		tickNumber,
		valueFormatter,
		tickPlacement,
		tickLabelPlacement,
		tickInterval,
		tickSpacing,
		direction: "y",
		ordinalTimeTicks
	});
	const tickLabelsMaxWidth = Math.max(0, axisWidth - (axisLabelHeight > 0 ? axisLabelHeight + 2 : 0) - tickSize - 2);
	const tickLabels = isHydrated ? shortenLabels(yTicks, drawingArea, tickLabelsMaxWidth, isRtl, axisTickLabelProps.style) : new Map(Array.from(yTicks).map((item) => [item, item.formattedValue]));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: yTicks.map((item, index) => {
		const { offset: tickOffset, labelOffset, value } = item;
		const xTickLabel = positionSign * (tickSize + 2);
		const yTickLabel = labelOffset;
		const skipLabel = typeof tickLabelInterval === "function" && !tickLabelInterval?.(value, index);
		const showLabel = instance.isYInside(tickOffset);
		const tickLabel = tickLabels.get(item);
		if (!showLabel) return null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
			transform: `translate(0, ${tickOffset})`,
			className: classes.tickContainer,
			children: [!disableTicks && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tick, _extends({
				x2: positionSign * tickSize,
				className: classes.tick
			}, slotProps?.axisTick)), tickLabel !== void 0 && !skipLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TickLabel, _extends({
				x: xTickLabel,
				y: yTickLabel,
				text: tickLabel
			}, axisTickLabelProps))]
		}, index);
	}) });
}
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsYAxis/ChartsGroupedYAxisTicks.js
var DEFAULT_GROUPING_CONFIG = { tickSize: 6 };
var getGroupingConfig = (groups, groupIndex, tickSize) => {
	const config = groups[groupIndex] ?? {};
	const defaultTickSize = tickSize ?? DEFAULT_GROUPING_CONFIG.tickSize;
	const calculatedTickSize = defaultTickSize * groupIndex * 2 + defaultTickSize;
	return _extends({}, DEFAULT_GROUPING_CONFIG, config, { tickSize: config.tickSize ?? calculatedTickSize });
};
/**
* @ignore - internal component.
*/
function ChartsGroupedYAxisTicks(inProps) {
	const { yScale, defaultizedProps, tickNumber, positionSign, classes, Tick, TickLabel, axisTickLabelProps } = useAxisTicksProps(inProps);
	if (!isOrdinalScale(yScale)) throw new Error("MUI X Charts: ChartsGroupedYAxis only supports the `band` and `point` scale types.");
	const { disableTicks, tickSize, valueFormatter, slotProps, tickInterval, tickPlacement, tickLabelPlacement } = defaultizedProps;
	const groups = defaultizedProps.groups;
	const { instance } = useChartContext();
	const yTicks = useTicksGrouped({
		scale: yScale,
		tickNumber,
		valueFormatter,
		tickInterval,
		tickPlacement,
		tickLabelPlacement,
		direction: "y",
		groups
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: yTicks.map((item, index) => {
		const { offset: tickOffset, labelOffset } = item;
		const yTickLabel = labelOffset ?? 0;
		const showTick = instance.isYInside(tickOffset);
		const tickLabel = item.formattedValue;
		const ignoreTick = item.ignoreTick ?? false;
		const groupIndex = item.groupIndex ?? 0;
		const groupConfig = getGroupingConfig(groups, groupIndex, tickSize);
		const tickXSize = positionSign * groupConfig.tickSize;
		const labelPositionX = positionSign * (groupConfig.tickSize + 2);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
			transform: `translate(0, ${tickOffset})`,
			className: classes.tickContainer,
			"data-group-index": groupIndex,
			children: [!disableTicks && !ignoreTick && showTick && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tick, _extends({
				x2: tickXSize,
				className: classes.tick
			}, slotProps?.axisTick)), tickLabel !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TickLabel, _extends({
				x: labelPositionX,
				y: yTickLabel
			}, axisTickLabelProps, {
				style: _extends({}, axisTickLabelProps.style, groupConfig.tickLabelStyle),
				text: tickLabel
			}))]
		}, index);
	}) });
}
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsYAxis/ChartsYAxisImpl.js
var _excluded$1 = ["axis"], _excluded2 = [
	"scale",
	"tickNumber",
	"reverse",
	"ordinalTimeTicks"
];
var YAxisRoot = styled(AxisRoot, {
	name: "MuiChartsYAxis",
	slot: "Root"
})({});
/**
* @ignore - internal component. Use `ChartsYAxis` instead.
*/
function ChartsYAxisImpl(_ref) {
	let { axis } = _ref, inProps = _objectWithoutPropertiesLoose(_ref, _excluded$1);
	const { scale: yScale, ordinalTimeTicks } = axis, settings = _objectWithoutPropertiesLoose(axis, _excluded2);
	const isHydrated = useIsHydrated();
	const defaultizedProps = _extends({}, defaultProps, useThemeProps({
		props: _extends({}, settings, inProps),
		name: "MuiChartsYAxis"
	}));
	const { position, disableLine, label, labelStyle, offset, width: axisWidth, sx, slots, slotProps } = defaultizedProps;
	const theme = useTheme();
	const classes = useUtilityClasses$2(defaultizedProps);
	const { left, top, width, height } = useDrawingArea();
	const positionSign = position === "right" ? 1 : -1;
	const Line = slots?.axisLine ?? "line";
	const Label = slots?.axisLabel ?? ChartsText;
	const lineProps = useSlotProps({
		elementType: Line,
		externalSlotProps: slotProps?.axisLine,
		additionalProps: { strokeLinecap: "square" },
		ownerState: {}
	});
	const axisLabelProps = useSlotProps({
		elementType: Label,
		externalSlotProps: slotProps?.axisLabel,
		additionalProps: { style: _extends({}, theme.typography.body1, {
			lineHeight: 1,
			fontSize: 14,
			angle: positionSign * 90,
			textAnchor: "middle",
			dominantBaseline: "text-before-edge"
		}, labelStyle) },
		ownerState: {}
	});
	if (position === "none") return null;
	const labelRefPoint = {
		x: positionSign * axisWidth,
		y: top + height / 2
	};
	const axisLabelHeight = label == null ? 0 : getStringSize(label, axisLabelProps.style).height;
	const domain = yScale.domain();
	const skipTickRendering = isOrdinalScale(yScale) ? domain.length === 0 : domain.some(isInfinity);
	let children = null;
	if (!skipTickRendering) children = "groups" in axis && Array.isArray(axis.groups) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsGroupedYAxisTicks, _extends({}, inProps)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsSingleYAxisTicks, _extends({}, inProps, {
		axisLabelHeight,
		ordinalTimeTicks
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(YAxisRoot, {
		transform: `translate(${position === "right" ? left + width + offset : left - offset}, 0)`,
		className: classes.root,
		"data-axis-id": defaultizedProps.id,
		sx,
		children: [
			!disableLine && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, _extends({
				y1: top,
				y2: top + height,
				className: classes.line
			}, lineProps)),
			children,
			label && isHydrated && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
				className: classes.label,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, _extends({}, labelRefPoint, axisLabelProps, { text: label }))
			})
		]
	});
}
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsYAxis/ChartsYAxis.js
/**
* Demos:
*
* - [Axis](https://mui.com/x/react-charts/axis/)
*
* API:
*
* - [ChartsYAxis API](https://mui.com/x/api/charts/charts-y-axis/)
*/
function ChartsYAxis(inProps) {
	const { yAxis, yAxisIds } = useYAxes();
	const axis = yAxis[inProps.axisId ?? yAxisIds[0]];
	if (!axis) {
		warnOnce(`MUI X Charts: No axis found. The axisId "${inProps.axisId}" is probably invalid.`);
		return null;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsYAxisImpl, _extends({}, inProps, { axis }));
}
ChartsYAxis.propTypes = {
	axis: import_prop_types.default.oneOf(["y"]),
	axisId: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]),
	classes: import_prop_types.default.object,
	disableLine: import_prop_types.default.bool,
	disableTicks: import_prop_types.default.bool,
	label: import_prop_types.default.string,
	labelStyle: import_prop_types.default.object,
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
	tickSize: import_prop_types.default.number
};
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsAxis/ChartsAxis.js
/**
* Demos:
*
* - [Axis](https://mui.com/x/react-charts/axis/)
*
* API:
*
* - [ChartsAxis API](https://mui.com/x/api/charts/charts-axis/)
*/
function ChartsAxis(props) {
	const { slots, slotProps } = props;
	const { xAxisIds, xAxis } = useXAxes();
	const { yAxisIds, yAxis } = useYAxes();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [xAxisIds.map((axisId) => {
		if (!xAxis[axisId].position || xAxis[axisId].position === "none") return null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsXAxis, {
			slots,
			slotProps,
			axisId
		}, axisId);
	}), yAxisIds.map((axisId) => {
		if (!yAxis[axisId].position || yAxis[axisId].position === "none") return null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsYAxis, {
			slots,
			slotProps,
			axisId
		}, axisId);
	})] });
}
ChartsAxis.propTypes = {
	slotProps: import_prop_types.default.object,
	slots: import_prop_types.default.object
};
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsAxisHighlight/chartsAxisHighlightClasses.js
function getAxisHighlightUtilityClass(slot) {
	return generateUtilityClass("MuiChartsAxisHighlight", slot);
}
generateUtilityClasses("MuiChartsAxisHighlight", ["root"]);
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsAxisHighlight/ChartsAxisHighlightPath.js
var ChartsAxisHighlightPath = styled("path", {
	name: "MuiChartsAxisHighlight",
	slot: "Root"
})(({ theme }) => ({
	pointerEvents: "none",
	variants: [{
		props: { axisHighlight: "band" },
		style: _extends({
			fill: "white",
			fillOpacity: .1
		}, theme.applyStyles("light", { fill: "gray" }))
	}, {
		props: { axisHighlight: "line" },
		style: _extends({
			strokeDasharray: "5 2",
			stroke: "#ffffff"
		}, theme.applyStyles("light", { stroke: "#000000" }))
	}]
}));
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsAxisHighlight/ChartsYAxisHighlight.js
/**
* @ignore - internal component.
*/
function ChartsYHighlight(props) {
	const { type, classes } = props;
	const { left, width } = useDrawingArea();
	const store = useStore();
	const axisYValues = store.use(selectorChartsHighlightYAxisValue);
	const yAxes = store.use(selectorChartYAxis);
	if (axisYValues.length === 0) return null;
	return axisYValues.map(({ axisId, value }) => {
		const yScale = yAxes.axis[axisId].scale;
		const getYPosition = getValueToPositionMapper(yScale);
		const isYScaleOrdinal = type === "band" && value !== null && isOrdinalScale(yScale);
		if (isYScaleOrdinal && yScale(value) === void 0) console.error([
			`MUI X Charts: The position value provided for the axis is not valid for the current scale.`,
			`This probably means something is wrong with the data passed to the chart.`,
			`The ChartsAxisHighlight component will not be displayed.`
		].join("\n"));
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [isYScaleOrdinal && yScale(value) !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsAxisHighlightPath, {
			d: `M ${left} ${yScale(value) - (yScale.step() - yScale.bandwidth()) / 2} l 0 ${yScale.step()} l ${width} 0 l 0 ${-yScale.step()} Z`,
			className: classes.root,
			ownerState: { axisHighlight: "band" }
		}), type === "line" && value !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsAxisHighlightPath, {
			d: `M ${left} ${getYPosition(value)} L ${left + width} ${getYPosition(value)}`,
			className: classes.root,
			ownerState: { axisHighlight: "line" }
		})] }, `${axisId}-${value}`);
	});
}
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsAxisHighlight/ChartsXAxisHighlight.js
/**
* @ignore - internal component.
*/
function ChartsXHighlight(props) {
	const { type, classes } = props;
	const { top, height } = useDrawingArea();
	const store = useStore();
	const axisXValues = store.use(selectorChartsHighlightXAxisValue);
	const xAxes = store.use(selectorChartXAxis);
	if (axisXValues.length === 0) return null;
	return axisXValues.map(({ axisId, value }) => {
		const xScale = xAxes.axis[axisId].scale;
		const getXPosition = getValueToPositionMapper(xScale);
		const isXScaleOrdinal = type === "band" && value !== null && isOrdinalScale(xScale);
		if (isXScaleOrdinal && xScale(value) === void 0) console.error([
			`MUI X Charts: The position value provided for the axis is not valid for the current scale.`,
			`This probably means something is wrong with the data passed to the chart.`,
			`The ChartsAxisHighlight component will not be displayed.`
		].join("\n"));
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [isXScaleOrdinal && xScale(value) !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsAxisHighlightPath, {
			d: `M ${xScale(value) - (xScale.step() - xScale.bandwidth()) / 2} ${top} l ${xScale.step()} 0 l 0 ${height} l ${-xScale.step()} 0 Z`,
			className: classes.root,
			ownerState: { axisHighlight: "band" }
		}), type === "line" && value !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsAxisHighlightPath, {
			d: `M ${getXPosition(value)} ${top} L ${getXPosition(value)} ${top + height}`,
			className: classes.root,
			ownerState: { axisHighlight: "line" }
		})] }, `${axisId}-${value}`);
	});
}
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsAxisHighlight/ChartsAxisHighlight.js
var useUtilityClasses$1 = () => {
	return composeClasses({ root: ["root"] }, getAxisHighlightUtilityClass);
};
/**
* Demos:
*
* - [Custom components](https://mui.com/x/react-charts/components/)
*
* API:
*
* - [ChartsAxisHighlight API](https://mui.com/x/api/charts/charts-axis-highlight/)
*/
function ChartsAxisHighlight(props) {
	const { x: xAxisHighlight, y: yAxisHighlight } = props;
	const classes = useUtilityClasses$1();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [xAxisHighlight && xAxisHighlight !== "none" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsXHighlight, {
		type: xAxisHighlight,
		classes
	}), yAxisHighlight && yAxisHighlight !== "none" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsYHighlight, {
		type: yAxisHighlight,
		classes
	})] });
}
ChartsAxisHighlight.propTypes = {
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
};
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsClipPath/ChartsClipPath.js
/**
* API:
*
* - [ChartsClipPath API](https://mui.com/x/api/charts/charts-clip-path/)
*/
function ChartsClipPath(props) {
	const { id, offset: offsetProps } = props;
	const { left, top, width, height } = useDrawingArea();
	const offset = _extends({
		top: 0,
		right: 0,
		bottom: 0,
		left: 0
	}, offsetProps);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("clipPath", {
		id,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: left - offset.left,
			y: top - offset.top,
			width: width + offset.left + offset.right,
			height: height + offset.top + offset.bottom
		})
	});
}
ChartsClipPath.propTypes = {
	id: import_prop_types.default.string.isRequired,
	offset: import_prop_types.default.shape({
		bottom: import_prop_types.default.number,
		left: import_prop_types.default.number,
		right: import_prop_types.default.number,
		top: import_prop_types.default.number
	})
};
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsGrid/chartsGridClasses.js
function getChartsGridUtilityClass(slot) {
	return generateUtilityClass("MuiChartsGrid", slot);
}
var chartsGridClasses = generateUtilityClasses("MuiChartsGrid", [
	"root",
	"line",
	"horizontalLine",
	"verticalLine"
]);
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsGrid/styledComponents.js
var GridRoot = styled("g", {
	name: "MuiChartsGrid",
	slot: "Root",
	overridesResolver: (props, styles) => [
		{ [`&.${chartsGridClasses.verticalLine}`]: styles.verticalLine },
		{ [`&.${chartsGridClasses.horizontalLine}`]: styles.horizontalLine },
		styles.root
	]
})({});
var GridLine = styled("line", {
	name: "MuiChartsGrid",
	slot: "Line"
})(({ theme }) => ({
	stroke: (theme.vars || theme).palette.divider,
	shapeRendering: "crispEdges",
	strokeWidth: 1
}));
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsGrid/ChartsVerticalGrid.js
/**
* @ignore - internal component.
*/
function ChartsGridVertical(props) {
	const { instance } = useChartContext();
	const { axis, start, end, classes } = props;
	const { scale, tickNumber, tickInterval, tickSpacing } = axis;
	const xTicks = useTicks({
		scale,
		tickNumber,
		tickInterval,
		tickSpacing,
		direction: "x",
		ordinalTimeTicks: "ordinalTimeTicks" in axis ? axis.ordinalTimeTicks : void 0
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: xTicks.map(({ value, offset }) => !instance.isXInside(offset) ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GridLine, {
		y1: start,
		y2: end,
		x1: offset,
		x2: offset,
		className: classes.verticalLine
	}, `vertical-${value?.getTime?.() ?? value}`)) });
}
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsGrid/ChartsHorizontalGrid.js
/**
* @ignore - internal component.
*/
function ChartsGridHorizontal(props) {
	const { instance } = useChartContext();
	const { axis, start, end, classes } = props;
	const { scale, tickNumber, tickInterval, tickSpacing } = axis;
	const yTicks = useTicks({
		scale,
		tickNumber,
		tickInterval,
		tickSpacing,
		direction: "y",
		ordinalTimeTicks: "ordinalTimeTicks" in axis ? axis.ordinalTimeTicks : void 0
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: yTicks.map(({ value, offset }) => !instance.isYInside(offset) ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GridLine, {
		y1: offset,
		y2: offset,
		x1: start,
		x2: end,
		className: classes.horizontalLine
	}, `horizontal-${value?.getTime?.() ?? value}`)) });
}
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsGrid/ChartsGrid.js
var _excluded = ["vertical", "horizontal"];
var useUtilityClasses = ({ classes }) => {
	return composeClasses({
		root: ["root"],
		verticalLine: ["line", "verticalLine"],
		horizontalLine: ["line", "horizontalLine"]
	}, getChartsGridUtilityClass, classes);
};
/**
* Demos:
*
* - [Axis](https://mui.com/x/react-charts/axis/)
*
* API:
*
* - [ChartsGrid API](https://mui.com/x/api/charts/charts-axis/)
*/
function ChartsGrid(inProps) {
	const props = useThemeProps({
		props: inProps,
		name: "MuiChartsGrid"
	});
	const drawingArea = useDrawingArea();
	const { vertical, horizontal } = props, other = _objectWithoutPropertiesLoose(props, _excluded);
	const { xAxis, xAxisIds } = useXAxes();
	const { yAxis, yAxisIds } = useYAxes();
	const classes = useUtilityClasses(props);
	const horizontalAxis = yAxis[yAxisIds[0]];
	const verticalAxis = xAxis[xAxisIds[0]];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GridRoot, _extends({}, other, {
		className: classes.root,
		children: [vertical && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsGridVertical, {
			axis: verticalAxis,
			start: drawingArea.top,
			end: drawingArea.height + drawingArea.top,
			classes
		}), horizontal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsGridHorizontal, {
			axis: horizontalAxis,
			start: drawingArea.left,
			end: drawingArea.width + drawingArea.left,
			classes
		})]
	}));
}
ChartsGrid.propTypes = {
	classes: import_prop_types.default.object,
	horizontal: import_prop_types.default.bool,
	vertical: import_prop_types.default.bool
};
//#endregion
export { useInternalIsZoomInteracting as a, ChartsAxis as i, ChartsClipPath as n, getValueToPositionMapper as o, ChartsAxisHighlight as r, selectorChartsHighlightXAxisIndex as s, ChartsGrid as t };

//# sourceMappingURL=ChartsGrid-Ra5GowwI.js.map