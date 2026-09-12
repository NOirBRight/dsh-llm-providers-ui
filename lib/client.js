window.__ModuleLoader__.load({
	id: "dsh-llm-providers-ui",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
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
				usageOrder: [],
				showSidebarUsage: true
			};
			const record = value;
			return {
				order: decodeStringList(record.order),
				hiddenUsageProviders: decodeStringList(record.hiddenUsageProviders),
				usageOrder: decodeStringList(record.usageOrder),
				showSidebarUsage: record.showSidebarUsage !== false
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
		//#region lib/types/client/provider-section.js
		/** Shared Settings > LLM Providers section. The dsh-llm-providers-ui client owns the nav row. */
		/**
		* Canonical window wording, shared by the overview rows and the detail quota block:
		* "Monthly", "Cursor Models · Monthly" and "M" all read as the same full phrase.
		* @param label - the provider-supplied window label.
		* @param names - the locale's canonical hour/week/month phrases.
		* @returns the label to display.
		*/
		function windowNameOf(label, names) {
			const canonical = (token) => {
				const value = token.trim().toLowerCase();
				if (/^(?:5h|5 h|5-hour|5 hour|hour|hourly)$/u.test(value)) return names.hour;
				if (/^(?:w|wk|week|weekly)$/u.test(value)) return names.week;
				if (/^(?:m|mo|month|monthly)$/u.test(value)) return names.month;
			};
			const trimmed = label.trim();
			const direct = canonical(trimmed);
			if (direct !== void 0) return direct;
			const parts = trimmed.split("·");
			const mapped = canonical(parts.at(-1)?.trim() ?? "");
			if (mapped !== void 0 && parts.length > 1) return [...parts.slice(0, -1).map((part) => part.trim()), mapped].join(" · ");
			return trimmed;
		}
		/** Locale copy: empty state names all six providers. */
		const copy = {
			zh: {
				nav: "LLM 供应商",
				title: "LLM 供应商",
				subtitle: "先看账户额度，再进入独立详情页配置。",
				empty: "安装 Cursor、Grok、Codex、Ollama Cloud、CommandCode 或 OpenCode Go 后，在这里连接账号并选择模型。",
				drag: "拖动排序",
				sort: "Provider 排序",
				done: "完成",
				modelCount: "{n} 个模型",
				moveUp: "上移",
				moveDown: "下移",
				sidebarToggle: "在侧边栏显示",
				sidebarToggleHint: "仅控制 Task Panel 的额度区域",
				filterAll: "全部",
				filterLlm: "LLM",
				filterAgent: "Agent",
				details: "详情",
				overview: "返回总览",
				connected: "已连接",
				configured: "已配置",
				unconnected: "未连接",
				connectedCount: "已连接的 Provider",
				connectedHint: "额度属于各自账户，不合并统计，也不互相替代。",
				colProvider: "Provider / 连接状态",
				colQuota: "主要窗口 · 剩余额度",
				windowHour: "5 小时窗口",
				windowWeek: "每周窗口",
				windowMonth: "每月窗口",
				colConfig: "配置",
				systemZone: "系统时区",
				breadcrumbOverview: "额度总览",
				quotaHeading: "剩余额度",
				quotaMeta: "账户剩余额度 · 各窗口独立计量",
				connectToSee: "连接后查看额度",
				unsupportedQuota: "暂不支持额度查询",
				loadingQuota: "正在读取额度…",
				errorQuota: "额度读取失败",
				resetAt: "重置于 ",
				resetOverdue: "已到期，等待更新 · ",
				resetMissing: "{period} · 重置时间未提供",
				refresh: "刷新",
				refreshing: "刷新中",
				accountHeading: "账号与连接",
				advancedHeading: "高级设置",
				advancedNote: "可选能力与工具",
				accountOauthMeta: "订阅授权，不使用 API Key",
				accountApiMeta: "API Key · 不会回显已保存的密钥",
				expandAll: "全部展开",
				collapseAll: "全部收起",
				modelIdLabel: "Model ID",
				modelNameLabel: "显示名称",
				addModelLabel: "手动添加模型",
				removeModelLabel: "删除",
				dragModelLabel: "拖动排序",
				modelsHeading: "模型",
				modelsCount: "{n} 个",
				modelsHint: "名称和 ID 始终显示；展开箭头查看容量与能力参数。",
				sortModels: "排序",
				chooseFromAccount: "从账户目录选取",
				addModel: "手动添加模型"
			},
			en: {
				nav: "LLM Providers",
				title: "LLM Providers",
				subtitle: "Review account quota, then open an independent detail page to configure.",
				empty: "Install Cursor, Grok, Codex, Ollama Cloud, CommandCode, or OpenCode Go to connect an account and pick models here.",
				drag: "Reorder",
				sort: "Sort providers",
				done: "Done",
				modelCount: "{n} models",
				moveUp: "Move up",
				moveDown: "Move down",
				sidebarToggle: "Show in sidebar",
				sidebarToggleHint: "Only the Task Panel quota block",
				filterAll: "All",
				filterLlm: "LLM",
				filterAgent: "Agent",
				details: "Details",
				overview: "Back to overview",
				connected: "Connected",
				configured: "Configured",
				unconnected: "Not connected",
				connectedCount: "Connected providers",
				connectedHint: "Quota belongs to each account. Totals are not merged.",
				colProvider: "Provider / connection",
				colQuota: "Primary window · remaining",
				windowHour: "5-hour window",
				windowWeek: "Weekly window",
				windowMonth: "Monthly window",
				colConfig: "Setup",
				systemZone: "System time zone",
				breadcrumbOverview: "Quota overview",
				quotaHeading: "Remaining quota",
				quotaMeta: "Account remaining · each window is independent",
				connectToSee: "Connect to see quota",
				unsupportedQuota: "Quota is not available",
				loadingQuota: "Reading quota…",
				errorQuota: "Could not read quota",
				resetAt: "Resets ",
				resetOverdue: "Expired, waiting for update · ",
				resetMissing: "{period} · reset time not provided",
				refresh: "Refresh",
				refreshing: "Refreshing",
				accountHeading: "Account",
				advancedHeading: "Advanced",
				advancedNote: "Optional capabilities",
				accountOauthMeta: "Subscription · no API key",
				accountApiMeta: "API Key · saved keys are never echoed",
				expandAll: "Expand all",
				collapseAll: "Collapse all",
				modelIdLabel: "Model ID",
				modelNameLabel: "Display name",
				addModelLabel: "Add model manually",
				removeModelLabel: "Remove",
				dragModelLabel: "Reorder",
				modelsHeading: "Models",
				modelsCount: "{n}",
				modelsHint: "Names and IDs always show; expand a row for capacity and capability parameters.",
				sortModels: "Sort",
				chooseFromAccount: "Choose from account",
				addModel: "Add model manually"
			}
		};
		//#endregion
		//#region lib/types/usage-readers.js
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
		/** Headline window: longest remaining-percent period. Text-only windows are skipped. */
		function pickPrimaryWindow(windows) {
			let best;
			for (const quotaWindow of windows) {
				if (quotaWindow.remainingPercent === void 0) continue;
				if (best === void 0 || periodRank(quotaWindow.shortLabel) > periodRank(best.shortLabel)) best = quotaWindow;
			}
			if (best !== void 0 && best.remainingPercent === 100 && !nonEmptyString(best.resetsAt)) {
				let fallback;
				for (const quotaWindow of windows) {
					if (quotaWindow === best || !nonEmptyString(quotaWindow.resetsAt) || quotaWindow.remainingPercent === void 0) continue;
					if (fallback === void 0 || periodRank(quotaWindow.shortLabel) > periodRank(fallback.shortLabel)) fallback = quotaWindow;
				}
				if (fallback !== void 0) return fallback;
			}
			return best;
		}
		function formatRemainingDuration(ms) {
			const rtf = new Intl.RelativeTimeFormat(void 0, { numeric: "always" });
			const days = Math.round(ms / 864e5);
			if (Math.abs(days) >= 1) return rtf.format(days, "day");
			const hours = Math.round(ms / 36e5);
			if (Math.abs(hours) >= 1) return rtf.format(hours, "hour");
			const minutes = Math.max(1, Math.round(Math.abs(ms) / 6e4));
			return rtf.format(ms < 0 ? -minutes : minutes, "minute");
		}
		function parseResetTime(resetsAt) {
			if (/^\d{4}-\d{2}-\d{2}/u.test(resetsAt)) {
				const iso = Date.parse(resetsAt);
				return Number.isFinite(iso) ? iso : void 0;
			}
			if (!/^\d{10,}$/u.test(resetsAt)) return void 0;
			const n = Number(resetsAt);
			if (!Number.isFinite(n) || n <= 0) return void 0;
			return n < 0xe8d4a51000 ? n * 1e3 : n;
		}
		/** System-zone instant for a reset ISO. Language copy stays in the UI. */
		function formatResetInstant(resetsAt) {
			if (!nonEmptyString(resetsAt)) return void 0;
			const time = parseResetTime(resetsAt);
			if (time === void 0) return void 0;
			const delta = time - Date.now();
			if (delta < -3456e7 || delta > 6912e7) return void 0;
			return {
				when: new Intl.DateTimeFormat(void 0, {
					dateStyle: "short",
					timeStyle: "short"
				}).format(new Date(time)),
				overdue: delta <= 0,
				relative: formatRemainingDuration(delta)
			};
		}
		/** Compose a reset caption. Missing ISO never becomes a fake calendar date. */
		function formatResetLabel(resetsAt, period, copy) {
			const instant = formatResetInstant(resetsAt);
			if (instant !== void 0) return ((copy === void 0 ? "" : instant.overdue ? copy.overdue : copy.at) + instant.when + " · " + instant.relative).replace(/^ · /, "");
			if (nonEmptyString(resetsAt) && /reset|重置/iu.test(resetsAt)) return resetsAt;
			if (period === void 0 || period.length === 0) return void 0;
			return copy === void 0 ? period : copy.missing.replace("{period}", period);
		}
		const USAGE_CACHE_KEY = "dsh-llm-providers-ui:usage-cache";
		/**
		* Browser last-good usage cache shared across bundles: the sidebar store and
		* each provider Settings card bundle their own copy of this module, so the
		* module-level memory map below is per-bundle while storage is shared.
		* Readable storage is authoritative, including empty after invalidation; memory
		* is only a fallback while storage is unavailable. Stale status persists
		* honestly, and collapsed-header headlines never replace a full multi-window
		* summary (a later full read upgrades a headline).
		*/
		let memoryUsageCache = /* @__PURE__ */ new Map();
		/** Whether a ready or stale summary retains displayable usage windows.
		* @param summary - Current or retained provider usage.
		* @returns Whether its windows can be displayed and persisted.
		*/
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
				status,
				windows,
				...nonEmptyString(item.fetchedAt) ? { fetchedAt: item.fetchedAt } : {}
			};
		}
		/** Readable storage backends. A backend that throws on read is unusable and skipped. */
		function usageStorageBackends() {
			const backends = [];
			for (const name of ["localStorage", "sessionStorage"]) try {
				const backend = globalThis[name];
				if (backend === void 0 || backend === null) continue;
				backend.getItem(USAGE_CACHE_KEY);
				backends.push(backend);
			} catch {}
			return backends;
		}
		function storageRead() {
			const backends = usageStorageBackends();
			if (backends.length === 0) return {
				available: false,
				raw: null
			};
			for (const backend of backends) try {
				const raw = backend.getItem(USAGE_CACHE_KEY);
				if (raw !== null) return {
					available: true,
					raw
				};
			} catch {}
			return {
				available: true,
				raw: null
			};
		}
		function storageWrite(value) {
			for (const backend of usageStorageBackends()) try {
				backend.setItem(USAGE_CACHE_KEY, value);
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
			const { available, raw } = storageRead();
			if (!available) return new Map(memoryUsageCache);
			const fromStorage = parseUsageCache(raw);
			memoryUsageCache = new Map(fromStorage);
			return fromStorage;
		}
		/** Persistable copy: status stays ready/stale as the caller holds it, never laundered to ready. */
		function persistableUsage(summary) {
			return {
				providerKey: summary.providerKey,
				name: summary.name,
				status: summary.status,
				windows: summary.windows,
				...summary.fetchedAt === void 0 ? {} : { fetchedAt: summary.fetchedAt }
			};
		}
		/** A collapsed-header single window, never a full multi-window summary. */
		function isHeadlineOnly(summary) {
			return summary.windows.length === 1 && summary.windows[0]?.id === "headline";
		}
		function writeUsageCache(current) {
			const entries = [...current.values()].filter(hasUsageData);
			const { available, raw } = storageRead();
			if (!available) {
				for (const item of entries) memoryUsageCache.set(item.providerKey, persistableUsage(item));
				return;
			}
			const merged = parseUsageCache(raw);
			for (const item of entries) {
				const previous = merged.get(item.providerKey);
				if (previous !== void 0 && !isHeadlineOnly(previous) && isHeadlineOnly(item)) continue;
				merged.set(item.providerKey, persistableUsage(item));
			}
			memoryUsageCache = new Map(merged);
			if (merged.size === 0) return;
			storageWrite(JSON.stringify([...merged.values()]));
		}
		function dropPersistedUsageKeys(keys) {
			const drop = new Set(keys);
			for (const key of drop) memoryUsageCache.delete(key);
			const { available, raw } = storageRead();
			if (!available || raw === null) return;
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
			storageWrite(JSON.stringify(kept));
		}
		//#endregion
		//#region lib/types/client/usage.js
		/** Secret-free subscription usage readers and an abortable sidebar store. */
		const USAGE_POLL_MS = 9e5;
		const USAGE_READ_TIMEOUT_MS = 2e4;
		const USAGE_MAX_IN_FLIGHT = 3;
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
				const signedOut = configuredKeys.filter((key) => current.get(key)?.status === "logged-out");
				if (signedOut.length > 0) dropPersistedUsageKeys(signedOut);
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
					const persisted = readUsageCache();
					if (configuredKeys.length > 0) {
						for (const key of [...current.keys()]) if (!configuredKeys.includes(key)) current.delete(key);
					}
					for (const key of configuredKeys) {
						const existing = current.get(key);
						if (existing?.status === "logged-out" || hasUsageData(existing)) continue;
						const cached = persisted.get(key);
						if (hasUsageData(cached)) current.set(key, cached);
						else if (existing === void 0) {
							const reader = readerForKey(key);
							if (reader !== void 0) current.set(key, {
								providerKey: key,
								name: reader.name,
								status: "loading",
								windows: []
							});
						}
					}
					sync(false);
					startPoll();
				},
				refresh: (keys) => {
					const targets = visibleKeys(keys).filter((key) => {
						if (pending(key)) return false;
						const status = current.get(key)?.status;
						return status !== "logged-out" && status !== "unsupported";
					});
					if (targets.length === 0) return;
					sync(true, targets);
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
		//#region lib/types/client/provider-ui.js
		/**
		* Normalize remaining quota to a 0-100 percent value.
		* Valid readings keep their precision (99.9 stays 99.9, never rounds to 100).
		* NaN, Infinity, and out-of-range readings are unavailable, not clamped:
		* clamping would fabricate a full or empty bar from bad data.
		* @param input - percent and/or fraction quota reading.
		* @returns the 0-100 remaining value, or undefined when unavailable.
		*/
		function normalizeQuotaRemaining(input) {
			const percent = input.remainingPercent;
			if (percent !== void 0) return Number.isFinite(percent) && percent >= 0 && percent <= 100 ? percent : void 0;
			const fraction = input.remainingFraction;
			if (fraction !== void 0) return Number.isFinite(fraction) && fraction >= 0 && fraction <= 1 ? fraction * 100 : void 0;
		}
		const meterWrapStyle = {
			display: "flex",
			flexDirection: "column",
			gap: 5,
			minWidth: 0
		};
		const meterTopStyle = {
			display: "flex",
			alignItems: "baseline",
			justifyContent: "space-between",
			gap: 8
		};
		const meterLabelStyle = {
			minWidth: 0,
			overflow: "hidden",
			textOverflow: "ellipsis",
			whiteSpace: "nowrap",
			color: "var(--dsw-alias-label-secondary)",
			fontSize: 12,
			lineHeight: "18px"
		};
		const meterValueStyle = {
			flex: "none",
			fontVariantNumeric: "tabular-nums",
			fontWeight: 500,
			fontSize: 12,
			lineHeight: "18px",
			color: "var(--dsw-alias-label-primary)"
		};
		const meterTrackStyle = {
			display: "block",
			width: "100%",
			height: 6,
			overflow: "hidden",
			border: 0,
			borderRadius: 2,
			background: "color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent)",
			position: "relative"
		};
		const meterFillBase = {
			display: "block",
			height: "100%",
			borderRadius: 2,
			position: "relative",
			background: "color-mix(in srgb, var(--dsw-alias-label-primary) 55%, var(--dsw-alias-label-secondary))"
		};
		const meterKnobStyle = {
			position: "absolute",
			right: 0,
			top: 0,
			bottom: 0,
			width: 2,
			background: "var(--dsw-alias-label-primary)"
		};
		const meterSegmentsStyle = {
			position: "absolute",
			inset: 0,
			pointerEvents: "none",
			background: "repeating-linear-gradient(to right, transparent 0, transparent calc(10% - 1px), var(--dsw-alias-bg-layer-1) calc(10% - 1px), var(--dsw-alias-bg-layer-1) 10%)"
		};
		/** Approved A low-quota fill: amber only, no red tier, no hardcoded hue. */
		const meterWarnFill = { background: "var(--dsw-alias-state-warn-primary)" };
		const meterDetailStyle = {
			color: "var(--dsw-alias-label-tertiary)",
			fontSize: 11,
			lineHeight: "16px"
		};
		const meterMissingStyle = {
			color: "var(--dsw-alias-label-tertiary)",
			fontSize: 12,
			lineHeight: "18px"
		};
		/** Segmented remaining-quota meter. Unavailable quota renders a placeholder, never a zero bar. */
		function ProviderQuotaMeter(props) {
			const remaining = normalizeQuotaRemaining(props);
			const label = props.label ?? "Quota";
			if (remaining === void 0) return (0, react_jsx_runtime.jsx)("span", {
				"data-provider-quota-missing": "",
				style: meterMissingStyle,
				children: props.emptyLabel ?? "—"
			});
			const warn = remaining < 20;
			const text = String(remaining);
			return (0, react_jsx_runtime.jsxs)("span", {
				"data-provider-quota": "",
				style: meterWrapStyle,
				...props.id === void 0 ? {} : { id: props.id },
				children: [
					(0, react_jsx_runtime.jsxs)("span", {
						style: meterTopStyle,
						children: [(0, react_jsx_runtime.jsx)("span", {
							style: meterLabelStyle,
							children: label
						}), (0, react_jsx_runtime.jsx)("span", {
							style: meterValueStyle,
							children: text + "%"
						})]
					}),
					(0, react_jsx_runtime.jsxs)("span", {
						"data-provider-quota-meter": "",
						role: "meter",
						"aria-label": label,
						"aria-valuemin": 0,
						"aria-valuemax": 100,
						"aria-valuenow": remaining,
						style: meterTrackStyle,
						children: [(0, react_jsx_runtime.jsx)("span", {
							style: {
								...meterFillBase,
								...warn ? meterWarnFill : {},
								width: text + "%"
							},
							children: (0, react_jsx_runtime.jsx)("span", { style: meterKnobStyle })
						}), (0, react_jsx_runtime.jsx)("span", {
							"aria-hidden": "true",
							style: meterSegmentsStyle
						})]
					}),
					props.detail === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
						style: meterDetailStyle,
						children: props.detail
					})
				]
			});
		}
		const headerBadgeBase = {
			display: "inline-flex",
			alignItems: "center",
			gap: 4,
			whiteSpace: "nowrap",
			fontSize: 10,
			fontWeight: 500,
			lineHeight: "16px",
			padding: "0 5px",
			borderRadius: 3,
			border: "1px solid transparent"
		};
		const headerBadgeLlm = {
			color: "var(--dsw-alias-label-secondary)",
			borderColor: "var(--dsw-alias-border-l2)",
			background: "transparent"
		};
		const headerBadgeAgent = {
			color: "var(--dsw-alias-bg-layer-1)",
			borderColor: "var(--dsw-alias-label-primary)",
			background: "var(--dsw-alias-label-primary)"
		};
		/**
		* Monochrome role badge: outlined message glyph for LLM, filled terminal glyph
		* for Agent. Shared by migrated card headers and the shell legacy fallback.
		*/
		function ProviderRoleBadge(props) {
			const agent = (props.role ?? "llm") === "agent";
			return (0, react_jsx_runtime.jsxs)("span", {
				"data-provider-role-badge": agent ? "agent" : "llm",
				style: {
					...headerBadgeBase,
					...agent ? headerBadgeAgent : headerBadgeLlm
				},
				children: [(0, react_jsx_runtime.jsx)("svg", {
					viewBox: "0 0 16 16",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: 1.4,
					"aria-hidden": "true",
					children: agent ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("rect", {
						x: "1.5",
						y: "2",
						width: "13",
						height: "12",
						rx: "2"
					}), (0, react_jsx_runtime.jsx)("path", { d: "m4 5 3 3-3 3m5 0h3" })] }) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("rect", {
						x: "2",
						y: "2",
						width: "12",
						height: "9",
						rx: "3"
					}), (0, react_jsx_runtime.jsx)("path", { d: "m5 11-1 3 5-3M5 6h6" })] })
				}), agent ? "Agent" : "LLM"]
			});
		}
		/**
		* Scoped provider chrome CSS: plain card reset, header button layout, body and
		* model rows, quota meter responsive rules, and coarse-pointer touch targets.
		* The shell injects it once per page; provider cards may also inject it once
		* for standalone use. Duplicate style tags are harmless: every rule is scoped
		* to a data-provider-* attribute; shared geometry overrides legacy inline layout styles.
		*/
		const providerUiCss = [
			"[data-provider-card]{box-sizing:border-box;width:100%;min-width:0;list-style:none;margin:0!important;border:0!important;border-radius:0!important;background:none!important;box-shadow:none!important;overflow:visible}",
			"[data-provider-card-header]{box-sizing:border-box;width:100%;min-height:76px!important;display:flex;align-items:center;justify-content:space-between;gap:16px;border:0;padding:12px 14px!important;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;text-align:left;cursor:pointer}",
			"[data-provider-body][hidden]{display:none!important}",
			"[data-provider-role-badge] svg{width:12px;height:12px}",
			"[data-provider-card-header]:hover{background:color-mix(in srgb, var(--dsw-alias-label-primary) 4%, transparent)}",
			"[data-provider-body]{display:flex;flex-direction:column;gap:18px;border-top:1px solid var(--dsw-alias-border-l2);padding:16px 14px 18px}",
			"[data-provider-model]{display:flex;align-items:center;gap:9px;min-height:40px}",
			"[data-provider-quota-mini]{display:block}",
			"[data-providers-list]{display:flex;flex-direction:column}",
			"[data-providers-list] [data-sortable-row]+[data-sortable-row]{border-top:1px solid var(--dsw-alias-border-l2)}",
			"[data-providers-section]{container-type:inline-size}",
			"@media (max-width:680px){[data-provider-card-header]{min-height:106px!important;padding:17px 4px!important}[data-provider-header-main]{display:grid!important;grid-template-columns:minmax(0,1fr) auto;gap:7px 9px!important;align-items:center}[data-provider-header-identity]{grid-column:1;grid-row:1;gap:9px!important}[data-provider-header-mark]{width:25px!important;height:25px!important}[data-provider-role-badge]{margin-left:4px;font-size:9px!important}[data-provider-role-badge] svg{width:11px!important;height:11px!important}[data-provider-header-side]{grid-column:2;grid-row:1;justify-self:end}[data-provider-header-side] [data-provider-header-chevron]{width:18px}[data-provider-quota-mini]{grid-column:1;grid-row:2;width:auto!important;max-width:none!important;text-align:left;padding-left:34px!important}[data-provider-header-status]{grid-column:2;grid-row:2;width:auto!important;max-width:100px}[data-provider-model]{min-height:48px}[data-provider-model] input[type=checkbox]{width:17px;height:17px}[data-providers-section] button,[data-provider-card] button{min-height:44px}}",
			"@container (max-width:540px){[data-provider-card-header]{min-height:106px!important;padding:17px 4px!important}[data-provider-header-main]{display:grid!important;grid-template-columns:minmax(0,1fr) auto;gap:7px 9px!important;align-items:center}[data-provider-header-identity]{grid-column:1;grid-row:1;gap:9px!important}[data-provider-header-mark]{width:25px!important;height:25px!important}[data-provider-role-badge]{margin-left:4px;font-size:9px!important}[data-provider-role-badge] svg{width:11px!important;height:11px!important}[data-provider-header-side]{grid-column:2;grid-row:1;justify-self:end}[data-provider-header-side] [data-provider-header-chevron]{width:18px}[data-provider-quota-mini]{grid-column:1;grid-row:2;width:auto!important;max-width:none!important;text-align:left;padding-left:34px!important}[data-provider-header-status]{grid-column:2;grid-row:2;width:auto!important;max-width:100px}[data-provider-model]{min-height:48px}[data-provider-model] input[type=checkbox]{width:17px;height:17px}[data-providers-section] button,[data-provider-card] button{min-height:44px}}",
			"@media (pointer:coarse){[data-sortable-handle],[data-sortable-move]{min-width:44px;min-height:44px}}"
		].join("\n");
		//#endregion
		//#region lib/types/client/provider-marks.js
		function Svg(props) {
			return (0, react_jsx_runtime.jsxs)("svg", {
				className: "pu-logo",
				viewBox: props.viewBox,
				preserveAspectRatio: "xMidYMid meet",
				"aria-hidden": true,
				children: [
					" ",
					props.children,
					" "
				]
			});
		}
		const DEEPSEEK_FISH_PATH = "M22.9168 1.43018C22.6713 1.31018 22.5658 1.53918 22.4223 1.65519C22.3733 1.69269 22.3318 1.74169 22.2903 1.78669C21.9317 2.1697 21.5127 2.42121 20.9657 2.39121C20.1657 2.34621 19.4827 2.59771 18.8787 3.20973C18.7502 2.45521 18.3236 2.0047 17.6746 1.71569C17.3351 1.56568 16.9916 1.41518 16.7536 1.08867C16.5876 0.856163 16.5421 0.597155 16.4591 0.341647C16.4061 0.187643 16.3536 0.0301382 16.1761 0.00363739C15.9836 -0.0263635 15.9081 0.135141 15.8326 0.270145C15.5306 0.822162 15.4136 1.43018 15.4251 2.0462C15.4516 3.43174 16.0366 4.53527 17.1991 5.3203C17.3311 5.4103 17.3651 5.5003 17.3236 5.63181C17.2441 5.90231 17.1501 6.16482 17.0671 6.43533C17.0141 6.60784 16.9351 6.64584 16.7501 6.57033C16.1121 6.30383 15.5611 5.90931 15.074 5.4328C14.2475 4.63328 13.5 3.75075 12.568 3.05973C12.349 2.89822 12.13 2.74822 11.9034 2.60522C10.9524 1.68169 12.028 0.923165 12.277 0.833162C12.5375 0.739159 12.3675 0.41615 11.5259 0.42015C10.6844 0.42365 9.91439 0.705658 8.93286 1.08117C8.78935 1.13767 8.63835 1.17867 8.48384 1.21267C7.59332 1.04367 6.66829 1.00617 5.70226 1.11517C3.88321 1.31768 2.43016 2.1777 1.36213 3.64575C0.0790928 5.4103 -0.222916 7.41536 0.146595 9.50642C0.535106 11.7105 1.66014 13.535 3.38869 14.9616C5.18125 16.4406 7.24581 17.1657 9.60138 17.0266C11.0319 16.9441 12.6245 16.7526 14.421 15.2321C14.874 15.4576 15.3496 15.5476 16.1381 15.6151C16.7456 15.6716 17.3306 15.5851 17.7836 15.4911C18.4931 15.3411 18.4441 14.6841 18.1876 14.5636C16.1081 13.595 16.5646 13.9891 16.1496 13.67C17.2061 12.42 18.8202 10.1979 19.3182 7.17235C19.3672 6.83834 19.4297 6.36783 19.4222 6.09732C19.4182 5.93231 19.4562 5.86831 19.6447 5.84931C20.1657 5.78931 20.6712 5.64681 21.1357 5.3913C22.4833 4.65528 23.0268 3.44624 23.1548 1.9972C23.1738 1.77569 23.1508 1.54668 22.9168 1.43018ZM11.1749 14.4736C9.15936 12.889 8.18184 12.3675 7.77832 12.39C7.40081 12.4125 7.46881 12.8445 7.55182 13.126C7.63882 13.404 7.75182 13.5955 7.91033 13.8396C8.01983 14.0011 8.09533 14.2411 7.80083 14.4216C7.15181 14.8231 6.02327 14.2866 5.97027 14.2601C4.65673 13.4865 3.5587 12.4655 2.78467 11.069C2.03715 9.72493 1.60314 8.28289 1.53164 6.74384C1.51264 6.37233 1.62214 6.24082 1.99215 6.17332C2.47916 6.08332 2.98118 6.06432 3.46769 6.13582C5.52476 6.43633 7.27581 7.35586 8.74385 8.8129C9.58188 9.64243 10.2159 10.634 10.8689 11.6025C11.5634 12.631 12.3105 13.611 13.262 14.4146C13.598 14.6961 13.866 14.9101 14.1225 15.0681C13.349 15.1546 12.058 15.1731 11.1749 14.4746L11.1749 14.4736ZM12.141 8.25988C12.141 8.09488 12.273 7.96338 12.439 7.96338C12.4765 7.96338 12.5105 7.97088 12.541 7.98188C12.5825 7.99688 12.6205 8.01938 12.6505 8.05338C12.7035 8.10588 12.7335 8.18088 12.7335 8.25988C12.7335 8.42489 12.6015 8.55639 12.4355 8.55639C12.2695 8.55639 12.141 8.42489 12.141 8.25988ZM15.1415 9.79893C14.949 9.87793 14.7565 9.94544 14.5715 9.95294C14.2845 9.96794 13.9715 9.85143 13.8015 9.70893C13.5375 9.48742 13.3485 9.36342 13.2695 8.97691C13.2355 8.8119 13.2545 8.55639 13.2845 8.40989C13.3525 8.09438 13.277 7.89187 13.0545 7.70787C12.8735 7.55786 12.643 7.51636 12.39 7.51636C12.2955 7.51636 12.209 7.47486 12.1445 7.44136C12.039 7.38886 11.9519 7.25735 12.035 7.09585C12.0615 7.04335 12.19 6.91584 12.22 6.89334C12.5635 6.69784 12.9595 6.76184 13.326 6.90834C13.6655 7.04735 13.9225 7.30236 14.292 7.66287C14.6695 8.09838 14.7375 8.21838 14.9525 8.54539C15.1225 8.8009 15.277 9.06341 15.3831 9.36392C15.4471 9.55142 15.3641 9.70493 15.1415 9.79893Z";
		const GENERIC_GLOBE_PATH = "M7.00018 0.353516C10.6708 0.353535 13.6468 3.32958 13.6469 7.00018C13.6468 10.6708 10.6708 13.6468 7.00018 13.6469C3.32957 13.6468 0.353535 10.6708 0.353516 7.00018C0.353535 3.32957 3.32957 0.353531 7.00018 0.353516ZM5.44643 7.59661C5.49463 8.97506 5.70762 10.191 6.02136 11.0793C6.20141 11.5891 6.40328 11.9585 6.59898 12.1889C6.79501 12.4196 6.93213 12.454 7.00018 12.454C7.06822 12.454 7.20533 12.4197 7.40138 12.1889C7.59708 11.9585 7.79895 11.589 7.979 11.0793C8.29274 10.191 8.50574 8.97506 8.55394 7.59661H5.44643ZM1.57861 7.59661C1.80785 9.70467 3.2386 11.4509 5.1715 12.1388C5.07135 11.9317 4.97972 11.7098 4.89746 11.477C4.53084 10.4391 4.30224 9.0828 4.25357 7.59661H1.57861ZM9.74679 7.59661C9.69813 9.0828 9.46952 10.4391 9.1029 11.477C9.0206 11.7099 8.92818 11.9316 8.82797 12.1388C10.7613 11.4511 12.1925 9.70496 12.4218 7.59661H9.74679ZM5.1706 1.8616C3.23814 2.54963 1.80876 4.29604 1.5795 6.40376H4.25357C4.30224 4.91756 4.53083 3.56129 4.89746 2.5234C4.97968 2.29066 5.07051 2.0686 5.1706 1.8616ZM7.00018 1.54637C6.93213 1.54638 6.79503 1.5807 6.59898 1.81145C6.40332 2.04177 6.20139 2.41058 6.02136 2.92012C5.70754 3.80851 5.49461 5.02499 5.44643 6.40376H8.55394C8.50575 5.025 8.29282 3.80851 7.979 2.92012C7.79898 2.41059 7.59705 2.04177 7.40138 1.81145C7.20531 1.58067 7.06823 1.54637 7.00018 1.54637ZM8.82887 1.8616C8.92902 2.0687 9.02064 2.29053 9.1029 2.5234C9.46953 3.56129 9.69812 4.91756 9.74679 6.40376H12.4209C12.1916 4.29575 10.7618 2.54943 8.82887 1.8616Z";
		function ProviderMark(props) {
			const raw = props.providerKey;
			switch (raw === "cursor-agent" || raw === "cursor" || raw === "acp-cursor" ? "llm-cursor" : raw.startsWith("llm-") ? raw : raw === "opencode" ? "llm-opencode-go" : "llm-" + raw) {
				case "llm-cursor": return (0, react_jsx_runtime.jsx)(Svg, {
					viewBox: "0 0 24 24",
					children: (0, react_jsx_runtime.jsx)("path", {
						fill: "currentColor",
						d: "M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23"
					})
				});
				case "llm-antigravity": return (0, react_jsx_runtime.jsx)(Svg, {
					viewBox: "0 0 169 148",
					children: (0, react_jsx_runtime.jsx)("path", {
						fill: "currentColor",
						d: "M84.5 16C64 16 57 39 49 67C42 93 36 111 24 122C18 128 22 132 28 132C42 132 50 116 59 99C66 85 72 78 84.5 78C97 78 103 85 110 99C119 116 127 132 141 132C147 132 151 128 145 122C133 111 127 93 120 67C112 39 105 16 84.5 16Z"
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
				case "llm-commandcode": return (0, react_jsx_runtime.jsxs)(Svg, {
					viewBox: "0 0 137 137",
					children: [
						(0, react_jsx_runtime.jsx)("path", {
							fill: "currentColor",
							d: "m0 66.7959c0-31.4879 0-47.2318 9.78204-57.01386 9.78206-9.78204 25.52596-9.78204 57.01396-9.78204h2.5357c31.4883 0 47.2323 0 57.0143 9.78204 9.782 9.78206 9.782 25.52596 9.782 57.01396v2.5357c0 31.4883 0 47.2323-9.782 57.0143s-25.526 9.782-57.0144 9.782h-2.5357c-31.4879 0-47.2318 0-57.01386-9.782-9.78204-9.782-9.78204-25.526-9.78204-57.0144z"
						}),
						(0, react_jsx_runtime.jsx)("path", {
							clipRule: "evenodd",
							fill: "currentColor",
							fillRule: "evenodd",
							d: "m69.3317 5.56633h-2.5357c-15.9014 0-27.2674.01182-35.905 1.17312-8.4775 1.13977-13.4886 3.29415-17.173 6.97855s-5.83878 8.6955-6.97855 17.173c-1.1613 8.6376-1.17312 20.0036-1.17312 35.9049v2.5357c0 15.9014.01182 27.2674 1.17312 35.9054 1.13977 8.477 3.29415 13.488 6.97855 17.173 3.6844 3.684 8.6955 5.838 17.173 6.978 8.6376 1.161 20.0036 1.173 35.9049 1.173h2.5357c15.9014 0 27.2674-.012 35.9054-1.173 8.477-1.14 13.488-3.294 17.173-6.978 3.684-3.685 5.838-8.696 6.978-17.173 1.161-8.638 1.173-20.004 1.173-35.9053v-2.5357c0-15.9014-.012-27.2674-1.173-35.905-1.14-8.4775-3.294-13.4886-6.978-17.173-3.685-3.6844-8.696-5.83878-17.173-6.97855-8.638-1.1613-20.004-1.17312-35.9053-1.17312zm-59.54966 4.21571c-9.78204 9.78206-9.78204 25.52596-9.78204 57.01386v2.5357c0 31.4884 0 47.2324 9.78204 57.0144 9.78206 9.782 25.52596 9.782 57.01386 9.782h2.5357c31.4884 0 47.2324 0 57.0144-9.782s9.782-25.526 9.782-57.0143v-2.5357c0-31.488 0-47.2319-9.782-57.01396-9.782-9.78204-25.526-9.78204-57.0143-9.78204h-2.5357c-31.488 0-47.2319 0-57.01396 9.78204z"
						}),
						(0, react_jsx_runtime.jsx)("path", {
							fill: "var(--dsw-alias-bg-layer-1)",
							d: "m93.6604 26.1784c-8.982 0-16.2887 7.3067-16.2887 16.2888v6.9809h-18.6158v-6.9809c0-8.9821-7.3067-16.2888-16.2887-16.2888-8.9821 0-16.2888 7.3067-16.2888 16.2888s7.3067 16.2887 16.2888 16.2887h6.9809v18.6158h-6.9809c-8.9821 0-16.2888 7.3067-16.2888 16.2888 0 8.9825 7.3067 16.2885 16.2888 16.2885 8.982 0 16.2887-7.306 16.2887-16.2885v-6.981h18.6158v6.981c0 8.9825 7.3067 16.2885 16.2887 16.2885 8.9826 0 16.2886-7.306 16.2886-16.2885 0-8.9821-7.306-16.2888-16.2886-16.2888h-6.9809v-18.6158h6.9809c8.9826 0 16.2886-7.3066 16.2886-16.2887s-7.306-16.2888-16.2886-16.2888zm-6.9809 23.2697v-6.9809c0-3.8628 3.1182-6.9809 6.9809-6.9809 3.8628 0 6.9806 3.1181 6.9806 6.9809 0 3.8627-3.1178 6.9809-6.9806 6.9809zm-44.2123 0c-3.8628 0-6.9809-3.1182-6.9809-6.9809 0-3.8628 3.1181-6.9809 6.9809-6.9809 3.8627 0 6.9809 3.1181 6.9809 6.9809v6.9809zm16.2887 27.9236v-18.6158h18.6158v18.6158zm34.9045 23.2693c-3.8627 0-6.9809-3.1178-6.9809-6.9805v-6.981h6.9809c3.8628 0 6.9806 3.1182 6.9806 6.981 0 3.8627-3.1178 6.9805-6.9806 6.9805zm-51.1932 0c-3.8628 0-6.9809-3.1178-6.9809-6.9805 0-3.8628 3.1181-6.981 6.9809-6.981h6.9809v6.981c0 3.8627-3.1182 6.9805-6.9809 6.9805z"
						})
					]
				});
				case "llm-deepseek":
				case "llm-deepseek-official": return (0, react_jsx_runtime.jsx)(Svg, {
					viewBox: "0 0 23.16 17.04",
					children: (0, react_jsx_runtime.jsx)("path", {
						fill: "currentColor",
						d: DEEPSEEK_FISH_PATH
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
				default: return (0, react_jsx_runtime.jsx)(Svg, {
					viewBox: "0 0 14 14",
					children: (0, react_jsx_runtime.jsx)("path", {
						fill: "currentColor",
						fillRule: "evenodd",
						clipRule: "evenodd",
						d: GENERIC_GLOBE_PATH
					})
				});
			}
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
		const bareRowStyle = {
			...rowStyle,
			border: 0,
			borderRadius: 0,
			background: "transparent",
			overflow: "visible"
		};
		const bareHandleStyle = {
			...handleStyle,
			width: 22,
			minHeight: 0,
			borderRight: 0,
			color: "var(--dsw-alias-label-tertiary)"
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
		* Pointer-driven sortable list: an in-tree floating ghost follows the pointer,
		* a preview array records the prospective order, and FLIP animations move
		* sibling rows. The ghost stays inside the list ancestry so ancestor-scoped
		* row styles keep matching it while it floats (position:fixed escapes
		* overflow clipping without leaving the scope). Constraint: no
		* transform/filter/perspective on list ancestors, which would re-anchor
		* the fixed ghost to that ancestor instead of the viewport.
		*/
		function SortableList({ items, getId, renderItem, dragLabel, onReorder, disabled = false, chrome = "row", sorting = true, moveButtons = false, moveUpLabel, moveDownLabel }) {
			const card = chrome === "card";
			const plain = chrome === "plain";
			const bare = chrome === "bare";
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
			/** The ghost clones live row controls: keep the copy unfocusable. React 18 types no inert prop, so set the DOM flag behind a support guard. */
			const setGhostInert = (node) => {
				if (node !== null && "inert" in node) node.inert = true;
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
			const rowChromeStyle = bare ? bareRowStyle : plain ? plainRowStyle : card ? cardRowStyle : rowStyle;
			const rowGridColumns = (showHandle ? "44px " : "") + "minmax(0,1fr)" + (moveButtons && showHandle ? " auto auto" : "");
			const rowItemStyle = plain ? plainItemStyle : card ? cardItemStyle : { minWidth: 0 };
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
								...rowChromeStyle,
								gridTemplateColumns: rowGridColumns,
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
										...bare ? bareHandleStyle : handleStyle,
										display: showHandle ? "flex" : "none",
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
									style: rowItemStyle,
									children: renderItem(item, index)
								}),
								moveButtons ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									"data-sortable-move": "up",
									style: {
										...moveButtonStyle,
										display: showHandle ? "inline-flex" : "none"
									},
									"aria-label": upLabel(item, index),
									title: upLabel(item, index),
									disabled: !interactive || index === 0,
									hidden: !showHandle,
									onClick: () => {
										moveBy(id, -1);
									},
									children: "↑"
								}), (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									"data-sortable-move": "down",
									style: {
										...moveButtonStyle,
										display: showHandle ? "inline-flex" : "none"
									},
									"aria-label": downLabel(item, index),
									title: downLabel(item, index),
									disabled: !interactive || index === renderedItems.length - 1,
									hidden: !showHandle,
									onClick: () => {
										moveBy(id, 1);
									},
									children: "↓"
								})] }) : null
							]
						}, id);
					}),
					dragGhost !== null && draggedItem !== void 0 ? (0, react_jsx_runtime.jsxs)("div", {
						"data-sortable-row": "true",
						"data-sortable-ghost": "true",
						"aria-hidden": "true",
						ref: setGhostInert,
						style: {
							...rowChromeStyle,
							gridTemplateColumns: rowGridColumns,
							position: "fixed",
							boxSizing: "border-box",
							left: dragGhost.x,
							top: dragGhost.y,
							width: dragGhost.width,
							minHeight: dragGhost.height,
							zIndex: 1e4,
							pointerEvents: "none",
							opacity: .96,
							boxShadow: "var(--dsw-shadow-lv2, 0 10px 30px rgba(0, 0, 0, 0.18))",
							outline: "2px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 22%, transparent)"
						},
						children: [
							(0, react_jsx_runtime.jsx)("div", {
								"data-sortable-handle": "",
								style: {
									...handleStyle,
									display: showHandle ? "flex" : "none",
									...plain ? { borderRight: 0 } : {},
									cursor: "grabbing"
								},
								children: (0, react_jsx_runtime.jsx)(IconGrip, {})
							}),
							(0, react_jsx_runtime.jsx)("div", {
								"data-sortable-item": "",
								style: rowItemStyle,
								children: renderItem(draggedItem, renderedItems.findIndex((item) => getId(item) === draggedId))
							}),
							moveButtons && showHandle ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
								"aria-hidden": "true",
								style: {
									...moveButtonStyle,
									visibility: "hidden"
								},
								children: "↑"
							}), (0, react_jsx_runtime.jsx)("span", {
								"aria-hidden": "true",
								style: {
									...moveButtonStyle,
									visibility: "hidden"
								},
								children: "↓"
							})] }) : null
						]
					}) : null
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
		//#region lib/types/client/settings-c-css.js
		/** Locked settings C chrome, scoped under [data-providers-section]. */
		const settingsCCss = `
[data-providers-section]{--c-ink:var(--dsw-alias-label-primary);--c-muted:var(--dsw-alias-label-secondary);--c-faint:var(--dsw-alias-label-tertiary);--c-line:var(--dsw-alias-border-l2);--c-bg:var(--dsw-alias-bg-layer-1);--c-subtle:var(--dsw-alias-bg-module-platform);--c-hover:color-mix(in srgb,var(--dsw-alias-label-primary) 6%,var(--dsw-alias-bg-layer-1));display:flex;flex-direction:column;width:100%;min-width:0;color:var(--c-ink);font-size:13px;line-height:1.5}
[data-providers-section] button{font:inherit;color:inherit;cursor:pointer;border:0;background:none}
[data-providers-section] .c-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:34px;border:1px solid var(--c-line);border-radius:9px;padding:6px 12px;background:var(--c-bg);white-space:nowrap;font-size:12px;font-weight:500}
[data-providers-section] .c-btn:hover{background:var(--c-hover);border-color:var(--c-faint)}
[data-providers-section] .c-btn.quiet{background:transparent;border-color:transparent}
[data-providers-section] .c-btn.quiet:hover{background:var(--c-hover)}
[data-providers-section] .c-sort{min-width:128px}
[data-providers-section] .c-ico{width:14px;height:14px;flex:none}
[data-providers-section] .c-page-title{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin:3px 0 24px}
[data-providers-section] .c-page-title h2{margin:0;font-size:20px;line-height:28px;font-weight:600;letter-spacing:-.5px}
[data-providers-section] .c-page-title p{margin:5px 0 0;color:var(--c-muted);font-size:12px}
[data-providers-section] .c-note{padding:14px 16px;background:var(--c-subtle);border:1px solid var(--c-line);border-radius:11px;margin-bottom:19px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
[data-providers-section] .c-number{font-size:27px;line-height:1;font-weight:550;font-variant-numeric:tabular-nums;letter-spacing:-1px}
[data-providers-section] .c-copy{flex:1;min-width:140px}
[data-providers-section] .c-copy strong{display:block;font-size:13px}
[data-providers-section] .c-copy p{margin:3px 0 0;font-size:11px;color:var(--c-muted)}
[data-providers-section] .c-switch{display:flex;align-items:center;gap:8px;min-height:44px;flex:none;font-size:11px;white-space:nowrap;cursor:pointer}
[data-providers-section] .c-switch input[role=switch]{appearance:none;-webkit-appearance:none;position:relative;width:32px;height:18px;min-height:18px;padding:2px;border:0;border-radius:20px;background:var(--c-faint);cursor:inherit}
[data-providers-section] .c-switch input::before{content:"";display:block;width:14px;height:14px;background:var(--c-bg);border-radius:50%;transition:transform .15s}
[data-providers-section] .c-switch input:checked{background:var(--c-ink)}
[data-providers-section] .c-switch input:checked::before{transform:translateX(14px)}
[data-providers-section] .c-filters{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:13px}
[data-providers-section] .c-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
[data-providers-section] .c-zone{font-size:11px;color:var(--c-faint)}
[data-providers-section] .c-ledger{display:flex;flex-direction:column}
[data-providers-section] .c-labels,[data-providers-section] .c-row-grid{display:grid;--quota-column:minmax(170px,calc((100% - 90px)/2.05));grid-template-columns:minmax(140px,1fr) var(--quota-column) 72px;gap:20px;align-items:center}
[data-providers-section] .c-labels{padding:0 12px 10px;font-size:10px;color:var(--c-faint);border-bottom:1px solid var(--c-line)}
[data-providers-section] .c-row-grid{position:relative;padding:19px 12px;border-bottom:1px solid var(--c-line);min-height:96px;box-sizing:border-box}
[data-providers-section] .c-row-grid:last-child{border-bottom:0}
[data-providers-section][data-sorting] .c-labels,[data-providers-section][data-sorting] .c-row-grid{grid-template-columns:minmax(0,1fr) var(--quota-column)}
[data-providers-section][data-sorting] .c-labels>span:last-child,[data-providers-section][data-sorting] [data-action=open-provider]{display:none}
[data-providers-section] .c-identity{display:flex;align-items:center;gap:10px;min-width:0}
[data-providers-section] .c-brand{width:26px;height:28px;display:grid;place-items:center;flex:none}
[data-providers-section] .c-name{font-size:13px;font-weight:600;overflow-wrap:anywhere;line-height:20px}
[data-providers-section] .c-name-line{display:flex;align-items:center;flex-wrap:wrap;gap:7px}
[data-providers-section] .c-sub{margin-top:4px;display:flex;gap:6px;align-items:center;flex-wrap:wrap;color:var(--c-faint);font-size:11px}
[data-providers-section] .c-dot{display:inline-block;width:6px;height:6px;flex:none;border-radius:50%;background:var(--c-faint)}
[data-providers-section] .c-dot.good{background:#3b7759}
[data-providers-section] .c-missing{display:flex;flex-direction:column;gap:4px;color:var(--c-faint);font-size:12px;min-height:48px;justify-content:center}
[data-providers-section] .c-crumb{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--c-faint);margin-bottom:21px}
[data-providers-section] .c-crumb button{font-size:11px;color:var(--c-muted);padding:0;display:flex;align-items:center;gap:5px}
[data-providers-section] .c-full{display:flex;flex-direction:column;width:100%;min-width:0;max-width:650px;margin:0 auto;padding-bottom:12px;box-sizing:border-box}
[data-providers-section] .c-full *{min-width:0;box-sizing:border-box}
[data-providers-section] .c-plugin,[data-providers-section] .c-plugin [data-provider-slot],[data-providers-section] .c-plugin [data-provider-card],[data-providers-section] .c-plugin [data-provider-body]{display:contents!important}
[data-providers-section] .c-plugin [data-provider-body]>p{margin:0 0 16px;color:var(--c-muted);font-size:12px}
[data-providers-section] .c-detail-title{padding:0 0 16px;border-bottom:1px solid var(--c-line);margin-bottom:16px}
[data-providers-section] .c-detail-title .c-name{font-size:18px}
[data-providers-section] .c-quota-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:13px}
[data-providers-section] .c-quota-head h3{margin:0;font-size:13px;font-weight:650}
[data-providers-section] .c-quota-list{display:grid;gap:17px}
[data-providers-section] .c-quota-meta{margin-top:12px;display:flex;gap:8px;align-items:center;justify-content:space-between;color:var(--c-faint);font-size:10px;flex-wrap:wrap}
[data-providers-section] .c-empty{color:var(--c-faint);font-size:13px}

[data-providers-section] .c-account{display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:space-between!important;text-align:left!important;gap:12px;padding:12px 14px!important;border:1px solid var(--c-line);border-radius:10px;background:var(--c-subtle);margin:0 0 22px;min-height:0}
[data-providers-section] .c-account-head{margin:22px 0 10px;font-size:13px;font-weight:650}
[data-providers-section] .c-account-copy{display:block!important;flex:1 1 auto;min-width:0;text-align:left!important}
[data-providers-section] .c-account-name{display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:6px;font-size:13px;font-weight:600;text-align:left!important}
[data-providers-section] .c-account-meta{margin-top:3px;font-size:11px;color:var(--c-faint);text-align:left!important}
[data-providers-section] .c-account button{flex:none;min-height:34px}
[data-providers-section] .c-full details.c-advanced{border-top:1px solid var(--c-line);padding-top:17px;margin:16px 0 0;background:transparent}
[data-providers-section] .c-full details.c-advanced>summary{display:flex;align-items:center;gap:8px;padding:0;min-height:20px;list-style:none;cursor:pointer;font-size:13px;font-weight:550}
[data-providers-section] .c-full details.c-advanced>summary::-webkit-details-marker{display:none}
[data-providers-section] .c-full details.c-advanced>summary .c-ico{flex:none;width:13px;height:13px;transition:transform .15s}
[data-providers-section] .c-full details.c-advanced[open]>summary .c-ico{transform:rotate(90deg)}
[data-providers-section] .c-full details.c-advanced>summary .c-advanced-note{margin-left:auto;font-size:11px;font-weight:400;color:var(--c-faint)}
[data-providers-section] .c-full details.c-advanced>section{padding:0}
[data-providers-section] .c-full details.c-advanced>section>section{padding:0}
/* Every block after the identity leads with the same hairline, so the detail reads with one rhythm. */
[data-providers-section] [data-provider-models],[data-providers-section] [data-c-quota]{border-top:1px solid var(--c-line);padding-top:16px;margin-top:16px}
[data-providers-section] .c-models-head{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px 12px;flex-wrap:nowrap!important;margin:0 0 10px}
[data-providers-section] .c-models-title{display:flex;align-items:baseline;gap:7px;min-width:0}
[data-providers-section] .c-models-title h3{margin:0;font-size:13px;font-weight:650}
[data-providers-section] .c-models-title .c-count{font-size:11px;color:var(--c-faint)}
[data-providers-section] .c-models-list>*+*{margin-top:16px}
[data-providers-section] .c-model-card{border:1px solid var(--c-line);border-radius:10px;background:var(--c-bg);padding:12px}
[data-providers-section] .c-model-top{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) 32px 32px;gap:10px;align-items:end}
[data-providers-section] .c-field{display:flex;flex-direction:column;gap:4px;min-width:0}
[data-providers-section] .c-field-label{font-size:11px;line-height:1.4;color:var(--c-muted)}
[data-providers-section] .c-input{width:100%;min-width:0;min-height:34px;border:1px solid var(--c-line);border-radius:7px;padding:7px 9px;font:inherit;font-size:12px;color:var(--c-ink);background:var(--c-bg)}
[data-providers-section] .c-icon-only{width:32px;min-width:32px;height:34px;padding:0!important;justify-content:center}
[data-providers-section] .c-icon-only[aria-expanded=true] .c-ico{transform:rotate(90deg)}
[data-providers-section] .c-input[readonly]{background:var(--c-subtle);color:var(--c-muted)}
[data-providers-section] .c-icon-label{gap:6px}
[data-providers-section] .c-icon-label .c-ico{flex:none;width:14px;height:14px}
[data-providers-section] .c-add-model{align-self:flex-start}
[data-providers-section] .c-model-extra{margin-top:10px;padding-top:10px;border-top:1px solid var(--c-line)}
/* Provider fields keep fixed slots so the window field and the capability checks
   never move when an optional field such as the reasoning effort is absent. */
[data-providers-section] .c-extra-grid{display:grid;grid-template-columns:minmax(0,200px) max-content minmax(0,200px);justify-content:start;gap:10px 14px;align-items:end}
[data-providers-section] .c-extra-grid>*{min-width:0}
[data-providers-section] .c-extra-grid>.c-field{max-width:220px}
[data-providers-section] .c-extra-checks{display:flex;align-items:center;gap:16px;flex-wrap:nowrap;min-height:34px;align-self:end}
[data-providers-section] .c-extra-checks label{display:inline-flex;align-items:center;gap:7px;min-height:34px;font-size:12px}
[data-providers-section] .c-extra-checks input[type=checkbox]{accent-color:var(--c-ink);width:15px;height:15px;min-height:0;padding:0;margin:0;flex:none}
[data-providers-section] .c-models-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
[data-providers-section] .c-models-actions .c-btn{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:6px!important;min-height:34px;padding:6px 10px!important;font-size:12px;line-height:1;white-space:nowrap}
[data-providers-section] .c-models-actions .c-btn.quiet{min-width:96px}
[data-providers-section] .c-models-actions .c-btn .c-ico{display:block;flex:none;width:14px;height:14px}
[data-providers-section] .c-models-actions .c-btn.quiet{border-color:transparent!important;background:transparent!important}
[data-providers-section] .c-models-actions .c-btn.quiet:hover{background:var(--c-hover)!important}
[data-providers-section] .c-models-actions .c-btn[disabled]{opacity:.5;cursor:default}
[data-providers-section] .c-models-hint{margin:0 0 12px;font-size:11px;color:var(--c-faint)}
[data-providers-section] .c-plugin .c-sort{min-width:96px}
[data-providers-section] .c-full [data-sortable-move]{display:none!important}
[data-providers-section] .c-full [data-sortable-row]:has([data-sortable-handle]:not([hidden])){grid-template-columns:32px minmax(0,1fr)!important;align-items:center}
[data-providers-section] .c-full [data-sortable-row]:has([data-sortable-handle]:not([hidden])) [data-sortable-handle]{width:32px!important;min-width:32px!important;min-height:32px;align-self:center}
[data-providers-section] .c-notice{margin:0;color:var(--c-muted);font-size:12px;line-height:1.5}
[data-providers-section] .c-account-actions{display:flex;align-items:center;gap:8px;flex:none}
[data-providers-section] .c-account-body{margin-top:10px}
[data-providers-section] .c-advanced-content{display:flex;flex-direction:column;gap:16px;margin-top:18px;padding:0 1px}
[data-providers-section] .c-control{display:flex;flex-direction:column;gap:4px}
[data-providers-section] .c-checkbox-field{display:flex;align-items:flex-start;gap:7px;font-size:12px;font-weight:500;min-height:0}
[data-providers-section] .c-checkbox-field input[type=checkbox]{accent-color:var(--c-ink);width:15px;height:15px;min-height:0;padding:0;margin:3px 0 0;flex:none}
[data-providers-section] .c-field-hint{margin:0;padding-left:22px;font-size:11px;color:var(--c-faint);line-height:1.65}
[data-providers-section] .c-advanced>summary .c-ico{flex:none;transition:transform .15s ease}
[data-providers-section] .c-advanced[open]>summary .c-ico{transform:rotate(90deg)}
[data-providers-section] .c-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:14px;border-top:1px solid var(--c-line);color:var(--c-faint);font-size:11px}
[data-providers-section] .c-draft{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:16px;padding:10px 14px;border-top:1px solid var(--c-line);background:var(--c-subtle);font-size:12px}
[data-providers-section] .c-draft-actions{display:flex;align-items:center;gap:7px;margin-left:auto}
[data-providers-section] .sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}
@media (max-width:560px){
 [data-providers-section] .c-note{display:grid;grid-template-columns:auto minmax(0,1fr);gap:6px 10px;align-items:start;padding:12px 14px}
 [data-providers-section] .c-note .c-copy{min-width:0}
 [data-providers-section] .c-note .c-switch{grid-column:1 / -1;justify-content:space-between;width:100%;min-height:36px;margin-top:2px;padding-top:8px;border-top:1px solid var(--c-line)}
 [data-providers-section] .c-labels,[data-providers-section] .c-row-grid{grid-template-columns:minmax(0,1fr);gap:10px}
 [data-providers-section] .c-labels{display:none}
 [data-providers-section] .c-row-grid{min-height:0;padding:14px 4px}
}
@media (max-width:760px){
 /* The scroll pane keeps 24px of right padding while the dialog header keeps 14px,
    so the column sat 10px left of the header controls. Stretch it back in line.
    ponytail: this +10px assumes an overlay scrollbar (mobile/WebView). With a classic
    scrollbar the pane is inset by its width; move the scrollbar onto the dialog if
    that ever needs to be exact on desktop too. */
 [data-providers-section]{width:calc(100% + 10px);margin-right:-10px}
 [data-providers-section] .c-full{max-width:none;margin:0}
 [data-providers-section] .c-account{flex-wrap:wrap;gap:10px}
 [data-providers-section] .c-quota-meta{flex-direction:column;align-items:flex-start;gap:4px}
 [data-providers-section] .c-models-head{gap:8px!important;flex-wrap:nowrap!important}
 [data-providers-section] .c-models-title{width:auto!important;flex:1 1 auto;min-width:6ch;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 [data-providers-section] .c-models-actions{margin-left:auto}
 [data-providers-section] .c-models-actions{flex:0 0 auto;flex-wrap:nowrap!important}
 [data-providers-section] .c-filters .c-btn{min-height:28px!important;padding:4px 11px!important;font-size:12px;line-height:1.2}
}
/* Narrow phones: keep the heading and all three actions on one row by tightening
   the toolbar rather than wrapping it (the prototype keeps one row). */
@media (max-width:520px){
 [data-providers-section] .c-extra-grid{grid-auto-flow:row;grid-template-columns:minmax(0,1fr)}
 [data-providers-section] .c-extra-grid>*{max-width:none}
 [data-providers-section] .c-account{flex-direction:column!important;align-items:flex-start!important}
 [data-providers-section] .c-plugin .c-sort{min-width:0!important}
 [data-providers-section] .c-models-actions .c-btn,
 [data-providers-section] .c-models-actions .c-btn.quiet{padding:4px 8px!important;font-size:11px!important;line-height:1;min-height:30px!important;gap:5px!important}
 [data-providers-section] .c-models-actions .c-btn .c-ico,
 [data-providers-section] .c-models-actions .c-btn.quiet .c-ico{width:13px!important;height:13px!important;flex:none}
 [data-providers-section] .c-models-actions{gap:4px}
 [data-providers-section] .c-models-title h3{font-size:13px}
 [data-providers-section] .c-models-title .c-count{font-size:11px}
 [data-providers-section] .c-filters{flex-wrap:nowrap!important;gap:8px}
 [data-providers-section] .c-filters .c-row{display:flex;gap:6px;flex:none}
 [data-providers-section] .c-filters .c-zone{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right}
 [data-providers-section] .c-filters .c-btn{height:26px!important;min-height:26px!important;max-height:26px!important;padding:0 10px!important;font-size:11px;line-height:1;display:inline-flex!important;align-items:center;justify-content:center;flex:none}
 [data-providers-section] .c-detail-title .c-name{font-size:16px}
 [data-providers-section] .c-quota-head h3{font-size:12px}
}
@media (max-width:430px){
 [data-providers-section] .c-models-head{gap:4px!important}
 [data-providers-section] .c-models-title{min-width:0!important;flex:1 1 auto}
 [data-providers-section] .c-models-actions{gap:3px!important}
 [data-providers-section] .c-models-actions .c-btn,
 [data-providers-section] .c-models-actions .c-btn.quiet{padding:3px 6px!important;gap:4px!important;min-width:0!important}
 [data-providers-section] .c-models-actions .c-btn .c-ico,
 [data-providers-section] .c-models-actions .c-btn.quiet .c-ico{width:12px!important;height:12px!important}
}
/* Reserve the scrollbar gutter inside the providers dialog so content never
   shifts sideways when the detail grows past the viewport. */

`;
		//#endregion
		//#region lib/types/client/provider-detail.js
		/** Icon paths copied from the locked prototype so every card matches it. */
		const ICON = {
			expand: "M2 4h12M2 12h12M5 2v4M11 10v4",
			sort: "M5 2v12m-3-3 3 3 3-3M11 14V2m-3 3 3-3 3 3",
			plus: "M8 3v10M3 8h10",
			chevron: "M6 3l5 5-5 5",
			trash: "M3 4h10M6 4V2h4v2M4 4l1 10h6l1-10M7 7v4M9 7v4"
		};
		function modelLabelOf(row, index) {
			const id = row.id.trim();
			if (id.length > 0) return id;
			return index === void 0 ? row.rowId : String(index + 1);
		}
		function DetailIcon({ path }) {
			return (0, react_jsx_runtime.jsx)("svg", {
				className: "c-ico",
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.3",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children: (0, react_jsx_runtime.jsx)("path", { d: path })
			});
		}
		function detailCopyOf(locale) {
			const source = copy[locale];
			return {
				details: source.details,
				connected: source.connected,
				configured: source.configured,
				unconnected: source.unconnected,
				modelCount: source.modelCount,
				quotaHeading: source.quotaHeading,
				quotaMeta: source.quotaMeta,
				refresh: source.refresh,
				refreshing: source.refreshing,
				accountHeading: source.accountHeading,
				modelsHeading: source.modelsHeading,
				modelIdLabel: source.modelIdLabel,
				modelNameLabel: source.modelNameLabel,
				addModelLabel: source.addModelLabel,
				removeModelLabel: source.removeModelLabel,
				dragModelLabel: source.dragModelLabel,
				modelsCount: source.modelsCount,
				modelsHint: source.modelsHint,
				expandAll: source.expandAll,
				collapseAll: source.collapseAll,
				sort: source.sortModels,
				done: source.done,
				chooseFromAccount: source.chooseFromAccount,
				addModel: source.addModel,
				advancedHeading: source.advancedHeading,
				advancedNote: source.advancedNote,
				connectToSee: source.connectToSee,
				unsupportedQuota: source.unsupportedQuota,
				loadingQuota: source.loadingQuota,
				errorQuota: source.errorQuota,
				windowHour: source.windowHour,
				windowWeek: source.windowWeek,
				windowMonth: source.windowMonth,
				resetAt: source.resetAt,
				resetOverdue: source.resetOverdue,
				resetMissing: source.resetMissing
			};
		}
		/** Shared detail copy so every plugin renders the same words. */
		const providerDetailCopy = {
			zh: detailCopyOf("zh"),
			en: detailCopyOf("en")
		};
		function quotaEmptyLabel(status, copy) {
			if (status === "unsupported") return copy.unsupportedQuota;
			if (status === "loading") return copy.loadingQuota;
			if (status === "error") return copy.errorQuota;
			return copy.connectToSee;
		}
		/**
		* The single provider detail layout: identity, notice, account, quota, models,
		* advanced, footer. Plugins pass data and content; geometry and copy live here so
		* every provider looks and reads the same.
		*/
		function ProviderDetail(props) {
			const account = props.account;
			const state = account?.state ?? "unconnected";
			const stateLabel = state === "connected" ? props.copy.connected : state === "configured" ? props.copy.configured : props.copy.unconnected;
			const count = props.models?.count;
			return (0, react_jsx_runtime.jsxs)("article", {
				className: "c-full",
				"data-provider-detail": "",
				children: [
					(0, react_jsx_runtime.jsx)("div", {
						className: "c-detail-title",
						children: (0, react_jsx_runtime.jsxs)("div", {
							className: "c-identity",
							children: [props.mark === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
								className: "c-brand",
								children: props.mark
							}), (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsxs)("div", {
								className: "c-name-line",
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: "c-name",
									children: props.name
								}), (0, react_jsx_runtime.jsx)(ProviderRoleBadge, { ...props.role === void 0 ? {} : { role: props.role } })]
							}), (0, react_jsx_runtime.jsxs)("div", {
								className: "c-sub",
								children: [
									(0, react_jsx_runtime.jsx)("span", { className: "c-dot" + (state === "unconnected" ? "" : " good") }),
									stateLabel,
									count === void 0 ? null : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
										"aria-hidden": "true",
										children: "·"
									}), props.copy.modelCount.replace("{n}", String(count))] })
								]
							})] })]
						})
					}),
					props.notice === void 0 ? null : (0, react_jsx_runtime.jsx)("p", {
						className: "c-notice",
						children: props.notice
					}),
					account === void 0 ? null : (0, react_jsx_runtime.jsxs)("div", {
						className: "c-account-group",
						children: [
							(0, react_jsx_runtime.jsx)("div", {
								className: "c-account-head",
								children: props.copy.accountHeading
							}),
							(0, react_jsx_runtime.jsxs)("section", {
								className: "c-account",
								children: [(0, react_jsx_runtime.jsxs)("div", {
									className: "c-account-copy",
									children: [(0, react_jsx_runtime.jsxs)("div", {
										className: "c-account-name",
										children: [(0, react_jsx_runtime.jsx)("span", { className: "c-dot" + (state === "unconnected" ? "" : " good") }), account.label]
									}), account.meta === void 0 ? null : (0, react_jsx_runtime.jsx)("div", {
										className: "c-account-meta",
										children: account.meta
									})]
								}), account.actions === void 0 ? null : (0, react_jsx_runtime.jsx)("div", {
									className: "c-account-actions",
									children: account.actions
								})]
							}),
							account.body === void 0 ? null : (0, react_jsx_runtime.jsx)("div", {
								className: "c-account-body",
								children: account.body
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("section", {
						"data-c-quota": "",
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: "c-quota-head",
								children: [(0, react_jsx_runtime.jsx)("h3", { children: props.copy.quotaHeading }), props.quota.onRefresh === void 0 ? null : (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "c-btn quiet",
									disabled: props.quota.refreshing === true,
									onClick: props.quota.onRefresh,
									children: props.quota.refreshing === true ? props.copy.refreshing : props.copy.refresh
								})]
							}),
							(0, react_jsx_runtime.jsx)("div", {
								className: "c-quota-list",
								children: props.quota.windows.length === 0 ? (0, react_jsx_runtime.jsx)("div", {
									className: "c-missing",
									children: quotaEmptyLabel(props.quota.status, props.copy)
								}) : props.quota.windows.map((window) => {
									const windowLabel = windowNameOf(window.label, {
										hour: props.copy.windowHour,
										week: props.copy.windowWeek,
										month: props.copy.windowMonth
									});
									const detail = formatResetLabel(window.resetsAt, windowLabel, {
										at: props.copy.resetAt,
										overdue: props.copy.resetOverdue,
										missing: props.copy.resetMissing
									});
									return (0, react_jsx_runtime.jsx)(ProviderQuotaMeter, {
										label: windowLabel,
										...window.remainingPercent === void 0 ? {} : { remainingPercent: window.remainingPercent },
										emptyLabel: window.valueText,
										...detail === void 0 ? {} : { detail }
									}, window.id);
								})
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: "c-quota-meta",
								children: [(0, react_jsx_runtime.jsx)("span", { children: props.copy.quotaMeta }), props.quota.updatedLabel === void 0 ? null : (0, react_jsx_runtime.jsx)("span", { children: props.quota.updatedLabel })]
							})
						]
					}),
					props.models === void 0 ? null : (0, react_jsx_runtime.jsxs)("section", {
						"data-provider-models": "",
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: "c-models-head",
								children: [(0, react_jsx_runtime.jsxs)("div", {
									className: "c-models-title",
									children: [(0, react_jsx_runtime.jsx)("h3", { children: props.copy.modelsHeading }), (0, react_jsx_runtime.jsx)("span", {
										className: "c-count",
										children: props.copy.modelsCount.replace("{n}", String(props.models.count ?? 0))
									})]
								}), (0, react_jsx_runtime.jsxs)("div", {
									className: "c-models-actions",
									children: [
										props.models.onToggleAll === void 0 ? null : (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "c-btn quiet c-icon-label",
											"aria-pressed": props.models.allOpen === true,
											onClick: props.models.onToggleAll,
											children: [(0, react_jsx_runtime.jsx)(DetailIcon, { path: ICON.expand }), props.models.allOpen === true ? props.copy.collapseAll : props.copy.expandAll]
										}),
										props.models.onToggleSorting === void 0 ? null : (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "c-btn quiet c-icon-label",
											"aria-pressed": props.models.sorting === true,
											disabled: props.models.sortDisabled === true,
											onClick: props.models.onToggleSorting,
											children: [(0, react_jsx_runtime.jsx)(DetailIcon, { path: ICON.sort }), props.models.sorting === true ? props.copy.done : props.copy.sort]
										}),
										props.models.onChooseFromAccount === void 0 ? null : (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "c-btn c-icon-label",
											disabled: props.models.chooseDisabled === true,
											onClick: props.models.onChooseFromAccount,
											children: [(0, react_jsx_runtime.jsx)(DetailIcon, { path: ICON.plus }), props.copy.chooseFromAccount]
										}),
										props.models.actions
									]
								})]
							}),
							(0, react_jsx_runtime.jsx)("p", {
								className: "c-models-hint",
								children: props.models.hint ?? props.copy.modelsHint
							}),
							(0, react_jsx_runtime.jsx)("div", {
								className: "c-models-list",
								children: props.models.items === void 0 ? null : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(SortableList, {
									items: props.models.items,
									getId: (row) => row.rowId,
									chrome: "bare",
									disabled: props.models.onReorder === void 0,
									sorting: props.models.sorting === true,
									moveButtons: props.models.sorting === true,
									dragLabel: (row) => props.copy.dragModelLabel + ": " + modelLabelOf(row),
									moveUpLabel: (row) => props.copy.dragModelLabel + ": " + modelLabelOf(row),
									moveDownLabel: (row) => props.copy.dragModelLabel + ": " + modelLabelOf(row),
									onReorder: (rows) => {
										props.models?.onReorder?.(rows.map((row) => row.rowId));
									},
									renderItem: (row, index) => {
										const label = modelLabelOf(row, index);
										const expanded = props.models?.sorting !== true && (props.models?.allOpen === true || props.models?.expanded?.includes(row.rowId) === true);
										return (0, react_jsx_runtime.jsxs)("div", {
											className: "c-model-card",
											"data-model-row": label,
											children: [(0, react_jsx_runtime.jsxs)("div", {
												className: "c-model-top",
												children: [
													(0, react_jsx_runtime.jsxs)("label", {
														className: "c-field",
														children: [(0, react_jsx_runtime.jsx)("span", {
															className: "c-field-label",
															children: props.copy.modelIdLabel
														}), (0, react_jsx_runtime.jsx)("input", {
															className: "c-input",
															value: row.id,
															readOnly: props.models?.sorting === true,
															spellCheck: false,
															autoComplete: "off",
															placeholder: props.copy.modelIdLabel,
															"aria-label": props.copy.modelIdLabel + " " + String(index + 1),
															onChange: (event) => {
																props.models?.onPatch?.(row.rowId, { id: event.target.value });
															}
														})]
													}),
													(0, react_jsx_runtime.jsxs)("label", {
														className: "c-field",
														children: [(0, react_jsx_runtime.jsx)("span", {
															className: "c-field-label",
															children: props.copy.modelNameLabel
														}), (0, react_jsx_runtime.jsx)("input", {
															className: "c-input",
															value: row.name ?? "",
															readOnly: props.models?.sorting === true,
															autoComplete: "off",
															placeholder: props.copy.modelNameLabel,
															"aria-label": props.copy.modelNameLabel + " " + String(index + 1),
															onChange: (event) => {
																props.models?.onPatch?.(row.rowId, { name: event.target.value });
															}
														})]
													}),
													props.models?.onToggle === void 0 ? null : (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														className: "c-btn quiet c-icon-only",
														"aria-expanded": expanded,
														"aria-label": props.copy.details + ": " + label,
														onClick: () => {
															props.models?.onToggle?.(row.rowId);
														},
														children: (0, react_jsx_runtime.jsx)(DetailIcon, { path: ICON.chevron })
													}),
													props.models?.onRemove === void 0 ? null : (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														className: "c-btn quiet c-icon-only",
														"aria-label": props.copy.removeModelLabel + " " + label,
														onClick: () => {
															props.models?.onRemove?.(row.rowId);
														},
														children: (0, react_jsx_runtime.jsx)(DetailIcon, { path: ICON.trash })
													})
												]
											}), props.models?.extra === void 0 || !expanded ? null : (0, react_jsx_runtime.jsx)("div", {
												className: "c-model-extra",
												children: props.models.extra(row)
											})]
										});
									}
								}), props.models.onAdd === void 0 ? null : (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "c-btn c-icon-label c-add-model",
									disabled: props.models.addDisabled === true,
									onClick: props.models.onAdd,
									children: [(0, react_jsx_runtime.jsx)(DetailIcon, { path: ICON.plus }), props.copy.addModelLabel]
								})] })
							})
						]
					}),
					props.advanced === void 0 ? null : (0, react_jsx_runtime.jsxs)("details", {
						className: "c-advanced",
						children: [(0, react_jsx_runtime.jsxs)("summary", { children: [
							(0, react_jsx_runtime.jsx)(DetailIcon, { path: ICON.chevron }),
							(0, react_jsx_runtime.jsx)("span", { children: props.copy.advancedHeading }),
							(0, react_jsx_runtime.jsx)("span", {
								className: "c-advanced-note",
								children: props.copy.advancedNote
							})
						] }), (0, react_jsx_runtime.jsx)("div", {
							className: "c-advanced-content",
							children: props.advanced
						})]
					}),
					props.footer === void 0 ? null : (0, react_jsx_runtime.jsx)("div", {
						className: "c-footer",
						children: props.footer
					}),
					props.draft === void 0 ? null : (0, react_jsx_runtime.jsx)("div", {
						className: "c-draft",
						children: (0, react_jsx_runtime.jsx)("div", {
							className: "c-draft-actions",
							children: props.draft
						})
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/ProvidersSection.js
		/** Settings > LLM Providers page shell. Provider cards arrive through settings.provider.item. */
		const providerShellCss = `
div:has([role="dialog"] [data-providers-section]){opacity:1!important;visibility:visible!important;z-index:1000!important;pointer-events:auto!important}
@media(max-width:680px){
 [role="dialog"]:has([data-providers-section]){flex-direction:column;width:calc(100% - 16px);max-width:calc(100% - 16px);height:calc(100dvh - 16px);max-height:calc(100dvh - 16px)}
 [role="dialog"]:has([data-providers-section])>nav{width:100%;min-width:0;flex:none;padding:8px;border-right:0;border-bottom:1px solid var(--dsw-alias-border-l2)}
 [role="dialog"]:has([data-providers-section])>nav>div:last-child{display:flex;flex-direction:row;gap:4px;overflow-x:auto}
 [role="dialog"]:has([data-providers-section])>nav button{flex:none;white-space:nowrap;min-height:44px;padding:8px 10px}
 [role="dialog"]:has([data-providers-section])>div{width:100%;min-width:0;min-height:0;flex:1}
}
`;
		const fallbackWrapStyle = {
			display: "flex",
			flexDirection: "column",
			gap: 8,
			minWidth: 0
		};
		const fallbackBadgeAlign = { alignSelf: "flex-start" };
		const API_KEY_AUTH = /(?:ollama|opencode-go|commandcode)$/u;
		/**
		* Overview meter label: the provider's full window name, with bare abbreviations
		* replaced by the shared localized wording so every provider reads the same.
		* @param window - primary usage window.
		* @param t - section locale binding.
		* @returns the display name for the overview row.
		*/
		function windowName(window, t) {
			return windowNameOf(window.label, {
				hour: t("windowHour"),
				week: t("windowWeek"),
				month: t("windowMonth")
			});
		}
		function linkState(key, account, summary) {
			if (account !== void 0) return account.state;
			if (summary === void 0 || summary.status === "logged-out") return "unconnected";
			return API_KEY_AUTH.test(key) ? "configured" : "connected";
		}
		function IconSort() {
			return (0, react_jsx_runtime.jsx)("svg", {
				className: "c-ico",
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.3",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children: (0, react_jsx_runtime.jsx)("path", { d: "M5 2v12m-3-3 3 3 3-3M11 14V2m-3 3 3-3 3 3" })
			});
		}
		function IconCheck() {
			return (0, react_jsx_runtime.jsx)("svg", {
				className: "c-ico",
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.3",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children: (0, react_jsx_runtime.jsx)("path", { d: "M3 8l3 3 7-7" })
			});
		}
		function IconBack() {
			return (0, react_jsx_runtime.jsx)("svg", {
				className: "c-ico",
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.3",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children: (0, react_jsx_runtime.jsx)("path", { d: "M10 3 5 8l5 5" })
			});
		}
		function IconRefresh() {
			return (0, react_jsx_runtime.jsx)("svg", {
				className: "c-ico",
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.3",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children: (0, react_jsx_runtime.jsx)("path", { d: "M13 6a5.2 5.2 0 1 0 .1 4M13 2v4H9" })
			});
		}
		function bindProvidersSection(listRegisteredKeys, subscribe, readPage, onReorder, roleOf, onShowSidebarUsage, headerOf, readUsage, subscribeUsage, accountOf, onRefresh, detailOf, nameOf, modelCountOf) {
			return function BoundProvidersSection(props) {
				const [, bump] = (0, react.useState)(0);
				(0, react.useEffect)(() => subscribe(() => {
					bump((value) => value + 1);
				}), [subscribe]);
				const order = readPage();
				const usageSummaries = (0, react.useSyncExternalStore)(subscribeUsage ?? (() => () => void 0), readUsage ?? (() => []), readUsage ?? (() => []));
				return (0, react_jsx_runtime.jsx)(ProvidersSection, {
					renderSlot: props.renderSlot,
					t: props.t,
					registeredKeys: listRegisteredKeys(),
					savedOrder: order.keys,
					disabled: order.disabled,
					onReorder,
					roleOf,
					showSidebarUsage: order.showSidebarUsage,
					onShowSidebarUsage,
					usageSummaries,
					...headerOf === void 0 ? {} : { headerOf },
					...accountOf === void 0 ? {} : { accountOf },
					...onRefresh === void 0 ? {} : { onRefresh },
					...detailOf === void 0 ? {} : { detailOf },
					...nameOf === void 0 ? {} : { nameOf },
					...modelCountOf === void 0 ? {} : { modelCountOf }
				});
			};
		}
		/**
		* Settings C: compact quota ledger on overview; the plugin item slot mounts
		* only in the independent detail view. Sorting reorders ledger rows in place.
		*/
		function ProvidersSection(props) {
			const t = props.t ?? ((key) => key);
			const keys = applySavedOrder(props.registeredKeys ?? [], props.savedOrder ?? []);
			const [sorting, setSorting] = (0, react.useState)(false);
			const [filter, setFilter] = (0, react.useState)("all");
			const [detail, setDetail] = (0, react.useState)(void 0);
			const refreshRef = (0, react.useRef)(props.onRefresh);
			refreshRef.current = props.onRefresh;
			(0, react.useEffect)(() => {
				refreshRef.current?.();
			}, []);
			const showToggle = keys.length > 1 && props.disabled !== true && detail === void 0;
			const sortable = sorting && showToggle;
			const orderBeforeSort = (0, react.useRef)(void 0);
			(0, react.useEffect)(() => {
				if (!sorting) {
					orderBeforeSort.current = void 0;
					return;
				}
				if (orderBeforeSort.current === void 0) orderBeforeSort.current = keys;
				const onKey = (event) => {
					if (event.key !== "Escape") return;
					event.preventDefault();
					const previous = orderBeforeSort.current;
					setSorting(false);
					if (previous !== void 0) props.onReorder?.([...previous]);
				};
				window.addEventListener("keydown", onKey);
				return () => window.removeEventListener("keydown", onKey);
			}, [
				sorting,
				keys,
				props
			]);
			const visibleKeys = keys.filter((key) => filter === "all" || (props.roleOf?.(key) ?? "llm") === filter);
			const items = (detail === void 0 ? visibleKeys : keys.filter((key) => key === detail)).map((key) => ({ key }));
			const renderCard = (item) => {
				const role = props.roleOf?.(item.key) ?? "llm";
				const summary = props.usageSummaries?.find((entry) => entry.providerKey === item.key) ?? props.usageSummaries?.find((entry) => item.key.endsWith(entry.providerKey) || entry.providerKey.endsWith(item.key));
				const account = props.accountOf?.(item.key);
				const migrated = detail !== void 0 && (props.detailOf?.(item.key) ?? "legacy") === "shared";
				const node = props.renderSlot?.(PROVIDERS_ITEM_SLOT, {
					mode: detail === void 0 ? "overview" : "detail",
					copy: props.t?.("details") === providerDetailCopy.zh.details ? providerDetailCopy.zh : providerDetailCopy.en,
					template: ProviderDetail,
					...summary === void 0 ? {} : { usage: {
						status: summary.status,
						windows: summary.windows,
						...summary.fetchedAt === void 0 ? {} : { fetchedAt: summary.fetchedAt }
					} },
					...account === void 0 ? {} : { accountState: account.state },
					...detail === void 0 || props.onRefresh === void 0 ? {} : { onRefresh: () => {
						props.onRefresh?.(item.key);
					} }
				}, { entryKey: item.key });
				if (node == null) return null;
				const card = props.headerOf?.(item.key) === "shared" ? (0, react_jsx_runtime.jsx)("div", {
					"data-provider-slot": "",
					"data-provider-role": role,
					children: node
				}) : (0, react_jsx_runtime.jsxs)("div", {
					"data-provider-slot": "",
					"data-provider-role": role,
					style: fallbackWrapStyle,
					children: [(0, react_jsx_runtime.jsx)("span", {
						style: fallbackBadgeAlign,
						children: (0, react_jsx_runtime.jsx)(ProviderRoleBadge, { ...role === "llm" ? {} : { role } })
					}), node]
				});
				const linked = linkState(item.key, account, summary);
				const models = props.modelCountOf?.(item.key);
				const copy = {
					at: t("resetAt"),
					overdue: t("resetOverdue"),
					missing: t("resetMissing")
				};
				const identity = (0, react_jsx_runtime.jsxs)("div", {
					className: "c-identity",
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: "c-brand",
						children: (0, react_jsx_runtime.jsx)(ProviderMark, { providerKey: item.key })
					}), (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsxs)("div", {
						className: "c-name-line",
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: "c-name",
							children: summary?.name ?? item.key
						}), (0, react_jsx_runtime.jsx)(ProviderRoleBadge, { ...role === "llm" ? {} : { role } })]
					}), (0, react_jsx_runtime.jsxs)("div", {
						className: "c-sub",
						children: [
							(0, react_jsx_runtime.jsx)("span", { className: "c-dot" + (linked === "unconnected" ? "" : " good") }),
							t(linked),
							models === void 0 ? null : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
								"aria-hidden": "true",
								children: "·"
							}), t("modelCount").replace("{n}", String(models))] })
						]
					})] })]
				});
				if (detail !== void 0) {
					if (migrated) return card;
					const windows = summary?.windows ?? [];
					return (0, react_jsx_runtime.jsxs)("article", {
						className: "c-full",
						children: [
							(0, react_jsx_runtime.jsx)("div", {
								className: "c-detail-title",
								children: identity
							}),
							(0, react_jsx_runtime.jsxs)("section", {
								"data-c-quota": "",
								children: [
									(0, react_jsx_runtime.jsxs)("div", {
										className: "c-quota-head",
										children: [(0, react_jsx_runtime.jsx)("h3", { children: t("quotaHeading") }), (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: "c-btn quiet",
											disabled: props.disabled === true || summary?.refreshing === true,
											onClick: () => {
												props.onRefresh?.(item.key);
											},
											children: summary?.refreshing === true ? t("refreshing") : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
												(0, react_jsx_runtime.jsx)(IconRefresh, {}),
												" ",
												t("refresh")
											] })
										})]
									}),
									(0, react_jsx_runtime.jsx)("div", {
										className: "c-quota-list",
										children: windows.length === 0 ? (0, react_jsx_runtime.jsx)("div", {
											className: "c-missing",
											children: summary?.status === "unsupported" ? t("unsupportedQuota") : summary?.status === "error" ? t("errorQuota") : summary?.status === "loading" ? t("loadingQuota") : t("connectToSee")
										}) : windows.map((quotaWindow) => {
											const reset = formatResetLabel(quotaWindow.resetsAt, quotaWindow.label, copy);
											return (0, react_jsx_runtime.jsx)(ProviderQuotaMeter, {
												label: quotaWindow.label,
												...quotaWindow.remainingPercent === void 0 ? {} : { remainingPercent: quotaWindow.remainingPercent },
												emptyLabel: quotaWindow.valueText,
												...reset === void 0 ? {} : { detail: reset }
											}, quotaWindow.id);
										})
									}),
									(0, react_jsx_runtime.jsxs)("div", {
										className: "c-quota-meta",
										children: [(0, react_jsx_runtime.jsx)("span", { children: t("quotaMeta") }), (0, react_jsx_runtime.jsxs)("span", { children: [
											t("systemZone"),
											" · ",
											Intl.DateTimeFormat().resolvedOptions().timeZone
										] })]
									})
								]
							}),
							(0, react_jsx_runtime.jsx)("div", {
								className: "c-plugin",
								children: card
							})
						]
					});
				}
				const primary = summary === void 0 ? void 0 : pickPrimaryWindow(summary.windows);
				const missing = primary !== void 0 ? void 0 : summary === void 0 || summary.status === "logged-out" ? t("connectToSee") : summary.status === "unsupported" ? t("unsupportedQuota") : summary.status === "loading" ? t("loadingQuota") : summary.status === "error" ? t("errorQuota") : t("connectToSee");
				const reset = primary === void 0 ? void 0 : formatResetLabel(primary.resetsAt, primary.label, copy);
				return (0, react_jsx_runtime.jsxs)("div", {
					className: "c-row-grid",
					"data-provider-row": item.key,
					"data-provider-role": role,
					children: [
						(0, react_jsx_runtime.jsx)("div", {
							className: "c-cell",
							children: identity
						}),
						(0, react_jsx_runtime.jsx)("div", {
							className: "c-mini",
							children: missing === void 0 && primary !== void 0 ? (0, react_jsx_runtime.jsx)(ProviderQuotaMeter, {
								label: windowName(primary, t),
								...primary.remainingPercent === void 0 ? {} : { remainingPercent: primary.remainingPercent },
								emptyLabel: primary.valueText,
								...reset === void 0 ? {} : { detail: reset }
							}) : (0, react_jsx_runtime.jsx)("div", {
								className: "c-missing",
								children: missing
							})
						}),
						(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "c-btn",
							"data-action": "open-provider",
							onClick: () => {
								setDetail(item.key);
							},
							children: t("details")
						})
					]
				});
			};
			const linkedCount = keys.filter((key) => {
				const account = props.accountOf?.(key);
				return linkState(key, account, props.usageSummaries?.find((entry) => entry.providerKey === key) ?? props.usageSummaries?.find((entry) => key.endsWith(entry.providerKey) || entry.providerKey.endsWith(key))) !== "unconnected";
			}).length;
			const body = keys.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
				className: "c-empty",
				children: t("empty")
			}) : (0, react_jsx_runtime.jsxs)("div", {
				className: "c-ledger",
				"data-providers-list": "",
				children: [detail === void 0 ? (0, react_jsx_runtime.jsxs)("div", {
					className: "c-labels",
					children: [
						(0, react_jsx_runtime.jsx)("span", { children: t("colProvider") }),
						(0, react_jsx_runtime.jsx)("span", { children: t("colQuota") }),
						(0, react_jsx_runtime.jsx)("span", { children: t("colConfig") })
					]
				}) : null, (0, react_jsx_runtime.jsx)(SortableList, {
					chrome: "plain",
					items,
					getId: (item) => item.key,
					dragLabel: (item) => t("drag") + ": " + item.key,
					sorting: sortable,
					...props.disabled === void 0 ? {} : { disabled: props.disabled },
					onReorder: (next) => {
						props.onReorder?.(next.map((item) => item.key));
					},
					renderItem: (item) => renderCard(item)
				})]
			});
			return (0, react_jsx_runtime.jsxs)("div", {
				"data-providers-section": PROVIDERS_LOCALE_NS,
				...sortable ? { "data-sorting": "" } : {},
				children: [
					(0, react_jsx_runtime.jsx)("style", { children: providerUiCss + providerShellCss + settingsCCss }),
					detail === void 0 ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						(0, react_jsx_runtime.jsxs)("header", {
							className: "c-page-title",
							children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("h2", { children: t("title") }), (0, react_jsx_runtime.jsx)("p", { children: t("subtitle") })] }), showToggle ? (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "c-btn c-sort",
								"aria-expanded": sorting,
								onClick: () => {
									setSorting((value) => !value);
								},
								children: sorting ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
									(0, react_jsx_runtime.jsx)(IconCheck, {}),
									" ",
									t("done")
								] }) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
									(0, react_jsx_runtime.jsx)(IconSort, {}),
									" ",
									t("sort")
								] })
							}) : null]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: "c-note",
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: "c-number",
									children: linkedCount
								}),
								(0, react_jsx_runtime.jsxs)("div", {
									className: "c-copy",
									children: [(0, react_jsx_runtime.jsx)("strong", { children: t("connectedCount") }), (0, react_jsx_runtime.jsx)("p", { children: t("connectedHint") })]
								}),
								(0, react_jsx_runtime.jsxs)("label", {
									className: "c-switch",
									children: [(0, react_jsx_runtime.jsx)("span", { children: t("sidebarToggle") }), (0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										role: "switch",
										"aria-label": t("sidebarToggle"),
										"aria-describedby": "sidebar-usage-hint",
										checked: props.showSidebarUsage !== false,
										disabled: props.disabled === true,
										onChange: (event) => {
											props.onShowSidebarUsage?.(event.target.checked);
										}
									})]
								}),
								(0, react_jsx_runtime.jsx)("span", {
									id: "sidebar-usage-hint",
									className: "sr-only",
									children: t("sidebarToggleHint")
								})
							]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: "c-filters",
							children: [(0, react_jsx_runtime.jsx)("div", {
								className: "c-row",
								children: [
									"all",
									"llm",
									"agent"
								].map((id) => (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "c-btn" + (filter === id ? "" : " quiet"),
									"aria-pressed": filter === id,
									onClick: () => {
										setFilter(id);
									},
									children: t(id === "all" ? "filterAll" : id === "llm" ? "filterLlm" : "filterAgent")
								}, id))
							}), (0, react_jsx_runtime.jsxs)("span", {
								className: "c-zone",
								children: [
									t("systemZone"),
									" · ",
									Intl.DateTimeFormat().resolvedOptions().timeZone
								]
							})]
						})
					] }) : (0, react_jsx_runtime.jsxs)("div", {
						className: "c-crumb",
						children: [
							(0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									setDetail(void 0);
								},
								children: [
									(0, react_jsx_runtime.jsx)(IconBack, {}),
									" ",
									t("breadcrumbOverview")
								]
							}),
							(0, react_jsx_runtime.jsx)("span", { children: "/" }),
							(0, react_jsx_runtime.jsx)("span", { children: props.usageSummaries?.find((entry) => entry.providerKey === detail)?.name ?? props.nameOf?.(detail) ?? detail })
						]
					}),
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
		//#region lib/types/client/ProviderUsagePanel.js
		/** Sidebar Provider Usage panel, prototype B (two-column minis). Controlled and UI-only: no RPC, no persistence. */
		function windowValueText(quotaWindow) {
			return quotaWindow.remainingPercent === void 0 ? quotaWindow.valueText : String(Math.round(quotaWindow.remainingPercent)) + "%";
		}
		function usageLow(remainingPercent) {
			return remainingPercent !== void 0 && remainingPercent <= 20;
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
						children: (0, react_jsx_runtime.jsx)(ProviderMark, { providerKey: props.summary.providerKey })
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
			"[data-provider-usage-panel] .pu-head{display:flex;align-items:center;height:24px;padding:0 2px 4px}",
			"[data-provider-usage-panel] .grow{flex:1;min-width:0}",
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
			"[data-provider-usage-panel] .pu-stage{width:100%;min-width:0;height:auto;max-height:min(70dvh,420px);overflow:auto;padding:1px;margin:-1px;scrollbar-width:thin}",
			"[data-provider-usage-panel] .pu-stage-open{max-height:none;overflow:visible}",
			"[data-provider-usage-panel] .pu-rows{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px}",
			"[data-provider-usage-panel] .pu-cell{position:relative;min-width:0}",
			"[data-provider-usage-panel] .pu-row{box-sizing:border-box;display:flex;align-items:center;gap:6px;width:100%;min-width:0;min-height:52px;padding:6px 8px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:inherit;text-align:left;cursor:pointer;outline:none}",
			"[data-provider-usage-panel] .pu-row:hover{border-color:var(--dsw-alias-label-tertiary)}",
			"[data-provider-usage-panel] .pu-row:focus-visible{box-shadow:0 0 0 1px var(--dsw-alias-border-l2)}",
			"[data-provider-usage-panel] .pu-mark{display:grid;place-items:center;flex:none;width:16px;height:16px;overflow:hidden}",
			"[data-provider-usage-panel] .pu-logo{display:block;width:18px;height:18px;color:var(--dsw-alias-label-secondary)}",
			"[data-provider-usage-panel] .pu-copy{display:flex;flex-direction:column;gap:0;min-width:0}",
			"[data-provider-usage-panel] .pu-icon{display:grid;place-items:center;flex:none;width:14px;height:14px;border-radius:4px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-module-platform);font-size:8px;font-weight:750}",
			"[data-provider-usage-panel] .pu-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-size:10px;font-weight:500;line-height:12px}",
			"[data-provider-usage-panel] .pu-stale{flex:none;margin-left:auto;color:var(--dsw-alias-label-tertiary);font-size:8px}",
			"[data-provider-usage-panel] .pu-primary{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-primary);font-size:13px;font-weight:650;line-height:16px;font-variant-numeric:tabular-nums}",
			"[data-provider-usage-panel] .pu-warn .pu-primary,[data-provider-usage-panel] .pu-tip-value.pu-warn{color:color-mix(in srgb,#c47b08 58%,var(--dsw-alias-label-secondary))}",
			"[data-provider-usage-panel] .pu-empty-text{color:var(--dsw-alias-label-tertiary);font-weight:550}",
			"[data-provider-usage-panel] .pu-detail{box-sizing:border-box;display:flex;flex-direction:column;width:100%;min-width:0;padding:0;border:1px solid var(--dsw-alias-border-l2);border-radius:14px;background:var(--dsw-alias-bg-layer-1);overflow:hidden}",
			"[data-provider-usage-panel] .pu-detail-head{display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--dsw-alias-border-l2);flex:none}",
			"[data-provider-usage-panel] .pu-detail-head .pu-icon-btn{width:44px;height:44px;min-height:44px}",
			"[data-provider-usage-panel] .pu-detail-body{padding:14px 12px;display:grid;gap:17px}",
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
			const low = usageLow(primary?.remainingPercent);
			return (0, react_jsx_runtime.jsx)("div", {
				className: "pu-cell",
				children: (0, react_jsx_runtime.jsxs)("div", {
					role: "button",
					tabIndex: 0,
					className: "pu-row" + (low ? " pu-warn" : ""),
					"data-usage-key": summary.providerKey,
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
						children: (0, react_jsx_runtime.jsx)(ProviderMark, { providerKey: summary.providerKey })
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
				})
			});
		}
		function UsageDetail(props) {
			const summary = props.summary;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: "pu-detail",
				"aria-label": summary.name + " 额度详情",
				children: [(0, react_jsx_runtime.jsxs)("div", {
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
							children: (0, react_jsx_runtime.jsx)(ProviderMark, { providerKey: summary.providerKey })
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: "pu-detail-name grow",
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
				}), (0, react_jsx_runtime.jsxs)("div", {
					className: "pu-detail-body",
					children: [(0, react_jsx_runtime.jsx)("div", {
						className: "pu-detail-sub",
						children: "剩余额度"
					}), summary.windows.length === 0 ? (0, react_jsx_runtime.jsx)("div", {
						className: "pu-tip-empty",
						children: STATUS_TEXT[summary.status]
					}) : summary.windows.map((quotaWindow) => {
						const reset = formatResetLabel(quotaWindow.resetsAt, quotaWindow.label, {
							at: "重置于 ",
							overdue: "已到期，等待更新 · ",
							missing: "{period} · 重置时间未提供"
						});
						return (0, react_jsx_runtime.jsx)(ProviderQuotaMeter, {
							label: quotaWindow.label,
							...quotaWindow.remainingPercent === void 0 ? {} : { remainingPercent: quotaWindow.remainingPercent },
							emptyLabel: quotaWindow.valueText,
							...reset === void 0 ? {} : { detail: reset }
						}, quotaWindow.id);
					})]
				})]
			});
		}
		/** Controlled sidebar Provider Usage panel (two-column minis, tap for details). */
		function ProviderUsagePanel(props) {
			const hidden = new Set(props.hiddenKeys ?? []);
			const visible = props.providers.filter((summary) => !hidden.has(summary.providerKey));
			const [filterOpen, setFilterOpen] = (0, react.useState)(false);
			const [detailKey, setDetailKey] = (0, react.useState)();
			const closeDetail = () => {
				const key = detailKey;
				setDetailKey(void 0);
				queueMicrotask(() => {
					const row = document.querySelector("[data-provider-usage-panel] [data-usage-key=\"" + key + "\"]");
					if (row instanceof HTMLElement) row.focus();
				});
			};
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
					if (event.key === "Escape") closeDetail();
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
					(0, react_jsx_runtime.jsx)("style", { children: providerUiCss + panelCss }),
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
								"aria-label": "刷新全部",
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
							onBack: closeDetail,
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
			const showSidebarUsage = (0, react.useSyncExternalStore)(props.subscribeSettings, props.readShowSidebarUsage, props.readShowSidebarUsage);
			if (!props.wide || !showSidebarUsage) return null;
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
		function installProviderUsage(ctx, orderScope, directory, onStore) {
			let connection;
			try {
				const candidate = ctx.get("connection");
				if (candidate === void 0 || candidate === null || typeof candidate !== "object" || !("rpc" in candidate)) return () => {};
				connection = candidate;
			} catch {
				return () => {};
			}
			const usage = createProviderUsageStore(connection.rpc, (key) => directory.reader(key));
			onStore?.(usage);
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
					reorder,
					subscribeSettings: (listener) => orderScope.subscribe(listener),
					readShowSidebarUsage: () => orderScope.getSnapshot().value?.showSidebarUsage ?? true
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
					...declaration.name === void 0 ? {} : { name: declaration.name },
					role: declaration.role ?? "llm",
					header: declaration.header ?? "legacy",
					detail: declaration.detail ?? "legacy",
					...declaration.usage === void 0 ? {} : { usage: declaration.usage },
					...declaration.account === void 0 ? {} : { account: declaration.account },
					...declaration.modelCount === void 0 ? {} : { modelCount: declaration.modelCount }
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
			* Read who renders the expanded detail.
			* @param key - Provider card key.
			* @returns shared for migrated cards, legacy otherwise.
			*/
			detailOf(key) {
				return this.entries.get(key)?.detail ?? "legacy";
			}
			/** Display name for the overview and detail title. */
			nameOf(key) {
				return this.entries.get(key)?.name;
			}
			/** Active model count, or undefined when the plugin does not report one. */
			modelCountOf(key) {
				return this.entries.get(key)?.modelCount?.();
			}
			/**
			* Tell listeners a provider's reported state changed (auth, models, label).
			* @param key - provider card key whose metadata changed.
			*/
			update(key) {
				if (!this.entries.has(key)) return;
				this.notify();
			}
			/** Overview connection only. Never returns an email. */
			accountOf(key) {
				return this.entries.get(key)?.account?.();
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
		* Grace before the missing-section diagnostic concludes that no Web settings
		* shell will declare the slot. The shell publishes `settings.section` only once
		* its own boot settles — later over a tunnel than from a local bundle — so
		* absence right after apply is not evidence of a missing shell.
		*/
		const MISSING_SECTION_GRACE_MS = 15e3;
		/**
		* Warn once when an available Host namespace has no Web section declaration.
		* Every trigger path — the timer and both subscriptions — calls {@link check},
		* so no path can reach the warning without passing its gates. A declaration
		* cancels the diagnostic for its lifetime, not just for the current check: a
		* shell that declared the seat and later collapsed it is a reload, and warning
		* during one is the same false positive this grace exists to prevent.
		* @param ctx - Web Cordis context with the public SlotCore face.
		* @param orderScope - client scope used to gate the page transaction.
		* @returns disposer for the deferred check and both subscriptions.
		*/
		function installMissingSectionDiagnostic(ctx, orderScope) {
			const startedAt = Date.now();
			let warned = false;
			let declared = false;
			const check = () => {
				if (warned || declared) return;
				if (ctx.slots.spec("settings.section") !== void 0) {
					declared = true;
					clearTimeout(timer);
					return;
				}
				if (Date.now() - startedAt < MISSING_SECTION_GRACE_MS) return;
				if (!pageVisible(orderScope.getSnapshot())) return;
				warned = true;
				console.warn("[dsh-llm-providers-ui] settings.section is missing; the Providers page cannot mount until the Web settings shell declares it.");
			};
			const timer = setTimeout(check, MISSING_SECTION_GRACE_MS);
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
		function installSectionTransaction(ctx, orderScope, t, directory, usageRef) {
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
						disabled: snapshot.status !== "ready" || !snapshot.writable,
						showSidebarUsage: snapshot.value?.showSidebarUsage ?? true
					};
				}, (keys) => {
					orderScope.set("order", keys);
				}, (key) => directory.roleOf(key), (show) => {
					orderScope.set("showSidebarUsage", show);
				}, (key) => directory.headerOf(key), () => usageRef.current?.getSnapshot().providers ?? [], (listener) => usageRef.current?.subscribe(listener) ?? (() => void 0), (key) => directory.accountOf(key), (key) => {
					key === void 0 ? usageRef.current?.refresh() : usageRef.current?.refresh([key]);
				}, (key) => directory.detailOf(key), (key) => directory.nameOf(key), (key) => directory.modelCountOf(key))));
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
					const usageRef = {};
					try {
						disposers.push(installProviderUsage(ctx, orderScope, directory, (store) => {
							usageRef.current = store;
						}));
					} catch (error) {
						console.warn("[dsh-llm-providers-ui] Provider Usage widget failed; keeping the Providers settings page", error);
					}
					disposers.push(installSectionTransaction(ctx, orderScope, () => t("nav"), directory, usageRef));
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
