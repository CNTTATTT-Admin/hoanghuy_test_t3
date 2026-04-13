import { n as __commonJSMin, r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { B as resolveProps, E as exactProp, H as shouldForwardProp, Q as require_jsx_runtime, S as useId, U as generateUtilityClass, a as identifier_default, dt as clsx, ft as require_prop_types, i as useTheme$1, it as _extends, q as useTheme, t as styled, z as useEnhancedEffect } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { d as useThemeProps, y as getThemeProps } from "./styles-2xPq3NO2.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
import { t as useForkRef } from "./useForkRef-D_V19Hay.js";
import { r as _objectWithoutPropertiesLoose } from "./TransitionGroupContext-CmouUOv0.js";
import { t as useEventCallback } from "./useEventCallback-DApYgXZO.js";
import { i as useLazyRef, r as useOnMount } from "./useTimeout-BLUJLZXi.js";
import { t as require_react_dom } from "./react-dom-CFkOm7QQ.js";
import { t as Typography } from "./Typography-CrsVQyni.js";
import { t as ownerWindow } from "./ownerWindow-C0KgEvKm.js";
import { n as HTMLElementType } from "./Portal-iqMkn9e7.js";
import { t as Popper } from "./Popper-Dh-RZ40H.js";
import { t as useSlotProps } from "./useSlotProps-CORw1pTM.js";
import { t as IconButton } from "./IconButton-8Pu1hMfn.js";
import { t as Button } from "./Button-BRiqHMr-.js";
//#region node_modules/@mui/system/esm/useMediaQuery/useMediaQuery.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
function useMediaQueryOld(query, defaultMatches, matchMedia, ssrMatchMedia, noSsr) {
	const [match, setMatch] = import_react.useState(() => {
		if (noSsr && matchMedia) return matchMedia(query).matches;
		if (ssrMatchMedia) return ssrMatchMedia(query).matches;
		return defaultMatches;
	});
	useEnhancedEffect(() => {
		if (!matchMedia) return;
		const queryList = matchMedia(query);
		const updateMatch = () => {
			setMatch(queryList.matches);
		};
		updateMatch();
		queryList.addEventListener("change", updateMatch);
		return () => {
			queryList.removeEventListener("change", updateMatch);
		};
	}, [query, matchMedia]);
	return match;
}
var maybeReactUseSyncExternalStore = { ...import_react }.useSyncExternalStore;
function useMediaQueryNew(query, defaultMatches, matchMedia, ssrMatchMedia, noSsr) {
	const getDefaultSnapshot = import_react.useCallback(() => defaultMatches, [defaultMatches]);
	const getServerSnapshot = import_react.useMemo(() => {
		if (noSsr && matchMedia) return () => matchMedia(query).matches;
		if (ssrMatchMedia !== null) {
			const { matches } = ssrMatchMedia(query);
			return () => matches;
		}
		return getDefaultSnapshot;
	}, [
		getDefaultSnapshot,
		query,
		ssrMatchMedia,
		noSsr,
		matchMedia
	]);
	const [getSnapshot, subscribe] = import_react.useMemo(() => {
		if (matchMedia === null) return [getDefaultSnapshot, () => () => {}];
		const mediaQueryList = matchMedia(query);
		return [() => mediaQueryList.matches, (notify) => {
			mediaQueryList.addEventListener("change", notify);
			return () => {
				mediaQueryList.removeEventListener("change", notify);
			};
		}];
	}, [
		getDefaultSnapshot,
		matchMedia,
		query
	]);
	return maybeReactUseSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
function unstable_createUseMediaQuery(params = {}) {
	const { themeId } = params;
	return function useMediaQuery(queryInput, options = {}) {
		let theme = useTheme();
		if (theme && themeId) theme = theme[themeId] || theme;
		const supportMatchMedia = typeof window !== "undefined" && typeof window.matchMedia !== "undefined";
		const { defaultMatches = false, matchMedia = supportMatchMedia ? window.matchMedia : null, ssrMatchMedia = null, noSsr = false } = getThemeProps({
			name: "MuiUseMediaQuery",
			props: options,
			theme
		});
		if (typeof queryInput === "function" && theme === null) console.error([
			"MUI: The `query` argument provided is invalid.",
			"You are providing a function without a theme in the context.",
			"One of the parent elements needs to use a ThemeProvider."
		].join("\n"));
		let query = typeof queryInput === "function" ? queryInput(theme) : queryInput;
		query = query.replace(/^@media( ?)/m, "");
		if (query.includes("print")) console.warn([
			`MUI: You have provided a \`print\` query to the \`useMediaQuery\` hook.`,
			"Using the print media query to modify print styles can lead to unexpected results.",
			"Consider using the `displayPrint` field in the `sx` prop instead.",
			"More information about `displayPrint` on our docs: https://mui.com/system/display/#display-in-print."
		].join("\n"));
		const match = (maybeReactUseSyncExternalStore !== void 0 ? useMediaQueryNew : useMediaQueryOld)(query, defaultMatches, matchMedia, ssrMatchMedia, noSsr);
		import_react.useDebugValue({
			query,
			match
		});
		return match;
	};
}
unstable_createUseMediaQuery();
var DEFAULT_ZOOM_SLIDER_SHOW_TOOLTIP = "hover";
/** Default margin for pie charts. */
var DEFAULT_PIE_CHART_MARGIN = {
	top: 5,
	bottom: 5,
	left: 5,
	right: 5
};
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsTooltip/chartsTooltipClasses.js
function getChartsTooltipUtilityClass(slot) {
	return generateUtilityClass("MuiChartsTooltip", slot);
}
var chartsTooltipClasses = generateUtilityClasses("MuiChartsTooltip", [
	"root",
	"paper",
	"table",
	"row",
	"cell",
	"mark",
	"markContainer",
	"labelCell",
	"valueCell",
	"axisValueCell"
]);
var useUtilityClasses$4 = (classes) => {
	return composeClasses({
		root: ["root"],
		paper: ["paper"],
		table: ["table"],
		row: ["row"],
		cell: ["cell"],
		mark: ["mark"],
		markContainer: ["markContainer"],
		labelCell: ["labelCell"],
		valueCell: ["valueCell"],
		axisValueCell: ["axisValueCell"]
	}, getChartsTooltipUtilityClass, classes);
};
//#endregion
//#region node_modules/reselect/dist/reselect.mjs
var runIdentityFunctionCheck = (resultFunc, inputSelectorsResults, outputSelectorResult) => {
	if (inputSelectorsResults.length === 1 && inputSelectorsResults[0] === outputSelectorResult) {
		let isInputSameAsOutput = false;
		try {
			const emptyObject = {};
			if (resultFunc(emptyObject) === emptyObject) isInputSameAsOutput = true;
		} catch {}
		if (isInputSameAsOutput) {
			let stack = void 0;
			try {
				throw new Error();
			} catch (e) {
				({stack} = e);
			}
			console.warn("The result function returned its own inputs without modification. e.g\n`createSelector([state => state.todos], todos => todos)`\nThis could lead to inefficient memoization and unnecessary re-renders.\nEnsure transformation logic is in the result function, and extraction logic is in the input selectors.", { stack });
		}
	}
};
var runInputStabilityCheck = (inputSelectorResultsObject, options, inputSelectorArgs) => {
	const { memoize, memoizeOptions } = options;
	const { inputSelectorResults, inputSelectorResultsCopy } = inputSelectorResultsObject;
	const createAnEmptyObject = memoize(() => ({}), ...memoizeOptions);
	if (!(createAnEmptyObject.apply(null, inputSelectorResults) === createAnEmptyObject.apply(null, inputSelectorResultsCopy))) {
		let stack = void 0;
		try {
			throw new Error();
		} catch (e) {
			({stack} = e);
		}
		console.warn("An input selector returned a different result when passed same arguments.\nThis means your output selector will likely run more frequently than intended.\nAvoid returning a new reference inside your input selector, e.g.\n`createSelector([state => state.todos.map(todo => todo.id)], todoIds => todoIds.length)`", {
			arguments: inputSelectorArgs,
			firstInputs: inputSelectorResults,
			secondInputs: inputSelectorResultsCopy,
			stack
		});
	}
};
var globalDevModeChecks = {
	inputStabilityCheck: "once",
	identityFunctionCheck: "once"
};
var NOT_FOUND = /* @__PURE__ */ Symbol("NOT_FOUND");
function assertIsFunction(func, errorMessage = `expected a function, instead received ${typeof func}`) {
	if (typeof func !== "function") throw new TypeError(errorMessage);
}
function assertIsObject(object, errorMessage = `expected an object, instead received ${typeof object}`) {
	if (typeof object !== "object") throw new TypeError(errorMessage);
}
function assertIsArrayOfFunctions(array, errorMessage = `expected all items to be functions, instead received the following types: `) {
	if (!array.every((item) => typeof item === "function")) {
		const itemTypes = array.map((item) => typeof item === "function" ? `function ${item.name || "unnamed"}()` : typeof item).join(", ");
		throw new TypeError(`${errorMessage}[${itemTypes}]`);
	}
}
var ensureIsArray = (item) => {
	return Array.isArray(item) ? item : [item];
};
function getDependencies(createSelectorArgs) {
	const dependencies = Array.isArray(createSelectorArgs[0]) ? createSelectorArgs[0] : createSelectorArgs;
	assertIsArrayOfFunctions(dependencies, `createSelector expects all input-selectors to be functions, but received the following types: `);
	return dependencies;
}
function collectInputSelectorResults(dependencies, inputSelectorArgs) {
	const inputSelectorResults = [];
	const { length } = dependencies;
	for (let i = 0; i < length; i++) inputSelectorResults.push(dependencies[i].apply(null, inputSelectorArgs));
	return inputSelectorResults;
}
var getDevModeChecksExecutionInfo = (firstRun, devModeChecks) => {
	const { identityFunctionCheck, inputStabilityCheck } = {
		...globalDevModeChecks,
		...devModeChecks
	};
	return {
		identityFunctionCheck: {
			shouldRun: identityFunctionCheck === "always" || identityFunctionCheck === "once" && firstRun,
			run: runIdentityFunctionCheck
		},
		inputStabilityCheck: {
			shouldRun: inputStabilityCheck === "always" || inputStabilityCheck === "once" && firstRun,
			run: runInputStabilityCheck
		}
	};
};
function createSingletonCache(equals) {
	let entry;
	return {
		get(key) {
			if (entry && equals(entry.key, key)) return entry.value;
			return NOT_FOUND;
		},
		put(key, value) {
			entry = {
				key,
				value
			};
		},
		getEntries() {
			return entry ? [entry] : [];
		},
		clear() {
			entry = void 0;
		}
	};
}
function createLruCache(maxSize, equals) {
	let entries = [];
	function get(key) {
		const cacheIndex = entries.findIndex((entry) => equals(key, entry.key));
		if (cacheIndex > -1) {
			const entry = entries[cacheIndex];
			if (cacheIndex > 0) {
				entries.splice(cacheIndex, 1);
				entries.unshift(entry);
			}
			return entry.value;
		}
		return NOT_FOUND;
	}
	function put(key, value) {
		if (get(key) === NOT_FOUND) {
			entries.unshift({
				key,
				value
			});
			if (entries.length > maxSize) entries.pop();
		}
	}
	function getEntries() {
		return entries;
	}
	function clear() {
		entries = [];
	}
	return {
		get,
		put,
		getEntries,
		clear
	};
}
var referenceEqualityCheck = (a, b) => a === b;
function createCacheKeyComparator(equalityCheck) {
	return function areArgumentsShallowlyEqual(prev, next) {
		if (prev === null || next === null || prev.length !== next.length) return false;
		const { length } = prev;
		for (let i = 0; i < length; i++) if (!equalityCheck(prev[i], next[i])) return false;
		return true;
	};
}
function lruMemoize(func, equalityCheckOrOptions) {
	const { equalityCheck = referenceEqualityCheck, maxSize = 1, resultEqualityCheck } = typeof equalityCheckOrOptions === "object" ? equalityCheckOrOptions : { equalityCheck: equalityCheckOrOptions };
	const comparator = createCacheKeyComparator(equalityCheck);
	let resultsCount = 0;
	const cache = maxSize <= 1 ? createSingletonCache(comparator) : createLruCache(maxSize, comparator);
	function memoized() {
		let value = cache.get(arguments);
		if (value === NOT_FOUND) {
			value = func.apply(null, arguments);
			resultsCount++;
			if (resultEqualityCheck) {
				const matchingEntry = cache.getEntries().find((entry) => resultEqualityCheck(entry.value, value));
				if (matchingEntry) {
					value = matchingEntry.value;
					resultsCount !== 0 && resultsCount--;
				}
			}
			cache.put(arguments, value);
		}
		return value;
	}
	memoized.clearCache = () => {
		cache.clear();
		memoized.resetResultsCount();
	};
	memoized.resultsCount = () => resultsCount;
	memoized.resetResultsCount = () => {
		resultsCount = 0;
	};
	return memoized;
}
var StrongRef = class {
	constructor(value) {
		this.value = value;
	}
	deref() {
		return this.value;
	}
};
var Ref = typeof WeakRef !== "undefined" ? WeakRef : StrongRef;
var UNTERMINATED = 0;
var TERMINATED = 1;
function createCacheNode() {
	return {
		s: UNTERMINATED,
		v: void 0,
		o: null,
		p: null
	};
}
function weakMapMemoize(func, options = {}) {
	let fnNode = createCacheNode();
	const { resultEqualityCheck } = options;
	let lastResult;
	let resultsCount = 0;
	function memoized() {
		let cacheNode = fnNode;
		const { length } = arguments;
		for (let i = 0, l = length; i < l; i++) {
			const arg = arguments[i];
			if (typeof arg === "function" || typeof arg === "object" && arg !== null) {
				let objectCache = cacheNode.o;
				if (objectCache === null) cacheNode.o = objectCache = /* @__PURE__ */ new WeakMap();
				const objectNode = objectCache.get(arg);
				if (objectNode === void 0) {
					cacheNode = createCacheNode();
					objectCache.set(arg, cacheNode);
				} else cacheNode = objectNode;
			} else {
				let primitiveCache = cacheNode.p;
				if (primitiveCache === null) cacheNode.p = primitiveCache = /* @__PURE__ */ new Map();
				const primitiveNode = primitiveCache.get(arg);
				if (primitiveNode === void 0) {
					cacheNode = createCacheNode();
					primitiveCache.set(arg, cacheNode);
				} else cacheNode = primitiveNode;
			}
		}
		const terminatedNode = cacheNode;
		let result;
		if (cacheNode.s === TERMINATED) result = cacheNode.v;
		else {
			result = func.apply(null, arguments);
			resultsCount++;
			if (resultEqualityCheck) {
				const lastResultValue = lastResult?.deref?.() ?? lastResult;
				if (lastResultValue != null && resultEqualityCheck(lastResultValue, result)) {
					result = lastResultValue;
					resultsCount !== 0 && resultsCount--;
				}
				lastResult = typeof result === "object" && result !== null || typeof result === "function" ? new Ref(result) : result;
			}
		}
		terminatedNode.s = TERMINATED;
		terminatedNode.v = result;
		return result;
	}
	memoized.clearCache = () => {
		fnNode = createCacheNode();
		memoized.resetResultsCount();
	};
	memoized.resultsCount = () => resultsCount;
	memoized.resetResultsCount = () => {
		resultsCount = 0;
	};
	return memoized;
}
function createSelectorCreator(memoizeOrOptions, ...memoizeOptionsFromArgs) {
	const createSelectorCreatorOptions = typeof memoizeOrOptions === "function" ? {
		memoize: memoizeOrOptions,
		memoizeOptions: memoizeOptionsFromArgs
	} : memoizeOrOptions;
	const createSelector2 = (...createSelectorArgs) => {
		let recomputations = 0;
		let dependencyRecomputations = 0;
		let lastResult;
		let directlyPassedOptions = {};
		let resultFunc = createSelectorArgs.pop();
		if (typeof resultFunc === "object") {
			directlyPassedOptions = resultFunc;
			resultFunc = createSelectorArgs.pop();
		}
		assertIsFunction(resultFunc, `createSelector expects an output function after the inputs, but received: [${typeof resultFunc}]`);
		const { memoize, memoizeOptions = [], argsMemoize = weakMapMemoize, argsMemoizeOptions = [], devModeChecks = {} } = {
			...createSelectorCreatorOptions,
			...directlyPassedOptions
		};
		const finalMemoizeOptions = ensureIsArray(memoizeOptions);
		const finalArgsMemoizeOptions = ensureIsArray(argsMemoizeOptions);
		const dependencies = getDependencies(createSelectorArgs);
		const memoizedResultFunc = memoize(function recomputationWrapper() {
			recomputations++;
			return resultFunc.apply(null, arguments);
		}, ...finalMemoizeOptions);
		let firstRun = true;
		const selector = argsMemoize(function dependenciesChecker() {
			dependencyRecomputations++;
			const inputSelectorResults = collectInputSelectorResults(dependencies, arguments);
			lastResult = memoizedResultFunc.apply(null, inputSelectorResults);
			{
				const { identityFunctionCheck, inputStabilityCheck } = getDevModeChecksExecutionInfo(firstRun, devModeChecks);
				if (identityFunctionCheck.shouldRun) identityFunctionCheck.run(resultFunc, inputSelectorResults, lastResult);
				if (inputStabilityCheck.shouldRun) {
					const inputSelectorResultsCopy = collectInputSelectorResults(dependencies, arguments);
					inputStabilityCheck.run({
						inputSelectorResults,
						inputSelectorResultsCopy
					}, {
						memoize,
						memoizeOptions: finalMemoizeOptions
					}, arguments);
				}
				if (firstRun) firstRun = false;
			}
			return lastResult;
		}, ...finalArgsMemoizeOptions);
		return Object.assign(selector, {
			resultFunc,
			memoizedResultFunc,
			dependencies,
			dependencyRecomputations: () => dependencyRecomputations,
			resetDependencyRecomputations: () => {
				dependencyRecomputations = 0;
			},
			lastResult: () => lastResult,
			recomputations: () => recomputations,
			resetRecomputations: () => {
				recomputations = 0;
			},
			memoize,
			argsMemoize
		});
	};
	Object.assign(createSelector2, { withTypes: () => createSelector2 });
	return createSelector2;
}
var createSelector$1 = /* @__PURE__ */ createSelectorCreator(weakMapMemoize);
var createStructuredSelector = Object.assign((inputSelectorsObject, selectorCreator = createSelector$1) => {
	assertIsObject(inputSelectorsObject, `createStructuredSelector expects first argument to be an object where each property is a selector, instead received a ${typeof inputSelectorsObject}`);
	const inputSelectorKeys = Object.keys(inputSelectorsObject);
	return selectorCreator(inputSelectorKeys.map((key) => inputSelectorsObject[key]), (...inputSelectorResults) => {
		return inputSelectorResults.reduce((composition, value, index) => {
			composition[inputSelectorKeys[index]] = value;
			return composition;
		}, {});
	});
}, { withTypes: () => createStructuredSelector });
//#endregion
//#region node_modules/@mui/x-internals/esm/store/createSelector.js
var reselectCreateSelector = createSelectorCreator({
	memoize: lruMemoize,
	memoizeOptions: {
		maxSize: 1,
		equalityCheck: Object.is
	}
});
var createSelector = (a, b, c, d, e, f, g, h, ...other) => {
	if (other.length > 0) throw new Error("Unsupported number of selectors");
	let selector;
	if (a && b && c && d && e && f && g && h) selector = (state, a1, a2, a3) => {
		return h(a(state, a1, a2, a3), b(state, a1, a2, a3), c(state, a1, a2, a3), d(state, a1, a2, a3), e(state, a1, a2, a3), f(state, a1, a2, a3), g(state, a1, a2, a3), a1, a2, a3);
	};
	else if (a && b && c && d && e && f && g) selector = (state, a1, a2, a3) => {
		return g(a(state, a1, a2, a3), b(state, a1, a2, a3), c(state, a1, a2, a3), d(state, a1, a2, a3), e(state, a1, a2, a3), f(state, a1, a2, a3), a1, a2, a3);
	};
	else if (a && b && c && d && e && f) selector = (state, a1, a2, a3) => {
		return f(a(state, a1, a2, a3), b(state, a1, a2, a3), c(state, a1, a2, a3), d(state, a1, a2, a3), e(state, a1, a2, a3), a1, a2, a3);
	};
	else if (a && b && c && d && e) selector = (state, a1, a2, a3) => {
		return e(a(state, a1, a2, a3), b(state, a1, a2, a3), c(state, a1, a2, a3), d(state, a1, a2, a3), a1, a2, a3);
	};
	else if (a && b && c && d) selector = (state, a1, a2, a3) => {
		return d(a(state, a1, a2, a3), b(state, a1, a2, a3), c(state, a1, a2, a3), a1, a2, a3);
	};
	else if (a && b && c) selector = (state, a1, a2, a3) => {
		return c(a(state, a1, a2, a3), b(state, a1, a2, a3), a1, a2, a3);
	};
	else if (a && b) selector = (state, a1, a2, a3) => {
		return b(a(state, a1, a2, a3), a1, a2, a3);
	};
	else if (a) selector = a;
	else throw new Error("Missing arguments");
	return selector;
};
var createSelectorMemoizedWithOptions = (options) => (...inputs) => {
	const cache = /* @__PURE__ */ new WeakMap();
	let nextCacheId = 1;
	const combiner = inputs[inputs.length - 1];
	const nSelectors = inputs.length - 1 || 1;
	const argsLength = Math.max(combiner.length - nSelectors, 0);
	if (argsLength > 3) throw new Error("Unsupported number of arguments");
	const selector = (state, a1, a2, a3) => {
		let cacheKey = state.__cacheKey__;
		if (!cacheKey) {
			cacheKey = { id: nextCacheId };
			state.__cacheKey__ = cacheKey;
			nextCacheId += 1;
		}
		let fn = cache.get(cacheKey);
		if (!fn) {
			const selectors = inputs.length === 1 ? [(x) => x, combiner] : inputs;
			let reselectArgs = inputs;
			const selectorArgs = [
				void 0,
				void 0,
				void 0
			];
			switch (argsLength) {
				case 0: break;
				case 1:
					reselectArgs = [
						...selectors.slice(0, -1),
						() => selectorArgs[0],
						combiner
					];
					break;
				case 2:
					reselectArgs = [
						...selectors.slice(0, -1),
						() => selectorArgs[0],
						() => selectorArgs[1],
						combiner
					];
					break;
				case 3:
					reselectArgs = [
						...selectors.slice(0, -1),
						() => selectorArgs[0],
						() => selectorArgs[1],
						() => selectorArgs[2],
						combiner
					];
					break;
				default: throw new Error("Unsupported number of arguments");
			}
			if (options) reselectArgs = [...reselectArgs, options];
			fn = reselectCreateSelector(...reselectArgs);
			fn.selectorArgs = selectorArgs;
			cache.set(cacheKey, fn);
		}
		switch (argsLength) {
			case 3: fn.selectorArgs[2] = a3;
			case 2: fn.selectorArgs[1] = a2;
			case 1: fn.selectorArgs[0] = a1;
			default:
		}
		switch (argsLength) {
			case 0: return fn(state);
			case 1: return fn(state, a1);
			case 2: return fn(state, a1, a2);
			case 3: return fn(state, a1, a2, a3);
			default: throw new Error("unreachable");
		}
	};
	return selector;
};
var createSelectorMemoized = createSelectorMemoizedWithOptions();
//#endregion
//#region node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js
/**
* @license React
* use-sync-external-store-shim.development.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_use_sync_external_store_shim_development = /* @__PURE__ */ __commonJSMin(((exports) => {
	(function() {
		function is(x, y) {
			return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
		}
		function useSyncExternalStore$2(subscribe, getSnapshot) {
			didWarnOld18Alpha || void 0 === React.startTransition || (didWarnOld18Alpha = !0, console.error("You are using an outdated, pre-release alpha of React 18 that does not support useSyncExternalStore. The use-sync-external-store shim will not work correctly. Upgrade to a newer pre-release."));
			var value = getSnapshot();
			if (!didWarnUncachedGetSnapshot) {
				var cachedValue = getSnapshot();
				objectIs(value, cachedValue) || (console.error("The result of getSnapshot should be cached to avoid an infinite loop"), didWarnUncachedGetSnapshot = !0);
			}
			cachedValue = useState({ inst: {
				value,
				getSnapshot
			} });
			var inst = cachedValue[0].inst, forceUpdate = cachedValue[1];
			useLayoutEffect(function() {
				inst.value = value;
				inst.getSnapshot = getSnapshot;
				checkIfSnapshotChanged(inst) && forceUpdate({ inst });
			}, [
				subscribe,
				value,
				getSnapshot
			]);
			useEffect(function() {
				checkIfSnapshotChanged(inst) && forceUpdate({ inst });
				return subscribe(function() {
					checkIfSnapshotChanged(inst) && forceUpdate({ inst });
				});
			}, [subscribe]);
			useDebugValue(value);
			return value;
		}
		function checkIfSnapshotChanged(inst) {
			var latestGetSnapshot = inst.getSnapshot;
			inst = inst.value;
			try {
				var nextValue = latestGetSnapshot();
				return !objectIs(inst, nextValue);
			} catch (error) {
				return !0;
			}
		}
		function useSyncExternalStore$1(subscribe, getSnapshot) {
			return getSnapshot();
		}
		"undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
		var React = require_react(), objectIs = "function" === typeof Object.is ? Object.is : is, useState = React.useState, useEffect = React.useEffect, useLayoutEffect = React.useLayoutEffect, useDebugValue = React.useDebugValue, didWarnOld18Alpha = !1, didWarnUncachedGetSnapshot = !1, shim = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? useSyncExternalStore$1 : useSyncExternalStore$2;
		exports.useSyncExternalStore = void 0 !== React.useSyncExternalStore ? React.useSyncExternalStore : shim;
		"undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
	})();
}));
//#endregion
//#region node_modules/use-sync-external-store/shim/index.js
var require_shim = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_use_sync_external_store_shim_development();
}));
//#endregion
//#region node_modules/use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.development.js
/**
* @license React
* use-sync-external-store-shim/with-selector.development.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_with_selector_development = /* @__PURE__ */ __commonJSMin(((exports) => {
	(function() {
		function is(x, y) {
			return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
		}
		"undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
		var React = require_react(), shim = require_shim(), objectIs = "function" === typeof Object.is ? Object.is : is, useSyncExternalStore = shim.useSyncExternalStore, useRef = React.useRef, useEffect = React.useEffect, useMemo = React.useMemo, useDebugValue = React.useDebugValue;
		exports.useSyncExternalStoreWithSelector = function(subscribe, getSnapshot, getServerSnapshot, selector, isEqual) {
			var instRef = useRef(null);
			if (null === instRef.current) {
				var inst = {
					hasValue: !1,
					value: null
				};
				instRef.current = inst;
			} else inst = instRef.current;
			instRef = useMemo(function() {
				function memoizedSelector(nextSnapshot) {
					if (!hasMemo) {
						hasMemo = !0;
						memoizedSnapshot = nextSnapshot;
						nextSnapshot = selector(nextSnapshot);
						if (void 0 !== isEqual && inst.hasValue) {
							var currentSelection = inst.value;
							if (isEqual(currentSelection, nextSnapshot)) return memoizedSelection = currentSelection;
						}
						return memoizedSelection = nextSnapshot;
					}
					currentSelection = memoizedSelection;
					if (objectIs(memoizedSnapshot, nextSnapshot)) return currentSelection;
					var nextSelection = selector(nextSnapshot);
					if (void 0 !== isEqual && isEqual(currentSelection, nextSelection)) return memoizedSnapshot = nextSnapshot, currentSelection;
					memoizedSnapshot = nextSnapshot;
					return memoizedSelection = nextSelection;
				}
				var hasMemo = !1, memoizedSnapshot, memoizedSelection, maybeGetServerSnapshot = void 0 === getServerSnapshot ? null : getServerSnapshot;
				return [function() {
					return memoizedSelector(getSnapshot());
				}, null === maybeGetServerSnapshot ? void 0 : function() {
					return memoizedSelector(maybeGetServerSnapshot());
				}];
			}, [
				getSnapshot,
				getServerSnapshot,
				selector,
				isEqual
			]);
			var value = useSyncExternalStore(subscribe, instRef[0], instRef[1]);
			useEffect(function() {
				inst.hasValue = !0;
				inst.value = value;
			}, [value]);
			useDebugValue(value);
			return value;
		};
		"undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
	})();
}));
//#endregion
//#region node_modules/use-sync-external-store/shim/with-selector.js
var require_with_selector = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_with_selector_development();
}));
//#endregion
//#region node_modules/@mui/x-internals/esm/reactMajor/index.js
var reactMajor_default = parseInt("19.2.4", 10);
//#endregion
//#region node_modules/@mui/x-internals/esm/store/useStore.js
var import_shim = require_shim();
var import_with_selector = require_with_selector();
var useStoreImplementation = reactMajor_default >= 19 ? useStoreR19 : useStoreLegacy;
function useStore$1(store, selector, a1, a2, a3) {
	return useStoreImplementation(store, selector, a1, a2, a3);
}
function useStoreR19(store, selector, a1, a2, a3) {
	const getSelection = import_react.useCallback(() => selector(store.getSnapshot(), a1, a2, a3), [
		store,
		selector,
		a1,
		a2,
		a3
	]);
	return (0, import_shim.useSyncExternalStore)(store.subscribe, getSelection, getSelection);
}
function useStoreLegacy(store, selector, a1, a2, a3) {
	return (0, import_with_selector.useSyncExternalStoreWithSelector)(store.subscribe, store.getSnapshot, store.getSnapshot, (state) => selector(state, a1, a2, a3));
}
//#endregion
//#region node_modules/@mui/x-internals/esm/store/useStoreEffect.js
var noop = () => {};
/**
* An Effect implementation for the Store. This should be used for side-effects only. To
* compute and store derived state, use `createSelectorMemoized` instead.
*/
function useStoreEffect(store, selector, effect) {
	const instance = useLazyRef(initialize, {
		store,
		selector
	}).current;
	instance.effect = effect;
	useOnMount(instance.onMount);
}
function initialize(params) {
	const { store, selector } = params;
	let previousState = selector(store.state);
	const instance = {
		effect: noop,
		dispose: null,
		subscribe: () => {
			instance.dispose ??= store.subscribe((state) => {
				const nextState = selector(state);
				if (!Object.is(previousState, nextState)) {
					const prev = previousState;
					previousState = nextState;
					instance.effect(prev, nextState);
				}
			});
		},
		onMount: () => {
			instance.subscribe();
			return () => {
				instance.dispose?.();
				instance.dispose = null;
			};
		}
	};
	instance.subscribe();
	return instance;
}
//#endregion
//#region node_modules/@mui/x-internals/esm/store/Store.js
var Store = class Store {
	static create(state) {
		return new Store(state);
	}
	constructor(state) {
		this.state = state;
		this.listeners = /* @__PURE__ */ new Set();
		this.updateTick = 0;
	}
	subscribe = (fn) => {
		this.listeners.add(fn);
		return () => {
			this.listeners.delete(fn);
		};
	};
	/**
	* Returns the current state snapshot. Meant for usage with `useSyncExternalStore`.
	* If you want to access the state, use the `state` property instead.
	*/
	getSnapshot = () => {
		return this.state;
	};
	setState(newState) {
		this.state = newState;
		this.updateTick += 1;
		const currentTick = this.updateTick;
		const it = this.listeners.values();
		let result;
		while (result = it.next(), !result.done) {
			if (currentTick !== this.updateTick) return;
			const listener = result.value;
			listener(newState);
		}
	}
	update(changes) {
		for (const key in changes) if (!Object.is(this.state[key], changes[key])) {
			this.setState(_extends({}, this.state, changes));
			return;
		}
	}
	set(key, value) {
		if (!Object.is(this.state[key], value)) this.setState(_extends({}, this.state, { [key]: value }));
	}
	use = (selector, a1, a2, a3) => {
		return useStore$1(this, selector, a1, a2, a3);
	};
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/corePlugins/useChartAnimation/useChartAnimation.js
var useChartAnimation = ({ params, store }) => {
	import_react.useEffect(() => {
		store.set("animation", _extends({}, store.state.animation, { skip: params.skipAnimation }));
	}, [store, params.skipAnimation]);
	const disableAnimation = import_react.useCallback(() => {
		let disableCalled = false;
		store.set("animation", _extends({}, store.state.animation, { skipAnimationRequests: store.state.animation.skipAnimationRequests + 1 }));
		return () => {
			if (disableCalled) return;
			disableCalled = true;
			store.set("animation", _extends({}, store.state.animation, { skipAnimationRequests: store.state.animation.skipAnimationRequests - 1 }));
		};
	}, [store]);
	useEnhancedEffect(() => {
		if (typeof window === "undefined" || !window?.matchMedia) return;
		let disableAnimationCleanup;
		const handleMediaChange = (event) => {
			if (event.matches) disableAnimationCleanup = disableAnimation();
			else disableAnimationCleanup?.();
		};
		const mql = window.matchMedia("(prefers-reduced-motion)");
		handleMediaChange(mql);
		mql.addEventListener("change", handleMediaChange);
		return () => {
			mql.removeEventListener("change", handleMediaChange);
		};
	}, [disableAnimation, store]);
	return { instance: { disableAnimation } };
};
useChartAnimation.params = { skipAnimation: true };
useChartAnimation.getDefaultizedParams = ({ params }) => _extends({}, params, { skipAnimation: params.skipAnimation ?? false });
useChartAnimation.getInitialState = ({ skipAnimation }) => {
	typeof window === "undefined" || window?.matchMedia;
	return { animation: {
		skip: skipAnimation,
		skipAnimationRequests: 0
	} };
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/corePlugins/useChartAnimation/useChartAnimation.selectors.js
var selectorChartAnimationState = (state) => state.animation;
var selectorChartSkipAnimation = createSelector(selectorChartAnimationState, (state) => state.skip || state.skipAnimationRequests > 0);
//#endregion
//#region node_modules/@mui/x-internals/esm/useEffectAfterFirstRender/useEffectAfterFirstRender.js
/**
* Run an effect only after the first render.
*
* @param effect The effect to run after the first render
* @param deps The dependencies for the effect
*/
function useEffectAfterFirstRender(effect, deps) {
	const isFirstRender = import_react.useRef(true);
	import_react.useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		return effect();
	}, deps);
}
//#endregion
//#region node_modules/@mui/x-charts/esm/constants/index.js
var DEFAULT_X_AXIS_KEY = "DEFAULT_X_AXIS_KEY";
var DEFAULT_Y_AXIS_KEY = "DEFAULT_Y_AXIS_KEY";
var DEFAULT_MARGINS = {
	top: 20,
	bottom: 20,
	left: 20,
	right: 20
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartCartesianAxis/useChartCartesianAxisLayout.selectors.js
var selectorChartRawXAxis = (state) => state.cartesianAxis?.x;
var selectorChartRawYAxis = (state) => state.cartesianAxis?.y;
var selectorChartAxisSizes = createSelectorMemoized(createSelector(selectorChartRawYAxis, function selectorChartLeftAxisSize(yAxis) {
	return (yAxis ?? []).reduce((acc, axis) => axis.position === "left" ? acc + (axis.width || 0) + (axis.zoom?.slider.enabled ? axis.zoom.slider.size : 0) : acc, 0);
}), createSelector(selectorChartRawYAxis, function selectorChartRightAxisSize(yAxis) {
	return (yAxis ?? []).reduce((acc, axis) => axis.position === "right" ? acc + (axis.width || 0) + (axis.zoom?.slider.enabled ? axis.zoom.slider.size : 0) : acc, 0);
}), createSelector(selectorChartRawXAxis, function selectorChartTopAxisSize(xAxis) {
	return (xAxis ?? []).reduce((acc, axis) => axis.position === "top" ? acc + (axis.height || 0) + (axis.zoom?.slider.enabled ? axis.zoom.slider.size : 0) : acc, 0);
}), createSelector(selectorChartRawXAxis, function selectorChartBottomAxisSize(xAxis) {
	return (xAxis ?? []).reduce((acc, axis) => axis.position === "bottom" ? acc + (axis.height || 0) + (axis.zoom?.slider.enabled ? axis.zoom.slider.size : 0) : acc, 0);
}), function selectorChartAxisSizes(left, right, top, bottom) {
	return {
		left,
		right,
		top,
		bottom
	};
});
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/corePlugins/useChartDimensions/useChartDimensions.selectors.js
var selectorChartDimensionsState = (state) => state.dimensions;
var selectorChartMargin = (state) => state.dimensions.margin;
var selectorChartDrawingArea = createSelectorMemoized(selectorChartDimensionsState, selectorChartMargin, selectorChartAxisSizes, function selectorChartDrawingArea({ width, height }, { top: marginTop, right: marginRight, bottom: marginBottom, left: marginLeft }, { left: axisSizeLeft, right: axisSizeRight, top: axisSizeTop, bottom: axisSizeBottom }) {
	return {
		width: width - marginLeft - marginRight - axisSizeLeft - axisSizeRight,
		left: marginLeft + axisSizeLeft,
		right: marginRight + axisSizeRight,
		height: height - marginTop - marginBottom - axisSizeTop - axisSizeBottom,
		top: marginTop + axisSizeTop,
		bottom: marginBottom + axisSizeBottom
	};
});
var selectorChartSvgWidth = createSelector(selectorChartDimensionsState, (dimensionsState) => dimensionsState.width);
var selectorChartSvgHeight = createSelector(selectorChartDimensionsState, (dimensionsState) => dimensionsState.height);
var selectorChartPropsWidth = createSelector(selectorChartDimensionsState, (dimensionsState) => dimensionsState.propsWidth);
var selectorChartPropsHeight = createSelector(selectorChartDimensionsState, (dimensionsState) => dimensionsState.propsHeight);
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/defaultizeMargin.js
function defaultizeMargin(input, defaultMargin) {
	if (typeof input === "number") return {
		top: input,
		bottom: input,
		left: input,
		right: input
	};
	if (defaultMargin) return _extends({}, defaultMargin, input);
	return input;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/corePlugins/useChartDimensions/useChartDimensions.js
var MAX_COMPUTE_RUN = 10;
var useChartDimensions = ({ params, store, svgRef }) => {
	const hasInSize = params.width !== void 0 && params.height !== void 0;
	const stateRef = import_react.useRef({
		displayError: false,
		initialCompute: true,
		computeRun: 0
	});
	const [innerWidth, setInnerWidth] = import_react.useState(0);
	const [innerHeight, setInnerHeight] = import_react.useState(0);
	const computeSize = import_react.useCallback(() => {
		const mainEl = svgRef?.current;
		if (!mainEl) return {};
		const computedStyle = ownerWindow(mainEl).getComputedStyle(mainEl);
		const newHeight = Math.floor(parseFloat(computedStyle.height)) || 0;
		const newWidth = Math.floor(parseFloat(computedStyle.width)) || 0;
		if (store.state.dimensions.width !== newWidth || store.state.dimensions.height !== newHeight) store.set("dimensions", {
			margin: {
				top: params.margin.top,
				right: params.margin.right,
				bottom: params.margin.bottom,
				left: params.margin.left
			},
			width: params.width ?? newWidth,
			height: params.height ?? newHeight,
			propsWidth: params.width,
			propsHeight: params.height
		});
		return {
			height: newHeight,
			width: newWidth
		};
	}, [
		store,
		svgRef,
		params.height,
		params.width,
		params.margin.left,
		params.margin.right,
		params.margin.top,
		params.margin.bottom
	]);
	useEffectAfterFirstRender(() => {
		const width = params.width ?? store.state.dimensions.width;
		const height = params.height ?? store.state.dimensions.height;
		store.set("dimensions", {
			margin: {
				top: params.margin.top,
				right: params.margin.right,
				bottom: params.margin.bottom,
				left: params.margin.left
			},
			width,
			height,
			propsHeight: params.height,
			propsWidth: params.width
		});
	}, [
		store,
		params.height,
		params.width,
		params.margin.left,
		params.margin.right,
		params.margin.top,
		params.margin.bottom
	]);
	import_react.useEffect(() => {
		stateRef.current.displayError = true;
	}, []);
	useEnhancedEffect(() => {
		if (hasInSize || !stateRef.current.initialCompute || stateRef.current.computeRun > MAX_COMPUTE_RUN) return;
		const computedSize = computeSize();
		if (computedSize.width !== innerWidth || computedSize.height !== innerHeight) {
			stateRef.current.computeRun += 1;
			if (computedSize.width !== void 0) setInnerWidth(computedSize.width);
			if (computedSize.height !== void 0) setInnerHeight(computedSize.height);
		} else if (stateRef.current.initialCompute) stateRef.current.initialCompute = false;
	}, [
		innerHeight,
		innerWidth,
		computeSize,
		hasInSize
	]);
	useEnhancedEffect(() => {
		if (hasInSize) return () => {};
		computeSize();
		const elementToObserve = svgRef.current;
		if (typeof ResizeObserver === "undefined") return () => {};
		let animationFrame;
		const observer = new ResizeObserver(() => {
			animationFrame = requestAnimationFrame(() => {
				computeSize();
			});
		});
		if (elementToObserve) observer.observe(elementToObserve);
		return () => {
			if (animationFrame) cancelAnimationFrame(animationFrame);
			if (elementToObserve) observer.unobserve(elementToObserve);
		};
	}, [
		computeSize,
		hasInSize,
		svgRef
	]);
	if (stateRef.current.displayError && params.width === void 0 && innerWidth === 0) {
		console.error(`MUI X Charts: ChartContainer does not have \`width\` prop, and its container has no \`width\` defined.`);
		stateRef.current.displayError = false;
	}
	if (stateRef.current.displayError && params.height === void 0 && innerHeight === 0) {
		console.error(`MUI X Charts: ChartContainer does not have \`height\` prop, and its container has no \`height\` defined.`);
		stateRef.current.displayError = false;
	}
	const drawingArea = store.use(selectorChartDrawingArea);
	const isXInside = import_react.useCallback((x) => x >= drawingArea.left - 1 && x <= drawingArea.left + drawingArea.width, [drawingArea.left, drawingArea.width]);
	const isYInside = import_react.useCallback((y) => y >= drawingArea.top - 1 && y <= drawingArea.top + drawingArea.height, [drawingArea.height, drawingArea.top]);
	return { instance: {
		isPointInside: import_react.useCallback((x, y, targetElement) => {
			if (targetElement && "closest" in targetElement && targetElement.closest("[data-drawing-container]")) return true;
			return isXInside(x) && isYInside(y);
		}, [isXInside, isYInside]),
		isXInside,
		isYInside
	} };
};
useChartDimensions.params = {
	width: true,
	height: true,
	margin: true
};
useChartDimensions.getDefaultizedParams = ({ params }) => _extends({}, params, { margin: defaultizeMargin(params.margin, DEFAULT_MARGINS) });
useChartDimensions.getInitialState = ({ width, height, margin }) => {
	return { dimensions: {
		margin,
		width: width ?? 0,
		height: height ?? 0,
		propsWidth: width,
		propsHeight: height
	} };
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/corePlugins/useChartExperimentalFeature/useChartExperimentalFeature.js
var useChartExperimentalFeatures = ({ params, store }) => {
	useEnhancedEffect(() => {
		store.set("experimentalFeatures", params.experimentalFeatures);
	}, [store, params.experimentalFeatures]);
	return {};
};
useChartExperimentalFeatures.params = { experimentalFeatures: true };
useChartExperimentalFeatures.getInitialState = ({ experimentalFeatures }) => {
	return { experimentalFeatures };
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/corePlugins/useChartExperimentalFeature/useChartExperimentalFeature.selectors.js
var selectorChartExperimentalFeaturesState = (state) => state.experimentalFeatures;
var selectorPreferStrictDomainInLineCharts = createSelector(selectorChartExperimentalFeaturesState, (features) => Boolean(features?.preferStrictDomainInLineCharts));
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/corePlugins/useChartId/useChartId.utils.js
var globalChartDefaultId = 0;
var createChartDefaultId = () => {
	globalChartDefaultId += 1;
	return `mui-chart-${globalChartDefaultId}`;
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/corePlugins/useChartId/useChartId.js
var useChartId$1 = ({ params, store }) => {
	import_react.useEffect(() => {
		if (params.id === void 0 || params.id === store.state.id.providedChartId && store.state.id.chartId !== void 0) return;
		store.set("id", _extends({}, store.state.id, { chartId: params.id ?? createChartDefaultId() }));
	}, [store, params.id]);
	return {};
};
useChartId$1.params = { id: true };
useChartId$1.getInitialState = ({ id }) => ({ id: {
	chartId: id,
	providedChartId: id
} });
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/corePlugins/useChartId/useChartId.selectors.js
var selectorChartIdState = (state) => state.id;
/**
* Get the id attribute of the chart.
* @param {ChartState<[UseChartIdSignature]>} state The state of the chart.
* @returns {string} The id attribute of the chart.
*/
var selectorChartId = createSelector(selectorChartIdState, (idState) => idState.chartId);
//#endregion
//#region node_modules/@mui/x-charts/esm/colorPalettes/categorical/rainbowSurge.js
var rainbowSurgePaletteLight = [
	"#4254FB",
	"#FFB422",
	"#FA4F58",
	"#0DBEFF",
	"#22BF75",
	"#FA83B4",
	"#FF7511"
];
var rainbowSurgePaletteDark = [
	"#495AFB",
	"#FFC758",
	"#F35865",
	"#30C8FF",
	"#44CE8D",
	"#F286B3",
	"#FF8C39"
];
var rainbowSurgePalette = (mode) => mode === "dark" ? rainbowSurgePaletteDark : rainbowSurgePaletteLight;
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/corePlugins/useChartSeries/processSeries.js
/**
* This method groups series by type and adds defaultized values such as the ids and colors.
* It does NOT apply the series processors - that happens in a selector.
* @param series The array of series provided by the developer
* @param colors The color palette used to defaultize series colors
* @returns An object structuring all the series by type with default values.
*/
var defaultizeSeries = ({ series, colors, seriesConfig }) => {
	const seriesGroups = {};
	series.forEach((seriesData, seriesIndex) => {
		const seriesWithDefaultValues = seriesConfig[seriesData.type].getSeriesWithDefaultValues(seriesData, seriesIndex, colors);
		const id = seriesWithDefaultValues.id;
		if (seriesGroups[seriesData.type] === void 0) seriesGroups[seriesData.type] = {
			series: {},
			seriesOrder: []
		};
		if (seriesGroups[seriesData.type]?.series[id] !== void 0) throw new Error(`MUI X Charts: series' id "${id}" is not unique.`);
		seriesGroups[seriesData.type].series[id] = seriesWithDefaultValues;
		seriesGroups[seriesData.type].seriesOrder.push(id);
	});
	return seriesGroups;
};
/**
* Applies series processors to the defaultized series groups.
* This should be called in a selector to compute processed series on-demand.
* @param defaultizedSeries The defaultized series groups
* @param seriesConfig The series configuration
* @param dataset The optional dataset
* @returns Processed series with all transformations applied
*/
var applySeriesProcessors = (defaultizedSeries, seriesConfig, dataset, isItemVisible) => {
	const processedSeries = {};
	Object.keys(seriesConfig).forEach((type) => {
		const group = defaultizedSeries[type];
		if (group !== void 0) processedSeries[type] = seriesConfig[type]?.seriesProcessor?.(group, dataset, isItemVisible) ?? group;
	});
	return processedSeries;
};
/**
* Applies series processors with drawing area to series if defined.
* @param processedSeries The processed series groups
* @param seriesConfig The series configuration
* @param drawingArea The drawing area
* @returns Processed series with all transformations applied
*/
var applySeriesLayout = (processedSeries, seriesConfig, drawingArea) => {
	let processingDetected = false;
	const seriesLayout = {};
	Object.keys(processedSeries).forEach((type) => {
		const processor = seriesConfig[type]?.seriesLayout;
		const thisSeries = processedSeries[type];
		if (processor !== void 0 && thisSeries !== void 0) {
			const newValue = processor(thisSeries, drawingArea);
			if (newValue && newValue !== processedSeries[type]) {
				processingDetected = true;
				seriesLayout[type] = newValue;
			}
		}
	});
	if (!processingDetected) return {};
	return seriesLayout;
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/corePlugins/useChartSeries/serializeIdentifier.js
/**
* Serializes a series item identifier into a unique string using the appropriate serializer
* from the provided series configuration.
*
* @param {ChartSeriesConfig<ChartSeriesType>} seriesConfig - The configuration object for chart series.
* @param {SeriesItemIdentifier<ChartSeriesType>} identifier - The series item identifier to serialize.
* @returns {string} A unique string representation of the identifier.
* @throws Will throw an error if no serializer is found for the given series type.
*/
var serializeIdentifier = (seriesConfig, identifier) => {
	const serializer = seriesConfig[identifier.type]?.identifierSerializer;
	if (!serializer) throw new Error(`MUI X Charts: No identifier serializer found for series type "${identifier.type}".`);
	return serializer(identifier);
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/corePlugins/useChartSeries/useChartSeries.js
var useChartSeries = ({ params, store, seriesConfig }) => {
	const { series, dataset, theme, colors } = params;
	useEffectAfterFirstRender(() => {
		store.set("series", _extends({}, store.state.series, {
			defaultizedSeries: defaultizeSeries({
				series,
				colors: typeof colors === "function" ? colors(theme) : colors,
				seriesConfig
			}),
			dataset
		}));
	}, [
		colors,
		dataset,
		series,
		theme,
		seriesConfig,
		store
	]);
	return { instance: { serializeIdentifier: useEventCallback((identifier) => serializeIdentifier(seriesConfig, identifier)) } };
};
useChartSeries.params = {
	dataset: true,
	series: true,
	colors: true,
	theme: true
};
var EMPTY_ARRAY$1 = [];
useChartSeries.getDefaultizedParams = ({ params }) => _extends({}, params, {
	series: params.series?.length ? params.series : EMPTY_ARRAY$1,
	colors: params.colors ?? rainbowSurgePalette,
	theme: params.theme ?? "light"
});
useChartSeries.getInitialState = ({ series = [], colors, theme, dataset }, _, seriesConfig) => {
	return { series: {
		seriesConfig,
		defaultizedSeries: defaultizeSeries({
			series,
			colors: typeof colors === "function" ? colors(theme) : colors,
			seriesConfig
		}),
		dataset
	} };
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartVisibilityManager/isIdentifierVisible.js
var isIdentifierVisible = (visibilityMap, identifier, seriesConfig) => {
	const uniqueId = serializeIdentifier(seriesConfig, identifier);
	return !visibilityMap.has(uniqueId);
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartVisibilityManager/useChartVisibilityManager.selectors.js
/**
* Selector to get the visibility manager state.
*/
var selectVisibilityManager = (state) => state.visibilityManager;
var EMPTY_VISIBILITY_MAP = /* @__PURE__ */ new Map();
/**
* Selector that returns a function which returns whether an item is visible.
*/
var selectorIsItemVisibleGetter = createSelectorMemoized(createSelector(selectVisibilityManager, (visibilityManager) => visibilityManager?.visibilityMap ?? EMPTY_VISIBILITY_MAP), (visibilityMap) => {
	return (seriesConfig, identifier) => isIdentifierVisible(visibilityMap, identifier, seriesConfig);
});
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartVisibilityManager/visibilityParamToMap.js
var visibilityParamToMap = (hiddenItems, seriesConfig) => {
	const visibilityMap = /* @__PURE__ */ new Map();
	if (hiddenItems) hiddenItems.forEach((identifier) => {
		const uniqueId = serializeIdentifier(seriesConfig, identifier);
		visibilityMap.set(uniqueId, identifier);
	});
	return visibilityMap;
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartVisibilityManager/useChartVisibilityManager.js
var useChartVisibilityManager = ({ store, params, seriesConfig, instance }) => {
	useEffectAfterFirstRender(() => {
		if (params.hiddenItems === void 0) return;
		if (!store.state.visibilityManager.isControlled) console.error([
			`MUI X Charts: A chart component is changing the \`hiddenItems\` from uncontrolled to controlled.`,
			"Elements should not switch from uncontrolled to controlled (or vice versa).",
			"Decide between using a controlled or uncontrolled for the lifetime of the component.",
			"The nature of the state is determined during the first render. It's considered controlled if the value is not `undefined`.",
			"More info: https://fb.me/react-controlled-components"
		].join("\n"));
		store.set("visibilityManager", _extends({}, store.state.visibilityManager, { visibilityMap: visibilityParamToMap(params.hiddenItems, seriesConfig) }));
	}, [
		store,
		params.hiddenItems,
		seriesConfig
	]);
	const hideItem = useEventCallback((identifier) => {
		const visibilityMap = store.state.visibilityManager.visibilityMap;
		const id = instance.serializeIdentifier(identifier);
		if (visibilityMap.has(id)) return;
		const newVisibilityMap = new Map(visibilityMap);
		newVisibilityMap.set(id, identifier);
		store.set("visibilityManager", _extends({}, store.state.visibilityManager, { visibilityMap: newVisibilityMap }));
		params.onHiddenItemsChange?.(Array.from(newVisibilityMap.values()));
	});
	const showItem = useEventCallback((identifier) => {
		const visibilityMap = store.state.visibilityManager.visibilityMap;
		const id = instance.serializeIdentifier(identifier);
		if (!visibilityMap.has(id)) return;
		const newVisibilityMap = new Map(visibilityMap);
		newVisibilityMap.delete(id);
		store.set("visibilityManager", _extends({}, store.state.visibilityManager, { visibilityMap: newVisibilityMap }));
		params.onHiddenItemsChange?.(Array.from(newVisibilityMap.values()));
	});
	return { instance: {
		hideItem,
		showItem,
		toggleItemVisibility: useEventCallback((identifier) => {
			const visibilityMap = store.state.visibilityManager.visibilityMap;
			const id = instance.serializeIdentifier(identifier);
			if (visibilityMap.has(id)) showItem(identifier);
			else hideItem(identifier);
		})
	} };
};
useChartVisibilityManager.getInitialState = (params, _, seriesConfig) => {
	const initialItems = params.hiddenItems ?? params.initialHiddenItems;
	return { visibilityManager: {
		visibilityMap: initialItems ? visibilityParamToMap(initialItems, seriesConfig) : EMPTY_VISIBILITY_MAP,
		isControlled: params.hiddenItems !== void 0
	} };
};
useChartVisibilityManager.params = {
	onHiddenItemsChange: true,
	hiddenItems: true,
	initialHiddenItems: true
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/corePlugins/useChartSeries/useChartSeries.selectors.js
var selectorChartSeriesState = (state) => state.series;
var selectorChartDefaultizedSeries = createSelector(selectorChartSeriesState, (seriesState) => seriesState.defaultizedSeries);
var selectorChartSeriesConfig = createSelector(selectorChartSeriesState, (seriesState) => seriesState.seriesConfig);
/**
* Get the processed series after applying series processors.
* This selector computes the processed series on-demand from the defaultized series.
* @returns {ProcessedSeries} The processed series.
*/
var selectorChartSeriesProcessed = createSelectorMemoized(selectorChartDefaultizedSeries, selectorChartSeriesConfig, createSelector(selectorChartSeriesState, (seriesState) => seriesState.dataset), selectorIsItemVisibleGetter, function selectorChartSeriesProcessed(defaultizedSeries, seriesConfig, dataset, isItemVisible) {
	return applySeriesProcessors(defaultizedSeries, seriesConfig, dataset, (identifier) => isItemVisible(seriesConfig, identifier));
});
/**
* Get the processed series after applying series processors.
* This selector computes the processed series on-demand from the defaultized series.
* @returns {ProcessedSeries} The processed series.
*/
var selectorChartSeriesLayout = createSelectorMemoized(selectorChartSeriesProcessed, selectorChartSeriesConfig, selectorChartDrawingArea, function selectorChartSeriesLayout(processedSeries, seriesConfig, drawingArea) {
	return applySeriesLayout(processedSeries, seriesConfig, drawingArea);
});
//#endregion
//#region node_modules/@mui/x-internal-gestures/esm/core/utils/eventList.js
var eventList = {
	abort: true,
	animationcancel: true,
	animationend: true,
	animationiteration: true,
	animationstart: true,
	auxclick: true,
	beforeinput: true,
	beforetoggle: true,
	blur: true,
	cancel: true,
	canplay: true,
	canplaythrough: true,
	change: true,
	click: true,
	close: true,
	compositionend: true,
	compositionstart: true,
	compositionupdate: true,
	contextlost: true,
	contextmenu: true,
	contextrestored: true,
	copy: true,
	cuechange: true,
	cut: true,
	dblclick: true,
	drag: true,
	dragend: true,
	dragenter: true,
	dragleave: true,
	dragover: true,
	dragstart: true,
	drop: true,
	durationchange: true,
	emptied: true,
	ended: true,
	error: true,
	focus: true,
	focusin: true,
	focusout: true,
	formdata: true,
	gotpointercapture: true,
	input: true,
	invalid: true,
	keydown: true,
	keypress: true,
	keyup: true,
	load: true,
	loadeddata: true,
	loadedmetadata: true,
	loadstart: true,
	lostpointercapture: true,
	mousedown: true,
	mouseenter: true,
	mouseleave: true,
	mousemove: true,
	mouseout: true,
	mouseover: true,
	mouseup: true,
	paste: true,
	pause: true,
	play: true,
	playing: true,
	pointercancel: true,
	pointerdown: true,
	pointerenter: true,
	pointerleave: true,
	pointermove: true,
	pointerout: true,
	pointerover: true,
	pointerup: true,
	progress: true,
	ratechange: true,
	reset: true,
	resize: true,
	scroll: true,
	scrollend: true,
	securitypolicyviolation: true,
	seeked: true,
	seeking: true,
	select: true,
	selectionchange: true,
	selectstart: true,
	slotchange: true,
	stalled: true,
	submit: true,
	suspend: true,
	timeupdate: true,
	toggle: true,
	touchcancel: true,
	touchend: true,
	touchmove: true,
	touchstart: true,
	transitioncancel: true,
	transitionend: true,
	transitionrun: true,
	transitionstart: true,
	volumechange: true,
	waiting: true,
	webkitanimationend: true,
	webkitanimationiteration: true,
	webkitanimationstart: true,
	webkittransitionend: true,
	wheel: true,
	beforematch: true,
	pointerrawupdate: true
};
//#endregion
//#region node_modules/@mui/x-internal-gestures/esm/core/Gesture.js
/**
* Base Gesture module that provides common functionality for all gesture implementations
*/
/**
* The possible phases of a gesture during its lifecycle.
*
* - 'start': The gesture has been recognized and is beginning
* - 'ongoing': The gesture is in progress (e.g., a finger is moving)
* - 'end': The gesture has completed successfully
* - 'cancel': The gesture was interrupted or terminated abnormally
*/
/**
* Core data structure passed to gesture event handlers.
* Contains all relevant information about a gesture event.
*/
/**
* Defines the types of pointers that can trigger a gesture.
*/
/**
* Base configuration options that can be overridden per pointer mode.
*/
/**
* Configuration options for creating a gesture instance.
*/
/**
* Type for the state of a gesture recognizer.
*/
/**
* Base abstract class for all gestures. This class provides the fundamental structure
* and functionality for handling gestures, including registering and unregistering
* gesture handlers, creating emitters, and managing gesture state.
*
* Gesture is designed as an extensible base for implementing specific gesture recognizers.
* Concrete gesture implementations should extend this class or one of its subclasses.
*
* To implement:
* - Non-pointer gestures (like wheel events): extend this Gesture class directly
* - Pointer-based gestures: extend the PointerGesture class instead
*
* @example
* ```ts
* import { Gesture } from './Gesture';
*
* class CustomGesture extends Gesture {
*   constructor(options) {
*     super(options);
*   }
*
*   clone(overrides) {
*     return new CustomGesture({
*       name: this.name,
*       // ... other options
*       ...overrides,
*     });
*   }
* }
* ```
*/
var Gesture = class {
	/** Unique name identifying this gesture type */
	/** Whether to prevent default browser action for gesture events */
	/** Whether to stop propagation of gesture events */
	/**
	* List of gesture names that should prevent this gesture from activating when they are active.
	*/
	/**
	* Array of keyboard keys that must be pressed for the gesture to be recognized.
	*/
	/**
	* KeyboardManager instance for tracking key presses
	*/
	/**
	* List of pointer types that can trigger this gesture.
	* If undefined, all pointer types are allowed.
	*/
	/**
	* Pointer mode-specific configuration overrides.
	*/
	/**
	* User-mutable data object for sharing state between gesture events
	* This object is included in all events emitted by this gesture
	*/
	customData = {};
	/** Reference to the singleton PointerManager instance */
	/** Reference to the singleton ActiveGesturesRegistry instance */
	/** The DOM element this gesture is attached to */
	/** Stores the active gesture state */
	/** @internal For types. If false enables phases (xStart, x, xEnd) */
	/** @internal For types. The event type this gesture is associated with */
	/** @internal For types. The options type for this gesture */
	/** @internal For types. The options that can be changed at runtime */
	/** @internal For types. The state that can be changed at runtime */
	/**
	* Create a new gesture instance with the specified options
	*
	* @param options - Configuration options for this gesture
	*/
	constructor(options) {
		if (!options || !options.name) throw new Error("Gesture must be initialized with a valid name.");
		if (options.name in eventList) throw new Error(`Gesture can't be created with a native event name. Tried to use "${options.name}". Please use a custom name instead.`);
		this.name = options.name;
		this.preventDefault = options.preventDefault ?? false;
		this.stopPropagation = options.stopPropagation ?? false;
		this.preventIf = options.preventIf ?? [];
		this.requiredKeys = options.requiredKeys ?? [];
		this.pointerMode = options.pointerMode ?? [];
		this.pointerOptions = options.pointerOptions ?? {};
	}
	/**
	* Initialize the gesture by acquiring the pointer manager and gestures registry
	* Must be called before the gesture can be used
	*/
	init(element, pointerManager, gestureRegistry, keyboardManager) {
		this.element = element;
		this.pointerManager = pointerManager;
		this.gesturesRegistry = gestureRegistry;
		this.keyboardManager = keyboardManager;
		const changeOptionsEventName = `${this.name}ChangeOptions`;
		this.element.addEventListener(changeOptionsEventName, this.handleOptionsChange);
		const changeStateEventName = `${this.name}ChangeState`;
		this.element.addEventListener(changeStateEventName, this.handleStateChange);
	}
	/**
	* Handle option change events
	* @param event Custom event with new options in the detail property
	*/
	handleOptionsChange = (event) => {
		if (event && event.detail) this.updateOptions(event.detail);
	};
	/**
	* Update the gesture options with new values
	* @param options Object containing properties to update
	*/
	updateOptions(options) {
		this.preventDefault = options.preventDefault ?? this.preventDefault;
		this.stopPropagation = options.stopPropagation ?? this.stopPropagation;
		this.preventIf = options.preventIf ?? this.preventIf;
		this.requiredKeys = options.requiredKeys ?? this.requiredKeys;
		this.pointerMode = options.pointerMode ?? this.pointerMode;
		this.pointerOptions = options.pointerOptions ?? this.pointerOptions;
	}
	/**
	* Get the default configuration for the pointer specific options.
	* Change this function in child classes to provide different defaults.
	*/
	getBaseConfig() {
		return { requiredKeys: this.requiredKeys };
	}
	/**
	* Get the effective configuration for a specific pointer mode.
	* This merges the base configuration with pointer mode-specific overrides.
	*
	* @param pointerType - The pointer type to get configuration for
	* @returns The effective configuration object
	*/
	getEffectiveConfig(pointerType, baseConfig) {
		if (pointerType !== "mouse" && pointerType !== "touch" && pointerType !== "pen") return baseConfig;
		const pointerModeOverrides = this.pointerOptions[pointerType];
		if (pointerModeOverrides) return _extends({}, baseConfig, pointerModeOverrides);
		return baseConfig;
	}
	/**
	* Handle state change events
	* @param event Custom event with new state values in the detail property
	*/
	handleStateChange = (event) => {
		if (event && event.detail) this.updateState(event.detail);
	};
	/**
	* Update the gesture state with new values
	* @param stateChanges Object containing state properties to update
	*/
	updateState(stateChanges) {
		Object.assign(this.state, stateChanges);
	}
	/**
	* Create a deep clone of this gesture for a new element
	*
	* @param overrides - Optional configuration options that override the defaults
	* @returns A new instance of this gesture with the same configuration and any overrides applied
	*/
	/**
	* Check if the event's target is or is contained within any of our registered elements
	*
	* @param event - The browser event to check
	* @returns The matching element or null if no match is found
	*/
	getTargetElement(event) {
		if (this.isActive || this.element === event.target || "contains" in this.element && this.element.contains(event.target) || "getRootNode" in this.element && this.element.getRootNode() instanceof ShadowRoot && event.composedPath().includes(this.element)) return this.element;
		return null;
	}
	/** Whether the gesture is currently active */
	set isActive(isActive) {
		if (isActive) this.gesturesRegistry.registerActiveGesture(this.element, this);
		else this.gesturesRegistry.unregisterActiveGesture(this.element, this);
	}
	/** Whether the gesture is currently active */
	get isActive() {
		return this.gesturesRegistry.isGestureActive(this.element, this) ?? false;
	}
	/**
	* Checks if this gesture should be prevented from activating.
	*
	* @param element - The DOM element to check against
	* @param pointerType - The type of pointer triggering the gesture
	* @returns true if the gesture should be prevented, false otherwise
	*/
	shouldPreventGesture(element, pointerType) {
		const effectiveConfig = this.getEffectiveConfig(pointerType, this.getBaseConfig());
		if (!this.keyboardManager.areKeysPressed(effectiveConfig.requiredKeys)) return true;
		if (this.preventIf.length === 0) return false;
		const activeGestures = this.gesturesRegistry.getActiveGestures(element);
		return this.preventIf.some((gestureName) => activeGestures[gestureName]);
	}
	/**
	* Checks if the given pointer type is allowed for this gesture based on the pointerMode setting.
	*
	* @param pointerType - The type of pointer to check.
	* @returns true if the pointer type is allowed, false otherwise.
	*/
	isPointerTypeAllowed(pointerType) {
		if (!this.pointerMode || this.pointerMode.length === 0) return true;
		return this.pointerMode.includes(pointerType);
	}
	/**
	* Clean up the gesture and unregister any listeners
	* Call this method when the gesture is no longer needed to prevent memory leaks
	*/
	destroy() {
		const changeOptionsEventName = `${this.name}ChangeOptions`;
		this.element.removeEventListener(changeOptionsEventName, this.handleOptionsChange);
		const changeStateEventName = `${this.name}ChangeState`;
		this.element.removeEventListener(changeStateEventName, this.handleStateChange);
	}
};
//#endregion
//#region node_modules/@mui/x-internal-gestures/esm/core/ActiveGesturesRegistry.js
/**
* ActiveGesturesRegistry - Centralized registry for tracking which gestures are active on elements
*
* This singleton class keeps track of all gesture instances that are currently in their active state,
* allowing both the system and applications to query which gestures are active on specific elements.
*/
/**
* Type for entries in the active gestures registry
*/
/**
* Registry that maintains a record of all currently active gestures across elements
*/
var ActiveGesturesRegistry = class {
	/** Map of elements to their active gestures */
	activeGestures = /* @__PURE__ */ new Map();
	/**
	* Register a gesture as active on an element
	*
	* @param element - The DOM element on which the gesture is active
	* @param gesture - The gesture instance that is active
	*/
	registerActiveGesture(element, gesture) {
		if (!this.activeGestures.has(element)) this.activeGestures.set(element, /* @__PURE__ */ new Set());
		const elementGestures = this.activeGestures.get(element);
		const entry = {
			gesture,
			element
		};
		elementGestures.add(entry);
	}
	/**
	* Remove a gesture from the active registry
	*
	* @param element - The DOM element on which the gesture was active
	* @param gesture - The gesture instance to deactivate
	*/
	unregisterActiveGesture(element, gesture) {
		const elementGestures = this.activeGestures.get(element);
		if (!elementGestures) return;
		elementGestures.forEach((entry) => {
			if (entry.gesture === gesture) elementGestures.delete(entry);
		});
		if (elementGestures.size === 0) this.activeGestures.delete(element);
	}
	/**
	* Get all active gestures for a specific element
	*
	* @param element - The DOM element to query
	* @returns Array of active gesture names
	*/
	getActiveGestures(element) {
		const elementGestures = this.activeGestures.get(element);
		if (!elementGestures) return {};
		return Array.from(elementGestures).reduce((acc, entry) => {
			acc[entry.gesture.name] = true;
			return acc;
		}, {});
	}
	/**
	* Check if a specific gesture is active on an element
	*
	* @param element - The DOM element to check
	* @param gesture - The gesture instance to check
	* @returns True if the gesture is active on the element, false otherwise
	*/
	isGestureActive(element, gesture) {
		const elementGestures = this.activeGestures.get(element);
		if (!elementGestures) return false;
		return Array.from(elementGestures).some((entry) => entry.gesture === gesture);
	}
	/**
	* Clear all active gestures from the registry
	*/
	destroy() {
		this.activeGestures.clear();
	}
	/**
	* Clear all active gestures for a specific element
	*
	* @param element - The DOM element to clear
	*/
	unregisterElement(element) {
		this.activeGestures.delete(element);
	}
};
//#endregion
//#region node_modules/@mui/x-internal-gestures/esm/core/KeyboardManager.js
/**
* KeyboardManager - Manager for keyboard events in the gesture recognition system
*
* This class tracks keyboard state:
* 1. Capturing and tracking all pressed keys
* 2. Providing methods to check if specific keys are pressed
*/
/**
* Type definition for keyboard keys
*/
/**
* Class responsible for tracking keyboard state
*/
var KeyboardManager = class {
	pressedKeys = /* @__PURE__ */ new Set();
	/**
	* Create a new KeyboardManager instance
	*/
	constructor() {
		this.initialize();
	}
	/**
	* Initialize the keyboard event listeners
	*/
	initialize() {
		if (typeof window === "undefined") return;
		window.addEventListener("keydown", this.handleKeyDown);
		window.addEventListener("keyup", this.handleKeyUp);
		window.addEventListener("blur", this.clearKeys);
	}
	/**
	* Handle keydown events
	*/
	handleKeyDown = (event) => {
		this.pressedKeys.add(event.key);
	};
	/**
	* Handle keyup events
	*/
	handleKeyUp = (event) => {
		this.pressedKeys.delete(event.key);
	};
	/**
	* Clear all pressed keys
	*/
	clearKeys = () => {
		this.pressedKeys.clear();
	};
	/**
	* Check if a set of keys are all currently pressed
	* @param keys The keys to check
	* @returns True if all specified keys are pressed, false otherwise
	*/
	areKeysPressed(keys) {
		if (!keys || keys.length === 0) return true;
		return keys.every((key) => {
			if (key === "ControlOrMeta") return navigator.platform.includes("Mac") ? this.pressedKeys.has("Meta") : this.pressedKeys.has("Control");
			return this.pressedKeys.has(key);
		});
	}
	/**
	* Cleanup method to remove event listeners
	*/
	destroy() {
		if (typeof window !== "undefined") {
			window.removeEventListener("keydown", this.handleKeyDown);
			window.removeEventListener("keyup", this.handleKeyUp);
			window.removeEventListener("blur", this.clearKeys);
		}
		this.clearKeys();
	}
};
//#endregion
//#region node_modules/@mui/x-internal-gestures/esm/core/PointerManager.js
/**
* PointerManager - Centralized manager for pointer events in the gesture recognition system
*
* This singleton class abstracts the complexity of working with pointer events by:
* 1. Capturing and tracking all active pointers (touch, mouse, pen)
* 2. Normalizing pointer data into a consistent format
* 3. Managing pointer capture for proper tracking across elements
* 4. Distributing events to registered gesture recognizers
*/
/**
* Normalized representation of a pointer, containing all relevant information
* from the original PointerEvent plus additional tracking data.
*
* This data structure encapsulates everything gesture recognizers need to know
* about a pointer's current state.
*/
/**
* Configuration options for initializing the PointerManager.
*/
/**
* Manager for handling pointer events across the application.
*
* PointerManager serves as the foundational layer for gesture recognition,
* providing a centralized system for tracking active pointers and distributing
* pointer events to gesture recognizers.
*
* It normalizes browser pointer events into a consistent format and simplifies
* multi-touch handling by managing pointer capture and tracking multiple
* simultaneous pointers.
*/
var PointerManager = class {
	/** Root element where pointer events are captured */
	/** CSS touch-action property value applied to the root element */
	/** Whether to use passive event listeners */
	/** Whether to prevent interrupt events like blur or contextmenu */
	preventEventInterruption = true;
	/** Map of all currently active pointers by their pointerId */
	pointers = /* @__PURE__ */ new Map();
	/** Set of registered gesture handlers that receive pointer events */
	gestureHandlers = /* @__PURE__ */ new Set();
	constructor(options) {
		this.root = options.root ?? document.getRootNode({ composed: true }) ?? document.body;
		this.touchAction = options.touchAction || "auto";
		this.passive = options.passive ?? false;
		this.preventEventInterruption = options.preventEventInterruption ?? true;
		this.setupEventListeners();
	}
	/**
	* Register a handler function to receive pointer events.
	*
	* The handler will be called whenever pointer events occur within the root element.
	* It receives the current map of all active pointers and the original event.
	*
	* @param {Function} handler - Function to receive pointer events and current pointer state
	* @returns {Function} An unregister function that removes this handler when called
	*/
	registerGestureHandler(handler) {
		this.gestureHandlers.add(handler);
		return () => {
			this.gestureHandlers.delete(handler);
		};
	}
	/**
	* Get a copy of the current active pointers map.
	*
	* Returns a new Map containing all currently active pointers.
	* Modifying the returned map will not affect the internal pointers state.
	*
	* @returns A new Map containing all active pointers
	*/
	getPointers() {
		return new Map(this.pointers);
	}
	/**
	* Set up event listeners for pointer events on the root element.
	*
	* This method attaches all necessary event listeners and configures
	* the CSS touch-action property on the root element.
	*/
	setupEventListeners() {
		if (this.touchAction !== "auto") this.root.style.touchAction = this.touchAction;
		this.root.addEventListener("pointerdown", this.handlePointerEvent, { passive: this.passive });
		this.root.addEventListener("pointermove", this.handlePointerEvent, { passive: this.passive });
		this.root.addEventListener("pointerup", this.handlePointerEvent, { passive: this.passive });
		this.root.addEventListener("pointercancel", this.handlePointerEvent, { passive: this.passive });
		this.root.addEventListener("forceCancel", this.handlePointerEvent, { passive: this.passive });
		this.root.addEventListener("blur", this.handleInterruptEvents);
		this.root.addEventListener("contextmenu", this.handleInterruptEvents);
	}
	/**
	* Handle events that should interrupt all gestures.
	* This clears all active pointers and notifies handlers with a pointercancel-like event.
	*
	* @param event - The event that triggered the interruption (blur or contextmenu)
	*/
	handleInterruptEvents = (event) => {
		if (this.preventEventInterruption && "pointerType" in event && event.pointerType === "touch") {
			event.preventDefault();
			return;
		}
		const cancelEvent = new PointerEvent("forceCancel", {
			bubbles: false,
			cancelable: false
		});
		const firstPointer = this.pointers.values().next().value;
		if (this.pointers.size > 0 && firstPointer) {
			Object.defineProperties(cancelEvent, {
				clientX: { value: firstPointer.clientX },
				clientY: { value: firstPointer.clientY },
				pointerId: { value: firstPointer.pointerId },
				pointerType: { value: firstPointer.pointerType }
			});
			for (const [pointerId, pointer] of this.pointers.entries()) {
				const updatedPointer = _extends({}, pointer, { type: "forceCancel" });
				this.pointers.set(pointerId, updatedPointer);
			}
		}
		this.notifyHandlers(cancelEvent);
		this.pointers.clear();
	};
	/**
	* Event handler for all pointer events.
	*
	* This method:
	* 1. Updates the internal pointers map based on the event type
	* 2. Manages pointer capture for tracking pointers outside the root element
	* 3. Notifies all registered handlers with the current state
	*
	* @param event - The original pointer event from the browser
	*/
	handlePointerEvent = (event) => {
		const { type, pointerId } = event;
		if (type === "pointerdown" || type === "pointermove") this.pointers.set(pointerId, this.createPointerData(event));
		else if (type === "pointerup" || type === "pointercancel" || type === "forceCancel") {
			this.pointers.set(pointerId, this.createPointerData(event));
			this.notifyHandlers(event);
			this.pointers.delete(pointerId);
			return;
		}
		this.notifyHandlers(event);
	};
	/**
	* Notify all registered gesture handlers about a pointer event.
	*
	* Each handler receives the current map of active pointers and the original event.
	*
	* @param event - The original pointer event that triggered this notification
	*/
	notifyHandlers(event) {
		this.gestureHandlers.forEach((handler) => handler(this.pointers, event));
	}
	/**
	* Create a normalized PointerData object from a browser PointerEvent.
	*
	* This method extracts all relevant information from the original event
	* and formats it in a consistent way for gesture recognizers to use.
	*
	* @param event - The original browser pointer event
	* @returns A new PointerData object representing this pointer
	*/
	createPointerData(event) {
		return {
			pointerId: event.pointerId,
			clientX: event.clientX,
			clientY: event.clientY,
			pageX: event.pageX,
			pageY: event.pageY,
			target: event.target,
			timeStamp: event.timeStamp,
			type: event.type,
			isPrimary: event.isPrimary,
			pressure: event.pressure,
			width: event.width,
			height: event.height,
			pointerType: event.pointerType,
			srcEvent: event
		};
	}
	/**
	* Clean up all event listeners and reset the PointerManager state.
	*
	* This method should be called when the PointerManager is no longer needed
	* to prevent memory leaks. It removes all event listeners, clears the
	* internal state, and resets the singleton instance.
	*/
	destroy() {
		this.root.removeEventListener("pointerdown", this.handlePointerEvent);
		this.root.removeEventListener("pointermove", this.handlePointerEvent);
		this.root.removeEventListener("pointerup", this.handlePointerEvent);
		this.root.removeEventListener("pointercancel", this.handlePointerEvent);
		this.root.removeEventListener("forceCancel", this.handlePointerEvent);
		this.root.removeEventListener("blur", this.handleInterruptEvents);
		this.root.removeEventListener("contextmenu", this.handleInterruptEvents);
		this.pointers.clear();
		this.gestureHandlers.clear();
	}
};
//#endregion
//#region node_modules/@mui/x-internal-gestures/esm/core/GestureManager.js
/**
* Configuration options for initializing the GestureManager
*/
/**
* The primary class responsible for setting up and managing gestures across multiple elements.
*
* GestureManager maintains a collection of gesture templates that can be instantiated for
* specific DOM elements. It handles lifecycle management, event dispatching, and cleanup.
*
* @example
* ```typescript
* // Basic setup with default gestures
* const manager = new GestureManager({
*   root: document.body,
*   touchAction: 'none',
*   gestures: [
*     new PanGesture({ name: 'pan' }),
*   ],
* });
*
* // Register pan gestures on an element
* const element = manager.registerElement('pan', document.querySelector('.draggable'));
*
* // Add event listeners with proper typing
* element.addEventListener('panStart', (event) => {
*   console.log('Pan started');
* });
*
* element.addEventListener('pan', (event) => {
*   console.log(`Pan delta: ${event.deltaX}, ${event.deltaY}`);
* });
*
* // Custom gesture types
* interface MyGestureEvents {
*   custom: { x: number, y: number }
* }
* const customManager = new GestureManager<MyGestureEvents>({
*   root: document.body
*   gestures: [
*     new CustomGesture({ name: 'custom' }),
*   ],
* });
* ```
*/
var GestureManager = class {
	/** Repository of gesture templates that can be cloned for specific elements */
	gestureTemplates = /* @__PURE__ */ new Map();
	/** Maps DOM elements to their active gesture instances */
	elementGestureMap = /* @__PURE__ */ new Map();
	activeGesturesRegistry = new ActiveGesturesRegistry();
	keyboardManager = new KeyboardManager();
	/**
	* Create a new GestureManager instance to coordinate gesture recognition
	*
	* @param options - Configuration options for the gesture manager
	*/
	constructor(options) {
		this.pointerManager = new PointerManager({
			root: options.root,
			touchAction: options.touchAction,
			passive: options.passive
		});
		if (options.gestures && options.gestures.length > 0) options.gestures.forEach((gesture) => {
			this.addGestureTemplate(gesture);
		});
	}
	/**
	* Add a gesture template to the manager's template registry.
	* Templates serve as prototypes that can be cloned for individual elements.
	*
	* @param gesture - The gesture instance to use as a template
	*/
	addGestureTemplate(gesture) {
		if (this.gestureTemplates.has(gesture.name)) console.warn(`Gesture template with name "${gesture.name}" already exists. It will be overwritten.`);
		this.gestureTemplates.set(gesture.name, gesture);
	}
	/**
	* Updates the options for a specific gesture on a given element and emits a change event.
	*
	* @param gestureName - Name of the gesture whose options should be updated
	* @param element - The DOM element where the gesture is attached
	* @param options - New options to apply to the gesture
	* @returns True if the options were successfully updated, false if the gesture wasn't found
	*
	* @example
	* ```typescript
	* // Update pan gesture sensitivity on the fly
	* manager.setGestureOptions('pan', element, { threshold: 5 });
	* ```
	*/
	setGestureOptions(gestureName, element, options) {
		const elementGestures = this.elementGestureMap.get(element);
		if (!elementGestures || !elementGestures.has(gestureName)) {
			console.error(`Gesture "${gestureName}" not found on the provided element.`);
			return;
		}
		const event = new CustomEvent(`${gestureName}ChangeOptions`, {
			detail: options,
			bubbles: false,
			cancelable: false,
			composed: false
		});
		element.dispatchEvent(event);
	}
	/**
	* Updates the state for a specific gesture on a given element and emits a change event.
	*
	* @param gestureName - Name of the gesture whose state should be updated
	* @param element - The DOM element where the gesture is attached
	* @param state - New state to apply to the gesture
	* @returns True if the state was successfully updated, false if the gesture wasn't found
	*
	* @example
	* ```typescript
	* // Update total delta for a turnWheel gesture
	* manager.setGestureState('turnWheel', element, { totalDeltaX: 10 });
	* ```
	*/
	setGestureState(gestureName, element, state) {
		const elementGestures = this.elementGestureMap.get(element);
		if (!elementGestures || !elementGestures.has(gestureName)) {
			console.error(`Gesture "${gestureName}" not found on the provided element.`);
			return;
		}
		const event = new CustomEvent(`${gestureName}ChangeState`, {
			detail: state,
			bubbles: false,
			cancelable: false,
			composed: false
		});
		element.dispatchEvent(event);
	}
	/**
	* Register an element to recognize one or more gestures.
	*
	* This method clones the specified gesture template(s) and creates
	* gesture recognizer instance(s) specifically for the provided element.
	* The element is returned with enhanced TypeScript typing for gesture events.
	*
	* @param gestureNames - Name(s) of the gesture(s) to register (must match template names)
	* @param element - The DOM element to attach the gesture(s) to
	* @param options - Optional map of gesture-specific options to override when registering
	* @returns The same element with properly typed event listeners
	*
	* @example
	* ```typescript
	* // Register multiple gestures
	* const element = manager.registerElement(['pan', 'pinch'], myDiv);
	*
	* // Register a single gesture
	* const draggable = manager.registerElement('pan', dragHandle);
	*
	* // Register with customized options for each gesture
	* const customElement = manager.registerElement(
	*   ['pan', 'pinch', 'rotate'],
	*   myElement,
	*   {
	*     pan: { threshold: 20, direction: ['left', 'right'] },
	*     pinch: { threshold: 0.1 }
	*   }
	* );
	* ```
	*/
	registerElement(gestureNames, element, options) {
		if (!Array.isArray(gestureNames)) gestureNames = [gestureNames];
		gestureNames.forEach((name) => {
			const gestureOptions = options?.[name];
			this.registerSingleGesture(name, element, gestureOptions);
		});
		return element;
	}
	/**
	* Internal method to register a single gesture on an element.
	*
	* @param gestureName - Name of the gesture to register
	* @param element - DOM element to attach the gesture to
	* @param options - Optional options to override the gesture template configuration
	* @returns True if the registration was successful, false otherwise
	*/
	registerSingleGesture(gestureName, element, options) {
		const gestureTemplate = this.gestureTemplates.get(gestureName);
		if (!gestureTemplate) {
			console.error(`Gesture template "${gestureName}" not found.`);
			return false;
		}
		if (!this.elementGestureMap.has(element)) this.elementGestureMap.set(element, /* @__PURE__ */ new Map());
		const elementGestures = this.elementGestureMap.get(element);
		if (elementGestures.has(gestureName)) {
			console.warn(`Element already has gesture "${gestureName}" registered. It will be replaced.`);
			this.unregisterElement(gestureName, element);
		}
		const gestureInstance = gestureTemplate.clone(options);
		gestureInstance.init(element, this.pointerManager, this.activeGesturesRegistry, this.keyboardManager);
		elementGestures.set(gestureName, gestureInstance);
		return true;
	}
	/**
	* Unregister a specific gesture from an element.
	* This removes the gesture recognizer and stops event emission for that gesture.
	*
	* @param gestureName - Name of the gesture to unregister
	* @param element - The DOM element to remove the gesture from
	* @returns True if the gesture was found and removed, false otherwise
	*/
	unregisterElement(gestureName, element) {
		const elementGestures = this.elementGestureMap.get(element);
		if (!elementGestures || !elementGestures.has(gestureName)) return false;
		elementGestures.get(gestureName).destroy();
		elementGestures.delete(gestureName);
		this.activeGesturesRegistry.unregisterElement(element);
		if (elementGestures.size === 0) this.elementGestureMap.delete(element);
		return true;
	}
	/**
	* Unregister all gestures from an element.
	* Completely removes the element from the gesture system.
	*
	* @param element - The DOM element to remove all gestures from
	*/
	unregisterAllGestures(element) {
		const elementGestures = this.elementGestureMap.get(element);
		if (elementGestures) {
			for (const [, gesture] of elementGestures) {
				gesture.destroy();
				this.activeGesturesRegistry.unregisterElement(element);
			}
			this.elementGestureMap.delete(element);
		}
	}
	/**
	* Clean up all gestures and event listeners.
	* Call this method when the GestureManager is no longer needed to prevent memory leaks.
	*/
	destroy() {
		for (const [element] of this.elementGestureMap) this.unregisterAllGestures(element);
		this.gestureTemplates.clear();
		this.elementGestureMap.clear();
		this.activeGesturesRegistry.destroy();
		this.keyboardManager.destroy();
		this.pointerManager.destroy();
	}
};
//#endregion
//#region node_modules/@mui/x-internal-gestures/esm/core/PointerGesture.js
/**
* Base configuration options that can be overridden per pointer mode.
*/
/**
* Configuration options for pointer-based gestures, extending the base GestureOptions.
*
* These options provide fine-grained control over how pointer events are interpreted
* and when the gesture should be recognized.
*/
/**
* Base class for all pointer-based gestures.
*
* This class extends the base Gesture class with specialized functionality for
* handling pointer events via the PointerManager. It provides common logic for
* determining when a gesture should activate, tracking pointer movements, and
* managing pointer thresholds.
*
* All pointer-based gesture implementations should extend this class rather than
* the base Gesture class.
*
* @example
* ```ts
* import { PointerGesture } from './PointerGesture';
*
* class CustomGesture extends PointerGesture {
*   constructor(options) {
*     super(options);
*   }
*
*   clone(overrides) {
*     return new CustomGesture({
*       name: this.name,
*       // ... other options
*       ...overrides,
*     });
*   }
*
*   handlePointerEvent = (pointers, event) => {
*     // Handle pointer events here
*   }
* }
* ```
*/
var PointerGesture = class extends Gesture {
	/** Function to unregister from the PointerManager when destroying this gesture */
	unregisterHandler = null;
	/** The original target element when the gesture began, used to prevent limbo state if target is removed */
	originalTarget = null;
	/**
	* Minimum number of simultaneous pointers required to activate the gesture.
	* The gesture will not start until at least this many pointers are active.
	*/
	/**
	* Maximum number of simultaneous pointers allowed for this gesture.
	* If more than this many pointers are detected, the gesture may be canceled.
	*/
	constructor(options) {
		super(options);
		this.minPointers = options.minPointers ?? 1;
		this.maxPointers = options.maxPointers ?? Infinity;
	}
	init(element, pointerManager, gestureRegistry, keyboardManager) {
		super.init(element, pointerManager, gestureRegistry, keyboardManager);
		this.unregisterHandler = this.pointerManager.registerGestureHandler(this.handlePointerEvent);
	}
	updateOptions(options) {
		super.updateOptions(options);
		this.minPointers = options.minPointers ?? this.minPointers;
		this.maxPointers = options.maxPointers ?? this.maxPointers;
	}
	getBaseConfig() {
		return {
			requiredKeys: this.requiredKeys,
			minPointers: this.minPointers,
			maxPointers: this.maxPointers
		};
	}
	isWithinPointerCount(pointers, pointerMode) {
		const config = this.getEffectiveConfig(pointerMode, this.getBaseConfig());
		return pointers.length >= config.minPointers && pointers.length <= config.maxPointers;
	}
	/**
	* Handler for pointer events from the PointerManager.
	* Concrete gesture implementations must override this method to provide
	* gesture-specific logic for recognizing and tracking the gesture.
	*
	* @param pointers - Map of active pointers by pointer ID
	* @param event - The original pointer event from the browser
	*/
	/**
	* Calculate the target element for the gesture based on the active pointers.
	*
	* It takes into account the original target element.
	*
	* @param pointers - Map of active pointers by pointer ID
	* @param calculatedTarget - The target element calculated from getTargetElement
	* @returns A list of relevant pointers for this gesture
	*/
	getRelevantPointers(pointers, calculatedTarget) {
		return pointers.filter((pointer) => this.isPointerTypeAllowed(pointer.pointerType) && (calculatedTarget === pointer.target || pointer.target === this.originalTarget || calculatedTarget === this.originalTarget || "contains" in calculatedTarget && calculatedTarget.contains(pointer.target)) || "getRootNode" in calculatedTarget && calculatedTarget.getRootNode() instanceof ShadowRoot && pointer.srcEvent.composedPath().includes(calculatedTarget));
	}
	destroy() {
		if (this.unregisterHandler) {
			this.unregisterHandler();
			this.unregisterHandler = null;
		}
		super.destroy();
	}
};
//#endregion
//#region node_modules/@mui/x-internal-gestures/esm/core/utils/getDistance.js
/**
* Calculate the distance between two points
*/
function getDistance(pointA, pointB) {
	const deltaX = pointB.x - pointA.x;
	const deltaY = pointB.y - pointA.y;
	return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}
//#endregion
//#region node_modules/@mui/x-internal-gestures/esm/core/utils/calculateAverageDistance.js
/**
* Calculate the average distance between all pairs of pointers
*/
function calculateAverageDistance(pointers) {
	if (pointers.length < 2) return 0;
	let totalDistance = 0;
	let pairCount = 0;
	for (let i = 0; i < pointers.length; i += 1) for (let j = i + 1; j < pointers.length; j += 1) {
		totalDistance += getDistance({
			x: pointers[i].clientX,
			y: pointers[i].clientY
		}, {
			x: pointers[j].clientX,
			y: pointers[j].clientY
		});
		pairCount += 1;
	}
	return pairCount > 0 ? totalDistance / pairCount : 0;
}
//#endregion
//#region node_modules/@mui/x-internal-gestures/esm/core/utils/calculateCentroid.js
/**
* Calculate the centroid (average position) of multiple pointers
*/
function calculateCentroid(pointers) {
	if (pointers.length === 0) return {
		x: 0,
		y: 0
	};
	const sum = pointers.reduce((acc, pointer) => {
		acc.x += pointer.clientX;
		acc.y += pointer.clientY;
		return acc;
	}, {
		x: 0,
		y: 0
	});
	return {
		x: sum.x / pointers.length,
		y: sum.y / pointers.length
	};
}
//#endregion
//#region node_modules/@mui/x-internal-gestures/esm/core/utils/createEventName.js
/**
* Creates the event name for a specific gesture and phase
*/
function createEventName(gesture, phase) {
	return `${gesture}${phase === "ongoing" ? "" : phase.charAt(0).toUpperCase() + phase.slice(1)}`;
}
//#endregion
//#region node_modules/@mui/x-internal-gestures/esm/core/utils/getDirection.js
var MAIN_THRESHOLD = 1e-5;
var ANGLE_THRESHOLD = 1e-5;
var SECONDARY_THRESHOLD = .15;
/**
* Get the direction of movement based on the current and previous positions
*/
function getDirection$1(previous, current) {
	const deltaX = current.x - previous.x;
	const deltaY = current.y - previous.y;
	const direction = {
		vertical: null,
		horizontal: null,
		mainAxis: null
	};
	const isDiagonal = isDiagonalMovement(current, previous);
	const mainMovement = Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
	const horizontalThreshold = isDiagonal ? MAIN_THRESHOLD : mainMovement === "horizontal" ? MAIN_THRESHOLD : SECONDARY_THRESHOLD;
	const verticalThreshold = isDiagonal ? MAIN_THRESHOLD : mainMovement === "horizontal" ? SECONDARY_THRESHOLD : MAIN_THRESHOLD;
	if (Math.abs(deltaX) > horizontalThreshold) direction.horizontal = deltaX > 0 ? "right" : "left";
	if (Math.abs(deltaY) > verticalThreshold) direction.vertical = deltaY > 0 ? "down" : "up";
	direction.mainAxis = isDiagonal ? "diagonal" : mainMovement;
	return direction;
}
function isDiagonalMovement(previous, current) {
	const deltaX = current.x - previous.x;
	const deltaY = current.y - previous.y;
	const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
	return angle >= -45 + ANGLE_THRESHOLD && angle <= -22.5 + ANGLE_THRESHOLD || angle >= 22.5 + ANGLE_THRESHOLD && angle <= 45 + ANGLE_THRESHOLD || angle >= 135 + ANGLE_THRESHOLD && angle <= 157.5 + ANGLE_THRESHOLD || angle >= -157.5 + ANGLE_THRESHOLD && angle <= -135 + ANGLE_THRESHOLD;
}
//#endregion
//#region node_modules/@mui/x-internal-gestures/esm/core/utils/isDirectionAllowed.js
/**
* Check if a direction matches one of the allowed directions
*/
function isDirectionAllowed(direction, allowedDirections) {
	if (!direction.vertical && !direction.horizontal) return false;
	if (allowedDirections.length === 0) return true;
	const verticalAllowed = direction.vertical === null || allowedDirections.includes(direction.vertical);
	const horizontalAllowed = direction.horizontal === null || allowedDirections.includes(direction.horizontal);
	return verticalAllowed && horizontalAllowed;
}
//#endregion
//#region node_modules/@mui/x-internal-gestures/esm/core/utils/getPinchDirection.js
var DIRECTION_THRESHOLD = 0;
var getPinchDirection = (velocity) => {
	if (velocity > DIRECTION_THRESHOLD) return 1;
	if (velocity < -DIRECTION_THRESHOLD) return -1;
	return 0;
};
//#endregion
//#region node_modules/@mui/x-internal-gestures/esm/core/utils/preventDefault.js
var preventDefault$1 = (event) => {
	if (event.cancelable) event.preventDefault();
};
//#endregion
//#region node_modules/@mui/x-internal-gestures/esm/core/gestures/MoveGesture.js
/**
* MoveGesture - Detects when a pointer enters, moves within, and leaves an element
*
* This gesture tracks pointer movements over an element, firing events when:
* - A pointer enters the element (start)
* - A pointer moves within the element (ongoing)
* - A pointer leaves the element (end)
*
* Unlike other gestures which often require specific actions to trigger,
* the move gesture fires automatically when pointers interact with the target element.
*
* This gesture only works with mouse pointers, not touch or pen.
*/
/**
* Configuration options for the MoveGesture
* Extends the base PointerGestureOptions
*/
/**
* Event data specific to move gesture events
* Includes the source pointer event and standard gesture data
*/
/**
* Type definition for the CustomEvent created by MoveGesture
*/
/**
* State tracking for the MoveGesture
*/
/**
* MoveGesture class for handling pointer movement over elements
*
* This gesture detects when pointers enter, move within, or leave target elements,
* and dispatches corresponding custom events.
*
* This gesture only works with hovering mouse pointers, not touch.
*/
var MoveGesture = class MoveGesture extends PointerGesture {
	state = { lastPosition: null };
	/**
	* Movement threshold in pixels that must be exceeded before the gesture activates.
	* Higher values reduce false positive gesture detection for small movements.
	*/
	constructor(options) {
		super(options);
		this.threshold = options.threshold || 0;
	}
	clone(overrides) {
		return new MoveGesture(_extends({
			name: this.name,
			preventDefault: this.preventDefault,
			stopPropagation: this.stopPropagation,
			threshold: this.threshold,
			minPointers: this.minPointers,
			maxPointers: this.maxPointers,
			requiredKeys: [...this.requiredKeys],
			pointerMode: [...this.pointerMode],
			preventIf: [...this.preventIf],
			pointerOptions: structuredClone(this.pointerOptions)
		}, overrides));
	}
	init(element, pointerManager, gestureRegistry, keyboardManager) {
		super.init(element, pointerManager, gestureRegistry, keyboardManager);
		this.element.addEventListener("pointerenter", this.handleElementEnter);
		this.element.addEventListener("pointerleave", this.handleElementLeave);
	}
	destroy() {
		this.element.removeEventListener("pointerenter", this.handleElementEnter);
		this.element.removeEventListener("pointerleave", this.handleElementLeave);
		this.resetState();
		super.destroy();
	}
	updateOptions(options) {
		super.updateOptions(options);
	}
	resetState() {
		this.isActive = false;
		this.state = { lastPosition: null };
	}
	/**
	* Handle pointer enter events for a specific element
	* @param event The original pointer event
	*/
	handleElementEnter = (event) => {
		if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
		const pointers = this.pointerManager.getPointers() || /* @__PURE__ */ new Map();
		const pointersArray = Array.from(pointers.values());
		if (this.isWithinPointerCount(pointersArray, event.pointerType)) {
			this.isActive = true;
			const currentPosition = {
				x: event.clientX,
				y: event.clientY
			};
			this.state.lastPosition = currentPosition;
			this.emitMoveEvent(this.element, "start", pointersArray, event);
			this.emitMoveEvent(this.element, "ongoing", pointersArray, event);
		}
	};
	/**
	* Handle pointer leave events for a specific element
	* @param event The original pointer event
	*/
	handleElementLeave = (event) => {
		if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
		if (!this.isActive) return;
		const pointers = this.pointerManager.getPointers() || /* @__PURE__ */ new Map();
		const pointersArray = Array.from(pointers.values());
		this.emitMoveEvent(this.element, "end", pointersArray, event);
		this.resetState();
	};
	/**
	* Handle pointer events for the move gesture (only handles move events now)
	* @param pointers Map of active pointers
	* @param event The original pointer event
	*/
	handlePointerEvent = (pointers, event) => {
		if (event.type !== "pointermove" || event.pointerType !== "mouse" && event.pointerType !== "pen") return;
		if (this.preventDefault) event.preventDefault();
		if (this.stopPropagation) event.stopPropagation();
		const pointersArray = Array.from(pointers.values());
		const targetElement = this.getTargetElement(event);
		if (!targetElement) return;
		if (!this.isWithinPointerCount(pointersArray, event.pointerType)) return;
		if (this.shouldPreventGesture(targetElement, event.pointerType)) {
			if (!this.isActive) return;
			this.resetState();
			this.emitMoveEvent(targetElement, "end", pointersArray, event);
			return;
		}
		const currentPosition = {
			x: event.clientX,
			y: event.clientY
		};
		this.state.lastPosition = currentPosition;
		if (!this.isActive) {
			this.isActive = true;
			this.emitMoveEvent(targetElement, "start", pointersArray, event);
		}
		this.emitMoveEvent(targetElement, "ongoing", pointersArray, event);
	};
	/**
	* Emit move-specific events
	* @param element The DOM element the event is related to
	* @param phase The current phase of the gesture (start, ongoing, end)
	* @param pointers Array of active pointers
	* @param event The original pointer event
	*/
	emitMoveEvent(element, phase, pointers, event) {
		const currentPosition = this.state.lastPosition || calculateCentroid(pointers);
		const activeGestures = this.gesturesRegistry.getActiveGestures(element);
		const customEventData = {
			gestureName: this.name,
			centroid: currentPosition,
			target: event.target,
			srcEvent: event,
			phase,
			pointers,
			timeStamp: event.timeStamp,
			activeGestures,
			customData: this.customData
		};
		const eventName = createEventName(this.name, phase);
		const domEvent = new CustomEvent(eventName, {
			bubbles: true,
			cancelable: true,
			composed: true,
			detail: customEventData
		});
		element.dispatchEvent(domEvent);
	}
};
//#endregion
//#region node_modules/@mui/x-internal-gestures/esm/core/gestures/PanGesture.js
/**
* PanGesture - Detects panning (dragging) movements
*
* This gesture tracks pointer dragging movements across elements, firing events when:
* - The drag movement begins and passes the threshold distance (start)
* - The drag movement continues (ongoing)
* - The drag movement ends (end)
*
* The gesture can be configured to recognize movement only in specific directions.
*/
/**
* Configuration options for PanGesture
* Extends PointerGestureOptions with direction constraints
*/
/**
* Event data specific to pan gesture events
* Contains information about movement distance, direction, and velocity
*/
/**
* Type definition for the CustomEvent created by PanGesture
*/
/**
* State tracking for the PanGesture
*/
/**
* PanGesture class for handling panning/dragging interactions
*
* This gesture detects when users drag across elements with one or more pointers,
* and dispatches directional movement events with delta and velocity information.
*/
var PanGesture = class PanGesture extends PointerGesture {
	state = {
		startPointers: /* @__PURE__ */ new Map(),
		startCentroid: null,
		lastCentroid: null,
		movementThresholdReached: false,
		totalDeltaX: 0,
		totalDeltaY: 0,
		activeDeltaX: 0,
		activeDeltaY: 0,
		lastDirection: {
			vertical: null,
			horizontal: null,
			mainAxis: null
		},
		lastDeltas: null
	};
	/**
	* Movement threshold in pixels that must be exceeded before the gesture activates.
	* Higher values reduce false positive gesture detection for small movements.
	*/
	/**
	* Allowed directions for the pan gesture
	* Default allows all directions
	*/
	constructor(options) {
		super(options);
		this.direction = options.direction || [
			"up",
			"down",
			"left",
			"right"
		];
		this.threshold = options.threshold || 0;
	}
	clone(overrides) {
		return new PanGesture(_extends({
			name: this.name,
			preventDefault: this.preventDefault,
			stopPropagation: this.stopPropagation,
			threshold: this.threshold,
			minPointers: this.minPointers,
			maxPointers: this.maxPointers,
			direction: [...this.direction],
			requiredKeys: [...this.requiredKeys],
			pointerMode: [...this.pointerMode],
			preventIf: [...this.preventIf],
			pointerOptions: structuredClone(this.pointerOptions)
		}, overrides));
	}
	destroy() {
		this.resetState();
		super.destroy();
	}
	updateOptions(options) {
		super.updateOptions(options);
		this.direction = options.direction || this.direction;
		this.threshold = options.threshold ?? this.threshold;
	}
	resetState() {
		this.isActive = false;
		this.state = _extends({}, this.state, {
			startPointers: /* @__PURE__ */ new Map(),
			startCentroid: null,
			lastCentroid: null,
			lastDeltas: null,
			activeDeltaX: 0,
			activeDeltaY: 0,
			movementThresholdReached: false,
			lastDirection: {
				vertical: null,
				horizontal: null,
				mainAxis: null
			}
		});
	}
	/**
	* Handle pointer events for the pan gesture
	*/
	handlePointerEvent = (pointers, event) => {
		const pointersArray = Array.from(pointers.values());
		if (event.type === "forceCancel") {
			this.cancel(event.target, pointersArray, event);
			return;
		}
		const targetElement = this.getTargetElement(event);
		if (!targetElement) return;
		if (this.shouldPreventGesture(targetElement, event.pointerType)) {
			this.cancel(targetElement, pointersArray, event);
			return;
		}
		const relevantPointers = this.getRelevantPointers(pointersArray, targetElement);
		if (!this.isWithinPointerCount(relevantPointers, event.pointerType)) {
			this.cancel(targetElement, relevantPointers, event);
			return;
		}
		switch (event.type) {
			case "pointerdown":
				if (!this.isActive && !this.state.startCentroid) {
					relevantPointers.forEach((pointer) => {
						this.state.startPointers.set(pointer.pointerId, pointer);
					});
					this.originalTarget = targetElement;
					this.state.startCentroid = calculateCentroid(relevantPointers);
					this.state.lastCentroid = _extends({}, this.state.startCentroid);
				} else if (this.state.startCentroid && this.state.lastCentroid) {
					const oldCentroid = this.state.lastCentroid;
					const newCentroid = calculateCentroid(relevantPointers);
					const offsetX = newCentroid.x - oldCentroid.x;
					const offsetY = newCentroid.y - oldCentroid.y;
					this.state.startCentroid = {
						x: this.state.startCentroid.x + offsetX,
						y: this.state.startCentroid.y + offsetY
					};
					this.state.lastCentroid = newCentroid;
					relevantPointers.forEach((pointer) => {
						if (!this.state.startPointers.has(pointer.pointerId)) this.state.startPointers.set(pointer.pointerId, pointer);
					});
				}
				break;
			case "pointermove":
				if (this.state.startCentroid && this.isWithinPointerCount(pointersArray, event.pointerType)) {
					const currentCentroid = calculateCentroid(relevantPointers);
					const distanceDeltaX = currentCentroid.x - this.state.startCentroid.x;
					const distanceDeltaY = currentCentroid.y - this.state.startCentroid.y;
					const distance = Math.sqrt(distanceDeltaX * distanceDeltaX + distanceDeltaY * distanceDeltaY);
					const moveDirection = getDirection$1(this.state.lastCentroid ?? this.state.startCentroid, currentCentroid);
					const lastDeltaX = this.state.lastCentroid ? currentCentroid.x - this.state.lastCentroid.x : 0;
					const lastDeltaY = this.state.lastCentroid ? currentCentroid.y - this.state.lastCentroid.y : 0;
					if (!this.state.movementThresholdReached && distance >= this.threshold && isDirectionAllowed(moveDirection, this.direction)) {
						this.state.movementThresholdReached = true;
						this.isActive = true;
						this.state.lastDeltas = {
							x: lastDeltaX,
							y: lastDeltaY
						};
						this.state.totalDeltaX += lastDeltaX;
						this.state.totalDeltaY += lastDeltaY;
						this.state.activeDeltaX += lastDeltaX;
						this.state.activeDeltaY += lastDeltaY;
						this.emitPanEvent(targetElement, "start", relevantPointers, event, currentCentroid);
						this.emitPanEvent(targetElement, "ongoing", relevantPointers, event, currentCentroid);
					} else if (this.state.movementThresholdReached && this.isActive) {
						this.state.lastDeltas = {
							x: lastDeltaX,
							y: lastDeltaY
						};
						this.state.totalDeltaX += lastDeltaX;
						this.state.totalDeltaY += lastDeltaY;
						this.state.activeDeltaX += lastDeltaX;
						this.state.activeDeltaY += lastDeltaY;
						this.emitPanEvent(targetElement, "ongoing", relevantPointers, event, currentCentroid);
					}
					this.state.lastCentroid = currentCentroid;
					this.state.lastDirection = moveDirection;
				}
				break;
			case "pointerup":
			case "pointercancel":
			case "forceCancel":
				if (this.isActive && this.state.movementThresholdReached) {
					const remainingPointers = relevantPointers.filter((p) => p.type !== "pointerup" && p.type !== "pointercancel");
					if (!this.isWithinPointerCount(remainingPointers, event.pointerType)) {
						const currentCentroid = this.state.lastCentroid || this.state.startCentroid;
						if (event.type === "pointercancel") this.emitPanEvent(targetElement, "cancel", relevantPointers, event, currentCentroid);
						this.emitPanEvent(targetElement, "end", relevantPointers, event, currentCentroid);
						this.resetState();
					} else if (remainingPointers.length >= 1 && this.state.lastCentroid) {
						const newCentroid = calculateCentroid(remainingPointers);
						const offsetX = newCentroid.x - this.state.lastCentroid.x;
						const offsetY = newCentroid.y - this.state.lastCentroid.y;
						this.state.startCentroid = {
							x: this.state.startCentroid.x + offsetX,
							y: this.state.startCentroid.y + offsetY
						};
						this.state.lastCentroid = newCentroid;
						const removedPointerId = relevantPointers.find((p) => p.type === "pointerup" || p.type === "pointercancel")?.pointerId;
						if (removedPointerId !== void 0) this.state.startPointers.delete(removedPointerId);
					}
				} else this.resetState();
				break;
			default: break;
		}
	};
	/**
	* Emit pan-specific events with additional data
	*/
	emitPanEvent(element, phase, pointers, event, currentCentroid) {
		if (!this.state.startCentroid) return;
		const deltaX = this.state.lastDeltas?.x ?? 0;
		const deltaY = this.state.lastDeltas?.y ?? 0;
		const firstPointer = this.state.startPointers.values().next().value;
		const timeElapsed = firstPointer ? (event.timeStamp - firstPointer.timeStamp) / 1e3 : 0;
		const velocityX = timeElapsed > 0 ? deltaX / timeElapsed : 0;
		const velocityY = timeElapsed > 0 ? deltaY / timeElapsed : 0;
		const velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
		const activeGestures = this.gesturesRegistry.getActiveGestures(element);
		const customEventData = {
			gestureName: this.name,
			initialCentroid: this.state.startCentroid,
			centroid: currentCentroid,
			target: event.target,
			srcEvent: event,
			phase,
			pointers,
			timeStamp: event.timeStamp,
			deltaX,
			deltaY,
			direction: this.state.lastDirection,
			velocityX,
			velocityY,
			velocity,
			totalDeltaX: this.state.totalDeltaX,
			totalDeltaY: this.state.totalDeltaY,
			activeDeltaX: this.state.activeDeltaX,
			activeDeltaY: this.state.activeDeltaY,
			activeGestures,
			customData: this.customData
		};
		const eventName = createEventName(this.name, phase);
		const domEvent = new CustomEvent(eventName, {
			bubbles: true,
			cancelable: true,
			composed: true,
			detail: customEventData
		});
		element.dispatchEvent(domEvent);
		if (this.preventDefault) event.preventDefault();
		if (this.stopPropagation) event.stopPropagation();
	}
	/**
	* Cancel the current gesture
	*/
	cancel(element, pointers, event) {
		if (this.isActive) {
			const el = element ?? this.element;
			this.emitPanEvent(el, "cancel", pointers, event, this.state.lastCentroid);
			this.emitPanEvent(el, "end", pointers, event, this.state.lastCentroid);
		}
		this.resetState();
	}
};
//#endregion
//#region node_modules/@mui/x-internal-gestures/esm/core/gestures/PinchGesture.js
/**
* PinchGesture - Detects pinch (zoom) movements with two or more pointers
*
* This gesture tracks when multiple pointers move toward or away from each other, firing events when:
* - Two or more pointers begin moving (start)
* - The pointers continue changing distance (ongoing)
* - One or more pointers are released or lifted (end)
*
* This gesture is commonly used to implement zoom functionality in touch interfaces.
*/
/**
* Configuration options for the PinchGesture
* Uses the same options as the base PointerGesture
*/
/**
* Event data specific to pinch gesture events
* Contains information about scale, distance, and velocity
*/
/**
* Type definition for the CustomEvent created by PinchGesture
*/
/**
* State tracking for the PinchGesture
*/
/**
* PinchGesture class for handling pinch/zoom interactions
*
* This gesture detects when users move multiple pointers toward or away from each other,
* and dispatches scale-related events with distance and velocity information.
*/
var PinchGesture = class PinchGesture extends PointerGesture {
	state = {
		startDistance: 0,
		lastDistance: 0,
		lastScale: 1,
		lastTime: 0,
		velocity: 0,
		totalScale: 1,
		deltaScale: 0
	};
	/**
	* Movement threshold in pixels that must be exceeded before the gesture activates.
	* Higher values reduce false positive gesture detection for small movements.
	*/
	constructor(options) {
		super(_extends({}, options, { minPointers: options.minPointers ?? 2 }));
		this.threshold = options.threshold ?? 0;
	}
	clone(overrides) {
		return new PinchGesture(_extends({
			name: this.name,
			preventDefault: this.preventDefault,
			stopPropagation: this.stopPropagation,
			threshold: this.threshold,
			minPointers: this.minPointers,
			maxPointers: this.maxPointers,
			requiredKeys: [...this.requiredKeys],
			pointerMode: [...this.pointerMode],
			preventIf: [...this.preventIf],
			pointerOptions: structuredClone(this.pointerOptions)
		}, overrides));
	}
	destroy() {
		this.resetState();
		super.destroy();
	}
	updateOptions(options) {
		super.updateOptions(options);
	}
	resetState() {
		this.isActive = false;
		this.state = _extends({}, this.state, {
			startDistance: 0,
			lastDistance: 0,
			lastScale: 1,
			lastTime: 0,
			velocity: 0,
			deltaScale: 0
		});
	}
	/**
	* Handle pointer events for the pinch gesture
	*/
	handlePointerEvent = (pointers, event) => {
		const pointersArray = Array.from(pointers.values());
		const targetElement = this.getTargetElement(event);
		if (!targetElement) return;
		if (this.shouldPreventGesture(targetElement, event.pointerType)) {
			if (this.isActive) {
				this.emitPinchEvent(targetElement, "cancel", pointersArray, event);
				this.resetState();
			}
			return;
		}
		const relevantPointers = this.getRelevantPointers(pointersArray, targetElement);
		switch (event.type) {
			case "pointerdown":
				if (relevantPointers.length >= 2 && !this.isActive) {
					const initialDistance = calculateAverageDistance(relevantPointers);
					this.state.startDistance = initialDistance;
					this.state.lastDistance = initialDistance;
					this.state.lastTime = event.timeStamp;
					this.originalTarget = targetElement;
				} else if (this.isActive && relevantPointers.length >= 2) {
					const newDistance = calculateAverageDistance(relevantPointers);
					this.state.startDistance = newDistance / this.state.lastScale;
					this.state.lastDistance = newDistance;
					this.state.lastTime = event.timeStamp;
				}
				break;
			case "pointermove":
				if (this.state.startDistance && this.isWithinPointerCount(relevantPointers, event.pointerType)) {
					const currentDistance = calculateAverageDistance(relevantPointers);
					const distanceChange = Math.abs(currentDistance - this.state.lastDistance);
					if (distanceChange !== 0 && distanceChange >= this.threshold) {
						const scale = this.state.startDistance ? currentDistance / this.state.startDistance : 1;
						const scaleChange = scale / this.state.lastScale;
						this.state.totalScale *= scaleChange;
						const deltaTime = (event.timeStamp - this.state.lastTime) / 1e3;
						if (this.state.lastDistance) {
							const result = (currentDistance - this.state.lastDistance) / deltaTime;
							this.state.velocity = Number.isNaN(result) ? 0 : result;
						}
						this.state.lastDistance = currentDistance;
						this.state.deltaScale = scale - this.state.lastScale;
						this.state.lastScale = scale;
						this.state.lastTime = event.timeStamp;
						if (!this.isActive) {
							this.isActive = true;
							this.emitPinchEvent(targetElement, "start", relevantPointers, event);
							this.emitPinchEvent(targetElement, "ongoing", relevantPointers, event);
						} else this.emitPinchEvent(targetElement, "ongoing", relevantPointers, event);
					}
				}
				break;
			case "pointerup":
			case "pointercancel":
			case "forceCancel":
				if (this.isActive) {
					const remainingPointers = relevantPointers.filter((p) => p.type !== "pointerup" && p.type !== "pointercancel");
					if (!this.isWithinPointerCount(remainingPointers, event.pointerType)) {
						if (event.type === "pointercancel") this.emitPinchEvent(targetElement, "cancel", relevantPointers, event);
						this.emitPinchEvent(targetElement, "end", relevantPointers, event);
						this.resetState();
					} else if (remainingPointers.length >= 2) {
						const newDistance = calculateAverageDistance(remainingPointers);
						this.state.startDistance = newDistance / this.state.lastScale;
						this.state.lastDistance = newDistance;
						this.state.lastTime = event.timeStamp;
					}
				}
				break;
			default: break;
		}
	};
	/**
	* Emit pinch-specific events with additional data
	*/
	emitPinchEvent(element, phase, pointers, event) {
		const centroid = calculateCentroid(pointers);
		const distance = this.state.lastDistance;
		const scale = this.state.lastScale;
		const activeGestures = this.gesturesRegistry.getActiveGestures(element);
		const customEventData = {
			gestureName: this.name,
			centroid,
			target: event.target,
			srcEvent: event,
			phase,
			pointers,
			timeStamp: event.timeStamp,
			scale,
			deltaScale: this.state.deltaScale,
			totalScale: this.state.totalScale,
			distance,
			velocity: this.state.velocity,
			activeGestures,
			direction: getPinchDirection(this.state.velocity),
			customData: this.customData
		};
		if (this.preventDefault) event.preventDefault();
		if (this.stopPropagation) event.stopPropagation();
		const eventName = createEventName(this.name, phase);
		const domEvent = new CustomEvent(eventName, {
			bubbles: true,
			cancelable: true,
			composed: true,
			detail: customEventData
		});
		element.dispatchEvent(domEvent);
	}
};
//#endregion
//#region node_modules/@mui/x-internal-gestures/esm/core/gestures/PressGesture.js
/**
* PressGesture - Detects press and hold interactions
*
* This gesture tracks when users press and hold on an element for a specified duration, firing events when:
* - The press begins and passes the holding threshold time (start, ongoing)
* - The press ends (end)
* - The press is canceled by movement beyond threshold (cancel)
*
* This gesture is commonly used for contextual menus, revealing additional options, or alternate actions.
*/
/**
* Configuration options for PressGesture
* Extends PointerGestureOptions with press-specific options
*/
/**
* Event data specific to press gesture events
* Contains information about the press location and duration
*/
/**
* Type definition for the CustomEvent created by PressGesture
*/
/**
* State tracking for the PressGesture
*/
/**
* PressGesture class for handling press/hold interactions
*
* This gesture detects when users press and hold on an element for a specified duration,
* and dispatches press-related events when the user holds long enough.
*
* The `start` and `ongoing` events are dispatched at the same time once the press threshold is reached.
* If the press is canceled (event.g., by moving too far), a `cancel` event is dispatched before the `end` event.
*/
var PressGesture = class PressGesture extends PointerGesture {
	state = {
		startCentroid: null,
		lastPosition: null,
		timerId: null,
		startTime: 0,
		pressThresholdReached: false
	};
	/**
	* Duration in milliseconds required to hold before the press gesture is recognized
	*/
	/**
	* Maximum distance a pointer can move for a gesture to still be considered a press
	*/
	constructor(options) {
		super(options);
		this.duration = options.duration ?? 500;
		this.maxDistance = options.maxDistance ?? 10;
	}
	clone(overrides) {
		return new PressGesture(_extends({
			name: this.name,
			preventDefault: this.preventDefault,
			stopPropagation: this.stopPropagation,
			minPointers: this.minPointers,
			maxPointers: this.maxPointers,
			duration: this.duration,
			maxDistance: this.maxDistance,
			requiredKeys: [...this.requiredKeys],
			pointerMode: [...this.pointerMode],
			preventIf: [...this.preventIf],
			pointerOptions: structuredClone(this.pointerOptions)
		}, overrides));
	}
	destroy() {
		this.clearPressTimer();
		this.resetState();
		super.destroy();
	}
	updateOptions(options) {
		super.updateOptions(options);
		this.duration = options.duration ?? this.duration;
		this.maxDistance = options.maxDistance ?? this.maxDistance;
	}
	resetState() {
		this.clearPressTimer();
		this.isActive = false;
		this.state = _extends({}, this.state, {
			startCentroid: null,
			lastPosition: null,
			timerId: null,
			startTime: 0,
			pressThresholdReached: false
		});
	}
	/**
	* Clear the press timer if it's active
	*/
	clearPressTimer() {
		if (this.state.timerId !== null) {
			clearTimeout(this.state.timerId);
			this.state.timerId = null;
		}
	}
	/**
	* Handle pointer events for the press gesture
	*/
	handlePointerEvent = (pointers, event) => {
		const pointersArray = Array.from(pointers.values());
		if (event.type === "forceCancel") {
			this.cancelPress(event.target, pointersArray, event);
			return;
		}
		const targetElement = this.getTargetElement(event);
		if (!targetElement) return;
		if (this.shouldPreventGesture(targetElement, event.pointerType)) {
			if (this.isActive) this.cancelPress(targetElement, pointersArray, event);
			return;
		}
		const relevantPointers = this.getRelevantPointers(pointersArray, targetElement);
		if (!this.isWithinPointerCount(relevantPointers, event.pointerType)) {
			if (this.isActive) this.cancelPress(targetElement, relevantPointers, event);
			return;
		}
		switch (event.type) {
			case "pointerdown":
				if (!this.isActive && !this.state.startCentroid) {
					this.state.startCentroid = calculateCentroid(relevantPointers);
					this.state.lastPosition = _extends({}, this.state.startCentroid);
					this.state.startTime = event.timeStamp;
					this.isActive = true;
					this.originalTarget = targetElement;
					this.clearPressTimer();
					this.state.timerId = setTimeout(() => {
						if (this.isActive && this.state.startCentroid) {
							this.state.pressThresholdReached = true;
							const lastPosition = this.state.lastPosition;
							this.emitPressEvent(targetElement, "start", relevantPointers, event, lastPosition);
							this.emitPressEvent(targetElement, "ongoing", relevantPointers, event, lastPosition);
						}
					}, this.duration);
				}
				break;
			case "pointermove":
				if (this.isActive && this.state.startCentroid) {
					const currentPosition = calculateCentroid(relevantPointers);
					this.state.lastPosition = currentPosition;
					const deltaX = currentPosition.x - this.state.startCentroid.x;
					const deltaY = currentPosition.y - this.state.startCentroid.y;
					if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) > this.maxDistance) this.cancelPress(targetElement, relevantPointers, event);
				}
				break;
			case "pointerup":
				if (this.isActive) {
					if (this.state.pressThresholdReached) {
						const position = this.state.lastPosition || this.state.startCentroid;
						this.emitPressEvent(targetElement, "end", relevantPointers, event, position);
					}
					this.resetState();
				}
				break;
			case "pointercancel":
			case "forceCancel":
				this.cancelPress(targetElement, relevantPointers, event);
				break;
			default: break;
		}
	};
	/**
	* Emit press-specific events with additional data
	*/
	emitPressEvent(element, phase, pointers, event, position) {
		const activeGestures = this.gesturesRegistry.getActiveGestures(element);
		const currentDuration = event.timeStamp - this.state.startTime;
		const customEventData = {
			gestureName: this.name,
			centroid: position,
			target: event.target,
			srcEvent: event,
			phase,
			pointers,
			timeStamp: event.timeStamp,
			x: position.x,
			y: position.y,
			duration: currentDuration,
			activeGestures,
			customData: this.customData
		};
		const eventName = createEventName(this.name, phase);
		const domEvent = new CustomEvent(eventName, {
			bubbles: true,
			cancelable: true,
			composed: true,
			detail: customEventData
		});
		element.dispatchEvent(domEvent);
		if (this.preventDefault) event.preventDefault();
		if (this.stopPropagation) event.stopPropagation();
	}
	/**
	* Cancel the current press gesture
	*/
	cancelPress(element, pointers, event) {
		if (this.isActive && this.state.pressThresholdReached) {
			const position = this.state.lastPosition || this.state.startCentroid;
			this.emitPressEvent(element ?? this.element, "cancel", pointers, event, position);
			this.emitPressEvent(element ?? this.element, "end", pointers, event, position);
		}
		this.resetState();
	}
};
//#endregion
//#region node_modules/@mui/x-internal-gestures/esm/core/gestures/PressAndDragGesture.js
/**
* PressAndDragGesture - Detects press followed by drag gestures using composition
*
* This gesture uses internal PressGesture and PanGesture instances to:
* 1. First, detect a press (hold for specified duration without movement)
* 2. Then, track drag movements from the press position
*
* The gesture fires events when:
* - A press is completed (press phase)
* - Drag movement begins and passes threshold (dragStart)
* - Drag movement continues (drag)
* - Drag movement ends (dragEnd)
* - The gesture is canceled at any point
*
* This is ideal for panning operations where you want to hold first, then drag.
*/
/**
* Configuration options for PressAndDragGesture
* Extends PointerGestureOptions with press and drag specific settings
*/
/**
* Event data specific to press and drag gesture events
* Contains information about the gesture state, position, and movement
*/
/**
* Type definition for the CustomEvent created by PressAndDragGesture
*/
/**
* Represents the current phase of the PressAndDrag gesture
*/
/**
* State tracking for the PressAndDragGesture
*/
/**
* PressAndDragGesture class for handling press followed by drag interactions
*
* This gesture composes press and drag logic patterns from PressGesture and PanGesture
* into a single coordinated gesture that handles press-then-drag interactions.
*/
var PressAndDragGesture = class PressAndDragGesture extends PointerGesture {
	state = {
		phase: "waitingForPress",
		dragTimeoutId: null
	};
	/**
	* Duration required for press recognition
	*/
	/**
	* Maximum distance a pointer can move during press for it to still be considered a press
	*/
	/**
	* Maximum time between press completion and drag start
	*/
	/**
	* Movement threshold for drag activation
	*/
	/**
	* Allowed directions for the drag gesture
	*/
	constructor(options) {
		super(options);
		this.pressDuration = options.pressDuration ?? 500;
		this.pressMaxDistance = options.pressMaxDistance ?? 10;
		this.dragTimeout = options.dragTimeout ?? 1e3;
		this.dragThreshold = options.dragThreshold ?? 0;
		this.dragDirection = options.dragDirection || [
			"up",
			"down",
			"left",
			"right"
		];
		this.pressGesture = new PressGesture({
			name: `${this.name}-press`,
			duration: this.pressDuration,
			maxDistance: this.pressMaxDistance,
			maxPointers: this.maxPointers,
			pointerMode: this.pointerMode,
			requiredKeys: this.requiredKeys,
			preventIf: this.preventIf,
			pointerOptions: structuredClone(this.pointerOptions)
		});
		this.panGesture = new PanGesture({
			name: `${this.name}-pan`,
			minPointers: this.minPointers,
			maxPointers: this.maxPointers,
			threshold: this.dragThreshold,
			direction: this.dragDirection,
			pointerMode: this.pointerMode,
			requiredKeys: this.requiredKeys,
			preventIf: this.preventIf,
			pointerOptions: structuredClone(this.pointerOptions)
		});
	}
	clone(overrides) {
		return new PressAndDragGesture(_extends({
			name: this.name,
			preventDefault: this.preventDefault,
			stopPropagation: this.stopPropagation,
			minPointers: this.minPointers,
			maxPointers: this.maxPointers,
			pressDuration: this.pressDuration,
			pressMaxDistance: this.pressMaxDistance,
			dragTimeout: this.dragTimeout,
			dragThreshold: this.dragThreshold,
			dragDirection: [...this.dragDirection],
			requiredKeys: [...this.requiredKeys],
			pointerMode: [...this.pointerMode],
			preventIf: [...this.preventIf],
			pointerOptions: structuredClone(this.pointerOptions)
		}, overrides));
	}
	init(element, pointerManager, gestureRegistry, keyboardManager) {
		super.init(element, pointerManager, gestureRegistry, keyboardManager);
		this.pressGesture.init(element, pointerManager, gestureRegistry, keyboardManager);
		this.panGesture.init(element, pointerManager, gestureRegistry, keyboardManager);
		this.element.addEventListener(this.pressGesture.name, this.pressHandler);
		this.element.addEventListener(`${this.panGesture.name}Start`, this.dragStartHandler);
		this.element.addEventListener(this.panGesture.name, this.dragMoveHandler);
		this.element.addEventListener(`${this.panGesture.name}End`, this.dragEndHandler);
		this.element.addEventListener(`${this.panGesture.name}Cancel`, this.dragEndHandler);
	}
	destroy() {
		this.resetState();
		this.pressGesture.destroy();
		this.panGesture.destroy();
		this.element.removeEventListener(this.pressGesture.name, this.pressHandler);
		this.element.removeEventListener(`${this.panGesture.name}Start`, this.dragStartHandler);
		this.element.removeEventListener(this.panGesture.name, this.dragMoveHandler);
		this.element.removeEventListener(`${this.panGesture.name}End`, this.dragEndHandler);
		this.element.removeEventListener(`${this.panGesture.name}Cancel`, this.dragEndHandler);
		super.destroy();
	}
	updateOptions(options) {
		super.updateOptions(options);
		this.pressDuration = options.pressDuration ?? this.pressDuration;
		this.pressMaxDistance = options.pressMaxDistance ?? this.pressMaxDistance;
		this.dragTimeout = options.dragTimeout ?? this.dragTimeout;
		this.dragThreshold = options.dragThreshold ?? this.dragThreshold;
		this.dragDirection = options.dragDirection || this.dragDirection;
		this.element.dispatchEvent(new CustomEvent(`${this.panGesture.name}ChangeOptions`, { detail: {
			minPointers: this.minPointers,
			maxPointers: this.maxPointers,
			threshold: this.dragThreshold,
			direction: this.dragDirection,
			pointerMode: this.pointerMode,
			requiredKeys: this.requiredKeys,
			preventIf: this.preventIf,
			pointerOptions: structuredClone(this.pointerOptions)
		} }));
		this.element.dispatchEvent(new CustomEvent(`${this.pressGesture.name}ChangeOptions`, { detail: {
			duration: this.pressDuration,
			maxDistance: this.pressMaxDistance,
			maxPointers: this.maxPointers,
			pointerMode: this.pointerMode,
			requiredKeys: this.requiredKeys,
			preventIf: this.preventIf,
			pointerOptions: structuredClone(this.pointerOptions)
		} }));
	}
	resetState() {
		if (this.state.dragTimeoutId !== null) clearTimeout(this.state.dragTimeoutId);
		this.restoreTouchAction();
		this.isActive = false;
		this.state = {
			phase: "waitingForPress",
			dragTimeoutId: null
		};
	}
	/**
	* This can be empty because the PressAndDragGesture relies on PressGesture and PanGesture to handle pointer events
	* The internal gestures will manage their own state and events, while this class coordinates between them
	*/
	handlePointerEvent() {}
	pressHandler = () => {
		if (this.state.phase !== "waitingForPress") return;
		this.state.phase = "pressDetected";
		this.setTouchAction();
		this.state.dragTimeoutId = setTimeout(() => {
			this.resetState();
		}, this.dragTimeout);
	};
	dragStartHandler = (event) => {
		if (this.state.phase !== "pressDetected") return;
		if (this.state.dragTimeoutId !== null) {
			clearTimeout(this.state.dragTimeoutId);
			this.state.dragTimeoutId = null;
		}
		this.restoreTouchAction();
		this.state.phase = "dragging";
		this.isActive = true;
		this.element.dispatchEvent(new CustomEvent(createEventName(this.name, event.detail.phase), event));
	};
	dragMoveHandler = (event) => {
		if (this.state.phase !== "dragging") return;
		this.element.dispatchEvent(new CustomEvent(createEventName(this.name, event.detail.phase), event));
	};
	dragEndHandler = (event) => {
		if (this.state.phase !== "dragging") return;
		this.resetState();
		this.element.dispatchEvent(new CustomEvent(createEventName(this.name, event.detail.phase), event));
	};
	setTouchAction() {
		this.element.addEventListener("touchstart", preventDefault$1, { passive: false });
		this.element.addEventListener("touchmove", preventDefault$1, { passive: false });
		this.element.addEventListener("touchend", preventDefault$1, { passive: false });
	}
	restoreTouchAction() {
		this.element.removeEventListener("touchstart", preventDefault$1);
		this.element.removeEventListener("touchmove", preventDefault$1);
		this.element.removeEventListener("touchend", preventDefault$1);
	}
};
//#endregion
//#region node_modules/@mui/x-internal-gestures/esm/core/gestures/TapGesture.js
/**
* TapGesture - Detects tap (quick touch without movement) gestures
*
* This gesture tracks simple tap interactions on elements, firing a single event when:
* - A complete tap is detected (pointerup after brief touch without excessive movement)
* - The tap is canceled (event.g., moved too far or held too long)
*/
/**
* Configuration options for TapGesture
* Extends PointerGestureOptions with tap-specific settings
*/
/**
* Event data specific to tap gesture events
* Contains information about the tap location and counts
*/
/**
* Type definition for the CustomEvent created by TapGesture
*/
/**
* State tracking for the TapGesture
*/
/**
* TapGesture class for handling tap interactions
*
* This gesture detects when users tap on elements without significant movement,
* and can recognize single taps, double taps, or other multi-tap sequences.
*/
var TapGesture = class TapGesture extends PointerGesture {
	state = {
		startCentroid: null,
		currentTapCount: 0,
		lastTapTime: 0,
		lastPosition: null
	};
	/**
	* Maximum distance a pointer can move for a gesture to still be considered a tap
	*/
	/**
	* Number of consecutive taps to detect
	*/
	constructor(options) {
		super(options);
		this.maxDistance = options.maxDistance ?? 10;
		this.taps = options.taps ?? 1;
	}
	clone(overrides) {
		return new TapGesture(_extends({
			name: this.name,
			preventDefault: this.preventDefault,
			stopPropagation: this.stopPropagation,
			minPointers: this.minPointers,
			maxPointers: this.maxPointers,
			maxDistance: this.maxDistance,
			taps: this.taps,
			requiredKeys: [...this.requiredKeys],
			pointerMode: [...this.pointerMode],
			preventIf: [...this.preventIf],
			pointerOptions: structuredClone(this.pointerOptions)
		}, overrides));
	}
	destroy() {
		this.resetState();
		super.destroy();
	}
	updateOptions(options) {
		super.updateOptions(options);
		this.maxDistance = options.maxDistance ?? this.maxDistance;
		this.taps = options.taps ?? this.taps;
	}
	resetState() {
		this.isActive = false;
		this.state = {
			startCentroid: null,
			currentTapCount: 0,
			lastTapTime: 0,
			lastPosition: null
		};
	}
	/**
	* Handle pointer events for the tap gesture
	*/
	handlePointerEvent = (pointers, event) => {
		const pointersArray = Array.from(pointers.values());
		const targetElement = this.getTargetElement(event);
		if (!targetElement) return;
		const relevantPointers = this.getRelevantPointers(pointersArray, targetElement);
		if (this.shouldPreventGesture(targetElement, event.pointerType) || !this.isWithinPointerCount(relevantPointers, event.pointerType)) {
			if (this.isActive) this.cancelTap(targetElement, relevantPointers, event);
			return;
		}
		switch (event.type) {
			case "pointerdown":
				if (!this.isActive) {
					this.state.startCentroid = calculateCentroid(relevantPointers);
					this.state.lastPosition = _extends({}, this.state.startCentroid);
					this.isActive = true;
					this.originalTarget = targetElement;
				}
				break;
			case "pointermove":
				if (this.isActive && this.state.startCentroid) {
					const currentPosition = calculateCentroid(relevantPointers);
					this.state.lastPosition = currentPosition;
					const deltaX = currentPosition.x - this.state.startCentroid.x;
					const deltaY = currentPosition.y - this.state.startCentroid.y;
					if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) > this.maxDistance) this.cancelTap(targetElement, relevantPointers, event);
				}
				break;
			case "pointerup":
				if (this.isActive) {
					this.state.currentTapCount += 1;
					const position = this.state.lastPosition || this.state.startCentroid;
					if (!position) {
						this.cancelTap(targetElement, relevantPointers, event);
						return;
					}
					if (this.state.currentTapCount >= this.taps) {
						this.fireTapEvent(targetElement, relevantPointers, event, position);
						this.resetState();
					} else {
						this.state.lastTapTime = event.timeStamp;
						this.isActive = false;
						this.state.startCentroid = null;
						setTimeout(() => {
							if (this.state && this.state.currentTapCount > 0 && this.state.currentTapCount < this.taps) this.state.currentTapCount = 0;
						}, 300);
					}
				}
				break;
			case "pointercancel":
			case "forceCancel":
				this.cancelTap(targetElement, relevantPointers, event);
				break;
			default: break;
		}
	};
	/**
	* Fire the main tap event when a valid tap is detected
	*/
	fireTapEvent(element, pointers, event, position) {
		const activeGestures = this.gesturesRegistry.getActiveGestures(element);
		const customEventData = {
			gestureName: this.name,
			centroid: position,
			target: event.target,
			srcEvent: event,
			phase: "end",
			pointers,
			timeStamp: event.timeStamp,
			x: position.x,
			y: position.y,
			tapCount: this.state.currentTapCount,
			activeGestures,
			customData: this.customData
		};
		const domEvent = new CustomEvent(this.name, {
			bubbles: true,
			cancelable: true,
			composed: true,
			detail: customEventData
		});
		element.dispatchEvent(domEvent);
		if (this.preventDefault) event.preventDefault();
		if (this.stopPropagation) event.stopPropagation();
	}
	/**
	* Cancel the current tap gesture
	*/
	cancelTap(element, pointers, event) {
		if (this.state.startCentroid || this.state.lastPosition) {
			const position = this.state.lastPosition || this.state.startCentroid;
			const activeGestures = this.gesturesRegistry.getActiveGestures(element);
			const customEventData = {
				gestureName: this.name,
				centroid: position,
				target: event.target,
				srcEvent: event,
				phase: "cancel",
				pointers,
				timeStamp: event.timeStamp,
				x: position.x,
				y: position.y,
				tapCount: this.state.currentTapCount,
				activeGestures,
				customData: this.customData
			};
			const eventName = createEventName(this.name, "cancel");
			const domEvent = new CustomEvent(eventName, {
				bubbles: true,
				cancelable: true,
				composed: true,
				detail: customEventData
			});
			element.dispatchEvent(domEvent);
		}
		this.resetState();
	}
};
//#endregion
//#region node_modules/@mui/x-internal-gestures/esm/core/gestures/TapAndDragGesture.js
/**
* TapAndDragGesture - Detects tap followed by drag gestures using composition
*
* This gesture uses internal TapGesture and PanGesture instances to:
* 1. First, detect a tap (quick touch without movement)
* 2. Then, track drag movements on the next pointer down
*
* The gesture fires events when:
* - A tap is completed (tap phase)
* - Drag movement begins and passes threshold (dragStart)
* - Drag movement continues (drag)
* - Drag movement ends (dragEnd)
* - The gesture is canceled at any point
*/
/**
* Configuration options for TapAndDragGesture
* Extends PointerGestureOptions with tap and drag specific settings
*/
/**
* Event data specific to tap and drag gesture events
* Contains information about the gesture state, position, and movement
*/
/**
* Type definition for the CustomEvent created by TapAndDragGesture
*/
/**
* Represents the current phase of the TapAndDrag gesture
*/
/**
* State tracking for the TapAndDragGesture
*/
/**
* TapAndDragGesture class for handling tap followed by drag interactions
*
* This gesture composes tap and drag logic patterns from TapGesture and PanGesture
* into a single coordinated gesture that handles tap-then-drag interactions.
*/
var TapAndDragGesture = class TapAndDragGesture extends PointerGesture {
	state = {
		phase: "waitingForTap",
		dragTimeoutId: null
	};
	/**
	* Maximum distance a pointer can move during tap for it to still be considered a tap
	* (Following TapGesture pattern)
	*/
	/**
	* Maximum time between tap completion and drag start
	*/
	/**
	* Movement threshold for drag activation
	*/
	/**
	* Allowed directions for the drag gesture
	*/
	constructor(options) {
		super(options);
		this.tapMaxDistance = options.tapMaxDistance ?? 10;
		this.dragTimeout = options.dragTimeout ?? 1e3;
		this.dragThreshold = options.dragThreshold ?? 0;
		this.dragDirection = options.dragDirection || [
			"up",
			"down",
			"left",
			"right"
		];
		this.tapGesture = new TapGesture({
			name: `${this.name}-tap`,
			maxDistance: this.tapMaxDistance,
			maxPointers: this.maxPointers,
			pointerMode: this.pointerMode,
			requiredKeys: this.requiredKeys,
			preventIf: this.preventIf,
			pointerOptions: structuredClone(this.pointerOptions)
		});
		this.panGesture = new PanGesture({
			name: `${this.name}-pan`,
			minPointers: this.minPointers,
			maxPointers: this.maxPointers,
			threshold: this.dragThreshold,
			direction: this.dragDirection,
			pointerMode: this.pointerMode,
			requiredKeys: this.requiredKeys,
			preventIf: this.preventIf,
			pointerOptions: structuredClone(this.pointerOptions)
		});
	}
	clone(overrides) {
		return new TapAndDragGesture(_extends({
			name: this.name,
			preventDefault: this.preventDefault,
			stopPropagation: this.stopPropagation,
			minPointers: this.minPointers,
			maxPointers: this.maxPointers,
			tapMaxDistance: this.tapMaxDistance,
			dragTimeout: this.dragTimeout,
			dragThreshold: this.dragThreshold,
			dragDirection: [...this.dragDirection],
			requiredKeys: [...this.requiredKeys],
			pointerMode: [...this.pointerMode],
			preventIf: [...this.preventIf],
			pointerOptions: structuredClone(this.pointerOptions)
		}, overrides));
	}
	init(element, pointerManager, gestureRegistry, keyboardManager) {
		super.init(element, pointerManager, gestureRegistry, keyboardManager);
		this.tapGesture.init(element, pointerManager, gestureRegistry, keyboardManager);
		this.panGesture.init(element, pointerManager, gestureRegistry, keyboardManager);
		this.element.addEventListener(this.tapGesture.name, this.tapHandler);
		this.element.addEventListener(`${this.panGesture.name}Start`, this.dragStartHandler);
		this.element.addEventListener(this.panGesture.name, this.dragMoveHandler);
		this.element.addEventListener(`${this.panGesture.name}End`, this.dragEndHandler);
		this.element.addEventListener(`${this.panGesture.name}Cancel`, this.dragEndHandler);
	}
	destroy() {
		this.resetState();
		this.tapGesture.destroy();
		this.panGesture.destroy();
		this.element.removeEventListener(this.tapGesture.name, this.tapHandler);
		this.element.removeEventListener(`${this.panGesture.name}Start`, this.dragStartHandler);
		this.element.removeEventListener(this.panGesture.name, this.dragMoveHandler);
		this.element.removeEventListener(`${this.panGesture.name}End`, this.dragEndHandler);
		this.element.removeEventListener(`${this.panGesture.name}Cancel`, this.dragEndHandler);
		super.destroy();
	}
	updateOptions(options) {
		super.updateOptions(options);
		this.tapMaxDistance = options.tapMaxDistance ?? this.tapMaxDistance;
		this.dragTimeout = options.dragTimeout ?? this.dragTimeout;
		this.dragThreshold = options.dragThreshold ?? this.dragThreshold;
		this.dragDirection = options.dragDirection || this.dragDirection;
		this.element.dispatchEvent(new CustomEvent(`${this.panGesture.name}ChangeOptions`, { detail: {
			minPointers: this.minPointers,
			maxPointers: this.maxPointers,
			threshold: this.dragThreshold,
			direction: this.dragDirection,
			pointerMode: this.pointerMode,
			requiredKeys: this.requiredKeys,
			preventIf: this.preventIf,
			pointerOptions: structuredClone(this.pointerOptions)
		} }));
		this.element.dispatchEvent(new CustomEvent(`${this.tapGesture.name}ChangeOptions`, { detail: {
			maxDistance: this.tapMaxDistance,
			maxPointers: this.maxPointers,
			pointerMode: this.pointerMode,
			requiredKeys: this.requiredKeys,
			preventIf: this.preventIf,
			pointerOptions: structuredClone(this.pointerOptions)
		} }));
	}
	resetState() {
		if (this.state.dragTimeoutId !== null) clearTimeout(this.state.dragTimeoutId);
		this.restoreTouchAction();
		this.isActive = false;
		this.state = {
			phase: "waitingForTap",
			dragTimeoutId: null
		};
	}
	/**
	* This can be empty because the TapAndDragGesture relies on TapGesture and PanGesture to handle pointer events
	* The internal gestures will manage their own state and events, while this class coordinates between them
	*/
	handlePointerEvent() {}
	tapHandler = () => {
		if (this.state.phase !== "waitingForTap") return;
		this.state.phase = "tapDetected";
		this.setTouchAction();
		this.state.dragTimeoutId = setTimeout(() => {
			this.resetState();
		}, this.dragTimeout);
	};
	dragStartHandler = (event) => {
		if (this.state.phase !== "tapDetected") return;
		if (this.state.dragTimeoutId !== null) {
			clearTimeout(this.state.dragTimeoutId);
			this.state.dragTimeoutId = null;
		}
		this.restoreTouchAction();
		this.state.phase = "dragging";
		this.isActive = true;
		this.element.dispatchEvent(new CustomEvent(createEventName(this.name, event.detail.phase), event));
	};
	dragMoveHandler = (event) => {
		if (this.state.phase !== "dragging") return;
		this.element.dispatchEvent(new CustomEvent(createEventName(this.name, event.detail.phase), event));
	};
	dragEndHandler = (event) => {
		if (this.state.phase !== "dragging") return;
		this.resetState();
		this.element.dispatchEvent(new CustomEvent(createEventName(this.name, event.detail.phase), event));
	};
	setTouchAction() {
		this.element.addEventListener("touchstart", preventDefault$1, { passive: false });
	}
	restoreTouchAction() {
		this.element.removeEventListener("touchstart", preventDefault$1);
	}
};
//#endregion
//#region node_modules/@mui/x-internal-gestures/esm/core/gestures/TurnWheelGesture.js
/**
* TurnWheelGesture - Detects wheel events on an element
*
* This gesture tracks mouse wheel or touchpad scroll events on elements, firing events when:
* - The user scrolls/wheels on the element (ongoing)
*
* Unlike other gestures which may have start/ongoing/end states,
* wheel gestures are always considered "ongoing" since they are discrete events.
*/
/**
* Configuration options for the TurnWheelGesture
* Uses the base gesture options with additional wheel-specific options
*/
/**
* Event data specific to wheel gesture events
* Contains information about scroll delta amounts and mode
*/
/**
* Type definition for the CustomEvent created by TurnWheelGesture
*/
/**
* State tracking for the TurnWheelGesture
*/
/**
* TurnWheelGesture class for handling wheel/scroll interactions
*
* This gesture detects when users scroll or use the mouse wheel on elements,
* and dispatches corresponding scroll events with delta information.
* Unlike most gestures, it extends directly from Gesture rather than PointerGesture.
*/
var TurnWheelGesture = class TurnWheelGesture extends Gesture {
	state = {
		totalDeltaX: 0,
		totalDeltaY: 0,
		totalDeltaZ: 0
	};
	/**
	* Scaling factor for delta values
	* Values > 1 increase sensitivity, values < 1 decrease sensitivity
	*/
	/**
	* Maximum value for totalDelta values
	* Limits how large the accumulated wheel deltas can be
	*/
	/**
	* Minimum value for totalDelta values
	* Sets a lower bound for accumulated wheel deltas
	*/
	/**
	* Initial value for totalDelta values
	* Sets the starting value for delta trackers
	*/
	/**
	* Whether to invert the direction of delta changes
	* When true, reverses the sign of deltaX, deltaY, and deltaZ values
	*/
	constructor(options) {
		super(options);
		this.sensitivity = options.sensitivity ?? 1;
		this.max = options.max ?? Number.MAX_SAFE_INTEGER;
		this.min = options.min ?? Number.MIN_SAFE_INTEGER;
		this.initialDelta = options.initialDelta ?? 0;
		this.invert = options.invert ?? false;
		this.state.totalDeltaX = this.initialDelta;
		this.state.totalDeltaY = this.initialDelta;
		this.state.totalDeltaZ = this.initialDelta;
	}
	clone(overrides) {
		return new TurnWheelGesture(_extends({
			name: this.name,
			preventDefault: this.preventDefault,
			stopPropagation: this.stopPropagation,
			sensitivity: this.sensitivity,
			max: this.max,
			min: this.min,
			initialDelta: this.initialDelta,
			invert: this.invert,
			requiredKeys: [...this.requiredKeys],
			preventIf: [...this.preventIf]
		}, overrides));
	}
	init(element, pointerManager, gestureRegistry, keyboardManager) {
		super.init(element, pointerManager, gestureRegistry, keyboardManager);
		this.element.addEventListener("wheel", this.handleWheelEvent);
	}
	destroy() {
		this.element.removeEventListener("wheel", this.handleWheelEvent);
		this.resetState();
		super.destroy();
	}
	resetState() {
		this.isActive = false;
		this.state = {
			totalDeltaX: 0,
			totalDeltaY: 0,
			totalDeltaZ: 0
		};
	}
	updateOptions(options) {
		super.updateOptions(options);
		this.sensitivity = options.sensitivity ?? this.sensitivity;
		this.max = options.max ?? this.max;
		this.min = options.min ?? this.min;
		this.initialDelta = options.initialDelta ?? this.initialDelta;
		this.invert = options.invert ?? this.invert;
	}
	/**
	* Handle wheel events for a specific element
	* @param element The element that received the wheel event
	* @param event The original wheel event
	*/
	handleWheelEvent = (event) => {
		if (this.shouldPreventGesture(this.element, "mouse")) return;
		const pointers = this.pointerManager.getPointers() || /* @__PURE__ */ new Map();
		const pointersArray = Array.from(pointers.values());
		this.state.totalDeltaX += event.deltaX * this.sensitivity * (this.invert ? -1 : 1);
		this.state.totalDeltaY += event.deltaY * this.sensitivity * (this.invert ? -1 : 1);
		this.state.totalDeltaZ += event.deltaZ * this.sensitivity * (this.invert ? -1 : 1);
		[
			"totalDeltaX",
			"totalDeltaY",
			"totalDeltaZ"
		].forEach((axis) => {
			if (this.state[axis] < this.min) this.state[axis] = this.min;
			if (this.state[axis] > this.max) this.state[axis] = this.max;
		});
		this.emitWheelEvent(pointersArray, event);
	};
	/**
	* Emit wheel-specific events
	* @param pointers The current pointers on the element
	* @param event The original wheel event
	*/
	emitWheelEvent(pointers, event) {
		const centroid = pointers.length > 0 ? calculateCentroid(pointers) : {
			x: event.clientX,
			y: event.clientY
		};
		const activeGestures = this.gesturesRegistry.getActiveGestures(this.element);
		const customEventData = {
			gestureName: this.name,
			centroid,
			target: event.target,
			srcEvent: event,
			phase: "ongoing",
			pointers,
			timeStamp: event.timeStamp,
			deltaX: event.deltaX * this.sensitivity * (this.invert ? -1 : 1),
			deltaY: event.deltaY * this.sensitivity * (this.invert ? -1 : 1),
			deltaZ: event.deltaZ * this.sensitivity * (this.invert ? -1 : 1),
			deltaMode: event.deltaMode,
			totalDeltaX: this.state.totalDeltaX,
			totalDeltaY: this.state.totalDeltaY,
			totalDeltaZ: this.state.totalDeltaZ,
			activeGestures,
			customData: this.customData
		};
		if (this.preventDefault) event.preventDefault();
		if (this.stopPropagation) event.stopPropagation();
		const eventName = createEventName(this.name, "ongoing");
		const domEvent = new CustomEvent(eventName, {
			bubbles: true,
			cancelable: true,
			composed: true,
			detail: customEventData
		});
		this.element.dispatchEvent(domEvent);
	}
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/corePlugins/useChartInteractionListener/useChartInteractionListener.js
var preventDefault = (event) => event.preventDefault();
var useChartInteractionListener = ({ svgRef }) => {
	const gestureManagerRef = import_react.useRef(null);
	import_react.useEffect(() => {
		const svg = svgRef.current;
		if (!gestureManagerRef.current) gestureManagerRef.current = new GestureManager({ gestures: [
			new PanGesture({
				name: "pan",
				threshold: 0,
				maxPointers: 1
			}),
			new MoveGesture({
				name: "move",
				preventIf: [
					"pan",
					"zoomPinch",
					"zoomPan"
				]
			}),
			new TapGesture({
				name: "tap",
				preventIf: [
					"pan",
					"zoomPinch",
					"zoomPan"
				]
			}),
			new PressGesture({
				name: "quickPress",
				duration: 50
			}),
			new PanGesture({
				name: "brush",
				threshold: 0,
				maxPointers: 1
			}),
			new PanGesture({
				name: "zoomPan",
				threshold: 0,
				preventIf: ["zoomTapAndDrag", "zoomPressAndDrag"]
			}),
			new PinchGesture({
				name: "zoomPinch",
				threshold: 5
			}),
			new TurnWheelGesture({
				name: "zoomTurnWheel",
				sensitivity: .01,
				initialDelta: 1
			}),
			new TurnWheelGesture({
				name: "panTurnWheel",
				sensitivity: .5
			}),
			new TapAndDragGesture({
				name: "zoomTapAndDrag",
				dragThreshold: 10
			}),
			new PressAndDragGesture({
				name: "zoomPressAndDrag",
				dragThreshold: 10,
				preventIf: ["zoomPinch"]
			}),
			new TapGesture({
				name: "zoomDoubleTapReset",
				taps: 2
			})
		] });
		const gestureManager = gestureManagerRef.current;
		if (!svg || !gestureManager) return;
		gestureManager.registerElement([
			"pan",
			"move",
			"zoomPinch",
			"zoomPan",
			"zoomTurnWheel",
			"panTurnWheel",
			"tap",
			"quickPress",
			"zoomTapAndDrag",
			"zoomPressAndDrag",
			"zoomDoubleTapReset",
			"brush"
		], svg);
		return () => {
			gestureManager.unregisterAllGestures(svg);
		};
	}, [svgRef, gestureManagerRef]);
	const addInteractionListener = import_react.useCallback((interaction, callback, options) => {
		const svg = svgRef.current;
		svg?.addEventListener(interaction, callback, options);
		return { cleanup: () => svg?.removeEventListener(interaction, callback) };
	}, [svgRef]);
	const updateZoomInteractionListeners = import_react.useCallback((interaction, options) => {
		const svg = svgRef.current;
		const gestureManager = gestureManagerRef.current;
		if (!gestureManager || !svg) return;
		gestureManager.setGestureOptions(interaction, svg, options ?? {});
	}, [svgRef, gestureManagerRef]);
	import_react.useEffect(() => {
		const svg = svgRef.current;
		svg?.addEventListener("gesturestart", preventDefault);
		svg?.addEventListener("gesturechange", preventDefault);
		svg?.addEventListener("gestureend", preventDefault);
		return () => {
			svg?.removeEventListener("gesturestart", preventDefault);
			svg?.removeEventListener("gesturechange", preventDefault);
			svg?.removeEventListener("gestureend", preventDefault);
		};
	}, [svgRef]);
	return { instance: {
		addInteractionListener,
		updateZoomInteractionListeners
	} };
};
useChartInteractionListener.params = {};
useChartInteractionListener.getInitialState = () => {
	return {};
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/corePlugins/corePlugins.js
/**
* Internal plugins that create the tools used by the other plugins.
* These plugins are used by the Charts components.
*/
var CHART_CORE_PLUGINS = [
	useChartId$1,
	useChartExperimentalFeatures,
	useChartDimensions,
	useChartSeries,
	useChartInteractionListener,
	useChartAnimation
];
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/store/extractPluginParamsFromProps.js
var _excluded$11 = ["apiRef"];
var extractPluginParamsFromProps = (_ref) => {
	let { plugins } = _ref, props = _objectWithoutPropertiesLoose(_ref.props, _excluded$11);
	const paramsLookup = {};
	plugins.forEach((plugin) => {
		Object.assign(paramsLookup, plugin.params);
	});
	const pluginParams = {};
	Object.keys(props).forEach((propName) => {
		const prop = props[propName];
		if (paramsLookup[propName]) pluginParams[propName] = prop;
	});
	return plugins.reduce((acc, plugin) => {
		if (plugin.getDefaultizedParams) return plugin.getDefaultizedParams({ params: acc });
		return acc;
	}, pluginParams);
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/store/useCharts.js
var globalId = 0;
/**
* This is the main hook that setups the plugin system for the chart.
*
* It manages the data used to create the charts.
*
* @param inPlugins All the plugins that will be used in the chart.
* @param props The props passed to the chart.
* @param seriesConfig The set of helpers used for series-specific computation.
*/
function useCharts(inPlugins, props, seriesConfig) {
	const chartId = useId();
	const plugins = import_react.useMemo(() => [...CHART_CORE_PLUGINS, ...inPlugins], [inPlugins]);
	const pluginParams = extractPluginParamsFromProps({
		plugins,
		props
	});
	pluginParams.id = pluginParams.id ?? chartId;
	const instance = import_react.useRef({}).current;
	const publicAPI = useChartApiInitialization(props.apiRef);
	const innerChartRootRef = import_react.useRef(null);
	const innerSvgRef = import_react.useRef(null);
	const storeRef = import_react.useRef(null);
	if (storeRef.current == null) {
		globalId += 1;
		const initialState = { cacheKey: { id: globalId } };
		plugins.forEach((plugin) => {
			if (plugin.getInitialState) Object.assign(initialState, plugin.getInitialState(pluginParams, initialState, seriesConfig));
		});
		storeRef.current = new Store(initialState);
	}
	const runPlugin = (plugin) => {
		const pluginResponse = plugin({
			instance,
			params: pluginParams,
			plugins,
			store: storeRef.current,
			svgRef: innerSvgRef,
			chartRootRef: innerChartRootRef,
			seriesConfig
		});
		if (pluginResponse.publicAPI) Object.assign(publicAPI.current, pluginResponse.publicAPI);
		if (pluginResponse.instance) Object.assign(instance, pluginResponse.instance);
	};
	plugins.forEach(runPlugin);
	return { contextValue: import_react.useMemo(() => ({
		store: storeRef.current,
		publicAPI: publicAPI.current,
		instance,
		svgRef: innerSvgRef,
		chartRootRef: innerChartRootRef
	}), [instance, publicAPI]) };
}
function initializeInputApiRef(inputApiRef) {
	if (inputApiRef.current == null) inputApiRef.current = {};
	return inputApiRef;
}
function useChartApiInitialization(inputApiRef) {
	const fallbackPublicApiRef = import_react.useRef({});
	if (inputApiRef) return initializeInputApiRef(inputApiRef);
	return fallbackPublicApiRef;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/context/ChartsProvider/ChartsContext.js
/**
* @ignore - internal component.
*/
var ChartsContext = /* @__PURE__ */ import_react.createContext(null);
ChartsContext.displayName = "ChartsContext";
//#endregion
//#region node_modules/@mui/x-internals/esm/warning/warning.js
var warnedOnceCache = /* @__PURE__ */ new Set();
/**
* Logs a message to the console on development mode. The warning will only be logged once.
*
* The message is the log's cache key. Two identical messages will only be logged once.
*
* This function is a no-op in production.
*
* @param message the message to log
* @param gravity the gravity of the warning. Defaults to `'warning'`.
* @returns
*/
function warnOnce(message, gravity = "warning") {
	const cleanMessage = Array.isArray(message) ? message.join("\n") : message;
	if (!warnedOnceCache.has(cleanMessage)) {
		warnedOnceCache.add(cleanMessage);
		if (gravity === "error") console.error(cleanMessage);
		else console.warn(cleanMessage);
	}
}
//#endregion
//#region node_modules/@mui/x-internals/esm/useAssertModelConsistency/useAssertModelConsistency.js
/**
* Make sure a controlled prop is used correctly.
* Logs errors if the prop either:
*
* - switch between controlled and uncontrolled
* - modify it's default value
* @param parameters
*/
function useAssertModelConsistencyOutsideOfProduction(parameters) {
	const { componentName, propName, controlled, defaultValue, warningPrefix = "MUI X" } = parameters;
	const [{ initialDefaultValue, isControlled }] = import_react.useState({
		initialDefaultValue: defaultValue,
		isControlled: controlled !== void 0
	});
	if (isControlled !== (controlled !== void 0)) warnOnce([
		`${warningPrefix}: A component is changing the ${isControlled ? "" : "un"}controlled ${propName} state of ${componentName} to be ${isControlled ? "un" : ""}controlled.`,
		"Elements should not switch from uncontrolled to controlled (or vice versa).",
		`Decide between using a controlled or uncontrolled ${propName} element for the lifetime of the component.`,
		"The nature of the state is determined during the first render. It's considered controlled if the value is not `undefined`.",
		"More info: https://fb.me/react-controlled-components"
	], "error");
	if (JSON.stringify(initialDefaultValue) !== JSON.stringify(defaultValue)) warnOnce([`${warningPrefix}: A component is changing the default ${propName} state of an uncontrolled ${componentName} after being initialized. To suppress this warning opt to use a controlled ${componentName}.`], "error");
}
var useAssertModelConsistency = useAssertModelConsistencyOutsideOfProduction;
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartCartesianAxis/defaultizeZoom.js
var defaultZoomOptions = {
	minStart: 0,
	maxEnd: 100,
	step: 5,
	minSpan: 10,
	maxSpan: 100,
	panning: true,
	filterMode: "keep",
	reverse: false,
	slider: {
		enabled: false,
		preview: false,
		size: 28,
		showTooltip: DEFAULT_ZOOM_SLIDER_SHOW_TOOLTIP
	}
};
var defaultizeZoom = (zoom, axisId, axisDirection, reverse) => {
	if (!zoom) return;
	if (zoom === true) return _extends({
		axisId,
		axisDirection
	}, defaultZoomOptions, { reverse: reverse ?? false });
	return _extends({
		axisId,
		axisDirection
	}, defaultZoomOptions, { reverse: reverse ?? false }, zoom, { slider: _extends({}, defaultZoomOptions.slider, { size: zoom.slider?.preview ?? defaultZoomOptions.slider.preview ? 48 : 28 }, zoom.slider) });
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartCartesianAxis/defaultizeAxis.js
function defaultizeXAxis(inAxes, dataset) {
	const offsets = {
		top: 0,
		bottom: 0,
		none: 0
	};
	return (inAxes && inAxes.length > 0 ? inAxes : [{
		id: DEFAULT_X_AXIS_KEY,
		scaleType: "linear"
	}]).map((axisConfig, index) => {
		const dataKey = axisConfig.dataKey;
		const defaultPosition = index === 0 ? "bottom" : "none";
		const position = axisConfig.position ?? defaultPosition;
		const defaultHeight = 25 + (axisConfig.label ? 20 : 0);
		const id = axisConfig.id ?? `defaultized-x-axis-${index}`;
		const sharedConfig = _extends({ offset: offsets[position] }, axisConfig, {
			id,
			position,
			height: axisConfig.height ?? defaultHeight,
			zoom: defaultizeZoom(axisConfig.zoom, id, "x", axisConfig.reverse)
		});
		if (position !== "none") {
			offsets[position] += sharedConfig.height;
			if (sharedConfig.zoom?.slider.enabled) offsets[position] += sharedConfig.zoom.slider.size;
		}
		if (dataKey === void 0 || axisConfig.data !== void 0) return sharedConfig;
		if (dataset === void 0) throw new Error(`MUI X Charts: x-axis uses \`dataKey\` but no \`dataset\` is provided.`);
		return _extends({}, sharedConfig, { data: dataset.map((d) => d[dataKey]) });
	});
}
function defaultizeYAxis(inAxes, dataset) {
	const offsets = {
		right: 0,
		left: 0,
		none: 0
	};
	return (inAxes && inAxes.length > 0 ? inAxes : [{
		id: DEFAULT_Y_AXIS_KEY,
		scaleType: "linear"
	}]).map((axisConfig, index) => {
		const dataKey = axisConfig.dataKey;
		const defaultPosition = index === 0 ? "left" : "none";
		const position = axisConfig.position ?? defaultPosition;
		const defaultWidth = 45 + (axisConfig.label ? 20 : 0);
		const id = axisConfig.id ?? `defaultized-y-axis-${index}`;
		const sharedConfig = _extends({ offset: offsets[position] }, axisConfig, {
			id,
			position,
			width: axisConfig.width ?? defaultWidth,
			zoom: defaultizeZoom(axisConfig.zoom, id, "y", axisConfig.reverse)
		});
		if (position !== "none") {
			offsets[position] += sharedConfig.width;
			if (sharedConfig.zoom?.slider.enabled) offsets[position] += sharedConfig.zoom.slider.size;
		}
		if (dataKey === void 0 || axisConfig.data !== void 0) return sharedConfig;
		if (dataset === void 0) throw new Error(`MUI X Charts: y-axis uses \`dataKey\` but no \`dataset\` is provided.`);
		return _extends({}, sharedConfig, { data: dataset.map((d) => d[dataKey]) });
	});
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/defaultValueFormatters.js
/**
* Creates a default formatter function for continuous scales (e.g., linear, sqrt, log).
* @returns A formatter function for continuous values.
*/
function createScalarFormatter(tickNumber, zoomScale) {
	return function defaultScalarValueFormatter(value, context) {
		if (context.location === "tick") {
			const domain = context.scale.domain();
			if (domain[0] === domain[1]) return context.scale.tickFormat(1)(value);
			return context.scale.tickFormat(tickNumber)(value);
		}
		if (context.location === "zoom-slider-tooltip") return zoomScale.tickFormat(2)(value);
		return `${value}`;
	};
}
//#endregion
//#region node_modules/@mui/x-charts/esm/models/axis.js
/**
* Use this type instead of `AxisScaleConfig` when the values
* shouldn't be provided by the user.
*/
/**
* Config that is shared between cartesian and polar axes.
*/
/**
* Use this type for advanced typing. For basic usage, use `XAxis`, `YAxis`, `RotationAxis` or `RadiusAxis`.
*/
function isBandScaleConfig(scaleConfig) {
	return scaleConfig.scaleType === "band";
}
function isPointScaleConfig(scaleConfig) {
	return scaleConfig.scaleType === "point";
}
function isContinuousScaleConfig(scaleConfig) {
	return scaleConfig.scaleType !== "point" && scaleConfig.scaleType !== "band";
}
function isSymlogScaleConfig(scaleConfig) {
	return scaleConfig.scaleType === "symlog";
}
/**
* The data format returned by onAxisClick.
*/
/**
* Identifies a data point within an axis.
*/
/**
* The axis configuration with missing values filled with default values.
*/
/**
* The x-axis configuration with missing values filled with default values.
*/
/**
* The y-axis configuration with missing values filled with default values.
*/
//#endregion
//#region node_modules/d3-array/src/ascending.js
function ascending(a, b) {
	return a == null || b == null ? NaN : a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}
//#endregion
//#region node_modules/d3-array/src/descending.js
function descending(a, b) {
	return a == null || b == null ? NaN : b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
}
//#endregion
//#region node_modules/d3-array/src/bisector.js
function bisector(f) {
	let compare1, compare2, delta;
	if (f.length !== 2) {
		compare1 = ascending;
		compare2 = (d, x) => ascending(f(d), x);
		delta = (d, x) => f(d) - x;
	} else {
		compare1 = f === ascending || f === descending ? f : zero$1;
		compare2 = f;
		delta = f;
	}
	function left(a, x, lo = 0, hi = a.length) {
		if (lo < hi) {
			if (compare1(x, x) !== 0) return hi;
			do {
				const mid = lo + hi >>> 1;
				if (compare2(a[mid], x) < 0) lo = mid + 1;
				else hi = mid;
			} while (lo < hi);
		}
		return lo;
	}
	function right(a, x, lo = 0, hi = a.length) {
		if (lo < hi) {
			if (compare1(x, x) !== 0) return hi;
			do {
				const mid = lo + hi >>> 1;
				if (compare2(a[mid], x) <= 0) lo = mid + 1;
				else hi = mid;
			} while (lo < hi);
		}
		return lo;
	}
	function center(a, x, lo = 0, hi = a.length) {
		const i = left(a, x, lo, hi - 1);
		return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
	}
	return {
		left,
		center,
		right
	};
}
function zero$1() {
	return 0;
}
//#endregion
//#region node_modules/d3-array/src/number.js
function number$2(x) {
	return x === null ? NaN : +x;
}
//#endregion
//#region node_modules/d3-array/src/bisect.js
var ascendingBisect = bisector(ascending);
var bisectRight = ascendingBisect.right;
ascendingBisect.left;
bisector(number$2).center;
//#endregion
//#region node_modules/internmap/src/index.js
var InternMap = class extends Map {
	constructor(entries, key = keyof$1) {
		super();
		Object.defineProperties(this, {
			_intern: { value: /* @__PURE__ */ new Map() },
			_key: { value: key }
		});
		if (entries != null) for (const [key, value] of entries) this.set(key, value);
	}
	get(key) {
		return super.get(intern_get(this, key));
	}
	has(key) {
		return super.has(intern_get(this, key));
	}
	set(key, value) {
		return super.set(intern_set(this, key), value);
	}
	delete(key) {
		return super.delete(intern_delete(this, key));
	}
};
function intern_get({ _intern, _key }, value) {
	const key = _key(value);
	return _intern.has(key) ? _intern.get(key) : value;
}
function intern_set({ _intern, _key }, value) {
	const key = _key(value);
	if (_intern.has(key)) return _intern.get(key);
	_intern.set(key, value);
	return value;
}
function intern_delete({ _intern, _key }, value) {
	const key = _key(value);
	if (_intern.has(key)) {
		value = _intern.get(key);
		_intern.delete(key);
	}
	return value;
}
function keyof$1(value) {
	return value !== null && typeof value === "object" ? value.valueOf() : value;
}
//#endregion
//#region node_modules/d3-array/src/ticks.js
var e10 = Math.sqrt(50), e5 = Math.sqrt(10), e2 = Math.sqrt(2);
function tickSpec(start, stop, count) {
	const step = (stop - start) / Math.max(0, count), power = Math.floor(Math.log10(step)), error = step / Math.pow(10, power), factor = error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1;
	let i1, i2, inc;
	if (power < 0) {
		inc = Math.pow(10, -power) / factor;
		i1 = Math.round(start * inc);
		i2 = Math.round(stop * inc);
		if (i1 / inc < start) ++i1;
		if (i2 / inc > stop) --i2;
		inc = -inc;
	} else {
		inc = Math.pow(10, power) * factor;
		i1 = Math.round(start / inc);
		i2 = Math.round(stop / inc);
		if (i1 * inc < start) ++i1;
		if (i2 * inc > stop) --i2;
	}
	if (i2 < i1 && .5 <= count && count < 2) return tickSpec(start, stop, count * 2);
	return [
		i1,
		i2,
		inc
	];
}
function ticks(start, stop, count) {
	stop = +stop, start = +start, count = +count;
	if (!(count > 0)) return [];
	if (start === stop) return [start];
	const reverse = stop < start, [i1, i2, inc] = reverse ? tickSpec(stop, start, count) : tickSpec(start, stop, count);
	if (!(i2 >= i1)) return [];
	const n = i2 - i1 + 1, ticks = new Array(n);
	if (reverse) if (inc < 0) for (let i = 0; i < n; ++i) ticks[i] = (i2 - i) / -inc;
	else for (let i = 0; i < n; ++i) ticks[i] = (i2 - i) * inc;
	else if (inc < 0) for (let i = 0; i < n; ++i) ticks[i] = (i1 + i) / -inc;
	else for (let i = 0; i < n; ++i) ticks[i] = (i1 + i) * inc;
	return ticks;
}
function tickIncrement(start, stop, count) {
	stop = +stop, start = +start, count = +count;
	return tickSpec(start, stop, count)[2];
}
function tickStep(start, stop, count) {
	stop = +stop, start = +start, count = +count;
	const reverse = stop < start, inc = reverse ? tickIncrement(stop, start, count) : tickIncrement(start, stop, count);
	return (reverse ? -1 : 1) * (inc < 0 ? 1 / -inc : inc);
}
//#endregion
//#region node_modules/d3-array/src/range.js
function range(start, stop, step) {
	start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;
	var i = -1, n = Math.max(0, Math.ceil((stop - start) / step)) | 0, range = new Array(n);
	while (++i < n) range[i] = start + i * step;
	return range;
}
//#endregion
//#region node_modules/d3-scale/src/init.js
function initRange(domain, range) {
	switch (arguments.length) {
		case 0: break;
		case 1:
			this.range(domain);
			break;
		default:
			this.range(range).domain(domain);
			break;
	}
	return this;
}
function initInterpolator(domain, interpolator) {
	switch (arguments.length) {
		case 0: break;
		case 1:
			if (typeof domain === "function") this.interpolator(domain);
			else this.range(domain);
			break;
		default:
			this.domain(domain);
			if (typeof interpolator === "function") this.interpolator(interpolator);
			else this.range(interpolator);
			break;
	}
	return this;
}
//#endregion
//#region node_modules/d3-scale/src/ordinal.js
var implicit = Symbol("implicit");
function ordinal() {
	var index = new InternMap(), domain = [], range = [], unknown = implicit;
	function scale(d) {
		let i = index.get(d);
		if (i === void 0) {
			if (unknown !== implicit) return unknown;
			index.set(d, i = domain.push(d) - 1);
		}
		return range[i % range.length];
	}
	scale.domain = function(_) {
		if (!arguments.length) return domain.slice();
		domain = [], index = new InternMap();
		for (const value of _) {
			if (index.has(value)) continue;
			index.set(value, domain.push(value) - 1);
		}
		return scale;
	};
	scale.range = function(_) {
		return arguments.length ? (range = Array.from(_), scale) : range.slice();
	};
	scale.unknown = function(_) {
		return arguments.length ? (unknown = _, scale) : unknown;
	};
	scale.copy = function() {
		return ordinal(domain, range).unknown(unknown);
	};
	initRange.apply(scale, arguments);
	return scale;
}
//#endregion
//#region node_modules/d3-color/src/define.js
function define_default(constructor, factory, prototype) {
	constructor.prototype = factory.prototype = prototype;
	prototype.constructor = constructor;
}
function extend(parent, definition) {
	var prototype = Object.create(parent.prototype);
	for (var key in definition) prototype[key] = definition[key];
	return prototype;
}
//#endregion
//#region node_modules/d3-color/src/color.js
function Color() {}
var darker = .7;
var brighter = 1 / darker;
var reI = "\\s*([+-]?\\d+)\\s*", reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", reHex = /^#([0-9a-f]{3,8})$/, reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`), reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`), reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`), reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`), reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`), reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);
var named = {
	aliceblue: 15792383,
	antiquewhite: 16444375,
	aqua: 65535,
	aquamarine: 8388564,
	azure: 15794175,
	beige: 16119260,
	bisque: 16770244,
	black: 0,
	blanchedalmond: 16772045,
	blue: 255,
	blueviolet: 9055202,
	brown: 10824234,
	burlywood: 14596231,
	cadetblue: 6266528,
	chartreuse: 8388352,
	chocolate: 13789470,
	coral: 16744272,
	cornflowerblue: 6591981,
	cornsilk: 16775388,
	crimson: 14423100,
	cyan: 65535,
	darkblue: 139,
	darkcyan: 35723,
	darkgoldenrod: 12092939,
	darkgray: 11119017,
	darkgreen: 25600,
	darkgrey: 11119017,
	darkkhaki: 12433259,
	darkmagenta: 9109643,
	darkolivegreen: 5597999,
	darkorange: 16747520,
	darkorchid: 10040012,
	darkred: 9109504,
	darksalmon: 15308410,
	darkseagreen: 9419919,
	darkslateblue: 4734347,
	darkslategray: 3100495,
	darkslategrey: 3100495,
	darkturquoise: 52945,
	darkviolet: 9699539,
	deeppink: 16716947,
	deepskyblue: 49151,
	dimgray: 6908265,
	dimgrey: 6908265,
	dodgerblue: 2003199,
	firebrick: 11674146,
	floralwhite: 16775920,
	forestgreen: 2263842,
	fuchsia: 16711935,
	gainsboro: 14474460,
	ghostwhite: 16316671,
	gold: 16766720,
	goldenrod: 14329120,
	gray: 8421504,
	green: 32768,
	greenyellow: 11403055,
	grey: 8421504,
	honeydew: 15794160,
	hotpink: 16738740,
	indianred: 13458524,
	indigo: 4915330,
	ivory: 16777200,
	khaki: 15787660,
	lavender: 15132410,
	lavenderblush: 16773365,
	lawngreen: 8190976,
	lemonchiffon: 16775885,
	lightblue: 11393254,
	lightcoral: 15761536,
	lightcyan: 14745599,
	lightgoldenrodyellow: 16448210,
	lightgray: 13882323,
	lightgreen: 9498256,
	lightgrey: 13882323,
	lightpink: 16758465,
	lightsalmon: 16752762,
	lightseagreen: 2142890,
	lightskyblue: 8900346,
	lightslategray: 7833753,
	lightslategrey: 7833753,
	lightsteelblue: 11584734,
	lightyellow: 16777184,
	lime: 65280,
	limegreen: 3329330,
	linen: 16445670,
	magenta: 16711935,
	maroon: 8388608,
	mediumaquamarine: 6737322,
	mediumblue: 205,
	mediumorchid: 12211667,
	mediumpurple: 9662683,
	mediumseagreen: 3978097,
	mediumslateblue: 8087790,
	mediumspringgreen: 64154,
	mediumturquoise: 4772300,
	mediumvioletred: 13047173,
	midnightblue: 1644912,
	mintcream: 16121850,
	mistyrose: 16770273,
	moccasin: 16770229,
	navajowhite: 16768685,
	navy: 128,
	oldlace: 16643558,
	olive: 8421376,
	olivedrab: 7048739,
	orange: 16753920,
	orangered: 16729344,
	orchid: 14315734,
	palegoldenrod: 15657130,
	palegreen: 10025880,
	paleturquoise: 11529966,
	palevioletred: 14381203,
	papayawhip: 16773077,
	peachpuff: 16767673,
	peru: 13468991,
	pink: 16761035,
	plum: 14524637,
	powderblue: 11591910,
	purple: 8388736,
	rebeccapurple: 6697881,
	red: 16711680,
	rosybrown: 12357519,
	royalblue: 4286945,
	saddlebrown: 9127187,
	salmon: 16416882,
	sandybrown: 16032864,
	seagreen: 3050327,
	seashell: 16774638,
	sienna: 10506797,
	silver: 12632256,
	skyblue: 8900331,
	slateblue: 6970061,
	slategray: 7372944,
	slategrey: 7372944,
	snow: 16775930,
	springgreen: 65407,
	steelblue: 4620980,
	tan: 13808780,
	teal: 32896,
	thistle: 14204888,
	tomato: 16737095,
	turquoise: 4251856,
	violet: 15631086,
	wheat: 16113331,
	white: 16777215,
	whitesmoke: 16119285,
	yellow: 16776960,
	yellowgreen: 10145074
};
define_default(Color, color, {
	copy(channels) {
		return Object.assign(new this.constructor(), this, channels);
	},
	displayable() {
		return this.rgb().displayable();
	},
	hex: color_formatHex,
	formatHex: color_formatHex,
	formatHex8: color_formatHex8,
	formatHsl: color_formatHsl,
	formatRgb: color_formatRgb,
	toString: color_formatRgb
});
function color_formatHex() {
	return this.rgb().formatHex();
}
function color_formatHex8() {
	return this.rgb().formatHex8();
}
function color_formatHsl() {
	return hslConvert(this).formatHsl();
}
function color_formatRgb() {
	return this.rgb().formatRgb();
}
function color(format) {
	var m, l;
	format = (format + "").trim().toLowerCase();
	return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) : l === 3 ? new Rgb(m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, (m & 15) << 4 | m & 15, 1) : l === 8 ? rgba(m >> 24 & 255, m >> 16 & 255, m >> 8 & 255, (m & 255) / 255) : l === 4 ? rgba(m >> 12 & 15 | m >> 8 & 240, m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, ((m & 15) << 4 | m & 15) / 255) : null) : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) : named.hasOwnProperty(format) ? rgbn(named[format]) : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
}
function rgbn(n) {
	return new Rgb(n >> 16 & 255, n >> 8 & 255, n & 255, 1);
}
function rgba(r, g, b, a) {
	if (a <= 0) r = g = b = NaN;
	return new Rgb(r, g, b, a);
}
function rgbConvert(o) {
	if (!(o instanceof Color)) o = color(o);
	if (!o) return new Rgb();
	o = o.rgb();
	return new Rgb(o.r, o.g, o.b, o.opacity);
}
function rgb(r, g, b, opacity) {
	return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
}
function Rgb(r, g, b, opacity) {
	this.r = +r;
	this.g = +g;
	this.b = +b;
	this.opacity = +opacity;
}
define_default(Rgb, rgb, extend(Color, {
	brighter(k) {
		k = k == null ? brighter : Math.pow(brighter, k);
		return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
	},
	darker(k) {
		k = k == null ? darker : Math.pow(darker, k);
		return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
	},
	rgb() {
		return this;
	},
	clamp() {
		return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
	},
	displayable() {
		return -.5 <= this.r && this.r < 255.5 && -.5 <= this.g && this.g < 255.5 && -.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
	},
	hex: rgb_formatHex,
	formatHex: rgb_formatHex,
	formatHex8: rgb_formatHex8,
	formatRgb: rgb_formatRgb,
	toString: rgb_formatRgb
}));
function rgb_formatHex() {
	return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
}
function rgb_formatHex8() {
	return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function rgb_formatRgb() {
	const a = clampa(this.opacity);
	return `${a === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ")" : `, ${a})`}`;
}
function clampa(opacity) {
	return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
}
function clampi(value) {
	return Math.max(0, Math.min(255, Math.round(value) || 0));
}
function hex(value) {
	value = clampi(value);
	return (value < 16 ? "0" : "") + value.toString(16);
}
function hsla(h, s, l, a) {
	if (a <= 0) h = s = l = NaN;
	else if (l <= 0 || l >= 1) h = s = NaN;
	else if (s <= 0) h = NaN;
	return new Hsl(h, s, l, a);
}
function hslConvert(o) {
	if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
	if (!(o instanceof Color)) o = color(o);
	if (!o) return new Hsl();
	if (o instanceof Hsl) return o;
	o = o.rgb();
	var r = o.r / 255, g = o.g / 255, b = o.b / 255, min = Math.min(r, g, b), max = Math.max(r, g, b), h = NaN, s = max - min, l = (max + min) / 2;
	if (s) {
		if (r === max) h = (g - b) / s + (g < b) * 6;
		else if (g === max) h = (b - r) / s + 2;
		else h = (r - g) / s + 4;
		s /= l < .5 ? max + min : 2 - max - min;
		h *= 60;
	} else s = l > 0 && l < 1 ? 0 : h;
	return new Hsl(h, s, l, o.opacity);
}
function hsl(h, s, l, opacity) {
	return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
}
function Hsl(h, s, l, opacity) {
	this.h = +h;
	this.s = +s;
	this.l = +l;
	this.opacity = +opacity;
}
define_default(Hsl, hsl, extend(Color, {
	brighter(k) {
		k = k == null ? brighter : Math.pow(brighter, k);
		return new Hsl(this.h, this.s, this.l * k, this.opacity);
	},
	darker(k) {
		k = k == null ? darker : Math.pow(darker, k);
		return new Hsl(this.h, this.s, this.l * k, this.opacity);
	},
	rgb() {
		var h = this.h % 360 + (this.h < 0) * 360, s = isNaN(h) || isNaN(this.s) ? 0 : this.s, l = this.l, m2 = l + (l < .5 ? l : 1 - l) * s, m1 = 2 * l - m2;
		return new Rgb(hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2), hsl2rgb(h, m1, m2), hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2), this.opacity);
	},
	clamp() {
		return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
	},
	displayable() {
		return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
	},
	formatHsl() {
		const a = clampa(this.opacity);
		return `${a === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
	}
}));
function clamph(value) {
	value = (value || 0) % 360;
	return value < 0 ? value + 360 : value;
}
function clampt(value) {
	return Math.max(0, Math.min(1, value || 0));
}
function hsl2rgb(h, m1, m2) {
	return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
}
//#endregion
//#region node_modules/d3-interpolate/src/basis.js
function basis(t1, v0, v1, v2, v3) {
	var t2 = t1 * t1, t3 = t2 * t1;
	return ((1 - 3 * t1 + 3 * t2 - t3) * v0 + (4 - 6 * t2 + 3 * t3) * v1 + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2 + t3 * v3) / 6;
}
function basis_default(values) {
	var n = values.length - 1;
	return function(t) {
		var i = t <= 0 ? t = 0 : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n), v1 = values[i], v2 = values[i + 1], v0 = i > 0 ? values[i - 1] : 2 * v1 - v2, v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
		return basis((t - i / n) * n, v0, v1, v2, v3);
	};
}
//#endregion
//#region node_modules/d3-interpolate/src/basisClosed.js
function basisClosed_default(values) {
	var n = values.length;
	return function(t) {
		var i = Math.floor(((t %= 1) < 0 ? ++t : t) * n), v0 = values[(i + n - 1) % n], v1 = values[i % n], v2 = values[(i + 1) % n], v3 = values[(i + 2) % n];
		return basis((t - i / n) * n, v0, v1, v2, v3);
	};
}
//#endregion
//#region node_modules/d3-interpolate/src/constant.js
var constant_default$1 = (x) => () => x;
//#endregion
//#region node_modules/d3-interpolate/src/color.js
function linear$1(a, d) {
	return function(t) {
		return a + t * d;
	};
}
function exponential(a, b, y) {
	return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
		return Math.pow(a + t * b, y);
	};
}
function gamma(y) {
	return (y = +y) === 1 ? nogamma : function(a, b) {
		return b - a ? exponential(a, b, y) : constant_default$1(isNaN(a) ? b : a);
	};
}
function nogamma(a, b) {
	var d = b - a;
	return d ? linear$1(a, d) : constant_default$1(isNaN(a) ? b : a);
}
//#endregion
//#region node_modules/d3-interpolate/src/rgb.js
var rgb_default = (function rgbGamma(y) {
	var color = gamma(y);
	function rgb$1(start, end) {
		var r = color((start = rgb(start)).r, (end = rgb(end)).r), g = color(start.g, end.g), b = color(start.b, end.b), opacity = nogamma(start.opacity, end.opacity);
		return function(t) {
			start.r = r(t);
			start.g = g(t);
			start.b = b(t);
			start.opacity = opacity(t);
			return start + "";
		};
	}
	rgb$1.gamma = rgbGamma;
	return rgb$1;
})(1);
function rgbSpline(spline) {
	return function(colors) {
		var n = colors.length, r = new Array(n), g = new Array(n), b = new Array(n), i, color;
		for (i = 0; i < n; ++i) {
			color = rgb(colors[i]);
			r[i] = color.r || 0;
			g[i] = color.g || 0;
			b[i] = color.b || 0;
		}
		r = spline(r);
		g = spline(g);
		b = spline(b);
		color.opacity = 1;
		return function(t) {
			color.r = r(t);
			color.g = g(t);
			color.b = b(t);
			return color + "";
		};
	};
}
rgbSpline(basis_default);
rgbSpline(basisClosed_default);
//#endregion
//#region node_modules/d3-interpolate/src/numberArray.js
function numberArray_default(a, b) {
	if (!b) b = [];
	var n = a ? Math.min(b.length, a.length) : 0, c = b.slice(), i;
	return function(t) {
		for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
		return c;
	};
}
function isNumberArray(x) {
	return ArrayBuffer.isView(x) && !(x instanceof DataView);
}
//#endregion
//#region node_modules/d3-interpolate/src/array.js
function genericArray(a, b) {
	var nb = b ? b.length : 0, na = a ? Math.min(nb, a.length) : 0, x = new Array(na), c = new Array(nb), i;
	for (i = 0; i < na; ++i) x[i] = value_default(a[i], b[i]);
	for (; i < nb; ++i) c[i] = b[i];
	return function(t) {
		for (i = 0; i < na; ++i) c[i] = x[i](t);
		return c;
	};
}
//#endregion
//#region node_modules/d3-interpolate/src/date.js
function date_default(a, b) {
	var d = /* @__PURE__ */ new Date();
	return a = +a, b = +b, function(t) {
		return d.setTime(a * (1 - t) + b * t), d;
	};
}
//#endregion
//#region node_modules/d3-interpolate/src/number.js
function number_default(a, b) {
	return a = +a, b = +b, function(t) {
		return a * (1 - t) + b * t;
	};
}
//#endregion
//#region node_modules/d3-interpolate/src/object.js
function object_default(a, b) {
	var i = {}, c = {}, k;
	if (a === null || typeof a !== "object") a = {};
	if (b === null || typeof b !== "object") b = {};
	for (k in b) if (k in a) i[k] = value_default(a[k], b[k]);
	else c[k] = b[k];
	return function(t) {
		for (k in i) c[k] = i[k](t);
		return c;
	};
}
//#endregion
//#region node_modules/d3-interpolate/src/string.js
var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, reB = new RegExp(reA.source, "g");
function zero(b) {
	return function() {
		return b;
	};
}
function one(b) {
	return function(t) {
		return b(t) + "";
	};
}
function string_default(a, b) {
	var bi = reA.lastIndex = reB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
	a = a + "", b = b + "";
	while ((am = reA.exec(a)) && (bm = reB.exec(b))) {
		if ((bs = bm.index) > bi) {
			bs = b.slice(bi, bs);
			if (s[i]) s[i] += bs;
			else s[++i] = bs;
		}
		if ((am = am[0]) === (bm = bm[0])) if (s[i]) s[i] += bm;
		else s[++i] = bm;
		else {
			s[++i] = null;
			q.push({
				i,
				x: number_default(am, bm)
			});
		}
		bi = reB.lastIndex;
	}
	if (bi < b.length) {
		bs = b.slice(bi);
		if (s[i]) s[i] += bs;
		else s[++i] = bs;
	}
	return s.length < 2 ? q[0] ? one(q[0].x) : zero(b) : (b = q.length, function(t) {
		for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
		return s.join("");
	});
}
//#endregion
//#region node_modules/d3-interpolate/src/value.js
function value_default(a, b) {
	var t = typeof b, c;
	return b == null || t === "boolean" ? constant_default$1(b) : (t === "number" ? number_default : t === "string" ? (c = color(b)) ? (b = c, rgb_default) : string_default : b instanceof color ? rgb_default : b instanceof Date ? date_default : isNumberArray(b) ? numberArray_default : Array.isArray(b) ? genericArray : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object_default : number_default)(a, b);
}
//#endregion
//#region node_modules/d3-interpolate/src/round.js
function round_default(a, b) {
	return a = +a, b = +b, function(t) {
		return Math.round(a * (1 - t) + b * t);
	};
}
//#endregion
//#region node_modules/d3-scale/src/constant.js
function constants(x) {
	return function() {
		return x;
	};
}
//#endregion
//#region node_modules/d3-scale/src/number.js
function number$1(x) {
	return +x;
}
//#endregion
//#region node_modules/d3-scale/src/continuous.js
var unit = [0, 1];
function identity(x) {
	return x;
}
function normalize(a, b) {
	return (b -= a = +a) ? function(x) {
		return (x - a) / b;
	} : constants(isNaN(b) ? NaN : .5);
}
function clamper(a, b) {
	var t;
	if (a > b) t = a, a = b, b = t;
	return function(x) {
		return Math.max(a, Math.min(b, x));
	};
}
function bimap(domain, range, interpolate) {
	var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
	if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
	else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
	return function(x) {
		return r0(d0(x));
	};
}
function polymap(domain, range, interpolate) {
	var j = Math.min(domain.length, range.length) - 1, d = new Array(j), r = new Array(j), i = -1;
	if (domain[j] < domain[0]) {
		domain = domain.slice().reverse();
		range = range.slice().reverse();
	}
	while (++i < j) {
		d[i] = normalize(domain[i], domain[i + 1]);
		r[i] = interpolate(range[i], range[i + 1]);
	}
	return function(x) {
		var i = bisectRight(domain, x, 1, j) - 1;
		return r[i](d[i](x));
	};
}
function copy$1(source, target) {
	return target.domain(source.domain()).range(source.range()).interpolate(source.interpolate()).clamp(source.clamp()).unknown(source.unknown());
}
function transformer$1() {
	var domain = unit, range = unit, interpolate = value_default, transform, untransform, unknown, clamp = identity, piecewise, output, input;
	function rescale() {
		var n = Math.min(domain.length, range.length);
		if (clamp !== identity) clamp = clamper(domain[0], domain[n - 1]);
		piecewise = n > 2 ? polymap : bimap;
		output = input = null;
		return scale;
	}
	function scale(x) {
		return x == null || isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate)))(transform(clamp(x)));
	}
	scale.invert = function(y) {
		return clamp(untransform((input || (input = piecewise(range, domain.map(transform), number_default)))(y)));
	};
	scale.domain = function(_) {
		return arguments.length ? (domain = Array.from(_, number$1), rescale()) : domain.slice();
	};
	scale.range = function(_) {
		return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
	};
	scale.rangeRound = function(_) {
		return range = Array.from(_), interpolate = round_default, rescale();
	};
	scale.clamp = function(_) {
		return arguments.length ? (clamp = _ ? true : identity, rescale()) : clamp !== identity;
	};
	scale.interpolate = function(_) {
		return arguments.length ? (interpolate = _, rescale()) : interpolate;
	};
	scale.unknown = function(_) {
		return arguments.length ? (unknown = _, scale) : unknown;
	};
	return function(t, u) {
		transform = t, untransform = u;
		return rescale();
	};
}
function continuous() {
	return transformer$1()(identity, identity);
}
//#endregion
//#region node_modules/d3-format/src/formatDecimal.js
function formatDecimal_default(x) {
	return Math.abs(x = Math.round(x)) >= 1e21 ? x.toLocaleString("en").replace(/,/g, "") : x.toString(10);
}
function formatDecimalParts(x, p) {
	if (!isFinite(x) || x === 0) return null;
	var i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e"), coefficient = x.slice(0, i);
	return [coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient, +x.slice(i + 1)];
}
//#endregion
//#region node_modules/d3-format/src/exponent.js
function exponent_default(x) {
	return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
}
//#endregion
//#region node_modules/d3-format/src/formatGroup.js
function formatGroup_default(grouping, thousands) {
	return function(value, width) {
		var i = value.length, t = [], j = 0, g = grouping[0], length = 0;
		while (i > 0 && g > 0) {
			if (length + g + 1 > width) g = Math.max(1, width - length);
			t.push(value.substring(i -= g, i + g));
			if ((length += g + 1) > width) break;
			g = grouping[j = (j + 1) % grouping.length];
		}
		return t.reverse().join(thousands);
	};
}
//#endregion
//#region node_modules/d3-format/src/formatNumerals.js
function formatNumerals_default(numerals) {
	return function(value) {
		return value.replace(/[0-9]/g, function(i) {
			return numerals[+i];
		});
	};
}
//#endregion
//#region node_modules/d3-format/src/formatSpecifier.js
var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
function formatSpecifier(specifier) {
	if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
	var match;
	return new FormatSpecifier({
		fill: match[1],
		align: match[2],
		sign: match[3],
		symbol: match[4],
		zero: match[5],
		width: match[6],
		comma: match[7],
		precision: match[8] && match[8].slice(1),
		trim: match[9],
		type: match[10]
	});
}
formatSpecifier.prototype = FormatSpecifier.prototype;
function FormatSpecifier(specifier) {
	this.fill = specifier.fill === void 0 ? " " : specifier.fill + "";
	this.align = specifier.align === void 0 ? ">" : specifier.align + "";
	this.sign = specifier.sign === void 0 ? "-" : specifier.sign + "";
	this.symbol = specifier.symbol === void 0 ? "" : specifier.symbol + "";
	this.zero = !!specifier.zero;
	this.width = specifier.width === void 0 ? void 0 : +specifier.width;
	this.comma = !!specifier.comma;
	this.precision = specifier.precision === void 0 ? void 0 : +specifier.precision;
	this.trim = !!specifier.trim;
	this.type = specifier.type === void 0 ? "" : specifier.type + "";
}
FormatSpecifier.prototype.toString = function() {
	return this.fill + this.align + this.sign + this.symbol + (this.zero ? "0" : "") + (this.width === void 0 ? "" : Math.max(1, this.width | 0)) + (this.comma ? "," : "") + (this.precision === void 0 ? "" : "." + Math.max(0, this.precision | 0)) + (this.trim ? "~" : "") + this.type;
};
//#endregion
//#region node_modules/d3-format/src/formatTrim.js
function formatTrim_default(s) {
	out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) switch (s[i]) {
		case ".":
			i0 = i1 = i;
			break;
		case "0":
			if (i0 === 0) i0 = i;
			i1 = i;
			break;
		default:
			if (!+s[i]) break out;
			if (i0 > 0) i0 = 0;
			break;
	}
	return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
}
//#endregion
//#region node_modules/d3-format/src/formatPrefixAuto.js
var prefixExponent;
function formatPrefixAuto_default(x, p) {
	var d = formatDecimalParts(x, p);
	if (!d) return prefixExponent = void 0, x.toPrecision(p);
	var coefficient = d[0], exponent = d[1], i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1, n = coefficient.length;
	return i === n ? coefficient : i > n ? coefficient + new Array(i - n + 1).join("0") : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i) : "0." + new Array(1 - i).join("0") + formatDecimalParts(x, Math.max(0, p + i - 1))[0];
}
//#endregion
//#region node_modules/d3-format/src/formatRounded.js
function formatRounded_default(x, p) {
	var d = formatDecimalParts(x, p);
	if (!d) return x + "";
	var coefficient = d[0], exponent = d[1];
	return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1) : coefficient + new Array(exponent - coefficient.length + 2).join("0");
}
//#endregion
//#region node_modules/d3-format/src/formatTypes.js
var formatTypes_default = {
	"%": (x, p) => (x * 100).toFixed(p),
	"b": (x) => Math.round(x).toString(2),
	"c": (x) => x + "",
	"d": formatDecimal_default,
	"e": (x, p) => x.toExponential(p),
	"f": (x, p) => x.toFixed(p),
	"g": (x, p) => x.toPrecision(p),
	"o": (x) => Math.round(x).toString(8),
	"p": (x, p) => formatRounded_default(x * 100, p),
	"r": formatRounded_default,
	"s": formatPrefixAuto_default,
	"X": (x) => Math.round(x).toString(16).toUpperCase(),
	"x": (x) => Math.round(x).toString(16)
};
//#endregion
//#region node_modules/d3-format/src/identity.js
function identity_default$1(x) {
	return x;
}
//#endregion
//#region node_modules/d3-format/src/locale.js
var map = Array.prototype.map, prefixes = [
	"y",
	"z",
	"a",
	"f",
	"p",
	"n",
	"µ",
	"m",
	"",
	"k",
	"M",
	"G",
	"T",
	"P",
	"E",
	"Z",
	"Y"
];
function locale_default(locale) {
	var group = locale.grouping === void 0 || locale.thousands === void 0 ? identity_default$1 : formatGroup_default(map.call(locale.grouping, Number), locale.thousands + ""), currencyPrefix = locale.currency === void 0 ? "" : locale.currency[0] + "", currencySuffix = locale.currency === void 0 ? "" : locale.currency[1] + "", decimal = locale.decimal === void 0 ? "." : locale.decimal + "", numerals = locale.numerals === void 0 ? identity_default$1 : formatNumerals_default(map.call(locale.numerals, String)), percent = locale.percent === void 0 ? "%" : locale.percent + "", minus = locale.minus === void 0 ? "−" : locale.minus + "", nan = locale.nan === void 0 ? "NaN" : locale.nan + "";
	function newFormat(specifier, options) {
		specifier = formatSpecifier(specifier);
		var fill = specifier.fill, align = specifier.align, sign = specifier.sign, symbol = specifier.symbol, zero = specifier.zero, width = specifier.width, comma = specifier.comma, precision = specifier.precision, trim = specifier.trim, type = specifier.type;
		if (type === "n") comma = true, type = "g";
		else if (!formatTypes_default[type]) precision === void 0 && (precision = 12), trim = true, type = "g";
		if (zero || fill === "0" && align === "=") zero = true, fill = "0", align = "=";
		var prefix = (options && options.prefix !== void 0 ? options.prefix : "") + (symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : ""), suffix = (symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "") + (options && options.suffix !== void 0 ? options.suffix : "");
		var formatType = formatTypes_default[type], maybeSuffix = /[defgprs%]/.test(type);
		precision = precision === void 0 ? 6 : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision)) : Math.max(0, Math.min(20, precision));
		function format(value) {
			var valuePrefix = prefix, valueSuffix = suffix, i, n, c;
			if (type === "c") {
				valueSuffix = formatType(value) + valueSuffix;
				value = "";
			} else {
				value = +value;
				var valueNegative = value < 0 || 1 / value < 0;
				value = isNaN(value) ? nan : formatType(Math.abs(value), precision);
				if (trim) value = formatTrim_default(value);
				if (valueNegative && +value === 0 && sign !== "+") valueNegative = false;
				valuePrefix = (valueNegative ? sign === "(" ? sign : minus : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
				valueSuffix = (type === "s" && !isNaN(value) && prefixExponent !== void 0 ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");
				if (maybeSuffix) {
					i = -1, n = value.length;
					while (++i < n) if (c = value.charCodeAt(i), 48 > c || c > 57) {
						valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
						value = value.slice(0, i);
						break;
					}
				}
			}
			if (comma && !zero) value = group(value, Infinity);
			var length = valuePrefix.length + value.length + valueSuffix.length, padding = length < width ? new Array(width - length + 1).join(fill) : "";
			if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";
			switch (align) {
				case "<":
					value = valuePrefix + value + valueSuffix + padding;
					break;
				case "=":
					value = valuePrefix + padding + value + valueSuffix;
					break;
				case "^":
					value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length);
					break;
				default:
					value = padding + valuePrefix + value + valueSuffix;
					break;
			}
			return numerals(value);
		}
		format.toString = function() {
			return specifier + "";
		};
		return format;
	}
	function formatPrefix(specifier, value) {
		var e = Math.max(-8, Math.min(8, Math.floor(exponent_default(value) / 3))) * 3, k = Math.pow(10, -e), f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier), { suffix: prefixes[8 + e / 3] });
		return function(value) {
			return f(k * value);
		};
	}
	return {
		format: newFormat,
		formatPrefix
	};
}
//#endregion
//#region node_modules/d3-format/src/defaultLocale.js
var locale$1;
var format;
var formatPrefix;
defaultLocale$1({
	thousands: ",",
	grouping: [3],
	currency: ["$", ""]
});
function defaultLocale$1(definition) {
	locale$1 = locale_default(definition);
	format = locale$1.format;
	formatPrefix = locale$1.formatPrefix;
	return locale$1;
}
//#endregion
//#region node_modules/d3-format/src/precisionFixed.js
function precisionFixed_default(step) {
	return Math.max(0, -exponent_default(Math.abs(step)));
}
//#endregion
//#region node_modules/d3-format/src/precisionPrefix.js
function precisionPrefix_default(step, value) {
	return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent_default(value) / 3))) * 3 - exponent_default(Math.abs(step)));
}
//#endregion
//#region node_modules/d3-format/src/precisionRound.js
function precisionRound_default(step, max) {
	step = Math.abs(step), max = Math.abs(max) - step;
	return Math.max(0, exponent_default(max) - exponent_default(step)) + 1;
}
//#endregion
//#region node_modules/d3-scale/src/tickFormat.js
function tickFormat(start, stop, count, specifier) {
	var step = tickStep(start, stop, count), precision;
	specifier = formatSpecifier(specifier == null ? ",f" : specifier);
	switch (specifier.type) {
		case "s":
			var value = Math.max(Math.abs(start), Math.abs(stop));
			if (specifier.precision == null && !isNaN(precision = precisionPrefix_default(step, value))) specifier.precision = precision;
			return formatPrefix(specifier, value);
		case "":
		case "e":
		case "g":
		case "p":
		case "r":
			if (specifier.precision == null && !isNaN(precision = precisionRound_default(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
			break;
		case "f":
		case "%":
			if (specifier.precision == null && !isNaN(precision = precisionFixed_default(step))) specifier.precision = precision - (specifier.type === "%") * 2;
			break;
	}
	return format(specifier);
}
//#endregion
//#region node_modules/d3-scale/src/linear.js
function linearish(scale) {
	var domain = scale.domain;
	scale.ticks = function(count) {
		var d = domain();
		return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
	};
	scale.tickFormat = function(count, specifier) {
		var d = domain();
		return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
	};
	scale.nice = function(count) {
		if (count == null) count = 10;
		var d = domain();
		var i0 = 0;
		var i1 = d.length - 1;
		var start = d[i0];
		var stop = d[i1];
		var prestep;
		var step;
		var maxIter = 10;
		if (stop < start) {
			step = start, start = stop, stop = step;
			step = i0, i0 = i1, i1 = step;
		}
		while (maxIter-- > 0) {
			step = tickIncrement(start, stop, count);
			if (step === prestep) {
				d[i0] = start;
				d[i1] = stop;
				return domain(d);
			} else if (step > 0) {
				start = Math.floor(start / step) * step;
				stop = Math.ceil(stop / step) * step;
			} else if (step < 0) {
				start = Math.ceil(start * step) / step;
				stop = Math.floor(stop * step) / step;
			} else break;
			prestep = step;
		}
		return scale;
	};
	return scale;
}
function linear() {
	var scale = continuous();
	scale.copy = function() {
		return copy$1(scale, linear());
	};
	initRange.apply(scale, arguments);
	return linearish(scale);
}
//#endregion
//#region node_modules/d3-scale/src/nice.js
function nice(domain, interval) {
	domain = domain.slice();
	var i0 = 0, i1 = domain.length - 1, x0 = domain[i0], x1 = domain[i1], t;
	if (x1 < x0) {
		t = i0, i0 = i1, i1 = t;
		t = x0, x0 = x1, x1 = t;
	}
	domain[i0] = interval.floor(x0);
	domain[i1] = interval.ceil(x1);
	return domain;
}
//#endregion
//#region node_modules/d3-scale/src/log.js
function transformLog(x) {
	return Math.log(x);
}
function transformExp(x) {
	return Math.exp(x);
}
function transformLogn(x) {
	return -Math.log(-x);
}
function transformExpn(x) {
	return -Math.exp(-x);
}
function pow10(x) {
	return isFinite(x) ? +("1e" + x) : x < 0 ? 0 : x;
}
function powp(base) {
	return base === 10 ? pow10 : base === Math.E ? Math.exp : (x) => Math.pow(base, x);
}
function logp(base) {
	return base === Math.E ? Math.log : base === 10 && Math.log10 || base === 2 && Math.log2 || (base = Math.log(base), (x) => Math.log(x) / base);
}
function reflect(f) {
	return (x, k) => -f(-x, k);
}
function loggish(transform) {
	const scale = transform(transformLog, transformExp);
	const domain = scale.domain;
	let base = 10;
	let logs;
	let pows;
	function rescale() {
		logs = logp(base), pows = powp(base);
		if (domain()[0] < 0) {
			logs = reflect(logs), pows = reflect(pows);
			transform(transformLogn, transformExpn);
		} else transform(transformLog, transformExp);
		return scale;
	}
	scale.base = function(_) {
		return arguments.length ? (base = +_, rescale()) : base;
	};
	scale.domain = function(_) {
		return arguments.length ? (domain(_), rescale()) : domain();
	};
	scale.ticks = (count) => {
		const d = domain();
		let u = d[0];
		let v = d[d.length - 1];
		const r = v < u;
		if (r) [u, v] = [v, u];
		let i = logs(u);
		let j = logs(v);
		let k;
		let t;
		const n = count == null ? 10 : +count;
		let z = [];
		if (!(base % 1) && j - i < n) {
			i = Math.floor(i), j = Math.ceil(j);
			if (u > 0) for (; i <= j; ++i) for (k = 1; k < base; ++k) {
				t = i < 0 ? k / pows(-i) : k * pows(i);
				if (t < u) continue;
				if (t > v) break;
				z.push(t);
			}
			else for (; i <= j; ++i) for (k = base - 1; k >= 1; --k) {
				t = i > 0 ? k / pows(-i) : k * pows(i);
				if (t < u) continue;
				if (t > v) break;
				z.push(t);
			}
			if (z.length * 2 < n) z = ticks(u, v, n);
		} else z = ticks(i, j, Math.min(j - i, n)).map(pows);
		return r ? z.reverse() : z;
	};
	scale.tickFormat = (count, specifier) => {
		if (count == null) count = 10;
		if (specifier == null) specifier = base === 10 ? "s" : ",";
		if (typeof specifier !== "function") {
			if (!(base % 1) && (specifier = formatSpecifier(specifier)).precision == null) specifier.trim = true;
			specifier = format(specifier);
		}
		if (count === Infinity) return specifier;
		const k = Math.max(1, base * count / scale.ticks().length);
		return (d) => {
			let i = d / pows(Math.round(logs(d)));
			if (i * base < base - .5) i *= base;
			return i <= k ? specifier(d) : "";
		};
	};
	scale.nice = () => {
		return domain(nice(domain(), {
			floor: (x) => pows(Math.floor(logs(x))),
			ceil: (x) => pows(Math.ceil(logs(x)))
		}));
	};
	return scale;
}
function log() {
	const scale = loggish(transformer$1()).domain([1, 10]);
	scale.copy = () => copy$1(scale, log()).base(scale.base());
	initRange.apply(scale, arguments);
	return scale;
}
//#endregion
//#region node_modules/d3-scale/src/symlog.js
function transformSymlog(c) {
	return function(x) {
		return Math.sign(x) * Math.log1p(Math.abs(x / c));
	};
}
function transformSymexp(c) {
	return function(x) {
		return Math.sign(x) * Math.expm1(Math.abs(x)) * c;
	};
}
function symlogish(transform) {
	var c = 1, scale = transform(transformSymlog(c), transformSymexp(c));
	scale.constant = function(_) {
		return arguments.length ? transform(transformSymlog(c = +_), transformSymexp(c)) : c;
	};
	return linearish(scale);
}
function symlog() {
	var scale = symlogish(transformer$1());
	scale.copy = function() {
		return copy$1(scale, symlog()).constant(scale.constant());
	};
	return initRange.apply(scale, arguments);
}
//#endregion
//#region node_modules/d3-scale/src/pow.js
function transformPow(exponent) {
	return function(x) {
		return x < 0 ? -Math.pow(-x, exponent) : Math.pow(x, exponent);
	};
}
function transformSqrt(x) {
	return x < 0 ? -Math.sqrt(-x) : Math.sqrt(x);
}
function transformSquare(x) {
	return x < 0 ? -x * x : x * x;
}
function powish(transform) {
	var scale = transform(identity, identity), exponent = 1;
	function rescale() {
		return exponent === 1 ? transform(identity, identity) : exponent === .5 ? transform(transformSqrt, transformSquare) : transform(transformPow(exponent), transformPow(1 / exponent));
	}
	scale.exponent = function(_) {
		return arguments.length ? (exponent = +_, rescale()) : exponent;
	};
	return linearish(scale);
}
function pow() {
	var scale = powish(transformer$1());
	scale.copy = function() {
		return copy$1(scale, pow()).exponent(scale.exponent());
	};
	initRange.apply(scale, arguments);
	return scale;
}
function sqrt$1() {
	return pow.apply(null, arguments).exponent(.5);
}
//#endregion
//#region node_modules/d3-scale/src/threshold.js
function threshold() {
	var domain = [.5], range = [0, 1], unknown, n = 1;
	function scale(x) {
		return x != null && x <= x ? range[bisectRight(domain, x, 0, n)] : unknown;
	}
	scale.domain = function(_) {
		return arguments.length ? (domain = Array.from(_), n = Math.min(domain.length, range.length - 1), scale) : domain.slice();
	};
	scale.range = function(_) {
		return arguments.length ? (range = Array.from(_), n = Math.min(domain.length, range.length - 1), scale) : range.slice();
	};
	scale.invertExtent = function(y) {
		var i = range.indexOf(y);
		return [domain[i - 1], domain[i]];
	};
	scale.unknown = function(_) {
		return arguments.length ? (unknown = _, scale) : unknown;
	};
	scale.copy = function() {
		return threshold().domain(domain).range(range).unknown(unknown);
	};
	return initRange.apply(scale, arguments);
}
//#endregion
//#region node_modules/d3-time/src/interval.js
var t0 = /* @__PURE__ */ new Date(), t1 = /* @__PURE__ */ new Date();
function timeInterval(floori, offseti, count, field) {
	function interval(date) {
		return floori(date = arguments.length === 0 ? /* @__PURE__ */ new Date() : /* @__PURE__ */ new Date(+date)), date;
	}
	interval.floor = (date) => {
		return floori(date = /* @__PURE__ */ new Date(+date)), date;
	};
	interval.ceil = (date) => {
		return floori(date = /* @__PURE__ */ new Date(date - 1)), offseti(date, 1), floori(date), date;
	};
	interval.round = (date) => {
		const d0 = interval(date), d1 = interval.ceil(date);
		return date - d0 < d1 - date ? d0 : d1;
	};
	interval.offset = (date, step) => {
		return offseti(date = /* @__PURE__ */ new Date(+date), step == null ? 1 : Math.floor(step)), date;
	};
	interval.range = (start, stop, step) => {
		const range = [];
		start = interval.ceil(start);
		step = step == null ? 1 : Math.floor(step);
		if (!(start < stop) || !(step > 0)) return range;
		let previous;
		do
			range.push(previous = /* @__PURE__ */ new Date(+start)), offseti(start, step), floori(start);
		while (previous < start && start < stop);
		return range;
	};
	interval.filter = (test) => {
		return timeInterval((date) => {
			if (date >= date) while (floori(date), !test(date)) date.setTime(date - 1);
		}, (date, step) => {
			if (date >= date) if (step < 0) while (++step <= 0) while (offseti(date, -1), !test(date));
			else while (--step >= 0) while (offseti(date, 1), !test(date));
		});
	};
	if (count) {
		interval.count = (start, end) => {
			t0.setTime(+start), t1.setTime(+end);
			floori(t0), floori(t1);
			return Math.floor(count(t0, t1));
		};
		interval.every = (step) => {
			step = Math.floor(step);
			return !isFinite(step) || !(step > 0) ? null : !(step > 1) ? interval : interval.filter(field ? (d) => field(d) % step === 0 : (d) => interval.count(0, d) % step === 0);
		};
	}
	return interval;
}
//#endregion
//#region node_modules/d3-time/src/millisecond.js
var millisecond = timeInterval(() => {}, (date, step) => {
	date.setTime(+date + step);
}, (start, end) => {
	return end - start;
});
millisecond.every = (k) => {
	k = Math.floor(k);
	if (!isFinite(k) || !(k > 0)) return null;
	if (!(k > 1)) return millisecond;
	return timeInterval((date) => {
		date.setTime(Math.floor(date / k) * k);
	}, (date, step) => {
		date.setTime(+date + step * k);
	}, (start, end) => {
		return (end - start) / k;
	});
};
millisecond.range;
//#endregion
//#region node_modules/d3-time/src/duration.js
var durationSecond = 1e3;
var durationMinute = durationSecond * 60;
var durationHour = durationMinute * 60;
var durationDay = durationHour * 24;
var durationWeek = durationDay * 7;
var durationMonth = durationDay * 30;
var durationYear = durationDay * 365;
//#endregion
//#region node_modules/d3-time/src/second.js
var second = timeInterval((date) => {
	date.setTime(date - date.getMilliseconds());
}, (date, step) => {
	date.setTime(+date + step * durationSecond);
}, (start, end) => {
	return (end - start) / durationSecond;
}, (date) => {
	return date.getUTCSeconds();
});
second.range;
//#endregion
//#region node_modules/d3-time/src/minute.js
var timeMinute = timeInterval((date) => {
	date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond);
}, (date, step) => {
	date.setTime(+date + step * durationMinute);
}, (start, end) => {
	return (end - start) / durationMinute;
}, (date) => {
	return date.getMinutes();
});
timeMinute.range;
var utcMinute = timeInterval((date) => {
	date.setUTCSeconds(0, 0);
}, (date, step) => {
	date.setTime(+date + step * durationMinute);
}, (start, end) => {
	return (end - start) / durationMinute;
}, (date) => {
	return date.getUTCMinutes();
});
utcMinute.range;
//#endregion
//#region node_modules/d3-time/src/hour.js
var timeHour = timeInterval((date) => {
	date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond - date.getMinutes() * durationMinute);
}, (date, step) => {
	date.setTime(+date + step * durationHour);
}, (start, end) => {
	return (end - start) / durationHour;
}, (date) => {
	return date.getHours();
});
timeHour.range;
var utcHour = timeInterval((date) => {
	date.setUTCMinutes(0, 0, 0);
}, (date, step) => {
	date.setTime(+date + step * durationHour);
}, (start, end) => {
	return (end - start) / durationHour;
}, (date) => {
	return date.getUTCHours();
});
utcHour.range;
//#endregion
//#region node_modules/d3-time/src/day.js
var timeDay = timeInterval((date) => date.setHours(0, 0, 0, 0), (date, step) => date.setDate(date.getDate() + step), (start, end) => (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationDay, (date) => date.getDate() - 1);
timeDay.range;
var utcDay = timeInterval((date) => {
	date.setUTCHours(0, 0, 0, 0);
}, (date, step) => {
	date.setUTCDate(date.getUTCDate() + step);
}, (start, end) => {
	return (end - start) / durationDay;
}, (date) => {
	return date.getUTCDate() - 1;
});
utcDay.range;
var unixDay = timeInterval((date) => {
	date.setUTCHours(0, 0, 0, 0);
}, (date, step) => {
	date.setUTCDate(date.getUTCDate() + step);
}, (start, end) => {
	return (end - start) / durationDay;
}, (date) => {
	return Math.floor(date / durationDay);
});
unixDay.range;
//#endregion
//#region node_modules/d3-time/src/week.js
function timeWeekday(i) {
	return timeInterval((date) => {
		date.setDate(date.getDate() - (date.getDay() + 7 - i) % 7);
		date.setHours(0, 0, 0, 0);
	}, (date, step) => {
		date.setDate(date.getDate() + step * 7);
	}, (start, end) => {
		return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationWeek;
	});
}
var timeSunday = timeWeekday(0);
var timeMonday = timeWeekday(1);
var timeTuesday = timeWeekday(2);
var timeWednesday = timeWeekday(3);
var timeThursday = timeWeekday(4);
var timeFriday = timeWeekday(5);
var timeSaturday = timeWeekday(6);
timeSunday.range;
timeMonday.range;
timeTuesday.range;
timeWednesday.range;
timeThursday.range;
timeFriday.range;
timeSaturday.range;
function utcWeekday(i) {
	return timeInterval((date) => {
		date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i) % 7);
		date.setUTCHours(0, 0, 0, 0);
	}, (date, step) => {
		date.setUTCDate(date.getUTCDate() + step * 7);
	}, (start, end) => {
		return (end - start) / durationWeek;
	});
}
var utcSunday = utcWeekday(0);
var utcMonday = utcWeekday(1);
var utcTuesday = utcWeekday(2);
var utcWednesday = utcWeekday(3);
var utcThursday = utcWeekday(4);
var utcFriday = utcWeekday(5);
var utcSaturday = utcWeekday(6);
utcSunday.range;
utcMonday.range;
utcTuesday.range;
utcWednesday.range;
utcThursday.range;
utcFriday.range;
utcSaturday.range;
//#endregion
//#region node_modules/d3-time/src/month.js
var timeMonth = timeInterval((date) => {
	date.setDate(1);
	date.setHours(0, 0, 0, 0);
}, (date, step) => {
	date.setMonth(date.getMonth() + step);
}, (start, end) => {
	return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
}, (date) => {
	return date.getMonth();
});
timeMonth.range;
var utcMonth = timeInterval((date) => {
	date.setUTCDate(1);
	date.setUTCHours(0, 0, 0, 0);
}, (date, step) => {
	date.setUTCMonth(date.getUTCMonth() + step);
}, (start, end) => {
	return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
}, (date) => {
	return date.getUTCMonth();
});
utcMonth.range;
//#endregion
//#region node_modules/d3-time/src/year.js
var timeYear = timeInterval((date) => {
	date.setMonth(0, 1);
	date.setHours(0, 0, 0, 0);
}, (date, step) => {
	date.setFullYear(date.getFullYear() + step);
}, (start, end) => {
	return end.getFullYear() - start.getFullYear();
}, (date) => {
	return date.getFullYear();
});
timeYear.every = (k) => {
	return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : timeInterval((date) => {
		date.setFullYear(Math.floor(date.getFullYear() / k) * k);
		date.setMonth(0, 1);
		date.setHours(0, 0, 0, 0);
	}, (date, step) => {
		date.setFullYear(date.getFullYear() + step * k);
	});
};
timeYear.range;
var utcYear = timeInterval((date) => {
	date.setUTCMonth(0, 1);
	date.setUTCHours(0, 0, 0, 0);
}, (date, step) => {
	date.setUTCFullYear(date.getUTCFullYear() + step);
}, (start, end) => {
	return end.getUTCFullYear() - start.getUTCFullYear();
}, (date) => {
	return date.getUTCFullYear();
});
utcYear.every = (k) => {
	return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : timeInterval((date) => {
		date.setUTCFullYear(Math.floor(date.getUTCFullYear() / k) * k);
		date.setUTCMonth(0, 1);
		date.setUTCHours(0, 0, 0, 0);
	}, (date, step) => {
		date.setUTCFullYear(date.getUTCFullYear() + step * k);
	});
};
utcYear.range;
//#endregion
//#region node_modules/d3-time/src/ticks.js
function ticker(year, month, week, day, hour, minute) {
	const tickIntervals = [
		[
			second,
			1,
			durationSecond
		],
		[
			second,
			5,
			5 * durationSecond
		],
		[
			second,
			15,
			15 * durationSecond
		],
		[
			second,
			30,
			30 * durationSecond
		],
		[
			minute,
			1,
			durationMinute
		],
		[
			minute,
			5,
			5 * durationMinute
		],
		[
			minute,
			15,
			15 * durationMinute
		],
		[
			minute,
			30,
			30 * durationMinute
		],
		[
			hour,
			1,
			durationHour
		],
		[
			hour,
			3,
			3 * durationHour
		],
		[
			hour,
			6,
			6 * durationHour
		],
		[
			hour,
			12,
			12 * durationHour
		],
		[
			day,
			1,
			durationDay
		],
		[
			day,
			2,
			2 * durationDay
		],
		[
			week,
			1,
			durationWeek
		],
		[
			month,
			1,
			durationMonth
		],
		[
			month,
			3,
			3 * durationMonth
		],
		[
			year,
			1,
			durationYear
		]
	];
	function ticks(start, stop, count) {
		const reverse = stop < start;
		if (reverse) [start, stop] = [stop, start];
		const interval = count && typeof count.range === "function" ? count : tickInterval(start, stop, count);
		const ticks = interval ? interval.range(start, +stop + 1) : [];
		return reverse ? ticks.reverse() : ticks;
	}
	function tickInterval(start, stop, count) {
		const target = Math.abs(stop - start) / count;
		const i = bisector(([, , step]) => step).right(tickIntervals, target);
		if (i === tickIntervals.length) return year.every(tickStep(start / durationYear, stop / durationYear, count));
		if (i === 0) return millisecond.every(Math.max(tickStep(start, stop, count), 1));
		const [t, step] = tickIntervals[target / tickIntervals[i - 1][2] < tickIntervals[i][2] / target ? i - 1 : i];
		return t.every(step);
	}
	return [ticks, tickInterval];
}
var [utcTicks, utcTickInterval] = ticker(utcYear, utcMonth, utcSunday, unixDay, utcHour, utcMinute);
var [timeTicks, timeTickInterval] = ticker(timeYear, timeMonth, timeSunday, timeDay, timeHour, timeMinute);
//#endregion
//#region node_modules/d3-time-format/src/locale.js
function localDate(d) {
	if (0 <= d.y && d.y < 100) {
		var date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
		date.setFullYear(d.y);
		return date;
	}
	return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
}
function utcDate(d) {
	if (0 <= d.y && d.y < 100) {
		var date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
		date.setUTCFullYear(d.y);
		return date;
	}
	return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
}
function newDate(y, m, d) {
	return {
		y,
		m,
		d,
		H: 0,
		M: 0,
		S: 0,
		L: 0
	};
}
function formatLocale(locale) {
	var locale_dateTime = locale.dateTime, locale_date = locale.date, locale_time = locale.time, locale_periods = locale.periods, locale_weekdays = locale.days, locale_shortWeekdays = locale.shortDays, locale_months = locale.months, locale_shortMonths = locale.shortMonths;
	var periodRe = formatRe(locale_periods), periodLookup = formatLookup(locale_periods), weekdayRe = formatRe(locale_weekdays), weekdayLookup = formatLookup(locale_weekdays), shortWeekdayRe = formatRe(locale_shortWeekdays), shortWeekdayLookup = formatLookup(locale_shortWeekdays), monthRe = formatRe(locale_months), monthLookup = formatLookup(locale_months), shortMonthRe = formatRe(locale_shortMonths), shortMonthLookup = formatLookup(locale_shortMonths);
	var formats = {
		"a": formatShortWeekday,
		"A": formatWeekday,
		"b": formatShortMonth,
		"B": formatMonth,
		"c": null,
		"d": formatDayOfMonth,
		"e": formatDayOfMonth,
		"f": formatMicroseconds,
		"g": formatYearISO,
		"G": formatFullYearISO,
		"H": formatHour24,
		"I": formatHour12,
		"j": formatDayOfYear,
		"L": formatMilliseconds,
		"m": formatMonthNumber,
		"M": formatMinutes,
		"p": formatPeriod,
		"q": formatQuarter,
		"Q": formatUnixTimestamp,
		"s": formatUnixTimestampSeconds,
		"S": formatSeconds,
		"u": formatWeekdayNumberMonday,
		"U": formatWeekNumberSunday,
		"V": formatWeekNumberISO,
		"w": formatWeekdayNumberSunday,
		"W": formatWeekNumberMonday,
		"x": null,
		"X": null,
		"y": formatYear,
		"Y": formatFullYear,
		"Z": formatZone,
		"%": formatLiteralPercent
	};
	var utcFormats = {
		"a": formatUTCShortWeekday,
		"A": formatUTCWeekday,
		"b": formatUTCShortMonth,
		"B": formatUTCMonth,
		"c": null,
		"d": formatUTCDayOfMonth,
		"e": formatUTCDayOfMonth,
		"f": formatUTCMicroseconds,
		"g": formatUTCYearISO,
		"G": formatUTCFullYearISO,
		"H": formatUTCHour24,
		"I": formatUTCHour12,
		"j": formatUTCDayOfYear,
		"L": formatUTCMilliseconds,
		"m": formatUTCMonthNumber,
		"M": formatUTCMinutes,
		"p": formatUTCPeriod,
		"q": formatUTCQuarter,
		"Q": formatUnixTimestamp,
		"s": formatUnixTimestampSeconds,
		"S": formatUTCSeconds,
		"u": formatUTCWeekdayNumberMonday,
		"U": formatUTCWeekNumberSunday,
		"V": formatUTCWeekNumberISO,
		"w": formatUTCWeekdayNumberSunday,
		"W": formatUTCWeekNumberMonday,
		"x": null,
		"X": null,
		"y": formatUTCYear,
		"Y": formatUTCFullYear,
		"Z": formatUTCZone,
		"%": formatLiteralPercent
	};
	var parses = {
		"a": parseShortWeekday,
		"A": parseWeekday,
		"b": parseShortMonth,
		"B": parseMonth,
		"c": parseLocaleDateTime,
		"d": parseDayOfMonth,
		"e": parseDayOfMonth,
		"f": parseMicroseconds,
		"g": parseYear,
		"G": parseFullYear,
		"H": parseHour24,
		"I": parseHour24,
		"j": parseDayOfYear,
		"L": parseMilliseconds,
		"m": parseMonthNumber,
		"M": parseMinutes,
		"p": parsePeriod,
		"q": parseQuarter,
		"Q": parseUnixTimestamp,
		"s": parseUnixTimestampSeconds,
		"S": parseSeconds,
		"u": parseWeekdayNumberMonday,
		"U": parseWeekNumberSunday,
		"V": parseWeekNumberISO,
		"w": parseWeekdayNumberSunday,
		"W": parseWeekNumberMonday,
		"x": parseLocaleDate,
		"X": parseLocaleTime,
		"y": parseYear,
		"Y": parseFullYear,
		"Z": parseZone,
		"%": parseLiteralPercent
	};
	formats.x = newFormat(locale_date, formats);
	formats.X = newFormat(locale_time, formats);
	formats.c = newFormat(locale_dateTime, formats);
	utcFormats.x = newFormat(locale_date, utcFormats);
	utcFormats.X = newFormat(locale_time, utcFormats);
	utcFormats.c = newFormat(locale_dateTime, utcFormats);
	function newFormat(specifier, formats) {
		return function(date) {
			var string = [], i = -1, j = 0, n = specifier.length, c, pad, format;
			if (!(date instanceof Date)) date = /* @__PURE__ */ new Date(+date);
			while (++i < n) if (specifier.charCodeAt(i) === 37) {
				string.push(specifier.slice(j, i));
				if ((pad = pads[c = specifier.charAt(++i)]) != null) c = specifier.charAt(++i);
				else pad = c === "e" ? " " : "0";
				if (format = formats[c]) c = format(date, pad);
				string.push(c);
				j = i + 1;
			}
			string.push(specifier.slice(j, i));
			return string.join("");
		};
	}
	function newParse(specifier, Z) {
		return function(string) {
			var d = newDate(1900, void 0, 1), i = parseSpecifier(d, specifier, string += "", 0), week, day;
			if (i != string.length) return null;
			if ("Q" in d) return new Date(d.Q);
			if ("s" in d) return new Date(d.s * 1e3 + ("L" in d ? d.L : 0));
			if (Z && !("Z" in d)) d.Z = 0;
			if ("p" in d) d.H = d.H % 12 + d.p * 12;
			if (d.m === void 0) d.m = "q" in d ? d.q : 0;
			if ("V" in d) {
				if (d.V < 1 || d.V > 53) return null;
				if (!("w" in d)) d.w = 1;
				if ("Z" in d) {
					week = utcDate(newDate(d.y, 0, 1)), day = week.getUTCDay();
					week = day > 4 || day === 0 ? utcMonday.ceil(week) : utcMonday(week);
					week = utcDay.offset(week, (d.V - 1) * 7);
					d.y = week.getUTCFullYear();
					d.m = week.getUTCMonth();
					d.d = week.getUTCDate() + (d.w + 6) % 7;
				} else {
					week = localDate(newDate(d.y, 0, 1)), day = week.getDay();
					week = day > 4 || day === 0 ? timeMonday.ceil(week) : timeMonday(week);
					week = timeDay.offset(week, (d.V - 1) * 7);
					d.y = week.getFullYear();
					d.m = week.getMonth();
					d.d = week.getDate() + (d.w + 6) % 7;
				}
			} else if ("W" in d || "U" in d) {
				if (!("w" in d)) d.w = "u" in d ? d.u % 7 : "W" in d ? 1 : 0;
				day = "Z" in d ? utcDate(newDate(d.y, 0, 1)).getUTCDay() : localDate(newDate(d.y, 0, 1)).getDay();
				d.m = 0;
				d.d = "W" in d ? (d.w + 6) % 7 + d.W * 7 - (day + 5) % 7 : d.w + d.U * 7 - (day + 6) % 7;
			}
			if ("Z" in d) {
				d.H += d.Z / 100 | 0;
				d.M += d.Z % 100;
				return utcDate(d);
			}
			return localDate(d);
		};
	}
	function parseSpecifier(d, specifier, string, j) {
		var i = 0, n = specifier.length, m = string.length, c, parse;
		while (i < n) {
			if (j >= m) return -1;
			c = specifier.charCodeAt(i++);
			if (c === 37) {
				c = specifier.charAt(i++);
				parse = parses[c in pads ? specifier.charAt(i++) : c];
				if (!parse || (j = parse(d, string, j)) < 0) return -1;
			} else if (c != string.charCodeAt(j++)) return -1;
		}
		return j;
	}
	function parsePeriod(d, string, i) {
		var n = periodRe.exec(string.slice(i));
		return n ? (d.p = periodLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
	}
	function parseShortWeekday(d, string, i) {
		var n = shortWeekdayRe.exec(string.slice(i));
		return n ? (d.w = shortWeekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
	}
	function parseWeekday(d, string, i) {
		var n = weekdayRe.exec(string.slice(i));
		return n ? (d.w = weekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
	}
	function parseShortMonth(d, string, i) {
		var n = shortMonthRe.exec(string.slice(i));
		return n ? (d.m = shortMonthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
	}
	function parseMonth(d, string, i) {
		var n = monthRe.exec(string.slice(i));
		return n ? (d.m = monthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
	}
	function parseLocaleDateTime(d, string, i) {
		return parseSpecifier(d, locale_dateTime, string, i);
	}
	function parseLocaleDate(d, string, i) {
		return parseSpecifier(d, locale_date, string, i);
	}
	function parseLocaleTime(d, string, i) {
		return parseSpecifier(d, locale_time, string, i);
	}
	function formatShortWeekday(d) {
		return locale_shortWeekdays[d.getDay()];
	}
	function formatWeekday(d) {
		return locale_weekdays[d.getDay()];
	}
	function formatShortMonth(d) {
		return locale_shortMonths[d.getMonth()];
	}
	function formatMonth(d) {
		return locale_months[d.getMonth()];
	}
	function formatPeriod(d) {
		return locale_periods[+(d.getHours() >= 12)];
	}
	function formatQuarter(d) {
		return 1 + ~~(d.getMonth() / 3);
	}
	function formatUTCShortWeekday(d) {
		return locale_shortWeekdays[d.getUTCDay()];
	}
	function formatUTCWeekday(d) {
		return locale_weekdays[d.getUTCDay()];
	}
	function formatUTCShortMonth(d) {
		return locale_shortMonths[d.getUTCMonth()];
	}
	function formatUTCMonth(d) {
		return locale_months[d.getUTCMonth()];
	}
	function formatUTCPeriod(d) {
		return locale_periods[+(d.getUTCHours() >= 12)];
	}
	function formatUTCQuarter(d) {
		return 1 + ~~(d.getUTCMonth() / 3);
	}
	return {
		format: function(specifier) {
			var f = newFormat(specifier += "", formats);
			f.toString = function() {
				return specifier;
			};
			return f;
		},
		parse: function(specifier) {
			var p = newParse(specifier += "", false);
			p.toString = function() {
				return specifier;
			};
			return p;
		},
		utcFormat: function(specifier) {
			var f = newFormat(specifier += "", utcFormats);
			f.toString = function() {
				return specifier;
			};
			return f;
		},
		utcParse: function(specifier) {
			var p = newParse(specifier += "", true);
			p.toString = function() {
				return specifier;
			};
			return p;
		}
	};
}
var pads = {
	"-": "",
	"_": " ",
	"0": "0"
}, numberRe = /^\s*\d+/, percentRe = /^%/, requoteRe = /[\\^$*+?|[\]().{}]/g;
function pad(value, fill, width) {
	var sign = value < 0 ? "-" : "", string = (sign ? -value : value) + "", length = string.length;
	return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
}
function requote(s) {
	return s.replace(requoteRe, "\\$&");
}
function formatRe(names) {
	return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
}
function formatLookup(names) {
	return new Map(names.map((name, i) => [name.toLowerCase(), i]));
}
function parseWeekdayNumberSunday(d, string, i) {
	var n = numberRe.exec(string.slice(i, i + 1));
	return n ? (d.w = +n[0], i + n[0].length) : -1;
}
function parseWeekdayNumberMonday(d, string, i) {
	var n = numberRe.exec(string.slice(i, i + 1));
	return n ? (d.u = +n[0], i + n[0].length) : -1;
}
function parseWeekNumberSunday(d, string, i) {
	var n = numberRe.exec(string.slice(i, i + 2));
	return n ? (d.U = +n[0], i + n[0].length) : -1;
}
function parseWeekNumberISO(d, string, i) {
	var n = numberRe.exec(string.slice(i, i + 2));
	return n ? (d.V = +n[0], i + n[0].length) : -1;
}
function parseWeekNumberMonday(d, string, i) {
	var n = numberRe.exec(string.slice(i, i + 2));
	return n ? (d.W = +n[0], i + n[0].length) : -1;
}
function parseFullYear(d, string, i) {
	var n = numberRe.exec(string.slice(i, i + 4));
	return n ? (d.y = +n[0], i + n[0].length) : -1;
}
function parseYear(d, string, i) {
	var n = numberRe.exec(string.slice(i, i + 2));
	return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2e3), i + n[0].length) : -1;
}
function parseZone(d, string, i) {
	var n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i, i + 6));
	return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
}
function parseQuarter(d, string, i) {
	var n = numberRe.exec(string.slice(i, i + 1));
	return n ? (d.q = n[0] * 3 - 3, i + n[0].length) : -1;
}
function parseMonthNumber(d, string, i) {
	var n = numberRe.exec(string.slice(i, i + 2));
	return n ? (d.m = n[0] - 1, i + n[0].length) : -1;
}
function parseDayOfMonth(d, string, i) {
	var n = numberRe.exec(string.slice(i, i + 2));
	return n ? (d.d = +n[0], i + n[0].length) : -1;
}
function parseDayOfYear(d, string, i) {
	var n = numberRe.exec(string.slice(i, i + 3));
	return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
}
function parseHour24(d, string, i) {
	var n = numberRe.exec(string.slice(i, i + 2));
	return n ? (d.H = +n[0], i + n[0].length) : -1;
}
function parseMinutes(d, string, i) {
	var n = numberRe.exec(string.slice(i, i + 2));
	return n ? (d.M = +n[0], i + n[0].length) : -1;
}
function parseSeconds(d, string, i) {
	var n = numberRe.exec(string.slice(i, i + 2));
	return n ? (d.S = +n[0], i + n[0].length) : -1;
}
function parseMilliseconds(d, string, i) {
	var n = numberRe.exec(string.slice(i, i + 3));
	return n ? (d.L = +n[0], i + n[0].length) : -1;
}
function parseMicroseconds(d, string, i) {
	var n = numberRe.exec(string.slice(i, i + 6));
	return n ? (d.L = Math.floor(n[0] / 1e3), i + n[0].length) : -1;
}
function parseLiteralPercent(d, string, i) {
	var n = percentRe.exec(string.slice(i, i + 1));
	return n ? i + n[0].length : -1;
}
function parseUnixTimestamp(d, string, i) {
	var n = numberRe.exec(string.slice(i));
	return n ? (d.Q = +n[0], i + n[0].length) : -1;
}
function parseUnixTimestampSeconds(d, string, i) {
	var n = numberRe.exec(string.slice(i));
	return n ? (d.s = +n[0], i + n[0].length) : -1;
}
function formatDayOfMonth(d, p) {
	return pad(d.getDate(), p, 2);
}
function formatHour24(d, p) {
	return pad(d.getHours(), p, 2);
}
function formatHour12(d, p) {
	return pad(d.getHours() % 12 || 12, p, 2);
}
function formatDayOfYear(d, p) {
	return pad(1 + timeDay.count(timeYear(d), d), p, 3);
}
function formatMilliseconds(d, p) {
	return pad(d.getMilliseconds(), p, 3);
}
function formatMicroseconds(d, p) {
	return formatMilliseconds(d, p) + "000";
}
function formatMonthNumber(d, p) {
	return pad(d.getMonth() + 1, p, 2);
}
function formatMinutes(d, p) {
	return pad(d.getMinutes(), p, 2);
}
function formatSeconds(d, p) {
	return pad(d.getSeconds(), p, 2);
}
function formatWeekdayNumberMonday(d) {
	var day = d.getDay();
	return day === 0 ? 7 : day;
}
function formatWeekNumberSunday(d, p) {
	return pad(timeSunday.count(timeYear(d) - 1, d), p, 2);
}
function dISO(d) {
	var day = d.getDay();
	return day >= 4 || day === 0 ? timeThursday(d) : timeThursday.ceil(d);
}
function formatWeekNumberISO(d, p) {
	d = dISO(d);
	return pad(timeThursday.count(timeYear(d), d) + (timeYear(d).getDay() === 4), p, 2);
}
function formatWeekdayNumberSunday(d) {
	return d.getDay();
}
function formatWeekNumberMonday(d, p) {
	return pad(timeMonday.count(timeYear(d) - 1, d), p, 2);
}
function formatYear(d, p) {
	return pad(d.getFullYear() % 100, p, 2);
}
function formatYearISO(d, p) {
	d = dISO(d);
	return pad(d.getFullYear() % 100, p, 2);
}
function formatFullYear(d, p) {
	return pad(d.getFullYear() % 1e4, p, 4);
}
function formatFullYearISO(d, p) {
	var day = d.getDay();
	d = day >= 4 || day === 0 ? timeThursday(d) : timeThursday.ceil(d);
	return pad(d.getFullYear() % 1e4, p, 4);
}
function formatZone(d) {
	var z = d.getTimezoneOffset();
	return (z > 0 ? "-" : (z *= -1, "+")) + pad(z / 60 | 0, "0", 2) + pad(z % 60, "0", 2);
}
function formatUTCDayOfMonth(d, p) {
	return pad(d.getUTCDate(), p, 2);
}
function formatUTCHour24(d, p) {
	return pad(d.getUTCHours(), p, 2);
}
function formatUTCHour12(d, p) {
	return pad(d.getUTCHours() % 12 || 12, p, 2);
}
function formatUTCDayOfYear(d, p) {
	return pad(1 + utcDay.count(utcYear(d), d), p, 3);
}
function formatUTCMilliseconds(d, p) {
	return pad(d.getUTCMilliseconds(), p, 3);
}
function formatUTCMicroseconds(d, p) {
	return formatUTCMilliseconds(d, p) + "000";
}
function formatUTCMonthNumber(d, p) {
	return pad(d.getUTCMonth() + 1, p, 2);
}
function formatUTCMinutes(d, p) {
	return pad(d.getUTCMinutes(), p, 2);
}
function formatUTCSeconds(d, p) {
	return pad(d.getUTCSeconds(), p, 2);
}
function formatUTCWeekdayNumberMonday(d) {
	var dow = d.getUTCDay();
	return dow === 0 ? 7 : dow;
}
function formatUTCWeekNumberSunday(d, p) {
	return pad(utcSunday.count(utcYear(d) - 1, d), p, 2);
}
function UTCdISO(d) {
	var day = d.getUTCDay();
	return day >= 4 || day === 0 ? utcThursday(d) : utcThursday.ceil(d);
}
function formatUTCWeekNumberISO(d, p) {
	d = UTCdISO(d);
	return pad(utcThursday.count(utcYear(d), d) + (utcYear(d).getUTCDay() === 4), p, 2);
}
function formatUTCWeekdayNumberSunday(d) {
	return d.getUTCDay();
}
function formatUTCWeekNumberMonday(d, p) {
	return pad(utcMonday.count(utcYear(d) - 1, d), p, 2);
}
function formatUTCYear(d, p) {
	return pad(d.getUTCFullYear() % 100, p, 2);
}
function formatUTCYearISO(d, p) {
	d = UTCdISO(d);
	return pad(d.getUTCFullYear() % 100, p, 2);
}
function formatUTCFullYear(d, p) {
	return pad(d.getUTCFullYear() % 1e4, p, 4);
}
function formatUTCFullYearISO(d, p) {
	var day = d.getUTCDay();
	d = day >= 4 || day === 0 ? utcThursday(d) : utcThursday.ceil(d);
	return pad(d.getUTCFullYear() % 1e4, p, 4);
}
function formatUTCZone() {
	return "+0000";
}
function formatLiteralPercent() {
	return "%";
}
function formatUnixTimestamp(d) {
	return +d;
}
function formatUnixTimestampSeconds(d) {
	return Math.floor(+d / 1e3);
}
//#endregion
//#region node_modules/d3-time-format/src/defaultLocale.js
var locale;
var timeFormat;
var utcFormat;
defaultLocale({
	dateTime: "%x, %X",
	date: "%-m/%-d/%Y",
	time: "%-I:%M:%S %p",
	periods: ["AM", "PM"],
	days: [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday"
	],
	shortDays: [
		"Sun",
		"Mon",
		"Tue",
		"Wed",
		"Thu",
		"Fri",
		"Sat"
	],
	months: [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"
	],
	shortMonths: [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	]
});
function defaultLocale(definition) {
	locale = formatLocale(definition);
	timeFormat = locale.format;
	locale.parse;
	utcFormat = locale.utcFormat;
	locale.utcParse;
	return locale;
}
//#endregion
//#region node_modules/d3-scale/src/time.js
function date(t) {
	return new Date(t);
}
function number(t) {
	return t instanceof Date ? +t : +/* @__PURE__ */ new Date(+t);
}
function calendar(ticks, tickInterval, year, month, week, day, hour, minute, second, format) {
	var scale = continuous(), invert = scale.invert, domain = scale.domain;
	var formatMillisecond = format(".%L"), formatSecond = format(":%S"), formatMinute = format("%I:%M"), formatHour = format("%I %p"), formatDay = format("%a %d"), formatWeek = format("%b %d"), formatMonth = format("%B"), formatYear = format("%Y");
	function tickFormat(date) {
		return (second(date) < date ? formatMillisecond : minute(date) < date ? formatSecond : hour(date) < date ? formatMinute : day(date) < date ? formatHour : month(date) < date ? week(date) < date ? formatDay : formatWeek : year(date) < date ? formatMonth : formatYear)(date);
	}
	scale.invert = function(y) {
		return new Date(invert(y));
	};
	scale.domain = function(_) {
		return arguments.length ? domain(Array.from(_, number)) : domain().map(date);
	};
	scale.ticks = function(interval) {
		var d = domain();
		return ticks(d[0], d[d.length - 1], interval == null ? 10 : interval);
	};
	scale.tickFormat = function(count, specifier) {
		return specifier == null ? tickFormat : format(specifier);
	};
	scale.nice = function(interval) {
		var d = domain();
		if (!interval || typeof interval.range !== "function") interval = tickInterval(d[0], d[d.length - 1], interval == null ? 10 : interval);
		return interval ? domain(nice(d, interval)) : scale;
	};
	scale.copy = function() {
		return copy$1(scale, calendar(ticks, tickInterval, year, month, week, day, hour, minute, second, format));
	};
	return scale;
}
function time() {
	return initRange.apply(calendar(timeTicks, timeTickInterval, timeYear, timeMonth, timeSunday, timeDay, timeHour, timeMinute, second, timeFormat).domain([new Date(2e3, 0, 1), new Date(2e3, 0, 2)]), arguments);
}
//#endregion
//#region node_modules/d3-scale/src/utcTime.js
function utcTime() {
	return initRange.apply(calendar(utcTicks, utcTickInterval, utcYear, utcMonth, utcSunday, utcDay, utcHour, utcMinute, second, utcFormat).domain([Date.UTC(2e3, 0, 1), Date.UTC(2e3, 0, 2)]), arguments);
}
//#endregion
//#region node_modules/d3-scale/src/sequential.js
function transformer() {
	var x0 = 0, x1 = 1, t0, t1, k10, transform, interpolator = identity, clamp = false, unknown;
	function scale(x) {
		return x == null || isNaN(x = +x) ? unknown : interpolator(k10 === 0 ? .5 : (x = (transform(x) - t0) * k10, clamp ? Math.max(0, Math.min(1, x)) : x));
	}
	scale.domain = function(_) {
		return arguments.length ? ([x0, x1] = _, t0 = transform(x0 = +x0), t1 = transform(x1 = +x1), k10 = t0 === t1 ? 0 : 1 / (t1 - t0), scale) : [x0, x1];
	};
	scale.clamp = function(_) {
		return arguments.length ? (clamp = !!_, scale) : clamp;
	};
	scale.interpolator = function(_) {
		return arguments.length ? (interpolator = _, scale) : interpolator;
	};
	function range(interpolate) {
		return function(_) {
			var r0, r1;
			return arguments.length ? ([r0, r1] = _, interpolator = interpolate(r0, r1), scale) : [interpolator(0), interpolator(1)];
		};
	}
	scale.range = range(value_default);
	scale.rangeRound = range(round_default);
	scale.unknown = function(_) {
		return arguments.length ? (unknown = _, scale) : unknown;
	};
	return function(t) {
		transform = t, t0 = t(x0), t1 = t(x1), k10 = t0 === t1 ? 0 : 1 / (t1 - t0);
		return scale;
	};
}
function copy(source, target) {
	return target.domain(source.domain()).interpolator(source.interpolator()).clamp(source.clamp()).unknown(source.unknown());
}
function sequential() {
	var scale = linearish(transformer()(identity));
	scale.copy = function() {
		return copy(scale, sequential());
	};
	return initInterpolator.apply(scale, arguments);
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/colorScale.js
function getSequentialColorScale(config) {
	if (config.type === "piecewise") return threshold(config.thresholds, config.colors);
	return sequential([config.min ?? 0, config.max ?? 100], config.color);
}
function getOrdinalColorScale(config) {
	if (config.values) return ordinal(config.values, config.colors).unknown(config.unknownColor ?? null);
	return ordinal(config.colors.map((_, index) => index), config.colors).unknown(config.unknownColor ?? null);
}
function getColorScale(config) {
	return config.type === "ordinal" ? getOrdinalColorScale(config) : getSequentialColorScale(config);
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/ticks.js
function getTickNumber(params, domain, defaultTickNumber) {
	const { tickMaxStep, tickMinStep, tickNumber } = params;
	const maxTicks = tickMinStep === void 0 ? 999 : Math.floor(Math.abs(domain[1] - domain[0]) / tickMinStep);
	const minTicks = tickMaxStep === void 0 ? 2 : Math.ceil(Math.abs(domain[1] - domain[0]) / tickMaxStep);
	return Math.min(maxTicks, Math.max(minTicks, tickNumber ?? defaultTickNumber));
}
function scaleTickNumberByRange(tickNumber, range) {
	if (range[1] - range[0] === 0) return 1;
	return tickNumber / ((range[1] - range[0]) / 100);
}
function getDefaultTickNumber(dimension) {
	return Math.floor(Math.abs(dimension) / 50);
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/scales/scaleBand.js
function keyof(value) {
	if (Array.isArray(value)) return JSON.stringify(value);
	if (typeof value === "object" && value !== null) return value.valueOf();
	return value;
}
/**
* Constructs a new band scale with the specified range, no padding, no rounding and center alignment.
* The domain defaults to the empty domain.
* If range is not specified, it defaults to the unit range [0, 1].
*
* The generic corresponds to the data type of domain elements.
*
* @param range A two-element array of numeric values.
*/
/**
* Constructs a new band scale with the specified domain and range, no padding, no rounding and center alignment.
*
* The generic corresponds to the data type of domain elements.
*
* @param domain Array of domain values.
* @param range A two-element array of numeric values.
*/
function scaleBand(...args) {
	let index = new InternMap(void 0, keyof);
	let domain = [];
	let ordinalRange = [];
	let r0 = 0;
	let r1 = 1;
	let step;
	let bandwidth;
	let isRound = false;
	let paddingInner = 0;
	let paddingOuter = 0;
	let align = .5;
	const scale = (d) => {
		const i = index.get(d);
		if (i === void 0) return;
		return ordinalRange[i % ordinalRange.length];
	};
	const rescale = () => {
		const n = domain.length;
		const reverse = r1 < r0;
		const start = reverse ? r1 : r0;
		const stop = reverse ? r0 : r1;
		step = (stop - start) / Math.max(1, n - paddingInner + paddingOuter * 2);
		if (isRound) step = Math.floor(step);
		const adjustedStart = start + (stop - start - step * (n - paddingInner)) * align;
		bandwidth = step * (1 - paddingInner);
		const finalStart = isRound ? Math.round(adjustedStart) : adjustedStart;
		bandwidth = isRound ? Math.round(bandwidth) : bandwidth;
		const values = range(n).map((i) => finalStart + step * i);
		ordinalRange = reverse ? values.reverse() : values;
		return scale;
	};
	scale.domain = function(_) {
		if (!arguments.length) return domain.slice();
		domain = [];
		index = new InternMap(void 0, keyof);
		for (const value of _) {
			if (index.has(value)) continue;
			index.set(value, domain.push(value) - 1);
		}
		return rescale();
	};
	scale.range = function(_) {
		if (!arguments.length) return [r0, r1];
		const [v0, v1] = _;
		r0 = +v0;
		r1 = +v1;
		return rescale();
	};
	scale.rangeRound = function(_) {
		const [v0, v1] = _;
		r0 = +v0;
		r1 = +v1;
		isRound = true;
		return rescale();
	};
	scale.bandwidth = function() {
		return bandwidth;
	};
	scale.step = function() {
		return step;
	};
	scale.round = function(_) {
		if (!arguments.length) return isRound;
		isRound = !!_;
		return rescale();
	};
	scale.padding = function(_) {
		if (!arguments.length) return paddingInner;
		paddingInner = Math.min(1, paddingOuter = +_);
		return rescale();
	};
	scale.paddingInner = function(_) {
		if (!arguments.length) return paddingInner;
		paddingInner = Math.min(1, _);
		return rescale();
	};
	scale.paddingOuter = function(_) {
		if (!arguments.length) return paddingOuter;
		paddingOuter = +_;
		return rescale();
	};
	scale.align = function(_) {
		if (!arguments.length) return align;
		align = Math.max(0, Math.min(1, _));
		return rescale();
	};
	scale.copy = () => {
		return scaleBand(domain, [r0, r1]).round(isRound).paddingInner(paddingInner).paddingOuter(paddingOuter).align(align);
	};
	const [arg0, arg1] = args;
	if (args.length > 1) {
		scale.domain(arg0);
		scale.range(arg1);
	} else if (arg0) scale.range(arg0);
	else rescale();
	return scale;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/scales/scalePoint.js
/**
* Constructs a new point scale with the specified range, no padding, no rounding and center alignment.
* The domain defaults to the empty domain.
* If range is not specified, it defaults to the unit range [0, 1].
*
* The generic corresponds to the data type of domain elements.
*
* @param range A two-element array of numeric values.
*/
/**
* Constructs a new point scale with the specified domain and range, no padding, no rounding and center alignment.
* The domain defaults to the empty domain.
*
* The generic corresponds to the data type of domain elements.
*
* @param domain Array of domain values.
* @param range A two-element array of numeric values.
*/
function scalePoint(...args) {
	const scale = scaleBand(...args).paddingInner(1);
	const originalCopy = scale.copy;
	scale.padding = scale.paddingOuter;
	delete scale.paddingInner;
	delete scale.paddingOuter;
	scale.copy = () => {
		const copied = originalCopy();
		copied.padding = copied.paddingOuter;
		delete copied.paddingInner;
		delete copied.paddingOuter;
		copied.copy = scale.copy;
		return copied;
	};
	return scale;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/scales/scaleSymlog.js
/**
* Constructs a new continuous scale with the specified range, the constant 1, the default interpolator and clamping disabled.
* The domain defaults to [0, 1].
* If range is not specified, it defaults to [0, 1].
*
* The first generic corresponds to the data type of the range elements.
* The second generic corresponds to the data type of the output elements generated by the scale.
* The third generic corresponds to the data type of the unknown value.
*
* If range element and output element type differ, the interpolator factory used with the scale must match this behavior and
* convert the interpolated range element to a corresponding output element.
*
* The range must be set in accordance with the range element type.
*
* The interpolator factory may be set using the interpolate(...) method of the scale.
*
* @param range Array of range values.
*/
/**
* Constructs a new continuous scale with the specified domain and range, the constant 1, the default interpolator and clamping disabled.
*
* The first generic corresponds to the data type of the range elements.
* The second generic corresponds to the data type of the output elements generated by the scale.
* The third generic corresponds to the data type of the unknown value.
*
* If range element and output element type differ, the interpolator factory used with the scale must match this behavior and
* convert the interpolated range element to a corresponding output element.
*
* The range must be set in accordance with the range element type.
*
* The interpolator factory may be set using the interpolate(...) method of the scale.
*
* @param domain Array of numeric domain values.
* @param range Array of range values.
*/
function scaleSymlog(...args) {
	const scale = symlog(...args);
	const originalTicks = scale.ticks;
	const { negativeScale, linearScale, positiveScale } = generateScales(scale);
	scale.ticks = (count) => {
		const ticks = originalTicks(count);
		const constant = scale.constant();
		let negativeLogTickCount = 0;
		let linearTickCount = 0;
		let positiveLogTickCount = 0;
		ticks.forEach((tick) => {
			if (tick > -constant && tick < constant) linearTickCount += 1;
			if (tick <= -constant) negativeLogTickCount += 1;
			if (tick >= constant) positiveLogTickCount += 1;
		});
		const finalTicks = [];
		if (negativeLogTickCount > 0) finalTicks.push(...negativeScale.ticks(negativeLogTickCount));
		if (linearTickCount > 0) {
			const linearTicks = linearScale.ticks(linearTickCount);
			if (finalTicks.at(-1) === linearTicks[0]) finalTicks.push(...linearTicks.slice(1));
			else finalTicks.push(...linearTicks);
		}
		if (positiveLogTickCount > 0) {
			const positiveTicks = positiveScale.ticks(positiveLogTickCount);
			if (finalTicks.at(-1) === positiveTicks[0]) finalTicks.push(...positiveTicks.slice(1));
			else finalTicks.push(...positiveTicks);
		}
		return finalTicks;
	};
	scale.tickFormat = (count = 10, specifier) => {
		const constant = scale.constant();
		const [start, end] = scale.domain();
		const extent = end - start;
		const negativeScaleDomain = negativeScale.domain();
		const negativeScaleExtent = negativeScaleDomain[1] - negativeScaleDomain[0];
		const negativeScaleTickCount = (extent === 0 ? 0 : negativeScaleExtent / extent) * count;
		const linearScaleDomain = linearScale.domain();
		const linearScaleExtent = linearScaleDomain[1] - linearScaleDomain[0];
		const linearScaleTickCount = (extent === 0 ? 0 : linearScaleExtent / extent) * count;
		const positiveScaleDomain = positiveScale.domain();
		const positiveScaleExtent = positiveScaleDomain[1] - positiveScaleDomain[0];
		const positiveScaleTickCount = (extent === 0 ? 0 : positiveScaleExtent / extent) * count;
		const negativeTickFormat = negativeScale.tickFormat(negativeScaleTickCount, specifier);
		const linearTickFormat = linearScale.tickFormat(linearScaleTickCount, specifier);
		const positiveTickFormat = positiveScale.tickFormat(positiveScaleTickCount, specifier);
		return (tick) => {
			return (tick.valueOf() <= -constant ? negativeTickFormat : tick.valueOf() >= constant ? positiveTickFormat : linearTickFormat)(tick);
		};
	};
	scale.copy = () => {
		return scaleSymlog(scale.domain(), scale.range()).constant(scale.constant());
	};
	return scale;
}
function generateScales(scale) {
	const constant = scale.constant();
	const domain = scale.domain();
	return {
		negativeScale: log([domain[0], Math.min(domain[1], -constant)], scale.range()),
		linearScale: linear([Math.max(domain[0], -constant), Math.min(domain[1], constant)], scale.range()),
		positiveScale: log([Math.max(domain[0], constant), domain[1]], scale.range())
	};
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/getScale.js
function getScale(scaleType, domain, range) {
	switch (scaleType) {
		case "log": return log(domain, range);
		case "pow": return pow(domain, range);
		case "sqrt": return sqrt$1(domain, range);
		case "time": return time(domain, range);
		case "utc": return utcTime(domain, range);
		case "symlog": return scaleSymlog(domain, range);
		default: return linear(domain, range);
	}
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/dateHelpers.js
/**
* Checks if the provided data array contains Date objects.
* @param data The data array to check.
* @returns A type predicate indicating if the data is an array of Date objects.
*/
var isDateData = (data) => data?.[0] instanceof Date;
/**
* Creates a formatter function for date values.
* @param data The data array containing Date or NumberValue objects.
* @param range The range for the time scale.
* @param tickNumber (Optional) The number of ticks for formatting.
* @returns A formatter function for date values.
*/
function createDateFormatter(data, range, tickNumber) {
	const timeScale = time(data, range);
	return (v, { location }) => location === "tick" ? timeScale.tickFormat(tickNumber)(v) : `${v.toLocaleString()}`;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/configInit.js
var cartesianInstance;
var polarInstance;
var CartesianSeriesTypes = class {
	types = /* @__PURE__ */ new Set();
	constructor() {
		if (cartesianInstance) throw new Error("You can only create one instance!");
		cartesianInstance = this.types;
	}
	addType(value) {
		this.types.add(value);
	}
	getTypes() {
		return this.types;
	}
};
var PolarSeriesTypes = class {
	types = /* @__PURE__ */ new Set();
	constructor() {
		if (polarInstance) throw new Error("You can only create one instance!");
		polarInstance = this.types;
	}
	addType(value) {
		this.types.add(value);
	}
	getTypes() {
		return this.types;
	}
};
var cartesianSeriesTypes = new CartesianSeriesTypes();
cartesianSeriesTypes.addType("bar");
cartesianSeriesTypes.addType("line");
cartesianSeriesTypes.addType("scatter");
var polarSeriesTypes = new PolarSeriesTypes();
polarSeriesTypes.addType("radar");
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/isCartesian.js
function isCartesianSeriesType(seriesType) {
	return cartesianSeriesTypes.getTypes().has(seriesType);
}
function isCartesianSeries(series) {
	return isCartesianSeriesType(series.type);
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartCartesianAxis/getAxisTriggerTooltip.js
var getAxisTriggerTooltip$1 = (axisDirection, seriesConfig, formattedSeries, defaultAxisId) => {
	const tooltipAxesIds = /* @__PURE__ */ new Set();
	Object.keys(seriesConfig).filter(isCartesianSeriesType).forEach((chartType) => {
		const series = formattedSeries[chartType]?.series ?? {};
		const tooltipAxes = seriesConfig[chartType].axisTooltipGetter?.(series);
		if (tooltipAxes === void 0) return;
		tooltipAxes.forEach(({ axisId, direction }) => {
			if (direction === axisDirection) tooltipAxesIds.add(axisId ?? defaultAxisId);
		});
	});
	return tooltipAxesIds;
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/scaleGuards.js
function isOrdinalScale(scale) {
	return scale.bandwidth !== void 0;
}
function isBandScale(scale) {
	return isOrdinalScale(scale) && scale.paddingOuter !== void 0;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartCartesianAxis/computeAxisValue.js
function getRange$2(drawingArea, axisDirection, reverse) {
	const range = axisDirection === "x" ? [drawingArea.left, drawingArea.left + drawingArea.width] : [drawingArea.top + drawingArea.height, drawingArea.top];
	return reverse ? [range[1], range[0]] : range;
}
function shouldIgnoreGapRatios(scale, categoryGapRatio) {
	return scale.step() * categoryGapRatio < .1;
}
var DEFAULT_CATEGORY_GAP_RATIO$2 = .2;
var DEFAULT_BAR_GAP_RATIO$1 = .1;
function computeAxisValue$1({ scales, drawingArea, formattedSeries, axis: allAxis, seriesConfig, axisDirection, zoomMap, domains }) {
	if (allAxis === void 0) return {
		axis: {},
		axisIds: []
	};
	const axisIdsTriggeringTooltip = getAxisTriggerTooltip$1(axisDirection, seriesConfig, formattedSeries, allAxis[0].id);
	const completeAxis = {};
	allAxis.forEach((eachAxis) => {
		const axis = eachAxis;
		const scale = scales[axis.id];
		const zoom = zoomMap?.get(axis.id);
		const zoomRange = zoom ? [zoom.start, zoom.end] : [0, 100];
		const range = getRange$2(drawingArea, axisDirection, axis.reverse ?? false);
		const rawTickNumber = domains[axis.id].tickNumber;
		const triggerTooltip = !axis.ignoreTooltip && axisIdsTriggeringTooltip.has(axis.id);
		const tickNumber = scaleTickNumberByRange(rawTickNumber, zoomRange);
		const data = axis.data ?? [];
		if (isOrdinalScale(scale)) {
			const scaleRange = axisDirection === "y" ? [range[1], range[0]] : range;
			if (isBandScale(scale) && isBandScaleConfig(axis)) {
				const desiredCategoryGapRatio = axis.categoryGapRatio ?? DEFAULT_CATEGORY_GAP_RATIO$2;
				const ignoreGapRatios = shouldIgnoreGapRatios(scale, desiredCategoryGapRatio);
				const categoryGapRatio = ignoreGapRatios ? 0 : desiredCategoryGapRatio;
				const barGapRatio = ignoreGapRatios ? 0 : axis.barGapRatio ?? DEFAULT_BAR_GAP_RATIO$1;
				completeAxis[axis.id] = _extends({
					offset: 0,
					height: 0,
					categoryGapRatio,
					barGapRatio,
					triggerTooltip
				}, axis, {
					data,
					scale: ignoreGapRatios ? scale.copy().padding(0) : scale,
					tickNumber,
					colorScale: axis.colorMap && (axis.colorMap.type === "ordinal" ? getOrdinalColorScale(_extends({ values: axis.data }, axis.colorMap)) : getColorScale(axis.colorMap))
				});
			}
			if (isPointScaleConfig(axis)) completeAxis[axis.id] = _extends({
				offset: 0,
				height: 0,
				triggerTooltip
			}, axis, {
				data,
				scale,
				tickNumber,
				colorScale: axis.colorMap && (axis.colorMap.type === "ordinal" ? getOrdinalColorScale(_extends({ values: axis.data }, axis.colorMap)) : getColorScale(axis.colorMap))
			});
			if (isDateData(axis.data)) {
				const dateFormatter = createDateFormatter(axis.data, scaleRange, axis.tickNumber);
				completeAxis[axis.id].valueFormatter = axis.valueFormatter ?? dateFormatter;
			}
			return;
		}
		if (axis.scaleType === "band" || axis.scaleType === "point") return;
		const continuousAxis = axis;
		const scaleType = continuousAxis.scaleType ?? "linear";
		completeAxis[axis.id] = _extends({
			offset: 0,
			height: 0,
			triggerTooltip
		}, continuousAxis, {
			data,
			scaleType,
			scale,
			tickNumber,
			colorScale: continuousAxis.colorMap && getSequentialColorScale(continuousAxis.colorMap),
			valueFormatter: axis.valueFormatter ?? createScalarFormatter(tickNumber, getScale(scaleType, range.map((v) => scale.invert(v)), range))
		});
	});
	return {
		axis: completeAxis,
		axisIds: allAxis.map(({ id }) => id)
	};
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/isDefined.js
function isDefined(value) {
	return value !== null && value !== void 0;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartCartesianAxis/createAxisFilterMapper.js
function createDiscreteScaleGetAxisFilter(axisData, zoomStart, zoomEnd, direction) {
	const maxIndex = axisData?.length ?? 0;
	const minVal = Math.floor(zoomStart * maxIndex / 100);
	const maxVal = Math.ceil(zoomEnd * maxIndex / 100);
	return function filterAxis(value, dataIndex) {
		if ((value[direction] ?? axisData?.[dataIndex]) == null) return true;
		return dataIndex >= minVal && dataIndex < maxVal;
	};
}
function createContinuousScaleGetAxisFilter(domain, zoomStart, zoomEnd, direction, axisData) {
	const min = domain[0].valueOf();
	const max = domain[1].valueOf();
	const minVal = min + zoomStart * (max - min) / 100;
	const maxVal = min + zoomEnd * (max - min) / 100;
	return function filterAxis(value, dataIndex) {
		const val = value[direction] ?? axisData?.[dataIndex];
		if (val == null) return true;
		return val >= minVal && val <= maxVal;
	};
}
var createGetAxisFilters = (filters) => ({ currentAxisId, seriesXAxisId, seriesYAxisId, isDefaultAxis }) => {
	return (value, dataIndex) => {
		if (!(currentAxisId === seriesXAxisId ? seriesYAxisId : seriesXAxisId) || isDefaultAxis) return Object.values(filters ?? {})[0]?.(value, dataIndex) ?? true;
		return [seriesYAxisId, seriesXAxisId].filter((id) => id !== currentAxisId).map((id) => filters[id ?? ""]).filter(isDefined).every((f) => f(value, dataIndex));
	};
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartCartesianAxis/createZoomLookup.js
var createZoomLookup = (axisDirection) => (axes = []) => axes.reduce((acc, v) => {
	const { zoom, id: axisId, reverse } = v;
	const defaultizedZoom = defaultizeZoom(zoom, axisId, axisDirection, reverse);
	if (defaultizedZoom) acc[axisId] = defaultizedZoom;
	return acc;
}, {});
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartCartesianAxis/getAxisScale.js
var DEFAULT_CATEGORY_GAP_RATIO$1 = .2;
function getRange$1(drawingArea, axisDirection, axis) {
	const range = axisDirection === "x" ? [drawingArea.left, drawingArea.left + drawingArea.width] : [drawingArea.top + drawingArea.height, drawingArea.top];
	return axis.reverse ? [range[1], range[0]] : range;
}
function getNormalizedAxisScale(axis, domain) {
	const range = [0, 1];
	if (isBandScaleConfig(axis)) {
		const categoryGapRatio = axis.categoryGapRatio ?? DEFAULT_CATEGORY_GAP_RATIO$1;
		return scaleBand(domain, range).paddingInner(categoryGapRatio).paddingOuter(categoryGapRatio / 2);
	}
	if (isPointScaleConfig(axis)) return scalePoint(domain, range);
	const scale = getScale(axis.scaleType ?? "linear", domain, range);
	if (isSymlogScaleConfig(axis) && axis.constant != null) scale.constant(axis.constant);
	return scale;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartCartesianAxis/zoom.js
/**
* Applies the zoom into the scale range.
* It changes the screen coordinates that the scale covers.
* Not the data that is displayed.
*
* @param scaleRange the original range in real screen coordinates.
* @param zoomRange the zoom range in percentage.
* @returns zoomed range in real screen coordinates.
*/
var zoomScaleRange = (scaleRange, zoomRange) => {
	const rangeGap = scaleRange[1] - scaleRange[0];
	const zoomGap = zoomRange[1] - zoomRange[0];
	return [scaleRange[0] - zoomRange[0] * rangeGap / zoomGap, scaleRange[1] + (100 - zoomRange[1]) * rangeGap / zoomGap];
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartCartesianAxis/getAxisExtrema.js
var axisExtremumCallback$1 = (chartType, axis, axisDirection, seriesConfig, axisIndex, formattedSeries, getFilters) => {
	const getter = axisDirection === "x" ? seriesConfig[chartType].xExtremumGetter : seriesConfig[chartType].yExtremumGetter;
	const series = formattedSeries[chartType]?.series ?? {};
	return getter?.({
		series,
		axis,
		axisIndex,
		isDefaultAxis: axisIndex === 0,
		getFilters
	}) ?? [Infinity, -Infinity];
};
function getAxisExtrema(axis, axisDirection, seriesConfig, axisIndex, formattedSeries, getFilters) {
	const cartesianChartTypes = Object.keys(seriesConfig).filter(isCartesianSeriesType);
	let extrema = [Infinity, -Infinity];
	for (const chartType of cartesianChartTypes) {
		const [min, max] = axisExtremumCallback$1(chartType, axis, axisDirection, seriesConfig, axisIndex, formattedSeries, getFilters);
		extrema = [Math.min(extrema[0], min), Math.max(extrema[1], max)];
	}
	if (Number.isNaN(extrema[0]) || Number.isNaN(extrema[1])) return [Infinity, -Infinity];
	return extrema;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartCartesianAxis/getAxisDomainLimit.js
var getAxisDomainLimit = (axis, axisDirection, axisIndex, formattedSeries) => {
	if (axis.domainLimit !== void 0) return axis.domainLimit;
	if (axisDirection === "x") for (const seriesId of formattedSeries.line?.seriesOrder ?? []) {
		const series = formattedSeries.line.series[seriesId];
		if (series.xAxisId === axis.id || series.xAxisId === void 0 && axisIndex === 0) return "strict";
	}
	return "nice";
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartCartesianAxis/domain.js
function niceDomain(scaleType, domain, tickNumber) {
	return getScale(scaleType ?? "linear", domain, [0, 1]).nice(tickNumber).domain();
}
/**
* Calculates the initial domain and tick number for a given axis.
* The domain should still run through the zoom filterMode after this step.
*/
function calculateInitialDomainAndTickNumber(axis, axisDirection, axisIndex, formattedSeries, [minData, maxData], defaultTickNumber, preferStrictDomainInLineCharts) {
	const domainLimit = getDomainLimit(axis, axisDirection, axisIndex, formattedSeries, preferStrictDomainInLineCharts);
	let axisExtrema = getActualAxisExtrema(axis, minData, maxData);
	if (typeof domainLimit === "function") {
		const { min, max } = domainLimit(minData.valueOf(), maxData.valueOf());
		axisExtrema[0] = min;
		axisExtrema[1] = max;
	}
	const tickNumber = getTickNumber(axis, axisExtrema, defaultTickNumber);
	if (domainLimit === "nice") axisExtrema = niceDomain(axis.scaleType, axisExtrema, tickNumber);
	axisExtrema = ["min" in axis ? axis.min ?? axisExtrema[0] : axisExtrema[0], "max" in axis ? axis.max ?? axisExtrema[1] : axisExtrema[1]];
	return {
		domain: axisExtrema,
		tickNumber
	};
}
/**
* Calculates the final domain for an axis.
* After this step, the domain can be used to create the axis scale.
*/
function calculateFinalDomain(axis, axisDirection, axisIndex, formattedSeries, [minData, maxData], tickNumber, preferStrictDomainInLineCharts) {
	const domainLimit = getDomainLimit(axis, axisDirection, axisIndex, formattedSeries, preferStrictDomainInLineCharts);
	let axisExtrema = getActualAxisExtrema(axis, minData, maxData);
	if (typeof domainLimit === "function") {
		const { min, max } = domainLimit(minData.valueOf(), maxData.valueOf());
		axisExtrema[0] = min;
		axisExtrema[1] = max;
	}
	if (domainLimit === "nice") axisExtrema = niceDomain(axis.scaleType, axisExtrema, tickNumber);
	return [axis.min ?? axisExtrema[0], axis.max ?? axisExtrema[1]];
}
function getDomainLimit(axis, axisDirection, axisIndex, formattedSeries, preferStrictDomainInLineCharts) {
	return preferStrictDomainInLineCharts ? getAxisDomainLimit(axis, axisDirection, axisIndex, formattedSeries) : axis.domainLimit ?? "nice";
}
/**
* Get the actual axis extrema considering the user defined min and max values.
* @param axisExtrema User defined axis extrema.
* @param minData Minimum value from the data.
* @param maxData Maximum value from the data.
*/
function getActualAxisExtrema(axisExtrema, minData, maxData) {
	let min = minData;
	let max = maxData;
	if ("max" in axisExtrema && axisExtrema.max != null && axisExtrema.max < minData) min = axisExtrema.max;
	if ("min" in axisExtrema && axisExtrema.min != null && axisExtrema.min > minData) max = axisExtrema.min;
	if (!("min" in axisExtrema) && !("max" in axisExtrema)) return [min, max];
	return [axisExtrema.min ?? min, axisExtrema.max ?? max];
}
//#endregion
//#region node_modules/flatqueue/index.js
/** @template T */
var FlatQueue = class {
	constructor() {
		/** @type T[] */
		this.ids = [];
		/** @type number[] */
		this.values = [];
		/** Number of items in the queue. */
		this.length = 0;
	}
	/** Removes all items from the queue. */
	clear() {
		this.length = 0;
	}
	/**
	* Adds `item` to the queue with the specified `priority`.
	*
	* `priority` must be a number. Items are sorted and returned from low to high priority. Multiple items
	* with the same priority value can be added to the queue, but there is no guaranteed order between these items.
	*
	* @param {T} item
	* @param {number} priority
	*/
	push(item, priority) {
		let pos = this.length++;
		while (pos > 0) {
			const parent = pos - 1 >> 1;
			const parentValue = this.values[parent];
			if (priority >= parentValue) break;
			this.ids[pos] = this.ids[parent];
			this.values[pos] = parentValue;
			pos = parent;
		}
		this.ids[pos] = item;
		this.values[pos] = priority;
	}
	/**
	* Removes and returns the item from the head of this queue, which is one of
	* the items with the lowest priority. If this queue is empty, returns `undefined`.
	*/
	pop() {
		if (this.length === 0) return void 0;
		const ids = this.ids, values = this.values, top = ids[0], last = --this.length;
		if (last > 0) {
			const id = ids[last];
			const value = values[last];
			let pos = 0;
			const halfLen = last >> 1;
			while (pos < halfLen) {
				const left = (pos << 1) + 1;
				const right = left + 1;
				const child = left + (+(right < last) & +(values[right] < values[left]));
				if (values[child] >= value) break;
				ids[pos] = ids[child];
				values[pos] = values[child];
				pos = child;
			}
			ids[pos] = id;
			values[pos] = value;
		}
		return top;
	}
	/** Returns the item from the head of this queue without removing it. If this queue is empty, returns `undefined`. */
	peek() {
		return this.length > 0 ? this.ids[0] : void 0;
	}
	/**
	* Returns the priority value of the item at the head of this queue without
	* removing it. If this queue is empty, returns `undefined`.
	*/
	peekValue() {
		return this.length > 0 ? this.values[0] : void 0;
	}
	/**
	* Shrinks the internal arrays to `this.length`.
	*
	* `pop()` and `clear()` calls don't free memory automatically to avoid unnecessary resize operations.
	* This also means that items that have been added to the queue can't be garbage collected until
	* a new item is pushed in their place, or this method is called.
	*/
	shrink() {
		this.ids.length = this.values.length = this.length;
	}
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/Flatbush.js
var ARRAY_TYPES = [
	Int8Array,
	Uint8Array,
	Uint8ClampedArray,
	Int16Array,
	Uint16Array,
	Int32Array,
	Uint32Array,
	Float32Array,
	Float64Array
];
var VERSION = 3;
var Flatbush = class Flatbush {
	/**
	* Recreate a Flatbush index from raw `ArrayBuffer` or `SharedArrayBuffer` data.
	* @param {ArrayBufferLike} data
	* @param {number} [byteOffset=0] byte offset to the start of the Flatbush buffer in the referenced ArrayBuffer.
	* @returns {Flatbush} index
	*/
	static from(data, byteOffset = 0) {
		if (byteOffset % 8 !== 0) throw new Error("byteOffset must be 8-byte aligned.");
		if (!data || data.byteLength === void 0 || data.buffer) throw new Error("Data must be an instance of ArrayBuffer or SharedArrayBuffer.");
		const [magic, versionAndType] = new Uint8Array(data, byteOffset + 0, 2);
		if (magic !== 251) throw new Error("Data does not appear to be in a Flatbush format.");
		const version = versionAndType >> 4;
		if (version !== VERSION) throw new Error(`Got v${version} data when expected v${VERSION}.`);
		const ArrayType = ARRAY_TYPES[versionAndType & 15];
		if (!ArrayType) throw new Error("Unrecognized array type.");
		const [nodeSize] = new Uint16Array(data, byteOffset + 2, 1);
		const [numItems] = new Uint32Array(data, byteOffset + 4, 1);
		return new Flatbush(numItems, nodeSize, ArrayType, void 0, data, byteOffset);
	}
	/**
	* Create a Flatbush index that will hold a given number of items.
	* @param {number} numItems
	* @param {number} [nodeSize=16] Size of the tree node (16 by default).
	* @param {TypedArrayConstructor} [ArrayType=Float64Array] The array type used for coordinates storage (`Float64Array` by default).
	* @param {ArrayBufferConstructor | SharedArrayBufferConstructor} [ArrayBufferType=ArrayBuffer] The array buffer type used to store data (`ArrayBuffer` by default).
	* @param {ArrayBufferLike} [data] (Only used internally)
	* @param {number} [byteOffset=0] (Only used internally)
	*/
	constructor(numItems, nodeSize = 16, ArrayType = Float64Array, ArrayBufferType = ArrayBuffer, data, byteOffset = 0) {
		if (numItems === void 0) throw new Error("Missing required argument: numItems.");
		if (isNaN(numItems) || numItems <= 0) throw new Error(`Unexpected numItems value: ${numItems}.`);
		this.numItems = +numItems;
		this.nodeSize = Math.min(Math.max(+nodeSize, 2), 65535);
		this.byteOffset = byteOffset;
		let n = numItems;
		let numNodes = n;
		this._levelBounds = [n * 4];
		do {
			n = Math.ceil(n / this.nodeSize);
			numNodes += n;
			this._levelBounds.push(numNodes * 4);
		} while (n !== 1);
		this.ArrayType = ArrayType;
		this.IndexArrayType = numNodes < 16384 ? Uint16Array : Uint32Array;
		const arrayTypeIndex = ARRAY_TYPES.indexOf(ArrayType);
		const nodesByteSize = numNodes * 4 * ArrayType.BYTES_PER_ELEMENT;
		if (arrayTypeIndex < 0) throw new Error(`Unexpected typed array class: ${ArrayType}.`);
		if (data) {
			this.data = data;
			this._boxes = new ArrayType(data, byteOffset + 8, numNodes * 4);
			this._indices = new this.IndexArrayType(data, byteOffset + 8 + nodesByteSize, numNodes);
			this._pos = numNodes * 4;
			this.minX = this._boxes[this._pos - 4];
			this.minY = this._boxes[this._pos - 3];
			this.maxX = this._boxes[this._pos - 2];
			this.maxY = this._boxes[this._pos - 1];
		} else {
			const data = this.data = new ArrayBufferType(8 + nodesByteSize + numNodes * this.IndexArrayType.BYTES_PER_ELEMENT);
			this._boxes = new ArrayType(data, 8, numNodes * 4);
			this._indices = new this.IndexArrayType(data, 8 + nodesByteSize, numNodes);
			this._pos = 0;
			this.minX = Infinity;
			this.minY = Infinity;
			this.maxX = -Infinity;
			this.maxY = -Infinity;
			new Uint8Array(data, 0, 2).set([251, (VERSION << 4) + arrayTypeIndex]);
			new Uint16Array(data, 2, 1)[0] = nodeSize;
			new Uint32Array(data, 4, 1)[0] = numItems;
		}
		/** @type FlatQueue<number> */
		this._queue = new FlatQueue();
	}
	/**
	* Add a given rectangle to the index.
	* @param {number} minX
	* @param {number} minY
	* @param {number} maxX
	* @param {number} maxY
	* @returns {number} A zero-based, incremental number that represents the newly added rectangle.
	*/
	add(minX, minY, maxX = minX, maxY = minY) {
		const index = this._pos >> 2;
		const boxes = this._boxes;
		this._indices[index] = index;
		boxes[this._pos++] = minX;
		boxes[this._pos++] = minY;
		boxes[this._pos++] = maxX;
		boxes[this._pos++] = maxY;
		if (minX < this.minX) this.minX = minX;
		if (minY < this.minY) this.minY = minY;
		if (maxX > this.maxX) this.maxX = maxX;
		if (maxY > this.maxY) this.maxY = maxY;
		return index;
	}
	/** Perform indexing of the added rectangles. */
	finish() {
		if (this._pos >> 2 !== this.numItems) throw new Error(`Added ${this._pos >> 2} items when expected ${this.numItems}.`);
		const boxes = this._boxes;
		if (this.numItems <= this.nodeSize) {
			boxes[this._pos++] = this.minX;
			boxes[this._pos++] = this.minY;
			boxes[this._pos++] = this.maxX;
			boxes[this._pos++] = this.maxY;
			return;
		}
		const width = this.maxX - this.minX || 1;
		const height = this.maxY - this.minY || 1;
		const hilbertValues = new Uint32Array(this.numItems);
		const hilbertMax = 65535;
		for (let i = 0, pos = 0; i < this.numItems; i++) {
			const minX = boxes[pos++];
			const minY = boxes[pos++];
			const maxX = boxes[pos++];
			const maxY = boxes[pos++];
			hilbertValues[i] = hilbert(Math.floor(hilbertMax * ((minX + maxX) / 2 - this.minX) / width), Math.floor(hilbertMax * ((minY + maxY) / 2 - this.minY) / height));
		}
		sort(hilbertValues, boxes, this._indices, 0, this.numItems - 1, this.nodeSize);
		for (let i = 0, pos = 0; i < this._levelBounds.length - 1; i++) {
			const end = this._levelBounds[i];
			while (pos < end) {
				const nodeIndex = pos;
				let nodeMinX = boxes[pos++];
				let nodeMinY = boxes[pos++];
				let nodeMaxX = boxes[pos++];
				let nodeMaxY = boxes[pos++];
				for (let j = 1; j < this.nodeSize && pos < end; j++) {
					nodeMinX = Math.min(nodeMinX, boxes[pos++]);
					nodeMinY = Math.min(nodeMinY, boxes[pos++]);
					nodeMaxX = Math.max(nodeMaxX, boxes[pos++]);
					nodeMaxY = Math.max(nodeMaxY, boxes[pos++]);
				}
				this._indices[this._pos >> 2] = nodeIndex;
				boxes[this._pos++] = nodeMinX;
				boxes[this._pos++] = nodeMinY;
				boxes[this._pos++] = nodeMaxX;
				boxes[this._pos++] = nodeMaxY;
			}
		}
	}
	/**
	* Search the index by a bounding box.
	* @param {number} minX
	* @param {number} minY
	* @param {number} maxX
	* @param {number} maxY
	* @param {(index: number) => boolean} [filterFn] An optional function for filtering the results.
	* @returns {number[]} An array containing the index, the x coordinate and the y coordinate of the points intersecting or touching the given bounding box.
	*/
	search(minX, minY, maxX, maxY, filterFn) {
		if (this._pos !== this._boxes.length) throw new Error("Data not yet indexed - call index.finish().");
		/** @type number | undefined */
		let nodeIndex = this._boxes.length - 4;
		const queue = [];
		const results = [];
		while (nodeIndex !== void 0) {
			const end = Math.min(nodeIndex + this.nodeSize * 4, upperBound(nodeIndex, this._levelBounds));
			for (let pos = nodeIndex; pos < end; pos += 4) {
				if (maxX < this._boxes[pos]) continue;
				if (maxY < this._boxes[pos + 1]) continue;
				if (minX > this._boxes[pos + 2]) continue;
				if (minY > this._boxes[pos + 3]) continue;
				const index = this._indices[pos >> 2] | 0;
				if (nodeIndex >= this.numItems * 4) queue.push(index);
				else if (filterFn === void 0 || filterFn(index)) {
					results.push(index);
					results.push(this._boxes[pos]);
					results.push(this._boxes[pos + 1]);
				}
			}
			nodeIndex = queue.pop();
		}
		return results;
	}
	/**
	* Search items in order of distance from the given point.
	* @param x
	* @param y
	* @param [maxResults=Infinity]
	* @param maxDistSq
	* @param [filterFn] An optional function for filtering the results.
	* @param [sqDistFn] An optional function to calculate squared distance from the point to the item.
	* @returns {number[]} An array of indices of items found.
	*/
	neighbors(x, y, maxResults = Infinity, maxDistSq = Infinity, filterFn, sqDistFn = sqDist) {
		if (this._pos !== this._boxes.length) throw new Error("Data not yet indexed - call index.finish().");
		/** @type number | undefined */
		let nodeIndex = this._boxes.length - 4;
		const q = this._queue;
		const results = [];
		outer: while (nodeIndex !== void 0) {
			const end = Math.min(nodeIndex + this.nodeSize * 4, upperBound(nodeIndex, this._levelBounds));
			for (let pos = nodeIndex; pos < end; pos += 4) {
				const index = this._indices[pos >> 2] | 0;
				const minX = this._boxes[pos];
				const minY = this._boxes[pos + 1];
				const maxX = this._boxes[pos + 2];
				const maxY = this._boxes[pos + 3];
				const dist = sqDistFn(x < minX ? minX - x : x > maxX ? x - maxX : 0, y < minY ? minY - y : y > maxY ? y - maxY : 0);
				if (dist > maxDistSq) continue;
				if (nodeIndex >= this.numItems * 4) q.push(index << 1, dist);
				else if (filterFn === void 0 || filterFn(index)) q.push((index << 1) + 1, dist);
			}
			while (q.length && q.peek() & 1) {
				if (q.peekValue() > maxDistSq) break outer;
				results.push(q.pop() >> 1);
				if (results.length === maxResults) break outer;
			}
			nodeIndex = q.length ? q.pop() >> 1 : void 0;
		}
		q.clear();
		return results;
	}
};
function sqDist(dx, dy) {
	return dx * dx + dy * dy;
}
/**
* Binary search for the first value in the array bigger than the given.
* @param {number} value
* @param {number[]} arr
*/
function upperBound(value, arr) {
	let i = 0;
	let j = arr.length - 1;
	while (i < j) {
		const m = i + j >> 1;
		if (arr[m] > value) j = m;
		else i = m + 1;
	}
	return arr[i];
}
/**
* Custom quicksort that partially sorts bbox data alongside the hilbert values.
* @param {Uint32Array} values
* @param {InstanceType<TypedArrayConstructor>} boxes
* @param {Uint16Array | Uint32Array} indices
* @param {number} left
* @param {number} right
* @param {number} nodeSize
*/
function sort(values, boxes, indices, left, right, nodeSize) {
	if (Math.floor(left / nodeSize) >= Math.floor(right / nodeSize)) return;
	const start = values[left];
	const mid = values[left + right >> 1];
	const end = values[right];
	let pivot = end;
	const x = Math.max(start, mid);
	if (end > x) pivot = x;
	else if (x === start) pivot = Math.max(mid, end);
	else if (x === mid) pivot = Math.max(start, end);
	let i = left - 1;
	let j = right + 1;
	while (true) {
		do
			i++;
		while (values[i] < pivot);
		do
			j--;
		while (values[j] > pivot);
		if (i >= j) break;
		swap(values, boxes, indices, i, j);
	}
	sort(values, boxes, indices, left, j, nodeSize);
	sort(values, boxes, indices, j + 1, right, nodeSize);
}
/**
* Swap two values and two corresponding boxes.
* @param {Uint32Array} values
* @param {InstanceType<TypedArrayConstructor>} boxes
* @param {Uint16Array | Uint32Array} indices
* @param {number} i
* @param {number} j
*/
function swap(values, boxes, indices, i, j) {
	const temp = values[i];
	values[i] = values[j];
	values[j] = temp;
	const k = 4 * i;
	const m = 4 * j;
	const a = boxes[k];
	const b = boxes[k + 1];
	const c = boxes[k + 2];
	const d = boxes[k + 3];
	boxes[k] = boxes[m];
	boxes[k + 1] = boxes[m + 1];
	boxes[k + 2] = boxes[m + 2];
	boxes[k + 3] = boxes[m + 3];
	boxes[m] = a;
	boxes[m + 1] = b;
	boxes[m + 2] = c;
	boxes[m + 3] = d;
	const e = indices[i];
	indices[i] = indices[j];
	indices[j] = e;
}
/**
* Fast Hilbert curve algorithm by http://threadlocalmutex.com/
* Ported from C++ https://github.com/rawrunprotected/hilbert_curves (public domain)
* @param {number} x
* @param {number} y
*/
function hilbert(x, y) {
	let a = x ^ y;
	let b = 65535 ^ a;
	let c = 65535 ^ (x | y);
	let d = x & (y ^ 65535);
	let A = a | b >> 1;
	let B = a >> 1 ^ a;
	let C = c >> 1 ^ b & d >> 1 ^ c;
	let D = a & c >> 1 ^ d >> 1 ^ d;
	a = A;
	b = B;
	c = C;
	d = D;
	A = a & a >> 2 ^ b & b >> 2;
	B = a & b >> 2 ^ b & (a ^ b) >> 2;
	C ^= a & c >> 2 ^ b & d >> 2;
	D ^= b & c >> 2 ^ (a ^ b) & d >> 2;
	a = A;
	b = B;
	c = C;
	d = D;
	A = a & a >> 4 ^ b & b >> 4;
	B = a & b >> 4 ^ b & (a ^ b) >> 4;
	C ^= a & c >> 4 ^ b & d >> 4;
	D ^= b & c >> 4 ^ (a ^ b) & d >> 4;
	a = A;
	b = B;
	c = C;
	d = D;
	C ^= a & c >> 8 ^ b & d >> 8;
	D ^= b & c >> 8 ^ (a ^ b) & d >> 8;
	a = C ^ C >> 1;
	b = D ^ D >> 1;
	let i0 = x ^ y;
	let i1 = b | 65535 ^ (i0 | a);
	i0 = (i0 | i0 << 8) & 16711935;
	i0 = (i0 | i0 << 4) & 252645135;
	i0 = (i0 | i0 << 2) & 858993459;
	i0 = (i0 | i0 << 1) & 1431655765;
	i1 = (i1 | i1 << 8) & 16711935;
	i1 = (i1 | i1 << 4) & 252645135;
	i1 = (i1 | i1 << 2) & 858993459;
	i1 = (i1 | i1 << 1) & 1431655765;
	return (i1 << 1 | i0) >>> 0;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartCartesianAxis/useChartCartesianAxisRendering.selectors.js
var createZoomMap = (zoom) => {
	const zoomItemMap = /* @__PURE__ */ new Map();
	zoom.forEach((zoomItem) => {
		zoomItemMap.set(zoomItem.axisId, zoomItem);
	});
	return zoomItemMap;
};
var selectorChartZoomState = (state) => state.zoom;
/**
* Following selectors are not exported because they exist in the MIT chart only to ba able to reuse the Zoom state from the pro.
*/
var selectorChartZoomIsInteracting = createSelector(selectorChartZoomState, (zoom) => zoom?.isInteracting);
var selectorChartZoomMap = createSelectorMemoized(selectorChartZoomState, function selectorChartZoomMap(zoom) {
	return zoom?.zoomData && createZoomMap(zoom?.zoomData);
});
var selectorChartAxisZoomData = createSelector(selectorChartZoomMap, (zoomMap, axisId) => zoomMap?.get(axisId));
var selectorChartZoomOptionsLookup = createSelectorMemoized(selectorChartRawXAxis, selectorChartRawYAxis, function selectorChartZoomOptionsLookup(xAxis, yAxis) {
	return _extends({}, createZoomLookup("x")(xAxis), createZoomLookup("y")(yAxis));
});
createSelector(selectorChartZoomOptionsLookup, (axisLookup, axisId) => axisLookup[axisId]);
var selectorDefaultXAxisTickNumber = createSelector(selectorChartDrawingArea, function selectorDefaultXAxisTickNumber(drawingArea) {
	return getDefaultTickNumber(drawingArea.width);
});
var selectorDefaultYAxisTickNumber = createSelector(selectorChartDrawingArea, function selectorDefaultYAxisTickNumber(drawingArea) {
	return getDefaultTickNumber(drawingArea.height);
});
var selectorChartXAxisWithDomains = createSelectorMemoized(selectorChartRawXAxis, selectorChartSeriesProcessed, selectorChartSeriesConfig, selectorPreferStrictDomainInLineCharts, selectorDefaultXAxisTickNumber, function selectorChartXAxisWithDomains(axes, formattedSeries, seriesConfig, preferStrictDomainInLineCharts, defaultTickNumber) {
	const axisDirection = "x";
	const domains = {};
	axes?.forEach((eachAxis, axisIndex) => {
		const axis = eachAxis;
		if (isBandScaleConfig(axis) || isPointScaleConfig(axis)) {
			domains[axis.id] = { domain: axis.data };
			if (axis.ordinalTimeTicks !== void 0) domains[axis.id].tickNumber = getTickNumber(axis, [axis.data?.find((d) => d !== null), axis.data?.findLast((d) => d !== null)], defaultTickNumber);
			return;
		}
		const axisExtrema = getAxisExtrema(axis, axisDirection, seriesConfig, axisIndex, formattedSeries);
		domains[axis.id] = calculateInitialDomainAndTickNumber(axis, "x", axisIndex, formattedSeries, axisExtrema, defaultTickNumber, preferStrictDomainInLineCharts);
	});
	return {
		axes,
		domains
	};
});
var selectorChartYAxisWithDomains = createSelectorMemoized(selectorChartRawYAxis, selectorChartSeriesProcessed, selectorChartSeriesConfig, selectorPreferStrictDomainInLineCharts, selectorDefaultYAxisTickNumber, function selectorChartYAxisWithDomains(axes, formattedSeries, seriesConfig, preferStrictDomainInLineCharts, defaultTickNumber) {
	const axisDirection = "y";
	const domains = {};
	axes?.forEach((eachAxis, axisIndex) => {
		const axis = eachAxis;
		if (isBandScaleConfig(axis) || isPointScaleConfig(axis)) {
			domains[axis.id] = { domain: axis.data };
			if (axis.ordinalTimeTicks !== void 0) domains[axis.id].tickNumber = getTickNumber(axis, [axis.data?.find((d) => d !== null), axis.data?.findLast((d) => d !== null)], defaultTickNumber);
			return;
		}
		const axisExtrema = getAxisExtrema(axis, axisDirection, seriesConfig, axisIndex, formattedSeries);
		domains[axis.id] = calculateInitialDomainAndTickNumber(axis, "y", axisIndex, formattedSeries, axisExtrema, defaultTickNumber, preferStrictDomainInLineCharts);
	});
	return {
		axes,
		domains
	};
});
var selectorChartZoomAxisFilters = createSelectorMemoized(selectorChartZoomMap, selectorChartZoomOptionsLookup, selectorChartXAxisWithDomains, selectorChartYAxisWithDomains, function selectorChartZoomAxisFilters(zoomMap, zoomOptions, { axes: xAxis, domains: xDomains }, { axes: yAxis, domains: yDomains }) {
	if (!zoomMap || !zoomOptions) return;
	let hasFilter = false;
	const filters = {};
	const axes = [...xAxis ?? [], ...yAxis ?? []];
	for (let i = 0; i < axes.length; i += 1) {
		const axis = axes[i];
		if (!zoomOptions[axis.id] || zoomOptions[axis.id].filterMode !== "discard") continue;
		const zoom = zoomMap.get(axis.id);
		if (zoom === void 0 || zoom.start <= 0 && zoom.end >= 100) continue;
		const axisDirection = i < (xAxis?.length ?? 0) ? "x" : "y";
		if (axis.scaleType === "band" || axis.scaleType === "point") filters[axis.id] = createDiscreteScaleGetAxisFilter(axis.data, zoom.start, zoom.end, axisDirection);
		else {
			const { domain } = axisDirection === "x" ? xDomains[axis.id] : yDomains[axis.id];
			filters[axis.id] = createContinuousScaleGetAxisFilter(domain, zoom.start, zoom.end, axisDirection, axis.data);
		}
		hasFilter = true;
	}
	if (!hasFilter) return;
	return createGetAxisFilters(filters);
});
var selectorChartFilteredXDomains = createSelectorMemoized(selectorChartSeriesProcessed, selectorChartSeriesConfig, selectorChartZoomMap, selectorChartZoomOptionsLookup, selectorChartZoomAxisFilters, selectorPreferStrictDomainInLineCharts, selectorChartXAxisWithDomains, function selectorChartFilteredXDomains(formattedSeries, seriesConfig, zoomMap, zoomOptions, getFilters, preferStrictDomainInLineCharts, { axes, domains }) {
	const filteredDomains = {};
	axes?.forEach((axis, axisIndex) => {
		const domain = domains[axis.id].domain;
		if (isBandScaleConfig(axis) || isPointScaleConfig(axis)) {
			filteredDomains[axis.id] = domain;
			return;
		}
		const zoom = zoomMap?.get(axis.id);
		const zoomOption = zoomOptions?.[axis.id];
		const filter = zoom === void 0 && !zoomOption ? getFilters : void 0;
		if (!filter) {
			filteredDomains[axis.id] = domain;
			return;
		}
		const rawTickNumber = domains[axis.id].tickNumber;
		const axisExtrema = getAxisExtrema(axis, "x", seriesConfig, axisIndex, formattedSeries, filter);
		filteredDomains[axis.id] = calculateFinalDomain(axis, "x", axisIndex, formattedSeries, axisExtrema, rawTickNumber, preferStrictDomainInLineCharts);
	});
	return filteredDomains;
});
var selectorChartFilteredYDomains = createSelectorMemoized(selectorChartSeriesProcessed, selectorChartSeriesConfig, selectorChartZoomMap, selectorChartZoomOptionsLookup, selectorChartZoomAxisFilters, selectorPreferStrictDomainInLineCharts, selectorChartYAxisWithDomains, function selectorChartFilteredYDomains(formattedSeries, seriesConfig, zoomMap, zoomOptions, getFilters, preferStrictDomainInLineCharts, { axes, domains }) {
	const filteredDomains = {};
	axes?.forEach((axis, axisIndex) => {
		const domain = domains[axis.id].domain;
		if (isBandScaleConfig(axis) || isPointScaleConfig(axis)) {
			filteredDomains[axis.id] = domain;
			return;
		}
		const zoom = zoomMap?.get(axis.id);
		const zoomOption = zoomOptions?.[axis.id];
		const filter = zoom === void 0 && !zoomOption ? getFilters : void 0;
		if (!filter) {
			filteredDomains[axis.id] = domain;
			return;
		}
		const rawTickNumber = domains[axis.id].tickNumber;
		const axisExtrema = getAxisExtrema(axis, "y", seriesConfig, axisIndex, formattedSeries, filter);
		filteredDomains[axis.id] = calculateFinalDomain(axis, "y", axisIndex, formattedSeries, axisExtrema, rawTickNumber, preferStrictDomainInLineCharts);
	});
	return filteredDomains;
});
var selectorChartNormalizedXScales = createSelectorMemoized(selectorChartRawXAxis, selectorChartFilteredXDomains, function selectorChartNormalizedXScales(axes, filteredDomains) {
	const scales = {};
	axes?.forEach((eachAxis) => {
		const axis = eachAxis;
		const domain = filteredDomains[axis.id];
		scales[axis.id] = getNormalizedAxisScale(axis, domain);
	});
	return scales;
});
var selectorChartNormalizedYScales = createSelectorMemoized(selectorChartRawYAxis, selectorChartFilteredYDomains, function selectorChartNormalizedYScales(axes, filteredDomains) {
	const scales = {};
	axes?.forEach((eachAxis) => {
		const axis = eachAxis;
		const domain = filteredDomains[axis.id];
		scales[axis.id] = getNormalizedAxisScale(axis, domain);
	});
	return scales;
});
var selectorChartXScales = createSelectorMemoized(selectorChartRawXAxis, selectorChartNormalizedXScales, selectorChartDrawingArea, selectorChartZoomMap, function selectorChartXScales(axes, normalizedScales, drawingArea, zoomMap) {
	const scales = {};
	axes?.forEach((eachAxis) => {
		const axis = eachAxis;
		const zoom = zoomMap?.get(axis.id);
		const zoomRange = zoom ? [zoom.start, zoom.end] : [0, 100];
		const range = getRange$1(drawingArea, "x", axis);
		const scale = normalizedScales[axis.id].copy();
		const zoomedRange = zoomScaleRange(range, zoomRange);
		scale.range(zoomedRange);
		scales[axis.id] = scale;
	});
	return scales;
});
var selectorChartYScales = createSelectorMemoized(selectorChartRawYAxis, selectorChartNormalizedYScales, selectorChartDrawingArea, selectorChartZoomMap, function selectorChartYScales(axes, normalizedScales, drawingArea, zoomMap) {
	const scales = {};
	axes?.forEach((eachAxis) => {
		const axis = eachAxis;
		const zoom = zoomMap?.get(axis.id);
		const zoomRange = zoom ? [zoom.start, zoom.end] : [0, 100];
		const range = getRange$1(drawingArea, "y", axis);
		const scale = normalizedScales[axis.id].copy();
		const zoomedRange = zoomScaleRange(isOrdinalScale(scale) ? range.reverse() : range, zoomRange);
		scale.range(zoomedRange);
		scales[axis.id] = scale;
	});
	return scales;
});
/**
* The only interesting selectors that merge axis data and zoom if provided.
*/
var selectorChartXAxis = createSelectorMemoized(selectorChartDrawingArea, selectorChartSeriesProcessed, selectorChartSeriesConfig, selectorChartZoomMap, selectorChartXAxisWithDomains, selectorChartXScales, function selectorChartXAxis(drawingArea, formattedSeries, seriesConfig, zoomMap, { axes, domains }, scales) {
	return computeAxisValue$1({
		scales,
		drawingArea,
		formattedSeries,
		axis: axes,
		seriesConfig,
		axisDirection: "x",
		zoomMap,
		domains
	});
});
var selectorChartYAxis = createSelectorMemoized(selectorChartDrawingArea, selectorChartSeriesProcessed, selectorChartSeriesConfig, selectorChartZoomMap, selectorChartYAxisWithDomains, selectorChartYScales, function selectorChartYAxis(drawingArea, formattedSeries, seriesConfig, zoomMap, { axes, domains }, scales) {
	return computeAxisValue$1({
		scales,
		drawingArea,
		formattedSeries,
		axis: axes,
		seriesConfig,
		axisDirection: "y",
		zoomMap,
		domains
	});
});
createSelector(selectorChartXAxis, selectorChartYAxis, (xAxes, yAxes, axisId) => xAxes?.axis[axisId] ?? yAxes?.axis[axisId]);
createSelector(selectorChartRawXAxis, selectorChartRawYAxis, (xAxes, yAxes, axisId) => {
	const axis = xAxes?.find((a) => a.id === axisId) ?? yAxes?.find((a) => a.id === axisId) ?? null;
	if (!axis) return;
	return axis;
});
var selectorChartDefaultXAxisId = createSelector(selectorChartRawXAxis, (xAxes) => xAxes[0].id);
var selectorChartDefaultYAxisId = createSelector(selectorChartRawYAxis, (yAxes) => yAxes[0].id);
var EMPTY_MAP = /* @__PURE__ */ new Map();
var selectorChartSeriesEmptyFlatbushMap = () => EMPTY_MAP;
var selectorChartSeriesFlatbushMap = createSelectorMemoized(selectorChartSeriesProcessed, selectorChartNormalizedXScales, selectorChartNormalizedYScales, selectorChartDefaultXAxisId, selectorChartDefaultYAxisId, function selectChartSeriesFlatbushMap(allSeries, xAxesScaleMap, yAxesScaleMap, defaultXAxisId, defaultYAxisId) {
	const validSeries = allSeries.scatter;
	const flatbushMap = /* @__PURE__ */ new Map();
	if (!validSeries) return flatbushMap;
	validSeries.seriesOrder.forEach((seriesId) => {
		const { data, xAxisId = defaultXAxisId, yAxisId = defaultYAxisId } = validSeries.series[seriesId];
		const flatbush = new Flatbush(data.length);
		const originalXScale = xAxesScaleMap[xAxisId];
		const originalYScale = yAxesScaleMap[yAxisId];
		for (const datum of data) flatbush.add(originalXScale(datum.x), originalYScale(datum.y));
		flatbush.finish();
		flatbushMap.set(seriesId, flatbush);
	});
	return flatbushMap;
});
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartCartesianAxis/getAxisValue.js
function getAsANumber(value) {
	return value instanceof Date ? value.getTime() : value;
}
/**
* For a pointer coordinate, this function returns the dataIndex associated.
* Returns `-1` if no dataIndex matches.
*/
function getAxisIndex$1(axisConfig, pointerValue) {
	const { scale, data: axisData, reverse } = axisConfig;
	if (!isOrdinalScale(scale)) {
		const value = scale.invert(pointerValue);
		if (axisData === void 0) return -1;
		const valueAsNumber = getAsANumber(value);
		return axisData?.findIndex((pointValue, index) => {
			const v = getAsANumber(pointValue);
			if (v > valueAsNumber) {
				if (index === 0 || Math.abs(valueAsNumber - v) <= Math.abs(valueAsNumber - getAsANumber(axisData[index - 1]))) return true;
			}
			if (v <= valueAsNumber) {
				if (index === axisData.length - 1 || Math.abs(getAsANumber(value) - v) < Math.abs(getAsANumber(value) - getAsANumber(axisData[index + 1]))) return true;
			}
			return false;
		});
	}
	const dataIndex = scale.bandwidth() === 0 ? Math.floor((pointerValue - Math.min(...scale.range()) + scale.step() / 2) / scale.step()) : Math.floor((pointerValue - Math.min(...scale.range())) / scale.step());
	if (dataIndex < 0 || dataIndex >= axisData.length) return -1;
	return reverse ? axisData.length - 1 - dataIndex : dataIndex;
}
/**
* For a pointer coordinate, this function returns the value associated.
* Returns `null` if the coordinate has no value associated.
*/
function getAxisValue(scale, axisData, pointerValue, dataIndex) {
	if (!isOrdinalScale(scale)) {
		if (dataIndex === null) {
			const invertedValue = scale.invert(pointerValue);
			return Number.isNaN(invertedValue) ? null : invertedValue;
		}
		return axisData[dataIndex];
	}
	if (dataIndex === null || dataIndex < 0 || dataIndex >= axisData.length) return null;
	return axisData[dataIndex];
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/getSVGPoint.js
/**
* Transform mouse event position to coordinates inside the SVG.
* @param svg The SVG element
* @param event The mouseEvent to transform
*/
function getSVGPoint(svg, event) {
	const pt = svg.createSVGPoint();
	pt.x = event.clientX;
	pt.y = event.clientY;
	return pt.matrixTransform(svg.getScreenCTM().inverse());
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartInteraction/useChartInteraction.js
var useChartInteraction = ({ store }) => {
	return { instance: {
		cleanInteraction: useEventCallback(function cleanInteraction() {
			store.update({ interaction: _extends({}, store.state.interaction, { pointer: null }) });
		}),
		setLastUpdateSource: useEventCallback(function setLastUpdateSource(interaction) {
			if (store.state.interaction.lastUpdate !== interaction) store.set("interaction", _extends({}, store.state.interaction, { lastUpdate: interaction }));
		}),
		setPointerCoordinate: useEventCallback(function setPointerCoordinate(coordinate) {
			store.set("interaction", _extends({}, store.state.interaction, {
				pointer: coordinate,
				lastUpdate: coordinate !== null ? "pointer" : store.state.interaction.lastUpdate
			}));
		}),
		handlePointerEnter: useEventCallback(function handlePointerEnter(event) {
			store.set("interaction", _extends({}, store.state.interaction, { pointerType: event.pointerType }));
		}),
		handlePointerLeave: useEventCallback(function handlePointerLeave() {
			store.set("interaction", _extends({}, store.state.interaction, { pointerType: null }));
		})
	} };
};
useChartInteraction.getInitialState = () => ({ interaction: {
	item: null,
	pointer: null,
	lastUpdate: "pointer",
	pointerType: null
} });
useChartInteraction.params = {};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartInteraction/useChartInteraction.selectors.js
var selectInteraction = (state) => state.interaction;
var selectorChartsInteractionIsInitialized = createSelector(selectInteraction, (interaction) => interaction !== void 0);
var selectorChartsInteractionPointer = createSelector(selectInteraction, (interaction) => interaction?.pointer ?? null);
var selectorChartsInteractionPointerX = createSelector(selectorChartsInteractionPointer, (pointer) => pointer && pointer.x);
var selectorChartsInteractionPointerY = createSelector(selectorChartsInteractionPointer, (pointer) => pointer && pointer.y);
var selectorChartsLastInteraction = createSelector(selectInteraction, (interaction) => interaction?.lastUpdate);
var selectorChartsPointerType = createSelector(selectInteraction, (interaction) => interaction?.pointerType ?? null);
//#endregion
//#region node_modules/@mui/x-internals/esm/isDeepEqual/isDeepEqual.js
/**
* Based on `fast-deep-equal`
*
* MIT License
*
* Copyright (c) 2017 Evgeny Poberezkin
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/
/**
* Check if two values are deeply equal.
*/
function isDeepEqual(a, b) {
	if (a === b) return true;
	if (a && b && typeof a === "object" && typeof b === "object") {
		if (a.constructor !== b.constructor) return false;
		if (Array.isArray(a)) {
			const length = a.length;
			if (length !== b.length) return false;
			for (let i = 0; i < length; i += 1) if (!isDeepEqual(a[i], b[i])) return false;
			return true;
		}
		if (a instanceof Map && b instanceof Map) {
			if (a.size !== b.size) return false;
			const entriesA = Array.from(a.entries());
			for (let i = 0; i < entriesA.length; i += 1) if (!b.has(entriesA[i][0])) return false;
			for (let i = 0; i < entriesA.length; i += 1) {
				const entryA = entriesA[i];
				if (!isDeepEqual(entryA[1], b.get(entryA[0]))) return false;
			}
			return true;
		}
		if (a instanceof Set && b instanceof Set) {
			if (a.size !== b.size) return false;
			const entries = Array.from(a.entries());
			for (let i = 0; i < entries.length; i += 1) if (!b.has(entries[i][0])) return false;
			return true;
		}
		if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
			const length = a.length;
			if (length !== b.length) return false;
			for (let i = 0; i < length; i += 1) if (a[i] !== b[i]) return false;
			return true;
		}
		if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
		if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
		if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
		const keys = Object.keys(a);
		const length = keys.length;
		if (length !== Object.keys(b).length) return false;
		for (let i = 0; i < length; i += 1) if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
		for (let i = 0; i < length; i += 1) {
			const key = keys[i];
			if (!isDeepEqual(a[key], b[key])) return false;
		}
		return true;
	}
	return a !== a && b !== b;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartCartesianAxis/useChartCartesianInteraction.selectors.js
/**
* Get interaction indexes
*/
function indexGetter$1(value, axes, ids = axes.axisIds[0]) {
	return Array.isArray(ids) ? ids.map((id) => getAxisIndex$1(axes.axis[id], value)) : getAxisIndex$1(axes.axis[ids], value);
}
var selectChartsInteractionAxisIndex = (value, axes, id) => {
	if (value === null) return null;
	const index = indexGetter$1(value, axes, id);
	return index === -1 ? null : index;
};
var selectorChartsInteractionXAxisIndex = createSelector(selectorChartsInteractionPointerX, selectorChartXAxis, selectChartsInteractionAxisIndex);
var selectorChartsInteractionYAxisIndex = createSelector(selectorChartsInteractionPointerY, selectorChartYAxis, selectChartsInteractionAxisIndex);
var selectorChartAxisInteraction = createSelector(selectorChartsInteractionPointerX, selectorChartsInteractionPointerY, selectorChartXAxis, selectorChartYAxis, (x, y, xAxis, yAxis) => [...x === null ? [] : xAxis.axisIds.map((axisId) => ({
	axisId,
	dataIndex: indexGetter$1(x, xAxis, axisId)
})), ...y === null ? [] : yAxis.axisIds.map((axisId) => ({
	axisId,
	dataIndex: indexGetter$1(y, yAxis, axisId)
}))].filter((item) => item.dataIndex !== null && item.dataIndex >= 0));
/**
* Get interaction values
*/
function valueGetter(value, axes, indexes, ids = axes.axisIds[0]) {
	return Array.isArray(ids) ? ids.map((id, axisIndex) => {
		const axis = axes.axis[id];
		return getAxisValue(axis.scale, axis.data, value, indexes[axisIndex]);
	}) : getAxisValue(axes.axis[ids].scale, axes.axis[ids].data, value, indexes);
}
var selectorChartsInteractionXAxisValue = createSelector(selectorChartsInteractionPointerX, selectorChartXAxis, selectorChartsInteractionXAxisIndex, (x, xAxes, xIndex, id) => {
	if (x === null || xAxes.axisIds.length === 0) return null;
	return valueGetter(x, xAxes, xIndex, id);
});
var selectorChartsInteractionYAxisValue = createSelector(selectorChartsInteractionPointerY, selectorChartYAxis, selectorChartsInteractionYAxisIndex, (y, yAxes, yIndex, id) => {
	if (y === null || yAxes.axisIds.length === 0) return null;
	return valueGetter(y, yAxes, yIndex, id);
});
var EMPTY_ARRAY = [];
/**
* Get x-axis ids and corresponding data index that should be display in the tooltip.
*/
var selectorChartsInteractionTooltipXAxes = createSelectorMemoizedWithOptions({ memoizeOptions: { resultEqualityCheck: isDeepEqual } })(selectorChartsInteractionPointerX, selectorChartXAxis, (value, axes) => {
	if (value === null) return EMPTY_ARRAY;
	return axes.axisIds.filter((id) => axes.axis[id].triggerTooltip).map((axisId) => ({
		axisId,
		dataIndex: getAxisIndex$1(axes.axis[axisId], value)
	})).filter(({ dataIndex }) => dataIndex >= 0);
});
/**
* Get y-axis ids and corresponding data index that should be display in the tooltip.
*/
var selectorChartsInteractionTooltipYAxes = createSelectorMemoizedWithOptions({ memoizeOptions: { resultEqualityCheck: isDeepEqual } })(selectorChartsInteractionPointerY, selectorChartYAxis, (value, axes) => {
	if (value === null) return EMPTY_ARRAY;
	return axes.axisIds.filter((id) => axes.axis[id].triggerTooltip).map((axisId) => ({
		axisId,
		dataIndex: getAxisIndex$1(axes.axis[axisId], value)
	})).filter(({ dataIndex }) => dataIndex >= 0);
});
/**
* Return `true` if the axis tooltip has something to display.
*/
var selectorChartsInteractionAxisTooltip = createSelector(selectorChartsInteractionTooltipXAxes, selectorChartsInteractionTooltipYAxes, (xTooltip, yTooltip) => xTooltip.length > 0 || yTooltip.length > 0);
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartInteraction/checkHasInteractionPlugin.js
function checkHasInteractionPlugin(instance) {
	return instance.setPointerCoordinate !== void 0;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartCartesianAxis/useChartCartesianAxis.js
var AXIS_CLICK_SERIES_TYPES = new Set([
	"bar",
	"rangeBar",
	"line"
]);
var useChartCartesianAxis = ({ params, store, seriesConfig, svgRef, instance }) => {
	const { xAxis, yAxis, dataset, onHighlightedAxisChange } = params;
	{
		const ids = [...xAxis ?? [], ...yAxis ?? []].filter((axis) => axis.id).map((axis) => axis.id);
		const duplicates = new Set(ids.filter((id, index) => ids.indexOf(id) !== index));
		if (duplicates.size > 0) warnOnce([`MUI X Charts: The following axis ids are duplicated: ${Array.from(duplicates).join(", ")}.`, `Please make sure that each axis has a unique id.`].join("\n"), "error");
	}
	const drawingArea = store.use(selectorChartDrawingArea);
	const processedSeries = store.use(selectorChartSeriesProcessed);
	const isInteractionEnabled = store.use(selectorChartsInteractionIsInitialized);
	const { axis: xAxisWithScale, axisIds: xAxisIds } = store.use(selectorChartXAxis);
	const { axis: yAxisWithScale, axisIds: yAxisIds } = store.use(selectorChartYAxis);
	useAssertModelConsistency({
		warningPrefix: "MUI X Charts",
		componentName: "Chart",
		propName: "highlightedAxis",
		controlled: params.highlightedAxis,
		defaultValue: void 0
	});
	useEnhancedEffect(() => {
		if (params.highlightedAxis !== void 0) store.set("controlledCartesianAxisHighlight", params.highlightedAxis);
	}, [store, params.highlightedAxis]);
	const isFirstRender = import_react.useRef(true);
	import_react.useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		store.set("cartesianAxis", {
			x: defaultizeXAxis(xAxis, dataset),
			y: defaultizeYAxis(yAxis, dataset)
		});
	}, [
		seriesConfig,
		drawingArea,
		xAxis,
		yAxis,
		dataset,
		store
	]);
	const usedXAxis = xAxisIds[0];
	const usedYAxis = yAxisIds[0];
	useStoreEffect(store, selectorChartAxisInteraction, (prevAxisInteraction, nextAxisInteraction) => {
		if (!onHighlightedAxisChange) return;
		if (Object.is(prevAxisInteraction, nextAxisInteraction)) return;
		if (prevAxisInteraction.length !== nextAxisInteraction.length) {
			onHighlightedAxisChange(nextAxisInteraction);
			return;
		}
		if (prevAxisInteraction?.some(({ axisId, dataIndex }, itemIndex) => nextAxisInteraction[itemIndex].axisId !== axisId || nextAxisInteraction[itemIndex].dataIndex !== dataIndex)) onHighlightedAxisChange(nextAxisInteraction);
	});
	const hasInteractionPlugin = checkHasInteractionPlugin(instance);
	import_react.useEffect(() => {
		const element = svgRef.current;
		if (!isInteractionEnabled || !hasInteractionPlugin || !element || params.disableAxisListener) return () => {};
		const moveEndHandler = instance.addInteractionListener("moveEnd", (event) => {
			if (!event.detail.activeGestures.pan) instance.cleanInteraction();
		});
		const panEndHandler = instance.addInteractionListener("panEnd", (event) => {
			if (!event.detail.activeGestures.move) instance.cleanInteraction();
		});
		const pressEndHandler = instance.addInteractionListener("quickPressEnd", (event) => {
			if (!event.detail.activeGestures.move && !event.detail.activeGestures.pan) instance.cleanInteraction();
		});
		const gestureHandler = (event) => {
			const srvEvent = event.detail.srcEvent;
			const target = event.detail.target;
			const svgPoint = getSVGPoint(element, srvEvent);
			if (event.detail.srcEvent.buttons >= 1 && target?.hasPointerCapture(event.detail.srcEvent.pointerId) && !target?.closest("[data-charts-zoom-slider]")) target?.releasePointerCapture(event.detail.srcEvent.pointerId);
			if (!instance.isPointInside(svgPoint.x, svgPoint.y, target)) {
				instance.cleanInteraction?.();
				return;
			}
			instance.setPointerCoordinate(svgPoint);
		};
		const moveHandler = instance.addInteractionListener("move", gestureHandler);
		const panHandler = instance.addInteractionListener("pan", gestureHandler);
		const pressHandler = instance.addInteractionListener("quickPress", gestureHandler);
		return () => {
			moveHandler.cleanup();
			moveEndHandler.cleanup();
			panHandler.cleanup();
			panEndHandler.cleanup();
			pressHandler.cleanup();
			pressEndHandler.cleanup();
		};
	}, [
		svgRef,
		store,
		xAxisWithScale,
		usedXAxis,
		yAxisWithScale,
		usedYAxis,
		instance,
		params.disableAxisListener,
		isInteractionEnabled,
		hasInteractionPlugin
	]);
	import_react.useEffect(() => {
		const element = svgRef.current;
		const onAxisClick = params.onAxisClick;
		if (element === null || !onAxisClick) return () => {};
		const axisClickHandler = instance.addInteractionListener("tap", (event) => {
			let dataIndex = null;
			let isXAxis = false;
			const svgPoint = getSVGPoint(element, event.detail.srcEvent);
			const xIndex = getAxisIndex$1(xAxisWithScale[usedXAxis], svgPoint.x);
			isXAxis = xIndex !== -1;
			dataIndex = isXAxis ? xIndex : getAxisIndex$1(yAxisWithScale[usedYAxis], svgPoint.y);
			const USED_AXIS_ID = isXAxis ? xAxisIds[0] : yAxisIds[0];
			if (dataIndex == null || dataIndex === -1) return;
			const axisValue = (isXAxis ? xAxisWithScale : yAxisWithScale)[USED_AXIS_ID].data[dataIndex];
			const seriesValues = {};
			Object.keys(processedSeries).filter((seriesType) => AXIS_CLICK_SERIES_TYPES.has(seriesType)).forEach((seriesType) => {
				const seriesTypeConfig = processedSeries[seriesType];
				seriesTypeConfig?.seriesOrder.forEach((seriesId) => {
					const seriesItem = seriesTypeConfig.series[seriesId];
					const providedXAxisId = seriesItem.xAxisId;
					const providedYAxisId = seriesItem.yAxisId;
					const axisKey = isXAxis ? providedXAxisId : providedYAxisId;
					if (axisKey === void 0 || axisKey === USED_AXIS_ID) seriesValues[seriesId] = seriesItem.data[dataIndex];
				});
			});
			onAxisClick(event.detail.srcEvent, {
				dataIndex,
				axisValue,
				seriesValues
			});
		});
		return () => {
			axisClickHandler.cleanup();
		};
	}, [
		params.onAxisClick,
		processedSeries,
		svgRef,
		xAxisWithScale,
		xAxisIds,
		yAxisWithScale,
		yAxisIds,
		usedXAxis,
		usedYAxis,
		instance
	]);
	return {};
};
useChartCartesianAxis.params = {
	xAxis: true,
	yAxis: true,
	dataset: true,
	onAxisClick: true,
	disableAxisListener: true,
	onHighlightedAxisChange: true,
	highlightedAxis: true
};
useChartCartesianAxis.getDefaultizedParams = ({ params }) => {
	return _extends({}, params, {
		colors: params.colors ?? rainbowSurgePalette,
		theme: params.theme ?? "light",
		defaultizedXAxis: defaultizeXAxis(params.xAxis, params.dataset),
		defaultizedYAxis: defaultizeYAxis(params.yAxis, params.dataset)
	});
};
useChartCartesianAxis.getInitialState = (params) => _extends({ cartesianAxis: {
	x: params.defaultizedXAxis,
	y: params.defaultizedYAxis
} }, params.highlightedAxis === void 0 ? {} : { controlledCartesianAxisHighlight: params.highlightedAxis });
//#endregion
//#region node_modules/@mui/x-internals/esm/fastObjectShallowCompare/fastObjectShallowCompare.js
var is = Object.is;
/**
* Fast shallow compare for objects.
* @returns true if objects are equal.
*/
function fastObjectShallowCompare(a, b) {
	if (a === b) return true;
	if (!(a instanceof Object) || !(b instanceof Object)) return false;
	let aLength = 0;
	let bLength = 0;
	for (const key in a) {
		aLength += 1;
		if (!is(a[key], b[key])) return false;
		if (!(key in b)) return false;
	}
	for (const _ in b) bLength += 1;
	return aLength === bLength;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartKeyboardNavigation/useChartKeyboardNavigation.selectors.js
var selectKeyboardNavigation = (state) => state.keyboardNavigation;
var selectorChartsItemIsFocused = createSelector(selectKeyboardNavigation, (keyboardNavigationState, item) => keyboardNavigationState?.item != null && fastObjectShallowCompare(keyboardNavigationState.item, item));
var selectorChartsHasFocusedItem = createSelector(selectKeyboardNavigation, (keyboardNavigationState) => keyboardNavigationState?.item != null);
var selectorChartsFocusedItem = createSelector(selectKeyboardNavigation, (keyboardNavigationState) => keyboardNavigationState?.item ?? null);
var selectorChartsIsKeyboardNavigationEnabled = createSelector(selectKeyboardNavigation, (keyboardNavigationState) => !!keyboardNavigationState?.enableKeyboardNavigation);
/**
* Selectors to override highlight behavior.
*/
var createSelectAxisHighlight = (direction) => (item, axis, series) => {
	if (item == null || !("dataIndex" in item) || item.dataIndex === void 0) return;
	const seriesConfig = series[item.type]?.series[item.seriesId];
	if (!seriesConfig) return;
	let axisId = direction === "x" ? "xAxisId" in seriesConfig && seriesConfig.xAxisId : "yAxisId" in seriesConfig && seriesConfig.yAxisId;
	if (axisId === void 0 || axisId === false) axisId = axis.axisIds[0];
	return {
		axisId,
		dataIndex: item.dataIndex
	};
};
var selectorChartsKeyboardXAxisIndex = createSelector(selectorChartsFocusedItem, selectorChartXAxis, selectorChartSeriesProcessed, createSelectAxisHighlight("x"));
var selectorChartsKeyboardYAxisIndex = createSelector(selectorChartsFocusedItem, selectorChartYAxis, selectorChartSeriesProcessed, createSelectAxisHighlight("y"));
var selectorChartsKeyboardItem = createSelector(selectKeyboardNavigation, function selectorChartsKeyboardItem(keyboardState) {
	if (keyboardState?.item == null) return null;
	const { type, seriesId } = keyboardState.item;
	if (type === void 0 || seriesId === void 0) return null;
	return keyboardState.item;
});
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartBrush/useChartBrush.selectors.js
var selectorBrush = (state) => state.brush;
createSelector(selectorBrush, (brush) => brush?.start);
createSelector(selectorBrush, (brush) => brush?.current);
createSelectorMemoized(createSelector(selectorBrush, (brush) => brush?.start?.x ?? null), createSelector(selectorBrush, (brush) => brush?.start?.y ?? null), createSelector(selectorBrush, (brush) => brush?.current?.x ?? null), createSelector(selectorBrush, (brush) => brush?.current?.y ?? null), (startX, startY, currentX, currentY) => {
	if (startX === null || startY === null || currentX === null || currentY === null) return null;
	return {
		start: {
			x: startX,
			y: startY
		},
		current: {
			x: currentX,
			y: currentY
		}
	};
});
createSelector(createSelector(selectorChartSeriesProcessed, (series) => {
	let hasHorizontal = false;
	let isBothDirections = false;
	if (series) Object.entries(series).forEach(([seriesType, seriesData]) => {
		if (Object.values(seriesData.series).some((s) => s.layout === "horizontal")) hasHorizontal = true;
		if (seriesType === "scatter" && seriesData.seriesOrder.length > 0) isBothDirections = true;
	});
	if (isBothDirections) return "xy";
	if (hasHorizontal) return "y";
	return "x";
}), createSelector(selectorChartZoomOptionsLookup, function selectorBrushConfigZoom(optionsLookup) {
	let hasX = false;
	let hasY = false;
	Object.values(optionsLookup).forEach((options) => {
		if (options.axisDirection === "y") hasY = true;
		if (options.axisDirection === "x") hasX = true;
	});
	if (hasX && hasY) return "xy";
	if (hasY) return "y";
	if (hasX) return "x";
	return null;
}), (configNoZoom, configZoom) => configZoom ?? configNoZoom);
var selectorIsBrushEnabled = createSelector(selectorBrush, (brush) => brush?.enabled || brush?.isZoomBrushEnabled);
var selectorIsBrushSelectionActive = createSelector(selectorIsBrushEnabled, selectorBrush, (isBrushEnabled, brush) => {
	return isBrushEnabled && brush?.start !== null && brush?.current !== null;
});
var selectorBrushShouldPreventAxisHighlight = createSelector(selectorBrush, selectorIsBrushSelectionActive, (brush, isBrushSelectionActive) => isBrushSelectionActive && brush?.preventHighlight);
var selectorBrushShouldPreventTooltip = createSelector(selectorBrush, selectorIsBrushSelectionActive, (brush, isBrushSelectionActive) => isBrushSelectionActive && brush?.preventTooltip);
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartBrush/useChartBrush.js
var useChartBrush = ({ store, svgRef, instance, params }) => {
	const isEnabled = store.use(selectorIsBrushEnabled);
	useEnhancedEffect(() => {
		store.set("brush", _extends({}, store.state.brush, {
			enabled: params.brushConfig.enabled,
			preventTooltip: params.brushConfig.preventTooltip,
			preventHighlight: params.brushConfig.preventHighlight
		}));
	}, [
		store,
		params.brushConfig.enabled,
		params.brushConfig.preventTooltip,
		params.brushConfig.preventHighlight
	]);
	const setBrushCoordinates = useEventCallback(function setBrushCoordinates(point) {
		store.set("brush", _extends({}, store.state.brush, {
			start: store.state.brush.start ?? point,
			current: point
		}));
	});
	const clearBrush = useEventCallback(function clearBrush() {
		store.set("brush", _extends({}, store.state.brush, {
			start: null,
			current: null
		}));
	});
	const setZoomBrushEnabled = useEventCallback(function setZoomBrushEnabled(enabled) {
		if (store.state.brush.isZoomBrushEnabled === enabled) return;
		store.set("brush", _extends({}, store.state.brush, { isZoomBrushEnabled: enabled }));
	});
	import_react.useEffect(() => {
		const element = svgRef.current;
		if (element === null || !isEnabled) return () => {};
		const handleBrushStart = (event) => {
			if (event.detail.target?.closest("[data-charts-zoom-slider]")) return;
			setBrushCoordinates(getSVGPoint(element, {
				clientX: event.detail.initialCentroid.x,
				clientY: event.detail.initialCentroid.y
			}));
		};
		const handleBrush = (event) => {
			setBrushCoordinates(getSVGPoint(element, {
				clientX: event.detail.centroid.x,
				clientY: event.detail.centroid.y
			}));
		};
		const brushStartHandler = instance.addInteractionListener("brushStart", handleBrushStart);
		const brushHandler = instance.addInteractionListener("brush", handleBrush);
		const brushCancelHandler = instance.addInteractionListener("brushCancel", clearBrush);
		const brushEndHandler = instance.addInteractionListener("brushEnd", clearBrush);
		return () => {
			brushStartHandler.cleanup();
			brushHandler.cleanup();
			brushEndHandler.cleanup();
			brushCancelHandler.cleanup();
		};
	}, [
		svgRef,
		instance,
		store,
		clearBrush,
		setBrushCoordinates,
		isEnabled
	]);
	return { instance: {
		setBrushCoordinates,
		clearBrush,
		setZoomBrushEnabled
	} };
};
useChartBrush.params = { brushConfig: true };
useChartBrush.getDefaultizedParams = ({ params }) => {
	return _extends({}, params, { brushConfig: {
		enabled: params?.brushConfig?.enabled ?? false,
		preventTooltip: params?.brushConfig?.preventTooltip ?? true,
		preventHighlight: params?.brushConfig?.preventHighlight ?? true
	} });
};
useChartBrush.getInitialState = (params) => {
	return { brush: {
		enabled: params.brushConfig.enabled,
		isZoomBrushEnabled: false,
		preventTooltip: params.brushConfig.preventTooltip,
		preventHighlight: params.brushConfig.preventHighlight,
		start: null,
		current: null
	} };
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartTooltip/useChartTooltip.js
var useChartTooltip = ({ store, params }) => {
	useAssertModelConsistency({
		warningPrefix: "MUI X Charts",
		componentName: "Chart",
		propName: "tooltipItem",
		controlled: params.tooltipItem,
		defaultValue: null
	});
	useEnhancedEffect(() => {
		if (store.state.tooltip.item !== params.tooltipItem) store.set("tooltip", _extends({}, store.state.tooltip, { item: params.tooltipItem }));
	}, [store, params.tooltipItem]);
	const removeTooltipItem = useEventCallback(function removeTooltipItem(itemToRemove) {
		const prevItem = store.state.tooltip.item;
		if (prevItem === null) return;
		if (!itemToRemove || fastObjectShallowCompare(prevItem, itemToRemove)) {
			params.onTooltipItemChange?.(null);
			if (!store.state.tooltip.itemIsControlled) store.set("tooltip", _extends({}, store.state.tooltip, { item: null }));
			return;
		}
	});
	return { instance: {
		setTooltipItem: useEventCallback(function setTooltipItem(newItem) {
			if (!fastObjectShallowCompare(store.state.tooltip.item, newItem)) {
				params.onTooltipItemChange?.(newItem);
				if (!store.state.tooltip.itemIsControlled) store.set("tooltip", _extends({}, store.state.tooltip, { item: newItem }));
			}
		}),
		removeTooltipItem
	} };
};
useChartTooltip.getInitialState = (params) => ({ tooltip: {
	itemIsControlled: params.tooltipItem !== void 0,
	item: params.tooltipItem ?? null
} });
useChartTooltip.params = {
	tooltipItem: true,
	onTooltipItemChange: true
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartKeyboardNavigation/useChartKeyboardNavigation.js
var useChartKeyboardNavigation = ({ params, store, svgRef }) => {
	const removeFocus = useEventCallback(function removeFocus() {
		if (store.state.keyboardNavigation.item !== null) store.set("keyboardNavigation", _extends({}, store.state.keyboardNavigation, { item: null }));
	});
	import_react.useEffect(() => {
		const element = svgRef.current;
		if (!element || !params.enableKeyboardNavigation) return;
		function keyboardHandler(event) {
			let newFocusedItem = store.state.keyboardNavigation.item;
			let seriesType = newFocusedItem?.type;
			if (!seriesType) {
				seriesType = Object.keys(selectorChartDefaultizedSeries(store.state)).find((key) => store.state.series.seriesConfig[key] !== void 0);
				if (seriesType === void 0) return;
			}
			const calculateFocusedItem = store.state.series.seriesConfig[seriesType]?.keyboardFocusHandler?.(event);
			if (!calculateFocusedItem) return;
			newFocusedItem = calculateFocusedItem(newFocusedItem, store.state);
			if (newFocusedItem !== store.state.keyboardNavigation.item) {
				event.preventDefault();
				store.update(_extends({}, store.state.highlight && { highlight: _extends({}, store.state.highlight, { lastUpdate: "keyboard" }) }, store.state.interaction && { interaction: _extends({}, store.state.interaction, { lastUpdate: "keyboard" }) }, { keyboardNavigation: _extends({}, store.state.keyboardNavigation, { item: newFocusedItem }) }));
			}
		}
		element.addEventListener("keydown", keyboardHandler);
		element.addEventListener("blur", removeFocus);
		return () => {
			element.removeEventListener("keydown", keyboardHandler);
			element.removeEventListener("blur", removeFocus);
		};
	}, [
		svgRef,
		removeFocus,
		params.enableKeyboardNavigation,
		store
	]);
	useEnhancedEffect(() => {
		if (store.state.keyboardNavigation.enableKeyboardNavigation !== params.enableKeyboardNavigation) store.set("keyboardNavigation", _extends({}, store.state.keyboardNavigation, { enableKeyboardNavigation: !!params.enableKeyboardNavigation }));
	}, [store, params.enableKeyboardNavigation]);
	return {};
};
useChartKeyboardNavigation.getInitialState = (params) => ({ keyboardNavigation: {
	item: null,
	enableKeyboardNavigation: !!params.enableKeyboardNavigation
} });
useChartKeyboardNavigation.params = { enableKeyboardNavigation: true };
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/isPolar.js
function isPolarSeriesType(seriesType) {
	return polarSeriesTypes.getTypes().has(seriesType);
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartPolarAxis/getAxisExtremum.js
var axisExtremumCallback = (acc, chartType, axis, axisDirection, seriesConfig, axisIndex, formattedSeries) => {
	const getter = axisDirection === "rotation" ? seriesConfig[chartType].rotationExtremumGetter : seriesConfig[chartType].radiusExtremumGetter;
	const series = formattedSeries[chartType]?.series ?? {};
	const [minChartTypeData, maxChartTypeData] = getter?.({
		series,
		axis,
		axisIndex,
		isDefaultAxis: axisIndex === 0
	}) ?? [Infinity, -Infinity];
	const [minData, maxData] = acc;
	return [Math.min(minChartTypeData, minData), Math.max(maxChartTypeData, maxData)];
};
var getAxisExtremum = (axis, axisDirection, seriesConfig, axisIndex, formattedSeries) => {
	const extremums = Object.keys(seriesConfig).filter(isPolarSeriesType).reduce((acc, charType) => axisExtremumCallback(acc, charType, axis, axisDirection, seriesConfig, axisIndex, formattedSeries), [Infinity, -Infinity]);
	if (Number.isNaN(extremums[0]) || Number.isNaN(extremums[1])) return [Infinity, -Infinity];
	return extremums;
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/angleConversion.js
var deg2rad = (value, defaultRad) => {
	if (value === void 0) return defaultRad;
	return Math.PI * value / 180;
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartPolarAxis/getAxisTriggerTooltip.js
var getAxisTriggerTooltip = (axisDirection, seriesConfig, formattedSeries, defaultAxisId) => {
	const tooltipAxesIds = /* @__PURE__ */ new Set();
	Object.keys(seriesConfig).filter(isPolarSeriesType).forEach((chartType) => {
		const series = formattedSeries[chartType]?.series ?? {};
		const tooltipAxes = seriesConfig[chartType].axisTooltipGetter?.(series);
		if (tooltipAxes === void 0) return;
		tooltipAxes.forEach(({ axisId, direction }) => {
			if (direction === axisDirection) tooltipAxesIds.add(axisId ?? defaultAxisId);
		});
	});
	return tooltipAxesIds;
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartPolarAxis/computeAxisValue.js
function getRange(drawingArea, axisDirection, axis) {
	if (axisDirection === "rotation") {
		if (axis.scaleType === "point") {
			const angles = [deg2rad(axis.startAngle, 0), deg2rad(axis.endAngle, 2 * Math.PI)];
			const diff = angles[1] - angles[0];
			if (diff > Math.PI * 2 - .1) angles[1] -= diff / axis.data.length;
			return angles;
		}
		return [deg2rad(axis.startAngle, 0), deg2rad(axis.endAngle, 2 * Math.PI)];
	}
	return [0, Math.min(drawingArea.height, drawingArea.width) / 2];
}
var DEFAULT_CATEGORY_GAP_RATIO = .2;
var DEFAULT_BAR_GAP_RATIO = .1;
function computeAxisValue({ drawingArea, formattedSeries, axis: allAxis, seriesConfig, axisDirection }) {
	if (allAxis === void 0) return {
		axis: {},
		axisIds: []
	};
	const axisIdsTriggeringTooltip = getAxisTriggerTooltip(axisDirection, seriesConfig, formattedSeries, allAxis[0].id);
	const completeAxis = {};
	allAxis.forEach((eachAxis, axisIndex) => {
		const axis = eachAxis;
		const range = getRange(drawingArea, axisDirection, axis);
		const [minData, maxData] = getAxisExtremum(axis, axisDirection, seriesConfig, axisIndex, formattedSeries);
		const triggerTooltip = !axis.ignoreTooltip && axisIdsTriggeringTooltip.has(axis.id);
		const data = axis.data ?? [];
		if (isBandScaleConfig(axis)) {
			const categoryGapRatio = axis.categoryGapRatio ?? DEFAULT_CATEGORY_GAP_RATIO;
			const barGapRatio = axis.barGapRatio ?? DEFAULT_BAR_GAP_RATIO;
			completeAxis[axis.id] = _extends({
				offset: 0,
				categoryGapRatio,
				barGapRatio,
				triggerTooltip
			}, axis, {
				data,
				scale: scaleBand(axis.data, range).paddingInner(categoryGapRatio).paddingOuter(categoryGapRatio / 2),
				tickNumber: axis.data.length,
				colorScale: axis.colorMap && (axis.colorMap.type === "ordinal" ? getOrdinalColorScale(_extends({ values: axis.data }, axis.colorMap)) : getColorScale(axis.colorMap))
			});
			if (isDateData(axis.data)) {
				const dateFormatter = createDateFormatter(axis.data, range, axis.tickNumber);
				completeAxis[axis.id].valueFormatter = axis.valueFormatter ?? dateFormatter;
			}
		}
		if (isPointScaleConfig(axis)) {
			completeAxis[axis.id] = _extends({
				offset: 0,
				triggerTooltip
			}, axis, {
				data,
				scale: scalePoint(axis.data, range),
				tickNumber: axis.data.length,
				colorScale: axis.colorMap && (axis.colorMap.type === "ordinal" ? getOrdinalColorScale(_extends({ values: axis.data }, axis.colorMap)) : getColorScale(axis.colorMap))
			});
			if (isDateData(axis.data)) {
				const dateFormatter = createDateFormatter(axis.data, range, axis.tickNumber);
				completeAxis[axis.id].valueFormatter = axis.valueFormatter ?? dateFormatter;
			}
		}
		if (!isContinuousScaleConfig(axis)) return;
		const scaleType = axis.scaleType ?? "linear";
		const domainLimit = axis.domainLimit ?? "nice";
		const axisExtremums = [axis.min ?? minData, axis.max ?? maxData];
		if (typeof domainLimit === "function") {
			const { min, max } = domainLimit(minData, maxData);
			axisExtremums[0] = min;
			axisExtremums[1] = max;
		}
		const rawTickNumber = getTickNumber(axis, axisExtremums, getDefaultTickNumber(Math.abs(range[1] - range[0])));
		const tickNumber = scaleTickNumberByRange(rawTickNumber, range);
		const scale = getScale(scaleType, axisExtremums, range);
		const finalScale = domainLimit === "nice" ? scale.nice(rawTickNumber) : scale;
		const [minDomain, maxDomain] = finalScale.domain();
		const domain = [axis.min ?? minDomain, axis.max ?? maxDomain];
		completeAxis[axis.id] = _extends({
			offset: 0,
			triggerTooltip
		}, axis, {
			data,
			scaleType,
			scale: finalScale.domain(domain),
			tickNumber,
			colorScale: axis.colorMap && getColorScale(axis.colorMap)
		});
	});
	return {
		axis: completeAxis,
		axisIds: allAxis.map(({ id }) => id)
	};
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartPolarAxis/useChartPolarAxis.selectors.js
var selectorChartPolarAxisState = (state) => state.polarAxis;
var selectorChartRawRotationAxis = createSelector(selectorChartPolarAxisState, (axis) => axis?.rotation);
var selectorChartRawRadiusAxis = createSelector(selectorChartPolarAxisState, (axis) => axis?.radius);
/**
* The only interesting selectors that merge axis data and zoom if provided.
*/
var selectorChartRotationAxis = createSelectorMemoized(selectorChartRawRotationAxis, selectorChartDrawingArea, selectorChartSeriesProcessed, selectorChartSeriesConfig, (axis, drawingArea, formattedSeries, seriesConfig) => computeAxisValue({
	drawingArea,
	formattedSeries,
	axis,
	seriesConfig,
	axisDirection: "rotation"
}));
var selectorChartRadiusAxis = createSelectorMemoized(selectorChartRawRadiusAxis, selectorChartDrawingArea, selectorChartSeriesProcessed, selectorChartSeriesConfig, (axis, drawingArea, formattedSeries, seriesConfig) => computeAxisValue({
	drawingArea,
	formattedSeries,
	axis,
	seriesConfig,
	axisDirection: "radius"
}));
function getDrawingAreaCenter(drawingArea) {
	return {
		cx: drawingArea.left + drawingArea.width / 2,
		cy: drawingArea.top + drawingArea.height / 2
	};
}
var selectorChartPolarCenter = createSelectorMemoized(selectorChartDrawingArea, getDrawingAreaCenter);
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartTooltip/useChartTooltip.selectors.js
var selectTooltip = (state) => state.tooltip;
var selectorChartsTooltipPointerItem = createSelector(selectTooltip, (tooltip) => tooltip?.item ?? null);
var selectorChartsTooltipPointerItemIsDefined = createSelector(selectorChartsTooltipPointerItem, (item) => item !== null);
var selectorChartsTooltipItem = createSelector(selectorChartsLastInteraction, selectorChartsTooltipPointerItem, selectorChartsKeyboardItem, (lastInteraction, pointerItem, keyboardItem) => lastInteraction === "keyboard" ? keyboardItem : pointerItem ?? null);
var selectorChartsTooltipItemIsDefined = createSelector(selectorChartsLastInteraction, selectorChartsTooltipPointerItemIsDefined, selectorChartsHasFocusedItem, (lastInteraction, pointerItemIsDefined, keyboardItemIsDefined) => lastInteraction === "keyboard" ? keyboardItemIsDefined : pointerItemIsDefined);
var selectorChartsTooltipItemPosition = createSelectorMemoized(selectorChartsTooltipItem, selectorChartDrawingArea, selectorChartSeriesConfig, selectorChartSeriesProcessed, selectorChartSeriesLayout, createSelectorMemoized(selectorChartsTooltipItem, selectorChartXAxis, selectorChartYAxis, selectorChartRotationAxis, selectorChartRadiusAxis, selectorChartSeriesProcessed, function selectorChartsTooltipAxisConfig(identifier, { axis: xAxis, axisIds: xAxisIds }, { axis: yAxis, axisIds: yAxisIds }, rotationAxes, radiusAxes, series) {
	if (!identifier) return {};
	const itemSeries = series[identifier.type]?.series[identifier.seriesId];
	if (!itemSeries) return {};
	const axesConfig = {
		rotationAxes,
		radiusAxes
	};
	const xAxisId = isCartesianSeries(itemSeries) ? itemSeries.xAxisId ?? xAxisIds[0] : void 0;
	const yAxisId = isCartesianSeries(itemSeries) ? itemSeries.yAxisId ?? yAxisIds[0] : void 0;
	if (xAxisId !== void 0) axesConfig.x = xAxis[xAxisId];
	if (yAxisId !== void 0) axesConfig.y = yAxis[yAxisId];
	return axesConfig;
}), function selectorChartsTooltipItemPosition(identifier, drawingArea, seriesConfig, series, seriesLayout, axesConfig, placement = "top") {
	if (!identifier) return null;
	const itemSeries = series[identifier.type]?.series[identifier.seriesId];
	if (!itemSeries) return null;
	return seriesConfig[itemSeries.type].tooltipItemPositionGetter?.({
		series,
		seriesLayout,
		drawingArea,
		axesConfig,
		identifier,
		placement
	}) ?? null;
});
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartZAxis/useChartZAxis.js
function addDefaultId(axisConfig, defaultId) {
	if (axisConfig.id !== void 0) return axisConfig;
	return _extends({ id: defaultId }, axisConfig);
}
function processColorMap(axisConfig) {
	if (!axisConfig.colorMap) return axisConfig;
	return _extends({}, axisConfig, { colorScale: axisConfig.colorMap.type === "ordinal" && axisConfig.data ? getOrdinalColorScale(_extends({ values: axisConfig.data }, axisConfig.colorMap)) : getColorScale(axisConfig.colorMap.type === "continuous" ? _extends({
		min: axisConfig.min,
		max: axisConfig.max
	}, axisConfig.colorMap) : axisConfig.colorMap) });
}
function getZAxisState(zAxis, dataset) {
	if (!zAxis || zAxis.length === 0) return {
		axis: {},
		axisIds: []
	};
	const zAxisLookup = {};
	const axisIds = [];
	zAxis.forEach((axisConfig, index) => {
		const dataKey = axisConfig.dataKey;
		const defaultizedId = axisConfig.id ?? `defaultized-z-axis-${index}`;
		if (dataKey === void 0 || axisConfig.data !== void 0) {
			zAxisLookup[defaultizedId] = processColorMap(addDefaultId(axisConfig, defaultizedId));
			axisIds.push(defaultizedId);
			return;
		}
		if (dataset === void 0) throw new Error("MUI X Charts: z-axis uses `dataKey` but no `dataset` is provided.");
		zAxisLookup[defaultizedId] = processColorMap(addDefaultId(_extends({}, axisConfig, { data: dataset.map((d) => d[dataKey]) }), defaultizedId));
		axisIds.push(defaultizedId);
	});
	return {
		axis: zAxisLookup,
		axisIds
	};
}
var useChartZAxis = ({ params, store }) => {
	const { zAxis, dataset } = params;
	const isFirstRender = import_react.useRef(true);
	import_react.useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		store.set("zAxis", getZAxisState(zAxis, dataset));
	}, [
		zAxis,
		dataset,
		store
	]);
	return {};
};
useChartZAxis.params = {
	zAxis: true,
	dataset: true
};
useChartZAxis.getInitialState = (params) => ({ zAxis: getZAxisState(params.zAxis, params.dataset) });
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartZAxis/useChartZAxis.selectors.js
var selectRootState = (state) => state;
var selectorChartZAxis = createSelector(selectRootState, (state) => state.zAxis);
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartHighlight/useChartHighlight.js
var useChartHighlight = ({ store, params }) => {
	useAssertModelConsistency({
		warningPrefix: "MUI X Charts",
		componentName: "Chart",
		propName: "highlightedItem",
		controlled: params.highlightedItem,
		defaultValue: null
	});
	useEnhancedEffect(() => {
		if (store.state.highlight.item !== params.highlightedItem) store.set("highlight", _extends({}, store.state.highlight, { item: params.highlightedItem }));
		if (params.highlightedItem !== void 0 && !store.state.highlight.isControlled) warnOnce(["MUI X Charts: The `highlightedItem` switched between controlled and uncontrolled state.", "To remove the highlight when using controlled state, you must provide `null` to the `highlightedItem` prop instead of `undefined`."].join("\n"));
	}, [store, params.highlightedItem]);
	return { instance: {
		clearHighlight: useEventCallback(() => {
			params.onHighlightChange?.(null);
			const prevHighlight = store.state.highlight;
			if (prevHighlight.item === null || prevHighlight.isControlled) return;
			store.set("highlight", {
				item: null,
				lastUpdate: "pointer",
				isControlled: false
			});
		}),
		setHighlight: useEventCallback((newItem) => {
			const prevHighlight = store.state.highlight;
			if (fastObjectShallowCompare(prevHighlight.item, newItem)) return;
			params.onHighlightChange?.(newItem);
			if (prevHighlight.isControlled) return;
			store.set("highlight", {
				item: newItem,
				lastUpdate: "pointer",
				isControlled: false
			});
		})
	} };
};
useChartHighlight.getInitialState = (params) => ({ highlight: {
	item: params.highlightedItem,
	lastUpdate: "pointer",
	isControlled: params.highlightedItem !== void 0
} });
useChartHighlight.params = {
	highlightedItem: true,
	onHighlightChange: true
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/findMinMax.js
/**
* Efficiently finds the minimum and maximum values in an array of numbers.
* This functions helps preventing maximum call stack errors when dealing with large datasets.
*
* @param data The array of numbers to evaluate
* @returns [min, max] as numbers
*/
function findMinMax(data) {
	let min = Infinity;
	let max = -Infinity;
	for (const value of data ?? []) {
		if (value < min) min = value;
		if (value > max) max = value;
	}
	return [min, max];
}
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/seriesConfig/bar/extremums.js
var createResult = (data, direction) => {
	if (direction === "x") return {
		x: data,
		y: null
	};
	return {
		x: null,
		y: data
	};
};
var getBaseExtremum = (params) => {
	const { axis, getFilters, isDefaultAxis } = params;
	const filter = getFilters?.({
		currentAxisId: axis.id,
		isDefaultAxis
	});
	return findMinMax((filter ? axis.data?.filter((_, i) => filter({
		x: null,
		y: null
	}, i)) : axis.data) ?? []);
};
var getValueExtremum = (direction) => (params) => {
	const { series, axis, getFilters, isDefaultAxis } = params;
	return Object.keys(series).filter((seriesId) => {
		const axisId = direction === "x" ? series[seriesId].xAxisId : series[seriesId].yAxisId;
		return axisId === axis.id || isDefaultAxis && axisId === void 0;
	}).reduce((acc, seriesId) => {
		const { stackedData } = series[seriesId];
		const filter = getFilters?.({
			currentAxisId: axis.id,
			isDefaultAxis,
			seriesXAxisId: series[seriesId].xAxisId,
			seriesYAxisId: series[seriesId].yAxisId
		});
		const [seriesMin, seriesMax] = stackedData?.reduce((seriesAcc, values, index) => {
			if (filter && (!filter(createResult(values[0], direction), index) || !filter(createResult(values[1], direction), index))) return seriesAcc;
			return [Math.min(...values, seriesAcc[0]), Math.max(...values, seriesAcc[1])];
		}, [Infinity, -Infinity]) ?? [Infinity, -Infinity];
		return [Math.min(seriesMin, acc[0]), Math.max(seriesMax, acc[1])];
	}, [Infinity, -Infinity]);
};
var getExtremumX$2 = (params) => {
	if (Object.keys(params.series).some((seriesId) => params.series[seriesId].layout === "horizontal")) return getValueExtremum("x")(params);
	return getBaseExtremum(params);
};
var getExtremumY$2 = (params) => {
	if (Object.keys(params.series).some((seriesId) => params.series[seriesId].layout === "horizontal")) return getBaseExtremum(params);
	return getValueExtremum("y")(params);
};
//#endregion
//#region node_modules/d3-shape/src/constant.js
function constant_default(x) {
	return function constant() {
		return x;
	};
}
//#endregion
//#region node_modules/d3-shape/src/math.js
var abs = Math.abs;
var atan2 = Math.atan2;
var cos = Math.cos;
var max = Math.max;
var min = Math.min;
var sin = Math.sin;
var sqrt = Math.sqrt;
var epsilon = 1e-12;
var pi = Math.PI;
var halfPi = pi / 2;
var tau = 2 * pi;
function acos(x) {
	return x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
}
function asin(x) {
	return x >= 1 ? halfPi : x <= -1 ? -halfPi : Math.asin(x);
}
Array.prototype.slice;
function array_default(x) {
	return typeof x === "object" && "length" in x ? x : Array.from(x);
}
//#endregion
//#region node_modules/d3-shape/src/descending.js
function descending_default$1(a, b) {
	return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
}
//#endregion
//#region node_modules/d3-shape/src/identity.js
function identity_default(d) {
	return d;
}
//#endregion
//#region node_modules/d3-shape/src/pie.js
function pie_default() {
	var value = identity_default, sortValues = descending_default$1, sort = null, startAngle = constant_default(0), endAngle = constant_default(tau), padAngle = constant_default(0);
	function pie(data) {
		var i, n = (data = array_default(data)).length, j, k, sum = 0, index = new Array(n), arcs = new Array(n), a0 = +startAngle.apply(this, arguments), da = Math.min(tau, Math.max(-tau, endAngle.apply(this, arguments) - a0)), a1, p = Math.min(Math.abs(da) / n, padAngle.apply(this, arguments)), pa = p * (da < 0 ? -1 : 1), v;
		for (i = 0; i < n; ++i) if ((v = arcs[index[i] = i] = +value(data[i], i, data)) > 0) sum += v;
		if (sortValues != null) index.sort(function(i, j) {
			return sortValues(arcs[i], arcs[j]);
		});
		else if (sort != null) index.sort(function(i, j) {
			return sort(data[i], data[j]);
		});
		for (i = 0, k = sum ? (da - n * pa) / sum : 0; i < n; ++i, a0 = a1) j = index[i], v = arcs[j], a1 = a0 + (v > 0 ? v * k : 0) + pa, arcs[j] = {
			data: data[j],
			index: i,
			value: v,
			startAngle: a0,
			endAngle: a1,
			padAngle: p
		};
		return arcs;
	}
	pie.value = function(_) {
		return arguments.length ? (value = typeof _ === "function" ? _ : constant_default(+_), pie) : value;
	};
	pie.sortValues = function(_) {
		return arguments.length ? (sortValues = _, sort = null, pie) : sortValues;
	};
	pie.sort = function(_) {
		return arguments.length ? (sort = _, sortValues = null, pie) : sort;
	};
	pie.startAngle = function(_) {
		return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant_default(+_), pie) : startAngle;
	};
	pie.endAngle = function(_) {
		return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant_default(+_), pie) : endAngle;
	};
	pie.padAngle = function(_) {
		return arguments.length ? (padAngle = typeof _ === "function" ? _ : constant_default(+_), pie) : padAngle;
	};
	return pie;
}
//#endregion
//#region node_modules/d3-shape/src/offset/none.js
function none_default$1(series, order) {
	if (!((n = series.length) > 1)) return;
	for (var i = 1, j, s0, s1 = series[order[0]], n, m = s1.length; i < n; ++i) {
		s0 = s1, s1 = series[order[i]];
		for (j = 0; j < m; ++j) s1[j][1] += s1[j][0] = isNaN(s0[j][1]) ? s0[j][0] : s0[j][1];
	}
}
//#endregion
//#region node_modules/d3-shape/src/order/none.js
function none_default(series) {
	var n = series.length, o = new Array(n);
	while (--n >= 0) o[n] = n;
	return o;
}
//#endregion
//#region node_modules/d3-shape/src/stack.js
function stackValue(d, key) {
	return d[key];
}
function stackSeries(key) {
	const series = [];
	series.key = key;
	return series;
}
function stack_default() {
	var keys = constant_default([]), order = none_default, offset = none_default$1, value = stackValue;
	function stack(data) {
		var sz = Array.from(keys.apply(this, arguments), stackSeries), i, n = sz.length, j = -1, oz;
		for (const d of data) for (i = 0, ++j; i < n; ++i) (sz[i][j] = [0, +value(d, sz[i].key, j, data)]).data = d;
		for (i = 0, oz = array_default(order(sz)); i < n; ++i) sz[oz[i]].index = i;
		offset(sz, oz);
		return sz;
	}
	stack.keys = function(_) {
		return arguments.length ? (keys = typeof _ === "function" ? _ : constant_default(Array.from(_)), stack) : keys;
	};
	stack.value = function(_) {
		return arguments.length ? (value = typeof _ === "function" ? _ : constant_default(+_), stack) : value;
	};
	stack.order = function(_) {
		return arguments.length ? (order = _ == null ? none_default : typeof _ === "function" ? _ : constant_default(Array.from(_)), stack) : order;
	};
	stack.offset = function(_) {
		return arguments.length ? (offset = _ == null ? none_default$1 : _, stack) : offset;
	};
	return stack;
}
//#endregion
//#region node_modules/d3-shape/src/offset/expand.js
function expand_default(series, order) {
	if (!((n = series.length) > 0)) return;
	for (var i, n, j = 0, m = series[0].length, y; j < m; ++j) {
		for (y = i = 0; i < n; ++i) y += series[i][j][1] || 0;
		if (y) for (i = 0; i < n; ++i) series[i][j][1] /= y;
	}
	none_default$1(series, order);
}
//#endregion
//#region node_modules/d3-shape/src/offset/silhouette.js
function silhouette_default(series, order) {
	if (!((n = series.length) > 0)) return;
	for (var j = 0, s0 = series[order[0]], n, m = s0.length; j < m; ++j) {
		for (var i = 0, y = 0; i < n; ++i) y += series[i][j][1] || 0;
		s0[j][1] += s0[j][0] = -y / 2;
	}
	none_default$1(series, order);
}
//#endregion
//#region node_modules/d3-shape/src/offset/wiggle.js
function wiggle_default(series, order) {
	if (!((n = series.length) > 0) || !((m = (s0 = series[order[0]]).length) > 0)) return;
	for (var y = 0, j = 1, s0, m, n; j < m; ++j) {
		for (var i = 0, s1 = 0, s2 = 0; i < n; ++i) {
			var si = series[order[i]], sij0 = si[j][1] || 0, s3 = (sij0 - (si[j - 1][1] || 0)) / 2;
			for (var k = 0; k < i; ++k) {
				var sk = series[order[k]], skj0 = sk[j][1] || 0, skj1 = sk[j - 1][1] || 0;
				s3 += skj0 - skj1;
			}
			s1 += sij0, s2 += s3 * sij0;
		}
		s0[j - 1][1] += s0[j - 1][0] = y;
		if (s1) y -= s2 / s1;
	}
	s0[j - 1][1] += s0[j - 1][0] = y;
	none_default$1(series, order);
}
//#endregion
//#region node_modules/d3-shape/src/order/appearance.js
function appearance_default(series) {
	var peaks = series.map(peak);
	return none_default(series).sort(function(a, b) {
		return peaks[a] - peaks[b];
	});
}
function peak(series) {
	var i = -1, j = 0, n = series.length, vi, vj = -Infinity;
	while (++i < n) if ((vi = +series[i][1]) > vj) vj = vi, j = i;
	return j;
}
//#endregion
//#region node_modules/d3-shape/src/order/ascending.js
function ascending_default(series) {
	var sums = series.map(sum);
	return none_default(series).sort(function(a, b) {
		return sums[a] - sums[b];
	});
}
function sum(series) {
	var s = 0, i = -1, n = series.length, v;
	while (++i < n) if (v = +series[i][1]) s += v;
	return s;
}
//#endregion
//#region node_modules/d3-shape/src/order/descending.js
function descending_default(series) {
	return ascending_default(series).reverse();
}
//#endregion
//#region node_modules/d3-shape/src/order/insideOut.js
function insideOut_default(series) {
	var n = series.length, i, j, sums = series.map(sum), order = appearance_default(series), top = 0, bottom = 0, tops = [], bottoms = [];
	for (i = 0; i < n; ++i) {
		j = order[i];
		if (top < bottom) {
			top += sums[j];
			tops.push(j);
		} else {
			bottom += sums[j];
			bottoms.push(j);
		}
	}
	return bottoms.reverse().concat(tops);
}
//#endregion
//#region node_modules/d3-shape/src/order/reverse.js
function reverse_default(series) {
	return none_default(series).reverse();
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/stacking/offset/offsetDiverging.js
/**
* Positive values are stacked above zero, while negative values are stacked below zero.
*
* @param series A series generated by a stack generator.
* @param order An array of numeric indexes representing the stack order.
*/
function offsetDiverging(series, order) {
	if (series.length === 0) return;
	const seriesCount = series.length;
	const numericOrder = order;
	const pointCount = series[numericOrder[0]].length;
	for (let pointIndex = 0; pointIndex < pointCount; pointIndex += 1) {
		let positiveSum = 0;
		let negativeSum = 0;
		for (let seriesIndex = 0; seriesIndex < seriesCount; seriesIndex += 1) {
			const currentSeries = series[numericOrder[seriesIndex]];
			const dataPoint = currentSeries[pointIndex];
			const difference = dataPoint[1] - dataPoint[0];
			if (difference > 0) {
				dataPoint[0] = positiveSum;
				positiveSum += difference;
				dataPoint[1] = positiveSum;
			} else if (difference < 0) {
				dataPoint[1] = negativeSum;
				negativeSum += difference;
				dataPoint[0] = negativeSum;
			} else if (dataPoint.data[currentSeries.key] > 0) {
				dataPoint[0] = positiveSum;
				dataPoint[1] = positiveSum;
			} else if (dataPoint.data[currentSeries.key] < 0) {
				dataPoint[1] = negativeSum;
				dataPoint[0] = negativeSum;
			} else {
				dataPoint[0] = 0;
				dataPoint[1] = 0;
			}
		}
	}
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/stacking/stackSeries.js
var StackOrder = {
	appearance: appearance_default,
	ascending: ascending_default,
	descending: descending_default,
	insideOut: insideOut_default,
	none: none_default,
	reverse: reverse_default
};
var StackOffset = {
	expand: expand_default,
	diverging: offsetDiverging,
	none: none_default$1,
	silhouette: silhouette_default,
	wiggle: wiggle_default
};
/**
* Takes a set of series and groups their ids
* @param series the object of all bars series
* @returns an array of groups, including the ids, the stacking order, and the stacking offset.
*/
var getStackingGroups = (params) => {
	const { series, seriesOrder, defaultStrategy } = params;
	const stackingGroups = [];
	const stackIndex = {};
	seriesOrder.forEach((id) => {
		const { stack, stackOrder, stackOffset } = series[id];
		if (stack === void 0) stackingGroups.push({
			ids: [id],
			stackingOrder: StackOrder.none,
			stackingOffset: StackOffset.none
		});
		else if (stackIndex[stack] === void 0) {
			stackIndex[stack] = stackingGroups.length;
			stackingGroups.push({
				ids: [id],
				stackingOrder: StackOrder[stackOrder ?? defaultStrategy?.stackOrder ?? "none"],
				stackingOffset: StackOffset[stackOffset ?? defaultStrategy?.stackOffset ?? "diverging"]
			});
		} else {
			stackingGroups[stackIndex[stack]].ids.push(id);
			if (stackOrder !== void 0) stackingGroups[stackIndex[stack]].stackingOrder = StackOrder[stackOrder];
			if (stackOffset !== void 0) stackingGroups[stackIndex[stack]].stackingOffset = StackOffset[stackOffset];
		}
	});
	return stackingGroups;
};
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/seriesConfig/bar/seriesProcessor.js
var barValueFormatter = (v) => v == null ? "" : v.toLocaleString();
var seriesProcessor$3 = (params, dataset, isItemVisible) => {
	const { seriesOrder, series } = params;
	const stackingGroups = getStackingGroups(params);
	const d3Dataset = dataset ?? [];
	seriesOrder.forEach((id) => {
		const data = series[id].data;
		if (data !== void 0) data.forEach((value, index) => {
			if (d3Dataset.length <= index) d3Dataset.push({ [id]: value });
			else d3Dataset[index][id] = value;
		});
		else if (dataset === void 0) throw new Error([`MUI X Charts: bar series with id='${id}' has no data.`, "Either provide a data property to the series or use the dataset prop."].join("\n"));
		if (!data && dataset) {
			const dataKey = series[id].dataKey;
			if (!dataKey) throw new Error([`MUI X Charts: bar series with id='${id}' has no data and no dataKey.`, "You must provide a dataKey when using the dataset prop."].join("\n"));
			dataset.forEach((entry, index) => {
				const value = entry[dataKey];
				if (value != null && typeof value !== "number") warnOnce([`MUI X Charts: your dataset key "${dataKey}" is used for plotting bars, but the dataset contains the non-null non-numerical element "${value}" at index ${index}.`, "Bar plots only support numeric and null values."].join("\n"));
			});
		}
	});
	const completedSeries = {};
	stackingGroups.forEach((stackingGroup) => {
		const { ids, stackingOffset, stackingOrder } = stackingGroup;
		const keys = ids.map((id) => {
			const dataKey = series[id].dataKey;
			return series[id].data === void 0 && dataKey !== void 0 ? dataKey : id;
		});
		const stackedData = stack_default().keys(keys).value((d, key) => d[key] ?? 0).order(stackingOrder).offset(stackingOffset)(d3Dataset);
		const idOrder = stackedData.map((s) => s.index);
		const fixedOrder = () => idOrder;
		const visibleStackedData = stack_default().keys(keys).value((d, key) => {
			const seriesId = ids[keys.indexOf(key)];
			if (!isItemVisible?.({
				type: "bar",
				seriesId
			})) return 0;
			return d[key] ?? 0;
		}).order(fixedOrder).offset(stackingOffset)(d3Dataset);
		ids.forEach((id, index) => {
			const dataKey = series[id].dataKey;
			const data = dataKey ? dataset.map((d) => {
				const value = d[dataKey];
				return typeof value === "number" ? value : null;
			}) : series[id].data;
			const hidden = !isItemVisible?.({
				type: "bar",
				seriesId: id
			});
			completedSeries[id] = _extends({
				layout: "vertical",
				labelMarkType: "square",
				minBarSize: 0,
				valueFormatter: series[id].valueFormatter ?? barValueFormatter
			}, series[id], {
				data,
				hidden,
				stackedData: stackedData[index],
				visibleStackedData: visibleStackedData[index]
			});
		});
	});
	return {
		seriesOrder,
		stackingGroups,
		series: completedSeries
	};
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/getLabel.js
function getLabel(value, location) {
	return typeof value === "function" ? value(location) : value;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/seriesConfig/bar/legend.js
var legendGetter$3 = (params) => {
	const { seriesOrder, series } = params;
	return seriesOrder.reduce((acc, seriesId) => {
		const formattedLabel = getLabel(series[seriesId].label, "legend");
		if (formattedLabel === void 0) return acc;
		acc.push({
			type: "bar",
			markType: series[seriesId].labelMarkType,
			id: seriesId,
			seriesId,
			color: series[seriesId].color,
			label: formattedLabel
		});
		return acc;
	}, []);
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/getSeriesColorFn.js
function getSeriesColorFn(series) {
	return series.colorGetter ? series.colorGetter : () => series.color;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/seriesConfig/bar/getColor.js
var getColor$3 = (series, xAxis, yAxis) => {
	const verticalLayout = series.layout === "vertical";
	const bandColorScale = verticalLayout ? xAxis?.colorScale : yAxis?.colorScale;
	const valueColorScale = verticalLayout ? yAxis?.colorScale : xAxis?.colorScale;
	const bandValues = verticalLayout ? xAxis?.data : yAxis?.data;
	const getSeriesColor = getSeriesColorFn(series);
	if (valueColorScale) return (dataIndex) => {
		if (dataIndex === void 0) return series.color;
		const value = series.data[dataIndex];
		const color = value === null ? getSeriesColor({
			value,
			dataIndex
		}) : valueColorScale(value);
		if (color === null) return getSeriesColor({
			value,
			dataIndex
		});
		return color;
	};
	if (bandColorScale && bandValues) return (dataIndex) => {
		if (dataIndex === void 0) return series.color;
		const value = bandValues[dataIndex];
		const color = value === null ? getSeriesColor({
			value,
			dataIndex
		}) : bandColorScale(value);
		if (color === null) return getSeriesColor({
			value,
			dataIndex
		});
		return color;
	};
	return (dataIndex) => {
		if (dataIndex === void 0) return series.color;
		const value = series.data[dataIndex];
		return getSeriesColor({
			value,
			dataIndex
		});
	};
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartKeyboardNavigation/utils/getNonEmptySeriesArray.js
function getNonEmptySeriesArray(series, availableSeriesTypes) {
	return Object.keys(series).filter((type) => availableSeriesTypes.has(type)).flatMap((type) => {
		const seriesOfType = series[type];
		return seriesOfType.seriesOrder.filter((seriesId) => seriesOfType.series[seriesId].data.length > 0 && seriesOfType.series[seriesId].data.some((value) => value != null)).map((seriesId) => ({
			type,
			seriesId
		}));
	});
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartKeyboardNavigation/utils/getPreviousNonEmptySeries.js
/**
* Returns the previous series type and id that contains some data.
* Returns `null` if no other series have data.
*/
function getPreviousNonEmptySeries(series, availableSeriesTypes, type, seriesId) {
	const nonEmptySeries = getNonEmptySeriesArray(series, availableSeriesTypes);
	if (nonEmptySeries.length === 0) return null;
	const currentSeriesIndex = type !== void 0 && seriesId !== void 0 ? nonEmptySeries.findIndex((seriesItem) => seriesItem.type === type && seriesItem.seriesId === seriesId) : -1;
	if (currentSeriesIndex <= 0) return nonEmptySeries[nonEmptySeries.length - 1];
	return nonEmptySeries[(currentSeriesIndex - 1 + nonEmptySeries.length) % nonEmptySeries.length];
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartKeyboardNavigation/utils/getMaxSeriesLength.js
function getMaxSeriesLength(series, availableSeriesTypes) {
	return Object.keys(series).filter((type) => availableSeriesTypes.has(type)).flatMap((type) => {
		const seriesOfType = series[type];
		return seriesOfType.seriesOrder.filter((seriesId) => seriesOfType.series[seriesId].data.length > 0 && seriesOfType.series[seriesId].data.some((value) => value != null)).map((seriesId) => seriesOfType.series[seriesId].data.length);
	}).reduce((maxLengths, length) => Math.max(maxLengths, length), 0);
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartKeyboardNavigation/utils/getNextNonEmptySeries.js
/**
* Returns the next series type and id that contains some data.
* Returns `null` if no other series have data.
* @param series - The processed series from the store.
* @param availableSeriesTypes - The set of series types that can be focused.
* @param type - The current series type.
* @param seriesId - The current series id.
*/
function getNextNonEmptySeries(series, availableSeriesTypes, type, seriesId) {
	const nonEmptySeries = getNonEmptySeriesArray(series, availableSeriesTypes);
	if (nonEmptySeries.length === 0) return null;
	return nonEmptySeries[((type !== void 0 && seriesId !== void 0 ? nonEmptySeries.findIndex((seriesItem) => seriesItem.type === type && seriesItem.seriesId === seriesId) : -1) + 1) % nonEmptySeries.length];
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/seriesHasData.js
function seriesHasData(series, type, seriesId) {
	if (type === "sankey") return false;
	const data = series[type]?.series[seriesId]?.data;
	return data != null && data.length > 0;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/commonNextFocusItem.js
function createGetNextIndexFocusedItem(compatibleSeriesTypes, allowCycles = false) {
	return function getNextIndexFocusedItem(currentItem, state) {
		const processedSeries = selectorChartSeriesProcessed(state);
		let seriesId = currentItem?.seriesId;
		let type = currentItem?.type;
		if (!type || seriesId == null || !seriesHasData(processedSeries, type, seriesId)) {
			const nextSeries = getNextNonEmptySeries(processedSeries, compatibleSeriesTypes, type, seriesId);
			if (nextSeries === null) return null;
			type = nextSeries.type;
			seriesId = nextSeries.seriesId;
		}
		const maxLength = getMaxSeriesLength(processedSeries, compatibleSeriesTypes);
		let dataIndex = currentItem?.dataIndex == null ? 0 : currentItem.dataIndex + 1;
		if (allowCycles) dataIndex = dataIndex % maxLength;
		else dataIndex = Math.min(maxLength - 1, dataIndex);
		return {
			type,
			seriesId,
			dataIndex
		};
	};
}
function createGetPreviousIndexFocusedItem(compatibleSeriesTypes, allowCycles = false) {
	return function getPreviousIndexFocusedItem(currentItem, state) {
		const processedSeries = selectorChartSeriesProcessed(state);
		let seriesId = currentItem?.seriesId;
		let type = currentItem?.type;
		if (!type || seriesId == null || !seriesHasData(processedSeries, type, seriesId)) {
			const previousSeries = getPreviousNonEmptySeries(processedSeries, compatibleSeriesTypes, type, seriesId);
			if (previousSeries === null) return null;
			type = previousSeries.type;
			seriesId = previousSeries.seriesId;
		}
		const maxLength = getMaxSeriesLength(processedSeries, compatibleSeriesTypes);
		let dataIndex = currentItem?.dataIndex == null ? maxLength - 1 : currentItem.dataIndex - 1;
		if (allowCycles) dataIndex = (maxLength + dataIndex) % maxLength;
		else dataIndex = Math.max(0, dataIndex);
		return {
			type,
			seriesId,
			dataIndex
		};
	};
}
function createGetNextSeriesFocusedItem(compatibleSeriesTypes) {
	return function getNextSeriesFocusedItem(currentItem, state) {
		const processedSeries = selectorChartSeriesProcessed(state);
		let seriesId = currentItem?.seriesId;
		let type = currentItem?.type;
		const nextSeries = getNextNonEmptySeries(processedSeries, compatibleSeriesTypes, type, seriesId);
		if (nextSeries === null) return null;
		type = nextSeries.type;
		seriesId = nextSeries.seriesId;
		const dataIndex = currentItem?.dataIndex == null ? 0 : currentItem.dataIndex;
		return {
			type,
			seriesId,
			dataIndex
		};
	};
}
function createGetPreviousSeriesFocusedItem(compatibleSeriesTypes) {
	return function getPreviousSeriesFocusedItem(currentItem, state) {
		const processedSeries = selectorChartSeriesProcessed(state);
		let seriesId = currentItem?.seriesId;
		let type = currentItem?.type;
		const previousSeries = getPreviousNonEmptySeries(processedSeries, compatibleSeriesTypes, type, seriesId);
		if (previousSeries === null) return null;
		type = previousSeries.type;
		seriesId = previousSeries.seriesId;
		const data = processedSeries[type].series[seriesId].data;
		const dataIndex = currentItem?.dataIndex == null ? data.length - 1 : currentItem.dataIndex;
		return {
			type,
			seriesId,
			dataIndex
		};
	};
}
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/seriesConfig/bar/keyboardFocusHandler.js
var outSeriesTypes$3 = new Set([
	"bar",
	"line",
	"scatter"
]);
var keyboardFocusHandler$3 = (event) => {
	switch (event.key) {
		case "ArrowRight": return createGetNextIndexFocusedItem(outSeriesTypes$3);
		case "ArrowLeft": return createGetPreviousIndexFocusedItem(outSeriesTypes$3);
		case "ArrowDown": return createGetPreviousSeriesFocusedItem(outSeriesTypes$3);
		case "ArrowUp": return createGetNextSeriesFocusedItem(outSeriesTypes$3);
		default: return null;
	}
};
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/seriesConfig/bar/tooltip.js
var tooltipGetter$3 = (params) => {
	const { series, getColor, identifier } = params;
	if (!identifier || identifier.dataIndex === void 0) return null;
	const label = getLabel(series.label, "tooltip");
	const value = series.data[identifier.dataIndex];
	if (value == null) return null;
	const formattedValue = series.valueFormatter(value, { dataIndex: identifier.dataIndex });
	return {
		identifier,
		color: getColor(identifier.dataIndex),
		label,
		value,
		formattedValue,
		markType: series.labelMarkType
	};
};
var axisTooltipGetter$1 = (series) => {
	return Object.values(series).map((s) => s.layout === "horizontal" ? {
		direction: "y",
		axisId: s.yAxisId
	} : {
		direction: "x",
		axisId: s.xAxisId
	});
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/getBandSize.js
/**
* Solution of the equations
* W = barWidth * N + offset * (N-1)
* offset / (offset + barWidth) = r
* @param bandWidth (W) The width available to place bars.
* @param groupCount (N) The number of bars to place in that space.
* @param gapRatio (r) The ratio of the gap between bars over the bar width.
* @returns The bar width and the offset between bars.
*/
function getBandSize(bandWidth, groupCount, gapRatio) {
	if (gapRatio === 0) return {
		barWidth: bandWidth / groupCount,
		offset: 0
	};
	const barWidth = bandWidth / (groupCount + (groupCount - 1) * gapRatio);
	return {
		barWidth,
		offset: gapRatio * barWidth
	};
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/getBarDimensions.js
function shouldInvertStartCoordinate(verticalLayout, baseValue, reverse) {
	const invertStartCoordinate = verticalLayout && baseValue > 0 || !verticalLayout && baseValue < 0;
	return reverse ? !invertStartCoordinate : invertStartCoordinate;
}
function getBarDimensions(params) {
	const { verticalLayout, xAxisConfig, yAxisConfig, series, dataIndex, numberOfGroups, groupIndex } = params;
	const baseScaleConfig = verticalLayout ? xAxisConfig : yAxisConfig;
	const reverse = (verticalLayout ? yAxisConfig.reverse : xAxisConfig.reverse) ?? false;
	const { barWidth, offset } = getBandSize(baseScaleConfig.scale.bandwidth(), numberOfGroups, baseScaleConfig.barGapRatio);
	const barOffset = groupIndex * (barWidth + offset);
	const xScale = xAxisConfig.scale;
	const yScale = yAxisConfig.scale;
	const baseValue = baseScaleConfig.data[dataIndex];
	const seriesValue = series.data[dataIndex];
	if (seriesValue == null) return null;
	const [minValueCoord, maxValueCoord] = findMinMax(series.visibleStackedData[dataIndex].map((v) => verticalLayout ? yScale(v) : xScale(v))).map((v) => Math.round(v));
	let barSize = 0;
	if (seriesValue !== 0) {
		if (!series.hidden) barSize = Math.max(series.minBarSize, maxValueCoord - minValueCoord);
	}
	const shouldInvert = shouldInvertStartCoordinate(verticalLayout, seriesValue, reverse);
	let startCoordinate = 0;
	if (shouldInvert) startCoordinate = maxValueCoord - barSize;
	else startCoordinate = minValueCoord;
	return {
		x: verticalLayout ? xScale(baseValue) + barOffset : startCoordinate,
		y: verticalLayout ? startCoordinate : yScale(baseValue) + barOffset,
		height: verticalLayout ? barSize : barWidth,
		width: verticalLayout ? barWidth : barSize
	};
}
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/seriesConfig/bar/tooltipPosition.js
var tooltipItemPositionGetter$3 = (params) => {
	const { series, identifier, axesConfig, placement } = params;
	if (!identifier || identifier.dataIndex === void 0) return null;
	const itemSeries = series.bar?.series[identifier.seriesId];
	if (series.bar == null || itemSeries == null) return null;
	if (axesConfig.x === void 0 || axesConfig.y === void 0) return null;
	const dimensions = getBarDimensions({
		verticalLayout: itemSeries.layout === "vertical",
		xAxisConfig: axesConfig.x,
		yAxisConfig: axesConfig.y,
		series: itemSeries,
		dataIndex: identifier.dataIndex,
		numberOfGroups: series.bar.stackingGroups.length,
		groupIndex: series.bar.stackingGroups.findIndex((group) => group.ids.includes(itemSeries.id))
	});
	if (dimensions == null) return null;
	const { x, y, width, height } = dimensions;
	switch (placement) {
		case "right": return {
			x: x + width,
			y: y + height / 2
		};
		case "bottom": return {
			x: x + width / 2,
			y: y + height
		};
		case "left": return {
			x,
			y: y + height / 2
		};
		default: return {
			x: x + width / 2,
			y
		};
	}
};
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/seriesConfig/bar/getSeriesWithDefaultValues.js
function getSeriesWithDefaultValues$3(seriesData, seriesIndex, colors) {
	return _extends({}, seriesData, {
		id: seriesData.id ?? `auto-generated-id-${seriesIndex}`,
		color: seriesData.color ?? colors[seriesIndex % colors.length]
	});
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/identifierSerializer.js
var typeSerializer = (type) => `Type(${type})`;
var seriesIdSerializer = (id) => `Series(${id})`;
var dataIndexSerializer = (dataIndex) => dataIndex === void 0 ? "" : `Index(${dataIndex})`;
var identifierSerializerSeriesIdDataIndex = (identifier) => {
	return `${typeSerializer(identifier.type)}${seriesIdSerializer(identifier.seriesId)}${dataIndexSerializer(identifier.dataIndex)}`;
};
//#endregion
//#region node_modules/@mui/x-charts/esm/BarChart/seriesConfig/index.js
var barSeriesConfig = {
	seriesProcessor: seriesProcessor$3,
	colorProcessor: getColor$3,
	legendGetter: legendGetter$3,
	tooltipGetter: tooltipGetter$3,
	tooltipItemPositionGetter: tooltipItemPositionGetter$3,
	axisTooltipGetter: axisTooltipGetter$1,
	xExtremumGetter: getExtremumX$2,
	yExtremumGetter: getExtremumY$2,
	getSeriesWithDefaultValues: getSeriesWithDefaultValues$3,
	keyboardFocusHandler: keyboardFocusHandler$3,
	identifierSerializer: identifierSerializerSeriesIdDataIndex
};
//#endregion
//#region node_modules/@mui/x-charts/esm/LineChart/seriesConfig/extremums.js
var getExtremumX$1 = (params) => {
	const { axis } = params;
	return findMinMax(axis.data ?? []);
};
function getSeriesExtremums(getValues, data, stackedData, filter) {
	return stackedData.reduce((seriesAcc, stackedValue, index) => {
		if (data[index] === null) return seriesAcc;
		const [base, value] = getValues(stackedValue);
		if (filter && (!filter({
			y: base,
			x: null
		}, index) || !filter({
			y: value,
			x: null
		}, index))) return seriesAcc;
		return [Math.min(base, value, seriesAcc[0]), Math.max(base, value, seriesAcc[1])];
	}, [Infinity, -Infinity]);
}
var getExtremumY$1 = (params) => {
	const { series, axis, isDefaultAxis, getFilters } = params;
	return Object.keys(series).filter((seriesId) => {
		const yAxisId = series[seriesId].yAxisId;
		return yAxisId === axis.id || isDefaultAxis && yAxisId === void 0;
	}).reduce((acc, seriesId) => {
		const { area, stackedData, data } = series[seriesId];
		const isArea = area !== void 0;
		const filter = getFilters?.({
			currentAxisId: axis.id,
			isDefaultAxis,
			seriesXAxisId: series[seriesId].xAxisId,
			seriesYAxisId: series[seriesId].yAxisId
		});
		const [seriesMin, seriesMax] = getSeriesExtremums(isArea && axis.scaleType !== "log" && typeof series[seriesId].baseline !== "string" ? (d) => d : (d) => [d[1], d[1]], data, stackedData, filter);
		return [Math.min(seriesMin, acc[0]), Math.max(seriesMax, acc[1])];
	}, [Infinity, -Infinity]);
};
//#endregion
//#region node_modules/@mui/x-charts/esm/LineChart/seriesConfig/seriesProcessor.js
var lineValueFormatter = (v) => v == null ? "" : v.toLocaleString();
var seriesProcessor$2 = (params, dataset, isItemVisible) => {
	const { seriesOrder, series } = params;
	const stackingGroups = getStackingGroups(_extends({}, params, { defaultStrategy: { stackOffset: "none" } }));
	const d3Dataset = dataset ?? [];
	seriesOrder.forEach((id) => {
		const data = series[id].data;
		if (data !== void 0) data.forEach((value, index) => {
			if (d3Dataset.length <= index) d3Dataset.push({ [id]: value });
			else d3Dataset[index][id] = value;
		});
		else if (dataset === void 0 && true) throw new Error([`MUI X Charts: line series with id='${id}' has no data.`, "Either provide a data property to the series or use the dataset prop."].join("\n"));
		if (!data && dataset) {
			const dataKey = series[id].dataKey;
			if (!dataKey) throw new Error([`MUI X Charts: line series with id='${id}' has no data and no dataKey.`, "You must provide a dataKey when using the dataset prop."].join("\n"));
			dataset.forEach((entry, index) => {
				const value = entry[dataKey];
				if (value != null && typeof value !== "number") warnOnce([`MUI X Charts: your dataset key "${dataKey}" is used for plotting lines, but the dataset contains the non-null non-numerical element "${value}" at index ${index}.`, "Line plots only support numeric and null values."].join("\n"));
			});
		}
	});
	const completedSeries = {};
	stackingGroups.forEach((stackingGroup) => {
		const { ids, stackingOffset, stackingOrder } = stackingGroup;
		const keys = ids.map((id) => {
			const dataKey = series[id].dataKey;
			return series[id].data === void 0 && dataKey !== void 0 ? dataKey : id;
		});
		const stackedData = stack_default().keys(keys).value((d, key) => d[key] ?? 0).order(stackingOrder).offset(stackingOffset)(d3Dataset);
		const idOrder = stackedData.map((s) => s.index);
		const fixedOrder = () => idOrder;
		const visibleStackedData = stack_default().keys(keys).value((d, key) => {
			const seriesId = ids[keys.indexOf(key)];
			if (!isItemVisible?.({
				type: "line",
				seriesId
			})) return 0;
			return d[key] ?? 0;
		}).order(fixedOrder).offset(stackingOffset)(d3Dataset);
		ids.forEach((id, index) => {
			const dataKey = series[id].dataKey;
			const data = dataKey ? dataset.map((d) => {
				const value = d[dataKey];
				return typeof value === "number" ? value : null;
			}) : series[id].data;
			const hidden = !isItemVisible?.({
				type: "line",
				seriesId: id
			});
			completedSeries[id] = _extends({ labelMarkType: "line" }, series[id], {
				data,
				valueFormatter: series[id].valueFormatter ?? lineValueFormatter,
				hidden,
				stackedData: stackedData[index],
				visibleStackedData: visibleStackedData[index]
			});
		});
	});
	return {
		seriesOrder,
		stackingGroups,
		series: completedSeries
	};
};
//#endregion
//#region node_modules/@mui/x-charts/esm/LineChart/seriesConfig/getColor.js
var getColor$2 = (series, xAxis, yAxis) => {
	const yColorScale = yAxis?.colorScale;
	const xColorScale = xAxis?.colorScale;
	const getSeriesColor = getSeriesColorFn(series);
	if (yColorScale) return (dataIndex) => {
		if (dataIndex === void 0) return series.color;
		const value = series.data[dataIndex];
		const color = value === null ? getSeriesColor({
			value,
			dataIndex
		}) : yColorScale(value);
		if (color === null) return getSeriesColor({
			value,
			dataIndex
		});
		return color;
	};
	if (xColorScale) return (dataIndex) => {
		if (dataIndex === void 0) return series.color;
		const value = xAxis.data?.[dataIndex];
		const color = value === null ? getSeriesColor({
			value,
			dataIndex
		}) : xColorScale(value);
		if (color === null) return getSeriesColor({
			value,
			dataIndex
		});
		return color;
	};
	return (dataIndex) => {
		if (dataIndex === void 0) return series.color;
		const value = series.data[dataIndex];
		return getSeriesColor({
			value,
			dataIndex
		});
	};
};
//#endregion
//#region node_modules/@mui/x-charts/esm/LineChart/seriesConfig/legend.js
var legendGetter$2 = (params) => {
	const { seriesOrder, series } = params;
	return seriesOrder.reduce((acc, seriesId) => {
		const formattedLabel = getLabel(series[seriesId].label, "legend");
		if (formattedLabel === void 0) return acc;
		acc.push({
			type: "line",
			markType: series[seriesId].labelMarkType,
			id: seriesId,
			seriesId,
			color: series[seriesId].color,
			label: formattedLabel
		});
		return acc;
	}, []);
};
//#endregion
//#region node_modules/@mui/x-charts/esm/LineChart/seriesConfig/tooltip.js
var tooltipGetter$2 = (params) => {
	const { series, getColor, identifier } = params;
	if (!identifier || identifier.dataIndex === void 0) return null;
	const label = getLabel(series.label, "tooltip");
	const value = series.data[identifier.dataIndex];
	const formattedValue = series.valueFormatter(value, { dataIndex: identifier.dataIndex });
	return {
		identifier,
		color: getColor(identifier.dataIndex),
		label,
		value,
		formattedValue,
		markType: series.labelMarkType
	};
};
var axisTooltipGetter = (series) => {
	return Object.values(series).map((s) => ({
		direction: "x",
		axisId: s.xAxisId
	}));
};
//#endregion
//#region node_modules/@mui/x-charts/esm/LineChart/seriesConfig/getSeriesWithDefaultValues.js
var getSeriesWithDefaultValues$2 = (seriesData, seriesIndex, colors) => {
	return _extends({}, seriesData, {
		id: seriesData.id ?? `auto-generated-id-${seriesIndex}`,
		color: seriesData.color ?? colors[seriesIndex % colors.length]
	});
};
//#endregion
//#region node_modules/@mui/x-charts/esm/LineChart/seriesConfig/tooltipPosition.js
var tooltipItemPositionGetter$2 = (params) => {
	const { series, identifier, axesConfig } = params;
	if (!identifier || identifier.dataIndex === void 0) return null;
	const itemSeries = series.line?.series[identifier.seriesId];
	if (itemSeries == null) return null;
	if (axesConfig.x === void 0 || axesConfig.y === void 0) return null;
	const xValue = axesConfig.x.data?.[identifier.dataIndex];
	const yValue = itemSeries.data[identifier.dataIndex] == null ? null : itemSeries.visibleStackedData[identifier.dataIndex][1];
	if (xValue == null || yValue == null) return null;
	return {
		x: axesConfig.x.scale(xValue),
		y: axesConfig.y.scale(yValue)
	};
};
//#endregion
//#region node_modules/@mui/x-charts/esm/LineChart/seriesConfig/keyboardFocusHandler.js
var outSeriesTypes$2 = new Set([
	"bar",
	"line",
	"scatter"
]);
var keyboardFocusHandler$2 = (event) => {
	switch (event.key) {
		case "ArrowRight": return createGetNextIndexFocusedItem(outSeriesTypes$2);
		case "ArrowLeft": return createGetPreviousIndexFocusedItem(outSeriesTypes$2);
		case "ArrowDown": return createGetPreviousSeriesFocusedItem(outSeriesTypes$2);
		case "ArrowUp": return createGetNextSeriesFocusedItem(outSeriesTypes$2);
		default: return null;
	}
};
//#endregion
//#region node_modules/@mui/x-charts/esm/LineChart/seriesConfig/index.js
var lineSeriesConfig = {
	colorProcessor: getColor$2,
	seriesProcessor: seriesProcessor$2,
	legendGetter: legendGetter$2,
	tooltipGetter: tooltipGetter$2,
	tooltipItemPositionGetter: tooltipItemPositionGetter$2,
	axisTooltipGetter,
	xExtremumGetter: getExtremumX$1,
	yExtremumGetter: getExtremumY$1,
	getSeriesWithDefaultValues: getSeriesWithDefaultValues$2,
	keyboardFocusHandler: keyboardFocusHandler$2,
	identifierSerializer: identifierSerializerSeriesIdDataIndex
};
//#endregion
//#region node_modules/@mui/x-charts/esm/PieChart/seriesConfig/seriesProcessor.js
var getSortingComparator = (comparator = "none") => {
	if (typeof comparator === "function") return comparator;
	switch (comparator) {
		case "none": return null;
		case "desc": return (a, b) => b - a;
		case "asc": return (a, b) => a - b;
		default: return null;
	}
};
var seriesProcessor$1 = (params, dataset, isItemVisible) => {
	const { seriesOrder, series } = params;
	const defaultizedSeries = {};
	seriesOrder.forEach((seriesId) => {
		const visibleData = series[seriesId].data.filter((_, index) => {
			return isItemVisible?.({
				type: "pie",
				seriesId,
				dataIndex: index
			});
		});
		const visibleArcs = pie_default().startAngle(deg2rad(series[seriesId].startAngle ?? 0)).endAngle(deg2rad(series[seriesId].endAngle ?? 360)).padAngle(deg2rad(series[seriesId].paddingAngle ?? 0)).sortValues(getSortingComparator(series[seriesId].sortingValues ?? "none"))(visibleData.map((piePoint) => piePoint.value));
		let visibleIndex = 0;
		defaultizedSeries[seriesId] = _extends({
			labelMarkType: "circle",
			valueFormatter: (item) => item.value.toLocaleString()
		}, series[seriesId], { data: series[seriesId].data.map((item, index) => {
			const itemId = item.id ?? `auto-generated-pie-id-${seriesId}-${index}`;
			const isHidden = !isItemVisible?.({
				type: "pie",
				seriesId,
				dataIndex: index
			});
			let arcData;
			if (isHidden) {
				const startAngle = visibleIndex > 0 ? visibleArcs[visibleIndex - 1].endAngle : deg2rad(series[seriesId].startAngle ?? 0);
				arcData = {
					startAngle,
					endAngle: startAngle,
					padAngle: 0,
					value: item.value,
					index
				};
			} else {
				arcData = visibleArcs[visibleIndex];
				visibleIndex += 1;
			}
			const processedItem = _extends({}, item, {
				id: itemId,
				hidden: isHidden
			}, arcData);
			return _extends({ labelMarkType: "circle" }, processedItem, { formattedValue: series[seriesId].valueFormatter?.(_extends({}, processedItem, { label: getLabel(processedItem.label, "arc") }), { dataIndex: index }) ?? processedItem.value.toLocaleString() });
		}) });
	});
	return {
		seriesOrder,
		series: defaultizedSeries
	};
};
//#endregion
//#region node_modules/@mui/x-charts/esm/PieChart/seriesConfig/getColor.js
var getColor$1 = (series) => {
	return (dataIndex) => {
		return series.data[dataIndex].color;
	};
};
//#endregion
//#region node_modules/@mui/x-charts/esm/PieChart/seriesConfig/legend.js
var legendGetter$1 = (params) => {
	const { seriesOrder, series } = params;
	return seriesOrder.reduce((acc, seriesId) => {
		series[seriesId].data.forEach((item, dataIndex) => {
			const formattedLabel = getLabel(item.label, "legend");
			if (formattedLabel === void 0) return;
			const id = item.id ?? dataIndex;
			acc.push({
				type: "pie",
				markType: item.labelMarkType ?? series[seriesId].labelMarkType,
				seriesId,
				id,
				itemId: id,
				dataIndex,
				color: item.color,
				label: formattedLabel
			});
		});
		return acc;
	}, []);
};
//#endregion
//#region node_modules/@mui/x-charts/esm/PieChart/seriesConfig/tooltip.js
var tooltipGetter$1 = (params) => {
	const { series, getColor, identifier } = params;
	if (!identifier || identifier.dataIndex === void 0) return null;
	const point = series.data[identifier.dataIndex];
	if (point == null) return null;
	const label = getLabel(point.label, "tooltip");
	const value = _extends({}, point, { label });
	const formattedValue = series.valueFormatter(value, { dataIndex: identifier.dataIndex });
	return {
		identifier,
		color: getColor(identifier.dataIndex),
		label,
		value,
		formattedValue,
		markType: point.labelMarkType ?? series.labelMarkType
	};
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/getPercentageValue.js
/**
* Helper that converts values and percentages into values.
* @param value The value provided by the developer. Can either be a number or a string with '%' or 'px'.
* @param refValue The numerical value associated to 100%.
* @returns The numerical value associated to the provided value.
*/
function getPercentageValue(value, refValue) {
	if (typeof value === "number") return value;
	if (value === "100%") return refValue;
	if (value.endsWith("%")) {
		const percentage = Number.parseFloat(value.slice(0, value.length - 1));
		if (!Number.isNaN(percentage)) return percentage * refValue / 100;
	}
	if (value.endsWith("px")) {
		const val = Number.parseFloat(value.slice(0, value.length - 2));
		if (!Number.isNaN(val)) return val;
	}
	throw new Error(`MUI X Charts: Received an unknown value "${value}". It should be a number, or a string with a percentage value.`);
}
//#endregion
//#region node_modules/@mui/x-charts/esm/PieChart/getPieCoordinates.js
function getPieCoordinates(series, drawing) {
	const { height, width } = drawing;
	const { cx: cxParam, cy: cyParam } = series;
	const availableRadius = Math.min(width, height) / 2;
	return {
		cx: getPercentageValue(cxParam ?? "50%", width),
		cy: getPercentageValue(cyParam ?? "50%", height),
		availableRadius
	};
}
//#endregion
//#region node_modules/@mui/x-charts/esm/PieChart/seriesConfig/seriesLayout.js
var seriesLayout = (series, drawingArea) => {
	const seriesLayoutRecord = {};
	for (const seriesId of series.seriesOrder) {
		const { innerRadius, outerRadius, arcLabelRadius, cx: cxParam, cy: cyParam } = series.series[seriesId];
		const { cx, cy, availableRadius } = getPieCoordinates({
			cx: cxParam,
			cy: cyParam
		}, {
			width: drawingArea.width,
			height: drawingArea.height
		});
		const outer = getPercentageValue(outerRadius ?? availableRadius, availableRadius);
		const inner = getPercentageValue(innerRadius ?? 0, availableRadius);
		seriesLayoutRecord[seriesId] = {
			radius: {
				available: availableRadius,
				inner,
				outer,
				label: arcLabelRadius === void 0 ? (inner + outer) / 2 : getPercentageValue(arcLabelRadius, availableRadius)
			},
			center: {
				x: drawingArea.left + cx,
				y: drawingArea.top + cy
			}
		};
	}
	return seriesLayoutRecord;
};
//#endregion
//#region node_modules/@mui/x-charts/esm/PieChart/seriesConfig/getSeriesWithDefaultValues.js
var getSeriesWithDefaultValues$1 = (seriesData, seriesIndex, colors) => {
	return _extends({}, seriesData, {
		id: seriesData.id ?? `auto-generated-id-${seriesIndex}`,
		data: seriesData.data.map((d, index) => _extends({}, d, { color: d.color ?? colors[index % colors.length] }))
	});
};
//#endregion
//#region node_modules/@mui/x-charts/esm/PieChart/seriesConfig/tooltipPosition.js
var tooltipItemPositionGetter$1 = (params) => {
	const { series, identifier, placement, seriesLayout } = params;
	if (!identifier || identifier.dataIndex === void 0) return null;
	const itemSeries = series.pie?.series[identifier.seriesId];
	const layout = seriesLayout.pie?.[identifier.seriesId];
	if (itemSeries == null || layout == null) return null;
	const { center, radius } = layout;
	const { data } = itemSeries;
	const dataItem = data[identifier.dataIndex];
	if (!dataItem) return null;
	const points = [
		[radius.inner, dataItem.startAngle],
		[radius.inner, dataItem.endAngle],
		[radius.outer, dataItem.startAngle],
		[radius.outer, dataItem.endAngle]
	].map(([r, angle]) => ({
		x: center.x + r * Math.sin(angle),
		y: center.y - r * Math.cos(angle)
	}));
	const [x0, x1] = findMinMax(points.map((p) => p.x));
	const [y0, y1] = findMinMax(points.map((p) => p.y));
	switch (placement) {
		case "bottom": return {
			x: (x1 + x0) / 2,
			y: y1
		};
		case "left": return {
			x: x0,
			y: (y1 + y0) / 2
		};
		case "right": return {
			x: x1,
			y: (y1 + y0) / 2
		};
		default: return {
			x: (x1 + x0) / 2,
			y: y0
		};
	}
};
//#endregion
//#region node_modules/@mui/x-charts/esm/PieChart/seriesConfig/keyboardFocusHandler.js
var outSeriesTypes$1 = new Set(["pie"]);
var keyboardFocusHandler$1 = (event) => {
	switch (event.key) {
		case "ArrowRight": return createGetNextIndexFocusedItem(outSeriesTypes$1);
		case "ArrowLeft": return createGetPreviousIndexFocusedItem(outSeriesTypes$1);
		case "ArrowDown": return createGetPreviousSeriesFocusedItem(outSeriesTypes$1);
		case "ArrowUp": return createGetNextSeriesFocusedItem(outSeriesTypes$1);
		default: return null;
	}
};
//#endregion
//#region node_modules/@mui/x-charts/esm/PieChart/seriesConfig/index.js
var pieSeriesConfig = {
	colorProcessor: getColor$1,
	seriesProcessor: seriesProcessor$1,
	seriesLayout,
	legendGetter: legendGetter$1,
	tooltipGetter: tooltipGetter$1,
	tooltipItemPositionGetter: tooltipItemPositionGetter$1,
	getSeriesWithDefaultValues: getSeriesWithDefaultValues$1,
	keyboardFocusHandler: keyboardFocusHandler$1,
	identifierSerializer: identifierSerializerSeriesIdDataIndex
};
//#endregion
//#region node_modules/@mui/x-charts/esm/ScatterChart/seriesConfig/extremums.js
var getExtremumX = (params) => {
	const { series, axis, isDefaultAxis, getFilters } = params;
	let min = Infinity;
	let max = -Infinity;
	for (const seriesId in series) {
		if (!Object.hasOwn(series, seriesId)) continue;
		const axisId = series[seriesId].xAxisId;
		if (!(axisId === axis.id || axisId === void 0 && isDefaultAxis)) continue;
		const filter = getFilters?.({
			currentAxisId: axis.id,
			isDefaultAxis,
			seriesXAxisId: series[seriesId].xAxisId,
			seriesYAxisId: series[seriesId].yAxisId
		});
		const seriesData = series[seriesId].data ?? [];
		for (let i = 0; i < seriesData.length; i += 1) {
			const d = seriesData[i];
			if (filter && !filter(d, i)) continue;
			if (d.x !== null) {
				if (d.x < min) min = d.x;
				if (d.x > max) max = d.x;
			}
		}
	}
	return [min, max];
};
var getExtremumY = (params) => {
	const { series, axis, isDefaultAxis, getFilters } = params;
	let min = Infinity;
	let max = -Infinity;
	for (const seriesId in series) {
		if (!Object.hasOwn(series, seriesId)) continue;
		const axisId = series[seriesId].yAxisId;
		if (!(axisId === axis.id || axisId === void 0 && isDefaultAxis)) continue;
		const filter = getFilters?.({
			currentAxisId: axis.id,
			isDefaultAxis,
			seriesXAxisId: series[seriesId].xAxisId,
			seriesYAxisId: series[seriesId].yAxisId
		});
		const seriesData = series[seriesId].data ?? [];
		for (let i = 0; i < seriesData.length; i += 1) {
			const d = seriesData[i];
			if (filter && !filter(d, i)) continue;
			if (d.y !== null) {
				if (d.y < min) min = d.y;
				if (d.y > max) max = d.y;
			}
		}
	}
	return [min, max];
};
//#endregion
//#region node_modules/@mui/x-charts/esm/ScatterChart/seriesConfig/seriesProcessor.js
var seriesProcessor = ({ series, seriesOrder }, dataset, isItemVisible) => {
	return {
		series: Object.fromEntries(Object.entries(series).map(([seriesId, seriesData]) => {
			const datasetKeys = seriesData?.datasetKeys;
			const missingKeys = ["x", "y"].filter((key) => typeof datasetKeys?.[key] !== "string");
			if (seriesData?.datasetKeys && missingKeys.length > 0) throw new Error([`MUI X Charts: scatter series with id='${seriesId}' has incomplete datasetKeys.`, `Properties ${missingKeys.map((key) => `"${key}"`).join(", ")} are missing.`].join("\n"));
			const data = !datasetKeys ? seriesData.data ?? [] : dataset?.map((d) => {
				return {
					x: d[datasetKeys.x] ?? null,
					y: d[datasetKeys.y] ?? null,
					z: datasetKeys.z && d[datasetKeys.z],
					id: datasetKeys.id && d[datasetKeys.id]
				};
			}) ?? [];
			return [seriesId, _extends({
				labelMarkType: "circle",
				markerSize: 4
			}, seriesData, {
				preview: _extends({ markerSize: 1 }, seriesData?.preview),
				data,
				hidden: !isItemVisible?.({
					type: "scatter",
					seriesId
				}),
				valueFormatter: seriesData.valueFormatter ?? ((v) => v && `(${v.x}, ${v.y})`)
			})];
		})),
		seriesOrder
	};
};
//#endregion
//#region node_modules/@mui/x-charts/esm/ScatterChart/seriesConfig/getColor.js
var getColor = (series, xAxis, yAxis, zAxis) => {
	const zColorScale = zAxis?.colorScale;
	const yColorScale = yAxis?.colorScale;
	const xColorScale = xAxis?.colorScale;
	const getSeriesColor = getSeriesColorFn(series);
	if (zColorScale) return (dataIndex) => {
		if (dataIndex === void 0) return series.color;
		if (zAxis?.data?.[dataIndex] !== void 0) {
			const color = zColorScale(zAxis?.data?.[dataIndex]);
			if (color !== null) return color;
		}
		const value = series.data[dataIndex];
		const color = value === null ? getSeriesColor({
			value,
			dataIndex
		}) : zColorScale(value.z);
		if (color === null) return getSeriesColor({
			value,
			dataIndex
		});
		return color;
	};
	if (yColorScale) return (dataIndex) => {
		if (dataIndex === void 0) return series.color;
		const value = series.data[dataIndex];
		const color = value === null ? getSeriesColor({
			value,
			dataIndex
		}) : yColorScale(value.y);
		if (color === null) return getSeriesColor({
			value,
			dataIndex
		});
		return color;
	};
	if (xColorScale) return (dataIndex) => {
		if (dataIndex === void 0) return series.color;
		const value = series.data[dataIndex];
		const color = value === null ? getSeriesColor({
			value,
			dataIndex
		}) : xColorScale(value.x);
		if (color === null) return getSeriesColor({
			value,
			dataIndex
		});
		return color;
	};
	return (dataIndex) => {
		if (dataIndex === void 0) return series.color;
		const value = series.data[dataIndex];
		return getSeriesColor({
			value,
			dataIndex
		});
	};
};
//#endregion
//#region node_modules/@mui/x-charts/esm/ScatterChart/seriesConfig/legend.js
var legendGetter = (params) => {
	const { seriesOrder, series } = params;
	return seriesOrder.reduce((acc, seriesId) => {
		const formattedLabel = getLabel(series[seriesId].label, "legend");
		if (formattedLabel === void 0) return acc;
		acc.push({
			type: "scatter",
			markType: series[seriesId].labelMarkType,
			id: seriesId,
			seriesId,
			color: series[seriesId].color,
			label: formattedLabel
		});
		return acc;
	}, []);
};
//#endregion
//#region node_modules/@mui/x-charts/esm/ScatterChart/seriesConfig/tooltip.js
var tooltipGetter = (params) => {
	const { series, getColor, identifier } = params;
	if (!identifier || identifier.dataIndex === void 0) return null;
	const label = getLabel(series.label, "tooltip");
	const value = series.data[identifier.dataIndex];
	const formattedValue = series.valueFormatter(value, { dataIndex: identifier.dataIndex });
	return {
		identifier,
		color: getColor(identifier.dataIndex),
		label,
		value,
		formattedValue,
		markType: series.labelMarkType
	};
};
//#endregion
//#region node_modules/@mui/x-charts/esm/ScatterChart/seriesConfig/getSeriesWithDefaultValues.js
var getSeriesWithDefaultValues = (seriesData, seriesIndex, colors) => {
	return _extends({}, seriesData, {
		id: seriesData.id ?? `auto-generated-id-${seriesIndex}`,
		color: seriesData.color ?? colors[seriesIndex % colors.length]
	});
};
//#endregion
//#region node_modules/@mui/x-charts/esm/ScatterChart/seriesConfig/tooltipPosition.js
var tooltipItemPositionGetter = (params) => {
	const { series, identifier, axesConfig } = params;
	if (!identifier || identifier.dataIndex === void 0) return null;
	const itemSeries = series.scatter?.series[identifier.seriesId];
	if (itemSeries == null) return null;
	if (axesConfig.x === void 0 || axesConfig.y === void 0) return null;
	const xValue = itemSeries.data?.[identifier.dataIndex].x;
	const yValue = itemSeries.data?.[identifier.dataIndex].y;
	if (xValue == null || yValue == null) return null;
	return {
		x: axesConfig.x.scale(xValue),
		y: axesConfig.y.scale(yValue)
	};
};
//#endregion
//#region node_modules/@mui/x-charts/esm/ScatterChart/seriesConfig/keyboardFocusHandler.js
var outSeriesTypes = new Set([
	"bar",
	"line",
	"scatter"
]);
var keyboardFocusHandler = (event) => {
	switch (event.key) {
		case "ArrowRight": return createGetNextIndexFocusedItem(outSeriesTypes);
		case "ArrowLeft": return createGetPreviousIndexFocusedItem(outSeriesTypes);
		case "ArrowDown": return createGetPreviousSeriesFocusedItem(outSeriesTypes);
		case "ArrowUp": return createGetNextSeriesFocusedItem(outSeriesTypes);
		default: return null;
	}
};
//#endregion
//#region node_modules/@mui/x-charts/esm/ScatterChart/seriesConfig/index.js
var scatterSeriesConfig = {
	seriesProcessor,
	colorProcessor: getColor,
	legendGetter,
	tooltipGetter,
	tooltipItemPositionGetter,
	xExtremumGetter: getExtremumX,
	yExtremumGetter: getExtremumY,
	getSeriesWithDefaultValues,
	keyboardFocusHandler,
	identifierSerializer: identifierSerializerSeriesIdDataIndex
};
//#endregion
//#region node_modules/@mui/x-charts/esm/context/ChartsProvider/ChartsProvider.js
var import_jsx_runtime = require_jsx_runtime();
var defaultSeriesConfig = {
	bar: barSeriesConfig,
	scatter: scatterSeriesConfig,
	line: lineSeriesConfig,
	pie: pieSeriesConfig
};
var defaultPlugins = [
	useChartZAxis,
	useChartTooltip,
	useChartInteraction,
	useChartCartesianAxis,
	useChartHighlight
];
function ChartsProvider(props) {
	const { children, plugins = defaultPlugins, pluginParams = {}, seriesConfig = defaultSeriesConfig } = props;
	const { contextValue } = useCharts(plugins, pluginParams, seriesConfig);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsContext.Provider, {
		value: contextValue,
		children
	});
}
//#endregion
//#region node_modules/@mui/x-charts/esm/context/ChartsProvider/useChartsContext.js
var useChartsContext = () => {
	const context = import_react.useContext(ChartsContext);
	if (context == null) throw new Error("MUI X Charts: Could not find the Charts context. This happens when the component is rendered outside of a ChartsDataProvider or ChartsContainer parent component, which means the required context is not available. Wrap your component in a ChartsDataProvider or ChartsContainer. This can also happen if you are bundling multiple versions of the library.");
	return context;
};
//#endregion
//#region node_modules/@mui/x-charts/esm/context/ChartProvider/useChartContext.js
/**
* @deprecated Use `useChartsContext` instead. We added S to the charts prefix to align with other components.
*/
var useChartContext = useChartsContext;
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/store/useStore.js
function useStore() {
	const context = useChartContext();
	if (!context) throw new Error("MUI X Charts: Could not find the Charts context. This happens when the component is rendered outside of a ChartsContainer parent component. Wrap your component in a ChartsContainer or ChartsDataProvider.");
	return context.store;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/hooks/useSeries.js
/**
* Get access to the internal state of series.
* Structured by type of series:
* { seriesType?: { series: { id1: precessedValue, ... }, seriesOrder: [id1, ...] } }
* @returns FormattedSeries series
*/
function useSeries() {
	return useStore().use(selectorChartSeriesProcessed);
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartPolarAxis/coordinateTransformation.js
var generateSvg2rotation = (center) => (x, y) => Math.atan2(x - center.cx, center.cy - y);
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/clampAngle.js
/**
* Clamp angle to [0, 360[.
*/
function clampAngle(angle) {
	return (angle % 360 + 360) % 360;
}
var TWO_PI = 2 * Math.PI;
/** Clamp angle to [0, 2 * Math.PI[. */
function clampAngleRad(angle) {
	return (angle % TWO_PI + TWO_PI) % TWO_PI;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartPolarAxis/getAxisIndex.js
/**
* For a pointer coordinate, this function returns the value and dataIndex associated.
* Returns `-1` if the coordinate does not match a value.
*/
function getAxisIndex(axisConfig, pointerValue) {
	const { scale, data: axisData, reverse } = axisConfig;
	if (!isOrdinalScale(scale)) throw new Error("MUI X Charts: getAxisValue is not implemented for polare continuous axes.");
	if (!axisData) return -1;
	const angleGap = clampAngleRad(pointerValue - Math.min(...scale.range()));
	const dataIndex = scale.bandwidth() === 0 ? Math.floor((angleGap + scale.step() / 2) / scale.step()) % axisData.length : Math.floor(angleGap / scale.step());
	if (dataIndex < 0 || dataIndex >= axisData.length) return -1;
	return reverse ? axisData.length - 1 - dataIndex : dataIndex;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/hooks/useAxis.js
/**
* Get all the x-axes.
*
* Returns all X axes configured in the chart along with their IDs.
* This is useful when you need to iterate over multiple axes or access all axis configurations at once.
*
* @returns An object containing:
*   - `xAxis`: An object mapping axis IDs to their configurations `{ [axisId]: axis }`
*   - `xAxisIds`: An array of all X axis IDs in the chart
*
* @example
* const { xAxis, xAxisIds } = useXAxes();
*
* @see `useXAxis` for accessing a single X axis
*/
function useXAxes() {
	const { axis: xAxis, axisIds: xAxisIds } = useStore().use(selectorChartXAxis);
	return {
		xAxis,
		xAxisIds
	};
}
/**
* Get all the y-axes.
*
* Returns all Y axes configured in the chart along with their IDs.
* This is useful when you need to iterate over multiple axes or access all axis configurations at once.
*
* @returns An object containing:
*   - `yAxis`: An object mapping axis IDs to their configurations `{ [axisId]: axis }`
*   - `yAxisIds`: An array of all Y axis IDs in the chart
*
* @example
* const { yAxis, yAxisIds } = useYAxes();
*
* @see `useYAxis` for accessing a single Y axis
*/
function useYAxes() {
	const { axis: yAxis, axisIds: yAxisIds } = useStore().use(selectorChartYAxis);
	return {
		yAxis,
		yAxisIds
	};
}
/**
* Get a specific X axis or the default X axis.
*
* @param {AxisId} [axisId] - The axis identifier. Can be:
*   - A string or number matching the axis ID defined in the chart's `xAxis` prop
*   - Undefined to get the default (first) X axis
* @returns The configuration for a single X axis.
*
* @example
* // Get the default X axis
* const xAxis = useXAxis();
*
* @example
* // Get a specific X axis by string ID
* const xAxis = useXAxis('revenue');
*/
function useXAxis(axisId) {
	const { axis: xAxis, axisIds: xAxisIds } = useStore().use(selectorChartXAxis);
	return xAxis[axisId ?? xAxisIds[0]];
}
/**
* Get a specific Y axis or the default Y axis.
*
* @param {AxisId} [axisId] - The axis identifier. Can be:
*   - A string or number matching the axis ID defined in the chart's `yAxis` prop
*   - Undefined to get the default (first) Y axis
* @returns The configuration for a single Y axis.
*
* @example
* // Get the default Y axis
* const yAxis = useYAxis();
*
* @example
* // Get a specific Y axis by string ID
* const yAxis = useYAxis('temperature');
*/
function useYAxis(axisId) {
	const { axis: yAxis, axisIds: yAxisIds } = useStore().use(selectorChartYAxis);
	return yAxis[axisId ?? yAxisIds[0]];
}
/**
* Get all the rotation axes for polar charts.
*
* Returns all rotation axes configured in polar charts along with their IDs.
* Rotation axes are used in charts like `RadarChart` to define angular positioning.
*
* @returns An object containing:
*   - `rotationAxis`: An object mapping axis IDs to their configurations `{ [axisId]: axis }`
*   - `rotationAxisIds`: An array of all rotation axis IDs in the chart
*
* @example
* const { rotationAxis, rotationAxisIds } = useRotationAxes();
*
* @see `useRotationAxis` for accessing a single rotation axis
*/
function useRotationAxes() {
	const { axis: rotationAxis, axisIds: rotationAxisIds } = useStore().use(selectorChartRotationAxis);
	return {
		rotationAxis,
		rotationAxisIds
	};
}
/**
* Get a specific rotation axis or the default rotation axis for polar charts.
*
* Returns the configuration and scale for a rotation axis in polar charts.
* The rotation axis controls the angular positioning of data points around the circle.
*
* @param {AxisId} [axisId] - The axis identifier. Can be:
*   - A string or number matching the axis ID defined in the chart's rotation axis configuration
*   - Undefined to get the default (first) rotation axis
* @returns The rotation axis configuration, or undefined if not found
*
* @example
* // Get the default rotation axis
* const rotationAxis = useRotationAxis();
*
* @example
* // Get a specific rotation axis by string ID
* const rotationAxis = useRotationAxis('categories');
*/
function useRotationAxis(axisId) {
	const { axis: rotationAxis, axisIds: rotationAxisIds } = useStore().use(selectorChartRotationAxis);
	return rotationAxis[axisId ?? rotationAxisIds[0]];
}
//#endregion
//#region node_modules/@mui/x-charts/esm/hooks/useZAxis.js
function useZAxes() {
	const { axis: zAxis, axisIds: zAxisIds } = useStore().use(selectorChartZAxis) ?? {
		axis: {},
		axisIds: []
	};
	return {
		zAxis,
		zAxisIds
	};
}
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsTooltip/useItemTooltip.js
function useInternalItemTooltip() {
	const store = useStore();
	const identifier = store.use(selectorChartsTooltipItem);
	const seriesConfig = store.use(selectorChartSeriesConfig);
	const series = useSeries();
	const { xAxis, xAxisIds } = useXAxes();
	const { yAxis, yAxisIds } = useYAxes();
	const { zAxis, zAxisIds } = useZAxes();
	const { rotationAxis, rotationAxisIds } = useRotationAxes();
	if (!identifier) return null;
	const itemSeries = series[identifier.type]?.series[identifier.seriesId];
	if (!itemSeries) return null;
	const xAxisId = isCartesianSeries(itemSeries) ? itemSeries.xAxisId ?? xAxisIds[0] : void 0;
	const yAxisId = isCartesianSeries(itemSeries) ? itemSeries.yAxisId ?? yAxisIds[0] : void 0;
	const zAxisId = "zAxisId" in itemSeries ? itemSeries.zAxisId ?? zAxisIds[0] : zAxisIds[0];
	const rotationAxisId = rotationAxisIds[0];
	const getColor = seriesConfig[itemSeries.type].colorProcessor?.(itemSeries, xAxisId !== void 0 ? xAxis[xAxisId] : void 0, yAxisId !== void 0 ? yAxis[yAxisId] : void 0, zAxisId !== void 0 ? zAxis[zAxisId] : void 0) ?? (() => "");
	const axesConfig = {};
	if (xAxisId !== void 0) axesConfig.x = xAxis[xAxisId];
	if (yAxisId !== void 0) axesConfig.y = yAxis[yAxisId];
	if (rotationAxisId !== void 0) axesConfig.rotation = rotationAxis[rotationAxisId];
	return seriesConfig[itemSeries.type].tooltipGetter({
		series: itemSeries,
		axesConfig,
		getColor,
		identifier
	});
}
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsTooltip/ChartsTooltipTable.js
/**
* @ignore - internal component.
*/
var ChartsTooltipPaper = styled("div", {
	name: "MuiChartsTooltip",
	slot: "Container",
	overridesResolver: (props, styles) => styles.paper
})(({ theme }) => ({
	backgroundColor: (theme.vars || theme).palette.background.paper,
	color: (theme.vars || theme).palette.text.primary,
	borderRadius: (theme.vars || theme).shape?.borderRadius,
	border: `solid ${(theme.vars || theme).palette.divider} 1px`
}));
/**
* @ignore - internal component.
*/
var ChartsTooltipTable = styled("table", {
	name: "MuiChartsTooltip",
	slot: "Table"
})(({ theme }) => ({
	borderSpacing: 0,
	[`& .${chartsTooltipClasses.markContainer}`]: {
		display: "inline-block",
		width: `calc(20px + ${theme.spacing(1.5)})`,
		verticalAlign: "middle"
	},
	"& caption": {
		borderBottom: `solid ${(theme.vars || theme).palette.divider} 1px`,
		padding: theme.spacing(.5, 1.5),
		textAlign: "start",
		whiteSpace: "nowrap",
		"& span": { marginRight: theme.spacing(1.5) }
	}
}));
/**
* @ignore - internal component.
*/
var ChartsTooltipRow = styled("tr", {
	name: "MuiChartsTooltip",
	slot: "Row"
})(({ theme }) => ({
	"tr:first-of-type& td": { paddingTop: theme.spacing(.5) },
	"tr:last-of-type& td": { paddingBottom: theme.spacing(.5) }
}));
/**
* @ignore - internal component.
*/
var ChartsTooltipCell = styled(Typography, {
	name: "MuiChartsTooltip",
	slot: "Cell"
})(({ theme }) => ({
	verticalAlign: "middle",
	color: (theme.vars || theme).palette.text.secondary,
	textAlign: "start",
	[`&.${chartsTooltipClasses.cell}`]: {
		paddingLeft: theme.spacing(1),
		paddingRight: theme.spacing(1)
	},
	[`&.${chartsTooltipClasses.labelCell}`]: {
		whiteSpace: "nowrap",
		fontWeight: theme.typography.fontWeightRegular
	},
	[`&.${chartsTooltipClasses.valueCell}, &.${chartsTooltipClasses.axisValueCell}`]: {
		color: (theme.vars || theme).palette.text.primary,
		fontWeight: theme.typography.fontWeightMedium
	},
	[`&.${chartsTooltipClasses.valueCell}`]: {
		paddingLeft: theme.spacing(1.5),
		paddingRight: theme.spacing(1.5)
	},
	"td:first-of-type&, th:first-of-type&": { paddingLeft: theme.spacing(1.5) },
	"td:last-of-type&, th:last-of-type&": { paddingRight: theme.spacing(1.5) }
}));
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsLabel/labelMarkClasses.js
function getLabelMarkUtilityClass(slot) {
	return generateUtilityClass("MuiChartsLabelMark", slot);
}
var labelMarkClasses = generateUtilityClasses("MuiChartsLabelMark", [
	"root",
	"line",
	"square",
	"circle",
	"mask",
	"fill"
]);
var useUtilityClasses$3 = (props) => {
	const { type } = props;
	return composeClasses({
		root: typeof type === "function" ? ["root"] : ["root", type],
		mask: ["mask"],
		fill: ["fill"]
	}, getLabelMarkUtilityClass, props.classes);
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/consumeThemeProps.js
/**
* A higher order component that consumes and merges the theme `defaultProps` and handles the `classes` and renders the component.
*
* This HOC will wrap a single component.
* If you need to render multiple components, you can manually consume the theme and render them in your component instead of using this HOC.
*
* In the example below, `MyComponent` will render the `DefaultComponent` with the `direction` prop set to `'row'` and the className set to `'my-custom-root'`.
*
* @example
* ```tsx
* createTheme({
*   components: {
*     MuiMyComponent: {
*       defaultProps: {
*         direction: 'row',
*       },
*     },
*   },
* })
*
* type MyComponentProps = {
*   direction: 'row' | 'column';
*   classes?: Record<'root', string>;
* };
*
* const MyComponent = consumeThemeProps(
*   'MuiMyComponent',
*   function DefaultComponent(props: MyComponentProps) {
*     return (
*       <div className={props.classes.root}>
*         {props.direction}
*       </div>
*     );
*   }
* );
*
* render(<MyComponent classes={{ root: 'my-custom-root' }} />);
* ```
*
* @param {string} name The mui component name.
* @param {object} options Options for the HOC.
* @param {Record<string, any>} options.defaultProps A set of defaults for the component, will be deep merged with the props.
* @param {Function} options.classesResolver A function that returns the classes for the component. It receives the props, after theme props and defaults have been applied. And the theme object as the second argument.
* @param InComponent The component to render if the slot is not provided.
*/
var consumeThemeProps = (name, options, InComponent) => /* @__PURE__ */ import_react.forwardRef(function ConsumeThemeInternal(props, ref) {
	const themedProps = useThemeProps({
		props,
		name
	});
	const outProps = resolveProps(typeof options.defaultProps === "function" ? options.defaultProps(themedProps) : options.defaultProps ?? {}, themedProps);
	const theme = useTheme$1();
	const classes = options.classesResolver?.(outProps, theme);
	const OutComponent = /* @__PURE__ */ import_react.forwardRef(InComponent);
	OutComponent.displayName = "OutComponent";
	OutComponent.displayName = `consumeThemeProps(${name})`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OutComponent, _extends({}, outProps, {
		classes,
		ref
	}));
});
consumeThemeProps.displayName = "consumeThemeProps";
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsLabel/ChartsLabelMark.js
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
var _excluded$10 = [
	"type",
	"color",
	"className",
	"classes"
];
var Root$1 = styled("div", {
	name: "MuiChartsLabelMark",
	slot: "Root"
})(() => {
	return {
		display: "flex",
		width: 14,
		height: 14,
		[`&.${labelMarkClasses.line}`]: {
			width: 16,
			height: "unset",
			alignItems: "center",
			[`.${labelMarkClasses.mask}`]: {
				height: 4,
				width: "100%",
				borderRadius: 1,
				overflow: "hidden"
			}
		},
		[`&.${labelMarkClasses.square}`]: {
			height: 13,
			width: 13,
			borderRadius: 2,
			overflow: "hidden"
		},
		[`&.${labelMarkClasses.circle}`]: {
			height: 15,
			width: 15
		},
		svg: { display: "block" },
		[`& .${labelMarkClasses.mask} > *`]: {
			height: "100%",
			width: "100%"
		},
		[`& .${labelMarkClasses.mask}`]: {
			height: "100%",
			width: "100%"
		}
	};
});
/**
* Generates the label mark for the tooltip and legend.
* @ignore - internal component.
*/
var ChartsLabelMark = consumeThemeProps("MuiChartsLabelMark", {
	defaultProps: { type: "square" },
	classesResolver: useUtilityClasses$3
}, function ChartsLabelMark(props, ref) {
	const { type, color, className, classes } = props, other = _objectWithoutPropertiesLoose(props, _excluded$10);
	const Component = type;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root$1, _extends({
		className: clsx(classes?.root, className),
		ownerState: props,
		"aria-hidden": "true",
		ref
	}, other, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: classes?.mask,
		children: typeof Component === "function" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Component, {
			className: classes?.fill,
			color
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			viewBox: "0 0 24 24",
			preserveAspectRatio: type === "line" ? "none" : void 0,
			children: type === "circle" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				className: classes?.fill,
				r: "12",
				cx: "12",
				cy: "12",
				fill: color
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				className: classes?.fill,
				width: "24",
				height: "24",
				fill: color
			})
		})
	}) }));
});
ChartsLabelMark.propTypes = {
	classes: import_prop_types.default.object,
	color: import_prop_types.default.string,
	type: import_prop_types.default.oneOf([
		"circle",
		"line",
		"square"
	])
};
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsTooltip/ChartsItemTooltipContent.js
function ChartsItemTooltipContent(props) {
	const { classes: propClasses, sx } = props;
	const tooltipData = useInternalItemTooltip();
	const classes = useUtilityClasses$4(propClasses);
	if (!tooltipData) return null;
	if ("values" in tooltipData) {
		const { label: seriesLabel, color, markType } = tooltipData;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsTooltipPaper, {
			sx,
			className: classes.paper,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ChartsTooltipTable, {
				className: classes.table,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Typography, {
					component: "caption",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: classes.markContainer,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsLabelMark, {
							type: markType,
							color,
							className: classes.mark
						})
					}), seriesLabel]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: tooltipData.values.map(({ formattedValue, label }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ChartsTooltipRow, {
					className: classes.row,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsTooltipCell, {
						className: clsx(classes.labelCell, classes.cell),
						component: "th",
						children: label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsTooltipCell, {
						className: clsx(classes.valueCell, classes.cell),
						component: "td",
						children: formattedValue
					})]
				}, label)) })]
			})
		});
	}
	const { color, label, formattedValue, markType } = tooltipData;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsTooltipPaper, {
		sx,
		className: classes.paper,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsTooltipTable, {
			className: classes.table,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ChartsTooltipRow, {
				className: classes.row,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ChartsTooltipCell, {
					className: clsx(classes.labelCell, classes.cell),
					component: "th",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: classes.markContainer,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsLabelMark, {
							type: markType,
							color,
							className: classes.mark
						})
					}), label]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsTooltipCell, {
					className: clsx(classes.valueCell, classes.cell),
					component: "td",
					children: formattedValue
				})]
			}) })
		})
	});
}
ChartsItemTooltipContent.propTypes = {
	classes: import_prop_types.default.object,
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
//#region node_modules/@mui/x-charts/esm/internals/plugins/corePlugins/useChartSeries/useColorProcessor.js
function useColorProcessor(seriesType) {
	const seriesConfig = useStore().use(selectorChartSeriesConfig);
	const colorProcessors = import_react.useMemo(() => {
		const rep = {};
		Object.keys(seriesConfig).forEach((seriesT) => {
			rep[seriesT] = seriesConfig[seriesT].colorProcessor;
		});
		return rep;
	}, [seriesConfig]);
	if (!seriesType) return colorProcessors;
	return colorProcessors[seriesType];
}
//#endregion
//#region node_modules/@mui/material/esm/useMediaQuery/index.js
var useMediaQuery = unstable_createUseMediaQuery({ themeId: identifier_default });
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsTooltip/utils.js
function utcFormatter(v) {
	if (v instanceof Date) return v.toUTCString();
	return v.toLocaleString();
}
var mainPointerFineMediaQuery = "@media (pointer: fine)";
/**
* Returns true if the main pointer is fine (e.g. mouse).
* This is useful for determining how to position tooltips or other UI elements based on the type of input device.
* @returns true if the main pointer is fine, false otherwise.
*/
var useIsFineMainPointer = () => {
	return useMediaQuery(mainPointerFineMediaQuery, { defaultMatches: true });
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartPolarAxis/useChartPolarInteraction.selectors.js
var optionalGetAxisId = (_, id) => id;
var optionalGetAxisIds = (_, ids) => ids;
/**
* Get interaction indexes
*/
function indexGetter(value, axes, ids) {
	return Array.isArray(ids) ? ids.map((id) => getAxisIndex(axes.axis[id], value)) : getAxisIndex(axes.axis[ids], value);
}
/**
* Helper to get the rotation associated to the interaction coordinate.
*/
var selectorChartsInteractionRotationAngle = createSelector(selectorChartsInteractionPointerX, selectorChartsInteractionPointerY, selectorChartPolarCenter, (x, y, center) => {
	if (x === null || y === null) return null;
	return generateSvg2rotation(center)(x, y);
});
var selectorChartsInteractionRotationAxisIndex = createSelector(selectorChartsInteractionRotationAngle, selectorChartRotationAxis, optionalGetAxisId, (rotation, rotationAxis, id = rotationAxis.axisIds[0]) => rotation === null ? null : indexGetter(rotation, rotationAxis, id));
var selectorChartsInteractionRotationAxisIndexes = createSelector(selectorChartsInteractionRotationAngle, selectorChartRotationAxis, optionalGetAxisIds, (rotation, rotationAxis, ids = rotationAxis.axisIds) => rotation === null ? null : indexGetter(rotation, rotationAxis, ids));
createSelector(selectorChartRotationAxis, selectorChartsInteractionRotationAxisIndex, optionalGetAxisId, (rotationAxis, rotationIndex, id = rotationAxis.axisIds[0]) => {
	if (rotationIndex === null || rotationIndex === -1 || rotationAxis.axisIds.length === 0) return null;
	const data = rotationAxis.axis[id]?.data;
	if (!data) return null;
	return data[rotationIndex];
});
createSelector(selectorChartRotationAxis, selectorChartsInteractionRotationAxisIndexes, optionalGetAxisIds, (rotationAxis, rotationIndexes, ids = rotationAxis.axisIds) => {
	if (rotationIndexes === null) return null;
	return ids.map((id, axisIndex) => {
		const rotationIndex = rotationIndexes[axisIndex];
		if (rotationIndex === -1) return null;
		return rotationAxis.axis[id].data?.[rotationIndex];
	});
});
/**
* Get rotation-axis ids and corresponding data index that should be display in the tooltip.
*/
var selectorChartsInteractionTooltipRotationAxes = createSelectorMemoizedWithOptions({ memoizeOptions: { resultEqualityCheck: isDeepEqual } })(selectorChartsInteractionRotationAxisIndexes, selectorChartRotationAxis, (indexes, axes) => {
	if (indexes === null) return [];
	return axes.axisIds.map((axisId, axisIndex) => ({
		axisId,
		dataIndex: indexes[axisIndex]
	})).filter(({ axisId, dataIndex }) => axes.axis[axisId].triggerTooltip && dataIndex >= 0);
});
/**
* Return `true` if the axis tooltip has something to display.
*/
var selectorChartsInteractionPolarAxisTooltip = createSelector(selectorChartsInteractionTooltipRotationAxes, (rotationTooltip) => rotationTooltip.length > 0);
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsTooltip/useAxisTooltip.js
function defaultAxisTooltipConfig(axis, dataIndex, axisDirection) {
	const axisValue = axis.data?.[dataIndex] ?? null;
	const axisFormattedValue = (axis.valueFormatter ?? ((v) => axis.scaleType === "utc" ? utcFormatter(v) : v.toLocaleString()))(axisValue, {
		location: "tooltip",
		scale: axis.scale
	});
	return {
		axisDirection,
		axisId: axis.id,
		mainAxis: axis,
		dataIndex,
		axisValue,
		axisFormattedValue,
		seriesItems: []
	};
}
/**
* @deprecated Use `useAxesTooltip` instead.
*/
function useAxisTooltip(params = {}) {
	const { multipleAxes, directions } = params;
	const defaultXAxis = useXAxis();
	const defaultYAxis = useYAxis();
	const defaultRotationAxis = useRotationAxis();
	const store = useStore();
	const tooltipXAxes = store.use(selectorChartsInteractionTooltipXAxes);
	const tooltipYAxes = store.use(selectorChartsInteractionTooltipYAxes);
	const tooltipRotationAxes = store.use(selectorChartsInteractionTooltipRotationAxes);
	const series = useSeries();
	const { xAxis } = useXAxes();
	const { yAxis } = useYAxes();
	const { zAxis, zAxisIds } = useZAxes();
	const { rotationAxis } = useRotationAxes();
	const colorProcessors = useColorProcessor();
	if (tooltipXAxes.length === 0 && tooltipYAxes.length === 0 && tooltipRotationAxes.length === 0) return null;
	const tooltipAxes = [];
	if (directions === void 0 || directions.includes("x")) tooltipXAxes.forEach(({ axisId, dataIndex }) => {
		if (!multipleAxes && tooltipAxes.length > 1) return;
		tooltipAxes.push(defaultAxisTooltipConfig(xAxis[axisId], dataIndex, "x"));
	});
	if (directions === void 0 || directions.includes("y")) tooltipYAxes.forEach(({ axisId, dataIndex }) => {
		if (!multipleAxes && tooltipAxes.length > 1) return;
		tooltipAxes.push(defaultAxisTooltipConfig(yAxis[axisId], dataIndex, "y"));
	});
	if (directions === void 0 || directions.includes("rotation")) tooltipRotationAxes.forEach(({ axisId, dataIndex }) => {
		if (!multipleAxes && tooltipAxes.length > 1) return;
		tooltipAxes.push(defaultAxisTooltipConfig(rotationAxis[axisId], dataIndex, "rotation"));
	});
	Object.keys(series).filter(isCartesianSeriesType).forEach((seriesType) => {
		const seriesOfType = series[seriesType];
		if (!seriesOfType) return [];
		return seriesOfType.seriesOrder.forEach((seriesId) => {
			const seriesToAdd = seriesOfType.series[seriesId];
			const providedXAxisId = seriesToAdd.xAxisId ?? defaultXAxis.id;
			const providedYAxisId = seriesToAdd.yAxisId ?? defaultYAxis.id;
			const tooltipItemIndex = tooltipAxes.findIndex(({ axisDirection, axisId }) => axisDirection === "x" && axisId === providedXAxisId || axisDirection === "y" && axisId === providedYAxisId);
			if (tooltipItemIndex >= 0) {
				const zAxisId = "zAxisId" in seriesToAdd ? seriesToAdd.zAxisId : zAxisIds[0];
				const { dataIndex } = tooltipAxes[tooltipItemIndex];
				const color = colorProcessors[seriesType]?.(seriesToAdd, xAxis[providedXAxisId], yAxis[providedYAxisId], zAxisId ? zAxis[zAxisId] : void 0)(dataIndex) ?? "";
				const value = seriesToAdd.data[dataIndex] ?? null;
				const formattedValue = seriesToAdd.valueFormatter(value, { dataIndex });
				const formattedLabel = getLabel(seriesToAdd.label, "tooltip") ?? null;
				tooltipAxes[tooltipItemIndex].seriesItems.push({
					seriesId,
					color,
					value,
					formattedValue,
					formattedLabel,
					markType: seriesToAdd.labelMarkType
				});
			}
		});
	});
	Object.keys(series).filter(isPolarSeriesType).forEach((seriesType) => {
		const seriesOfType = series[seriesType];
		if (!seriesOfType) return [];
		return seriesOfType.seriesOrder.forEach((seriesId) => {
			const seriesToAdd = seriesOfType.series[seriesId];
			const providedRotationAxisId = seriesToAdd.rotationAxisId ?? defaultRotationAxis?.id;
			const tooltipItemIndex = tooltipAxes.findIndex(({ axisDirection, axisId }) => axisDirection === "rotation" && axisId === providedRotationAxisId);
			if (tooltipItemIndex >= 0) {
				const { dataIndex } = tooltipAxes[tooltipItemIndex];
				const color = colorProcessors[seriesType]?.(seriesToAdd)(dataIndex) ?? "";
				const value = seriesToAdd.data[dataIndex] ?? null;
				const formattedValue = seriesToAdd.valueFormatter(value, { dataIndex });
				const formattedLabel = getLabel(seriesToAdd.label, "tooltip") ?? null;
				tooltipAxes[tooltipItemIndex].seriesItems.push({
					seriesId,
					color,
					value,
					formattedValue,
					formattedLabel,
					markType: seriesToAdd.labelMarkType
				});
			}
		});
	});
	if (!multipleAxes) return tooltipAxes.length === 0 ? tooltipAxes[0] : null;
	return tooltipAxes;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsTooltip/useAxesTooltip.js
/**
* Returns the axes to display in the tooltip and the series item related to them.
*/
function useAxesTooltip(params) {
	return useAxisTooltip(_extends({}, params, { multipleAxes: true }));
}
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsTooltip/ChartsAxisTooltipContent.js
function ChartsAxisTooltipContent(props) {
	const classes = useUtilityClasses$4(props.classes);
	const tooltipData = useAxesTooltip();
	if (tooltipData === null) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsTooltipPaper, {
		sx: props.sx,
		className: classes.paper,
		children: tooltipData.map(({ axisId, mainAxis, axisValue, axisFormattedValue, seriesItems }) => {
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ChartsTooltipTable, {
				className: classes.table,
				children: [axisValue != null && !mainAxis.hideTooltip && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
					component: "caption",
					children: axisFormattedValue
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: seriesItems.map(({ seriesId, color, formattedValue, formattedLabel, markType }) => {
					if (formattedValue == null) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ChartsTooltipRow, {
						className: classes.row,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ChartsTooltipCell, {
							className: clsx(classes.labelCell, classes.cell),
							component: "th",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: classes.markContainer,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsLabelMark, {
									type: markType,
									color,
									className: classes.mark
								})
							}), formattedLabel || null]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsTooltipCell, {
							className: clsx(classes.valueCell, classes.cell),
							component: "td",
							children: formattedValue
						})]
					}, seriesId);
				}) })]
			}, axisId);
		})
	});
}
ChartsAxisTooltipContent.propTypes = {
	classes: import_prop_types.default.object,
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
//#region node_modules/@mui/material/esm/NoSsr/NoSsr.js
/**
* NoSsr purposely removes components from the subject of Server Side Rendering (SSR).
*
* This component can be useful in a variety of situations:
*
* * Escape hatch for broken dependencies not supporting SSR.
* * Improve the time-to-first paint on the client by only rendering above the fold.
* * Reduce the rendering time on the server.
* * Under too heavy server load, you can turn on service degradation.
*
* Demos:
*
* - [No SSR](https://mui.com/material-ui/react-no-ssr/)
*
* API:
*
* - [NoSsr API](https://mui.com/material-ui/api/no-ssr/)
*/
function NoSsr(props) {
	const { children, defer = false, fallback = null } = props;
	const [mountedState, setMountedState] = import_react.useState(false);
	useEnhancedEffect(() => {
		if (!defer) setMountedState(true);
	}, [defer]);
	import_react.useEffect(() => {
		if (defer) setMountedState(true);
	}, [defer]);
	return mountedState ? children : fallback;
}
NoSsr.propTypes = {
	children: import_prop_types.default.node,
	defer: import_prop_types.default.bool,
	fallback: import_prop_types.default.node
};
NoSsr["propTypes"] = exactProp(NoSsr.propTypes);
//#endregion
//#region node_modules/@mui/x-internals/esm/rafThrottle/rafThrottle.js
/**
*  Creates a throttled function that only invokes `fn` at most once per animation frame.
*
* @example
* ```ts
* const throttled = rafThrottle((value: number) => console.log(value));
* window.addEventListener('scroll', (e) => throttled(e.target.scrollTop));
* ```
*
* @param fn Callback function
* @return The `requestAnimationFrame` throttled function
*/
function rafThrottle(fn) {
	let lastArgs;
	let rafRef;
	const later = () => {
		rafRef = null;
		fn(...lastArgs);
	};
	function throttled(...args) {
		lastArgs = args;
		if (!rafRef) rafRef = requestAnimationFrame(later);
	}
	throttled.clear = () => {
		if (rafRef) {
			cancelAnimationFrame(rafRef);
			rafRef = null;
		}
	};
	return throttled;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/hooks/useAxisSystem.js
/**
* @internals
*
* Get the coordinate system implemented.
* The hook assumes polar and cartesian are never implemented at the same time.
* @returns The coordinate system
*/
function useAxisSystem() {
	const store = useStore();
	const rawRotationAxis = store.use(selectorChartRawRotationAxis);
	const rawXAxis = store.use(selectorChartRawXAxis);
	if (rawRotationAxis !== void 0) return "polar";
	if (rawXAxis !== void 0) return "cartesian";
	return "none";
}
//#endregion
//#region node_modules/@mui/x-charts/esm/hooks/useDrawingArea.js
/**
* Get the drawing area dimensions and coordinates. The drawing area is the area where the chart is rendered.
*
* It includes the left, top, width, height, bottom, and right dimensions.
*
* @returns The drawing area dimensions.
*/
function useDrawingArea() {
	return useStore().use(selectorChartDrawingArea);
}
//#endregion
//#region node_modules/@mui/x-charts/esm/hooks/useChartId.js
/**
* Get the unique identifier of the chart.
* @returns chartId if it exists.
*/
function useChartId() {
	return useStore().use(selectorChartId);
}
//#endregion
//#region node_modules/@mui/x-charts/esm/hooks/useSvgRef.js
/**
* Get the ref for the SVG element.
* @returns The SVG ref.
*/
function useSvgRef() {
	const context = useChartContext();
	if (!context) throw new Error(["MUI X Charts: Could not find the svg ref context.", "It looks like you rendered your component outside of a ChartContainer parent component."].join("\n"));
	return context.svgRef;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/seriesSelectorOfType.js
var selectorAllSeriesOfType = createSelector(selectorChartSeriesProcessed, (processedSeries, seriesType) => processedSeries[seriesType]);
createSelectorMemoized(selectorChartSeriesProcessed, (processedSeries, seriesType, ids) => {
	if (ids === void 0 || Array.isArray(ids) && ids.length === 0) return processedSeries[seriesType]?.seriesOrder?.map((seriesId) => processedSeries[seriesType]?.series[seriesId]) ?? [];
	if (!Array.isArray(ids)) return processedSeries[seriesType]?.series?.[ids];
	const result = [];
	const failedIds = [];
	for (const id of ids) {
		const series = processedSeries[seriesType]?.series?.[id];
		if (series) result.push(series);
		else failedIds.push(id);
	}
	if (failedIds.length > 0) {
		const formattedIds = failedIds.map((v) => JSON.stringify(v)).join(", ");
		warnOnce([`MUI X Charts: The following ids provided to "${`use${seriesType.charAt(0).toUpperCase()}${seriesType.slice(1)}Series`}" could not be found: ${formattedIds}.`, `Make sure that they exist and their series are using the "${seriesType}" series type.`]);
	}
	return result;
});
var useAllSeriesOfType = (seriesType) => {
	return useStore().use(selectorAllSeriesOfType, seriesType);
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartHighlight/createIsHighlighted.js
function alwaysFalse$1() {
	return false;
}
function createIsHighlighted(highlightScope, highlightedItem) {
	if (!highlightScope || !highlightedItem) return alwaysFalse$1;
	return function isHighlighted(item) {
		if (!item) return false;
		if (highlightScope.highlight === "series") return item.seriesId === highlightedItem.seriesId;
		if (highlightScope.highlight === "item") return item.dataIndex === highlightedItem.dataIndex && item.seriesId === highlightedItem.seriesId;
		return false;
	};
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartHighlight/createIsFaded.js
function alwaysFalse() {
	return false;
}
function createIsFaded(highlightScope, highlightedItem) {
	if (!highlightScope || !highlightedItem) return alwaysFalse;
	return function isFaded(item) {
		if (!item) return false;
		if (highlightScope.fade === "series") return item.seriesId === highlightedItem.seriesId && item.dataIndex !== highlightedItem.dataIndex;
		if (highlightScope.fade === "global") return item.seriesId !== highlightedItem.seriesId || item.dataIndex !== highlightedItem.dataIndex;
		return false;
	};
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartHighlight/highlightStates.js
function isSeriesHighlighted(scope, item, seriesId) {
	return scope?.highlight === "series" && item?.seriesId === seriesId;
}
function isSeriesFaded(scope, item, seriesId) {
	if (isSeriesHighlighted(scope, item, seriesId)) return false;
	return scope?.fade === "global" && item != null || scope?.fade === "series" && item?.seriesId === seriesId;
}
/**
* Returns the data index of the highlighted item for a specific series.
* If the item is not highlighted, it returns `null`.
*/
function getSeriesHighlightedItem(scope, item, seriesId) {
	return scope?.highlight === "item" && item?.seriesId === seriesId ? item.dataIndex : null;
}
/**
* Returns the data index of the "unfaded item" for a specific series.
* An "unfaded item" is the only item of a faded series that shouldn't be faded.
* If the series is not faded or if there is no highlighted item, it returns `null`.
*/
function getSeriesUnfadedItem(scope, item, seriesId) {
	if (isSeriesHighlighted(scope, item, seriesId)) return null;
	if (getSeriesHighlightedItem(scope, item, seriesId) === item?.dataIndex) return null;
	return (scope?.fade === "series" || scope?.fade === "global") && item?.seriesId === seriesId ? item.dataIndex : null;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartHighlight/useChartHighlight.selectors.js
var selectHighlight = (state) => state.highlight;
var selectorChartsHighlightScopePerSeriesId = createSelector(selectorChartSeriesProcessed, (processedSeries) => {
	const map = /* @__PURE__ */ new Map();
	Object.keys(processedSeries).forEach((seriesType) => {
		const seriesData = processedSeries[seriesType];
		seriesData?.seriesOrder?.forEach((seriesId) => {
			const seriesItem = seriesData?.series[seriesId];
			map.set(seriesId, seriesItem?.highlightScope);
		});
	});
	return map;
});
var selectorChartsHighlightedItem = createSelectorMemoized(selectHighlight, selectorChartsKeyboardItem, function selectorChartsHighlightedItem(highlight, keyboardItem) {
	return highlight.isControlled || highlight.lastUpdate === "pointer" ? highlight.item : keyboardItem;
});
var selectorChartsHighlightScope = createSelector(selectorChartsHighlightScopePerSeriesId, selectorChartsHighlightedItem, function selectorChartsHighlightScope(seriesIdToHighlightScope, highlightedItem) {
	if (!highlightedItem) return null;
	const highlightScope = seriesIdToHighlightScope.get(highlightedItem.seriesId);
	if (highlightScope === void 0) return null;
	return highlightScope;
});
var selectorChartsIsHighlightedCallback = createSelectorMemoized(selectorChartsHighlightScope, selectorChartsHighlightedItem, createIsHighlighted);
var selectorChartsIsFadedCallback = createSelectorMemoized(selectorChartsHighlightScope, selectorChartsHighlightedItem, createIsFaded);
var selectorChartsIsHighlighted = createSelector(selectorChartsHighlightScope, selectorChartsHighlightedItem, function selectorChartsIsHighlighted(highlightScope, highlightedItem, item) {
	return createIsHighlighted(highlightScope, highlightedItem)(item);
});
var selectorChartIsSeriesHighlighted = createSelector(selectorChartsHighlightScope, selectorChartsHighlightedItem, isSeriesHighlighted);
var selectorChartIsSeriesFaded = createSelector(selectorChartsHighlightScope, selectorChartsHighlightedItem, isSeriesFaded);
var selectorChartSeriesUnfadedItem = createSelector(selectorChartsHighlightScope, selectorChartsHighlightedItem, getSeriesUnfadedItem);
var selectorChartSeriesHighlightedItem = createSelector(selectorChartsHighlightScope, selectorChartsHighlightedItem, getSeriesHighlightedItem);
var selectorChartsIsFaded = createSelector(selectorChartsHighlightScope, selectorChartsHighlightedItem, function selectorChartsIsFaded(highlightScope, highlightedItem, item) {
	return createIsFaded(highlightScope, highlightedItem)(item);
});
//#endregion
//#region node_modules/@mui/x-charts/esm/hooks/useItemHighlighted.js
/**
* A hook to check the highlighted state of the item.
* This function already calculates that an item is not faded if it is highlighted.
*
* If you need fine control over the state, use the `useItemHighlightedGetter` hook instead.
*
* @param {HighlightItemData | null} item is the item to check
* @returns {UseItemHighlightedReturnType} the state of the item
*/
function useItemHighlighted(item) {
	const store = useStore();
	const isHighlighted = store.use(selectorChartsIsHighlighted, item);
	const isFaded = store.use(selectorChartsIsFaded, item);
	return {
		isHighlighted,
		isFaded: !isHighlighted && isFaded
	};
}
//#endregion
//#region node_modules/@mui/x-charts/esm/hooks/useLegend.js
function getSeriesToDisplay(series, seriesConfig) {
	return Object.keys(series).flatMap((seriesType) => {
		const getter = seriesConfig[seriesType].legendGetter;
		return getter === void 0 ? [] : getter(series[seriesType]);
	});
}
/**
* Get the legend items to display.
*
* This hook is used by the `ChartsLegend` component. And will return the legend items formatted for display.
*
* An alternative is to use the `useSeries` hook and format the legend items yourself.
*
* @returns legend data
*/
function useLegend() {
	return { items: getSeriesToDisplay(useSeries(), useStore().use(selectorChartSeriesConfig)) };
}
//#endregion
//#region node_modules/@mui/x-charts/esm/hooks/useChartGradientId.js
/**
* Returns a function that generates a gradient id for the given axis id.
*/
function useChartGradientIdBuilder() {
	const chartId = useChartId();
	return import_react.useCallback((axisId) => `${chartId}-gradient-${axisId}`, [chartId]);
}
/**
* Returns a function that generates a gradient id for the given axis id.
*/
function useChartGradientIdObjectBoundBuilder() {
	const chartId = useChartId();
	return import_react.useCallback((axisId) => `${chartId}-gradient-${axisId}-object-bound`, [chartId]);
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/animation/animation.js
var import_src = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* https://github.com/gre/bezier-easing
	* BezierEasing - use bezier curve for transition easing function
	* by Gaëtan Renaudeau 2014 - 2015 – MIT License
	*/
	var NEWTON_ITERATIONS = 4;
	var NEWTON_MIN_SLOPE = .001;
	var SUBDIVISION_PRECISION = 1e-7;
	var SUBDIVISION_MAX_ITERATIONS = 10;
	var kSplineTableSize = 11;
	var kSampleStepSize = 1 / (kSplineTableSize - 1);
	var float32ArraySupported = typeof Float32Array === "function";
	function A(aA1, aA2) {
		return 1 - 3 * aA2 + 3 * aA1;
	}
	function B(aA1, aA2) {
		return 3 * aA2 - 6 * aA1;
	}
	function C(aA1) {
		return 3 * aA1;
	}
	function calcBezier(aT, aA1, aA2) {
		return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
	}
	function getSlope(aT, aA1, aA2) {
		return 3 * A(aA1, aA2) * aT * aT + 2 * B(aA1, aA2) * aT + C(aA1);
	}
	function binarySubdivide(aX, aA, aB, mX1, mX2) {
		var currentX, currentT, i = 0;
		do {
			currentT = aA + (aB - aA) / 2;
			currentX = calcBezier(currentT, mX1, mX2) - aX;
			if (currentX > 0) aB = currentT;
			else aA = currentT;
		} while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
		return currentT;
	}
	function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
		for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
			var currentSlope = getSlope(aGuessT, mX1, mX2);
			if (currentSlope === 0) return aGuessT;
			var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
			aGuessT -= currentX / currentSlope;
		}
		return aGuessT;
	}
	function LinearEasing(x) {
		return x;
	}
	module.exports = function bezier(mX1, mY1, mX2, mY2) {
		if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) throw new Error("bezier x values must be in [0, 1] range");
		if (mX1 === mY1 && mX2 === mY2) return LinearEasing;
		var sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
		for (var i = 0; i < kSplineTableSize; ++i) sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
		function getTForX(aX) {
			var intervalStart = 0;
			var currentSample = 1;
			var lastSample = kSplineTableSize - 1;
			for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) intervalStart += kSampleStepSize;
			--currentSample;
			var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
			var guessForT = intervalStart + dist * kSampleStepSize;
			var initialSlope = getSlope(guessForT, mX1, mX2);
			if (initialSlope >= NEWTON_MIN_SLOPE) return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
			else if (initialSlope === 0) return guessForT;
			else return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
		}
		return function BezierEasing(x) {
			if (x === 0) return 0;
			if (x === 1) return 1;
			return calcBezier(getTForX(x), mY1, mY2);
		};
	};
})))(), 1);
var ANIMATION_TIMING_FUNCTION = "cubic-bezier(0.66, 0, 0.34, 1)";
var ANIMATION_TIMING_FUNCTION_JS = (0, import_src.default)(.66, 0, .34, 1);
//#endregion
//#region node_modules/d3-timer/src/timer.js
var frame = 0, timeout = 0, interval = 0, pokeDelay = 1e3, taskHead, taskTail, clockLast = 0, clockNow = 0, clockSkew = 0, clock = typeof performance === "object" && performance.now ? performance : Date, setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) {
	setTimeout(f, 17);
};
function now() {
	return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
}
function clearNow() {
	clockNow = 0;
}
function Timer() {
	this._call = this._time = this._next = null;
}
Timer.prototype = timer.prototype = {
	constructor: Timer,
	restart: function(callback, delay, time) {
		if (typeof callback !== "function") throw new TypeError("callback is not a function");
		time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
		if (!this._next && taskTail !== this) {
			if (taskTail) taskTail._next = this;
			else taskHead = this;
			taskTail = this;
		}
		this._call = callback;
		this._time = time;
		sleep();
	},
	stop: function() {
		if (this._call) {
			this._call = null;
			this._time = Infinity;
			sleep();
		}
	}
};
function timer(callback, delay, time) {
	var t = new Timer();
	t.restart(callback, delay, time);
	return t;
}
function timerFlush() {
	now();
	++frame;
	var t = taskHead, e;
	while (t) {
		if ((e = clockNow - t._time) >= 0) t._call.call(void 0, e);
		t = t._next;
	}
	--frame;
}
function wake() {
	clockNow = (clockLast = clock.now()) + clockSkew;
	frame = timeout = 0;
	try {
		timerFlush();
	} finally {
		frame = 0;
		nap();
		clockNow = 0;
	}
}
function poke() {
	var now = clock.now(), delay = now - clockLast;
	if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
}
function nap() {
	var t0, t1 = taskHead, t2, time = Infinity;
	while (t1) if (t1._call) {
		if (time > t1._time) time = t1._time;
		t0 = t1, t1 = t1._next;
	} else {
		t2 = t1._next, t1._next = null;
		t1 = t0 ? t0._next = t2 : taskHead = t2;
	}
	taskTail = t0;
	sleep(time);
}
function sleep(time) {
	if (frame) return;
	if (timeout) timeout = clearTimeout(timeout);
	if (time - clockNow > 24) {
		if (time < Infinity) timeout = setTimeout(wake, time - clock.now() - clockSkew);
		if (interval) interval = clearInterval(interval);
	} else {
		if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
		frame = 1, setFrame(wake);
	}
}
//#endregion
//#region node_modules/d3-timer/src/timeout.js
function timeout_default(callback, delay, time) {
	var t = new Timer();
	delay = delay == null ? 0 : +delay;
	t.restart((elapsed) => {
		t.stop();
		callback(elapsed + delay);
	}, delay, time);
	return t;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/animation/Transition.js
/**
* A resumable transition class inspired by d3-transition.
* Allows for starting, and stopping and resuming transitions.
*
* The transition is started automatically.
* A transition cannot be restarted after it has finished.
* Resuming a transition will continue from the point it was stopped, i.e., easing will continue from the point it was
* stopped.
*/
var Transition = class {
	elapsed = 0;
	timer = null;
	/**
	* Create a new ResumableTransition.
	* @param duration Duration in milliseconds
	* @param easingFn The easing function
	* @param onTick Callback function called on each animation frame with the eased time in range [0, 1].
	*/
	constructor(duration, easingFn, onTick) {
		this.duration = duration;
		this.easingFn = easingFn;
		this.onTickCallback = onTick;
		this.resume();
	}
	get running() {
		return this.timer !== null;
	}
	timerCallback(elapsed) {
		this.elapsed = Math.min(elapsed, this.duration);
		const t = this.duration === 0 ? 1 : this.elapsed / this.duration;
		const easedT = this.easingFn(t);
		this.onTickCallback(easedT);
		if (this.elapsed >= this.duration) this.stop();
	}
	/**
	* Resume the transition
	*/
	resume() {
		if (this.running || this.elapsed >= this.duration) return this;
		this.timer = timer((elapsed) => this.timerCallback(elapsed), 0, now() - this.elapsed);
		return this;
	}
	/**
	* Stops the transition.
	*/
	stop() {
		if (!this.running) return this;
		if (this.timer) {
			this.timer.stop();
			this.timer = null;
		}
		return this;
	}
	/**
	* Immediately finishes the transition and calls the tick callback with the final value.
	*/
	finish() {
		this.stop();
		timeout_default(() => this.timerCallback(this.duration));
		return this;
	}
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/shallowEqual.js
/**
* Performs equality by iterating through keys on an object and returning false
* when any key has values which are not strictly equal between the arguments.
* Returns true when the values of all keys are strictly equal.
*
* Source: https://github.com/facebook/react/blob/c2a196174763e0b4f16ed1c512ed4442b062395e/packages/shared/shallowEqual.js#L18
*/
function shallowEqual(objA, objB) {
	if (Object.is(objA, objB)) return true;
	if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) return false;
	const keysA = Object.keys(objA);
	const keysB = Object.keys(objB);
	if (keysA.length !== keysB.length) return false;
	for (let i = 0; i < keysA.length; i += 1) {
		const currentKey = keysA[i];
		if (!Object.prototype.hasOwnProperty.call(objB, currentKey) || !Object.is(objA[currentKey], objB[currentKey])) return false;
	}
	return true;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/animation/useAnimateInternal.js
/** Animates a ref. The animation can be skipped by setting {@link skip} to true.
*
* If possible, prefer {@link useAnimate}.
*
* - If {@link skip} is false, a transition will be started.
* - If {@link skip} is true and no transition is in progress, no transition will be started and {@link applyProps} will
*   never be called.
* - If {@link skip} becomes true and a transition is in progress, the transition will immediately end and
*   {@link applyProps} be called with the final value.
* */
function useAnimateInternal(props, { createInterpolator, applyProps, skip, initialProps = props }) {
	const lastInterpolatedPropsRef = import_react.useRef(initialProps);
	const transitionRef = import_react.useRef(null);
	const elementRef = import_react.useRef(null);
	const lastPropsRef = import_react.useRef(props);
	useEnhancedEffect(() => {
		lastPropsRef.current = props;
	}, [props]);
	useEnhancedEffect(() => {
		if (skip) {
			transitionRef.current?.finish();
			transitionRef.current = null;
			elementRef.current = null;
			lastInterpolatedPropsRef.current = props;
		}
	}, [props, skip]);
	const animate = import_react.useCallback((element) => {
		const lastInterpolatedProps = lastInterpolatedPropsRef.current;
		const interpolate = createInterpolator(lastInterpolatedProps, props);
		transitionRef.current = new Transition(300, ANIMATION_TIMING_FUNCTION_JS, (t) => {
			const interpolatedProps = interpolate(t);
			lastInterpolatedPropsRef.current = interpolatedProps;
			applyProps(element, interpolatedProps);
		});
	}, [
		applyProps,
		createInterpolator,
		props
	]);
	return [import_react.useCallback((element) => {
		if (element === null) {
			transitionRef.current?.stop();
			return;
		}
		const lastElement = elementRef.current;
		if (lastElement === element) {
			if (shallowEqual(lastPropsRef.current, props)) {
				transitionRef.current?.resume();
				return;
			}
			transitionRef.current?.stop();
		}
		if (lastElement) transitionRef.current?.stop();
		elementRef.current = element;
		if (transitionRef.current || !skip) animate(element);
	}, [
		animate,
		props,
		skip
	]), lastInterpolatedPropsRef.current];
}
//#endregion
//#region node_modules/@mui/x-charts/esm/hooks/animation/useAnimate.js
/**
* Hook to customize the animation of an element.
* Animates a ref from `initialProps` to `props`.
*
* @param {object} props The props to animate to.
*
* @returns an object containing a ref that should be passed to the element to animate and the transformed props.
* If `skip` is true, the transformed props are the `props` to animate to; if it is false, the transformed props are the
* `initialProps`.
*
* The animated props are only accessible in `applyProps`. The props returned from this hook are not animated.
*
* When an animation starts, an interpolator is created using `createInterpolator`.
* On every animation frame:
* 1. The interpolator is called to get the interpolated props;
* 2. `transformProps` is called to transform the interpolated props;
* 3. `applyProps` is called to apply the transformed props to the element.
*
* If `props` change while an animation is progress, the animation will continue towards the new `props`.
*
* The animation can be skipped by setting `skip` to true. If a transition is in progress, it will immediately end
* and `applyProps` be called with the final value. If there isn't a transition in progress, a new one won't be
* started and `applyProps` will not be called.
* */
function useAnimate(props, { createInterpolator, transformProps, applyProps, skip, initialProps = props, ref }) {
	const transform = transformProps ?? ((p) => p);
	const [animateRef, lastInterpolatedProps] = useAnimateInternal(props, {
		initialProps,
		createInterpolator,
		applyProps: (element, animatedProps) => applyProps(element, transform(animatedProps)),
		skip
	});
	return _extends({}, skip ? transformProps(props) : transformProps(lastInterpolatedProps), { ref: useForkRef(animateRef, ref) });
}
//#endregion
//#region node_modules/@mui/x-charts/esm/hooks/useChartRootRef.js
/**
* Get the ref for the root chart element.
* @returns The root chart element ref.
*/
function useChartRootRef() {
	return useChartContext().chartRootRef;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/locales/utils/imageMimeTypes.js
var imageMimeTypes = {
	"image/png": "PNG",
	"image/jpeg": "JPEG",
	"image/webp": "WebP"
};
//#endregion
//#region node_modules/@mui/x-charts/esm/locales/utils/getChartsLocalization.js
/**
* Helper to pass translation to all charts thanks to the MUI theme.
* @param chartsTranslations The translation object.
* @returns an object to pass the translation by using the MUI theme default props
*/
var getChartsLocalization = (chartsTranslations) => {
	return { components: { MuiChartsLocalizationProvider: { defaultProps: { localeText: _extends({}, chartsTranslations) } } } };
};
//#endregion
//#region node_modules/@mui/x-charts/esm/locales/enUS.js
var enUSLocaleText = {
	loading: "Loading data…",
	noData: "No data to display",
	zoomIn: "Zoom in",
	zoomOut: "Zoom out",
	toolbarExport: "Export",
	toolbarExportPrint: "Print",
	toolbarExportImage: (mimeType) => `Export as ${imageMimeTypes[mimeType] ?? mimeType}`,
	chartTypeBar: "Bar",
	chartTypeColumn: "Column",
	chartTypeLine: "Line",
	chartTypeArea: "Area",
	chartTypePie: "Pie",
	chartPaletteLabel: "Color palette",
	chartPaletteNameRainbowSurge: "Rainbow Surge",
	chartPaletteNameBlueberryTwilight: "Blueberry Twilight",
	chartPaletteNameMangoFusion: "Mango Fusion",
	chartPaletteNameCheerfulFiesta: "Cheerful Fiesta",
	chartPaletteNameStrawberrySky: "Strawberry Sky",
	chartPaletteNameBlue: "Blue",
	chartPaletteNameGreen: "Green",
	chartPaletteNamePurple: "Purple",
	chartPaletteNameRed: "Red",
	chartPaletteNameOrange: "Orange",
	chartPaletteNameYellow: "Yellow",
	chartPaletteNameCyan: "Cyan",
	chartPaletteNamePink: "Pink",
	chartConfigurationSectionChart: "Chart",
	chartConfigurationSectionColumns: "Columns",
	chartConfigurationSectionBars: "Bars",
	chartConfigurationSectionAxes: "Axes",
	chartConfigurationGrid: "Grid",
	chartConfigurationBorderRadius: "Border radius",
	chartConfigurationCategoryGapRatio: "Category gap ratio",
	chartConfigurationBarGapRatio: "Series gap ratio",
	chartConfigurationStacked: "Stacked",
	chartConfigurationShowToolbar: "Show toolbar",
	chartConfigurationSkipAnimation: "Skip animation",
	chartConfigurationInnerRadius: "Inner radius",
	chartConfigurationOuterRadius: "Outer radius",
	chartConfigurationColors: "Colors",
	chartConfigurationHideLegend: "Hide legend",
	chartConfigurationShowMark: "Show mark",
	chartConfigurationHeight: "Height",
	chartConfigurationWidth: "Width",
	chartConfigurationSeriesGap: "Series gap",
	chartConfigurationTickPlacement: "Tick placement",
	chartConfigurationTickLabelPlacement: "Tick label placement",
	chartConfigurationCategoriesAxisLabel: "Categories axis label",
	chartConfigurationSeriesAxisLabel: "Series axis label",
	chartConfigurationXAxisPosition: "X-axis position",
	chartConfigurationYAxisPosition: "Y-axis position",
	chartConfigurationSeriesAxisReverse: "Reverse series axis",
	chartConfigurationTooltipPlacement: "Placement",
	chartConfigurationTooltipTrigger: "Trigger",
	chartConfigurationLegendPosition: "Position",
	chartConfigurationLegendDirection: "Direction",
	chartConfigurationBarLabels: "Bar labels",
	chartConfigurationColumnLabels: "Column labels",
	chartConfigurationInterpolation: "Interpolation",
	chartConfigurationSectionTooltip: "Tooltip",
	chartConfigurationSectionLegend: "Legend",
	chartConfigurationSectionLines: "Lines",
	chartConfigurationSectionAreas: "Areas",
	chartConfigurationSectionArcs: "Arcs",
	chartConfigurationPaddingAngle: "Padding angle",
	chartConfigurationCornerRadius: "Corner radius",
	chartConfigurationArcLabels: "Arc labels",
	chartConfigurationStartAngle: "Start angle",
	chartConfigurationEndAngle: "End angle",
	chartConfigurationPieTooltipTrigger: "Trigger",
	chartConfigurationPieLegendPosition: "Position",
	chartConfigurationPieLegendDirection: "Direction",
	chartConfigurationOptionNone: "None",
	chartConfigurationOptionValue: "Value",
	chartConfigurationOptionAuto: "Auto",
	chartConfigurationOptionTop: "Top",
	chartConfigurationOptionTopLeft: "Top Left",
	chartConfigurationOptionTopRight: "Top Right",
	chartConfigurationOptionBottom: "Bottom",
	chartConfigurationOptionBottomLeft: "Bottom Left",
	chartConfigurationOptionBottomRight: "Bottom Right",
	chartConfigurationOptionLeft: "Left",
	chartConfigurationOptionRight: "Right",
	chartConfigurationOptionAxis: "Axis",
	chartConfigurationOptionItem: "Item",
	chartConfigurationOptionHorizontal: "Horizontal",
	chartConfigurationOptionVertical: "Vertical",
	chartConfigurationOptionBoth: "Both",
	chartConfigurationOptionStart: "Start",
	chartConfigurationOptionMiddle: "Middle",
	chartConfigurationOptionEnd: "End",
	chartConfigurationOptionExtremities: "Extremities",
	chartConfigurationOptionTick: "Tick",
	chartConfigurationOptionMonotoneX: "Monotone X",
	chartConfigurationOptionMonotoneY: "Monotone Y",
	chartConfigurationOptionCatmullRom: "Catmull-Rom",
	chartConfigurationOptionLinear: "Linear",
	chartConfigurationOptionNatural: "Natural",
	chartConfigurationOptionStep: "Step",
	chartConfigurationOptionStepBefore: "Step Before",
	chartConfigurationOptionStepAfter: "Step After",
	chartConfigurationOptionBumpX: "Bump X",
	chartConfigurationOptionBumpY: "Bump Y"
};
var DEFAULT_LOCALE = enUSLocaleText;
getChartsLocalization(enUSLocaleText);
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsLocalizationProvider/ChartsLocalizationProvider.js
var _excluded$9 = ["localeText"];
var ChartsLocalizationContext = /* @__PURE__ */ import_react.createContext(null);
ChartsLocalizationContext.displayName = "ChartsLocalizationContext";
/**
* Demos:
*
* - [localization](https://mui.com/x/react-charts/localization/)
*
* API:
*
* - [ChartsLocalizationProvider API](https://mui.com/x/api/charts/charts-localization-provider/)
*/
function ChartsLocalizationProvider(inProps) {
	const { localeText: inLocaleText } = inProps, other = _objectWithoutPropertiesLoose(inProps, _excluded$9);
	const { localeText: parentLocaleText } = import_react.useContext(ChartsLocalizationContext) ?? { localeText: void 0 };
	const { children, localeText: themeLocaleText } = useThemeProps({
		props: other,
		name: "MuiChartsLocalizationProvider"
	});
	const localeText = import_react.useMemo(() => _extends({}, DEFAULT_LOCALE, themeLocaleText, parentLocaleText, inLocaleText), [
		themeLocaleText,
		parentLocaleText,
		inLocaleText
	]);
	const contextValue = import_react.useMemo(() => {
		return { localeText };
	}, [localeText]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsLocalizationContext.Provider, {
		value: contextValue,
		children
	});
}
ChartsLocalizationProvider.propTypes = {
	children: import_prop_types.default.node,
	localeText: import_prop_types.default.object
};
//#endregion
//#region node_modules/@mui/x-charts/esm/hooks/useChartsLocalization.js
var useChartsLocalization = () => {
	const localization = import_react.useContext(ChartsLocalizationContext);
	if (localization === null) throw new Error([
		"MUI X Charts: Can not find the charts localization context.",
		"It looks like you forgot to wrap your component in ChartsLocalizationProvider.",
		"This can also happen if you are bundling multiple versions of the `@mui/x-charts` package"
	].join("\n"));
	return localization;
};
//#endregion
//#region node_modules/@mui/x-charts/esm/hooks/useFocusedItem.js
/**
* Get the focused item from keyboard navigation.
*/
function useFocusedItem() {
	return useStore().use(selectorChartsFocusedItem);
}
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsTooltip/ChartsTooltipContainer.js
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom(), 1);
var _excluded$8 = [
	"trigger",
	"position",
	"anchor",
	"classes",
	"children"
];
var selectorReturnFalse = () => false;
var selectorReturnNull = () => null;
function getIsOpenSelector(trigger, axisSystem, shouldPreventBecauseOfBrush) {
	if (shouldPreventBecauseOfBrush) return selectorReturnFalse;
	if (trigger === "item") return selectorChartsTooltipItemIsDefined;
	if (axisSystem === "polar") return selectorChartsInteractionPolarAxisTooltip;
	if (axisSystem === "cartesian") return selectorChartsInteractionAxisTooltip;
	return selectorReturnFalse;
}
var ChartsTooltipRoot = styled(Popper, {
	name: "MuiChartsTooltip",
	slot: "Root"
})(({ theme }) => ({
	pointerEvents: "none",
	zIndex: theme.zIndex.modal
}));
/**
* Demos:
*
* - [ChartsTooltip](https://mui.com/x/react-charts/tooltip/)
*
* API:
*
* - [ChartsTooltip API](https://mui.com/x/api/charts/charts-tool-tip/)
*/
function ChartsTooltipContainer(inProps) {
	const props = useThemeProps({
		props: inProps,
		name: "MuiChartsTooltipContainer"
	});
	const { trigger = "axis", position, anchor = "pointer", classes: propClasses, children } = props, other = _objectWithoutPropertiesLoose(props, _excluded$8);
	const store = useStore();
	const svgRef = useSvgRef();
	const anchorRef = import_react.useRef(null);
	const classes = useUtilityClasses$4(propClasses);
	const pointerType = store.use(selectorChartsPointerType);
	const isFineMainPointer = useIsFineMainPointer();
	const popperRef = import_react.useRef(null);
	const positionRef = useLazyRef(() => ({
		x: 0,
		y: 0
	}));
	const axisSystem = useAxisSystem();
	const shouldPreventBecauseOfBrush = store.use(selectorBrushShouldPreventTooltip);
	const isOpen = store.use(getIsOpenSelector(trigger, axisSystem, shouldPreventBecauseOfBrush));
	const computedAnchor = store.use(selectorChartsLastInteraction) === "keyboard" || pointerType === null ? "node" : anchor;
	const itemPosition = store.use(trigger === "item" && computedAnchor === "node" ? selectorChartsTooltipItemPosition : selectorReturnNull, position);
	const isTooltipNodeAnchored = itemPosition !== null;
	import_react.useEffect(() => {
		const svgElement = svgRef.current;
		if (svgElement === null) return () => {};
		if (isTooltipNodeAnchored) return;
		const pointerUpdate = rafThrottle((x, y) => {
			positionRef.current = {
				x,
				y
			};
			popperRef.current?.update();
		});
		const handlePointerEvent = (event) => {
			pointerUpdate(event.clientX, event.clientY);
		};
		svgElement.addEventListener("pointermove", handlePointerEvent);
		svgElement.addEventListener("pointerenter", handlePointerEvent);
		return () => {
			svgElement.removeEventListener("pointermove", handlePointerEvent);
			svgElement.removeEventListener("pointerenter", handlePointerEvent);
			pointerUpdate.clear();
		};
	}, [
		svgRef,
		positionRef,
		isTooltipNodeAnchored
	]);
	const pointerAnchorEl = import_react.useMemo(() => ({ getBoundingClientRect: () => ({
		x: positionRef.current.x,
		y: positionRef.current.y,
		top: positionRef.current.y,
		left: positionRef.current.x,
		right: positionRef.current.x,
		bottom: positionRef.current.y,
		width: 0,
		height: 0,
		toJSON: () => ""
	}) }), [positionRef]);
	const isMouse = pointerType === "mouse" || isFineMainPointer;
	const isTouch = pointerType === "touch" || !isFineMainPointer;
	const modifiers = import_react.useMemo(() => [
		{
			name: "offset",
			options: { offset: () => {
				if (isTouch && !isTooltipNodeAnchored) return [0, 64];
				return [0, 8];
			} }
		},
		...!isMouse ? [{
			name: "flip",
			options: { fallbackPlacements: [
				"top-end",
				"top-start",
				"bottom-end",
				"bottom"
			] }
		}] : [],
		{
			name: "preventOverflow",
			options: { altAxis: true }
		}
	], [
		isMouse,
		isTooltipNodeAnchored,
		isTouch
	]);
	if (trigger === "none") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [svgRef.current && /* @__PURE__ */ import_react_dom.createPortal(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", _extends({ ref: anchorRef }, itemPosition, {
		display: "hidden",
		pointerEvents: "none",
		opacity: 0,
		width: 1,
		height: 1
	})), svgRef.current), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoSsr, { children: isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsTooltipRoot, _extends({}, other, {
		className: classes?.root,
		open: isOpen,
		placement: other.placement ?? position ?? (!isTooltipNodeAnchored && isMouse ? "right-start" : "top"),
		popperRef,
		anchorEl: itemPosition ? anchorRef.current : pointerAnchorEl,
		modifiers,
		children
	})) })] });
}
ChartsTooltipContainer.propTypes = {
	anchor: import_prop_types.default.oneOf(["node", "pointer"]),
	anchorEl: import_prop_types.default.oneOfType([
		HTMLElementType,
		import_prop_types.default.object,
		import_prop_types.default.func
	]),
	children: import_prop_types.default.node,
	classes: import_prop_types.default.object,
	component: import_prop_types.default.elementType,
	components: import_prop_types.default.shape({ Root: import_prop_types.default.elementType }),
	componentsProps: import_prop_types.default.shape({ root: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]) }),
	container: import_prop_types.default.oneOfType([(props, propName) => {
		if (props[propName] == null) return /* @__PURE__ */ new Error(`Prop '${propName}' is required but wasn't specified`);
		if (typeof props[propName] !== "object" || props[propName].nodeType !== 1) return /* @__PURE__ */ new Error(`Expected prop '${propName}' to be of type Element`);
		return null;
	}, import_prop_types.default.func]),
	disablePortal: import_prop_types.default.bool,
	keepMounted: import_prop_types.default.bool,
	modifiers: import_prop_types.default.arrayOf(import_prop_types.default.shape({
		data: import_prop_types.default.object,
		effect: import_prop_types.default.func,
		enabled: import_prop_types.default.bool,
		fn: import_prop_types.default.func,
		name: import_prop_types.default.any,
		options: import_prop_types.default.object,
		phase: import_prop_types.default.oneOf([
			"afterMain",
			"afterRead",
			"afterWrite",
			"beforeMain",
			"beforeRead",
			"beforeWrite",
			"main",
			"read",
			"write"
		]),
		requires: import_prop_types.default.arrayOf(import_prop_types.default.string),
		requiresIfExists: import_prop_types.default.arrayOf(import_prop_types.default.string)
	})),
	open: import_prop_types.default.bool,
	placement: import_prop_types.default.oneOf([
		"auto-end",
		"auto-start",
		"auto",
		"bottom-end",
		"bottom-start",
		"bottom",
		"left-end",
		"left-start",
		"left",
		"right-end",
		"right-start",
		"right",
		"top-end",
		"top-start",
		"top"
	]),
	popperOptions: import_prop_types.default.shape({
		modifiers: import_prop_types.default.array,
		onFirstUpdate: import_prop_types.default.func,
		placement: import_prop_types.default.oneOf([
			"auto-end",
			"auto-start",
			"auto",
			"bottom-end",
			"bottom-start",
			"bottom",
			"left-end",
			"left-start",
			"left",
			"right-end",
			"right-start",
			"right",
			"top-end",
			"top-start",
			"top"
		]),
		strategy: import_prop_types.default.oneOf(["absolute", "fixed"])
	}),
	popperRef: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.shape({ current: import_prop_types.default.shape({
		destroy: import_prop_types.default.func.isRequired,
		forceUpdate: import_prop_types.default.func.isRequired,
		setOptions: import_prop_types.default.func.isRequired,
		state: import_prop_types.default.shape({
			attributes: import_prop_types.default.object.isRequired,
			elements: import_prop_types.default.object.isRequired,
			modifiersData: import_prop_types.default.object.isRequired,
			options: import_prop_types.default.object.isRequired,
			orderedModifiers: import_prop_types.default.arrayOf(import_prop_types.default.object).isRequired,
			placement: import_prop_types.default.oneOf([
				"auto-end",
				"auto-start",
				"auto",
				"bottom-end",
				"bottom-start",
				"bottom",
				"left-end",
				"left-start",
				"left",
				"right-end",
				"right-start",
				"right",
				"top-end",
				"top-start",
				"top"
			]).isRequired,
			rects: import_prop_types.default.object.isRequired,
			reset: import_prop_types.default.bool.isRequired,
			scrollParents: import_prop_types.default.object.isRequired,
			strategy: import_prop_types.default.oneOf(["absolute", "fixed"]).isRequired,
			styles: import_prop_types.default.object.isRequired
		}).isRequired,
		update: import_prop_types.default.func.isRequired
	}) })]),
	position: import_prop_types.default.oneOf([
		"bottom",
		"left",
		"right",
		"top"
	]),
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
	transition: import_prop_types.default.bool,
	trigger: import_prop_types.default.oneOf([
		"axis",
		"item",
		"none"
	])
};
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsTooltip/ChartsTooltip.js
/**
* Demos:
*
* - [ChartsTooltip](https://mui.com/x/react-charts/tooltip/)
*
* API:
*
* - [ChartsTooltip API](https://mui.com/x/api/charts/charts-tool-tip/)
*/
function ChartsTooltip(props) {
	const { classes: propClasses, trigger = "axis" } = props;
	const classes = useUtilityClasses$4(propClasses);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsTooltipContainer, _extends({}, props, {
		classes: propClasses,
		children: trigger === "axis" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsAxisTooltipContent, { classes }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsItemTooltipContent, { classes })
	}));
}
ChartsTooltip.propTypes = {
	anchor: import_prop_types.default.oneOf(["node", "pointer"]),
	anchorEl: import_prop_types.default.oneOfType([
		HTMLElementType,
		import_prop_types.default.object,
		import_prop_types.default.func
	]),
	classes: import_prop_types.default.object,
	component: import_prop_types.default.elementType,
	components: import_prop_types.default.shape({ Root: import_prop_types.default.elementType }),
	componentsProps: import_prop_types.default.shape({ root: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object]) }),
	container: import_prop_types.default.oneOfType([(props, propName) => {
		if (props[propName] == null) return /* @__PURE__ */ new Error(`Prop '${propName}' is required but wasn't specified`);
		if (typeof props[propName] !== "object" || props[propName].nodeType !== 1) return /* @__PURE__ */ new Error(`Expected prop '${propName}' to be of type Element`);
		return null;
	}, import_prop_types.default.func]),
	disablePortal: import_prop_types.default.bool,
	keepMounted: import_prop_types.default.bool,
	modifiers: import_prop_types.default.arrayOf(import_prop_types.default.shape({
		data: import_prop_types.default.object,
		effect: import_prop_types.default.func,
		enabled: import_prop_types.default.bool,
		fn: import_prop_types.default.func,
		name: import_prop_types.default.any,
		options: import_prop_types.default.object,
		phase: import_prop_types.default.oneOf([
			"afterMain",
			"afterRead",
			"afterWrite",
			"beforeMain",
			"beforeRead",
			"beforeWrite",
			"main",
			"read",
			"write"
		]),
		requires: import_prop_types.default.arrayOf(import_prop_types.default.string),
		requiresIfExists: import_prop_types.default.arrayOf(import_prop_types.default.string)
	})),
	open: import_prop_types.default.bool,
	placement: import_prop_types.default.oneOf([
		"auto-end",
		"auto-start",
		"auto",
		"bottom-end",
		"bottom-start",
		"bottom",
		"left-end",
		"left-start",
		"left",
		"right-end",
		"right-start",
		"right",
		"top-end",
		"top-start",
		"top"
	]),
	popperOptions: import_prop_types.default.shape({
		modifiers: import_prop_types.default.array,
		onFirstUpdate: import_prop_types.default.func,
		placement: import_prop_types.default.oneOf([
			"auto-end",
			"auto-start",
			"auto",
			"bottom-end",
			"bottom-start",
			"bottom",
			"left-end",
			"left-start",
			"left",
			"right-end",
			"right-start",
			"right",
			"top-end",
			"top-start",
			"top"
		]),
		strategy: import_prop_types.default.oneOf(["absolute", "fixed"])
	}),
	popperRef: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.shape({ current: import_prop_types.default.shape({
		destroy: import_prop_types.default.func.isRequired,
		forceUpdate: import_prop_types.default.func.isRequired,
		setOptions: import_prop_types.default.func.isRequired,
		state: import_prop_types.default.shape({
			attributes: import_prop_types.default.object.isRequired,
			elements: import_prop_types.default.object.isRequired,
			modifiersData: import_prop_types.default.object.isRequired,
			options: import_prop_types.default.object.isRequired,
			orderedModifiers: import_prop_types.default.arrayOf(import_prop_types.default.object).isRequired,
			placement: import_prop_types.default.oneOf([
				"auto-end",
				"auto-start",
				"auto",
				"bottom-end",
				"bottom-start",
				"bottom",
				"left-end",
				"left-start",
				"left",
				"right-end",
				"right-start",
				"right",
				"top-end",
				"top-start",
				"top"
			]).isRequired,
			rects: import_prop_types.default.object.isRequired,
			reset: import_prop_types.default.bool.isRequired,
			scrollParents: import_prop_types.default.object.isRequired,
			strategy: import_prop_types.default.oneOf(["absolute", "fixed"]).isRequired,
			styles: import_prop_types.default.object.isRequired
		}).isRequired,
		update: import_prop_types.default.func.isRequired
	}) })]),
	position: import_prop_types.default.oneOf([
		"bottom",
		"left",
		"right",
		"top"
	]),
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
	transition: import_prop_types.default.bool,
	trigger: import_prop_types.default.oneOf([
		"axis",
		"item",
		"none"
	])
};
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsLegend/onClickContextBuilder.js
var seriesContextBuilder = (context) => ({
	type: "series",
	color: context.color,
	label: context.label,
	seriesId: context.seriesId,
	itemId: context.itemId,
	dataIndex: context.dataIndex
});
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsLegend/chartsLegendClasses.js
function getLegendUtilityClass(slot) {
	return generateUtilityClass("MuiChartsLegend", slot);
}
var useUtilityClasses$2 = (props) => {
	const { classes, direction } = props;
	return composeClasses({
		root: ["root", direction],
		item: ["item"],
		mark: ["mark"],
		label: ["label"],
		series: ["series"],
		hidden: ["hidden"]
	}, getLegendUtilityClass, classes);
};
var legendClasses = generateUtilityClasses("MuiChartsLegend", [
	"root",
	"item",
	"series",
	"mark",
	"label",
	"vertical",
	"horizontal",
	"hidden"
]);
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/consumeSlots.js
/**
* A higher order component that consumes a slot from the props and renders the component provided in the slot.
*
* This HOC will wrap a single component, and will render the component provided in the slot, if it exists.
*
* If you need to render multiple components, you can manually consume the slots from the props and render them in your component instead of using this HOC.
*
* In the example below, `MyComponent` will render the component provided in `mySlot` slot, if it exists. Otherwise, it will render the `DefaultComponent`.
*
* @example
*
* ```tsx
* type MyComponentProps = {
*   direction: 'row' | 'column';
*   slots?: {
*     mySlot?: React.JSXElementConstructor<{ direction: 'row' | 'column' }>;
*   }
* };
*
* const MyComponent = consumeSlots(
*   'MuiMyComponent',
*   'mySlot',
*   function DefaultComponent(props: MyComponentProps) {
*     return (
*       <div className={props.classes.root}>
*         {props.direction}
*       </div>
*     );
*   }
* );
* ```
*
* @param {string} name The mui component name.
* @param {string} slotPropName The name of the prop to retrieve the slot from.
* @param {object} options Options for the HOC.
* @param {boolean} options.propagateSlots Whether to propagate the slots to the component, this is always false if the slot is provided.
* @param {Record<string, any>} options.defaultProps A set of defaults for the component, will be deep merged with the props.
* @param {Array<keyof Props>} options.omitProps An array of props to omit from the component.
* @param {Function} options.classesResolver A function that returns the classes for the component. It receives the props, after theme props and defaults have been applied. And the theme object as the second argument.
* @param InComponent The component to render if the slot is not provided.
*/
var _excluded$7 = ["slots", "slotProps"], _excluded2 = ["ownerState"];
var consumeSlots = (name, slotPropName, options, InComponent) => {
	function ConsumeSlotsInternal(props, ref) {
		const themedProps = useThemeProps({
			props,
			name
		});
		const defaultizedProps = resolveProps(typeof options.defaultProps === "function" ? options.defaultProps(themedProps) : options.defaultProps ?? {}, themedProps);
		const _ref = defaultizedProps, { slots, slotProps } = _ref, other = _objectWithoutPropertiesLoose(_ref, _excluded$7);
		const theme = useTheme$1();
		const classes = options.classesResolver?.(defaultizedProps, theme);
		const Component = slots?.[slotPropName] ?? InComponent;
		const propagateSlots = options.propagateSlots && !slots?.[slotPropName];
		const outProps = _extends({}, _objectWithoutPropertiesLoose(useSlotProps({
			elementType: Component,
			externalSlotProps: slotProps?.[slotPropName],
			additionalProps: _extends({}, other, { classes }, propagateSlots && {
				slots,
				slotProps
			}),
			ownerState: {}
		}), _excluded2));
		for (const prop of options.omitProps ?? []) delete outProps[prop];
		Component.displayName = `${name}.slots.${slotPropName}`;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Component, _extends({}, outProps, { ref }));
	}
	return /* @__PURE__ */ import_react.forwardRef(ConsumeSlotsInternal);
};
consumeSlots.displayName = "consumeSlots";
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsLabel/labelClasses.js
function getLabelUtilityClass(slot) {
	return generateUtilityClass("MuiChartsLabel", slot);
}
generateUtilityClasses("MuiChartsLabel", ["root"]);
var useUtilityClasses$1 = (props) => {
	return composeClasses({ root: ["root"] }, getLabelUtilityClass, props.classes);
};
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsLabel/ChartsLabel.js
var _excluded$6 = [
	"children",
	"className",
	"classes"
];
/**
* Generates the label mark for the tooltip and legend.
* @ignore - internal component.
*/
var ChartsLabel = consumeThemeProps("MuiChartsLabel", { classesResolver: useUtilityClasses$1 }, function ChartsLabel(props, ref) {
	const { children, className, classes } = props, other = _objectWithoutPropertiesLoose(props, _excluded$6);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", _extends({
		className: clsx(classes?.root, className),
		ref
	}, other, { children }));
});
ChartsLabel.propTypes = {
	children: import_prop_types.default.node,
	classes: import_prop_types.default.object
};
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsLegend/ChartsLegend.js
var _excluded$5 = [
	"direction",
	"onItemClick",
	"className",
	"classes",
	"toggleVisibilityOnClick"
];
var RootElement = styled("ul", {
	name: "MuiChartsLegend",
	slot: "Root"
})(({ ownerState, theme }) => _extends({}, theme.typography.caption, {
	color: (theme.vars || theme).palette.text.primary,
	lineHeight: "100%",
	display: "flex",
	flexDirection: ownerState.direction === "vertical" ? "column" : "row",
	alignItems: ownerState.direction === "vertical" ? void 0 : "center",
	flexShrink: 0,
	gap: theme.spacing(2),
	listStyleType: "none",
	paddingInlineStart: 0,
	marginBlock: theme.spacing(1),
	marginInline: theme.spacing(1),
	flexWrap: "wrap",
	li: { display: ownerState.direction === "horizontal" ? "inline-flex" : void 0 },
	[`button.${legendClasses.series}`]: {
		background: "none",
		border: "none",
		padding: 0,
		fontFamily: "inherit",
		fontWeight: "inherit",
		fontSize: "inherit",
		letterSpacing: "inherit",
		color: "inherit"
	},
	[`& .${legendClasses.series}`]: {
		display: ownerState.direction === "vertical" ? "flex" : "inline-flex",
		alignItems: "center",
		gap: theme.spacing(1),
		cursor: ownerState.onItemClick || ownerState.toggleVisibilityOnClick ? "pointer" : "default",
		[`&.${legendClasses.hidden}`]: { opacity: .5 }
	},
	gridArea: "legend"
}));
var ChartsLegend = consumeSlots("MuiChartsLegend", "legend", {
	defaultProps: { direction: "horizontal" },
	omitProps: ["position"],
	classesResolver: useUtilityClasses$2
}, /* @__PURE__ */ import_react.forwardRef(function ChartsLegend(props, ref) {
	const data = useLegend();
	const { instance } = useChartContext();
	const store = useStore();
	const seriesConfig = store.use(selectorChartSeriesConfig);
	const isItemVisible = store.use(selectorIsItemVisibleGetter);
	const { onItemClick, className, classes, toggleVisibilityOnClick } = props, other = _objectWithoutPropertiesLoose(props, _excluded$5);
	const isButton = Boolean(onItemClick || toggleVisibilityOnClick);
	const Element = isButton ? "button" : "div";
	const handleClick = useEventCallback((item, i) => (event) => {
		if (onItemClick && item) onItemClick(event, seriesContextBuilder(item), i);
		if (toggleVisibilityOnClick) instance.toggleItemVisibility({
			type: item.type,
			seriesId: item.seriesId,
			dataIndex: item.dataIndex
		});
	});
	if (data.items.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RootElement, _extends({
		className: clsx(classes?.root, className),
		ref
	}, other, {
		ownerState: props,
		children: data.items.map((item, i) => {
			const isVisible = isItemVisible(seriesConfig, {
				type: item.type,
				seriesId: item.seriesId,
				dataIndex: item.dataIndex
			});
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: classes?.item,
				"data-series": item.seriesId,
				"data-index": item.dataIndex,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Element, {
					className: clsx(classes?.series, !isVisible && classes?.hidden),
					role: isButton ? "button" : void 0,
					type: isButton ? "button" : void 0,
					onClick: isButton ? handleClick(item, i) : void 0,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsLabelMark, {
						className: classes?.mark,
						color: item.color,
						type: item.markType
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsLabel, {
						className: classes?.label,
						children: item.label
					})]
				})
			}, `${item.seriesId}-${item.dataIndex}`);
		})
	}));
}));
ChartsLegend.displayName = "ChartsLegend";
ChartsLegend.propTypes = {
	classes: import_prop_types.default.object,
	className: import_prop_types.default.string,
	direction: import_prop_types.default.oneOf(["horizontal", "vertical"]),
	onItemClick: import_prop_types.default.func,
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
	toggleVisibilityOnClick: import_prop_types.default.bool
};
//#endregion
//#region node_modules/@mui/x-charts/esm/hooks/useInteractionItemProps.js
function onPointerDown(event) {
	if ("hasPointerCapture" in event.currentTarget && event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
}
var useInteractionItemProps = (data, skip) => {
	const { instance } = useChartContext();
	const interactionActive = import_react.useRef(false);
	const onPointerEnter = useEventCallback(() => {
		interactionActive.current = true;
		instance.setLastUpdateSource("pointer");
		instance.setTooltipItem(data);
		instance.setHighlight(data.type === "sankey" ? data : {
			seriesId: data.seriesId,
			dataIndex: data.dataIndex
		});
	});
	const onPointerLeave = useEventCallback(() => {
		interactionActive.current = false;
		instance.removeTooltipItem(data);
		instance.clearHighlight();
	});
	import_react.useEffect(() => {
		return () => {
			if (interactionActive.current) onPointerLeave();
		};
	}, [onPointerLeave]);
	return import_react.useMemo(() => skip ? {} : {
		onPointerEnter,
		onPointerLeave,
		onPointerDown
	}, [
		skip,
		onPointerEnter,
		onPointerLeave
	]);
};
//#endregion
//#region node_modules/@mui/x-charts/esm/hooks/useSkipAnimation.js
/**
* A hook to get if chart animations should be skipped.
*
* @returns {boolean} whether to skip animations
*/
function useSkipAnimation(skipAnimation) {
	const storeSkipAnimation = useStore().use(selectorChartSkipAnimation);
	return skipAnimation || storeSkipAnimation;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsOverlay/ChartsLoadingOverlay.js
var _excluded$4 = ["message"];
var StyledText$1 = styled("text", {
	slot: "internal",
	shouldForwardProp: void 0
})(({ theme }) => _extends({}, theme.typography.body2, {
	stroke: "none",
	fill: (theme.vars || theme).palette.text.primary,
	shapeRendering: "crispEdges",
	textAnchor: "middle",
	dominantBaseline: "middle"
}));
function ChartsLoadingOverlay(props) {
	const { message } = props, other = _objectWithoutPropertiesLoose(props, _excluded$4);
	const { top, left, height, width } = useDrawingArea();
	const { localeText } = useChartsLocalization();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyledText$1, _extends({
		x: left + width / 2,
		y: top + height / 2
	}, other, { children: message ?? localeText.loading }));
}
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsOverlay/ChartsNoDataOverlay.js
var _excluded$3 = ["message"];
var StyledText = styled("text", {
	slot: "internal",
	shouldForwardProp: void 0
})(({ theme }) => _extends({}, theme.typography.body2, {
	stroke: "none",
	fill: (theme.vars || theme).palette.text.primary,
	shapeRendering: "crispEdges",
	textAnchor: "middle",
	dominantBaseline: "middle"
}));
function ChartsNoDataOverlay(props) {
	const { message } = props, other = _objectWithoutPropertiesLoose(props, _excluded$3);
	const { top, left, height, width } = useDrawingArea();
	const { localeText } = useChartsLocalization();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyledText, _extends({
		x: left + width / 2,
		y: top + height / 2
	}, other, { children: message ?? localeText.noData }));
}
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsOverlay/ChartsOverlay.js
function useNoData() {
	const seriesPerType = useSeries();
	return Object.values(seriesPerType).every((seriesOfGivenType) => {
		if (!seriesOfGivenType) return true;
		const { series, seriesOrder } = seriesOfGivenType;
		return seriesOrder.every((seriesId) => {
			const seriesItem = series[seriesId];
			if (seriesItem.type === "sankey") return seriesItem.data.links.length === 0;
			return seriesItem.data.length === 0;
		});
	});
}
function ChartsOverlay(props) {
	const noData = useNoData();
	if (props.loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(props.slots?.loadingOverlay ?? ChartsLoadingOverlay, _extends({}, props.slotProps?.loadingOverlay));
	if (noData) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(props.slots?.noDataOverlay ?? ChartsNoDataOverlay, _extends({}, props.slotProps?.noDataOverlay));
	return null;
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/components/ChartsAxesGradients/ChartsPiecewiseGradient.js
function ChartsPiecewiseGradient(props) {
	const { isReversed, gradientId, size, direction, scale, colorMap } = props;
	if (size <= 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("linearGradient", {
		id: gradientId,
		x1: "0",
		x2: "0",
		y1: "0",
		y2: "0",
		[`${direction}${isReversed ? 1 : 2}`]: `${size}px`,
		gradientUnits: "userSpaceOnUse",
		children: colorMap.thresholds.map((threshold, index) => {
			const x = scale(threshold);
			if (x === void 0) return null;
			const offset = isReversed ? 1 - x / size : x / size;
			if (Number.isNaN(offset)) return null;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
				offset,
				stopColor: colorMap.colors[index],
				stopOpacity: 1
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
				offset,
				stopColor: colorMap.colors[index + 1],
				stopOpacity: 1
			})] }, threshold.toString() + index);
		})
	});
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/components/ChartsAxesGradients/ChartsContinuousGradient.js
var PX_PRECISION$1 = 10;
function ChartsContinuousGradient(props) {
	const { gradientUnits, isReversed, gradientId, size, direction, scale, colorScale, colorMap } = props;
	const extremumValues = [colorMap.min ?? 0, colorMap.max ?? 100];
	const extremumPositions = extremumValues.map(scale).filter((p) => p !== void 0);
	if (extremumPositions.length !== 2) return null;
	const interpolator = typeof extremumValues[0] === "number" ? number_default(extremumValues[0], extremumValues[1]) : date_default(extremumValues[0], extremumValues[1]);
	const numberOfPoints = Math.round((Math.max(...extremumPositions) - Math.min(...extremumPositions)) / PX_PRECISION$1);
	const keyPrefix = `${extremumValues[0]}-${extremumValues[1]}-`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("linearGradient", {
		id: gradientId,
		x1: "0",
		x2: "0",
		y1: "0",
		y2: "0",
		[`${direction}${isReversed ? 1 : 2}`]: gradientUnits === "objectBoundingBox" ? 1 : `${size}px`,
		gradientUnits: gradientUnits ?? "userSpaceOnUse",
		children: Array.from({ length: numberOfPoints + 1 }, (_, index) => {
			const value = interpolator(index / numberOfPoints);
			if (value === void 0) return null;
			const x = scale(value);
			if (x === void 0) return null;
			const offset = isReversed ? 1 - x / size : x / size;
			const color = colorScale(value);
			if (color === null) return null;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
				offset,
				stopColor: color,
				stopOpacity: 1
			}, keyPrefix + index);
		})
	});
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/components/ChartsAxesGradients/ChartsContinuousGradientObjectBound.js
var PX_PRECISION = 10;
var getDirection = (isReversed) => {
	if (isReversed) return {
		x1: "1",
		x2: "0",
		y1: "0",
		y2: "0"
	};
	return {
		x1: "0",
		x2: "1",
		y1: "0",
		y2: "0"
	};
};
/**
* Generates gradients to be used in tooltips and legends.
*/
function ChartsContinuousGradientObjectBound(props) {
	const { isReversed, gradientId, colorScale, colorMap } = props;
	const extremumValues = [colorMap.min ?? 0, colorMap.max ?? 100];
	const interpolator = typeof extremumValues[0] === "number" ? number_default(extremumValues[0], extremumValues[1]) : date_default(extremumValues[0], extremumValues[1]);
	const numberOfPoints = PX_PRECISION;
	const keyPrefix = `${extremumValues[0]}-${extremumValues[1]}-`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("linearGradient", _extends({ id: gradientId }, getDirection(isReversed), {
		gradientUnits: "objectBoundingBox",
		children: Array.from({ length: numberOfPoints + 1 }, (_, index) => {
			const offset = index / numberOfPoints;
			const value = interpolator(offset);
			if (value === void 0) return null;
			const color = colorScale(value);
			if (color === null) return null;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
				offset,
				stopColor: color,
				stopOpacity: 1
			}, keyPrefix + index);
		})
	}));
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/components/ChartsAxesGradients/ChartsAxesGradients.js
function ChartsAxesGradients() {
	const { top, height, bottom, left, width, right } = useDrawingArea();
	const svgHeight = top + height + bottom;
	const svgWidth = left + width + right;
	const getGradientId = useChartGradientIdBuilder();
	const getObjectBoundGradientId = useChartGradientIdObjectBoundBuilder();
	const { xAxis, xAxisIds } = useXAxes();
	const { yAxis, yAxisIds } = useYAxes();
	const { zAxis, zAxisIds } = useZAxes();
	const filteredYAxisIds = yAxisIds.filter((axisId) => yAxis[axisId].colorMap !== void 0);
	const filteredXAxisIds = xAxisIds.filter((axisId) => xAxis[axisId].colorMap !== void 0);
	const filteredZAxisIds = zAxisIds.filter((axisId) => zAxis[axisId].colorMap !== void 0);
	if (filteredYAxisIds.length === 0 && filteredXAxisIds.length === 0 && filteredZAxisIds.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [
		filteredYAxisIds.map((axisId) => {
			const gradientId = getGradientId(axisId);
			const objectBoundGradientId = getObjectBoundGradientId(axisId);
			const { colorMap, scale, colorScale, reverse } = yAxis[axisId];
			if (colorMap?.type === "piecewise") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsPiecewiseGradient, {
				isReversed: !reverse,
				scale,
				colorMap,
				size: svgHeight,
				gradientId,
				direction: "y"
			}, gradientId);
			if (colorMap?.type === "continuous") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsContinuousGradient, {
				isReversed: !reverse,
				scale,
				colorScale,
				colorMap,
				size: svgHeight,
				gradientId,
				direction: "y"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsContinuousGradientObjectBound, {
				isReversed: reverse,
				colorScale,
				colorMap,
				gradientId: objectBoundGradientId
			})] }, gradientId);
			return null;
		}),
		filteredXAxisIds.map((axisId) => {
			const gradientId = getGradientId(axisId);
			const objectBoundGradientId = getObjectBoundGradientId(axisId);
			const { colorMap, scale, reverse, colorScale } = xAxis[axisId];
			if (colorMap?.type === "piecewise") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsPiecewiseGradient, {
				isReversed: reverse,
				scale,
				colorMap,
				size: svgWidth,
				gradientId,
				direction: "x"
			}, gradientId);
			if (colorMap?.type === "continuous") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsContinuousGradient, {
				isReversed: reverse,
				scale,
				colorScale,
				colorMap,
				size: svgWidth,
				gradientId,
				direction: "x"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsContinuousGradientObjectBound, {
				isReversed: reverse,
				colorScale,
				colorMap,
				gradientId: objectBoundGradientId
			})] }, gradientId);
			return null;
		}),
		filteredZAxisIds.map((axisId) => {
			const objectBoundGradientId = getObjectBoundGradientId(axisId);
			const { colorMap, colorScale } = zAxis[axisId];
			if (colorMap?.type === "continuous") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsContinuousGradientObjectBound, {
				colorScale,
				colorMap,
				gradientId: objectBoundGradientId
			}, objectBoundGradientId);
			return null;
		})
	] });
}
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsSurface/chartsSurfaceClasses.js
function getSurfaceUtilityClass(slot) {
	return generateUtilityClass("MuiChartsSurface", slot);
}
var useUtilityClasses = () => {
	return composeClasses({ root: ["root"] }, getSurfaceUtilityClass);
};
generateUtilityClasses("MuiChartsSurface", ["root"]);
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsSurface/ChartsSurface.js
var _excluded$2 = [
	"children",
	"className",
	"title",
	"desc"
];
var ChartsSurfaceStyles = styled("svg", {
	name: "MuiChartsSurface",
	slot: "Root"
})(({ ownerState }) => ({
	width: ownerState.width ?? "100%",
	height: ownerState.height ?? "100%",
	display: "flex",
	position: "relative",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	overflow: "hidden",
	touchAction: "pan-y",
	userSelect: "none",
	gridArea: "chart",
	"&:focus": { outline: "none" }
}));
/**
* It provides the drawing area for the chart elements.
* It is the root `<svg>` of all the chart elements.
*
* It also provides the `title` and `desc` elements for the chart.
*
* Demos:
*
* - [Composition](https://mui.com/x/api/charts/composition/)
*
* API:
*
* - [ChartsSurface API](https://mui.com/x/api/charts/charts-surface/)
*/
var ChartsSurface = /* @__PURE__ */ import_react.forwardRef(function ChartsSurface(inProps, ref) {
	const { store, instance } = useChartContext();
	const svgWidth = store.use(selectorChartSvgWidth);
	const svgHeight = store.use(selectorChartSvgHeight);
	const propsWidth = store.use(selectorChartPropsWidth);
	const propsHeight = store.use(selectorChartPropsHeight);
	const isKeyboardNavigationEnabled = store.use(selectorChartsIsKeyboardNavigationEnabled);
	const hasFocusedItem = store.use(selectorChartsHasFocusedItem);
	const handleRef = useForkRef(useSvgRef(), ref);
	const themeProps = useThemeProps({
		props: inProps,
		name: "MuiChartsSurface"
	});
	const { children, className, title, desc } = themeProps, other = _objectWithoutPropertiesLoose(themeProps, _excluded$2);
	const classes = useUtilityClasses();
	const hasIntrinsicSize = svgHeight > 0 && svgWidth > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ChartsSurfaceStyles, _extends({
		ownerState: {
			width: propsWidth,
			height: propsHeight
		},
		viewBox: `0 0 ${svgWidth} ${svgHeight}`,
		className: clsx(classes.root, className),
		tabIndex: isKeyboardNavigationEnabled ? 0 : void 0,
		"data-has-focused-item": hasFocusedItem || void 0
	}, other, {
		onPointerEnter: (event) => {
			other.onPointerEnter?.(event);
			instance.handlePointerEnter?.(event);
		},
		onPointerLeave: (event) => {
			other.onPointerLeave?.(event);
			instance.handlePointerLeave?.(event);
		},
		onClick: (event) => {
			other.onClick?.(event);
			instance.handleClick?.(event);
		},
		ref: handleRef,
		children: [
			title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: title }),
			desc && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("desc", { children: desc }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsAxesGradients, {}),
			hasIntrinsicSize && children
		]
	}));
});
ChartsSurface.displayName = "ChartsSurface";
ChartsSurface.propTypes = {
	children: import_prop_types.default.node,
	className: import_prop_types.default.string,
	desc: import_prop_types.default.string,
	sx: import_prop_types.default.oneOfType([
		import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([
			import_prop_types.default.func,
			import_prop_types.default.object,
			import_prop_types.default.bool
		])),
		import_prop_types.default.func,
		import_prop_types.default.object
	]),
	title: import_prop_types.default.string
};
var defaultSlotsMaterial = _extends({}, {
	baseButton: Button,
	baseIconButton: IconButton
}, {});
//#endregion
//#region node_modules/@mui/x-charts/esm/context/ChartsSlotsContext.js
var ChartsSlotsContext = /* @__PURE__ */ import_react.createContext(null);
ChartsSlotsContext.displayName = "ChartsSlotsContext";
function ChartsSlotsProvider(props) {
	const { slots, slotProps = {}, defaultSlots, children } = props;
	const value = import_react.useMemo(() => ({
		slots: _extends({}, defaultSlots, slots),
		slotProps
	}), [
		defaultSlots,
		slots,
		slotProps
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsSlotsContext.Provider, {
		value,
		children
	});
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartClosestPoint/findClosestPoints.js
function findClosestPoints(flatbush, seriesData, xScale, yScale, xZoomStart, xZoomEnd, yZoomStart, yZoomEnd, svgPointX, svgPointY, maxRadius = Infinity, maxResults = 1) {
	const originalXScale = xScale.copy();
	const originalYScale = yScale.copy();
	originalXScale.range([0, 1]);
	originalYScale.range([0, 1]);
	const excludeIfOutsideDrawingArea = function excludeIfOutsideDrawingArea(index) {
		const x = originalXScale(seriesData[index].x);
		const y = originalYScale(seriesData[index].y);
		return x >= xZoomStart && x <= xZoomEnd && y >= yZoomStart && y <= yZoomEnd;
	};
	const fx = xScale.range()[1] - xScale.range()[0];
	const fy = yScale.range()[1] - yScale.range()[0];
	const fxSq = fx * fx;
	const fySq = fy * fy;
	function sqDistFn(dx, dy) {
		return fxSq * dx * dx + fySq * dy * dy;
	}
	const pointX = originalXScale(invertScale(xScale, svgPointX, (dataIndex) => seriesData[dataIndex]?.x));
	const pointY = originalYScale(invertScale(yScale, svgPointY, (dataIndex) => seriesData[dataIndex]?.y));
	return flatbush.neighbors(pointX, pointY, maxResults, maxRadius != null ? maxRadius * maxRadius : Infinity, excludeIfOutsideDrawingArea, sqDistFn);
}
function invertScale(scale, value, getDataPoint) {
	if (isOrdinalScale(scale)) return getDataPoint(scale.bandwidth() === 0 ? Math.floor((value - Math.min(...scale.range()) + scale.step() / 2) / scale.step()) : Math.floor((value - Math.min(...scale.range())) / scale.step()));
	return scale.invert(value);
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/featurePlugins/useChartClosestPoint/useChartClosestPoint.js
var useChartClosestPoint = ({ svgRef, params, store, instance }) => {
	const { disableVoronoi, voronoiMaxRadius, onItemClick } = params;
	const { axis: xAxis, axisIds: xAxisIds } = store.use(selectorChartXAxis);
	const { axis: yAxis, axisIds: yAxisIds } = store.use(selectorChartYAxis);
	const zoomIsInteracting = store.use(selectorChartZoomIsInteracting);
	const { series, seriesOrder } = store.use(selectorChartSeriesProcessed)?.scatter ?? {};
	const flatbushMap = store.use(zoomIsInteracting ? selectorChartSeriesEmptyFlatbushMap : selectorChartSeriesFlatbushMap);
	const defaultXAxisId = xAxisIds[0];
	const defaultYAxisId = yAxisIds[0];
	useEnhancedEffect(() => {
		store.set("voronoi", { isVoronoiEnabled: !disableVoronoi });
	}, [store, disableVoronoi]);
	import_react.useEffect(() => {
		if (svgRef.current === null || disableVoronoi) return;
		const element = svgRef.current;
		function getClosestPoint(event) {
			const svgPoint = getSVGPoint(element, event);
			if (!instance.isPointInside(svgPoint.x, svgPoint.y)) return "outside-chart";
			let closestPoint = void 0;
			for (const seriesId of seriesOrder ?? []) {
				const aSeries = (series ?? {})[seriesId];
				const flatbush = flatbushMap.get(seriesId);
				if (!flatbush) continue;
				const xAxisId = aSeries.xAxisId ?? defaultXAxisId;
				const yAxisId = aSeries.yAxisId ?? defaultYAxisId;
				const xAxisZoom = selectorChartAxisZoomData(store.state, xAxisId);
				const yAxisZoom = selectorChartAxisZoomData(store.state, yAxisId);
				const maxRadius = voronoiMaxRadius === "item" ? aSeries.markerSize : voronoiMaxRadius;
				const xZoomStart = (xAxisZoom?.start ?? 0) / 100;
				const xZoomEnd = (xAxisZoom?.end ?? 100) / 100;
				const yZoomStart = (yAxisZoom?.start ?? 0) / 100;
				const yZoomEnd = (yAxisZoom?.end ?? 100) / 100;
				const xScale = xAxis[xAxisId].scale;
				const yScale = yAxis[yAxisId].scale;
				const closestPointIndex = findClosestPoints(flatbush, aSeries.data, xScale, yScale, xZoomStart, xZoomEnd, yZoomStart, yZoomEnd, svgPoint.x, svgPoint.y, maxRadius)[0];
				if (closestPointIndex === void 0) continue;
				const point = aSeries.data[closestPointIndex];
				const scaledX = xScale(point.x);
				const scaledY = yScale(point.y);
				const distSq = (scaledX - svgPoint.x) ** 2 + (scaledY - svgPoint.y) ** 2;
				if (closestPoint === void 0 || distSq < closestPoint.distanceSq) closestPoint = {
					dataIndex: closestPointIndex,
					seriesId,
					distanceSq: distSq
				};
			}
			if (closestPoint === void 0) return "no-point-found";
			return {
				seriesId: closestPoint.seriesId,
				dataIndex: closestPoint.dataIndex
			};
		}
		const moveEndHandler = instance.addInteractionListener("moveEnd", (event) => {
			if (!event.detail.activeGestures.pan) {
				instance.cleanInteraction?.();
				instance.clearHighlight?.();
				instance.removeTooltipItem?.();
			}
		});
		const panEndHandler = instance.addInteractionListener("panEnd", (event) => {
			if (!event.detail.activeGestures.move) {
				instance.cleanInteraction?.();
				instance.clearHighlight?.();
				instance.removeTooltipItem?.();
			}
		});
		const pressEndHandler = instance.addInteractionListener("quickPressEnd", (event) => {
			if (!event.detail.activeGestures.move && !event.detail.activeGestures.pan) {
				instance.cleanInteraction?.();
				instance.clearHighlight?.();
				instance.removeTooltipItem?.();
			}
		});
		const gestureHandler = (event) => {
			const closestPoint = getClosestPoint(event.detail.srcEvent);
			if (closestPoint === "outside-chart") {
				instance.cleanInteraction?.();
				instance.clearHighlight?.();
				instance.removeTooltipItem?.();
				return;
			}
			if (closestPoint === "outside-voronoi-max-radius" || closestPoint === "no-point-found") {
				instance.removeTooltipItem?.();
				instance.clearHighlight?.();
				instance.removeTooltipItem?.();
				return;
			}
			const { seriesId, dataIndex } = closestPoint;
			instance.setTooltipItem?.({
				type: "scatter",
				seriesId,
				dataIndex
			});
			instance.setLastUpdateSource?.("pointer");
			instance.setHighlight?.({
				seriesId,
				dataIndex
			});
		};
		const tapHandler = instance.addInteractionListener("tap", (event) => {
			const closestPoint = getClosestPoint(event.detail.srcEvent);
			if (typeof closestPoint !== "string" && onItemClick) {
				const { seriesId, dataIndex } = closestPoint;
				onItemClick(event.detail.srcEvent, {
					type: "scatter",
					seriesId,
					dataIndex
				});
			}
		});
		const moveHandler = instance.addInteractionListener("move", gestureHandler);
		const panHandler = instance.addInteractionListener("pan", gestureHandler);
		const pressHandler = instance.addInteractionListener("quickPress", gestureHandler);
		return () => {
			tapHandler.cleanup();
			moveHandler.cleanup();
			moveEndHandler.cleanup();
			panHandler.cleanup();
			panEndHandler.cleanup();
			pressHandler.cleanup();
			pressEndHandler.cleanup();
		};
	}, [
		svgRef,
		yAxis,
		xAxis,
		voronoiMaxRadius,
		onItemClick,
		disableVoronoi,
		instance,
		seriesOrder,
		series,
		flatbushMap,
		defaultXAxisId,
		defaultYAxisId,
		store
	]);
	return { instance: {
		enableVoronoi: useEventCallback(() => {
			store.set("voronoi", { isVoronoiEnabled: true });
		}),
		disableVoronoi: useEventCallback(() => {
			store.set("voronoi", { isVoronoiEnabled: false });
		})
	} };
};
useChartClosestPoint.getDefaultizedParams = ({ params }) => _extends({}, params, { disableVoronoi: params.disableVoronoi ?? !params.series.some((item) => item.type === "scatter") });
useChartClosestPoint.getInitialState = (params) => ({ voronoi: { isVoronoiEnabled: !params.disableVoronoi } });
useChartClosestPoint.params = {
	disableVoronoi: true,
	voronoiMaxRadius: true,
	onItemClick: true
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/plugins/allPlugins.js
var DEFAULT_PLUGINS = [
	useChartZAxis,
	useChartBrush,
	useChartTooltip,
	useChartInteraction,
	useChartCartesianAxis,
	useChartHighlight,
	useChartVisibilityManager,
	useChartClosestPoint,
	useChartKeyboardNavigation
];
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsDataProvider/useChartsDataProviderProps.js
var _excluded$1 = [
	"children",
	"localeText",
	"plugins",
	"slots",
	"slotProps",
	"seriesConfig"
];
var useChartsDataProviderProps = (inProps) => {
	const props = useThemeProps({
		props: inProps,
		name: "MuiChartDataProvider"
	});
	const { children, localeText, plugins = DEFAULT_PLUGINS, slots, slotProps, seriesConfig } = props, other = _objectWithoutPropertiesLoose(props, _excluded$1);
	return {
		children,
		localeText,
		chartProviderProps: {
			plugins,
			seriesConfig,
			pluginParams: _extends({ theme: useTheme$1().palette.mode }, other)
		},
		slots,
		slotProps
	};
};
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsDataProvider/ChartsDataProvider.js
/**
* Orchestrates the data providers for the chart components and hooks.
*
* Use this component if you have custom HTML components that need to access the chart data.
*
* Demos:
*
* - [Composition](https://mui.com/x/react-charts/composition/)
*
* API:
*
* - [ChartsDataProvider API](https://mui.com/x/api/charts/charts-data-provider/)
*
* @example
* ```jsx
* <ChartsDataProvider
*   series={[{ label: "Label", type: "bar", data: [10, 20] }]}
*   xAxis={[{ data: ["A", "B"], scaleType: "band", id: "x-axis" }]}
* >
*   <ChartsSurface>
*      <BarPlot />
*      <ChartsXAxis axisId="x-axis" />
*   </ChartsSurface>
*   {'Custom Legend Component'}
* </ChartsDataProvider>
* ```
*/
function ChartsDataProvider(props) {
	const { children, localeText, chartProviderProps, slots, slotProps } = useChartsDataProviderProps(props);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsProvider, _extends({}, chartProviderProps, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsLocalizationProvider, {
		localeText,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsSlotsProvider, {
			slots,
			slotProps,
			defaultSlots: defaultSlotsMaterial,
			children
		})
	}) }));
}
ChartsDataProvider.propTypes = {
	apiRef: import_prop_types.default.shape({ current: import_prop_types.default.any }),
	colors: import_prop_types.default.oneOfType([import_prop_types.default.arrayOf(import_prop_types.default.string), import_prop_types.default.func]),
	dataset: import_prop_types.default.arrayOf(import_prop_types.default.object),
	experimentalFeatures: import_prop_types.default.shape({ preferStrictDomainInLineCharts: import_prop_types.default.bool }),
	height: import_prop_types.default.number,
	id: import_prop_types.default.string,
	localeText: import_prop_types.default.object,
	margin: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.shape({
		bottom: import_prop_types.default.number,
		left: import_prop_types.default.number,
		right: import_prop_types.default.number,
		top: import_prop_types.default.number
	})]),
	series: import_prop_types.default.arrayOf(import_prop_types.default.object),
	skipAnimation: import_prop_types.default.bool,
	slotProps: import_prop_types.default.object,
	slots: import_prop_types.default.object,
	theme: import_prop_types.default.oneOf(["dark", "light"]),
	width: import_prop_types.default.number
};
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartDataProvider/ChartDataProvider.js
/**
* @deprecated Use `ChartsDataProviderSlots` instead. We added S to the charts prefix to align with other components.
*/
/**
* @deprecated Use `ChartsDataProviderSlotProps` instead. We added S to the charts prefix to align with other components.
*/
/**
* @deprecated Use `ChartsDataProviderProps` instead. We added S to the charts prefix to align with other components.
*/
/**
* @deprecated Use `ChartsDataProvider` instead. We added S to the charts prefix to align with other components.
*/
var ChartDataProvider = ChartsDataProvider;
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsContainer/useChartsContainerProps.js
var _excluded = [
	"width",
	"height",
	"margin",
	"children",
	"series",
	"colors",
	"dataset",
	"desc",
	"onAxisClick",
	"highlightedAxis",
	"onHighlightedAxisChange",
	"tooltipItem",
	"onTooltipItemChange",
	"disableVoronoi",
	"voronoiMaxRadius",
	"onItemClick",
	"disableAxisListener",
	"highlightedItem",
	"onHighlightChange",
	"sx",
	"title",
	"xAxis",
	"yAxis",
	"zAxis",
	"rotationAxis",
	"radiusAxis",
	"skipAnimation",
	"seriesConfig",
	"plugins",
	"localeText",
	"slots",
	"slotProps",
	"experimentalFeatures",
	"enableKeyboardNavigation",
	"brushConfig",
	"onHiddenItemsChange",
	"hiddenItems",
	"initialHiddenItems"
];
var useChartsContainerProps = (props, ref) => {
	const _ref = props, { width, height, margin, children, series, colors, dataset, desc, onAxisClick, highlightedAxis, onHighlightedAxisChange, tooltipItem, onTooltipItemChange, disableVoronoi, voronoiMaxRadius, onItemClick, disableAxisListener, highlightedItem, onHighlightChange, sx, title, xAxis, yAxis, zAxis, rotationAxis, radiusAxis, skipAnimation, seriesConfig, plugins, localeText, slots, slotProps, experimentalFeatures, enableKeyboardNavigation, brushConfig, onHiddenItemsChange, hiddenItems, initialHiddenItems } = _ref, other = _objectWithoutPropertiesLoose(_ref, _excluded);
	const chartsSurfaceProps = _extends({
		title,
		desc,
		sx,
		ref
	}, other);
	return {
		chartDataProviderProps: {
			margin,
			series,
			colors,
			dataset,
			disableAxisListener,
			highlightedItem,
			onHighlightChange,
			onAxisClick,
			highlightedAxis,
			onHighlightedAxisChange,
			tooltipItem,
			onTooltipItemChange,
			disableVoronoi,
			voronoiMaxRadius,
			onItemClick,
			xAxis,
			yAxis,
			zAxis,
			rotationAxis,
			radiusAxis,
			skipAnimation,
			width,
			height,
			localeText,
			seriesConfig,
			experimentalFeatures,
			enableKeyboardNavigation,
			brushConfig,
			onHiddenItemsChange,
			hiddenItems,
			initialHiddenItems,
			plugins: plugins ?? DEFAULT_PLUGINS,
			slots,
			slotProps
		},
		chartsSurfaceProps,
		children
	};
};
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartContainer/useChartContainerProps.js
/**
* @deprecated Use `UseChartsContainerPropsReturnValue` instead.
*/
/**
* @deprecated Use `useChartsContainerProps` instead.
*/
var useChartContainerProps = (props, ref) => {
	return useChartsContainerProps(props, ref);
};
//#endregion
//#region node_modules/@mui/x-charts/esm/Toolbar/chartToolbarClasses.js
var chartsToolbarClasses = generateUtilityClasses("MuiChartsToolbar", ["root"]);
//#endregion
//#region node_modules/@mui/x-charts/esm/ChartsWrapper/ChartsWrapper.js
var getJustifyItems = (position) => {
	if (position?.horizontal === "start") return "start";
	if (position?.horizontal === "end") return "end";
	return "center";
};
var getAlignItems = (position) => {
	if (position?.vertical === "top") return "flex-start";
	if (position?.vertical === "bottom") return "flex-end";
	return "center";
};
var getGridTemplateAreas = (hideLegend, direction, position) => {
	if (hideLegend) return `"chart"`;
	if (direction === "vertical") {
		if (position?.horizontal === "start") return `"legend chart"`;
		return `"chart legend"`;
	}
	if (position?.vertical === "bottom") return `"chart"
            "legend"`;
	return `"legend"
          "chart"`;
};
var getTemplateColumns = (hideLegend = false, direction = "horizontal", horizontalPosition = "end", width = void 0) => {
	const drawingAreaColumn = width ? "auto" : "1fr";
	if (direction === "horizontal") return drawingAreaColumn;
	if (hideLegend) return drawingAreaColumn;
	return horizontalPosition === "start" ? `auto ${drawingAreaColumn}` : `${drawingAreaColumn} auto`;
};
var getTemplateRows = (hideLegend = false, direction = "horizontal", verticalPosition = "top") => {
	const drawingAreaRow = "1fr";
	if (direction === "vertical") return drawingAreaRow;
	if (hideLegend) return drawingAreaRow;
	return verticalPosition === "bottom" ? `${drawingAreaRow} auto` : `auto ${drawingAreaRow}`;
};
var Root = styled("div", {
	name: "MuiChartsWrapper",
	slot: "Root",
	shouldForwardProp: (prop) => shouldForwardProp(prop) && prop !== "extendVertically" && prop !== "width"
})(({ ownerState, width }) => {
	const gridTemplateColumns = getTemplateColumns(ownerState.hideLegend, ownerState.legendDirection, ownerState.legendPosition?.horizontal, width);
	const gridTemplateRows = getTemplateRows(ownerState.hideLegend, ownerState.legendDirection, ownerState.legendPosition?.vertical);
	const gridTemplateAreas = getGridTemplateAreas(ownerState.hideLegend, ownerState.legendDirection, ownerState.legendPosition);
	return {
		variants: [{
			props: { extendVertically: true },
			style: {
				height: "100%",
				minHeight: 0
			}
		}],
		flex: 1,
		display: "grid",
		gridTemplateColumns,
		gridTemplateRows,
		gridTemplateAreas,
		[`&:has(.${chartsToolbarClasses.root})`]: {
			gridTemplateRows: `auto ${gridTemplateRows}`,
			gridTemplateAreas: `"${gridTemplateColumns.split(" ").map(() => "toolbar").join(" ")}"
        ${gridTemplateAreas}`
		},
		[`& .${chartsToolbarClasses.root}`]: {
			gridArea: "toolbar",
			justifySelf: "center"
		},
		justifyContent: "safe center",
		justifyItems: getJustifyItems(ownerState.legendPosition),
		alignItems: getAlignItems(ownerState.legendPosition)
	};
});
/**
* Wrapper for the charts components.
* Its main purpose is to position the HTML legend in the correct place.
*/
function ChartsWrapper(props) {
	const { children, sx, extendVertically } = props;
	const chartRootRef = useChartRootRef();
	const store = useStore();
	const propsWidth = store.use(selectorChartPropsWidth);
	const propsHeight = store.use(selectorChartPropsHeight);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
		ref: chartRootRef,
		ownerState: props,
		sx,
		extendVertically: extendVertically ?? propsHeight === void 0,
		width: propsWidth,
		children
	});
}
ChartsWrapper.propTypes = {
	children: import_prop_types.default.node,
	extendVertically: import_prop_types.default.bool,
	hideLegend: import_prop_types.default.bool,
	legendDirection: import_prop_types.default.oneOf(["horizontal", "vertical"]),
	legendPosition: import_prop_types.default.shape({
		horizontal: import_prop_types.default.oneOf([
			"center",
			"end",
			"start"
		]),
		vertical: import_prop_types.default.oneOf([
			"bottom",
			"middle",
			"top"
		])
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
export { deg2rad as $, getPieCoordinates as A, DEFAULT_X_AXIS_KEY as At, atan2 as B, useChartId as C, number_default as Ct, clampAngle as D, useChartVisibilityManager as Dt, useYAxes as E, selectorChartSeriesProcessed as Et, getLabel as F, DEFAULT_PIE_CHART_MARGIN as Ft, min as G, epsilon as H, array_default as I, sqrt as J, pi as K, abs as L, getBarDimensions as M, reactMajor_default as Mt, getBandSize as N, createSelector as Nt, useStore as O, defaultizeMargin as Ot, getColor$3 as P, createSelectorMemoized as Pt, useChartZAxis as Q, acos as R, useSvgRef as S, string_default as St, useXAxes as T, selectorChartSeriesLayout as Tt, halfPi as U, cos as V, max as W, constant_default as X, tau as Y, useChartHighlight as Z, selectorChartSeriesHighlightedItem as _, selectorChartYAxis as _t, ChartsOverlay as a, selectorChartsKeyboardXAxisIndex as at, selectorChartsIsHighlightedCallback as b, isOrdinalScale as bt, ChartsLegend as c, useChartCartesianAxis as ct, useAnimate as d, selectorChartsInteractionYAxisIndex as dt, useChartKeyboardNavigation as et, ANIMATION_TIMING_FUNCTION as f, selectorChartsInteractionYAxisValue as ft, selectorChartIsSeriesHighlighted as g, selectorChartXAxis as gt, selectorChartIsSeriesFaded as h, getSVGPoint as ht, ChartsSurface as i, selectorChartsItemIsFocused as it, getColor$2 as j, DEFAULT_Y_AXIS_KEY as jt, useChartContext as k, selectorChartDrawingArea as kt, ChartsTooltip as l, selectorChartsInteractionXAxisIndex as lt, useItemHighlighted as m, useChartInteraction as mt, useChartContainerProps as n, useChartBrush as nt, useSkipAnimation as o, selectorChartsKeyboardYAxisIndex as ot, useChartGradientIdBuilder as p, selectorChartsLastInteraction as pt, sin as q, ChartDataProvider as r, selectorBrushShouldPreventAxisHighlight as rt, useInteractionItemProps as s, fastObjectShallowCompare as st, ChartsWrapper as t, useChartTooltip as tt, useFocusedItem as u, selectorChartsInteractionXAxisValue as ut, selectorChartSeriesUnfadedItem as v, selectorChartZoomIsInteracting as vt, useDrawingArea as w, warnOnce as wt, useAllSeriesOfType as x, isDateData as xt, selectorChartsIsFadedCallback as y, isBandScale as yt, asin as z };

//# sourceMappingURL=ChartsWrapper-D-1cORDO.js.map