import { r as __toESM, t as require_react } from "./react-TUYU05Ph.js";
import { Q as require_jsx_runtime, S as useId, U as generateUtilityClass, dt as clsx, ft as require_prop_types, i as useTheme, it as _extends, t as styled } from "./styled-Cfnrj_1B.js";
import { t as composeClasses } from "./composeClasses-CcRLdWkN.js";
import { d as useThemeProps } from "./styles-2xPq3NO2.js";
import { t as generateUtilityClasses } from "./generateUtilityClasses-D3p2lmXT.js";
import { C as useChartId, Dt as useChartVisibilityManager, E as useYAxes, I as array_default, J as sqrt, K as pi, Mt as reactMajor_default, O as useStore, Q as useChartZAxis, St as string_default, T as useXAxes, V as cos, X as constant_default, Y as tau, Z as useChartHighlight, a as ChartsOverlay, bt as isOrdinalScale, c as ChartsLegend, ct as useChartCartesianAxis, d as useAnimate, et as useChartKeyboardNavigation, f as ANIMATION_TIMING_FUNCTION, i as ChartsSurface, j as getColor, k as useChartContext, l as ChartsTooltip, m as useItemHighlighted, mt as useChartInteraction, n as useChartContainerProps, nt as useChartBrush, o as useSkipAnimation, p as useChartGradientIdBuilder, q as sin, r as ChartDataProvider, s as useInteractionItemProps, t as ChartsWrapper, tt as useChartTooltip, u as useFocusedItem, w as useDrawingArea, wt as warnOnce, x as useAllSeriesOfType } from "./ChartsWrapper-D-1cORDO.js";
import { r as _objectWithoutPropertiesLoose } from "./TransitionGroupContext-CmouUOv0.js";
import { a as useInternalIsZoomInteracting, i as ChartsAxis, n as ChartsClipPath, o as getValueToPositionMapper, r as ChartsAxisHighlight, s as selectorChartsHighlightXAxisIndex, t as ChartsGrid } from "./ChartsGrid-Ra5GowwI.js";
import { n as withPath, t as useItemHighlightedGetter } from "./useItemHighlightedGetter-Cf25g3tV.js";
import { t as useSlotProps } from "./useSlotProps-CORw1pTM.js";
//#region node_modules/d3-shape/src/curve/linear.js
function Linear(context) {
	this._context = context;
}
Linear.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._point = 0;
	},
	lineEnd: function() {
		if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
		this._line = 1 - this._line;
	},
	point: function(x, y) {
		x = +x, y = +y;
		switch (this._point) {
			case 0:
				this._point = 1;
				this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y);
				break;
			case 1: this._point = 2;
			default:
				this._context.lineTo(x, y);
				break;
		}
	}
};
function linear_default(context) {
	return new Linear(context);
}
//#endregion
//#region node_modules/d3-shape/src/point.js
function x(p) {
	return p[0];
}
function y(p) {
	return p[1];
}
//#endregion
//#region node_modules/d3-shape/src/line.js
function line_default(x$1, y$1) {
	var defined = constant_default(true), context = null, curve = linear_default, output = null, path = withPath(line);
	x$1 = typeof x$1 === "function" ? x$1 : x$1 === void 0 ? x : constant_default(x$1);
	y$1 = typeof y$1 === "function" ? y$1 : y$1 === void 0 ? y : constant_default(y$1);
	function line(data) {
		var i, n = (data = array_default(data)).length, d, defined0 = false, buffer;
		if (context == null) output = curve(buffer = path());
		for (i = 0; i <= n; ++i) {
			if (!(i < n && defined(d = data[i], i, data)) === defined0) if (defined0 = !defined0) output.lineStart();
			else output.lineEnd();
			if (defined0) output.point(+x$1(d, i, data), +y$1(d, i, data));
		}
		if (buffer) return output = null, buffer + "" || null;
	}
	line.x = function(_) {
		return arguments.length ? (x$1 = typeof _ === "function" ? _ : constant_default(+_), line) : x$1;
	};
	line.y = function(_) {
		return arguments.length ? (y$1 = typeof _ === "function" ? _ : constant_default(+_), line) : y$1;
	};
	line.defined = function(_) {
		return arguments.length ? (defined = typeof _ === "function" ? _ : constant_default(!!_), line) : defined;
	};
	line.curve = function(_) {
		return arguments.length ? (curve = _, context != null && (output = curve(context)), line) : curve;
	};
	line.context = function(_) {
		return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), line) : context;
	};
	return line;
}
//#endregion
//#region node_modules/d3-shape/src/area.js
function area_default(x0, y0, y1) {
	var x1 = null, defined = constant_default(true), context = null, curve = linear_default, output = null, path = withPath(area);
	x0 = typeof x0 === "function" ? x0 : x0 === void 0 ? x : constant_default(+x0);
	y0 = typeof y0 === "function" ? y0 : y0 === void 0 ? constant_default(0) : constant_default(+y0);
	y1 = typeof y1 === "function" ? y1 : y1 === void 0 ? y : constant_default(+y1);
	function area(data) {
		var i, j, k, n = (data = array_default(data)).length, d, defined0 = false, buffer, x0z = new Array(n), y0z = new Array(n);
		if (context == null) output = curve(buffer = path());
		for (i = 0; i <= n; ++i) {
			if (!(i < n && defined(d = data[i], i, data)) === defined0) if (defined0 = !defined0) {
				j = i;
				output.areaStart();
				output.lineStart();
			} else {
				output.lineEnd();
				output.lineStart();
				for (k = i - 1; k >= j; --k) output.point(x0z[k], y0z[k]);
				output.lineEnd();
				output.areaEnd();
			}
			if (defined0) {
				x0z[i] = +x0(d, i, data), y0z[i] = +y0(d, i, data);
				output.point(x1 ? +x1(d, i, data) : x0z[i], y1 ? +y1(d, i, data) : y0z[i]);
			}
		}
		if (buffer) return output = null, buffer + "" || null;
	}
	function arealine() {
		return line_default().defined(defined).curve(curve).context(context);
	}
	area.x = function(_) {
		return arguments.length ? (x0 = typeof _ === "function" ? _ : constant_default(+_), x1 = null, area) : x0;
	};
	area.x0 = function(_) {
		return arguments.length ? (x0 = typeof _ === "function" ? _ : constant_default(+_), area) : x0;
	};
	area.x1 = function(_) {
		return arguments.length ? (x1 = _ == null ? null : typeof _ === "function" ? _ : constant_default(+_), area) : x1;
	};
	area.y = function(_) {
		return arguments.length ? (y0 = typeof _ === "function" ? _ : constant_default(+_), y1 = null, area) : y0;
	};
	area.y0 = function(_) {
		return arguments.length ? (y0 = typeof _ === "function" ? _ : constant_default(+_), area) : y0;
	};
	area.y1 = function(_) {
		return arguments.length ? (y1 = _ == null ? null : typeof _ === "function" ? _ : constant_default(+_), area) : y1;
	};
	area.lineX0 = area.lineY0 = function() {
		return arealine().x(x0).y(y0);
	};
	area.lineY1 = function() {
		return arealine().x(x0).y(y1);
	};
	area.lineX1 = function() {
		return arealine().x(x1).y(y0);
	};
	area.defined = function(_) {
		return arguments.length ? (defined = typeof _ === "function" ? _ : constant_default(!!_), area) : defined;
	};
	area.curve = function(_) {
		return arguments.length ? (curve = _, context != null && (output = curve(context)), area) : curve;
	};
	area.context = function(_) {
		return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), area) : context;
	};
	return area;
}
//#endregion
//#region node_modules/d3-shape/src/curve/bump.js
var Bump = class {
	constructor(context, x) {
		this._context = context;
		this._x = x;
	}
	areaStart() {
		this._line = 0;
	}
	areaEnd() {
		this._line = NaN;
	}
	lineStart() {
		this._point = 0;
	}
	lineEnd() {
		if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
		this._line = 1 - this._line;
	}
	point(x, y) {
		x = +x, y = +y;
		switch (this._point) {
			case 0:
				this._point = 1;
				if (this._line) this._context.lineTo(x, y);
				else this._context.moveTo(x, y);
				break;
			case 1: this._point = 2;
			default:
				if (this._x) this._context.bezierCurveTo(this._x0 = (this._x0 + x) / 2, this._y0, this._x0, y, x, y);
				else this._context.bezierCurveTo(this._x0, this._y0 = (this._y0 + y) / 2, x, this._y0, x, y);
				break;
		}
		this._x0 = x, this._y0 = y;
	}
};
function bumpX(context) {
	return new Bump(context, true);
}
function bumpY(context) {
	return new Bump(context, false);
}
//#endregion
//#region node_modules/d3-shape/src/symbol/circle.js
var circle_default = { draw(context, size) {
	const r = sqrt(size / pi);
	context.moveTo(r, 0);
	context.arc(0, 0, r, 0, tau);
} };
//#endregion
//#region node_modules/d3-shape/src/symbol/cross.js
var cross_default = { draw(context, size) {
	const r = sqrt(size / 5) / 2;
	context.moveTo(-3 * r, -r);
	context.lineTo(-r, -r);
	context.lineTo(-r, -3 * r);
	context.lineTo(r, -3 * r);
	context.lineTo(r, -r);
	context.lineTo(3 * r, -r);
	context.lineTo(3 * r, r);
	context.lineTo(r, r);
	context.lineTo(r, 3 * r);
	context.lineTo(-r, 3 * r);
	context.lineTo(-r, r);
	context.lineTo(-3 * r, r);
	context.closePath();
} };
//#endregion
//#region node_modules/d3-shape/src/symbol/diamond.js
var tan30 = sqrt(1 / 3);
var tan30_2 = tan30 * 2;
var diamond_default = { draw(context, size) {
	const y = sqrt(size / tan30_2);
	const x = y * tan30;
	context.moveTo(0, -y);
	context.lineTo(x, 0);
	context.lineTo(0, y);
	context.lineTo(-x, 0);
	context.closePath();
} };
//#endregion
//#region node_modules/d3-shape/src/symbol/square.js
var square_default = { draw(context, size) {
	const w = sqrt(size);
	const x = -w / 2;
	context.rect(x, x, w, w);
} };
//#endregion
//#region node_modules/d3-shape/src/symbol/star.js
var ka = .8908130915292852;
var kr = sin(pi / 10) / sin(7 * pi / 10);
var kx = sin(tau / 10) * kr;
var ky = -cos(tau / 10) * kr;
var star_default = { draw(context, size) {
	const r = sqrt(size * ka);
	const x = kx * r;
	const y = ky * r;
	context.moveTo(0, -r);
	context.lineTo(x, y);
	for (let i = 1; i < 5; ++i) {
		const a = tau * i / 5;
		const c = cos(a);
		const s = sin(a);
		context.lineTo(s * r, -c * r);
		context.lineTo(c * x - s * y, s * x + c * y);
	}
	context.closePath();
} };
//#endregion
//#region node_modules/d3-shape/src/symbol/triangle.js
var sqrt3 = sqrt(3);
var triangle_default = { draw(context, size) {
	const y = -sqrt(size / (sqrt3 * 3));
	context.moveTo(0, y * 2);
	context.lineTo(-sqrt3 * y, -y);
	context.lineTo(sqrt3 * y, -y);
	context.closePath();
} };
//#endregion
//#region node_modules/d3-shape/src/symbol/wye.js
var c = -.5;
var s = sqrt(3) / 2;
var k = 1 / sqrt(12);
var a = (k / 2 + 1) * 3;
//#endregion
//#region node_modules/d3-shape/src/symbol.js
var symbolsFill = [
	circle_default,
	cross_default,
	diamond_default,
	square_default,
	star_default,
	triangle_default,
	{ draw(context, size) {
		const r = sqrt(size / a);
		const x0 = r / 2, y0 = r * k;
		const x1 = x0, y1 = r * k + r;
		const x2 = -x1, y2 = y1;
		context.moveTo(x0, y0);
		context.lineTo(x1, y1);
		context.lineTo(x2, y2);
		context.lineTo(c * x0 - s * y0, s * x0 + c * y0);
		context.lineTo(c * x1 - s * y1, s * x1 + c * y1);
		context.lineTo(c * x2 - s * y2, s * x2 + c * y2);
		context.lineTo(c * x0 + s * y0, c * y0 - s * x0);
		context.lineTo(c * x1 + s * y1, c * y1 - s * x1);
		context.lineTo(c * x2 + s * y2, c * y2 - s * x2);
		context.closePath();
	} }
];
function Symbol(type, size) {
	let context = null, path = withPath(symbol);
	type = typeof type === "function" ? type : constant_default(type || circle_default);
	size = typeof size === "function" ? size : constant_default(size === void 0 ? 64 : +size);
	function symbol() {
		let buffer;
		if (!context) context = buffer = path();
		type.apply(this, arguments).draw(context, +size.apply(this, arguments));
		if (buffer) return context = null, buffer + "" || null;
	}
	symbol.type = function(_) {
		return arguments.length ? (type = typeof _ === "function" ? _ : constant_default(_), symbol) : type;
	};
	symbol.size = function(_) {
		return arguments.length ? (size = typeof _ === "function" ? _ : constant_default(+_), symbol) : size;
	};
	symbol.context = function(_) {
		return arguments.length ? (context = _ == null ? null : _, symbol) : context;
	};
	return symbol;
}
//#endregion
//#region node_modules/d3-shape/src/curve/cardinal.js
function point$2(that, x, y) {
	that._context.bezierCurveTo(that._x1 + that._k * (that._x2 - that._x0), that._y1 + that._k * (that._y2 - that._y0), that._x2 + that._k * (that._x1 - x), that._y2 + that._k * (that._y1 - y), that._x2, that._y2);
}
function Cardinal(context, tension) {
	this._context = context;
	this._k = (1 - tension) / 6;
}
Cardinal.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN;
		this._point = 0;
	},
	lineEnd: function() {
		switch (this._point) {
			case 2:
				this._context.lineTo(this._x2, this._y2);
				break;
			case 3:
				point$2(this, this._x1, this._y1);
				break;
		}
		if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
		this._line = 1 - this._line;
	},
	point: function(x, y) {
		x = +x, y = +y;
		switch (this._point) {
			case 0:
				this._point = 1;
				this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y);
				break;
			case 1:
				this._point = 2;
				this._x1 = x, this._y1 = y;
				break;
			case 2: this._point = 3;
			default:
				point$2(this, x, y);
				break;
		}
		this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
		this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
	}
};
(function custom(tension) {
	function cardinal(context) {
		return new Cardinal(context, tension);
	}
	cardinal.tension = function(tension) {
		return custom(+tension);
	};
	return cardinal;
})(0);
//#endregion
//#region node_modules/d3-shape/src/curve/catmullRom.js
function point$1(that, x, y) {
	var x1 = that._x1, y1 = that._y1, x2 = that._x2, y2 = that._y2;
	if (that._l01_a > 1e-12) {
		var a = 2 * that._l01_2a + 3 * that._l01_a * that._l12_a + that._l12_2a, n = 3 * that._l01_a * (that._l01_a + that._l12_a);
		x1 = (x1 * a - that._x0 * that._l12_2a + that._x2 * that._l01_2a) / n;
		y1 = (y1 * a - that._y0 * that._l12_2a + that._y2 * that._l01_2a) / n;
	}
	if (that._l23_a > 1e-12) {
		var b = 2 * that._l23_2a + 3 * that._l23_a * that._l12_a + that._l12_2a, m = 3 * that._l23_a * (that._l23_a + that._l12_a);
		x2 = (x2 * b + that._x1 * that._l23_2a - x * that._l12_2a) / m;
		y2 = (y2 * b + that._y1 * that._l23_2a - y * that._l12_2a) / m;
	}
	that._context.bezierCurveTo(x1, y1, x2, y2, that._x2, that._y2);
}
function CatmullRom(context, alpha) {
	this._context = context;
	this._alpha = alpha;
}
CatmullRom.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN;
		this._l01_a = this._l12_a = this._l23_a = this._l01_2a = this._l12_2a = this._l23_2a = this._point = 0;
	},
	lineEnd: function() {
		switch (this._point) {
			case 2:
				this._context.lineTo(this._x2, this._y2);
				break;
			case 3:
				this.point(this._x2, this._y2);
				break;
		}
		if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
		this._line = 1 - this._line;
	},
	point: function(x, y) {
		x = +x, y = +y;
		if (this._point) {
			var x23 = this._x2 - x, y23 = this._y2 - y;
			this._l23_a = Math.sqrt(this._l23_2a = Math.pow(x23 * x23 + y23 * y23, this._alpha));
		}
		switch (this._point) {
			case 0:
				this._point = 1;
				this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y);
				break;
			case 1:
				this._point = 2;
				break;
			case 2: this._point = 3;
			default:
				point$1(this, x, y);
				break;
		}
		this._l01_a = this._l12_a, this._l12_a = this._l23_a;
		this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a;
		this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
		this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
	}
};
var catmullRom_default = (function custom(alpha) {
	function catmullRom(context) {
		return alpha ? new CatmullRom(context, alpha) : new Cardinal(context, 0);
	}
	catmullRom.alpha = function(alpha) {
		return custom(+alpha);
	};
	return catmullRom;
})(.5);
//#endregion
//#region node_modules/d3-shape/src/curve/monotone.js
function sign(x) {
	return x < 0 ? -1 : 1;
}
function slope3(that, x2, y2) {
	var h0 = that._x1 - that._x0, h1 = x2 - that._x1, s0 = (that._y1 - that._y0) / (h0 || h1 < 0 && -0), s1 = (y2 - that._y1) / (h1 || h0 < 0 && -0), p = (s0 * h1 + s1 * h0) / (h0 + h1);
	return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), .5 * Math.abs(p)) || 0;
}
function slope2(that, t) {
	var h = that._x1 - that._x0;
	return h ? (3 * (that._y1 - that._y0) / h - t) / 2 : t;
}
function point(that, t0, t1) {
	var x0 = that._x0, y0 = that._y0, x1 = that._x1, y1 = that._y1, dx = (x1 - x0) / 3;
	that._context.bezierCurveTo(x0 + dx, y0 + dx * t0, x1 - dx, y1 - dx * t1, x1, y1);
}
function MonotoneX(context) {
	this._context = context;
}
MonotoneX.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._x0 = this._x1 = this._y0 = this._y1 = this._t0 = NaN;
		this._point = 0;
	},
	lineEnd: function() {
		switch (this._point) {
			case 2:
				this._context.lineTo(this._x1, this._y1);
				break;
			case 3:
				point(this, this._t0, slope2(this, this._t0));
				break;
		}
		if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
		this._line = 1 - this._line;
	},
	point: function(x, y) {
		var t1 = NaN;
		x = +x, y = +y;
		if (x === this._x1 && y === this._y1) return;
		switch (this._point) {
			case 0:
				this._point = 1;
				this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y);
				break;
			case 1:
				this._point = 2;
				break;
			case 2:
				this._point = 3;
				point(this, slope2(this, t1 = slope3(this, x, y)), t1);
				break;
			default:
				point(this, this._t0, t1 = slope3(this, x, y));
				break;
		}
		this._x0 = this._x1, this._x1 = x;
		this._y0 = this._y1, this._y1 = y;
		this._t0 = t1;
	}
};
function MonotoneY(context) {
	this._context = new ReflectContext(context);
}
(MonotoneY.prototype = Object.create(MonotoneX.prototype)).point = function(x, y) {
	MonotoneX.prototype.point.call(this, y, x);
};
function ReflectContext(context) {
	this._context = context;
}
ReflectContext.prototype = {
	moveTo: function(x, y) {
		this._context.moveTo(y, x);
	},
	closePath: function() {
		this._context.closePath();
	},
	lineTo: function(x, y) {
		this._context.lineTo(y, x);
	},
	bezierCurveTo: function(x1, y1, x2, y2, x, y) {
		this._context.bezierCurveTo(y1, x1, y2, x2, y, x);
	}
};
function monotoneX(context) {
	return new MonotoneX(context);
}
function monotoneY(context) {
	return new MonotoneY(context);
}
//#endregion
//#region node_modules/d3-shape/src/curve/natural.js
function Natural(context) {
	this._context = context;
}
Natural.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._x = [];
		this._y = [];
	},
	lineEnd: function() {
		var x = this._x, y = this._y, n = x.length;
		if (n) {
			this._line ? this._context.lineTo(x[0], y[0]) : this._context.moveTo(x[0], y[0]);
			if (n === 2) this._context.lineTo(x[1], y[1]);
			else {
				var px = controlPoints(x), py = controlPoints(y);
				for (var i0 = 0, i1 = 1; i1 < n; ++i0, ++i1) this._context.bezierCurveTo(px[0][i0], py[0][i0], px[1][i0], py[1][i0], x[i1], y[i1]);
			}
		}
		if (this._line || this._line !== 0 && n === 1) this._context.closePath();
		this._line = 1 - this._line;
		this._x = this._y = null;
	},
	point: function(x, y) {
		this._x.push(+x);
		this._y.push(+y);
	}
};
function controlPoints(x) {
	var i, n = x.length - 1, m, a = new Array(n), b = new Array(n), r = new Array(n);
	a[0] = 0, b[0] = 2, r[0] = x[0] + 2 * x[1];
	for (i = 1; i < n - 1; ++i) a[i] = 1, b[i] = 4, r[i] = 4 * x[i] + 2 * x[i + 1];
	a[n - 1] = 2, b[n - 1] = 7, r[n - 1] = 8 * x[n - 1] + x[n];
	for (i = 1; i < n; ++i) m = a[i] / b[i - 1], b[i] -= m, r[i] -= m * r[i - 1];
	a[n - 1] = r[n - 1] / b[n - 1];
	for (i = n - 2; i >= 0; --i) a[i] = (r[i] - a[i + 1]) / b[i];
	b[n - 1] = (x[n] + a[n - 1]) / 2;
	for (i = 0; i < n - 1; ++i) b[i] = 2 * x[i + 1] - a[i + 1];
	return [a, b];
}
function natural_default(context) {
	return new Natural(context);
}
//#endregion
//#region node_modules/d3-shape/src/curve/step.js
function Step(context, t) {
	this._context = context;
	this._t = t;
}
Step.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._x = this._y = NaN;
		this._point = 0;
	},
	lineEnd: function() {
		if (0 < this._t && this._t < 1 && this._point === 2) this._context.lineTo(this._x, this._y);
		if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
		if (this._line >= 0) this._t = 1 - this._t, this._line = 1 - this._line;
	},
	point: function(x, y) {
		x = +x, y = +y;
		switch (this._point) {
			case 0:
				this._point = 1;
				this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y);
				break;
			case 1: this._point = 2;
			default:
				if (this._t <= 0) {
					this._context.lineTo(this._x, y);
					this._context.lineTo(x, y);
				} else {
					var x1 = this._x * (1 - this._t) + x * this._t;
					this._context.lineTo(x1, this._y);
					this._context.lineTo(x1, y);
				}
				break;
		}
		this._x = x, this._y = y;
	}
};
function step_default(context) {
	return new Step(context, .5);
}
function stepBefore(context) {
	return new Step(context, 0);
}
function stepAfter(context) {
	return new Step(context, 1);
}
//#endregion
//#region node_modules/@mui/x-charts/esm/hooks/useLineSeries.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
var import_jsx_runtime = require_jsx_runtime();
/**
* Get access to the internal state of line series.
* The returned object contains:
* - series: a mapping from ids to series attributes.
* - seriesOrder: the array of series ids.
* - stackingGroups: the array of stacking groups. Each group contains the series ids stacked and the strategy to use.
* @returns the line series
*/
function useLineSeriesContext() {
	return useAllSeriesOfType("line");
}
//#endregion
//#region node_modules/@mui/x-charts/esm/hooks/animation/useAnimateArea.js
/** Animates an area of a line chart using a `path` element.
* The props object also accepts a `ref` which will be merged with the ref returned from this hook. This means you can
* pass the ref returned by this hook to the `path` element and the `ref` provided as argument will also be called.
*/
function useAnimateArea(props) {
	return useAnimate({ d: props.d }, {
		createInterpolator: (lastProps, newProps) => {
			const interpolate = string_default(lastProps.d, newProps.d);
			return (t) => ({ d: interpolate(t) });
		},
		applyProps: (element, { d }) => element.setAttribute("d", d),
		transformProps: (p) => p,
		skip: props.skipAnimation,
		ref: props.ref
	});
}
//#endregion
//#region node_modules/@mui/x-charts/esm/hooks/animation/useAnimateLine.js
/** Animates a line of a line chart using a `path` element.
* The props object also accepts a `ref` which will be merged with the ref returned from this hook. This means you can
* pass the ref returned by this hook to the `path` element and the `ref` provided as argument will also be called. */
function useAnimateLine(props) {
	return useAnimate({ d: props.d }, {
		createInterpolator: (lastProps, newProps) => {
			const interpolate = string_default(lastProps.d, newProps.d);
			return (t) => ({ d: interpolate(t) });
		},
		applyProps: (element, { d }) => element.setAttribute("d", d),
		skip: props.skipAnimation,
		transformProps: (p) => p,
		ref: props.ref
	});
}
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/cleanId.js
/**
* Remove spaces to have viable ids
*/
function cleanId(id) {
	return id.replace(" ", "_");
}
//#endregion
//#region node_modules/@mui/x-charts/esm/LineChart/AppearingMask.js
var appearingMaskClasses = generateUtilityClasses("MuiAppearingMask", ["animate"]);
var AnimatedRect = styled("rect", {
	slot: "internal",
	shouldForwardProp: void 0
})({
	animationName: "animate-width",
	animationTimingFunction: ANIMATION_TIMING_FUNCTION,
	animationDuration: "0s",
	[`&.${appearingMaskClasses.animate}`]: { animationDuration: `300ms` },
	"@keyframes animate-width": { from: { width: 0 } }
});
/**
* @ignore - internal component.
*/
function AppearingMask(props) {
	const drawingArea = useDrawingArea();
	const clipId = cleanId(`${useChartId()}-${props.id}`);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("clipPath", {
		id: clipId,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedRect, {
			className: props.skipAnimation ? "" : appearingMaskClasses.animate,
			x: 0,
			y: 0,
			width: drawingArea.left + drawingArea.width + drawingArea.right,
			height: drawingArea.top + drawingArea.height + drawingArea.bottom
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
		clipPath: `url(#${clipId})`,
		children: props.children
	})] });
}
//#endregion
//#region node_modules/@mui/x-charts/esm/LineChart/AnimatedArea.js
var _excluded$11 = ["skipAnimation", "ownerState"];
/**
* Demos:
*
* - [Lines](https://mui.com/x/react-charts/lines/)
* - [Areas demonstration](https://mui.com/x/react-charts/areas-demo/)
*
* API:
*
* - [AreaElement API](https://mui.com/x/api/charts/animated-area/)
*/
function AnimatedArea(props) {
	const { skipAnimation, ownerState } = props, other = _objectWithoutPropertiesLoose(props, _excluded$11);
	const animatedProps = useAnimateArea(props);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppearingMask, {
		skipAnimation,
		id: `${ownerState.id}-area-clip`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", _extends({
			fill: ownerState.gradientId ? `url(#${ownerState.gradientId})` : ownerState.color,
			filter: ownerState.isHighlighted ? "brightness(140%)" : ownerState.gradientId ? void 0 : "brightness(120%)",
			opacity: ownerState.isFaded ? .3 : 1,
			stroke: "none",
			"data-series": ownerState.id,
			"data-highlighted": ownerState.isHighlighted || void 0,
			"data-faded": ownerState.isFaded || void 0
		}, other, animatedProps))
	});
}
AnimatedArea.propTypes = {
	d: import_prop_types.default.string.isRequired,
	ownerState: import_prop_types.default.shape({
		classes: import_prop_types.default.object,
		color: import_prop_types.default.string.isRequired,
		gradientId: import_prop_types.default.string,
		id: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]).isRequired,
		isFaded: import_prop_types.default.bool.isRequired,
		isHighlighted: import_prop_types.default.bool.isRequired
	}).isRequired,
	skipAnimation: import_prop_types.default.bool
};
//#endregion
//#region node_modules/@mui/x-charts/esm/LineChart/lineClasses.js
function getLineUtilityClass(slot) {
	return generateUtilityClass("MuiLineChart", slot);
}
var lineClasses = generateUtilityClasses("MuiLineChart", [
	"area",
	"line",
	"mark",
	"markAnimate",
	"highlight",
	"areaPlot",
	"linePlot",
	"markPlot"
]);
var useUtilityClasses$1 = (options) => {
	const { skipAnimation, classes } = options ?? {};
	return composeClasses({
		area: ["area"],
		line: ["line"],
		mark: ["mark", !skipAnimation && "markAnimate"],
		highlight: ["highlight"],
		areaPlot: ["areaPlot"],
		linePlot: ["linePlot"],
		markPlot: ["markPlot"]
	}, getLineUtilityClass, classes);
};
//#endregion
//#region node_modules/@mui/x-charts/esm/LineChart/AreaElement.js
/**
* @deprecated Use `LineClasses` instead.
*/
/**
* @deprecated Use `LineClassKey` instead.
*/
var _excluded$10 = [
	"id",
	"classes",
	"color",
	"gradientId",
	"slots",
	"slotProps",
	"onClick"
];
/**
* @deprecated Use `getLineUtilityClass` instead.
*/
function getAreaElementUtilityClass(slot) {
	return generateUtilityClass("MuiAreaElement", slot);
}
/**
* @deprecated Use `lineClasses` instead.
*/
var areaElementClasses = generateUtilityClasses("MuiAreaElement", [
	"root",
	"highlighted",
	"faded",
	"series"
]);
/**
* @deprecated Use `useUtilityClasses` instead.
*/
var useDeprecatedUtilityClasses$2 = (ownerState) => {
	const { classes, id, isFaded, isHighlighted } = ownerState;
	return composeClasses({ root: [
		"root",
		`series-${id}`,
		isHighlighted && "highlighted",
		isFaded && "faded"
	] }, getAreaElementUtilityClass, classes);
};
/**
* Demos:
*
* - [Lines](https://mui.com/x/react-charts/lines/)
* - [Areas demonstration](https://mui.com/x/react-charts/areas-demo/)
*
* API:
*
* - [AreaElement API](https://mui.com/x/api/charts/area-element/)
*/
function AreaElement(props) {
	const { id, classes: innerClasses, color, gradientId, slots, slotProps, onClick } = props, other = _objectWithoutPropertiesLoose(props, _excluded$10);
	const interactionProps = useInteractionItemProps({
		type: "line",
		seriesId: id
	});
	const { isFaded, isHighlighted } = useItemHighlighted({ seriesId: id });
	const ownerState = {
		id,
		classes: innerClasses,
		color,
		gradientId,
		isFaded,
		isHighlighted
	};
	const classes = useUtilityClasses$1();
	const deprecatedClasses = useDeprecatedUtilityClasses$2(ownerState);
	const Area = slots?.area ?? AnimatedArea;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, _extends({}, other, useSlotProps({
		elementType: Area,
		externalSlotProps: slotProps?.area,
		additionalProps: _extends({}, interactionProps, {
			onClick,
			cursor: onClick ? "pointer" : "unset",
			"data-highlighted": isHighlighted || void 0,
			"data-faded": isFaded || void 0,
			"data-series-id": id,
			"data-series": id
		}),
		className: `${classes.area} ${deprecatedClasses.root}`,
		ownerState
	})));
}
AreaElement.propTypes = {
	classes: import_prop_types.default.object,
	color: import_prop_types.default.string.isRequired,
	d: import_prop_types.default.string.isRequired,
	gradientId: import_prop_types.default.string,
	id: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]).isRequired,
	skipAnimation: import_prop_types.default.bool,
	slotProps: import_prop_types.default.object,
	slots: import_prop_types.default.object
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/getCurve.js
function getCurveFactory(curveType) {
	switch (curveType) {
		case "catmullRom": return catmullRom_default.alpha(.5);
		case "linear": return linear_default;
		case "monotoneX": return monotoneX;
		case "monotoneY": return monotoneY;
		case "natural": return natural_default;
		case "step": return step_default;
		case "stepBefore": return stepBefore;
		case "stepAfter": return stepAfter;
		case "bumpY": return bumpY;
		case "bumpX": return bumpX;
		default: return monotoneX;
	}
}
//#endregion
//#region node_modules/@mui/x-charts/esm/LineChart/useAreaPlotData.js
function useAreaPlotData(xAxes, yAxes) {
	const seriesData = useLineSeriesContext();
	const defaultXAxisId = useXAxes().xAxisIds[0];
	const defaultYAxisId = useYAxes().yAxisIds[0];
	const getGradientId = useChartGradientIdBuilder();
	return import_react.useMemo(() => {
		if (seriesData === void 0) return [];
		const { series, stackingGroups } = seriesData;
		const areaPlotData = [];
		for (const stackingGroup of stackingGroups) {
			const groupIds = stackingGroup.ids;
			for (let i = groupIds.length - 1; i >= 0; i -= 1) {
				const seriesId = groupIds[i];
				const { xAxisId = defaultXAxisId, yAxisId = defaultYAxisId, visibleStackedData, stackedData, data, connectNulls, baseline, curve, strictStepCurve, area } = series[seriesId];
				if (!area || !(xAxisId in xAxes) || !(yAxisId in yAxes)) continue;
				const xScale = xAxes[xAxisId].scale;
				const xPosition = getValueToPositionMapper(xScale);
				const yScale = yAxes[yAxisId].scale;
				const xData = xAxes[xAxisId].data;
				const gradientId = yAxes[yAxisId].colorScale && getGradientId(yAxisId) || xAxes[xAxisId].colorScale && getGradientId(xAxisId) || void 0;
				if (xData === void 0) throw new Error(`MUI X Charts: ${xAxisId === "DEFAULT_X_AXIS_KEY" ? "The first `xAxis`" : `The x-axis with id "${xAxisId}"`} should have data property to be able to display a line plot.`);
				if (xData.length < stackedData.length) throw new Error(`MUI X Charts: The data length of the x axis (${xData.length} items) is lower than the length of series (${stackedData.length} items).`);
				const shouldExpand = curve?.includes("step") && !strictStepCurve && isOrdinalScale(xScale);
				const formattedData = xData?.flatMap((x, index) => {
					const nullData = data[index] == null;
					if (shouldExpand) {
						const rep = [{
							x,
							y: visibleStackedData[index],
							nullData,
							isExtension: false
						}];
						if (!nullData && (index === 0 || data[index - 1] == null)) rep.unshift({
							x: (xScale(x) ?? 0) - (xScale.step() - xScale.bandwidth()) / 2,
							y: visibleStackedData[index],
							nullData,
							isExtension: true
						});
						if (!nullData && (index === data.length - 1 || data[index + 1] == null)) rep.push({
							x: (xScale(x) ?? 0) + (xScale.step() + xScale.bandwidth()) / 2,
							y: visibleStackedData[index],
							nullData,
							isExtension: true
						});
						return rep;
					}
					return {
						x,
						y: visibleStackedData[index],
						nullData
					};
				}) ?? [];
				const d3Data = connectNulls ? formattedData.filter((d) => !d.nullData) : formattedData;
				const d = area_default().x((d) => d.isExtension ? d.x : xPosition(d.x)).defined((d) => connectNulls || !d.nullData || !!d.isExtension).y0((d) => {
					if (typeof baseline === "number") return yScale(baseline);
					if (baseline === "max") return yScale.range()[1];
					if (baseline === "min") return yScale.range()[0];
					const value = d.y && yScale(d.y[0]);
					if (Number.isNaN(value)) return yScale.range()[0];
					return value;
				}).y1((d) => d.y && yScale(d.y[1])).curve(getCurveFactory(curve))(d3Data) || "";
				areaPlotData.push({
					area: series[seriesId].area,
					color: series[seriesId].color,
					gradientId,
					d,
					seriesId
				});
			}
		}
		return areaPlotData;
	}, [
		seriesData,
		defaultXAxisId,
		defaultYAxisId,
		xAxes,
		yAxes,
		getGradientId
	]);
}
//#endregion
//#region node_modules/@mui/x-charts/esm/LineChart/AreaPlot.js
var _excluded$9 = [
	"slots",
	"slotProps",
	"onItemClick",
	"skipAnimation",
	"className"
];
var AreaPlotRoot = styled("g", {
	name: "MuiAreaPlot",
	slot: "Root"
})({ [`& .${lineClasses.area}`]: {
	transitionProperty: "opacity, fill",
	transitionDuration: `300ms`,
	transitionTimingFunction: ANIMATION_TIMING_FUNCTION
} });
var useAggregatedData$1 = () => {
	const { xAxis: xAxes } = useXAxes();
	const { yAxis: yAxes } = useYAxes();
	return useAreaPlotData(xAxes, yAxes);
};
/**
* Demos:
*
* - [Lines](https://mui.com/x/react-charts/lines/)
* - [Areas demonstration](https://mui.com/x/react-charts/areas-demo/)
* - [Stacking](https://mui.com/x/react-charts/stacking/)
*
* API:
*
* - [AreaPlot API](https://mui.com/x/api/charts/area-plot/)
*/
function AreaPlot(props) {
	const { slots, slotProps, onItemClick, skipAnimation: inSkipAnimation, className } = props, other = _objectWithoutPropertiesLoose(props, _excluded$9);
	const skipAnimation = useSkipAnimation(useInternalIsZoomInteracting() || inSkipAnimation);
	const completedData = useAggregatedData$1();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaPlotRoot, _extends({ className: clsx(useUtilityClasses$1().areaPlot, className) }, other, { children: completedData.map(({ d, seriesId, color, area, gradientId }) => !!area && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaElement, {
		id: seriesId,
		d,
		color,
		gradientId,
		slots,
		slotProps,
		onClick: onItemClick && ((event) => onItemClick(event, {
			type: "line",
			seriesId
		})),
		skipAnimation
	}, seriesId)) }));
}
AreaPlot.propTypes = {
	onItemClick: import_prop_types.default.func,
	skipAnimation: import_prop_types.default.bool,
	slotProps: import_prop_types.default.object,
	slots: import_prop_types.default.object
};
//#endregion
//#region node_modules/@mui/x-charts/esm/LineChart/AnimatedLine.js
var _excluded$8 = ["skipAnimation", "ownerState"];
/**
* Demos:
*
* - [Lines](https://mui.com/x/react-charts/lines/)
* - [Line demonstration](https://mui.com/x/react-charts/line-demo/)
*
* API:
*
* - [AnimatedLine API](https://mui.com/x/api/charts/animated-line/)
*/
var AnimatedLine = /* @__PURE__ */ import_react.forwardRef(function AnimatedLine(props, ref) {
	const { skipAnimation, ownerState } = props, other = _objectWithoutPropertiesLoose(props, _excluded$8);
	const animateProps = useAnimateLine({
		d: props.d,
		skipAnimation,
		ref
	});
	const fadedOpacity = ownerState.isFaded ? .3 : 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppearingMask, {
		skipAnimation,
		id: `${ownerState.id}-line-clip`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", _extends({
			stroke: ownerState.gradientId ? `url(#${ownerState.gradientId})` : ownerState.color,
			strokeWidth: 2,
			strokeLinejoin: "round",
			fill: "none",
			filter: ownerState.isHighlighted ? "brightness(120%)" : void 0,
			opacity: ownerState.hidden ? 0 : fadedOpacity,
			"data-series": ownerState.id,
			"data-highlighted": ownerState.isHighlighted || void 0,
			"data-faded": ownerState.isFaded || void 0
		}, other, animateProps))
	});
});
AnimatedLine.displayName = "AnimatedLine";
AnimatedLine.propTypes = {
	d: import_prop_types.default.string.isRequired,
	ownerState: import_prop_types.default.shape({
		classes: import_prop_types.default.object,
		color: import_prop_types.default.string.isRequired,
		gradientId: import_prop_types.default.string,
		hidden: import_prop_types.default.bool,
		id: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]).isRequired,
		isFaded: import_prop_types.default.bool.isRequired,
		isHighlighted: import_prop_types.default.bool.isRequired
	}).isRequired,
	skipAnimation: import_prop_types.default.bool
};
//#endregion
//#region node_modules/@mui/x-charts/esm/LineChart/LineElement.js
/**
* @deprecated Use `LineClasses` instead.
*/
/**
* @deprecated Use `LineClassKey` instead.
*/
var _excluded$7 = [
	"id",
	"classes",
	"color",
	"gradientId",
	"slots",
	"slotProps",
	"onClick",
	"hidden"
];
/**
* @deprecated Use `getLineUtilityClass` instead.
*/
function getLineElementUtilityClass(slot) {
	return generateUtilityClass("MuiLineElement", slot);
}
/**
* @deprecated Use `lineClasses` instead.
*/
var lineElementClasses = generateUtilityClasses("MuiLineElement", [
	"root",
	"highlighted",
	"faded",
	"series"
]);
/**
* @deprecated Use `useUtilityClasses` instead.
*/
var useDeprecatedUtilityClasses$1 = (ownerState) => {
	const { classes, id, isFaded, isHighlighted } = ownerState;
	return composeClasses({ root: [
		"root",
		`series-${id}`,
		isHighlighted && "highlighted",
		isFaded && "faded"
	] }, getLineElementUtilityClass, classes);
};
/**
* Demos:
*
* - [Lines](https://mui.com/x/react-charts/lines/)
* - [Line demonstration](https://mui.com/x/react-charts/line-demo/)
*
* API:
*
* - [LineElement API](https://mui.com/x/api/charts/line-element/)
*/
function LineElement(props) {
	const { id, classes: innerClasses, color, gradientId, slots, slotProps, onClick, hidden } = props, other = _objectWithoutPropertiesLoose(props, _excluded$7);
	const interactionProps = useInteractionItemProps({
		type: "line",
		seriesId: id
	});
	const { isFaded, isHighlighted } = useItemHighlighted({ seriesId: id });
	const ownerState = {
		id,
		classes: innerClasses,
		color,
		gradientId,
		isFaded,
		isHighlighted,
		hidden
	};
	const classes = useUtilityClasses$1();
	const deprecatedClasses = useDeprecatedUtilityClasses$1(ownerState);
	const Line = slots?.line ?? AnimatedLine;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, _extends({}, other, useSlotProps({
		elementType: Line,
		externalSlotProps: slotProps?.line,
		additionalProps: _extends({}, interactionProps, {
			onClick,
			cursor: onClick ? "pointer" : "unset",
			"data-highlighted": isHighlighted || void 0,
			"data-faded": isFaded || void 0,
			"data-series-id": id,
			"data-series": id
		}),
		className: `${classes.line} ${deprecatedClasses.root}`,
		ownerState
	})));
}
LineElement.propTypes = {
	classes: import_prop_types.default.object,
	color: import_prop_types.default.string.isRequired,
	d: import_prop_types.default.string.isRequired,
	gradientId: import_prop_types.default.string,
	hidden: import_prop_types.default.bool,
	id: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]).isRequired,
	skipAnimation: import_prop_types.default.bool,
	slotProps: import_prop_types.default.object,
	slots: import_prop_types.default.object
};
//#endregion
//#region node_modules/@mui/x-charts/esm/LineChart/useLinePlotData.js
function useLinePlotData(xAxes, yAxes) {
	const seriesData = useLineSeriesContext();
	const defaultXAxisId = useXAxes().xAxisIds[0];
	const defaultYAxisId = useYAxes().yAxisIds[0];
	const getGradientId = useChartGradientIdBuilder();
	return import_react.useMemo(() => {
		if (seriesData === void 0) return [];
		const { series, stackingGroups } = seriesData;
		const linePlotData = [];
		for (const stackingGroup of stackingGroups) {
			const groupIds = stackingGroup.ids;
			for (const seriesId of groupIds) {
				const { xAxisId = defaultXAxisId, yAxisId = defaultYAxisId, stackedData, visibleStackedData, data, connectNulls, curve, strictStepCurve } = series[seriesId];
				if (!(xAxisId in xAxes) || !(yAxisId in yAxes)) continue;
				const xScale = xAxes[xAxisId].scale;
				const xPosition = getValueToPositionMapper(xScale);
				const yScale = yAxes[yAxisId].scale;
				const xData = xAxes[xAxisId].data;
				const gradientId = yAxes[yAxisId].colorScale && getGradientId(yAxisId) || xAxes[xAxisId].colorScale && getGradientId(xAxisId) || void 0;
				if (xData === void 0) throw new Error(`MUI X Charts: ${xAxisId === "DEFAULT_X_AXIS_KEY" ? "The first `xAxis`" : `The x-axis with id "${xAxisId}"`} should have data property to be able to display a line plot.`);
				if (xData.length < stackedData.length) warnOnce(`MUI X Charts: The data length of the x axis (${xData.length} items) is lower than the length of series (${stackedData.length} items).`, "error");
				const shouldExpand = curve?.includes("step") && !strictStepCurve && isOrdinalScale(xScale);
				const formattedData = xData?.flatMap((x, index) => {
					const nullData = data[index] == null;
					if (shouldExpand) {
						const rep = [{
							x,
							y: visibleStackedData[index],
							nullData,
							isExtension: false
						}];
						if (!nullData && (index === 0 || data[index - 1] == null)) rep.unshift({
							x: (xScale(x) ?? 0) - (xScale.step() - xScale.bandwidth()) / 2,
							y: visibleStackedData[index],
							nullData,
							isExtension: true
						});
						if (!nullData && (index === data.length - 1 || data[index + 1] == null)) rep.push({
							x: (xScale(x) ?? 0) + (xScale.step() + xScale.bandwidth()) / 2,
							y: visibleStackedData[index],
							nullData,
							isExtension: true
						});
						return rep;
					}
					return {
						x,
						y: visibleStackedData[index],
						nullData
					};
				}) ?? [];
				const d3Data = connectNulls ? formattedData.filter((d) => !d.nullData) : formattedData;
				const hidden = series[seriesId].hidden;
				const d = line_default().x((d) => d.isExtension ? d.x : xPosition(d.x)).defined((d) => connectNulls || !d.nullData || !!d.isExtension).y((d) => {
					if (hidden) return yScale(yScale.domain()[0]);
					return yScale(d.y[1]);
				}).curve(getCurveFactory(curve))(d3Data) || "";
				linePlotData.push({
					color: series[seriesId].color,
					gradientId,
					d,
					seriesId,
					hidden: series[seriesId].hidden
				});
			}
		}
		return linePlotData;
	}, [
		seriesData,
		defaultXAxisId,
		defaultYAxisId,
		xAxes,
		yAxes,
		getGradientId
	]);
}
//#endregion
//#region node_modules/@mui/x-charts/esm/LineChart/LinePlot.js
var _excluded$6 = [
	"slots",
	"slotProps",
	"skipAnimation",
	"onItemClick",
	"className"
];
var LinePlotRoot = styled("g", {
	name: "MuiLinePlot",
	slot: "Root"
})({ [`& .${lineClasses.line}`]: {
	transitionProperty: "opacity, fill",
	transitionDuration: `300ms`,
	transitionTimingFunction: ANIMATION_TIMING_FUNCTION
} });
var useAggregatedData = () => {
	const { xAxis: xAxes } = useXAxes();
	const { yAxis: yAxes } = useYAxes();
	return useLinePlotData(xAxes, yAxes);
};
/**
* Demos:
*
* - [Lines](https://mui.com/x/react-charts/lines/)
* - [Line demonstration](https://mui.com/x/react-charts/line-demo/)
*
* API:
*
* - [LinePlot API](https://mui.com/x/api/charts/line-plot/)
*/
function LinePlot(props) {
	const { slots, slotProps, skipAnimation: inSkipAnimation, onItemClick, className } = props, other = _objectWithoutPropertiesLoose(props, _excluded$6);
	const skipAnimation = useSkipAnimation(useInternalIsZoomInteracting() || inSkipAnimation);
	const completedData = useAggregatedData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinePlotRoot, _extends({ className: clsx(useUtilityClasses$1().linePlot, className) }, other, { children: completedData.map(({ d, seriesId, color, gradientId, hidden }) => {
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LineElement, {
			id: seriesId,
			d,
			color,
			gradientId,
			hidden,
			skipAnimation,
			slots,
			slotProps,
			onClick: onItemClick && ((event) => onItemClick(event, {
				type: "line",
				seriesId
			}))
		}, seriesId);
	}) }));
}
LinePlot.propTypes = {
	onItemClick: import_prop_types.default.func,
	skipAnimation: import_prop_types.default.bool,
	slotProps: import_prop_types.default.object,
	slots: import_prop_types.default.object
};
//#endregion
//#region node_modules/@mui/x-charts/esm/LineChart/markElementClasses.js
/**
* @deprecated Use `LineClasses` instead.
*/
/**
* @deprecated Use `LineClassKey` instead.
*/
/**
* @deprecated Use `getLineUtilityClass` instead.
*/
function getMarkElementUtilityClass(slot) {
	return generateUtilityClass("MuiMarkElement", slot);
}
/**
* @deprecated Use `lineClasses` instead.
*/
var markElementClasses = generateUtilityClasses("MuiMarkElement", [
	"root",
	"highlighted",
	"faded",
	"animate",
	"series"
]);
/**
* @deprecated Use `useUtilityClasses` instead.
*/
var useUtilityClasses = (ownerState) => {
	const { classes, id, isFaded, isHighlighted, skipAnimation } = ownerState;
	return composeClasses({ root: [
		"root",
		`series-${id}`,
		isHighlighted && "highlighted",
		isFaded && "faded",
		skipAnimation ? void 0 : "animate"
	] }, getMarkElementUtilityClass, classes);
};
//#endregion
//#region node_modules/@mui/x-charts/esm/LineChart/CircleMarkElement.js
var _excluded$5 = [
	"x",
	"y",
	"id",
	"classes",
	"color",
	"dataIndex",
	"onClick",
	"skipAnimation",
	"isFaded",
	"isHighlighted",
	"shape",
	"hidden"
];
var Circle = styled("circle", {
	slot: "internal",
	shouldForwardProp: void 0
})({ [`&.${markElementClasses.animate}`]: {
	transitionDuration: `300ms`,
	transitionProperty: "cx, cy, opacity",
	transitionTimingFunction: ANIMATION_TIMING_FUNCTION
} });
/**
* The line mark element that only render circle for performance improvement.
*
* Demos:
*
* - [Lines](https://mui.com/x/react-charts/lines/)
* - [Line demonstration](https://mui.com/x/react-charts/line-demo/)
*
* API:
*
* - [CircleMarkElement API](https://mui.com/x/api/charts/circle-mark-element/)
*/
function CircleMarkElement(props) {
	const { x, y, id, classes: innerClasses, color, dataIndex, onClick, skipAnimation, isFaded = false, isHighlighted = false, hidden } = props, other = _objectWithoutPropertiesLoose(props, _excluded$5);
	const theme = useTheme();
	const interactionProps = useInteractionItemProps({
		type: "line",
		seriesId: id,
		dataIndex
	});
	const ownerState = {
		id,
		classes: innerClasses,
		isHighlighted,
		isFaded,
		skipAnimation
	};
	const classes = useUtilityClasses$1({
		skipAnimation,
		classes: innerClasses
	});
	const deprecatedClasses = useUtilityClasses(ownerState);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, _extends({}, other, {
		cx: x,
		cy: y,
		r: 5,
		fill: (theme.vars || theme).palette.background.paper,
		stroke: color,
		strokeWidth: 2,
		className: `${classes.mark} ${deprecatedClasses.root}`,
		onClick,
		cursor: onClick ? "pointer" : "unset",
		pointerEvents: hidden ? "none" : void 0
	}, interactionProps, {
		"data-highlighted": isHighlighted || void 0,
		"data-faded": isFaded || void 0,
		"data-series-id": id,
		"data-series": id,
		"data-index": dataIndex,
		opacity: hidden ? 0 : 1
	}));
}
CircleMarkElement.propTypes = {
	classes: import_prop_types.default.object,
	dataIndex: import_prop_types.default.number.isRequired,
	id: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]).isRequired,
	shape: import_prop_types.default.oneOf([
		"circle",
		"cross",
		"diamond",
		"square",
		"star",
		"triangle",
		"wye"
	]).isRequired,
	skipAnimation: import_prop_types.default.bool
};
//#endregion
//#region node_modules/@mui/x-charts/esm/internals/getSymbol.js
function getSymbol(shape) {
	switch (shape) {
		case "circle": return 0;
		case "cross": return 1;
		case "diamond": return 2;
		case "square": return 3;
		case "star": return 4;
		case "triangle": return 5;
		case "wye": return 6;
		default: return 0;
	}
}
//#endregion
//#region node_modules/@mui/x-charts/esm/LineChart/MarkElement.js
var _excluded$4 = [
	"x",
	"y",
	"id",
	"classes",
	"color",
	"shape",
	"dataIndex",
	"onClick",
	"skipAnimation",
	"isFaded",
	"isHighlighted",
	"hidden",
	"style"
];
var MarkElementPath = styled("path", {
	name: "MuiMarkElement",
	slot: "Root"
})(({ theme }) => ({
	fill: (theme.vars || theme).palette.background.paper,
	[`&.${markElementClasses.animate}`]: {
		transitionDuration: `300ms`,
		transitionProperty: "transform, transform-origin, opacity",
		transitionTimingFunction: ANIMATION_TIMING_FUNCTION
	}
}));
/**
* Demos:
*
* - [Lines](https://mui.com/x/react-charts/lines/)
* - [Line demonstration](https://mui.com/x/react-charts/line-demo/)
*
* API:
*
* - [MarkElement API](https://mui.com/x/api/charts/mark-element/)
*/
function MarkElement(props) {
	const { x, y, id, classes: innerClasses, color, shape, dataIndex, onClick, skipAnimation, isFaded = false, isHighlighted = false, hidden, style } = props, other = _objectWithoutPropertiesLoose(props, _excluded$4);
	const interactionProps = useInteractionItemProps({
		type: "line",
		seriesId: id,
		dataIndex
	});
	const ownerState = {
		id,
		classes: innerClasses,
		isHighlighted,
		isFaded,
		skipAnimation
	};
	const classes = useUtilityClasses$1({
		skipAnimation,
		classes: innerClasses
	});
	const deprecatedClasses = useUtilityClasses(ownerState);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarkElementPath, _extends({}, other, {
		style: _extends({}, style, {
			transform: `translate(${x}px, ${y}px)`,
			transformOrigin: `${x}px ${y}px`
		}),
		ownerState,
		className: `${classes.mark} ${deprecatedClasses.root}`,
		d: Symbol(symbolsFill[getSymbol(shape)])(),
		onClick,
		cursor: onClick ? "pointer" : "unset",
		pointerEvents: hidden ? "none" : void 0
	}, interactionProps, {
		"data-highlighted": isHighlighted || void 0,
		"data-faded": isFaded || void 0,
		"data-series-id": id,
		"data-series": id,
		"data-index": dataIndex,
		opacity: hidden ? 0 : 1,
		strokeWidth: 2,
		stroke: color
	}));
}
MarkElement.propTypes = {
	classes: import_prop_types.default.object,
	dataIndex: import_prop_types.default.number.isRequired,
	hidden: import_prop_types.default.bool,
	id: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]).isRequired,
	isFaded: import_prop_types.default.bool,
	isHighlighted: import_prop_types.default.bool,
	shape: import_prop_types.default.oneOf([
		"circle",
		"cross",
		"diamond",
		"square",
		"star",
		"triangle",
		"wye"
	]).isRequired,
	skipAnimation: import_prop_types.default.bool
};
//#endregion
//#region node_modules/@mui/x-charts/esm/LineChart/useMarkPlotData.js
function useMarkPlotData(xAxes, yAxes) {
	const seriesData = useLineSeriesContext();
	const defaultXAxisId = useXAxes().xAxisIds[0];
	const defaultYAxisId = useYAxes().yAxisIds[0];
	const chartId = useChartId();
	const { instance } = useChartContext();
	return import_react.useMemo(() => {
		if (seriesData === void 0) return [];
		const { series, stackingGroups } = seriesData;
		const markPlotData = [];
		for (const stackingGroup of stackingGroups) {
			const groupIds = stackingGroup.ids;
			for (const seriesId of groupIds) {
				const { xAxisId = defaultXAxisId, yAxisId = defaultYAxisId, visibleStackedData, data, showMark = true, shape = "circle", hidden } = series[seriesId];
				if (showMark === false) continue;
				if (!(xAxisId in xAxes) || !(yAxisId in yAxes)) continue;
				const xScale = getValueToPositionMapper(xAxes[xAxisId].scale);
				const yScale = yAxes[yAxisId].scale;
				const xData = xAxes[xAxisId].data;
				if (xData === void 0) throw new Error(`MUI X Charts: ${xAxisId === "DEFAULT_X_AXIS_KEY" ? "The first `xAxis`" : `The x-axis with id "${xAxisId}"`} should have data property to be able to display a line plot.`);
				const clipId = cleanId(`${chartId}-${seriesId}-line-clip`);
				const colorGetter = getColor(series[seriesId], xAxes[xAxisId], yAxes[yAxisId]);
				const marks = [];
				if (xData) for (let index = 0; index < xData.length; index += 1) {
					const x = xData[index];
					const value = data[index] == null ? null : visibleStackedData[index][1];
					if (value === null) continue;
					const y = yScale(hidden ? yScale.domain()[0] : value);
					const xPos = xScale(x);
					if (!instance.isPointInside(xPos, y)) continue;
					if (showMark !== true) {
						if (!showMark({
							x: xPos,
							y,
							index,
							position: x,
							value
						})) continue;
					}
					marks.push({
						x: xPos,
						y,
						index,
						color: colorGetter(index)
					});
				}
				markPlotData.push({
					seriesId,
					clipId,
					shape,
					xAxisId,
					marks,
					hidden
				});
			}
		}
		return markPlotData;
	}, [
		seriesData,
		defaultXAxisId,
		defaultYAxisId,
		chartId,
		xAxes,
		yAxes,
		instance
	]);
}
//#endregion
//#region node_modules/@mui/x-charts/esm/LineChart/MarkPlot.js
var _excluded$3 = [
	"slots",
	"slotProps",
	"skipAnimation",
	"onItemClick",
	"className"
];
var MarkPlotRoot = styled("g", {
	name: "MuiMarkPlot",
	slot: "Root"
})({});
/**
* Demos:
*
* - [Lines](https://mui.com/x/react-charts/lines/)
* - [Line demonstration](https://mui.com/x/react-charts/line-demo/)
*
* API:
*
* - [MarkPlot API](https://mui.com/x/api/charts/mark-plot/)
*/
function MarkPlot(props) {
	const { slots, slotProps, skipAnimation: inSkipAnimation, onItemClick, className } = props, other = _objectWithoutPropertiesLoose(props, _excluded$3);
	const skipAnimation = useSkipAnimation(useInternalIsZoomInteracting() || inSkipAnimation);
	const { xAxis } = useXAxes();
	const { yAxis } = useYAxes();
	const { store } = useChartContext();
	const { isFaded, isHighlighted } = useItemHighlightedGetter();
	const xAxisHighlightIndexes = store.use(selectorChartsHighlightXAxisIndex);
	const highlightedItems = import_react.useMemo(() => {
		const rep = {};
		for (const { dataIndex, axisId } of xAxisHighlightIndexes) if (rep[axisId] === void 0) rep[axisId] = new Set([dataIndex]);
		else rep[axisId].add(dataIndex);
		return rep;
	}, [xAxisHighlightIndexes]);
	const completedData = useMarkPlotData(xAxis, yAxis);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarkPlotRoot, _extends({ className: clsx(useUtilityClasses$1().markPlot, className) }, other, { children: completedData.map(({ seriesId, clipId, shape, xAxisId, marks, hidden }) => {
		const Mark = slots?.mark ?? (shape === "circle" ? CircleMarkElement : MarkElement);
		const isSeriesHighlighted = isHighlighted({ seriesId });
		const isSeriesFaded = !isSeriesHighlighted && isFaded({ seriesId });
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
			clipPath: `url(#${clipId})`,
			"data-series": seriesId,
			children: marks.map(({ x, y, index, color }) => {
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, _extends({
					id: seriesId,
					dataIndex: index,
					shape,
					color,
					x,
					y,
					skipAnimation,
					onClick: onItemClick && ((event) => onItemClick(event, {
						type: "line",
						seriesId,
						dataIndex: index
					})),
					isHighlighted: highlightedItems[xAxisId]?.has(index) || isSeriesHighlighted,
					isFaded: isSeriesFaded,
					hidden
				}, slotProps?.mark), `${seriesId}-${index}`);
			})
		}, seriesId);
	}) }));
}
MarkPlot.propTypes = {
	onItemClick: import_prop_types.default.func,
	skipAnimation: import_prop_types.default.bool,
	slotProps: import_prop_types.default.object,
	slots: import_prop_types.default.object
};
//#endregion
//#region node_modules/@mui/x-charts/esm/LineChart/LineHighlightElement.js
/**
* @deprecated Use `LineClasses` instead.
*/
/**
* @deprecated Use `LineClassKey` instead.
*/
var _excluded$2 = [
	"x",
	"y",
	"id",
	"classes",
	"color",
	"shape"
];
/**
* @deprecated Use `getLineUtilityClass` instead.
*/
function getHighlightElementUtilityClass(slot) {
	return generateUtilityClass("MuiHighlightElement", slot);
}
/**
* @deprecated Use `lineClasses` instead.
*/
var lineHighlightElementClasses = generateUtilityClasses("MuiHighlightElement", ["root"]);
/**
* @deprecated Use `useUtilityClasses` instead.
*/
var useDeprecatedUtilityClasses = (ownerState) => {
	const { classes, id } = ownerState;
	return composeClasses({ root: ["root", `series-${id}`] }, getHighlightElementUtilityClass, classes);
};
/**
* Demos:
*
* - [Lines](https://mui.com/x/react-charts/lines/)
* - [Line demonstration](https://mui.com/x/react-charts/line-demo/)
*
* API:
*
* - [LineHighlightElement API](https://mui.com/x/api/charts/line-highlight-element/)
*/
function LineHighlightElement(props) {
	const { x, y, color, shape } = props, other = _objectWithoutPropertiesLoose(props, _excluded$2);
	const classes = useUtilityClasses$1();
	const deprecatedClasses = useDeprecatedUtilityClasses(props);
	const Element = shape === "circle" ? "circle" : "path";
	const additionalProps = shape === "circle" ? {
		cx: 0,
		cy: 0,
		r: other.r === void 0 ? 5 : other.r
	} : { d: Symbol(symbolsFill[getSymbol(shape)])() };
	const transformOrigin = reactMajor_default > 18 ? { transformOrigin: `${x} ${y}` } : { "transform-origin": `${x} ${y}` };
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Element, _extends({
		pointerEvents: "none",
		className: `${classes.highlight} ${deprecatedClasses.root}`,
		transform: `translate(${x} ${y})`,
		fill: color
	}, transformOrigin, additionalProps, other));
}
LineHighlightElement.propTypes = {
	classes: import_prop_types.default.object,
	id: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]).isRequired,
	shape: import_prop_types.default.oneOf([
		"circle",
		"cross",
		"diamond",
		"square",
		"star",
		"triangle",
		"wye"
	]).isRequired
};
//#endregion
//#region node_modules/@mui/x-charts/esm/LineChart/LineHighlightPlot.js
var _excluded$1 = ["slots", "slotProps"];
/**
* Demos:
*
* - [Lines](https://mui.com/x/react-charts/lines/)
* - [Line demonstration](https://mui.com/x/react-charts/line-demo/)
*
* API:
*
* - [LineHighlightPlot API](https://mui.com/x/api/charts/line-highlight-plot/)
*/
function LineHighlightPlot(props) {
	const { slots, slotProps } = props, other = _objectWithoutPropertiesLoose(props, _excluded$1);
	const seriesData = useLineSeriesContext();
	const { xAxis, xAxisIds } = useXAxes();
	const { yAxis, yAxisIds } = useYAxes();
	const { instance } = useChartContext();
	const highlightedIndexes = useStore().use(selectorChartsHighlightXAxisIndex);
	if (highlightedIndexes.length === 0) return null;
	if (seriesData === void 0) return null;
	const { series, stackingGroups } = seriesData;
	const defaultXAxisId = xAxisIds[0];
	const defaultYAxisId = yAxisIds[0];
	const Element = slots?.lineHighlight ?? LineHighlightElement;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", _extends({}, other, { children: highlightedIndexes.flatMap(({ dataIndex: highlightedIndex, axisId: highlightedAxisId }) => stackingGroups.flatMap(({ ids: groupIds }) => {
		return groupIds.flatMap((seriesId) => {
			const { xAxisId = defaultXAxisId, yAxisId = defaultYAxisId, visibleStackedData, data, disableHighlight, shape = "circle" } = series[seriesId];
			if (disableHighlight || data[highlightedIndex] == null) return null;
			if (highlightedAxisId !== xAxisId) return null;
			const xScale = getValueToPositionMapper(xAxis[xAxisId].scale);
			const yScale = yAxis[yAxisId].scale;
			const xData = xAxis[xAxisId].data;
			if (xData === void 0) throw new Error(`MUI X Charts: ${xAxisId === "DEFAULT_X_AXIS_KEY" ? "The first `xAxis`" : `The x-axis with id "${xAxisId}"`} should have data property to be able to display a line plot.`);
			const x = xScale(xData[highlightedIndex]);
			const y = yScale(visibleStackedData[highlightedIndex][1]);
			if (!instance.isPointInside(x, y)) return null;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Element, _extends({
				id: seriesId,
				color: getColor(series[seriesId], xAxis[xAxisId], yAxis[yAxisId])(highlightedIndex),
				x,
				y,
				shape
			}, slotProps?.lineHighlight), `${seriesId}`);
		});
	})) }));
}
LineHighlightPlot.propTypes = {
	slotProps: import_prop_types.default.object,
	slots: import_prop_types.default.object
};
//#endregion
//#region node_modules/@mui/x-charts/esm/LineChart/LineChart.plugins.js
var LINE_CHART_PLUGINS = [
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
//#region node_modules/@mui/x-charts/esm/LineChart/useLineChartProps.js
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
	"onAreaClick",
	"onLineClick",
	"onMarkClick",
	"axisHighlight",
	"disableLineItemHighlight",
	"hideLegend",
	"grid",
	"children",
	"slots",
	"slotProps",
	"skipAnimation",
	"loading",
	"highlightedItem",
	"onHighlightChange",
	"className",
	"showToolbar",
	"brushConfig"
];
/**
* A helper function that extracts LineChartProps from the input props
* and returns an object with props for the children components of LineChart.
*
* @param props The input props for LineChart
* @returns An object with props for the children components of LineChart
*/
var useLineChartProps = (props) => {
	const { xAxis, yAxis, series, width, height, margin, colors, dataset, sx, onAreaClick, onLineClick, onMarkClick, axisHighlight, disableLineItemHighlight, grid, children, slots, slotProps, skipAnimation, loading, highlightedItem, onHighlightChange, className, brushConfig } = props, other = _objectWithoutPropertiesLoose(props, _excluded);
	const clipPathId = `${useId()}-clip-path`;
	const chartContainerProps = _extends({}, other, {
		series: import_react.useMemo(() => series.map((s) => _extends({
			disableHighlight: !!disableLineItemHighlight,
			type: "line"
		}, s)), [disableLineItemHighlight, series]),
		width,
		height,
		margin,
		colors,
		dataset,
		xAxis: xAxis ?? [{
			id: "DEFAULT_X_AXIS_KEY",
			scaleType: "point",
			data: Array.from({ length: Math.max(...series.map((s) => (s.data ?? dataset ?? []).length)) }, (_, index) => index)
		}],
		yAxis,
		highlightedItem,
		onHighlightChange,
		disableAxisListener: slotProps?.tooltip?.trigger !== "axis" && axisHighlight?.x === "none" && axisHighlight?.y === "none",
		className,
		skipAnimation,
		brushConfig,
		plugins: LINE_CHART_PLUGINS
	});
	const gridProps = {
		vertical: grid?.vertical,
		horizontal: grid?.horizontal
	};
	const clipPathGroupProps = { clipPath: `url(#${clipPathId})` };
	const clipPathProps = { id: clipPathId };
	const areaPlotProps = {
		slots,
		slotProps,
		onItemClick: onAreaClick
	};
	const linePlotProps = {
		slots,
		slotProps,
		onItemClick: onLineClick
	};
	const markPlotProps = {
		slots,
		slotProps,
		onItemClick: onMarkClick,
		skipAnimation
	};
	const overlayProps = {
		slots,
		slotProps,
		loading
	};
	const chartsAxisProps = {
		slots,
		slotProps
	};
	const axisHighlightProps = _extends({ x: "line" }, axisHighlight);
	const lineHighlightPlotProps = {
		slots,
		slotProps
	};
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
		gridProps,
		clipPathProps,
		clipPathGroupProps,
		areaPlotProps,
		linePlotProps,
		markPlotProps,
		overlayProps,
		chartsAxisProps,
		axisHighlightProps,
		lineHighlightPlotProps,
		legendProps,
		children
	};
};
//#endregion
//#region node_modules/@mui/x-charts/esm/LineChart/FocusedLineMark.js
var RADIUS = 6;
function FocusedLineMark() {
	const theme = useTheme();
	const focusedItem = useFocusedItem();
	const lineSeries = useLineSeriesContext();
	const { xAxis, xAxisIds } = useXAxes();
	const { yAxis, yAxisIds } = useYAxes();
	if (focusedItem === null || focusedItem.type !== "line" || !lineSeries) return null;
	const series = lineSeries.series[focusedItem.seriesId];
	if (series.data[focusedItem.dataIndex] == null) return null;
	const xAxisId = series.xAxisId ?? xAxisIds[0];
	const yAxisId = series.yAxisId ?? yAxisIds[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
		fill: "none",
		stroke: (theme.vars ?? theme).palette.text.primary,
		strokeWidth: 2,
		x: xAxis[xAxisId].scale(xAxis[xAxisId].data[focusedItem.dataIndex]) - RADIUS,
		y: yAxis[yAxisId].scale(series.visibleStackedData[focusedItem.dataIndex][1]) - RADIUS,
		width: 2 * RADIUS,
		height: 2 * RADIUS,
		rx: 3,
		ry: 3
	});
}
//#endregion
//#region node_modules/@mui/x-charts/esm/LineChart/LineChart.js
/**
* Demos:
*
* - [Lines](https://mui.com/x/react-charts/lines/)
* - [Line demonstration](https://mui.com/x/react-charts/line-demo/)
*
* API:
*
* - [LineChart API](https://mui.com/x/api/charts/line-chart/)
*/
var LineChart = /* @__PURE__ */ import_react.forwardRef(function LineChart(inProps, ref) {
	const props = useThemeProps({
		props: inProps,
		name: "MuiLineChart"
	});
	const { chartsWrapperProps, chartContainerProps, gridProps, clipPathProps, clipPathGroupProps, areaPlotProps, linePlotProps, markPlotProps, overlayProps, chartsAxisProps, axisHighlightProps, lineHighlightPlotProps, legendProps, children } = useLineChartProps(props);
	const { chartDataProviderProps, chartsSurfaceProps } = useChartContainerProps(chartContainerProps, ref);
	const Tooltip = props.slots?.tooltip ?? ChartsTooltip;
	const Toolbar = props.slots?.toolbar;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartDataProvider, _extends({}, chartDataProviderProps, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ChartsWrapper, _extends({}, chartsWrapperProps, { children: [
		props.showToolbar && Toolbar ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toolbar, _extends({}, props.slotProps?.toolbar)) : null,
		!props.hideLegend && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsLegend, _extends({}, legendProps)),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ChartsSurface, _extends({}, chartsSurfaceProps, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsGrid, _extends({}, gridProps)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", _extends({}, clipPathGroupProps, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaPlot, _extends({}, areaPlotProps)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinePlot, _extends({}, linePlotProps)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsOverlay, _extends({}, overlayProps)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsAxisHighlight, _extends({}, axisHighlightProps))
			] })),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FocusedLineMark, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsAxis, _extends({}, chartsAxisProps)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
				"data-drawing-container": true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarkPlot, _extends({}, markPlotProps))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LineHighlightPlot, _extends({}, lineHighlightPlotProps)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsClipPath, _extends({}, clipPathProps)),
			children
		] })),
		!props.loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, _extends({}, props.slotProps?.tooltip))
	] })) }));
});
LineChart.displayName = "LineChart";
LineChart.propTypes = {
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
	disableLineItemHighlight: import_prop_types.default.bool,
	enableKeyboardNavigation: import_prop_types.default.bool,
	experimentalFeatures: import_prop_types.default.shape({ preferStrictDomainInLineCharts: import_prop_types.default.bool }),
	grid: import_prop_types.default.shape({
		horizontal: import_prop_types.default.bool,
		vertical: import_prop_types.default.bool
	}),
	height: import_prop_types.default.number,
	hiddenItems: import_prop_types.default.arrayOf(import_prop_types.default.shape({
		dataIndex: import_prop_types.default.number,
		seriesId: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]),
		type: import_prop_types.default.oneOf(["line"]).isRequired
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
		type: import_prop_types.default.oneOf(["line"]).isRequired
	})),
	loading: import_prop_types.default.bool,
	localeText: import_prop_types.default.object,
	margin: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.shape({
		bottom: import_prop_types.default.number,
		left: import_prop_types.default.number,
		right: import_prop_types.default.number,
		top: import_prop_types.default.number
	})]),
	onAreaClick: import_prop_types.default.func,
	onAxisClick: import_prop_types.default.func,
	onHiddenItemsChange: import_prop_types.default.func,
	onHighlightChange: import_prop_types.default.func,
	onHighlightedAxisChange: import_prop_types.default.func,
	onLineClick: import_prop_types.default.func,
	onMarkClick: import_prop_types.default.func,
	onTooltipItemChange: import_prop_types.default.func,
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
		dataIndex: import_prop_types.default.number,
		seriesId: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]).isRequired,
		type: import_prop_types.default.oneOf(["line"]).isRequired
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
export { AnimatedArea, AnimatedLine, AreaElement, AreaPlot, FocusedLineMark, LINE_CHART_PLUGINS, LineChart, LineElement, LineHighlightElement, LineHighlightPlot, LinePlot, MarkElement, MarkPlot, areaElementClasses, getAreaElementUtilityClass, getHighlightElementUtilityClass, getLineElementUtilityClass, getMarkElementUtilityClass, lineClasses, lineElementClasses, lineHighlightElementClasses, markElementClasses };

//# sourceMappingURL=@mui_x-charts_LineChart.js.map