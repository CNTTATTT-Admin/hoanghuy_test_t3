import { t as require_react } from "./react-TUYU05Ph.js";
require_react();
/**
* Returns the ref of a React element handling differences between React 19 and older versions.
* It will throw runtime error if the element is not a valid React element.
*
* @param element React.ReactElement
* @returns React.Ref<any> | null
*/
function getReactElementRef(element) {
	if (parseInt("19.2.4", 10) >= 19) return element?.props?.ref || null;
	return element?.ref || null;
}
//#endregion
export { getReactElementRef as t };

//# sourceMappingURL=getReactElementRef-BLmlkTO-.js.map