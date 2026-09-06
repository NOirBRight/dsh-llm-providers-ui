window.__ModuleLoader__.load({
	id: "dsh-llm-providers-ui",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let react_dom = require("react-dom");
		//#region node_modules/.pnpm/@deepseek-ai+cosmokit@1.8.3/node_modules/@deepseek-ai/cosmokit/lib/index.js
		/** Return true when a value is `null` or `undefined`. */
		function isNullable(value) {
			return value === null || value === void 0;
		}
		/** Return true for non-array object values. */
		function isPlainObject(data) {
			return data && typeof data === "object" && !Array.isArray(data);
		}
		/** Filter object entries and return a new object. */
		function filterKeys(object, filter) {
			return Object.fromEntries(Object.entries(object).filter(([key, value]) => filter(key, value)));
		}
		/** Map object values while preserving the original key set. */
		function mapValues(object, transform) {
			return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, transform(value, key)]));
		}
		/** Pick selected keys from an object, optionally including `undefined` values. */
		function pick(source, keys, forced) {
			if (!keys) return { ...source };
			const result = {};
			for (const key of keys) if (forced || source[key] !== void 0) result[key] = source[key];
			return result;
		}
		/** Test values using `instanceof` with a `toStringTag` fallback. */
		function is(type, value) {
			if (arguments.length === 1) return (value) => is(type, value);
			return type in globalThis && value instanceof globalThis[type] || Object.prototype.toString.call(value).slice(8, -1) === type;
		}
		function isArrayBufferLike(value) {
			return is("ArrayBuffer", value) || is("SharedArrayBuffer", value);
		}
		function isArrayBufferSource(value) {
			return isArrayBufferLike(value) || ArrayBuffer.isView(value);
		}
		/** Binary source detection and base64/hex conversion helpers. */
		var Binary;
		(function(Binary) {
			Binary.is = isArrayBufferLike;
			Binary.isSource = isArrayBufferSource;
			function fromSource(source) {
				if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
				else return source;
			}
			Binary.fromSource = fromSource;
			function toBase64(source) {
				source = fromSource(source);
				if (typeof Buffer !== "undefined") return Buffer.from(source).toString("base64");
				let binary = "";
				const bytes = new Uint8Array(source);
				for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
				return btoa(binary);
			}
			Binary.toBase64 = toBase64;
			function fromBase64(source) {
				if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "base64"));
				return Uint8Array.from(atob(source), (c) => c.charCodeAt(0));
			}
			Binary.fromBase64 = fromBase64;
			function toHex(source) {
				source = fromSource(source);
				if (typeof Buffer !== "undefined") return Buffer.from(source).toString("hex");
				return Array.from(new Uint8Array(source), (byte) => byte.toString(16).padStart(2, "0")).join("");
			}
			Binary.toHex = toHex;
			function fromHex(source) {
				if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "hex"));
				const hex = source.length % 2 === 0 ? source : source.slice(0, source.length - 1);
				const buffer = [];
				for (let i = 0; i < hex.length; i += 2) buffer.push(parseInt(`${hex[i]}${hex[i + 1]}`, 16));
				return Uint8Array.from(buffer).buffer;
			}
			Binary.fromHex = fromHex;
		})(Binary || (Binary = {}));
		Binary.fromBase64;
		Binary.toBase64;
		Binary.fromHex;
		Binary.toHex;
		/** Deep-clone common JavaScript values while preserving prototypes and cycles. */
		function clone(source, refs = /* @__PURE__ */ new Map()) {
			if (!source || typeof source !== "object") return source;
			if (is("Date", source)) return new Date(source.valueOf());
			if (is("RegExp", source)) return new RegExp(source.source, source.flags);
			if (isArrayBufferLike(source)) return source.slice(0);
			if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
			const cached = refs.get(source);
			if (cached) return cached;
			if (Array.isArray(source)) {
				const result = [];
				refs.set(source, result);
				source.forEach((value, index) => {
					result[index] = Reflect.apply(clone, null, [value, refs]);
				});
				return result;
			}
			const result = Object.create(Object.getPrototypeOf(source));
			refs.set(source, result);
			for (const key of Reflect.ownKeys(source)) {
				const descriptor = { ...Reflect.getOwnPropertyDescriptor(source, key) };
				if ("value" in descriptor) descriptor.value = Reflect.apply(clone, null, [descriptor.value, refs]);
				Reflect.defineProperty(result, key, descriptor);
			}
			return result;
		}
		/** Deeply compare arrays, dates, regexps, buffers, and plain object fields. */
		function deepEqual(a, b, strict) {
			if (a === b) return true;
			if (!strict && isNullable(a) && isNullable(b)) return true;
			if (typeof a !== typeof b) return false;
			if (typeof a !== "object") return false;
			if (!a || !b) return false;
			function check(test, then) {
				return test(a) ? test(b) ? then(a, b) : false : test(b) ? false : void 0;
			}
			return check(Array.isArray, (a, b) => a.length === b.length && a.every((item, index) => deepEqual(item, b[index]))) ?? check(is("Date"), (a, b) => a.valueOf() === b.valueOf()) ?? check(is("RegExp"), (a, b) => a.source === b.source && a.flags === b.flags) ?? check(isArrayBufferLike, (a, b) => {
				if (a.byteLength !== b.byteLength) return false;
				const viewA = new Uint8Array(a);
				const viewB = new Uint8Array(b);
				for (let i = 0; i < viewA.length; i++) if (viewA[i] !== viewB[i]) return false;
				return true;
			}) ?? Object.keys({
				...a,
				...b
			}).every((key) => deepEqual(a[key], b[key], strict));
		}
		/** Time constants plus parsing and formatting helpers. */
		var Time;
		(function(Time) {
			Time.millisecond = 1;
			Time.second = 1e3;
			Time.minute = Time.second * 60;
			Time.hour = Time.minute * 60;
			Time.day = Time.hour * 24;
			Time.week = Time.day * 7;
			let timezoneOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset();
			function setTimezoneOffset(offset) {
				timezoneOffset = offset;
			}
			Time.setTimezoneOffset = setTimezoneOffset;
			function getTimezoneOffset() {
				return timezoneOffset;
			}
			Time.getTimezoneOffset = getTimezoneOffset;
			function getDateNumber(date = /* @__PURE__ */ new Date(), offset) {
				if (typeof date === "number") date = new Date(date);
				if (offset === void 0) offset = timezoneOffset;
				return Math.floor((date.valueOf() / Time.minute - offset) / 1440);
			}
			Time.getDateNumber = getDateNumber;
			function fromDateNumber(value, offset) {
				const date = new Date(value * Time.day);
				if (offset === void 0) offset = timezoneOffset;
				return new Date(+date + offset * Time.minute);
			}
			Time.fromDateNumber = fromDateNumber;
			const numeric = /\d+(?:\.\d+)?/.source;
			const timeRegExp = new RegExp(`^${[
				"w(?:eek(?:s)?)?",
				"d(?:ay(?:s)?)?",
				"h(?:our(?:s)?)?",
				"m(?:in(?:ute)?(?:s)?)?",
				"s(?:ec(?:ond)?(?:s)?)?"
			].map((unit) => `(${numeric}${unit})?`).join("")}$`);
			function parseTime(source) {
				const capture = timeRegExp.exec(source);
				if (!capture) return 0;
				return (parseFloat(capture[1]) * Time.week || 0) + (parseFloat(capture[2]) * Time.day || 0) + (parseFloat(capture[3]) * Time.hour || 0) + (parseFloat(capture[4]) * Time.minute || 0) + (parseFloat(capture[5]) * Time.second || 0);
			}
			Time.parseTime = parseTime;
			function parseDate(date) {
				const parsed = parseTime(date);
				if (parsed) date = Date.now() + parsed;
				else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).toLocaleDateString()}-${date}`;
				else if (/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).getFullYear()}-${date}`;
				return date ? new Date(date) : /* @__PURE__ */ new Date();
			}
			Time.parseDate = parseDate;
			function format(ms) {
				const abs = Math.abs(ms);
				if (abs >= Time.day - Time.hour / 2) return Math.round(ms / Time.day) + "d";
				else if (abs >= Time.hour - Time.minute / 2) return Math.round(ms / Time.hour) + "h";
				else if (abs >= Time.minute - Time.second / 2) return Math.round(ms / Time.minute) + "m";
				else if (abs >= Time.second) return Math.round(ms / Time.second) + "s";
				return ms + "ms";
			}
			Time.format = format;
			function toDigits(source, length = 2) {
				return source.toString().padStart(length, "0");
			}
			Time.toDigits = toDigits;
			function template(template, time = /* @__PURE__ */ new Date()) {
				return template.replace("yyyy", time.getFullYear().toString()).replace("yy", time.getFullYear().toString().slice(2)).replace("MM", toDigits(time.getMonth() + 1)).replace("dd", toDigits(time.getDate())).replace("hh", toDigits(time.getHours())).replace("mm", toDigits(time.getMinutes())).replace("ss", toDigits(time.getSeconds())).replace("SSS", toDigits(time.getMilliseconds(), 3));
			}
			Time.template = template;
		})(Time || (Time = {}));
		//#endregion
		//#region node_modules/.pnpm/@deepseek-ai+schemastery@3.18.1/node_modules/@deepseek-ai/schemastery/lib/index.mjs
		const kSchema = Symbol.for("schemastery");
		const kValidationError = Symbol.for("ValidationError");
		globalThis.__schemastery_index__ ??= 0;
		globalThis.__schemastery_refs__ = void 0;
		var ValidationError = class extends TypeError {
			options;
			name = "ValidationError";
			constructor(message, options) {
				let prefix = "$";
				for (const segment of options.path || []) if (typeof segment === "string") prefix += "." + segment;
				else if (typeof segment === "number") prefix += "[" + segment + "]";
				else if (typeof segment === "symbol") prefix += `[Symbol(${segment.toString()})]`;
				if (prefix.startsWith(".")) prefix = prefix.slice(1);
				super((prefix === "$" ? "" : `${prefix} `) + message);
				this.options = options;
			}
			static is(error) {
				return !!error?.[kValidationError];
			}
		};
		Object.defineProperty(ValidationError.prototype, kValidationError, { value: true });
		const Schema = function(options) {
			const schema = function(data, options = {}) {
				return Schema.resolve(data, schema, options)[0];
			};
			if (options.refs) {
				const refs = mapValues(options.refs, (options) => new Schema(options));
				const getRef = (uid) => refs[uid];
				for (const key in refs) {
					const options = refs[key];
					options.sKey = getRef(options.sKey);
					options.inner = getRef(options.inner);
					options.list = options.list && options.list.map(getRef);
					options.dict = options.dict && mapValues(options.dict, getRef);
				}
				return refs[options.uid];
			}
			Object.assign(schema, options);
			if (typeof schema.callback === "string") try {
				schema.callback = new Function("return " + schema.callback)();
			} catch {}
			Object.defineProperty(schema, "uid", { value: globalThis.__schemastery_index__++ });
			Object.setPrototypeOf(schema, Schema.prototype);
			schema.meta ||= {};
			schema.toString = schema.toString.bind(schema);
			return schema;
		};
		Schema.prototype = Object.create(Function.prototype);
		Schema.prototype[kSchema] = true;
		Object.defineProperty(Schema.prototype, "~standard", { get() {
			return {
				version: 1,
				vendor: "schemastery",
				validate: (value) => {
					try {
						return { value: Schema.resolve(value, this, {})[0] };
					} catch (error) {
						if (ValidationError.is(error)) return { issues: [{
							message: error.message,
							path: error.options.path
						}] };
						throw error;
					}
				}
			};
		} });
		Schema.ValidationError = ValidationError;
		Schema.prototype.toJSON = function toJSON() {
			if (globalThis.__schemastery_refs__) {
				globalThis.__schemastery_refs__[this.uid] ??= JSON.parse(JSON.stringify({ ...this }));
				return this.uid;
			}
			globalThis.__schemastery_refs__ = { [this.uid]: { ...this } };
			globalThis.__schemastery_refs__[this.uid] = JSON.parse(JSON.stringify({ ...this }));
			const result = {
				uid: this.uid,
				refs: globalThis.__schemastery_refs__
			};
			globalThis.__schemastery_refs__ = void 0;
			return result;
		};
		Schema.prototype.set = function set(key, value) {
			this.dict[key] = value;
			return this;
		};
		Schema.prototype.push = function push(value) {
			this.list.push(value);
			return this;
		};
		function mergeDesc(original, messages) {
			const result = typeof original === "string" ? { "": original } : { ...original };
			for (const locale in messages) {
				const value = messages[locale];
				if (value?.$description || value?.$desc) result[locale] = value.$description || value.$desc;
				else if (typeof value === "string") result[locale] = value;
			}
			return result;
		}
		function getInner(value) {
			return value?.$value ?? value?.$inner;
		}
		function extractKeys(data) {
			return filterKeys(data ?? {}, (key) => !key.startsWith("$"));
		}
		Schema.prototype.i18n = function i18n(messages) {
			const schema = Schema(this);
			const desc = mergeDesc(schema.meta.description, messages);
			if (Object.keys(desc).length) schema.meta.description = desc;
			if (schema.dict) schema.dict = mapValues(schema.dict, (inner, key) => {
				return inner.i18n(mapValues(messages, (data) => getInner(data)?.[key] ?? data?.[key]));
			});
			if (schema.list) schema.list = schema.list.map((inner, index) => {
				return inner.i18n(mapValues(messages, (data = {}) => {
					if (Array.isArray(getInner(data))) return getInner(data)[index];
					if (Array.isArray(data)) return data[index];
					return extractKeys(data);
				}));
			});
			if (schema.inner) schema.inner = schema.inner.i18n(mapValues(messages, (data) => {
				if (getInner(data)) return getInner(data);
				return extractKeys(data);
			}));
			if (schema.sKey) schema.sKey = schema.sKey.i18n(mapValues(messages, (data) => data?.$key));
			return schema;
		};
		Schema.prototype.extra = function extra(key, value) {
			const schema = Schema(this);
			schema.meta = {
				...schema.meta,
				[key]: value
			};
			return schema;
		};
		for (const key of [
			"required",
			"disabled",
			"collapse",
			"hidden",
			"loose"
		]) Object.assign(Schema.prototype, { [key](value = true) {
			const schema = Schema(this);
			schema.meta = {
				...schema.meta,
				[key]: value
			};
			return schema;
		} });
		Schema.prototype.deprecated = function deprecated() {
			const schema = Schema(this);
			schema.meta.badges ||= [];
			schema.meta.badges.push({
				text: "deprecated",
				type: "danger"
			});
			return schema;
		};
		Schema.prototype.experimental = function experimental() {
			const schema = Schema(this);
			schema.meta.badges ||= [];
			schema.meta.badges.push({
				text: "experimental",
				type: "warning"
			});
			return schema;
		};
		Schema.prototype.pattern = function pattern(regexp) {
			const schema = Schema(this);
			const pattern = pick(regexp, ["source", "flags"]);
			schema.meta = {
				...schema.meta,
				pattern
			};
			return schema;
		};
		Schema.prototype.simplify = function simplify(value) {
			if (deepEqual(value, this.meta.default, this.type === "dict")) return null;
			if (isNullable(value)) return value;
			if (this.type === "object" || this.type === "dict") {
				const result = {};
				for (const key in value) {
					const item = (this.type === "object" ? this.dict[key] : this.inner)?.simplify(value[key]);
					if (this.type === "dict" || !isNullable(item)) result[key] = item;
				}
				if (deepEqual(result, this.meta.default, this.type === "dict")) return null;
				return result;
			} else if (this.type === "array" || this.type === "tuple") {
				const result = [];
				value.forEach((value, index) => {
					const schema = this.type === "array" ? this.inner : this.list[index];
					const item = schema ? schema.simplify(value) : value;
					result.push(item);
				});
				return result;
			} else if (this.type === "intersect") {
				const result = {};
				for (const item of this.list) Object.assign(result, item.simplify(value));
				return result;
			} else if (this.type === "union") for (const schema of this.list) try {
				Schema.resolve(value, schema, {});
				return schema.simplify(value);
			} catch {}
			return value;
		};
		Schema.prototype.toString = function toString(inline) {
			return formatters[this.type]?.(this, inline) ?? `Schema<${this.type}>`;
		};
		Schema.prototype.role = function role(role, extra) {
			const schema = Schema(this);
			schema.meta = {
				...schema.meta,
				role,
				extra
			};
			return schema;
		};
		for (const key of [
			"default",
			"link",
			"comment",
			"description",
			"max",
			"min",
			"step"
		]) Object.assign(Schema.prototype, { [key](value) {
			const schema = Schema(this);
			schema.meta = {
				...schema.meta,
				[key]: value
			};
			return schema;
		} });
		const resolvers = {};
		Schema.extend = function extend(type, resolve) {
			resolvers[type] = resolve;
		};
		Schema.resolve = function resolve(data, schema, options = {}, strict = false) {
			if (!schema) return [data];
			if (options.ignore?.(data, schema)) return [data];
			if (isNullable(data) && schema.type !== "lazy") {
				if (schema.meta.required) throw new ValidationError(`missing required value`, options);
				let current = schema;
				let fallback = schema.meta.default;
				while (current?.type === "intersect" && isNullable(fallback)) {
					current = current.list[0];
					fallback = current?.meta.default;
				}
				if (isNullable(fallback)) return [data];
				data = clone(fallback);
			}
			const callback = resolvers[schema.type];
			if (!callback) throw new ValidationError(`unsupported type "${schema.type}"`, options);
			try {
				return callback(data, schema, options, strict);
			} catch (error) {
				if (!schema.meta.loose) throw error;
				return [schema.meta.default];
			}
		};
		Schema.from = function from(source) {
			if (isNullable(source)) return Schema.any();
			else if ([
				"string",
				"number",
				"boolean"
			].includes(typeof source)) return Schema.const(source).required();
			else if (source[kSchema]) return source;
			else if (typeof source === "function") switch (source) {
				case String: return Schema.string().required();
				case Number: return Schema.number().required();
				case Boolean: return Schema.boolean().required();
				case Function: return Schema.function().required();
				default: return Schema.is(source).required();
			}
			else throw new TypeError(`cannot infer schema from ${source}`);
		};
		Schema.lazy = function lazy(builder) {
			const toJSON = () => {
				if (!schema.inner[kSchema]) {
					schema.inner = schema.builder();
					schema.inner.meta = {
						...schema.meta,
						...schema.inner.meta
					};
				}
				return schema.inner.toJSON();
			};
			const schema = new Schema({
				type: "lazy",
				builder,
				inner: { toJSON }
			});
			return schema;
		};
		Schema.natural = function natural() {
			return Schema.number().step(1).min(0);
		};
		Schema.percent = function percent() {
			return Schema.number().step(.01).min(0).max(1).role("slider");
		};
		Schema.date = function date() {
			return Schema.union([Schema.is(Date), Schema.transform(Schema.string().role("datetime"), (value, options) => {
				const date = new Date(value);
				if (isNaN(+date)) throw new ValidationError(`invalid date "${value}"`, options);
				return date;
			}, true)]);
		};
		Schema.regExp = function regExp(flag = "") {
			return Schema.union([Schema.is(RegExp), Schema.transform(Schema.string().role("regexp", { flag }), (value, options) => {
				try {
					return new RegExp(value, flag);
				} catch (e) {
					throw new ValidationError(e.message, options);
				}
			}, true)]);
		};
		Schema.arrayBuffer = function arrayBuffer(encoding) {
			return Schema.union([
				Schema.is(ArrayBuffer),
				Schema.is(SharedArrayBuffer),
				Schema.transform(Schema.any(), (value, options) => {
					if (Binary.isSource(value)) return Binary.fromSource(value);
					throw new ValidationError(`expected ArrayBufferSource but got ${value}`, options);
				}, true),
				...encoding ? [Schema.transform(Schema.string(), (value, options) => {
					try {
						return encoding === "base64" ? Binary.fromBase64(value) : Binary.fromHex(value);
					} catch (e) {
						throw new ValidationError(e.message, options);
					}
				}, true)] : []
			]);
		};
		Schema.extend("lazy", (data, schema, options, strict) => {
			if (!schema.inner[kSchema]) {
				schema.inner = schema.builder();
				schema.inner.meta = {
					...schema.meta,
					...schema.inner.meta
				};
			}
			return Schema.resolve(data, schema.inner, options, strict);
		});
		Schema.extend("any", (data) => {
			return [data];
		});
		Schema.extend("never", (data, _, options) => {
			throw new ValidationError(`expected nullable but got ${data}`, options);
		});
		Schema.extend("const", (data, { value }, options) => {
			if (deepEqual(data, value)) return [value];
			throw new ValidationError(`expected ${value} but got ${data}`, options);
		});
		function checkWithinRange(data, meta, description, options, skipMin = false) {
			const { max = Infinity, min = -Infinity } = meta;
			if (data > max) throw new ValidationError(`expected ${description} <= ${max} but got ${data}`, options);
			if (data < min && !skipMin) throw new ValidationError(`expected ${description} >= ${min} but got ${data}`, options);
		}
		Schema.extend("string", (data, { meta }, options) => {
			if (typeof data !== "string") throw new ValidationError(`expected string but got ${data}`, options);
			if (meta.pattern) {
				const regexp = new RegExp(meta.pattern.source, meta.pattern.flags);
				if (!regexp.test(data)) throw new ValidationError(`expect string to match regexp ${regexp}`, options);
			}
			checkWithinRange(data.length, meta, "string length", options);
			return [data];
		});
		function decimalShift(data, digits) {
			const str = data.toString();
			if (str.includes("e")) return data * Math.pow(10, digits);
			const index = str.indexOf(".");
			if (index === -1) return data * Math.pow(10, digits);
			const frac = str.slice(index + 1);
			const integer = str.slice(0, index);
			if (frac.length <= digits) return +(integer + frac.padEnd(digits, "0"));
			return +(integer + frac.slice(0, digits) + "." + frac.slice(digits));
		}
		function isMultipleOf(data, min, step) {
			step = Math.abs(step);
			if (!/^\d+\.\d+$/.test(step.toString())) return (data - min) % step === 0;
			const index = step.toString().indexOf(".");
			const digits = step.toString().slice(index + 1).length;
			return Math.abs(decimalShift(data, digits) - decimalShift(min, digits)) % decimalShift(step, digits) === 0;
		}
		Schema.extend("number", (data, { meta }, options) => {
			if (typeof data !== "number") throw new ValidationError(`expected number but got ${data}`, options);
			checkWithinRange(data, meta, "number", options);
			const { step } = meta;
			if (step && !isMultipleOf(data, meta.min ?? 0, step)) throw new ValidationError(`expected number multiple of ${step} but got ${data}`, options);
			return [data];
		});
		Schema.extend("boolean", (data, _, options) => {
			if (typeof data === "boolean") return [data];
			throw new ValidationError(`expected boolean but got ${data}`, options);
		});
		Schema.extend("bitset", (data, { bits, meta }, options) => {
			let value = 0, keys = [];
			if (typeof data === "number") {
				value = data;
				for (const key in bits) if (data & bits[key]) keys.push(key);
			} else if (Array.isArray(data)) {
				keys = data;
				for (const key of keys) {
					if (typeof key !== "string") throw new ValidationError(`expected string but got ${key}`, options);
					if (key in bits) value |= bits[key];
				}
			} else throw new ValidationError(`expected number or array but got ${data}`, options);
			if (value === meta.default) return [value];
			return [value, keys];
		});
		Schema.extend("function", (data, _, options) => {
			if (typeof data === "function") return [data];
			throw new ValidationError(`expected function but got ${data}`, options);
		});
		Schema.extend("is", (data, { constructor }, options) => {
			if (typeof constructor === "function") {
				if (data instanceof constructor) return [data];
				throw new ValidationError(`expected ${constructor.name} but got ${data}`, options);
			} else {
				if (isNullable(data)) throw new ValidationError(`expected ${constructor} but got ${data}`, options);
				let prototype = Object.getPrototypeOf(data);
				while (prototype) {
					if (prototype.constructor?.name === constructor) return [data];
					prototype = Object.getPrototypeOf(prototype);
				}
				throw new ValidationError(`expected ${constructor} but got ${data}`, options);
			}
		});
		function property(data, key, schema, options) {
			try {
				const [value, adapted] = Schema.resolve(data[key], schema, {
					...options,
					path: [...options.path || [], key]
				});
				if (adapted !== void 0) data[key] = adapted;
				return value;
			} catch (e) {
				if (!options?.autofix) throw e;
				delete data[key];
				return schema.meta.default;
			}
		}
		Schema.extend("array", (data, { inner, meta }, options) => {
			if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
			checkWithinRange(data.length, meta, "array length", options, !isNullable(inner.meta.default));
			return [data.map((_, index) => property(data, index, inner, options))];
		});
		Schema.extend("dict", (data, { inner, sKey }, options, strict) => {
			if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
			const result = {};
			for (const key in data) {
				let rKey;
				try {
					rKey = Schema.resolve(key, sKey, options)[0];
				} catch (error) {
					if (strict) continue;
					throw error;
				}
				result[rKey] = property(data, key, inner, options);
				data[rKey] = data[key];
				if (key !== rKey) delete data[key];
			}
			return [result];
		});
		Schema.extend("tuple", (data, { list }, options, strict) => {
			if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
			const result = list.map((inner, index) => property(data, index, inner, options));
			if (strict) return [result];
			result.push(...data.slice(list.length));
			return [result];
		});
		function merge(result, data) {
			for (const key in data) {
				if (key in result) continue;
				result[key] = data[key];
			}
		}
		Schema.extend("object", (data, { dict }, options, strict) => {
			if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
			const result = {};
			for (const key in dict) {
				const value = property(data, key, dict[key], options);
				if (!isNullable(value) || key in data) result[key] = value;
			}
			if (!strict) merge(result, data);
			return [result];
		});
		Schema.extend("union", (data, { list, toString }, options, strict) => {
			const messages = [];
			for (const inner of list) try {
				return Schema.resolve(data, inner, options, strict);
			} catch (error) {
				messages.push(error);
			}
			throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
		});
		Schema.extend("intersect", (data, { list, toString }, options, strict) => {
			if (!list.length) return [data];
			let result;
			for (const inner of list) {
				const value = Schema.resolve(data, inner, options, true)[0];
				if (isNullable(value)) continue;
				if (isNullable(result)) result = value;
				else if (typeof result !== typeof value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
				else if (typeof value === "object") merge(result ??= {}, value);
				else if (result !== value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
			}
			if (!strict && isPlainObject(data)) merge(result, data);
			return [result];
		});
		Schema.extend("transform", (data, { inner, callback, preserve }, options) => {
			const [result, adapted = data] = Schema.resolve(data, inner, options, true);
			if (preserve) return [callback(result)];
			else return [callback(result), callback(adapted)];
		});
		const formatters = {};
		function defineMethod(name, keys, format) {
			formatters[name] = format;
			Object.assign(Schema, { [name](...args) {
				const schema = new Schema({ type: name });
				keys.forEach((key, index) => {
					switch (key) {
						case "sKey":
							schema.sKey = args[index] ?? Schema.string();
							break;
						case "inner":
							schema.inner = Schema.from(args[index]);
							break;
						case "list":
							schema.list = args[index].map(Schema.from);
							break;
						case "dict":
							schema.dict = mapValues(args[index], Schema.from);
							break;
						case "bits":
							schema.bits = {};
							for (const key in args[index]) {
								if (typeof args[index][key] !== "number") continue;
								schema.bits[key] = args[index][key];
							}
							break;
						case "callback": {
							const callback = schema.callback = args[index];
							callback["toJSON"] ||= () => callback.toString();
							break;
						}
						case "constructor": {
							const constructor = schema.constructor = args[index];
							if (typeof constructor === "function") constructor["toJSON"] ||= () => constructor["name"];
							break;
						}
						default: schema[key] = args[index];
					}
				});
				if (name === "object" || name === "dict") schema.meta.default = {};
				else if (name === "array" || name === "tuple") schema.meta.default = [];
				else if (name === "bitset") schema.meta.default = 0;
				return schema;
			} });
		}
		defineMethod("is", ["constructor"], ({ constructor }) => {
			if (typeof constructor === "function") return constructor.name;
			else return constructor;
		});
		defineMethod("any", [], () => "any");
		defineMethod("never", [], () => "never");
		defineMethod("const", ["value"], ({ value }) => typeof value === "string" ? JSON.stringify(value) : value);
		defineMethod("string", [], () => "string");
		defineMethod("number", [], () => "number");
		defineMethod("boolean", [], () => "boolean");
		defineMethod("bitset", ["bits"], () => "bitset");
		defineMethod("function", [], () => "function");
		defineMethod("array", ["inner"], ({ inner }) => `${inner.toString(true)}[]`);
		defineMethod("dict", ["inner", "sKey"], ({ inner, sKey }) => `{ [key: ${sKey.toString()}]: ${inner.toString()} }`);
		defineMethod("tuple", ["list"], ({ list }) => `[${list.map((inner) => inner.toString()).join(", ")}]`);
		defineMethod("object", ["dict"], ({ dict }) => {
			if (Object.keys(dict).length === 0) return "{}";
			return `{ ${Object.entries(dict).map(([key, inner]) => {
				return `${key}${inner.meta.required ? "" : "?"}: ${inner.toString()}`;
			}).join(", ")} }`;
		});
		defineMethod("union", ["list"], ({ list }, inline) => {
			const result = list.map(({ toString: format }) => format()).join(" | ");
			return inline ? `(${result})` : result;
		});
		defineMethod("intersect", ["list"], ({ list }) => {
			return `${list.map((inner) => inner.toString(true)).join(" & ")}`;
		});
		defineMethod("transform", [
			"inner",
			"callback",
			"preserve"
		], ({ inner }, isInner) => inner.toString(isInner));
		//#endregion
		//#region lib/types/order.js
		/** Shared LLM provider card order: settings keys, picker routes, and catalog sort. */
		const PROVIDERS_SECTION_ID = "providers";
		const PROVIDERS_ITEM_SLOT = "settings.provider.item";
		const PROVIDERS_LOCALE_NS = "settings.providers";
		const PROVIDERS_SETTINGS_NS = "llm-providers";
		/** Display order for installed provider cards when the user has not saved one. */
		const PROVIDER_ITEM_ORDER = [
			"llm-cursor",
			"llm-grok",
			"llm-codex",
			"llm-ollama",
			"llm-commandcode",
			"llm-opencode-go"
		];
		const KNOWN_KEYS = new Set(PROVIDER_ITEM_ORDER);
		new Map(Object.entries({
			"llm-cursor": "cursor",
			"llm-grok": "grok",
			"llm-codex": "codex",
			"llm-ollama": "ollama-cloud",
			"llm-commandcode": "commandcode",
			"llm-opencode-go": "opencode-go"
		}).map(([key, route]) => [route, key]));
		function decodeStringList(value) {
			return Array.isArray(value) ? value.filter((entry) => typeof entry === "string" && entry.length > 0) : [];
		}
		/** Decode the llm-providers settings section. Unknown input becomes an empty order with nothing hidden. */
		function decodeProviderOrder(value) {
			if (value === null || typeof value !== "object" || Array.isArray(value)) return {
				order: [],
				hiddenUsageProviders: [],
				usageOrder: []
			};
			const record = value;
			return {
				order: decodeStringList(record.order),
				hiddenUsageProviders: decodeStringList(record.hiddenUsageProviders),
				usageOrder: decodeStringList(record.usageOrder)
			};
		}
		/**
		* Merge a saved key list with the keys that are actually installed.
		* Saved keys that are not installed are dropped; installed keys missing from
		* the save append in PROVIDER_ITEM_ORDER, then leftover unknown keys.
		* Nothing registered yields an empty list (the settings empty state).
		*/
		function applySavedOrder(registered, saved = []) {
			const have = [...new Set(registered.filter((key) => key.length > 0))];
			if (have.length === 0) return [];
			const installed = new Set(have);
			const preferredSaved = [...new Set(saved)].filter((key) => installed.has(key));
			const preferred = new Set(preferredSaved);
			const rest = have.filter((key) => !preferred.has(key));
			const known = PROVIDER_ITEM_ORDER.filter((key) => rest.includes(key));
			const extra = rest.filter((key) => !KNOWN_KEYS.has(key));
			return [
				...preferredSaved,
				...known,
				...extra
			];
		}
		//#endregion
		//#region lib/types/client/SortableList.js
		/** Pointer-driven sortable list with a floating ghost and animated live preview. */
		const listStyle = {
			display: "flex",
			flexDirection: "column",
			gap: 8
		};
		const rowStyle = {
			display: "grid",
			gridTemplateColumns: "30px minmax(0, 1fr)",
			alignItems: "stretch",
			overflow: "hidden",
			border: "1px solid var(--dsw-alias-border-l2)",
			borderRadius: 8,
			background: "var(--dsw-alias-bg-layer-1)",
			transition: "box-shadow 150ms ease, opacity 150ms ease, transform 150ms ease"
		};
		const handleStyle = {
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			width: 30,
			minHeight: 42,
			alignSelf: "stretch",
			border: 0,
			borderRight: "1px solid var(--dsw-alias-border-l2)",
			padding: 0,
			flex: "none",
			touchAction: "none",
			userSelect: "none",
			background: "transparent",
			color: "var(--dsw-alias-label-tertiary)",
			position: "relative",
			zIndex: 2
		};
		const cardRowStyle = {
			...rowStyle,
			borderRadius: 10,
			background: "var(--dsw-alias-bg-module-platform)",
			overflow: "hidden"
		};
		const cardItemStyle = {
			minWidth: 0,
			display: "flex",
			flexDirection: "column"
		};
		const plainRowStyle = {
			display: "grid",
			alignItems: "stretch",
			background: "transparent"
		};
		const plainItemStyle = {
			minWidth: 0,
			display: "flex",
			flexDirection: "column",
			padding: "4px 0"
		};
		const moveButtonStyle = {
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			minWidth: 34,
			minHeight: 34,
			alignSelf: "center",
			border: 0,
			padding: 0,
			flex: "none",
			background: "transparent",
			color: "var(--dsw-alias-label-tertiary)",
			fontSize: 16,
			cursor: "pointer"
		};
		const touchCss = "@media (pointer:coarse){[data-sortable-handle],[data-sortable-move]{min-width:44px;min-height:44px}}";
		const cardCss = "[data-sortable-card] [data-sortable-item] li,[data-sortable-ghost] [data-sortable-item] li{border:0!important;border-radius:0!important;background:transparent!important;overflow:visible!important;list-style:none;margin:0}";
		const ghostStyle = {
			...rowStyle,
			position: "fixed",
			zIndex: 1e4,
			pointerEvents: "none",
			opacity: .96,
			boxShadow: "var(--dsw-shadow-lv2, 0 10px 30px rgba(0, 0, 0, 0.18))",
			outline: "2px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 22%, transparent)"
		};
		/** Grip glyph marking one row's pointer handle. */
		function IconGrip() {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: "10",
				height: "14",
				viewBox: "0 0 10 14",
				fill: "currentColor",
				"aria-hidden": true,
				children: [
					(0, react_jsx_runtime.jsx)("circle", {
						cx: "2.5",
						cy: "2.5",
						r: "1.2"
					}),
					(0, react_jsx_runtime.jsx)("circle", {
						cx: "7.5",
						cy: "2.5",
						r: "1.2"
					}),
					(0, react_jsx_runtime.jsx)("circle", {
						cx: "2.5",
						cy: "7",
						r: "1.2"
					}),
					(0, react_jsx_runtime.jsx)("circle", {
						cx: "7.5",
						cy: "7",
						r: "1.2"
					}),
					(0, react_jsx_runtime.jsx)("circle", {
						cx: "2.5",
						cy: "11.5",
						r: "1.2"
					}),
					(0, react_jsx_runtime.jsx)("circle", {
						cx: "7.5",
						cy: "11.5",
						r: "1.2"
					})
				]
			});
		}
		/**
		* Pointer-driven sortable list: a portal ghost follows the pointer, a preview
		* array records the prospective order, and FLIP animations move sibling rows.
		*/
		function SortableList({ items, getId, renderItem, dragLabel, onReorder, disabled = false, chrome = "row", sorting = true, moveButtons = false, moveUpLabel, moveDownLabel }) {
			const card = chrome === "card";
			const plain = chrome === "plain";
			const interactive = sorting && !disabled;
			const showHandle = sorting;
			const upLabel = moveUpLabel ?? (() => "Move up");
			const downLabel = moveDownLabel ?? (() => "Move down");
			/** Commit a durable reorder moving one row by an offset. Pointer preview stays untouched. */
			const moveBy = (id, offset) => {
				if (!interactive || draggedId !== null) return;
				const from = items.findIndex((item) => getId(item) === id);
				if (from < 0) return;
				const to = from + offset;
				if (to < 0 || to >= items.length) return;
				const next = [...items];
				const moved = next.splice(from, 1)[0];
				if (moved === void 0) return;
				next.splice(to, 0, moved);
				onReorder(next);
			};
			/** Arrow keys on a handle commit the same reorder as a pointer drag. */
			const handleKeyDown = (event, id) => {
				if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
				event.preventDefault();
				moveBy(id, event.key === "ArrowUp" ? -1 : 1);
			};
			const [draggedId, setDraggedId] = (0, react.useState)(null);
			const [dropTargetId, setDropTargetId] = (0, react.useState)(null);
			const [previewItems, setPreviewItems] = (0, react.useState)(null);
			const [dragGhost, setDragGhost] = (0, react.useState)(null);
			const rowRefs = (0, react.useRef)(/* @__PURE__ */ new Map());
			const previousRects = (0, react.useRef)(null);
			const previewRef = (0, react.useRef)(null);
			const dragGhostRef = (0, react.useRef)(null);
			const renderedItems = previewItems ?? items;
			const draggedItem = draggedId === null ? void 0 : renderedItems.find((item) => getId(item) === draggedId) ?? items.find((item) => getId(item) === draggedId);
			(0, react.useEffect)(() => {
				if (draggedId === null) return;
				const style = document.createElement("style");
				style.textContent = "html.providers-sortable-dragging, html.providers-sortable-dragging * { cursor: grabbing !important; user-select: none !important; }";
				const previousRootCursor = document.documentElement.style.cursor;
				const previousBodyCursor = document.body.style.cursor;
				document.head.appendChild(style);
				document.documentElement.classList.add("providers-sortable-dragging");
				document.documentElement.style.cursor = "grabbing";
				document.body.style.cursor = "grabbing";
				return () => {
					document.documentElement.classList.remove("providers-sortable-dragging");
					style.remove();
					document.documentElement.style.cursor = previousRootCursor;
					document.body.style.cursor = previousBodyCursor;
				};
			}, [draggedId]);
			(0, react.useEffect)(() => {
				if (draggedId === null) return;
				const handlePointerMove = (event) => {
					const currentGhost = dragGhostRef.current;
					if (currentGhost === null) return;
					event.preventDefault();
					const nextGhost = {
						...currentGhost,
						x: event.clientX - currentGhost.offsetX,
						y: event.clientY - currentGhost.offsetY
					};
					dragGhostRef.current = nextGhost;
					setDragGhost(nextGhost);
					movePreviewFromPointer(nextGhost.y + nextGhost.height / 2);
				};
				const handlePointerUp = (event) => {
					event.preventDefault();
					finishDrag(true);
				};
				const handlePointerCancel = (event) => {
					event.preventDefault();
					finishDrag(false);
				};
				const handleKeyDown = (event) => {
					if (event.key !== "Escape") return;
					event.preventDefault();
					finishDrag(false);
				};
				window.addEventListener("pointermove", handlePointerMove, { passive: false });
				window.addEventListener("pointerup", handlePointerUp, { passive: false });
				window.addEventListener("pointercancel", handlePointerCancel, { passive: false });
				window.addEventListener("keydown", handleKeyDown);
				return () => {
					window.removeEventListener("pointermove", handlePointerMove);
					window.removeEventListener("pointerup", handlePointerUp);
					window.removeEventListener("pointercancel", handlePointerCancel);
					window.removeEventListener("keydown", handleKeyDown);
				};
			}, [draggedId]);
			(0, react.useLayoutEffect)(() => {
				const rects = previousRects.current;
				if (rects === null) return;
				previousRects.current = null;
				rowRefs.current.forEach((node, id) => {
					const previous = rects.get(id);
					if (previous === void 0) return;
					const next = node.getBoundingClientRect();
					const deltaX = previous.left - next.left;
					const deltaY = previous.top - next.top;
					if (deltaX === 0 && deltaY === 0 || typeof node.animate !== "function") return;
					node.animate([{ transform: "translate(" + String(deltaX) + "px, " + String(deltaY) + "px)" }, { transform: "translate(0, 0)" }], {
						duration: 160,
						easing: "cubic-bezier(0.2, 0, 0, 1)"
					});
				});
			}, [renderedItems]);
			const startDrag = (event, id) => {
				if (!interactive || dragGhostRef.current !== null) return;
				if (event.pointerType === "mouse" && event.button !== 0) return;
				const row = event.currentTarget.closest("[data-sortable-row=\"true\"]");
				if (!(row instanceof HTMLElement)) return;
				event.preventDefault();
				if (typeof event.currentTarget.focus === "function") event.currentTarget.focus();
				try {
					event.currentTarget.setPointerCapture(event.pointerId);
				} catch {}
				const rect = row.getBoundingClientRect();
				const nextGhost = {
					id,
					x: rect.left,
					y: rect.top,
					width: rect.width,
					height: rect.height,
					offsetX: event.clientX - rect.left,
					offsetY: event.clientY - rect.top
				};
				dragGhostRef.current = nextGhost;
				const initial = [...items];
				previewRef.current = initial;
				setPreviewItems(initial);
				setDragGhost(nextGhost);
				setDraggedId(id);
			};
			const finishDrag = (commit) => {
				const next = previewRef.current;
				if (commit && next !== null && !sameOrder(next, items, getId)) onReorder(next);
				previewRef.current = null;
				dragGhostRef.current = null;
				setPreviewItems(null);
				setDragGhost(null);
				setDraggedId(null);
				setDropTargetId(null);
			};
			const captureRects = () => {
				previousRects.current = new Map(Array.from(rowRefs.current.entries()).map(([id, node]) => [id, node.getBoundingClientRect()]));
			};
			const setRowRef = (id, node) => {
				if (node === null) rowRefs.current.delete(id);
				else rowRefs.current.set(id, node);
			};
			const movePreviewFromPointer = (pointerY) => {
				if (draggedId === null) return;
				const current = previewRef.current ?? [...items];
				const from = current.findIndex((item) => getId(item) === draggedId);
				if (from < 0) return;
				const dragged = current[from];
				if (dragged === void 0) return;
				const remaining = current.filter((item) => getId(item) !== draggedId);
				let insertionIndex = remaining.length;
				let nextDropTargetId = remaining.length === 0 ? null : getId(remaining[remaining.length - 1]);
				for (let index = 0; index < remaining.length; index += 1) {
					const item = remaining[index];
					if (item === void 0) continue;
					const id = getId(item);
					const node = rowRefs.current.get(id);
					if (node === void 0) continue;
					const rect = node.getBoundingClientRect();
					if (pointerY < rect.top + rect.height / 2) {
						insertionIndex = index;
						nextDropTargetId = id;
						break;
					}
				}
				const next = [
					...remaining.slice(0, insertionIndex),
					dragged,
					...remaining.slice(insertionIndex)
				];
				setDropTargetId(nextDropTargetId);
				if (sameOrder(next, current, getId)) return;
				captureRects();
				previewRef.current = next;
				setPreviewItems(next);
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				"data-sortable-card": card ? "" : void 0,
				"data-sortable-plain": plain ? "" : void 0,
				style: {
					...listStyle,
					...card ? { gap: 12 } : {},
					...plain ? { gap: 0 } : {}
				},
				children: [
					card ? (0, react_jsx_runtime.jsx)("style", { children: cardCss }) : null,
					plain || moveButtons ? (0, react_jsx_runtime.jsx)("style", { children: touchCss }) : null,
					renderedItems.map((item, index) => {
						const id = getId(item);
						const dragging = draggedId === id;
						const targeted = dropTargetId === id && draggedId !== id;
						return (0, react_jsx_runtime.jsxs)("div", {
							ref: (node) => {
								setRowRef(id, node);
							},
							"data-sortable-row": "true",
							style: {
								...plain ? {
									...plainRowStyle,
									gridTemplateColumns: (showHandle ? "30px " : "") + "minmax(0,1fr)" + (moveButtons ? " auto auto" : "")
								} : card ? cardRowStyle : rowStyle,
								visibility: dragging ? "hidden" : "visible",
								pointerEvents: dragging ? "none" : "auto",
								borderColor: dragging ? "transparent" : "var(--dsw-alias-border-l2)",
								boxShadow: targeted ? "0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-primary) 20%, transparent)" : "none"
							},
							onPointerDown: (event) => {
								const target = event.target;
								if (target instanceof Element && target.closest("a, input, select, textarea, label, button:not([data-sortable-handle])") !== null) return;
								startDrag(event, id);
							},
							children: [
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									"data-sortable-handle": "",
									style: {
										...handleStyle,
										...plain ? { borderRight: 0 } : {},
										cursor: disabled ? "default" : draggedId === null ? "grab" : "grabbing"
									},
									"aria-label": dragLabel(item, index),
									"aria-grabbed": dragging,
									title: dragLabel(item, index),
									disabled,
									hidden: !showHandle,
									onDragStart: (event) => {
										event.preventDefault();
									},
									onPointerDown: (event) => {
										startDrag(event, id);
									},
									onKeyDown: (event) => {
										handleKeyDown(event, id);
									},
									children: (0, react_jsx_runtime.jsx)(IconGrip, {})
								}),
								(0, react_jsx_runtime.jsx)("div", {
									"data-sortable-item": "",
									style: plain ? plainItemStyle : card ? cardItemStyle : { minWidth: 0 },
									children: renderItem(item, index)
								}),
								moveButtons ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									"data-sortable-move": "up",
									style: moveButtonStyle,
									"aria-label": upLabel(item, index),
									title: upLabel(item, index),
									disabled: !interactive || index === 0,
									hidden: !showHandle,
									onClick: () => {
										moveBy(id, -1);
									},
									children: "\\u2191"
								}), (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									"data-sortable-move": "down",
									style: moveButtonStyle,
									"aria-label": downLabel(item, index),
									title: downLabel(item, index),
									disabled: !interactive || index === renderedItems.length - 1,
									hidden: !showHandle,
									onClick: () => {
										moveBy(id, 1);
									},
									children: "\\u2193"
								})] }) : null
							]
						}, id);
					}),
					dragGhost !== null && draggedItem !== void 0 ? (0, react_dom.createPortal)((0, react_jsx_runtime.jsxs)("div", {
						"data-sortable-ghost": "true",
						style: {
							...ghostStyle,
							...card ? cardRowStyle : {},
							position: "fixed",
							left: dragGhost.x,
							top: dragGhost.y,
							width: dragGhost.width,
							minHeight: dragGhost.height
						},
						children: [(0, react_jsx_runtime.jsx)("div", {
							style: {
								...handleStyle,
								cursor: "grabbing"
							},
							children: (0, react_jsx_runtime.jsx)(IconGrip, {})
						}), (0, react_jsx_runtime.jsx)("div", {
							"data-sortable-item": "",
							style: card ? cardItemStyle : { minWidth: 0 },
							children: renderItem(draggedItem, renderedItems.findIndex((item) => getId(item) === draggedId))
						})]
					}), document.body) : null
				]
			});
		}
		function sameOrder(left, right, getId) {
			return left.length === right.length && left.every((item, index) => {
				const other = right[index];
				return other !== void 0 && getId(item) === getId(other);
			});
		}
		//#endregion
		//#region lib/types/client/provider-ui.js
		/**
		* Scoped provider chrome CSS: plain card reset, header button layout, body and
		* model rows, quota meter responsive rules, and coarse-pointer touch targets.
		* The shell injects it once per page; provider cards may also inject it once
		* for standalone use. Duplicate style tags are harmless: every rule is scoped
		* to a data-provider-* attribute and only narrows unstyled markup.
		*/
		const providerUiCss = [
			"[data-provider-card]{margin:0;border:0;border-radius:0;background:none;box-shadow:none;overflow:visible}",
			"[data-provider-card-header]{box-sizing:border-box;width:100%;min-height:68px;display:flex;align-items:center;justify-content:space-between;gap:16px;border:0;padding:12px 14px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;text-align:left;cursor:pointer}",
			"[data-provider-card-header]:hover{background:color-mix(in srgb, var(--dsw-alias-label-primary) 4%, transparent)}",
			"[data-provider-body]{display:flex;flex-direction:column;gap:18px;border-top:1px solid var(--dsw-alias-border-l2);padding:16px 14px 18px}",
			"[data-provider-model]{display:flex;align-items:center;gap:9px;min-height:40px}",
			"[data-provider-quota-mini]{display:block}",
			"[data-providers-list]{display:flex;flex-direction:column}",
			"[data-providers-list] [data-sortable-row]+[data-sortable-row]{border-top:1px solid var(--dsw-alias-border-l2)}",
			"@media (max-width:680px){[data-provider-card-header]{min-height:76px;padding:14px 4px}[data-provider-quota-mini]{max-width:none}[data-provider-model]{min-height:48px}[data-provider-model] input{width:17px;height:17px}[data-providers-section] button,[data-provider-card] button{min-height:44px}}",
			"@media (pointer:coarse){[data-sortable-handle],[data-sortable-move]{min-width:44px;min-height:44px}}"
		].join("\n");
		//#endregion
		//#region lib/types/client/ProvidersSection.js
		/** Settings > LLM Providers page shell. Provider cards arrive through settings.provider.item. */
		const pageStyle = {
			display: "flex",
			flexDirection: "column",
			gap: 16,
			width: "100%"
		};
		const titleStyle = {
			margin: 0,
			color: "var(--dsw-alias-label-primary)",
			fontSize: 16,
			fontWeight: 500,
			lineHeight: "24px"
		};
		const subtitleStyle = {
			margin: "4px 0 0",
			color: "var(--dsw-alias-label-secondary)",
			fontSize: 13,
			lineHeight: "20px"
		};
		const toolbarStyle = {
			display: "flex",
			justifyContent: "flex-end"
		};
		const sortButtonStyle = {
			minHeight: 34,
			border: "1px solid var(--dsw-alias-border-l2)",
			borderRadius: 18,
			padding: "6px 14px",
			background: "var(--dsw-alias-bg-layer-1)",
			color: "var(--dsw-alias-label-primary)",
			fontSize: 13,
			lineHeight: "20px",
			cursor: "pointer"
		};
		const emptyStyle = {
			color: "var(--dsw-alias-label-tertiary)",
			fontSize: 13,
			lineHeight: "20px"
		};
		const fallbackWrapStyle = {
			display: "flex",
			flexDirection: "column",
			gap: 8,
			minWidth: 0
		};
		const fallbackBadgeBase = {
			display: "inline-flex",
			alignItems: "center",
			alignSelf: "flex-start",
			whiteSpace: "nowrap",
			fontSize: 10,
			fontWeight: 500,
			lineHeight: "16px",
			padding: "0 5px",
			borderRadius: 3,
			border: "1px solid transparent"
		};
		const fallbackBadgeLlm = {
			color: "var(--dsw-alias-label-secondary)",
			borderColor: "var(--dsw-alias-border-secondary)",
			background: "transparent"
		};
		const fallbackBadgeAgent = {
			color: "var(--dsw-alias-bg-layer-1)",
			borderColor: "var(--dsw-alias-label-primary)",
			background: "var(--dsw-alias-label-primary)"
		};
		/** Bind the shared page to live keyed-slot and settings snapshots. */
		function bindProvidersSection(listRegisteredKeys, subscribe, readOrder, onReorder, roleOf, headerOf) {
			return function BoundProvidersSection(props) {
				const [, bump] = (0, react.useState)(0);
				(0, react.useEffect)(() => subscribe(() => {
					bump((value) => value + 1);
				}), [subscribe]);
				const order = readOrder();
				return (0, react_jsx_runtime.jsx)(ProvidersSection, {
					renderSlot: props.renderSlot,
					t: props.t,
					registeredKeys: listRegisteredKeys(),
					savedOrder: order.keys,
					disabled: order.disabled,
					onReorder,
					roleOf,
					...headerOf === void 0 ? {} : { headerOf }
				});
			};
		}
		/**
		* Render installed provider cards as a plain divider list. Sorting is an
		* explicit mode: one SortableList stays mounted in both modes with the same
		* keyed rows, so live slot state (authentication, drafts) survives the mode
		* toggle and every reorder.
		*/
		function ProvidersSection(props) {
			const t = props.t ?? ((key) => key);
			const keys = applySavedOrder(props.registeredKeys ?? [], props.savedOrder ?? []);
			const items = keys.map((key) => ({ key }));
			const [sorting, setSorting] = (0, react.useState)(false);
			const showToggle = keys.length > 1 && props.disabled !== true;
			const sortable = sorting && showToggle;
			const renderCard = (item) => {
				const node = props.renderSlot?.(PROVIDERS_ITEM_SLOT, {}, { entryKey: item.key });
				if (node == null) return null;
				const role = props.roleOf?.(item.key) ?? "llm";
				if (props.headerOf?.(item.key) === "shared") return (0, react_jsx_runtime.jsx)("div", {
					"data-provider-slot": "",
					"data-provider-role": role,
					children: node
				});
				return (0, react_jsx_runtime.jsxs)("div", {
					"data-provider-slot": "",
					"data-provider-role": role,
					style: fallbackWrapStyle,
					children: [(0, react_jsx_runtime.jsx)("span", {
						style: {
							...fallbackBadgeBase,
							...role === "agent" ? fallbackBadgeAgent : fallbackBadgeLlm
						},
						children: role === "agent" ? "Agent" : "LLM"
					}), node]
				});
			};
			const body = keys.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
				style: emptyStyle,
				children: t("empty")
			}) : (0, react_jsx_runtime.jsx)("div", {
				"data-providers-list": "",
				children: (0, react_jsx_runtime.jsx)(SortableList, {
					chrome: "plain",
					items,
					getId: (item) => item.key,
					dragLabel: (item) => t("drag") + ": " + item.key,
					moveButtons: true,
					moveUpLabel: (item) => t("moveUp") + ": " + item.key,
					moveDownLabel: (item) => t("moveDown") + ": " + item.key,
					sorting: sortable,
					...props.disabled === void 0 ? {} : { disabled: props.disabled },
					onReorder: (next) => {
						props.onReorder?.(next.map((item) => item.key));
					},
					renderItem: (item) => renderCard(item)
				})
			});
			return (0, react_jsx_runtime.jsxs)("div", {
				"data-providers-section": PROVIDERS_LOCALE_NS,
				style: pageStyle,
				children: [
					(0, react_jsx_runtime.jsx)("style", { children: providerUiCss }),
					(0, react_jsx_runtime.jsxs)("header", { children: [(0, react_jsx_runtime.jsx)("h2", {
						style: titleStyle,
						children: t("title")
					}), (0, react_jsx_runtime.jsx)("p", {
						style: subtitleStyle,
						children: t("subtitle")
					})] }),
					showToggle ? (0, react_jsx_runtime.jsx)("div", {
						style: toolbarStyle,
						children: (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							style: sortButtonStyle,
							"aria-expanded": sorting,
							onClick: () => {
								setSorting((value) => !value);
							},
							children: sorting ? t("done") : t("sort")
						})
					}) : null,
					body
				]
			});
		}
		//#endregion
		//#region lib/types/client/cleanup.js
		function flattenCleanupError(error, output) {
			if (error instanceof AggregateError && error.errors.length > 0) {
				for (const nested of error.errors) flattenCleanupError(nested, output);
				return;
			}
			output.push(error);
		}
		function collectCleanupFailures(disposers) {
			const failures = [];
			for (let index = disposers.length - 1; index >= 0; index -= 1) {
				const disposer = disposers[index];
				if (disposer === void 0) continue;
				try {
					disposer();
				} catch (error) {
					flattenCleanupError(error, failures);
				}
			}
			return failures;
		}
		function throwCleanupFailures(failures, message) {
			if (failures.length === 0) return;
			if (failures.length === 1) throw failures[0];
			throw new AggregateError(failures, message);
		}
		/**
		* Dispose resources in reverse registration order while attempting every disposer.
		* Nested AggregateErrors are flattened into one ordered error list.
		* @param disposers - Disposers in registration order; missing entries are skipped.
		* @param message - Message used when more than one cleanup error remains.
		*/
		function disposeReverse(disposers, message) {
			throwCleanupFailures(collectCleanupFailures(disposers), message);
		}
		/**
		* Roll back resources after setup while keeping the setup error first.
		* @param setupError - Original setup failure to preserve as the first error.
		* @param disposers - Disposers in registration order for the partial setup.
		* @param message - Message for the setup-and-cleanup AggregateError.
		*/
		function disposeAfterSetup(setupError, disposers, message) {
			const failures = collectCleanupFailures(disposers);
			if (failures.length === 0) throw setupError;
			throw new AggregateError([setupError, ...failures], message);
		}
		//#endregion
		//#region lib/types/client/nav-icon.js
		/**
		* Patches the LLM Providers navigation row with its globe icon.
		*
		* The adapter owns only the SVG attributes and markup it writes. Each install
		* receives a distinct marker so overlapping installs can restore in order.
		* @module dsh-llm-providers-ui/client/nav-icon
		*/
		const LABELS = /* @__PURE__ */ new Set([
			"LLM 供应商",
			"LLM Providers",
			"供应商",
			"Providers"
		]);
		const ICON_MARK = "data-dsh-providers-icon";
		const OWNER_MARK = "data-dsh-providers-icon-owner";
		const NAV = "<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" fill=\"currentColor\" d=\"M7.00018 0.353516C10.6708 0.353535 13.6468 3.32958 13.6469 7.00018C13.6468 10.6708 10.6708 13.6468 7.00018 13.6469C3.32957 13.6468 0.353535 10.6708 0.353516 7.00018C0.353535 3.32957 3.32957 0.353531 7.00018 0.353516ZM5.44643 7.59661C5.49463 8.97506 5.70762 10.191 6.02136 11.0793C6.20141 11.5891 6.40328 11.9585 6.59898 12.1889C6.79501 12.4196 6.93213 12.454 7.00018 12.454C7.06822 12.454 7.20533 12.4197 7.40138 12.1889C7.59708 11.9585 7.79895 11.589 7.979 11.0793C8.29274 10.191 8.50574 8.97506 8.55394 7.59661H5.44643ZM1.57861 7.59661C1.80785 9.70467 3.2386 11.4509 5.1715 12.1388C5.07135 11.9317 4.97972 11.7098 4.89746 11.477C4.53084 10.4391 4.30224 9.0828 4.25357 7.59661H1.57861ZM9.74679 7.59661C9.69813 9.0828 9.46952 10.4391 9.1029 11.477C9.0206 11.7099 8.92818 11.9316 8.82797 12.1388C10.7613 11.4511 12.1925 9.70496 12.4218 7.59661H9.74679ZM5.1706 1.8616C3.23814 2.54963 1.80876 4.29604 1.5795 6.40376H4.25357C4.30224 4.91756 4.53083 3.56129 4.89746 2.5234C4.97968 2.29066 5.07051 2.0686 5.1706 1.8616ZM7.00018 1.54637C6.93213 1.54638 6.79503 1.5807 6.59898 1.81145C6.40332 2.04177 6.20139 2.41058 6.02136 2.92012C5.70754 3.80851 5.49461 5.02499 5.44643 6.40376H8.55394C8.50575 5.025 8.29282 3.80851 7.979 2.92012C7.79898 2.41059 7.59705 2.04177 7.40138 1.81145C7.20531 1.58067 7.06823 1.54637 7.00018 1.54637ZM8.82887 1.8616C8.92902 2.0687 9.02064 2.29053 9.1029 2.5234C9.46953 3.56129 9.69812 4.91756 9.74679 6.40376H12.4209C12.1916 4.29575 10.7618 2.54943 8.82887 1.8616Z\"/>";
		const REGISTRY_KEY = Symbol.for("dsh-llm-providers-ui.nav-icon.registry");
		function sharedRegistry() {
			const holder = globalThis;
			const existing = holder[REGISTRY_KEY];
			if (existing !== void 0) return existing;
			const created = {
				nextOwner: 0,
				states: /* @__PURE__ */ new WeakMap()
			};
			holder[REGISTRY_KEY] = created;
			return created;
		}
		function newOwnerMarker(registry) {
			registry.nextOwner += 1;
			return "owner-" + registry.nextOwner.toString(36);
		}
		function flattenFailure(failures, error) {
			if (error instanceof AggregateError && error.errors.length > 0) for (const nested of error.errors) flattenFailure(failures, nested);
			else failures.push(error);
		}
		function throwFailures(failures, message) {
			if (failures.length > 0) throw new AggregateError(failures, message);
		}
		function snapshotSvg(svg) {
			const attributes = [];
			for (let index = 0; index < svg.attributes.length; index += 1) {
				const attribute = svg.attributes.item(index);
				if (attribute === null) continue;
				attributes.push({
					name: attribute.name,
					namespace: attribute.namespaceURI,
					value: attribute.value
				});
			}
			return {
				attributes,
				innerHTML: svg.innerHTML
			};
		}
		function snapshotsEqual(left, right) {
			if (left.innerHTML !== right.innerHTML || left.attributes.length !== right.attributes.length) return false;
			for (let index = 0; index < left.attributes.length; index += 1) {
				const a = left.attributes[index];
				const b = right.attributes[index];
				if (a.name !== b.name || a.namespace !== b.namespace || a.value !== b.value) return false;
			}
			return true;
		}
		function restoreSvg(svg, original) {
			const failures = [];
			const current = [];
			try {
				for (let index = 0; index < svg.attributes.length; index += 1) {
					const attribute = svg.attributes.item(index);
					if (attribute !== null) current.push({
						name: attribute.name,
						namespace: attribute.namespaceURI,
						value: attribute.value
					});
				}
			} catch (error) {
				failures.push(error);
			}
			for (const attribute of current) try {
				if (attribute.namespace === null) svg.removeAttribute(attribute.name);
				else svg.removeAttributeNS(attribute.namespace, attribute.name);
			} catch (error) {
				failures.push(error);
			}
			for (const attribute of original.attributes) try {
				if (attribute.namespace === null) svg.setAttribute(attribute.name, attribute.value);
				else svg.setAttributeNS(attribute.namespace, attribute.name, attribute.value);
			} catch (error) {
				failures.push(error);
			}
			try {
				svg.innerHTML = original.innerHTML;
			} catch (error) {
				failures.push(error);
			}
			throwFailures(failures, "navigation icon restore failed");
		}
		function writeIcon(svg, marker) {
			const failures = [];
			try {
				svg.setAttribute(ICON_MARK, "globe");
			} catch (error) {
				failures.push(error);
			}
			try {
				svg.setAttribute(OWNER_MARK, marker);
			} catch (error) {
				failures.push(error);
			}
			try {
				svg.setAttribute("viewBox", "0 0 14 14");
			} catch (error) {
				failures.push(error);
			}
			try {
				svg.setAttribute("fill", "none");
			} catch (error) {
				failures.push(error);
			}
			try {
				svg.innerHTML = NAV;
			} catch (error) {
				failures.push(error);
			}
			throwFailures(failures, "navigation icon patch failed");
			return snapshotSvg(svg);
		}
		function ownerMarker(svg) {
			return svg.getAttribute(OWNER_MARK) ?? void 0;
		}
		function latestActive(state) {
			for (let index = state.records.length - 1; index >= 0; index -= 1) {
				const record = state.records[index];
				if (record.active) return record;
			}
		}
		function latestInstallRecord(installation, svg) {
			let latest;
			for (const record of installation.records) if (record.svg === svg && record.active) latest = record;
			return latest;
		}
		function sameTarget(record) {
			return record.button.isConnected && record.svg.isConnected && record.button.querySelector("svg") === record.svg;
		}
		function pruneState(registry, svg, state) {
			state.records = state.records.filter((record) => record.active);
			if (state.records.length === 0) registry.states.delete(svg);
		}
		function rootRecord(record) {
			let root = record;
			while (root.previous !== void 0) root = root.previous;
			return root;
		}
		function restorePrunedRecord(record) {
			restoreSvg(record.svg, rootRecord(record).original);
		}
		function pruneDetachedRecords(registry, installation, failures) {
			for (const record of installation.records) {
				if (sameTarget(record)) continue;
				const state = registry.states.get(record.svg);
				if (state !== void 0 && latestActive(state) === record && ownerMarker(record.svg) === record.marker) try {
					restorePrunedRecord(record);
				} catch (error) {
					flattenFailure(failures, error);
				}
				record.active = false;
				installation.records.delete(record);
				if (state !== void 0) pruneState(registry, record.svg, state);
			}
		}
		function rollbackNewRecord(registry, record, setupError) {
			record.active = false;
			const state = registry.states.get(record.svg);
			if (state !== void 0) pruneState(registry, record.svg, state);
			const failures = [];
			if (sameTarget(record)) try {
				restoreSvg(record.svg, record.original);
			} catch (error) {
				flattenFailure(failures, error);
			}
			if (failures.length === 0) throw setupError;
			throw new AggregateError([setupError, ...failures], "navigation icon setup rollback failed");
		}
		function patchSvg(registry, installation, button, svg, force) {
			const current = snapshotSvg(svg);
			const state = registry.states.get(svg) ?? { records: [] };
			registry.states.set(svg, state);
			const top = latestActive(state);
			const own = latestInstallRecord(installation, svg);
			if (!force && top !== void 0 && top.marker !== installation.marker) return;
			if (own !== void 0 && own === top) {
				if (snapshotsEqual(current, own.owned)) return;
				own.owned = writeIcon(svg, installation.marker);
				return;
			}
			if (own !== void 0) {
				own.active = false;
				state.records = state.records.filter((record) => record.active);
			}
			const record = {
				marker: installation.marker,
				button,
				svg,
				original: current,
				owned: current,
				previous: top,
				active: true
			};
			state.records.push(record);
			installation.records.add(record);
			try {
				record.owned = writeIcon(svg, installation.marker);
			} catch (error) {
				rollbackNewRecord(registry, record, error);
			}
		}
		function patchNav(registry, installation, force) {
			if (typeof document === "undefined") return;
			const failures = [];
			pruneDetachedRecords(registry, installation, failures);
			const buttons = document.querySelectorAll("nav button");
			for (let index = 0; index < buttons.length; index += 1) {
				const button = buttons[index];
				const spans = button.querySelectorAll("span");
				let label;
				for (let spanIndex = 0; spanIndex < spans.length; spanIndex += 1) {
					const span = spans[spanIndex];
					if (LABELS.has(span.textContent?.trim() ?? "")) {
						label = span;
						break;
					}
				}
				if (label === void 0) continue;
				const svg = button.querySelector("svg");
				if (svg === null) continue;
				try {
					patchSvg(registry, installation, button, svg, force);
				} catch (error) {
					flattenFailure(failures, error);
				}
			}
			throwFailures(failures, "navigation icon patch failed");
		}
		function mutationObserverConstructor() {
			if (typeof document === "undefined") return void 0;
			const view = document.defaultView;
			if (view !== null && view !== void 0) {
				const candidate = view.MutationObserver;
				return typeof candidate === "function" ? candidate : void 0;
			}
			const candidate = globalThis.MutationObserver;
			return typeof candidate === "function" ? candidate : void 0;
		}
		function frameFunctions() {
			if (typeof document === "undefined") return {
				request: void 0,
				cancel: void 0
			};
			const view = document.defaultView;
			if (view !== null && view !== void 0) {
				const request = view.requestAnimationFrame;
				const cancel = view.cancelAnimationFrame;
				if (typeof request === "function" && typeof cancel === "function") return {
					request: request.bind(view),
					cancel: cancel.bind(view)
				};
				return {
					request: void 0,
					cancel: void 0
				};
			}
			const globalObject = globalThis;
			const request = globalObject.requestAnimationFrame;
			const cancel = globalObject.cancelAnimationFrame;
			if (typeof request === "function" && typeof cancel === "function") return {
				request: request.bind(globalThis),
				cancel: cancel.bind(globalThis)
			};
			return {
				request: void 0,
				cancel: void 0
			};
		}
		function restoreRecord(registry, record) {
			const state = registry.states.get(record.svg);
			if (state === void 0) {
				record.active = false;
				return;
			}
			const top = latestActive(state);
			record.active = false;
			if (top === record && !sameTarget(record) && ownerMarker(record.svg) === record.marker) {
				try {
					restorePrunedRecord(record);
				} finally {
					pruneState(registry, record.svg, state);
				}
				return;
			}
			pruneState(registry, record.svg, state);
			if (top !== record || !sameTarget(record) || ownerMarker(record.svg) !== record.marker) return;
			let child = record;
			let previous = record.previous;
			while (previous !== void 0 && !previous.active) {
				child = previous;
				previous = previous.previous;
			}
			if (previous !== void 0 && previous.active) {
				restoreSvg(record.svg, child.original);
				return;
			}
			restoreSvg(record.svg, rootRecord(child).original);
		}
		function disposeInstallation(registry, installation) {
			if (installation.disposed) return;
			installation.disposed = true;
			const failures = [];
			const observer = installation.observer;
			installation.observer = void 0;
			if (observer !== void 0) try {
				observer.disconnect();
			} catch (error) {
				flattenFailure(failures, error);
			}
			const frame = installation.frame;
			installation.frame = void 0;
			installation.scheduled = false;
			if (frame !== void 0 && installation.cancelFrame !== void 0) try {
				installation.cancelFrame(frame);
			} catch (error) {
				flattenFailure(failures, error);
			}
			for (const record of installation.records) try {
				restoreRecord(registry, record);
			} catch (error) {
				flattenFailure(failures, error);
			}
			installation.records.clear();
			throwFailures(failures, "navigation icon cleanup failed");
		}
		/**
		* Install the navigation icon adapter.
		* @returns An idempotent disposer for the observer, frame, and owned SVG state.
		*/
		function installProvidersNavIcon() {
			if (typeof document === "undefined" || document.body === null) return () => {};
			const registry = sharedRegistry();
			const installation = {
				marker: newOwnerMarker(registry),
				records: /* @__PURE__ */ new Set(),
				observer: void 0,
				requestFrame: void 0,
				cancelFrame: void 0,
				frame: void 0,
				scheduled: false,
				disposed: false
			};
			const frame = frameFunctions();
			installation.requestFrame = frame.request;
			installation.cancelFrame = frame.cancel;
			const flush = () => {
				installation.frame = void 0;
				installation.scheduled = false;
				if (installation.disposed) return;
				patchNav(registry, installation, false);
			};
			const schedule = () => {
				if (installation.disposed || installation.scheduled || installation.requestFrame === void 0) return;
				installation.scheduled = true;
				try {
					const handle = installation.requestFrame(flush);
					if (installation.scheduled) installation.frame = handle;
				} catch (error) {
					installation.scheduled = false;
					installation.frame = void 0;
					throw error;
				}
			};
			try {
				const observerConstructor = mutationObserverConstructor();
				if (observerConstructor !== void 0 && installation.requestFrame !== void 0 && installation.cancelFrame !== void 0) {
					const observer = new observerConstructor(schedule);
					installation.observer = observer;
					observer.observe(document.body, {
						childList: true,
						subtree: true
					});
				}
				patchNav(registry, installation, true);
			} catch (setupError) {
				const failures = [];
				try {
					disposeInstallation(registry, installation);
				} catch (cleanupError) {
					flattenFailure(failures, cleanupError);
				}
				if (failures.length === 0) throw setupError;
				throw new AggregateError([setupError, ...failures], "navigation icon setup failed");
			}
			return () => {
				disposeInstallation(registry, installation);
			};
		}
		//#endregion
		//#region lib/types/client/provider-section.js
		/** Locale copy: empty state names all six providers. */
		const copy = {
			zh: {
				nav: "LLM 供应商",
				title: "LLM 供应商",
				subtitle: "连接账号，并选择哪些模型出现在对话的模型列表里。拖动卡片会改变对话模型列表里的供应商顺序。",
				empty: "安装 Cursor、Grok、Codex、Ollama Cloud、CommandCode 或 OpenCode Go 后，在这里连接账号并选择模型。",
				drag: "拖动排序",
				sort: "Provider 排序",
				done: "完成排序",
				moveUp: "上移",
				moveDown: "下移"
			},
			en: {
				nav: "LLM Providers",
				title: "LLM Providers",
				subtitle: "Connect accounts and choose which models appear in the chat picker. Drag cards to change provider order in the picker.",
				empty: "Install Cursor, Grok, Codex, Ollama Cloud, CommandCode, or OpenCode Go to connect an account and pick models here.",
				drag: "Reorder",
				sort: "Sort providers",
				done: "Done",
				moveUp: "Move up",
				moveDown: "Move down"
			}
		};
		//#endregion
		//#region lib/types/client/provider-marks.js
		function Svg(props) {
			return (0, react_jsx_runtime.jsx)("svg", {
				className: "pu-logo",
				viewBox: props.viewBox,
				preserveAspectRatio: "xMidYMid meet",
				"aria-hidden": true,
				children: props.children
			});
		}
		function ProviderMark(props) {
			switch (props.providerKey.startsWith("llm-") ? props.providerKey : props.providerKey === "opencode" ? "llm-opencode-go" : "llm-" + props.providerKey) {
				case "llm-cursor": return (0, react_jsx_runtime.jsx)(Svg, {
					viewBox: "0 0 24 24",
					children: (0, react_jsx_runtime.jsx)("path", {
						fill: "currentColor",
						d: "M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23"
					})
				});
				case "llm-codex": return (0, react_jsx_runtime.jsx)(Svg, {
					viewBox: "0 0 24 24",
					children: (0, react_jsx_runtime.jsx)("path", {
						fill: "currentColor",
						d: "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
					})
				});
				case "llm-ollama": return (0, react_jsx_runtime.jsx)(Svg, {
					viewBox: "0 0 24 24",
					children: (0, react_jsx_runtime.jsx)("path", {
						fill: "currentColor",
						d: "M16.361 10.26a.894.894 0 0 0-.558.47l-.072.148.001.207c0 .193.004.217.059.353.076.193.152.312.291.448.24.238.51.3.872.205a.86.86 0 0 0 .517-.436.752.752 0 0 0 .08-.498c-.064-.453-.33-.782-.724-.897a1.06 1.06 0 0 0-.466 0zm-9.203.005c-.305.096-.533.32-.65.639a1.187 1.187 0 0 0-.06.52c.057.309.31.59.598.667.362.095.632.033.872-.205.14-.136.215-.255.291-.448.055-.136.059-.16.059-.353l.001-.207-.072-.148a.894.894 0 0 0-.565-.472 1.02 1.02 0 0 0-.474.007Zm4.184 2c-.131.071-.223.25-.195.383.031.143.157.288.353.407.105.063.112.072.117.136.004.038-.01.146-.029.243-.02.094-.036.194-.036.222.002.074.07.195.143.253.064.052.076.054.255.059.164.005.198.001.264-.03.169-.082.212-.234.15-.525-.052-.243-.042-.28.087-.355.137-.08.281-.219.324-.314a.365.365 0 0 0-.175-.48.394.394 0 0 0-.181-.033c-.126 0-.207.03-.355.124l-.085.053-.053-.032c-.219-.13-.259-.145-.391-.143a.396.396 0 0 0-.193.032zm.39-2.195c-.373.036-.475.05-.654.086-.291.06-.68.195-.951.328-.94.46-1.589 1.226-1.787 2.114-.04.176-.045.234-.045.53 0 .294.005.357.043.524.264 1.16 1.332 2.017 2.714 2.173.3.033 1.596.033 1.896 0 1.11-.125 2.064-.727 2.493-1.571.114-.226.169-.372.22-.602.039-.167.044-.23.044-.523 0-.297-.005-.355-.045-.531-.288-1.29-1.539-2.304-3.072-2.497a6.873 6.873 0 0 0-.855-.031zm.645.937a3.283 3.283 0 0 1 1.44.514c.223.148.537.458.671.662.166.251.26.508.303.82.02.143.01.251-.043.482-.08.345-.332.705-.672.957a3.115 3.115 0 0 1-.689.348c-.382.122-.632.144-1.525.138-.582-.006-.686-.01-.853-.042-.57-.107-1.022-.334-1.35-.68-.264-.28-.385-.535-.45-.946-.03-.192.025-.509.137-.776.136-.326.488-.73.836-.963.403-.269.934-.46 1.422-.512.187-.02.586-.02.773-.002zm-5.503-11a1.653 1.653 0 0 0-.683.298C5.617.74 5.173 1.666 4.985 2.819c-.07.436-.119 1.04-.119 1.503 0 .544.064 1.24.155 1.721.02.107.031.202.023.208a8.12 8.12 0 0 1-.187.152 5.324 5.324 0 0 0-.949 1.02 5.49 5.49 0 0 0-.94 2.339 6.625 6.625 0 0 0-.023 1.357c.091.78.325 1.438.727 2.04l.13.195-.037.064c-.269.452-.498 1.105-.605 1.732-.084.496-.095.629-.095 1.294 0 .67.009.803.088 1.266.095.555.288 1.143.503 1.534.071.128.243.393.264.407.007.003-.014.067-.046.141a7.405 7.405 0 0 0-.548 1.873c-.062.417-.071.552-.071.991 0 .56.031.832.148 1.279L3.42 24h1.478l-.05-.091c-.297-.552-.325-1.575-.068-2.597.117-.472.25-.819.498-1.296l.148-.29v-.177c0-.165-.003-.184-.057-.293a.915.915 0 0 0-.194-.25 1.74 1.74 0 0 1-.385-.543c-.424-.92-.506-2.286-.208-3.451.124-.486.329-.918.544-1.154a.787.787 0 0 0 .223-.531c0-.195-.07-.355-.224-.522a3.136 3.136 0 0 1-.817-1.729c-.14-.96.114-2.005.69-2.834.563-.814 1.353-1.336 2.237-1.475.199-.033.57-.028.776.01.226.04.367.028.512-.041.179-.085.268-.19.374-.431.093-.215.165-.333.36-.576.234-.29.46-.489.822-.729.413-.27.884-.467 1.352-.561.17-.035.25-.04.569-.04.319 0 .398.005.569.04a4.07 4.07 0 0 1 1.914.997c.117.109.398.457.488.602.034.057.095.177.132.267.105.241.195.346.374.43.14.068.286.082.503.045.343-.058.607-.053.943.016 1.144.23 2.14 1.173 2.581 2.437.385 1.108.276 2.267-.296 3.153-.097.15-.193.27-.333.419-.301.322-.301.722-.001 1.053.493.539.801 1.866.708 3.036-.062.772-.26 1.463-.533 1.854a2.096 2.096 0 0 1-.224.258.916.916 0 0 0-.194.25c-.054.109-.057.128-.057.293v.178l.148.29c.248.476.38.823.498 1.295.253 1.008.231 2.01-.059 2.581a.845.845 0 0 0-.044.098c0 .006.329.009.732.009h.73l.02-.074.036-.134c.019-.076.057-.3.088-.516.029-.217.029-1.016 0-1.258-.11-.875-.295-1.57-.597-2.226-.032-.074-.053-.138-.046-.141.008-.005.057-.074.108-.152.376-.569.607-1.284.724-2.228.031-.26.031-1.378 0-1.628-.083-.645-.182-1.082-.348-1.525a6.083 6.083 0 0 0-.329-.7l-.038-.064.131-.194c.402-.604.636-1.262.727-2.04a6.625 6.625 0 0 0-.024-1.358 5.512 5.512 0 0 0-.939-2.339 5.325 5.325 0 0 0-.95-1.02 8.097 8.097 0 0 1-.186-.152.692.692 0 0 1 .023-.208c.208-1.087.201-2.443-.017-3.503-.19-.924-.535-1.658-.98-2.082-.354-.338-.716-.482-1.15-.455-.996.059-1.8 1.205-2.116 3.01a6.805 6.805 0 0 0-.097.726c0 .036-.007.066-.015.066a.96.96 0 0 1-.149-.078A4.857 4.857 0 0 0 12 3.03c-.832 0-1.687.243-2.456.698a.958.958 0 0 1-.148.078c-.008 0-.015-.03-.015-.066a6.71 6.71 0 0 0-.097-.725C8.997 1.392 8.337.319 7.46.048a2.096 2.096 0 0 0-.585-.041Zm.293 1.402c.248.197.523.759.682 1.388.03.113.06.244.069.292.007.047.026.152.041.233.067.365.098.76.102 1.24l.002.475-.12.175-.118.178h-.278c-.324 0-.646.041-.954.124l-.238.06c-.033.007-.038-.003-.057-.144a8.438 8.438 0 0 1 .016-2.323c.124-.788.413-1.501.696-1.711.067-.05.079-.049.157.013zm9.825-.012c.17.126.358.46.498.888.28.854.36 2.028.212 3.145-.019.14-.024.151-.057.144l-.238-.06a3.693 3.693 0 0 0-.954-.124h-.278l-.119-.178-.119-.175.002-.474c.004-.669.066-1.19.214-1.772.157-.623.434-1.185.68-1.382.078-.062.09-.063.159-.012z"
					})
				});
				case "llm-grok": return (0, react_jsx_runtime.jsxs)(Svg, {
					viewBox: "0 0 562 545",
					children: [(0, react_jsx_runtime.jsx)("path", {
						fill: "currentColor",
						d: "M411 105C376 80 334 66 289 66C173 66 79 160 79 276C79 306 85 329 95 353C117 407 87 451 0 542L178 383C150 355 134 318 134 277C134 192 203 123 289 123C310 123 330 127 348 134Z"
					}), (0, react_jsx_runtime.jsx)("path", {
						fill: "currentColor",
						d: "M167 448L230 418C248 426 268 430 289 430C374 430 443 361 443 277C443 256 439 234 431 214C427 206 416 204 407 210L217 349L562 2C480 103 475 144 494 229C518 333 468 422 391 459C319 494 235 498 167 448Z"
					})]
				});
				case "llm-commandcode": return (0, react_jsx_runtime.jsx)(Svg, {
					viewBox: "0 0 137 137",
					children: (0, react_jsx_runtime.jsx)("path", {
						fill: "currentColor",
						d: "m93.6604 26.1784c-8.982 0-16.2887 7.3067-16.2887 16.2888v6.9809h-18.6158v-6.9809c0-8.9821-7.3067-16.2888-16.2887-16.2888-8.9821 0-16.2888 7.3067-16.2888 16.2888s7.3067 16.2887 16.2888 16.2887h6.9809v18.6158h-6.9809c-8.9821 0-16.2888 7.3067-16.2888 16.2888 0 8.9825 7.3067 16.2885 16.2888 16.2885 8.982 0 16.2887-7.306 16.2887-16.2885v-6.981h18.6158v6.981c0 8.9825 7.3067 16.2885 16.2887 16.2885 8.9826 0 16.2886-7.306 16.2886-16.2885 0-8.9821-7.306-16.2888-16.2886-16.2888h-6.9809v-18.6158h6.9809c8.9826 0 16.2886-7.3066 16.2886-16.2887s-7.306-16.2888-16.2886-16.2888z"
					})
				});
				case "llm-opencode-go": return (0, react_jsx_runtime.jsxs)(Svg, {
					viewBox: "128 96 256 320",
					children: [(0, react_jsx_runtime.jsx)("path", {
						fill: "currentColor",
						opacity: ".35",
						d: "M320 224V352H192V224H320Z"
					}), (0, react_jsx_runtime.jsx)("path", {
						fill: "currentColor",
						fillRule: "evenodd",
						d: "M384 416H128V96H384V416ZM320 160H192V352H320V160Z"
					})]
				});
				default: return (0, react_jsx_runtime.jsx)("span", {
					className: "pu-icon",
					children: props.fallback
				});
			}
		}
		//#endregion
		//#region lib/types/usage-readers.js
		/** Bundle-safe quota reader factories: pure decode plus RPC reads. No ModuleLoader wrapper, no store. */
		/** Plain-object guard shared by the reader factories and the sidebar cache validator. */
		function recordUsageValue(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value) ? value : void 0;
		}
		/** Non-empty string guard shared by the reader factories and the sidebar cache validator. */
		function nonEmptyString(value) {
			return typeof value === "string" && value.length > 0;
		}
		function finiteNumber(value) {
			return typeof value === "number" && Number.isFinite(value);
		}
		/** Non-negative finite number guard shared by the reader factories and the sidebar cache validator. */
		function nonNegativeNumber(value) {
			return finiteNumber(value) && value >= 0;
		}
		const PERIOD_RANK = {
			M: 6,
			W: 5,
			D: 4,
			CURS: 3,
			S: 1,
			A: 0,
			L: 0,
			CR: -1
		};
		function periodRank(shortLabelValue) {
			const normalized = shortLabelValue.toUpperCase();
			return PERIOD_RANK[normalized] ?? (/^\d+H$/.test(normalized) ? 2 : 0);
		}
		/** Headline window: longest percentage period, else the first text-only window. */
		function pickPrimaryWindow(windows) {
			let best;
			for (const quotaWindow of windows) {
				if (quotaWindow.remainingPercent === void 0) continue;
				if (best === void 0 || periodRank(quotaWindow.shortLabel) > periodRank(best.shortLabel)) best = quotaWindow;
			}
			return best ?? windows[0];
		}
		//#endregion
		//#region lib/types/client/usage.js
		/** Secret-free subscription usage readers and an abortable sidebar store. */
		const USAGE_POLL_MS = 9e5;
		const USAGE_READ_TIMEOUT_MS = 2e4;
		const USAGE_CACHE_KEY = "dsh-llm-providers-ui:usage-cache";
		const USAGE_MAX_IN_FLIGHT = 3;
		function hasUsageData(summary) {
			return summary !== void 0 && summary.windows.length > 0 && (summary.status === "ready" || summary.status === "stale");
		}
		function cachedSummary(value) {
			const item = recordUsageValue(value);
			if (item === void 0 || !nonEmptyString(item.providerKey) || !nonEmptyString(item.name)) return void 0;
			const status = item.status;
			if (status !== "ready" && status !== "stale") return void 0;
			if (!Array.isArray(item.windows) || item.windows.length === 0) return void 0;
			const windows = [];
			for (const windowValue of item.windows) {
				const quotaWindow = recordUsageValue(windowValue);
				if (quotaWindow === void 0 || !nonEmptyString(quotaWindow.id) || !nonEmptyString(quotaWindow.label) || !nonEmptyString(quotaWindow.shortLabel) || !nonEmptyString(quotaWindow.valueText)) return void 0;
				if (quotaWindow.remainingPercent !== void 0 && (!nonNegativeNumber(quotaWindow.remainingPercent) || quotaWindow.remainingPercent > 100)) return void 0;
				if (quotaWindow.resetsAt !== void 0 && !nonEmptyString(quotaWindow.resetsAt)) return void 0;
				windows.push({
					id: quotaWindow.id,
					label: quotaWindow.label,
					shortLabel: quotaWindow.shortLabel,
					valueText: quotaWindow.valueText,
					...quotaWindow.remainingPercent === void 0 ? {} : { remainingPercent: quotaWindow.remainingPercent },
					...quotaWindow.resetsAt === void 0 ? {} : { resetsAt: quotaWindow.resetsAt }
				});
			}
			return {
				providerKey: item.providerKey,
				name: item.name,
				status: "ready",
				windows,
				...nonEmptyString(item.fetchedAt) ? { fetchedAt: item.fetchedAt } : {}
			};
		}
		let memoryUsageCache = /* @__PURE__ */ new Map();
		function storageGet() {
			try {
				return globalThis.localStorage?.getItem(USAGE_CACHE_KEY) ?? globalThis.sessionStorage?.getItem(USAGE_CACHE_KEY) ?? null;
			} catch {
				return null;
			}
		}
		function storageSet(value) {
			try {
				globalThis.localStorage?.setItem(USAGE_CACHE_KEY, value);
			} catch {}
			try {
				globalThis.sessionStorage?.setItem(USAGE_CACHE_KEY, value);
			} catch {}
		}
		function parseUsageCache(raw) {
			const cached = /* @__PURE__ */ new Map();
			if (raw === null) return cached;
			try {
				const parsed = JSON.parse(raw);
				if (!Array.isArray(parsed)) return cached;
				for (const value of parsed) {
					const item = cachedSummary(value);
					if (item !== void 0) cached.set(item.providerKey, item);
				}
			} catch {}
			return cached;
		}
		function readUsageCache() {
			const fromStorage = parseUsageCache(storageGet());
			if (fromStorage.size > 0) {
				memoryUsageCache = new Map(fromStorage);
				return fromStorage;
			}
			return new Map(memoryUsageCache);
		}
		/** Remove keys from the memory and persisted quota caches without touching other providers. */
		function dropPersistedUsageKeys(keys) {
			const drop = new Set(keys);
			for (const key of drop) memoryUsageCache.delete(key);
			const raw = storageGet();
			if (raw === null) return;
			let parsed;
			try {
				parsed = JSON.parse(raw);
			} catch {
				return;
			}
			if (!Array.isArray(parsed)) return;
			const kept = parsed.filter((value) => {
				const item = recordUsageValue(value);
				return item === void 0 || !nonEmptyString(item.providerKey) || !drop.has(item.providerKey);
			});
			if (kept.length === parsed.length) return;
			storageSet(JSON.stringify(kept));
		}
		function writeUsageCache(current) {
			const merged = parseUsageCache(storageGet());
			for (const [key, item] of memoryUsageCache) merged.set(key, item);
			for (const item of current.values()) if (hasUsageData(item)) merged.set(item.providerKey, {
				providerKey: item.providerKey,
				name: item.name,
				status: "ready",
				windows: item.windows,
				...item.fetchedAt === void 0 ? {} : { fetchedAt: item.fetchedAt }
			});
			if (merged.size === 0) return;
			memoryUsageCache = merged;
			storageSet(JSON.stringify([...merged.values()]));
		}
		function keepUsage(old, next) {
			if (next.status === "logged-out") return next;
			if (!hasUsageData(next) && hasUsageData(old)) return {
				...old,
				status: "stale"
			};
			return next;
		}
		function isFresh(summary, now) {
			if (!hasUsageData(summary) || summary.fetchedAt === void 0) return false;
			const fetched = Date.parse(summary.fetchedAt);
			return Number.isFinite(fetched) && now - fetched < 3e5;
		}
		/** External store: one request per visible Provider, stale data survives failures, and dispose aborts every request. */
		function createProviderUsageStore(rpc, readerForKey) {
			let snapshot = {
				providers: [],
				hiddenKeys: [],
				refreshing: false
			};
			let configuredKeys = [];
			const current = readUsageCache();
			const active = /* @__PURE__ */ new Map();
			const queued = [];
			const listeners = /* @__PURE__ */ new Set();
			let disposed = false;
			let refreshGeneration = 0;
			let pollTimer;
			const notify = () => {
				for (const listener of listeners) listener();
			};
			const pending = (key) => active.has(key) || queued.some((item) => item.key === key);
			const publish = () => {
				snapshot = {
					providers: configuredKeys.map((key) => {
						const item = current.get(key);
						if (item === void 0) return void 0;
						return pending(key) ? {
							...item,
							refreshing: true
						} : item;
					}).filter((item) => item !== void 0),
					hiddenKeys: [...snapshot.hiddenKeys],
					refreshing: active.size > 0 || queued.length > 0
				};
				writeUsageCache(current);
				notify();
			};
			const pump = () => {
				while (!disposed && active.size < USAGE_MAX_IN_FLIGHT && queued.length > 0) {
					const item = queued.shift();
					if (item !== void 0) startRead(item.key, item.refresh);
				}
			};
			const enqueue = (key, refresh) => {
				if (disposed || active.has(key) || queued.some((item) => item.key === key)) return;
				queued.push({
					key,
					refresh
				});
				pump();
			};
			const startRead = (key, refresh) => {
				const reader = readerForKey(key);
				if (reader === void 0 || active.has(key) || disposed) return;
				if (current.get(key) === void 0) {
					current.set(key, {
						providerKey: key,
						name: reader.name,
						status: "loading",
						windows: []
					});
					publish();
				}
				const controller = new AbortController();
				const failOpen = () => {
					if (disposed || active.get(key) !== controller) return;
					const old = current.get(key);
					current.set(key, keepUsage(old, {
						providerKey: key,
						name: reader.name,
						status: "error",
						windows: []
					}));
					active.delete(key);
					publish();
					pump();
				};
				const timer = setTimeout(() => {
					controller.abort("timeout");
					failOpen();
				}, USAGE_READ_TIMEOUT_MS);
				active.set(key, controller);
				const generation = refreshGeneration;
				reader.read(rpc, refresh, controller.signal).then((result) => {
					if (disposed || generation !== refreshGeneration || controller.signal.aborted) return;
					const old = current.get(key);
					const next = result.status === "ready" ? {
						providerKey: key,
						name: reader.name,
						status: "ready",
						fetchedAt: result.fetchedAt,
						windows: result.windows
					} : {
						providerKey: key,
						name: reader.name,
						status: result.status,
						windows: []
					};
					current.set(key, keepUsage(old, next));
				}).catch(() => {
					if (disposed || generation !== refreshGeneration || controller.signal.aborted) return;
					failOpen();
				}).finally(() => {
					clearTimeout(timer);
					if (active.get(key) === controller) active.delete(key);
					if (!disposed) {
						publish();
						pump();
					}
				});
			};
			const visibleKeys = (keys) => {
				return (keys === void 0 ? configuredKeys : keys.filter((key) => configuredKeys.includes(key))).filter((key) => !snapshot.hiddenKeys.includes(key));
			};
			const sync = (force = false, keys) => {
				const now = Date.now();
				for (const key of visibleKeys(keys)) if (force || !isFresh(current.get(key), now)) enqueue(key, force);
				publish();
			};
			const startPoll = () => {
				if (pollTimer !== void 0) return;
				pollTimer = setInterval(() => {
					if (!disposed) sync(false);
				}, USAGE_POLL_MS);
			};
			return {
				getSnapshot: () => snapshot,
				subscribe: (listener) => {
					listeners.add(listener);
					return () => {
						listeners.delete(listener);
					};
				},
				configure: (config) => {
					const ordered = applySavedOrder(config.registeredKeys, config.savedOrder).filter((key) => readerForKey(key) !== void 0);
					configuredKeys = [...new Set(ordered)];
					snapshot = {
						...snapshot,
						hiddenKeys: [...new Set(config.hiddenKeys)]
					};
					for (const [key, controller] of active) if (!configuredKeys.includes(key) || snapshot.hiddenKeys.includes(key)) {
						controller.abort();
						active.delete(key);
					}
					for (let index = queued.length - 1; index >= 0; index -= 1) {
						const item = queued[index];
						if (item !== void 0 && (!configuredKeys.includes(item.key) || snapshot.hiddenKeys.includes(item.key))) queued.splice(index, 1);
					}
					for (const key of [...current.keys()]) if (!configuredKeys.includes(key)) current.delete(key);
					for (const key of configuredKeys) if (!current.has(key)) {
						const reader = readerForKey(key);
						if (reader !== void 0) current.set(key, {
							providerKey: key,
							name: reader.name,
							status: "loading",
							windows: []
						});
					}
					sync(false);
					startPoll();
				},
				refresh: (keys) => {
					refreshGeneration += 1;
					const targets = visibleKeys(keys);
					for (const [key, controller] of active) if (targets.includes(key)) {
						controller.abort();
						active.delete(key);
					}
					for (let index = queued.length - 1; index >= 0; index -= 1) {
						const item = queued[index];
						if (item !== void 0 && targets.includes(item.key)) queued.splice(index, 1);
					}
					sync(true, keys);
				},
				invalidate: (keys) => {
					const targets = keys === void 0 ? [...configuredKeys] : keys.filter((key) => configuredKeys.includes(key));
					if (targets.length === 0) return;
					refreshGeneration += 1;
					for (const [key, controller] of active) if (targets.includes(key)) {
						controller.abort();
						active.delete(key);
					}
					for (let index = queued.length - 1; index >= 0; index -= 1) {
						const item = queued[index];
						if (item !== void 0 && targets.includes(item.key)) queued.splice(index, 1);
					}
					for (const key of targets) current.delete(key);
					dropPersistedUsageKeys(targets);
					for (const key of targets) {
						const reader = readerForKey(key);
						if (reader !== void 0) current.set(key, {
							providerKey: key,
							name: reader.name,
							status: "loading",
							windows: []
						});
					}
					publish();
					sync(true, keys);
				},
				dispose: () => {
					disposed = true;
					if (pollTimer !== void 0) clearInterval(pollTimer);
					pollTimer = void 0;
					for (const controller of active.values()) controller.abort();
					active.clear();
					listeners.clear();
					current.clear();
					configuredKeys = [];
				}
			};
		}
		//#endregion
		//#region lib/types/client/ProviderUsagePanel.js
		/** Sidebar Provider Usage panel, prototype B (two-column minis). Controlled and UI-only: no RPC, no persistence. */
		function windowValueText(quotaWindow) {
			return quotaWindow.remainingPercent === void 0 ? quotaWindow.valueText : String(Math.round(quotaWindow.remainingPercent)) + "%";
		}
		function usageTone(remainingPercent) {
			if (remainingPercent !== void 0 && remainingPercent <= 20) return "low";
			if (remainingPercent !== void 0 && remainingPercent <= 40) return "warn";
		}
		function providerInitial(name) {
			return name.trim().charAt(0);
		}
		function FilterRow(props) {
			return (0, react_jsx_runtime.jsxs)("label", {
				className: "pu-filter-item",
				children: [
					(0, react_jsx_runtime.jsx)("input", {
						type: "checkbox",
						"aria-label": "在侧栏显示 " + props.summary.name,
						checked: !props.hidden,
						onChange: (event) => {
							props.onToggle(event.target.checked);
						}
					}),
					(0, react_jsx_runtime.jsx)("span", {
						className: "pu-mark",
						children: (0, react_jsx_runtime.jsx)(ProviderMark, {
							providerKey: props.summary.providerKey,
							fallback: providerInitial(props.summary.name)
						})
					}),
					(0, react_jsx_runtime.jsx)("span", {
						className: "pu-filter-name",
						children: props.summary.name
					})
				]
			});
		}
		const STATUS_TEXT = {
			loading: "加载中…",
			ready: "暂无额度数据",
			"logged-out": "未登录",
			unsupported: "不支持查询",
			stale: "额度已过期",
			error: "加载失败"
		};
		const panelCss = [
			"[data-provider-usage-panel]{display:flex;flex-direction:column;position:relative;width:100%;min-width:0;padding:6px 6px 8px;background:transparent}",
			"[data-provider-usage-panel] .pu-head{display:flex;align-items:center;height:32px;padding:0 2px 7px}",
			"[data-provider-usage-panel] .pu-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:550;letter-spacing:.01em;color:color-mix(in srgb,var(--dsw-alias-label-primary) 62%,var(--dsw-alias-label-secondary))}",
			"[data-provider-usage-panel] .pu-actions{display:flex;gap:2px;margin-left:auto}",
			"[data-provider-usage-panel] .pu-mini-spin{display:inline-block;width:9px;height:9px;border:1.5px solid currentColor;border-right-color:transparent;border-radius:50%;vertical-align:middle;animation:pu-spin .55s linear infinite}",
			"[data-provider-usage-panel] .pu-row-refresh{position:absolute;top:0;right:0;width:24px;height:24px}",
			"@media (hover:hover) and (pointer:fine){[data-provider-usage-panel] .pu-row-refresh{opacity:0;pointer-events:none}[data-provider-usage-panel] .pu-cell:hover .pu-row-refresh,[data-provider-usage-panel] .pu-row-refresh:focus-visible,[data-provider-usage-panel] .pu-row-refresh.pu-spinning{opacity:1;pointer-events:auto}}",
			"[data-provider-usage-panel] .pu-detail-head .pu-icon-btn:last-child{margin-left:auto}",
			"[data-provider-usage-panel] .pu-icon-btn{display:grid;place-items:center;width:25px;height:25px;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}",
			"[data-provider-usage-panel] .pu-icon-btn:hover{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary)}",
			"[data-provider-usage-panel] .pu-icon-btn:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}",
			"[data-provider-usage-panel] .pu-icon-btn svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.7}",
			"[data-provider-usage-panel] .pu-spinning svg{animation:pu-spin .55s ease}",
			"@keyframes pu-spin{to{transform:rotate(360deg)}}",
			"[data-provider-usage-panel] .pu-stage{width:100%;min-width:0;height:132px;overflow:auto;padding:1px;margin:-1px;scrollbar-width:thin}",
			"[data-provider-usage-panel] .pu-stage-open{height:auto;overflow:visible}",
			"[data-provider-usage-panel] .pu-rows{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px}",
			"[data-provider-usage-panel] .pu-cell{position:relative;min-width:0}",
			"[data-provider-usage-panel] .pu-row{box-sizing:border-box;display:flex;align-items:center;gap:8px;width:100%;min-width:0;min-height:40px;padding:5px 22px 5px 8px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:inherit;text-align:left;cursor:pointer;outline:none}",
			"[data-provider-usage-panel] .pu-row:hover{border-color:var(--dsw-alias-label-tertiary)}",
			"[data-provider-usage-panel] .pu-row:focus-visible{box-shadow:0 0 0 1px var(--dsw-alias-border-l2)}",
			"[data-provider-usage-panel] .pu-mark{display:grid;place-items:center;flex:none;width:18px;height:18px;overflow:hidden;opacity:.72}",
			"[data-provider-usage-panel] .pu-logo{display:block;width:18px;height:18px;color:var(--dsw-alias-label-secondary)}",
			"[data-provider-usage-panel] .pu-copy{display:flex;flex-direction:column;gap:0;min-width:0}",
			"[data-provider-usage-panel] .pu-icon{display:grid;place-items:center;flex:none;width:14px;height:14px;border-radius:4px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-module-platform);font-size:8px;font-weight:750}",
			"[data-provider-usage-panel] .pu-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:color-mix(in srgb,var(--dsw-alias-label-primary) 55%,var(--dsw-alias-label-secondary));font-size:10px;font-weight:500;line-height:12px}",
			"[data-provider-usage-panel] .pu-stale{flex:none;margin-left:auto;color:var(--dsw-alias-label-tertiary);font-size:8px}",
			"[data-provider-usage-panel] .pu-primary{color:color-mix(in srgb,var(--dsw-alias-label-primary) 62%,var(--dsw-alias-label-secondary));font-size:12px;font-weight:500;line-height:14px;font-variant-numeric:tabular-nums}",
			"[data-provider-usage-panel] .pu-low .pu-primary,[data-provider-usage-panel] .pu-tip-value.pu-low{color:color-mix(in srgb,#d94848 58%,var(--dsw-alias-label-secondary))}",
			"[data-provider-usage-panel] .pu-warn .pu-primary,[data-provider-usage-panel] .pu-tip-value.pu-warn{color:color-mix(in srgb,#c47b08 58%,var(--dsw-alias-label-secondary))}",
			"[data-provider-usage-panel] .pu-empty-text{color:var(--dsw-alias-label-tertiary);font-weight:550}",
			"[data-provider-usage-panel] .pu-detail{box-sizing:border-box;display:block;width:100%;min-width:0;padding:10px 12px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1)}",
			"[data-provider-usage-panel] .pu-detail-head{display:flex;align-items:center;gap:8px;margin-bottom:4px}",
			"[data-provider-usage-panel] .pu-detail-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:550;color:color-mix(in srgb,var(--dsw-alias-label-primary) 62%,var(--dsw-alias-label-secondary))}",
			"[data-provider-usage-panel] .pu-detail-sub{margin:0 0 4px;color:var(--dsw-alias-label-tertiary);font-size:11px}",
			"[data-provider-usage-panel] .pu-win{display:flex;flex-direction:column;gap:5px;padding:8px 0 2px}",
			"[data-provider-usage-panel] .pu-win + .pu-win{border-top:1px solid var(--dsw-alias-border-l2)}",
			"[data-provider-usage-panel] .pu-win-top{display:flex;align-items:baseline;justify-content:space-between;gap:8px}",
			"[data-provider-usage-panel] .pu-tip-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-size:12px}",
			"[data-provider-usage-panel] .pu-tip-value{font-variant-numeric:tabular-nums;font-weight:500;font-size:12px;color:color-mix(in srgb,var(--dsw-alias-label-primary) 62%,var(--dsw-alias-label-secondary))}",
			"[data-provider-usage-panel] .pu-bar{display:block;width:100%;height:6px;overflow:hidden;border:0;border-radius:99px;background:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,var(--dsw-alias-bg-layer-1));accent-color:color-mix(in srgb,var(--dsw-alias-state-business-primary) 42%,var(--dsw-alias-label-secondary))}",
			"[data-provider-usage-panel] .pu-bar::-webkit-progress-bar{background:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,var(--dsw-alias-bg-layer-1));border-radius:99px}",
			"[data-provider-usage-panel] .pu-bar::-webkit-progress-value{background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 42%,var(--dsw-alias-label-secondary));border-radius:99px}",
			"[data-provider-usage-panel] .pu-bar::-moz-progress-bar{background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 42%,var(--dsw-alias-label-secondary));border-radius:99px}",
			"[data-provider-usage-panel] .pu-bar.pu-warn{accent-color:color-mix(in srgb,#c47b08 48%,var(--dsw-alias-label-secondary))}",
			"[data-provider-usage-panel] .pu-bar.pu-warn::-webkit-progress-value,[data-provider-usage-panel] .pu-bar.pu-warn::-moz-progress-bar{background:color-mix(in srgb,#c47b08 48%,var(--dsw-alias-label-secondary))}",
			"[data-provider-usage-panel] .pu-bar.pu-low{accent-color:color-mix(in srgb,#d94848 48%,var(--dsw-alias-label-secondary))}",
			"[data-provider-usage-panel] .pu-bar.pu-low::-webkit-progress-value,[data-provider-usage-panel] .pu-bar.pu-low::-moz-progress-bar{background:color-mix(in srgb,#d94848 48%,var(--dsw-alias-label-secondary))}",
			"[data-provider-usage-panel] .pu-tip-reset{color:var(--dsw-alias-label-tertiary);font-size:11px}",
			"[data-provider-usage-panel] .pu-tip-empty{padding:8px 0;color:var(--dsw-alias-label-secondary);font-size:12px}",
			"[data-provider-usage-panel] .pu-empty{padding:22px 8px;color:var(--dsw-alias-label-tertiary);text-align:center;font-size:11px;line-height:18px}",
			"[data-provider-usage-panel] .pu-empty-btn{margin-top:8px;padding:4px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-state-business-primary);font-size:11px;cursor:pointer}",
			"[data-provider-usage-panel] .pu-popover{position:absolute;z-index:20;right:4px;bottom:44px;left:4px;max-height:min(520px,calc(100vh - 100px));overflow:hidden;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-1);box-shadow:var(--dsw-shadow-lv2,0 10px 30px rgba(0,0,0,0.18))}",
			"[data-provider-usage-panel] .pu-popover-head{display:flex;align-items:center;padding:12px 12px 8px}",
			"[data-provider-usage-panel] .pu-popover-title{font-size:13px;font-weight:500;color:var(--dsw-alias-label-secondary)}",
			"[data-provider-usage-panel] .pu-popover-sub{margin-top:2px;color:var(--dsw-alias-label-tertiary);font-size:10.5px}",
			"[data-provider-usage-panel] .pu-popover-close{margin-left:auto}",
			"[data-provider-usage-panel] .pu-search{width:calc(100% - 20px);height:30px;margin:0 10px 6px;padding:0 9px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;outline:none;background:transparent;color:var(--dsw-alias-label-primary);font-size:12px}",
			"[data-provider-usage-panel] .pu-search:focus{border-color:var(--dsw-alias-state-business-primary)}",
			"[data-provider-usage-panel] .pu-filter-list{max-height:330px;overflow:auto;padding:2px 8px 8px}",
			"[data-provider-usage-panel] .pu-filter-item{display:flex;align-items:center;gap:8px;min-height:34px;padding:0 5px;border-radius:7px;font-size:12px;color:var(--dsw-alias-label-primary);cursor:pointer}",
			"[data-provider-usage-panel] .pu-filter-list [data-sortable-row=\"true\"]{grid-template-columns:16px minmax(0,1fr)!important;border:0;background:transparent;border-radius:7px}",
			"[data-provider-usage-panel] .pu-filter-list [data-sortable-handle]{width:16px!important;min-height:28px!important;border-right:0!important;opacity:.65}",
			"[data-provider-usage-panel] .pu-filter-item:hover{background:var(--dsw-alias-bg-module-platform)}",
			"[data-provider-usage-panel] .pu-filter-all{width:100%;border:0;border-bottom:1px solid var(--dsw-alias-border-l2);background:transparent;text-align:left;font-weight:500}",
			"[data-provider-usage-panel] .pu-filter-all:disabled{cursor:default;opacity:.55}",
			"[data-provider-usage-panel] .pu-filter-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
			"[data-provider-usage-panel] .pu-no-match{padding:16px 8px;color:var(--dsw-alias-label-tertiary);text-align:center;font-size:11px}",
			"@media (max-width:640px){[data-provider-usage-panel] .pu-name{font-size:11px;line-height:13px}}"
		].join("\n");
		function localReset(value) {
			if (value === void 0) return void 0;
			const date = new Date(value);
			if (Number.isNaN(date.valueOf())) return void 0;
			return date.toLocaleString(void 0, {
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit"
			});
		}
		function headlineOf(summary) {
			const primary = summary.status === "ready" || summary.status === "stale" ? pickPrimaryWindow(summary.windows) : void 0;
			if (primary === void 0) return summary.status === "ready" ? "—" : STATUS_TEXT[summary.status];
			return windowValueText(primary);
		}
		/** One compact two-column mini. Tap/click opens the detail card. */
		function RefreshIcon() {
			return (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 20 20",
				"aria-hidden": "true",
				children: [(0, react_jsx_runtime.jsx)("path", { d: "M16.2 7A6.5 6.5 0 1 0 16 13.5" }), (0, react_jsx_runtime.jsx)("path", { d: "M16.2 3.8V7H13" })]
			});
		}
		function ProviderRow(props) {
			const summary = props.summary;
			const primary = summary.status === "ready" || summary.status === "stale" ? pickPrimaryWindow(summary.windows) : void 0;
			const headline = headlineOf(summary);
			const tone = usageTone(primary?.remainingPercent);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: "pu-cell",
				children: [(0, react_jsx_runtime.jsxs)("div", {
					role: "button",
					tabIndex: 0,
					className: "pu-row" + (tone === void 0 ? "" : " pu-" + tone),
					"aria-label": summary.name + " " + (primary === void 0 ? STATUS_TEXT[summary.status] : headline),
					onClick: props.onSelect,
					onKeyDown: (event) => {
						if (event.key === "Enter" || event.key === " ") {
							event.preventDefault();
							props.onSelect();
						}
					},
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: "pu-mark",
						children: (0, react_jsx_runtime.jsx)(ProviderMark, {
							providerKey: summary.providerKey,
							fallback: providerInitial(summary.name)
						})
					}), (0, react_jsx_runtime.jsxs)("span", {
						className: "pu-copy",
						children: [(0, react_jsx_runtime.jsxs)("span", {
							className: "pu-name",
							children: [summary.name, summary.status === "stale" ? " · 已过期" : ""]
						}), (0, react_jsx_runtime.jsx)("span", {
							className: "pu-primary" + (primary === void 0 ? " pu-empty-text" : ""),
							children: headline
						})]
					})]
				}), (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "pu-icon-btn pu-row-refresh" + (summary.refreshing === true ? " pu-spinning" : ""),
					"aria-label": "刷新 " + summary.name,
					onClick: props.onRefresh,
					children: summary.refreshing === true ? (0, react_jsx_runtime.jsx)("span", { className: "pu-mini-spin" }) : (0, react_jsx_runtime.jsx)(RefreshIcon, {})
				})]
			});
		}
		function UsageDetail(props) {
			const summary = props.summary;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: "pu-detail",
				"aria-label": summary.name + " 额度详情",
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: "pu-detail-head",
						children: [
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "pu-icon-btn",
								"aria-label": "返回全部 Provider",
								onClick: props.onBack,
								children: (0, react_jsx_runtime.jsx)("svg", {
									viewBox: "0 0 20 20",
									"aria-hidden": "true",
									children: (0, react_jsx_runtime.jsx)("path", { d: "M12.5 4.5 7 10l5.5 5.5" })
								})
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: "pu-mark",
								children: (0, react_jsx_runtime.jsx)(ProviderMark, {
									providerKey: summary.providerKey,
									fallback: providerInitial(summary.name)
								})
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: "pu-detail-name",
								children: summary.name
							}),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "pu-icon-btn" + (summary.refreshing === true ? " pu-spinning" : ""),
								"aria-label": "刷新 " + summary.name,
								onClick: props.onRefresh,
								children: summary.refreshing === true ? (0, react_jsx_runtime.jsx)("span", { className: "pu-mini-spin" }) : (0, react_jsx_runtime.jsx)(RefreshIcon, {})
							})
						]
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: "pu-detail-sub",
						children: "剩余额度"
					}),
					summary.windows.length === 0 ? (0, react_jsx_runtime.jsx)("div", {
						className: "pu-tip-empty",
						children: STATUS_TEXT[summary.status]
					}) : summary.windows.map((quotaWindow) => {
						const reset = localReset(quotaWindow.resetsAt);
						const tone = usageTone(quotaWindow.remainingPercent);
						const remaining = quotaWindow.remainingPercent;
						return (0, react_jsx_runtime.jsxs)("div", {
							className: "pu-win",
							children: [
								(0, react_jsx_runtime.jsxs)("div", {
									className: "pu-win-top",
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: "pu-tip-label",
										children: quotaWindow.label
									}), (0, react_jsx_runtime.jsx)("span", {
										className: "pu-tip-value" + (tone === void 0 ? "" : " pu-" + tone),
										children: windowValueText(quotaWindow)
									})]
								}),
								remaining === void 0 ? null : (0, react_jsx_runtime.jsx)("progress", {
									className: "pu-bar" + (tone === void 0 ? "" : " pu-" + tone),
									max: 100,
									value: remaining
								}),
								reset === void 0 ? null : (0, react_jsx_runtime.jsxs)("div", {
									className: "pu-tip-reset",
									children: ["重置 ", reset]
								})
							]
						}, quotaWindow.id);
					})
				]
			});
		}
		/** Controlled sidebar Provider Usage panel (two-column minis, tap for details). */
		function ProviderUsagePanel(props) {
			const hidden = new Set(props.hiddenKeys ?? []);
			const visible = props.providers.filter((summary) => !hidden.has(summary.providerKey));
			const [filterOpen, setFilterOpen] = (0, react.useState)(false);
			const [detailKey, setDetailKey] = (0, react.useState)();
			const [query, setQuery] = (0, react.useState)("");
			const searchRef = (0, react.useRef)(null);
			const detail = visible.find((summary) => summary.providerKey === detailKey);
			(0, react.useEffect)(() => {
				if (filterOpen) searchRef.current?.focus();
				else setQuery("");
			}, [filterOpen]);
			(0, react.useEffect)(() => {
				if (detailKey === void 0) return;
				const onKey = (event) => {
					if (event.key === "Escape") setDetailKey(void 0);
				};
				document.addEventListener("keydown", onKey);
				return () => {
					document.removeEventListener("keydown", onKey);
				};
			}, [detailKey]);
			const normalizedQuery = query.trim().toLowerCase();
			const matches = normalizedQuery === "" ? props.providers : props.providers.filter((summary) => summary.name.toLowerCase().includes(normalizedQuery));
			const allVisible = props.providers.length > 0 && visible.length === props.providers.length;
			let body;
			if (visible.length === 0) body = (0, react_jsx_runtime.jsxs)("div", {
				className: "pu-empty",
				children: [
					(0, react_jsx_runtime.jsx)("div", { children: props.providers.length === 0 ? "暂无可查询的 Provider" : "没有显示的 Provider" }),
					(0, react_jsx_runtime.jsx)("div", { children: "使用筛选按钮选择要在侧栏显示的 Provider" }),
					(0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "pu-empty-btn",
						onClick: () => {
							setFilterOpen(true);
						},
						children: "打开筛选"
					})
				]
			});
			else body = (0, react_jsx_runtime.jsx)("div", {
				className: "pu-rows",
				children: visible.map((summary) => (0, react_jsx_runtime.jsx)(ProviderRow, {
					summary,
					onSelect: () => {
						setFilterOpen(false);
						setDetailKey(summary.providerKey);
					},
					onRefresh: () => {
						props.onRefresh(summary.providerKey);
					}
				}, summary.providerKey))
			});
			return (0, react_jsx_runtime.jsxs)("section", {
				"data-provider-usage-panel": true,
				"aria-label": "Provider Usage",
				children: [
					(0, react_jsx_runtime.jsx)("style", { children: panelCss }),
					(0, react_jsx_runtime.jsxs)("div", {
						className: "pu-head",
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: "pu-title",
							children: "Provider Usage"
						}), (0, react_jsx_runtime.jsxs)("span", {
							className: "pu-actions",
							children: [(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "pu-icon-btn",
								"aria-label": "选择侧栏显示的 Provider",
								"aria-expanded": filterOpen,
								onClick: () => {
									setFilterOpen((open) => !open);
								},
								children: (0, react_jsx_runtime.jsxs)("svg", {
									viewBox: "0 0 20 20",
									"aria-hidden": "true",
									children: [
										(0, react_jsx_runtime.jsx)("path", { d: "M3 5h8M15 5h2M9 10h8M3 10h2M3 15h6M13 15h4" }),
										(0, react_jsx_runtime.jsx)("circle", {
											cx: "13",
											cy: "5",
											r: "2"
										}),
										(0, react_jsx_runtime.jsx)("circle", {
											cx: "7",
											cy: "10",
											r: "2"
										}),
										(0, react_jsx_runtime.jsx)("circle", {
											cx: "11",
											cy: "15",
											r: "2"
										})
									]
								})
							}), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "pu-icon-btn" + (props.refreshing === true ? " pu-spinning" : ""),
								"aria-label": "刷新用量",
								onClick: () => {
									props.onRefresh();
								},
								children: (0, react_jsx_runtime.jsxs)("svg", {
									viewBox: "0 0 20 20",
									"aria-hidden": "true",
									children: [(0, react_jsx_runtime.jsx)("path", { d: "M16.2 7A6.5 6.5 0 1 0 16 13.5" }), (0, react_jsx_runtime.jsx)("path", { d: "M16.2 3.8V7H13" })]
								})
							})]
						})]
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: "pu-stage" + (detail === void 0 ? "" : " pu-stage-open"),
						children: detail === void 0 ? body : (0, react_jsx_runtime.jsx)(UsageDetail, {
							summary: detail,
							onBack: () => {
								setDetailKey(void 0);
							},
							onRefresh: () => {
								props.onRefresh(detail.providerKey);
							}
						})
					}),
					filterOpen ? (0, react_jsx_runtime.jsxs)("section", {
						className: "pu-popover",
						role: "dialog",
						"aria-label": "侧栏显示",
						onKeyDown: (event) => {
							if (event.key === "Escape") {
								setFilterOpen(false);
								setDetailKey(void 0);
							}
						},
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: "pu-popover-head",
								children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("div", {
									className: "pu-popover-title",
									children: "侧栏显示"
								}), (0, react_jsx_runtime.jsx)("div", {
									className: "pu-popover-sub",
									children: "只影响 Provider Usage，不影响模型列表"
								})] }), (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "pu-icon-btn pu-popover-close",
									"aria-label": "关闭筛选",
									onClick: () => {
										setFilterOpen(false);
									},
									children: "×"
								})]
							}),
							(0, react_jsx_runtime.jsx)("input", {
								ref: searchRef,
								className: "pu-search",
								type: "search",
								"aria-label": "搜索 Provider",
								placeholder: "搜索 Provider",
								value: query,
								onChange: (event) => {
									setQuery(event.target.value);
								}
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: "pu-filter-list",
								children: [(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "pu-filter-item pu-filter-all",
									disabled: allVisible,
									onClick: props.onShowAll,
									children: "显示全部 " + String(props.providers.length) + " 个"
								}), matches.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
									className: "pu-no-match",
									children: "没有匹配的 Provider"
								}) : query.trim() === "" && props.onReorder !== void 0 && matches.length > 1 ? (0, react_jsx_runtime.jsx)(SortableList, {
									items: [...matches],
									getId: (summary) => summary.providerKey,
									dragLabel: (summary) => "调整顺序: " + summary.name,
									onReorder: (next) => {
										props.onReorder?.(next.map((summary) => summary.providerKey));
									},
									renderItem: (summary) => (0, react_jsx_runtime.jsx)(FilterRow, {
										summary,
										hidden: hidden.has(summary.providerKey),
										onToggle: (visible) => {
											props.onToggleVisibility(summary.providerKey, visible);
										}
									})
								}) : matches.map((summary) => (0, react_jsx_runtime.jsx)(FilterRow, {
									summary,
									hidden: hidden.has(summary.providerKey),
									onToggle: (visible) => {
										props.onToggleVisibility(summary.providerKey, visible);
									}
								}, summary.providerKey))]
							})
						]
					}) : null
				]
			});
		}
		//#endregion
		//#region lib/types/client/usage-action.js
		/** Mounts the Provider Usage store into the sidebar footer slot. */
		function ProviderUsageAction(props) {
			const usage = (0, react.useSyncExternalStore)(props.usage.subscribe, props.usage.getSnapshot, props.usage.getSnapshot);
			if (!props.wide) return null;
			return (0, react_jsx_runtime.jsx)(ProviderUsagePanel, {
				providers: usage.providers,
				hiddenKeys: usage.hiddenKeys,
				refreshing: usage.refreshing,
				onRefresh: (key) => {
					key === void 0 ? props.usage.refresh() : props.usage.refresh([key]);
				},
				onToggleVisibility: props.toggleVisibility,
				onShowAll: props.showAll,
				onReorder: (keys) => {
					props.reorder(keys);
				}
			});
		}
		function providerKeys(ctx) {
			return ctx.slots.entriesOfSlot(PROVIDERS_ITEM_SLOT).map((entry) => entry.options.key).filter((key) => key !== void 0 && key.length > 0);
		}
		/** Install one root-scoped footer action and keep it synchronized with provider/settings slots. */
		function installProviderUsage(ctx, orderScope, directory) {
			let connection;
			try {
				const candidate = ctx.get("connection");
				if (candidate === void 0 || candidate === null || typeof candidate !== "object" || !("rpc" in candidate)) return () => {};
				connection = candidate;
			} catch {
				return () => {};
			}
			const usage = createProviderUsageStore(connection.rpc, (key) => directory.reader(key));
			let directoryGeneration = 0;
			let lastConfig = "";
			const reconcile = () => {
				const settings = orderScope.getSnapshot();
				const keys = providerKeys(ctx);
				const usageOrder = settings.value?.usageOrder ?? [];
				const hidden = settings.value?.hiddenUsageProviders ?? [];
				const config = JSON.stringify([
					keys,
					usageOrder,
					hidden,
					directoryGeneration
				]);
				if (config === lastConfig) return;
				lastConfig = config;
				usage.configure({
					registeredKeys: keys,
					savedOrder: usageOrder,
					hiddenKeys: hidden
				});
			};
			const writeList = (field, value) => {
				const settings = orderScope.getSnapshot();
				if (settings.status !== "ready" || !settings.writable) return;
				orderScope.set(field, [...value]).catch((error) => {
					console.warn("[dsh-llm-providers-ui] failed to save Provider Usage " + field, error);
				});
			};
			const writeHidden = (hidden) => {
				writeList("hiddenUsageProviders", [...new Set(hidden)]);
			};
			const toggleVisibility = (providerKey, visible) => {
				const hidden = new Set(orderScope.getSnapshot().value?.hiddenUsageProviders ?? []);
				if (visible) hidden.delete(providerKey);
				else hidden.add(providerKey);
				writeHidden([...hidden]);
			};
			const showAll = () => {
				writeHidden([]);
			};
			const reorder = (keys) => {
				writeList("usageOrder", keys);
			};
			reconcile();
			const action = ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
				name: "sidebar.footer.action",
				id: "llm-providers-usage",
				order: 0,
				inject: () => ({
					usage,
					toggleVisibility,
					showAll,
					reorder
				})
			}, ProviderUsageAction));
			const stopSlot = ctx.slots.subscribe(PROVIDERS_ITEM_SLOT, reconcile);
			const stopSettings = orderScope.subscribe(reconcile);
			const stopDirectory = directory.subscribe(() => {
				directoryGeneration += 1;
				reconcile();
			});
			const stopInvalidate = directory.onInvalidateUsage((key) => {
				usage.invalidate([key]);
			});
			return () => {
				disposeReverse([
					stopInvalidate,
					stopDirectory,
					stopSettings,
					stopSlot,
					action,
					() => {
						usage.dispose();
					}
				], "dsh-llm-providers-ui: usage cleanup failed");
			};
		}
		//#endregion
		//#region lib/types/client/directory.js
		/** Open registration service for Provider card roles and quota readers. */
		/** Lets client plugins publish their Provider card role and optional quota reader. */
		var ProviderDirectory = class {
			entries = /* @__PURE__ */ new Map();
			listeners = /* @__PURE__ */ new Set();
			invalidationListeners = /* @__PURE__ */ new Set();
			/**
			* Publish a Provider declaration.
			* @param declaration - Card key, role, and optional quota reader.
			* @returns A disposer that removes the declaration.
			*/
			register(declaration) {
				this.entries.set(declaration.key, {
					role: declaration.role ?? "llm",
					header: declaration.header ?? "legacy",
					...declaration.usage === void 0 ? {} : { usage: declaration.usage }
				});
				this.notify();
				return () => {
					if (!this.entries.delete(declaration.key)) return;
					this.notify();
				};
			}
			/**
			* Read a Provider role, defaulting undeclared cards to LLM.
			* @param key - Provider card key.
			* @returns The published role or LLM for an undeclared card.
			*/
			roleOf(key) {
				return this.entries.get(key)?.role ?? "llm";
			}
			/**
			* Read who renders a Provider header, defaulting undeclared cards to legacy.
			* The shell renders its fallback badge only for legacy cards.
			* @param key - Provider card key.
			* @returns shared for migrated cards, legacy otherwise.
			*/
			headerOf(key) {
				return this.entries.get(key)?.header ?? "legacy";
			}
			/**
			* Read the optional quota reader for a Provider card.
			* @param key - Provider card key.
			* @returns The published reader, if any.
			*/
			reader(key) {
				return this.entries.get(key)?.usage;
			}
			/**
			* Subscribe to changes in registered Providers.
			* @param listener - Called after a declaration is added or removed.
			* @returns A disposer that stops notifications.
			*/
			subscribe(listener) {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			}
			/**
			* Signal that cached quota for a key is no longer valid. Providers call
			* this immediately after sign-out or account switch; the shell purges the
			* sidebar cache and refetches, so the previous account's quota never lingers
			* as a stale tile. Transient read errors still show stale data by design.
			* @param key - Provider card key whose quota cache must drop.
			*/
			invalidateUsage(key) {
				for (const listener of this.invalidationListeners) listener(key);
			}
			/**
			* Subscribe to quota-invalidation signals.
			* @param listener - Called with the key whose cache must drop.
			* @returns A disposer that stops notifications.
			*/
			onInvalidateUsage(listener) {
				this.invalidationListeners.add(listener);
				return () => {
					this.invalidationListeners.delete(listener);
				};
			}
			notify() {
				for (const listener of this.listeners) listener();
			}
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Browser owner of the LLM Providers Settings page. */
		const name = "dsh-llm-providers-ui-client";
		const inject = [
			"slots",
			"locale",
			"settingsScope"
		];
		const Config = Schema.object({});
		/**
		* Whether the Providers settings page should be visible.
		* `ready` is the loopback Host document. Remote Web uses process-local
		* (`memory`) settings and reports `unavailable` even when the Host owner is loaded.
		*/
		function pageVisible(snapshot) {
			return snapshot.status === "ready" || snapshot.mode === "memory";
		}
		/**
		* Warn once while the Host owner has not published the settings namespace.
		* @param orderScope - client scope bound to the Host-owned namespace.
		* @returns disposer for the deferred check and scope subscription.
		*/
		function installMissingOwnerDiagnostic(orderScope) {
			let warned = false;
			const check = () => {
				const snapshot = orderScope.getSnapshot();
				if (warned || pageVisible(snapshot)) return;
				if (snapshot.status === "loading") return;
				warned = true;
				console.warn("[dsh-llm-providers-ui] llm-providers settings owner is unavailable; omitting the Providers page until the Host owner is loaded.");
			};
			const timer = setTimeout(check, 0);
			const stop = orderScope.subscribe(check);
			return () => {
				disposeReverse([() => {
					clearTimeout(timer);
				}, stop], "dsh-llm-providers-ui: owner diagnostic cleanup failed");
			};
		}
		/**
		* Warn once when an available Host namespace has no Web section declaration.
		* @param ctx - Web Cordis context with the public SlotCore face.
		* @param orderScope - client scope used to gate the page transaction.
		* @returns disposer for the deferred check and both subscriptions.
		*/
		function installMissingSectionDiagnostic(ctx, orderScope) {
			let warned = false;
			const check = () => {
				if (warned || !pageVisible(orderScope.getSnapshot()) || ctx.slots.spec("settings.section") !== void 0) return;
				warned = true;
				console.warn("[dsh-llm-providers-ui] settings.section is missing; the Providers page cannot mount until the Web settings shell declares it.");
			};
			const timer = setTimeout(check, 0);
			const stopSection = ctx.slots.subscribe("settings.section", check);
			const stopScope = orderScope.subscribe(check);
			return () => {
				disposeReverse([
					() => {
						clearTimeout(timer);
					},
					stopSection,
					stopScope
				], "dsh-llm-providers-ui: section diagnostic cleanup failed");
			};
		}
		/**
		* Mount the page while Host settings are ready, or while remote Web uses process-local memory settings.
		* @param ctx - Web Cordis context with official slot and settings services.
		* @param orderScope - client scope used to gate the page transaction.
		* @param t - locale lookup for the page label.
		* @returns disposer for the scope listener and active page transaction.
		*/
		function installSectionTransaction(ctx, orderScope, t, directory) {
			let stopSection;
			let stopNav;
			const unmount = () => {
				const section = stopSection;
				const nav = stopNav;
				stopSection = void 0;
				stopNav = void 0;
				disposeReverse([section, nav], "dsh-llm-providers-ui: page unmount failed");
			};
			const mount = () => {
				if (stopSection !== void 0 || !pageVisible(orderScope.getSnapshot())) return;
				stopSection = ctx.slots.inject("settings.section", () => ctx.slots.register({
					name: "settings.section",
					id: PROVIDERS_SECTION_ID,
					order: 12,
					label: t,
					locale: PROVIDERS_LOCALE_NS,
					children: { [PROVIDERS_ITEM_SLOT]: {
						kind: "keyed",
						scope: "root"
					} }
				}, bindProvidersSection(() => ctx.slots.entriesOfSlot(PROVIDERS_ITEM_SLOT).map((entry) => entry.options.key).filter((key) => key !== void 0 && key.length > 0), (listener) => {
					const stopSlot = ctx.slots.subscribe(PROVIDERS_ITEM_SLOT, listener);
					const stopSettings = orderScope.subscribe(listener);
					const stopDirectory = directory.subscribe(listener);
					return () => {
						disposeReverse([
							stopDirectory,
							stopSlot,
							stopSettings
						], "dsh-llm-providers-ui: section listener cleanup failed");
					};
				}, () => {
					const snapshot = orderScope.getSnapshot();
					return {
						keys: snapshot.value?.order ?? [],
						disabled: snapshot.status !== "ready" || !snapshot.writable
					};
				}, (keys) => {
					orderScope.set("order", keys);
				}, (key) => directory.roleOf(key), (key) => directory.headerOf(key))));
				try {
					stopNav = installProvidersNavIcon();
				} catch (error) {
					console.warn("[dsh-llm-providers-ui] navigation icon failed; keeping the Providers settings page", error);
				}
			};
			const reconcile = () => {
				if (pageVisible(orderScope.getSnapshot())) mount();
				else unmount();
			};
			let stopScope;
			try {
				stopScope = orderScope.subscribe(reconcile);
				reconcile();
			} catch (error) {
				disposeAfterSetup(error, [stopScope, unmount], "dsh-llm-providers-ui: transaction setup rollback failed");
			}
			return () => {
				disposeReverse([stopScope, unmount], "dsh-llm-providers-ui: transaction cleanup failed");
			};
		}
		/**
		* Mount the sole LLM Providers page, locale, slot, and nav-icon adapter.
		* The page is independent of shell/provider load order and appears only after
		* the Host-owned settings namespace is available.
		* @param ctx - Web Cordis context with official slot, locale, and settingsScope faces.
		*/
		function apply(ctx, _config = {}) {
			ctx.effect(() => {
				const existing = ctx.get("providerDirectory");
				const directory = existing ?? new ProviderDirectory();
				const disposers = existing === void 0 ? [ctx.provide("providerDirectory", directory)] : [];
				try {
					disposers.push(ctx.locale.register(PROVIDERS_LOCALE_NS, copy));
					const orderScope = ctx.settingsScope.bind({
						namespace: PROVIDERS_SETTINGS_NS,
						decode: decodeProviderOrder
					});
					const t = ctx.locale.bind(PROVIDERS_LOCALE_NS);
					disposers.push(installMissingOwnerDiagnostic(orderScope));
					disposers.push(installMissingSectionDiagnostic(ctx, orderScope));
					disposers.push(installSectionTransaction(ctx, orderScope, () => t("nav"), directory));
					try {
						disposers.push(installProviderUsage(ctx, orderScope, directory));
					} catch (error) {
						console.warn("[dsh-llm-providers-ui] Provider Usage widget failed; keeping the Providers settings page", error);
					}
				} catch (error) {
					disposeAfterSetup(error, disposers, "dsh-llm-providers-ui: setup failed and cleanup failed");
				}
				return () => {
					disposeReverse(disposers, "dsh-llm-providers-ui: outer cleanup failed");
				};
			}, "dsh-llm-providers-ui: providers section");
		}
		//#endregion
		exports.Config = Config;
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});
