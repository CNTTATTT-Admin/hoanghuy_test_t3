import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { z as useEnhancedEffect } from "./styled-Cfnrj_1B.js";
//#region node_modules/@mui/utils/esm/useEventCallback/useEventCallback.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/**
* Inspired by https://github.com/facebook/react/issues/14099#issuecomment-440013892
* See RFC in https://github.com/reactjs/rfcs/pull/220
*/
function useEventCallback(fn) {
	const ref = import_react.useRef(fn);
	useEnhancedEffect(() => {
		ref.current = fn;
	});
	return import_react.useRef((...args) => (0, ref.current)(...args)).current;
}
//#endregion
export { useEventCallback as t };

//# sourceMappingURL=useEventCallback-DApYgXZO.js.map