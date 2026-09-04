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
		const ROUTE_TO_KEY = new Map(Object.entries({
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
				hiddenUsageProviders: []
			};
			const record = value;
			return {
				order: decodeStringList(record.order),
				hiddenUsageProviders: decodeStringList(record.hiddenUsageProviders)
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
		/** Map an llm route id to its settings.provider.item key when known. */
		function providerKeyForRoute(route) {
			return ROUTE_TO_KEY.get(route);
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
		//#region lib/types/client/ProviderUsagePanel.js
		/** Sidebar Provider Usage panel, prototype B (two-column digest). Controlled and UI-only: no RPC, no persistence. */
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
		function periodRank(shortLabel) {
			const normalized = shortLabel.toUpperCase();
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
		function windowValueText(quotaWindow) {
			return quotaWindow.remainingPercent === void 0 ? quotaWindow.valueText : String(quotaWindow.remainingPercent) + "%";
		}
		function usageTone(remainingPercent) {
			if (remainingPercent !== void 0 && remainingPercent <= 15) return "low";
			if (remainingPercent !== void 0 && remainingPercent <= 35) return "warn";
		}
		function providerInitial(name) {
			return name.trim().charAt(0);
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
			"[data-provider-usage-panel]{display:flex;flex-direction:column;position:relative;min-width:0;padding:6px 6px 8px;background:transparent}",
			"[data-provider-usage-panel] .pu-head{display:flex;align-items:center;height:32px;padding:0 2px 7px}",
			"[data-provider-usage-panel] .pu-title{font-size:12px;font-weight:680;letter-spacing:.01em;color:var(--dsw-alias-label-primary)}",
			"[data-provider-usage-panel] .pu-count{margin-left:6px;padding:1px 6px;border-radius:999px;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-tertiary);font-size:9.5px;font-variant-numeric:tabular-nums}",
			"[data-provider-usage-panel] .pu-actions{display:flex;gap:2px;margin-left:auto}",
			"[data-provider-usage-panel] .pu-icon-btn{display:grid;place-items:center;width:25px;height:25px;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}",
			"[data-provider-usage-panel] .pu-icon-btn:hover{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary)}",
			"[data-provider-usage-panel] .pu-icon-btn:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}",
			"[data-provider-usage-panel] .pu-icon-btn svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.7}",
			"[data-provider-usage-panel] .pu-spinning svg{animation:pu-spin .55s ease}",
			"@keyframes pu-spin{to{transform:rotate(360deg)}}",
			"[data-provider-usage-panel] .pu-scroll{max-height:280px;overflow:auto;padding:1px;margin:-1px;scrollbar-width:thin}",
			"[data-provider-usage-panel] .pu-rows{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}",
			"[data-provider-usage-panel] .pu-row{display:flex;flex-direction:column;min-width:0;min-height:68px;padding:7px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-layer-1);box-shadow:0 1px 2px rgba(0,0,0,.025);color:inherit}",
			"[data-provider-usage-panel] .pu-row:hover{border-color:var(--dsw-alias-label-tertiary);box-shadow:0 2px 6px rgba(0,0,0,.06)}",
			"[data-provider-usage-panel] .pu-active{border-color:var(--dsw-alias-state-business-primary);box-shadow:0 0 0 1px var(--dsw-alias-state-business-primary)}",
			"[data-provider-usage-panel] .pu-top{display:flex;align-items:center;gap:5px;min-width:0}",
			"[data-provider-usage-panel] .pu-icon{display:grid;place-items:center;flex:none;width:18px;height:18px;border-radius:6px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-module-platform);font-size:9px;font-weight:750}",
			"[data-provider-usage-panel] .pu-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-primary);font-size:10.5px;font-weight:650}",
			"[data-provider-usage-panel] .pu-stale{flex:none;margin-left:auto;padding:0 4px;border-radius:4px;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-tertiary);font-size:8px;line-height:14px;white-space:nowrap}",
			"[data-provider-usage-panel] .pu-metric{display:flex;align-items:baseline;gap:4px;min-width:0;margin-top:5px;color:var(--dsw-alias-label-primary)}",
			"[data-provider-usage-panel] .pu-primary-label{padding:1px 4px;border-radius:4px;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-tertiary);font-size:8px;font-weight:700;line-height:13px;text-transform:uppercase}",
			"[data-provider-usage-panel] .pu-primary{overflow:hidden;text-overflow:ellipsis;color:inherit;font-size:16px;font-weight:720;line-height:18px;font-variant-numeric:tabular-nums}",
			"[data-provider-usage-panel] .pu-low .pu-primary{color:#d94848}",
			"[data-provider-usage-panel] .pu-warn .pu-primary{color:#c47b08}",
			"[data-provider-usage-panel] .pu-meter{display:block;height:3px;margin-top:5px;overflow:hidden;border-radius:999px;background:var(--dsw-alias-bg-module-platform)}",
			"[data-provider-usage-panel] .pu-meter-fill{display:block;height:100%;border-radius:inherit;background:var(--dsw-alias-state-business-primary)}",
			"[data-provider-usage-panel] .pu-low .pu-meter-fill{background:#d94848}",
			"[data-provider-usage-panel] .pu-warn .pu-meter-fill{background:#c47b08}",
			"[data-provider-usage-panel] .pu-windows{display:flex;gap:4px;min-width:0;margin-top:5px;white-space:nowrap}",
			"[data-provider-usage-panel] .pu-window{display:flex;justify-content:center;gap:3px;min-width:0;flex:1;padding:2px 4px;border-radius:5px;background:var(--dsw-alias-bg-module-platform);font-size:8px;line-height:11px}",
			"[data-provider-usage-panel] .pu-window small{flex:none;color:var(--dsw-alias-label-tertiary);font-size:inherit;font-weight:650;text-transform:uppercase}",
			"[data-provider-usage-panel] .pu-window b{overflow:hidden;text-overflow:ellipsis;color:var(--dsw-alias-label-secondary);font-weight:650;font-variant-numeric:tabular-nums}",
			"[data-provider-usage-panel] .pu-window-low b{color:#d94848}",
			"[data-provider-usage-panel] .pu-window-warn b{color:#c47b08}",
			"[data-provider-usage-panel] .pu-status{display:block;margin-top:9px;color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:600}",
			"[data-provider-usage-panel] .pu-empty{padding:22px 8px;color:var(--dsw-alias-label-tertiary);text-align:center;font-size:11px;line-height:18px}",
			"[data-provider-usage-panel] .pu-empty-btn{margin-top:8px;padding:4px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-state-business-primary);font-size:11px;cursor:pointer}",
			"[data-provider-usage-panel] .pu-popover{position:absolute;z-index:20;right:4px;bottom:44px;left:4px;max-height:min(520px,calc(100vh - 100px));overflow:hidden;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-1);box-shadow:var(--dsw-shadow-lv2,0 10px 30px rgba(0,0,0,0.18))}",
			"[data-provider-usage-panel] .pu-popover-head{display:flex;align-items:center;padding:12px 12px 8px}",
			"[data-provider-usage-panel] .pu-popover-title{font-size:13px;font-weight:700;color:var(--dsw-alias-label-primary)}",
			"[data-provider-usage-panel] .pu-popover-sub{margin-top:2px;color:var(--dsw-alias-label-tertiary);font-size:10.5px}",
			"[data-provider-usage-panel] .pu-popover-close{margin-left:auto}",
			"[data-provider-usage-panel] .pu-search{width:calc(100% - 20px);height:30px;margin:0 10px 6px;padding:0 9px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;outline:none;background:transparent;color:var(--dsw-alias-label-primary);font-size:12px}",
			"[data-provider-usage-panel] .pu-search:focus{border-color:var(--dsw-alias-state-business-primary)}",
			"[data-provider-usage-panel] .pu-filter-list{max-height:330px;overflow:auto;padding:2px 8px 8px}",
			"[data-provider-usage-panel] .pu-filter-item{display:flex;align-items:center;gap:8px;min-height:34px;padding:0 5px;border-radius:7px;font-size:12px;color:var(--dsw-alias-label-primary);cursor:pointer}",
			"[data-provider-usage-panel] .pu-filter-item:hover{background:var(--dsw-alias-bg-module-platform)}",
			"[data-provider-usage-panel] .pu-filter-all{width:100%;border:0;border-bottom:1px solid var(--dsw-alias-border-l2);background:transparent;text-align:left;font-weight:650}",
			"[data-provider-usage-panel] .pu-filter-all:disabled{cursor:default;opacity:.55}",
			"[data-provider-usage-panel] .pu-filter-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
			"[data-provider-usage-panel] .pu-no-match{padding:16px 8px;color:var(--dsw-alias-label-tertiary);text-align:center;font-size:11px}",
			"@media (max-width:640px){[data-provider-usage-panel] .pu-rows{grid-template-columns:1fr}[data-provider-usage-panel] .pu-row{min-height:62px}[data-provider-usage-panel] .pu-window{font-size:9px}}"
		].join("\n");
		function compactUtcTimestamp(value) {
			if (value === void 0) return void 0;
			const date = new Date(value);
			if (Number.isNaN(date.valueOf())) return void 0;
			const pad = (part) => String(part).padStart(2, "0");
			return String(date.getUTCMonth() + 1) + "/" + String(date.getUTCDate()) + " " + pad(date.getUTCHours()) + ":" + pad(date.getUTCMinutes()) + " UTC";
		}
		function quotaTooltip(quotaWindow) {
			const reset = compactUtcTimestamp(quotaWindow.resetsAt);
			return reset === void 0 ? void 0 : quotaWindow.shortLabel + " · " + windowValueText(quotaWindow) + " · " + reset + " 重置";
		}
		/** One compact provider metric card. Statuses without data show a single status line. */
		function ProviderRow(props) {
			const summary = props.summary;
			const primary = summary.status === "ready" || summary.status === "stale" ? pickPrimaryWindow(summary.windows) : void 0;
			const headline = primary === void 0 ? STATUS_TEXT[summary.status] : windowValueText(primary);
			const details = summary.windows.filter((quotaWindow) => quotaWindow !== primary).slice(0, 2);
			const tone = usageTone(primary?.remainingPercent);
			const staleUpdated = compactUtcTimestamp(summary.fetchedAt);
			return (0, react_jsx_runtime.jsxs)("div", {
				role: "group",
				className: "pu-row" + (tone === void 0 ? "" : " pu-" + tone) + (props.active ? " pu-active" : ""),
				"aria-label": summary.name + " " + headline,
				children: [
					(0, react_jsx_runtime.jsxs)("span", {
						className: "pu-top",
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: "pu-icon",
								"aria-hidden": true,
								children: providerInitial(summary.name)
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: "pu-name",
								children: summary.name
							}),
							summary.status === "stale" ? (0, react_jsx_runtime.jsx)("span", {
								className: "pu-stale",
								title: staleUpdated === void 0 ? void 0 : "上次更新 " + staleUpdated,
								children: "已过期"
							}) : null
						]
					}),
					primary === void 0 ? (0, react_jsx_runtime.jsx)("span", {
						className: "pu-status",
						children: headline
					}) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("span", {
						className: "pu-metric",
						title: quotaTooltip(primary),
						children: [(0, react_jsx_runtime.jsx)("small", {
							className: "pu-primary-label",
							children: primary.shortLabel
						}), (0, react_jsx_runtime.jsx)("b", {
							className: "pu-primary",
							children: headline
						})]
					}), primary.remainingPercent === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
						className: "pu-meter",
						"aria-hidden": true,
						children: (0, react_jsx_runtime.jsx)("span", {
							className: "pu-meter-fill",
							style: { width: String(Math.max(0, Math.min(100, primary.remainingPercent))) + "%" }
						})
					})] }),
					details.length > 0 ? (0, react_jsx_runtime.jsx)("span", {
						className: "pu-windows",
						children: details.map((quotaWindow) => {
							const detailTone = usageTone(quotaWindow.remainingPercent);
							return (0, react_jsx_runtime.jsxs)("span", {
								className: "pu-window" + (detailTone === void 0 ? "" : " pu-window-" + detailTone),
								title: quotaTooltip(quotaWindow),
								children: [(0, react_jsx_runtime.jsx)("small", { children: quotaWindow.shortLabel }), (0, react_jsx_runtime.jsx)("b", { children: windowValueText(quotaWindow) })]
							}, quotaWindow.id);
						})
					}) : null
				]
			});
		}
		/** Controlled sidebar Provider Usage panel (desktop two columns, mobile one column). */
		function ProviderUsagePanel(props) {
			const hidden = new Set(props.hiddenKeys ?? []);
			const visible = props.providers.filter((summary) => !hidden.has(summary.providerKey));
			const [filterOpen, setFilterOpen] = (0, react.useState)(false);
			const [query, setQuery] = (0, react.useState)("");
			const searchRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				if (filterOpen) searchRef.current?.focus();
				else setQuery("");
			}, [filterOpen]);
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
					active: summary.providerKey === props.currentProviderKey
				}, summary.providerKey))
			});
			return (0, react_jsx_runtime.jsxs)("section", {
				"data-provider-usage-panel": true,
				"aria-label": "Provider Usage",
				children: [
					(0, react_jsx_runtime.jsx)("style", { children: panelCss }),
					(0, react_jsx_runtime.jsxs)("div", {
						className: "pu-head",
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: "pu-title",
								children: "Provider Usage"
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: "pu-count",
								"aria-label": "已显示 " + String(visible.length) + " / 可查询 " + String(props.providers.length),
								children: String(visible.length) + " / " + String(props.providers.length)
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: "pu-actions",
								children: [(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "pu-icon-btn",
									"aria-label": "选择侧栏显示的 Provider",
									"aria-expanded": filterOpen,
									title: "选择显示的 Provider",
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
									title: "刷新全部",
									onClick: props.onRefresh,
									children: (0, react_jsx_runtime.jsxs)("svg", {
										viewBox: "0 0 20 20",
										"aria-hidden": "true",
										children: [(0, react_jsx_runtime.jsx)("path", { d: "M16.2 7A6.5 6.5 0 1 0 16 13.5" }), (0, react_jsx_runtime.jsx)("path", { d: "M16.2 3.8V7H13" })]
									})
								})]
							})
						]
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: "pu-scroll",
						children: body
					}),
					filterOpen ? (0, react_jsx_runtime.jsxs)("section", {
						className: "pu-popover",
						role: "dialog",
						"aria-label": "侧栏显示",
						onKeyDown: (event) => {
							if (event.key === "Escape") setFilterOpen(false);
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
								children: [
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "pu-filter-item pu-filter-all",
										disabled: allVisible,
										onClick: props.onShowAll,
										children: "显示全部 " + String(props.providers.length) + " 个"
									}),
									matches.map((summary) => (0, react_jsx_runtime.jsxs)("label", {
										className: "pu-filter-item",
										children: [
											(0, react_jsx_runtime.jsx)("input", {
												type: "checkbox",
												"aria-label": "在侧栏显示 " + summary.name,
												checked: !hidden.has(summary.providerKey),
												onChange: (event) => {
													props.onToggleVisibility(summary.providerKey, event.target.checked);
												}
											}),
											(0, react_jsx_runtime.jsx)("span", {
												className: "pu-icon",
												"aria-hidden": true,
												children: providerInitial(summary.name)
											}),
											(0, react_jsx_runtime.jsx)("span", {
												className: "pu-filter-name",
												children: summary.name
											})
										]
									}, summary.providerKey)),
									matches.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
										className: "pu-no-match",
										children: "没有匹配的 Provider"
									}) : null
								]
							})
						]
					}) : null
				]
			});
		}
		//#endregion
		//#region lib/types/client/usage.js
		/** Secret-free subscription usage readers and an abortable sidebar store. */
		function record(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value) ? value : void 0;
		}
		const SECRET_KEY = /^(?:accessToken|refreshToken|access_token|refresh_token|id_token|idToken|token|apiKey|api_key)$/iu;
		/** Reject any secret-shaped field before a provider response enters UI state. */
		function secretFree(value) {
			if (Array.isArray(value)) return value.every(secretFree);
			const item = record(value);
			if (item === void 0) return true;
			return Object.entries(item).every(([key, child]) => !SECRET_KEY.test(key) && secretFree(child));
		}
		function nonEmptyString(value) {
			return typeof value === "string" && value.length > 0;
		}
		function finiteNumber(value) {
			return typeof value === "number" && Number.isFinite(value);
		}
		function nonNegativeNumber(value) {
			return finiteNumber(value) && value >= 0;
		}
		function displayNumber(value) {
			return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
		}
		function percentage(value) {
			return Math.round(Math.max(0, Math.min(100, value)) * 10) / 10;
		}
		function percentageText(value) {
			return displayNumber(percentage(value)) + "%";
		}
		const SHORT_LABELS = [
			[/five|5h|5-hour/u, "5h"],
			[/two-hour|2-hour|2h/u, "2h"],
			[/session/u, "S"],
			[/week/u, "W"],
			[/month/u, "M"],
			[/credit/u, "Cr"],
			[/agent/u, "A"],
			[/daily|day/u, "D"],
			[/local/u, "L"],
			[/other/u, "Oth"]
		];
		function shortLabel(value) {
			const normalized = value.toLowerCase();
			if (/^\d+h$/u.test(normalized)) return normalized;
			return SHORT_LABELS.find(([pattern]) => pattern.test(normalized))?.[1] ?? value.slice(0, 4);
		}
		function windowLabel(id, period) {
			return nonEmptyString(period) ? period : id;
		}
		function remainingWindow(input) {
			const remaining = input.limit === 0 ? void 0 : percentage(100 * (1 - input.used / input.limit));
			return {
				id: input.id,
				label: input.label,
				shortLabel: shortLabel(input.label),
				...remaining === void 0 ? { valueText: displayNumber(Math.max(0, input.limit - input.used)) + " / " + displayNumber(input.limit) } : {
					remainingPercent: remaining,
					valueText: percentageText(remaining)
				},
				...input.resetsAt === void 0 ? {} : { resetsAt: input.resetsAt }
			};
		}
		function usageResult(value, decode) {
			const response = record(value);
			if (response === void 0 || !secretFree(response)) return {
				status: "error",
				message: "malformed usage response"
			};
			if (response.status === "unsupported") return { status: "unsupported" };
			if (response.status === "logged-out") return { status: "logged-out" };
			if (response.status !== "ok") return {
				status: "error",
				message: "unknown usage status"
			};
			const usage = record(response.usage);
			const decoded = usage === void 0 ? void 0 : decode(usage);
			return decoded === void 0 ? {
				status: "error",
				message: "malformed usage response"
			} : {
				status: "ready",
				...decoded
			};
		}
		function decodePercentUsage(usage) {
			if (!nonEmptyString(usage.fetchedAt) || !Array.isArray(usage.windows) || usage.windows.length === 0) return void 0;
			const viewReset = usage.resetsAt;
			if (viewReset !== void 0 && !nonEmptyString(viewReset)) return void 0;
			const windows = [];
			for (const value of usage.windows) {
				const item = record(value);
				if (item === void 0 || !nonEmptyString(item.id) || !nonNegativeNumber(item.used) || !nonNegativeNumber(item.limit)) return void 0;
				if (item.period !== void 0 && !nonEmptyString(item.period)) return void 0;
				if (item.unit !== void 0 && item.unit !== "percent") return void 0;
				if (item.resetsAt !== void 0 && !nonEmptyString(item.resetsAt)) return void 0;
				const resetsAt = item.resetsAt ?? viewReset;
				windows.push(remainingWindow({
					id: item.id,
					label: windowLabel(item.id, item.period),
					used: item.used,
					limit: item.unit === "percent" ? 100 : item.limit,
					...resetsAt === void 0 ? {} : { resetsAt }
				}));
			}
			return {
				fetchedAt: usage.fetchedAt,
				windows
			};
		}
		function decodeFractionUsage(keys, usage) {
			if (!nonEmptyString(usage.fetchedAt)) return void 0;
			const windows = [];
			for (const key of keys) {
				const value = usage[key];
				if (value === void 0) continue;
				const item = record(value);
				if (item === void 0 || !nonNegativeNumber(item.usage)) return void 0;
				if (item.resetsAt !== void 0 && !nonEmptyString(item.resetsAt)) return void 0;
				windows.push(remainingWindow({
					id: key,
					label: key === "session" ? "Session" : key === "weekly" ? "Week" : "Month",
					used: item.usage,
					limit: 1,
					...item.resetsAt === void 0 ? {} : { resetsAt: item.resetsAt }
				}));
			}
			return {
				fetchedAt: usage.fetchedAt,
				windows
			};
		}
		function decodeCommandCodeUsage(usage) {
			if (!nonEmptyString(usage.fetchedAt)) return void 0;
			if (usage.failures !== void 0 && (!Array.isArray(usage.failures) || usage.failures.some((item) => typeof item !== "string"))) return void 0;
			const credits = usage.credits;
			if (credits === void 0) return {
				fetchedAt: usage.fetchedAt,
				windows: []
			};
			const value = record(credits);
			if (value === void 0) return void 0;
			const windows = [];
			const monthly = value.monthlyCredits;
			if (monthly !== void 0) {
				if (!nonNegativeNumber(monthly)) return void 0;
				windows.push({
					id: "monthly-credits",
					label: "Credits",
					shortLabel: "Cr",
					valueText: displayNumber(monthly)
				});
			}
			for (const [key, label] of [["fiveHour", "5-hour"], ["weekly", "Week"]]) {
				const raw = value[key];
				if (raw === void 0) continue;
				const item = record(raw);
				if (item === void 0 || !nonNegativeNumber(item.used) || !nonNegativeNumber(item.cap)) return void 0;
				if (item.resetAt !== void 0 && !nonEmptyString(item.resetAt)) return void 0;
				windows.push(remainingWindow({
					id: key,
					label,
					used: item.used,
					limit: item.cap,
					...item.resetAt === void 0 ? {} : { resetsAt: item.resetAt }
				}));
			}
			return windows.length === 0 ? void 0 : {
				fetchedAt: usage.fetchedAt,
				windows
			};
		}
		function codexWindowLabel(seconds) {
			if (seconds === 18e3) return "5h";
			if (seconds === 604800) return "Week";
			const hours = seconds / 3600;
			return Number.isInteger(hours) ? String(hours) + "h" : "Usage";
		}
		function decodeCodexAuthStatus(value) {
			const response = record(value);
			if (response === void 0 || !secretFree(response)) return {
				status: "error",
				message: "malformed usage response"
			};
			if (response.status === "signed-out" || response.status === "signing-in" || response.status === "reauth-required") return { status: "logged-out" };
			if (response.status !== "signed-in") return {
				status: "error",
				message: "Codex usage unavailable"
			};
			if (response.quotaError !== void 0) return nonEmptyString(response.quotaError) ? {
				status: "error",
				message: response.quotaError
			} : {
				status: "error",
				message: "malformed usage response"
			};
			const usage = record(response.usage);
			if (usage === void 0 || !Array.isArray(usage.rateLimits)) return {
				status: "error",
				message: "malformed usage response"
			};
			const windows = [];
			for (const rateLimitValue of usage.rateLimits) {
				const rateLimit = record(rateLimitValue);
				if (rateLimit === void 0 || !nonEmptyString(rateLimit.id) || !Array.isArray(rateLimit.windows)) return {
					status: "error",
					message: "malformed usage response"
				};
				if (rateLimit.name !== void 0 && !nonEmptyString(rateLimit.name)) return {
					status: "error",
					message: "malformed usage response"
				};
				for (const [index, windowValue] of rateLimit.windows.entries()) {
					const quotaWindow = record(windowValue);
					if (quotaWindow === void 0 || !nonNegativeNumber(quotaWindow.remainingPercent) || quotaWindow.remainingPercent > 100 || !nonNegativeNumber(quotaWindow.windowSeconds) || quotaWindow.windowSeconds === 0) return {
						status: "error",
						message: "malformed usage response"
					};
					if (quotaWindow.resetsAt !== void 0 && !nonEmptyString(quotaWindow.resetsAt)) return {
						status: "error",
						message: "malformed usage response"
					};
					const duration = codexWindowLabel(quotaWindow.windowSeconds);
					const label = rateLimit.name === void 0 || rateLimit.windows.length === 1 ? rateLimit.name ?? duration : rateLimit.name + " · " + duration;
					windows.push({
						id: rateLimit.id + "-" + String(index),
						label,
						shortLabel: shortLabel(duration),
						remainingPercent: percentage(quotaWindow.remainingPercent),
						valueText: percentageText(quotaWindow.remainingPercent),
						...quotaWindow.resetsAt === void 0 ? {} : { resetsAt: quotaWindow.resetsAt }
					});
				}
			}
			const credits = record(usage.credits);
			if (usage.credits !== void 0 && (credits === void 0 || typeof credits.unlimited !== "boolean" || credits.balance !== void 0 && !nonEmptyString(credits.balance))) return {
				status: "error",
				message: "malformed usage response"
			};
			if (credits !== void 0) windows.push({
				id: "credits",
				label: "Credits",
				shortLabel: "Cr",
				valueText: credits.unlimited ? "Unlimited" : String(credits.balance ?? "Credits")
			});
			const individual = record(usage.individualLimit);
			if (usage.individualLimit !== void 0 && individual === void 0) return {
				status: "error",
				message: "malformed usage response"
			};
			if (individual !== void 0) {
				const remainingPercent = individual.remainingPercent;
				const remainingText = individual.remaining;
				if (!nonNegativeNumber(remainingPercent) || remainingPercent > 100 || !nonEmptyString(remainingText)) return {
					status: "error",
					message: "malformed usage response"
				};
				if (credits === void 0) windows.push({
					id: "individual",
					label: "Credits",
					shortLabel: "Cr",
					remainingPercent: percentage(remainingPercent),
					valueText: remainingText
				});
			}
			return {
				status: "ready",
				fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
				windows
			};
		}
		async function readCodexUsage(rpc, signal) {
			const result = await rpc.call("/codex", "auth/status", {}, signal);
			return result.ok ? decodeCodexAuthStatus(result.value) : {
				status: "error",
				message: result.error.message
			};
		}
		async function readUsage(rpc, channel, payload, signal, decode) {
			const result = await rpc.call(channel, "usage/read", payload, signal);
			return result.ok ? usageResult(result.value, decode) : {
				status: "error",
				message: result.error.message
			};
		}
		const readerByKey = new Map([
			{
				providerKey: "llm-codex",
				name: "Codex",
				read: (rpc, _refresh, signal) => readCodexUsage(rpc, signal)
			},
			{
				providerKey: "llm-cursor",
				name: "Cursor",
				read: (rpc, refresh, signal) => readUsage(rpc, "/cursor", refresh ? { refresh: true } : {}, signal, decodePercentUsage)
			},
			{
				providerKey: "llm-grok",
				name: "Grok",
				read: (rpc, _refresh, signal) => readUsage(rpc, "/grok", {}, signal, decodePercentUsage)
			},
			{
				providerKey: "llm-ollama",
				name: "Ollama Cloud",
				read: (rpc, _refresh, signal) => readUsage(rpc, "/ollama-cloud", {}, signal, (value) => decodeFractionUsage(["session", "weekly"], value))
			},
			{
				providerKey: "llm-commandcode",
				name: "CommandCode",
				read: (rpc, _refresh, signal) => readUsage(rpc, "/commandcode", {}, signal, decodeCommandCodeUsage)
			},
			{
				providerKey: "llm-opencode-go",
				name: "OpenCode Go",
				read: (rpc, _refresh, signal) => readUsage(rpc, "/opencode-go", {}, signal, (value) => decodeFractionUsage([
					"session",
					"weekly",
					"monthly"
				], value))
			}
		].map((reader) => [reader.providerKey, reader]));
		function hasUsageData(summary) {
			return summary !== void 0 && summary.windows.length > 0 && (summary.status === "ready" || summary.status === "stale");
		}
		/** External store: one request per visible Provider, stale data survives failures, and dispose aborts every request. */
		function createProviderUsageStore(rpc) {
			let snapshot = {
				providers: [],
				hiddenKeys: [],
				refreshing: false
			};
			let configuredKeys = [];
			const current = /* @__PURE__ */ new Map();
			const active = /* @__PURE__ */ new Map();
			const listeners = /* @__PURE__ */ new Set();
			let disposed = false;
			let refreshGeneration = 0;
			const notify = () => {
				for (const listener of listeners) listener();
			};
			const publish = () => {
				snapshot = {
					providers: configuredKeys.map((key) => current.get(key)).filter((item) => item !== void 0),
					hiddenKeys: [...snapshot.hiddenKeys],
					refreshing: active.size > 0
				};
				notify();
			};
			const read = (key, refresh) => {
				const reader = readerByKey.get(key);
				if (reader === void 0 || active.has(key) || disposed) return;
				const previous = current.get(key);
				if (previous === void 0 || !hasUsageData(previous)) {
					current.set(key, {
						providerKey: key,
						name: reader.name,
						status: "loading",
						windows: []
					});
					publish();
				}
				const controller = new AbortController();
				active.set(key, controller);
				const generation = refreshGeneration;
				reader.read(rpc, refresh, controller.signal).then((result) => {
					if (disposed || controller.signal.aborted || generation !== refreshGeneration) return;
					const old = current.get(key);
					const next = result.status === "ready" ? {
						providerKey: key,
						name: reader.name,
						status: "ready",
						fetchedAt: result.fetchedAt,
						windows: result.windows
					} : result.status === "error" && hasUsageData(old) ? {
						...old,
						status: "stale"
					} : {
						providerKey: key,
						name: reader.name,
						status: result.status,
						windows: []
					};
					current.set(key, next);
				}).catch(() => {
					if (disposed || controller.signal.aborted || generation !== refreshGeneration) return;
					const old = current.get(key);
					current.set(key, hasUsageData(old) ? {
						...old,
						status: "stale"
					} : {
						providerKey: key,
						name: reader.name,
						status: "error",
						windows: []
					});
				}).finally(() => {
					if (active.get(key) === controller) active.delete(key);
					if (!disposed) publish();
				});
			};
			const sync = (refresh = false) => {
				for (const key of configuredKeys) if (!snapshot.hiddenKeys.includes(key)) read(key, refresh);
				publish();
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
					const ordered = applySavedOrder(config.registeredKeys, config.savedOrder).filter((key) => readerByKey.has(key));
					configuredKeys = [...new Set(ordered)];
					snapshot = {
						...snapshot,
						hiddenKeys: [...new Set(config.hiddenKeys)]
					};
					for (const [key, controller] of active) if (!configuredKeys.includes(key) || snapshot.hiddenKeys.includes(key)) {
						controller.abort();
						active.delete(key);
					}
					for (const key of [...current.keys()]) if (!configuredKeys.includes(key)) current.delete(key);
					for (const key of configuredKeys) if (!current.has(key)) {
						const reader = readerByKey.get(key);
						if (reader !== void 0) current.set(key, {
							providerKey: key,
							name: reader.name,
							status: "loading",
							windows: []
						});
					}
					sync();
				},
				refresh: () => {
					refreshGeneration += 1;
					for (const controller of active.values()) controller.abort();
					active.clear();
					for (const key of configuredKeys) if (!snapshot.hiddenKeys.includes(key)) {
						const reader = readerByKey.get(key);
						const previous = current.get(key);
						if (reader !== void 0 && !hasUsageData(previous)) current.set(key, {
							providerKey: key,
							name: reader.name,
							status: "loading",
							windows: []
						});
					}
					sync(true);
				},
				dispose: () => {
					disposed = true;
					for (const controller of active.values()) controller.abort();
					active.clear();
					listeners.clear();
					current.clear();
					configuredKeys = [];
				}
			};
		}
		//#endregion
		//#region lib/types/client/usage-action.js
		/** Mounts the Provider Usage store into the sidebar footer slot. */
		function currentProviderKey(state) {
			const currentSessionId = state.current;
			if (currentSessionId === void 0) return void 0;
			const provider = (state.byId[currentSessionId]?.projectionValues?.modelSelection)?.next?.provider;
			return provider === void 0 ? void 0 : providerKeyForRoute(provider);
		}
		function ProviderUsageAction(props) {
			const usage = (0, react.useSyncExternalStore)(props.usage.subscribe, props.usage.getSnapshot, props.usage.getSnapshot);
			const activeProviderKey = props.useSessions(currentProviderKey);
			if (!props.wide) return null;
			return (0, react_jsx_runtime.jsx)(ProviderUsagePanel, {
				providers: usage.providers,
				hiddenKeys: usage.hiddenKeys,
				...activeProviderKey === void 0 ? {} : { currentProviderKey: activeProviderKey },
				refreshing: usage.refreshing,
				onRefresh: props.usage.refresh,
				onToggleVisibility: props.toggleVisibility,
				onShowAll: props.showAll
			});
		}
		function providerKeys(ctx) {
			return ctx.slots.entriesOfSlot(PROVIDERS_ITEM_SLOT).map((entry) => entry.options.key).filter((key) => key !== void 0 && key.length > 0);
		}
		/** Install one root-scoped footer action and keep it synchronized with provider/settings slots. */
		function installProviderUsage(ctx, orderScope) {
			let connection;
			try {
				const candidate = ctx.get("connection");
				if (candidate === void 0 || candidate === null || typeof candidate !== "object" || !("rpc" in candidate)) return () => {};
				connection = candidate;
			} catch {
				return () => {};
			}
			const usage = createProviderUsageStore(connection.rpc);
			let lastConfig = "";
			const reconcile = () => {
				const settings = orderScope.getSnapshot();
				const keys = providerKeys(ctx);
				const order = settings.value?.order ?? [];
				const hidden = settings.value?.hiddenUsageProviders ?? [];
				const config = JSON.stringify([
					keys,
					order,
					hidden
				]);
				if (config === lastConfig) return;
				lastConfig = config;
				usage.configure({
					registeredKeys: keys,
					savedOrder: order,
					hiddenKeys: hidden
				});
			};
			const writeHidden = (hidden) => {
				const settings = orderScope.getSnapshot();
				if (settings.status !== "ready" || !settings.writable) return;
				orderScope.set("hiddenUsageProviders", [...new Set(hidden)]).catch((error) => {
					console.warn("[dsh-llm-providers-ui] failed to save Provider Usage visibility", error);
				});
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
			reconcile();
			const action = ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
				name: "sidebar.footer.action",
				id: "llm-providers-usage",
				order: 0,
				inject: () => ({
					usage,
					toggleVisibility,
					showAll
				})
			}, ProviderUsageAction));
			const stopSlot = ctx.slots.subscribe(PROVIDERS_ITEM_SLOT, reconcile);
			const stopSettings = orderScope.subscribe(reconcile);
			return () => {
				disposeReverse([
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
					disposers.push(installProviderUsage(ctx, orderScope));
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
