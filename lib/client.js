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
		/** Decode the llm-providers settings section. Unknown input becomes an empty order. */
		function decodeProviderOrder(value) {
			if (value === null || typeof value !== "object" || Array.isArray(value)) return { order: [] };
			const raw = value.order;
			if (!Array.isArray(raw)) return { order: [] };
			return { order: raw.filter((entry) => typeof entry === "string" && entry.length > 0) };
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
		const listStyle$1 = {
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
			color: "var(--dsw-alias-label-tertiary)"
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
		function SortableList({ items, getId, renderItem, dragLabel, onReorder, disabled = false, chrome = "row" }) {
			const card = chrome === "card";
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
				if (disabled || event.button !== 0) return;
				const row = event.currentTarget.closest("[data-sortable-row=\"true\"]");
				if (!(row instanceof HTMLElement)) return;
				event.preventDefault();
				event.currentTarget.focus();
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
				style: {
					...listStyle$1,
					...card ? { gap: 12 } : {}
				},
				children: [
					card ? (0, react_jsx_runtime.jsx)("style", { children: cardCss }) : null,
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
								...card ? cardRowStyle : rowStyle,
								visibility: dragging ? "hidden" : "visible",
								pointerEvents: dragging ? "none" : "auto",
								borderColor: dragging ? "transparent" : "var(--dsw-alias-border-l2)",
								boxShadow: targeted ? "0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-primary) 20%, transparent)" : "none"
							},
							children: [(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: {
									...handleStyle,
									cursor: disabled ? "default" : draggedId === null ? "grab" : "grabbing"
								},
								"aria-label": dragLabel(item, index),
								"aria-grabbed": dragging,
								title: dragLabel(item, index),
								disabled,
								onDragStart: (event) => {
									event.preventDefault();
								},
								onPointerDown: (event) => {
									startDrag(event, id);
								},
								children: (0, react_jsx_runtime.jsx)(IconGrip, {})
							}), (0, react_jsx_runtime.jsx)("div", {
								"data-sortable-item": "",
								style: card ? cardItemStyle : { minWidth: 0 },
								children: renderItem(item, index)
							})]
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
		const listStyle = {
			display: "flex",
			flexDirection: "column",
			gap: 12
		};
		const emptyStyle = {
			color: "var(--dsw-alias-label-tertiary)",
			fontSize: 13,
			lineHeight: "20px"
		};
		/** Bind the shared page to live keyed-slot and settings snapshots. */
		function bindProvidersSection(listRegisteredKeys, subscribe, readOrder, onReorder) {
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
					onReorder
				});
			};
		}
		/** Render installed provider cards. Two or more cards grow a left drag handle. */
		function ProvidersSection(props) {
			const t = props.t ?? ((key) => key);
			const keys = applySavedOrder(props.registeredKeys ?? [], props.savedOrder ?? []);
			const items = keys.map((key) => ({ key }));
			const renderCard = (item) => {
				const node = props.renderSlot?.(PROVIDERS_ITEM_SLOT, {}, { entryKey: item.key });
				return node == null ? null : (0, react_jsx_runtime.jsx)(react.Fragment, { children: node });
			};
			const body = keys.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
				style: emptyStyle,
				children: t("empty")
			}) : keys.length < 2 || props.disabled === true ? (0, react_jsx_runtime.jsx)("div", {
				style: listStyle,
				children: items.map((item) => (0, react_jsx_runtime.jsx)(react.Fragment, { children: renderCard(item) }, item.key))
			}) : (0, react_jsx_runtime.jsx)(SortableList, {
				chrome: "card",
				items,
				getId: (item) => item.key,
				dragLabel: (item) => t("drag") + ": " + item.key,
				onReorder: (next) => {
					props.onReorder?.(next.map((item) => item.key));
				},
				renderItem: (item) => renderCard(item)
			});
			return (0, react_jsx_runtime.jsxs)("div", {
				"data-providers-section": PROVIDERS_LOCALE_NS,
				style: pageStyle,
				children: [(0, react_jsx_runtime.jsxs)("header", { children: [(0, react_jsx_runtime.jsx)("h2", {
					style: titleStyle,
					children: t("title")
				}), (0, react_jsx_runtime.jsx)("p", {
					style: subtitleStyle,
					children: t("subtitle")
				})] }), body]
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
				drag: "拖动排序"
			},
			en: {
				nav: "LLM Providers",
				title: "LLM Providers",
				subtitle: "Connect accounts and choose which models appear in the chat picker. Drag cards to change provider order in the picker.",
				empty: "Install Cursor, Grok, Codex, Ollama Cloud, CommandCode, or OpenCode Go to connect an account and pick models here.",
				drag: "Reorder"
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
		* Warn once while the Host owner has not published the settings namespace.
		* @param orderScope - client scope bound to the Host-owned namespace.
		* @returns disposer for the deferred check and scope subscription.
		*/
		function installMissingOwnerDiagnostic(orderScope) {
			let warned = false;
			const check = () => {
				const status = orderScope.getSnapshot().status;
				if (warned || status === "ready" || status === "loading") return;
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
				if (warned || orderScope.getSnapshot().status !== "ready" || ctx.slots.spec("settings.section") !== void 0) return;
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
		* Mount the page transaction only while the Host-owned settings scope is ready.
		* @param ctx - Web Cordis context with official slot and settings services.
		* @param orderScope - client scope used to gate the page transaction.
		* @param t - locale lookup for the page label.
		* @returns disposer for the scope listener and active page transaction.
		*/
		function installSectionTransaction(ctx, orderScope, t) {
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
				if (stopSection !== void 0 || orderScope.getSnapshot().status !== "ready") return;
				const section = ctx.slots.inject("settings.section", () => ctx.slots.register({
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
					return () => {
						disposeReverse([stopSlot, stopSettings], "dsh-llm-providers-ui: section listener cleanup failed");
					};
				}, () => {
					const snapshot = orderScope.getSnapshot();
					return {
						keys: snapshot.value?.order ?? [],
						disabled: snapshot.status !== "ready" || !snapshot.writable
					};
				}, (keys) => {
					orderScope.set("order", keys);
				})));
				try {
					const nav = installProvidersNavIcon();
					stopSection = section;
					stopNav = nav;
				} catch (error) {
					disposeAfterSetup(error, [section], "dsh-llm-providers-ui: page setup rollback failed");
				}
			};
			const reconcile = () => {
				if (orderScope.getSnapshot().status === "ready") mount();
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
				const disposers = [];
				try {
					disposers.push(ctx.locale.register(PROVIDERS_LOCALE_NS, copy));
					const orderScope = ctx.settingsScope.bind({
						namespace: PROVIDERS_SETTINGS_NS,
						decode: decodeProviderOrder
					});
					const t = ctx.locale.bind(PROVIDERS_LOCALE_NS);
					disposers.push(installMissingOwnerDiagnostic(orderScope));
					disposers.push(installMissingSectionDiagnostic(ctx, orderScope));
					disposers.push(installSectionTransaction(ctx, orderScope, () => t("nav")));
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
