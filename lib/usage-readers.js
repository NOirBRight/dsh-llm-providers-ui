//#region lib/types/usage-readers.js
/** Bundle-safe quota reader factories: pure decode plus RPC reads. No ModuleLoader wrapper, no store. */
/** Plain-object guard shared by the reader factories and the sidebar cache validator. */
function recordUsageValue(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value) ? value : void 0;
}
const SECRET_KEY = /^(?:accessToken|refreshToken|access_token|refresh_token|id_token|idToken|token|apiKey|api_key)$/iu;
/** Reject any secret-shaped field before a provider response enters UI state. */
function secretFree(value) {
	if (Array.isArray(value)) return value.every(secretFree);
	const item = recordUsageValue(value);
	if (item === void 0) return true;
	return Object.entries(item).every(([key, child]) => !SECRET_KEY.test(key) && secretFree(child));
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
function displayNumber(value) {
	return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}
function percentage(value) {
	return Math.round(Math.max(0, Math.min(100, value)));
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
	const response = recordUsageValue(value);
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
	const usage = recordUsageValue(response.usage);
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
		const item = recordUsageValue(value);
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
		const item = recordUsageValue(value);
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
	const value = recordUsageValue(credits);
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
		const item = recordUsageValue(raw);
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
	return {
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
	const response = recordUsageValue(value);
	if (response === void 0 || !secretFree(response)) return {
		status: "error",
		message: "malformed usage response"
	};
	if (response.status === "signed-out" || response.status === "signing-in" || response.status === "reauth-required") return { status: "logged-out" };
	if (response.status !== "signed-in") return {
		status: "error",
		message: "Codex usage unavailable"
	};
	const usage = recordUsageValue(response.usage);
	if (usage === void 0 || !Array.isArray(usage.rateLimits)) return {
		status: "error",
		message: "malformed usage response"
	};
	const windows = [];
	for (const rateLimitValue of usage.rateLimits) {
		const rateLimit = recordUsageValue(rateLimitValue);
		if (rateLimit === void 0 || !nonEmptyString(rateLimit.id) || !Array.isArray(rateLimit.windows)) return {
			status: "error",
			message: "malformed usage response"
		};
		if (rateLimit.name !== void 0 && !nonEmptyString(rateLimit.name)) return {
			status: "error",
			message: "malformed usage response"
		};
		for (const [index, windowValue] of rateLimit.windows.entries()) {
			const quotaWindow = recordUsageValue(windowValue);
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
	const credits = recordUsageValue(usage.credits);
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
	const individual = recordUsageValue(usage.individualLimit);
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
const CODEX_USAGE_WAIT_MS = 15e3;
async function waitForCodexUsage(signal) {
	await new Promise((resolve, reject) => {
		const timer = setTimeout(resolve, 150);
		const onAbort = () => {
			clearTimeout(timer);
			reject(new DOMException("Aborted", "AbortError"));
		};
		if (signal.aborted) {
			onAbort();
			return;
		}
		signal.addEventListener("abort", onAbort, { once: true });
	});
}
async function readCodexUsage(rpc, signal) {
	const deadline = Date.now() + CODEX_USAGE_WAIT_MS;
	let last = {
		status: "error",
		message: "Codex usage unavailable"
	};
	while (!signal.aborted) {
		const result = await rpc.call("/codex", "auth/status", {}, signal);
		last = result.ok ? decodeCodexAuthStatus(result.value) : {
			status: "error",
			message: result.error.message
		};
		if (last.status !== "ready" || last.windows.length > 0 || Date.now() >= deadline) return last;
		await waitForCodexUsage(signal);
	}
	return last;
}
async function readUsage(rpc, channel, payload, signal, decode) {
	const result = await rpc.call(channel, "usage/read", payload, signal);
	return result.ok ? usageResult(result.value, decode) : {
		status: "error",
		message: result.error.message
	};
}
/** Create the Codex quota reader declared by the Codex client plugin. */
function createCodexUsageReader() {
	return {
		providerKey: "llm-codex",
		name: "Codex",
		read: (rpc, _refresh, signal) => readCodexUsage(rpc, signal)
	};
}
/** Create the Cursor quota reader declared by the Cursor client plugin. */
function createCursorUsageReader() {
	return {
		providerKey: "llm-cursor",
		name: "Cursor",
		read: async (rpc, refresh, signal) => {
			const first = await readUsage(rpc, "/cursor", refresh ? { refresh: true } : {}, signal, decodePercentUsage);
			if (first.status !== "unsupported") return first;
			return readUsage(rpc, "/cursor", { refresh: true }, signal, decodePercentUsage);
		}
	};
}
/** Create the Grok quota reader declared by the Grok client plugin. */
function createGrokUsageReader() {
	return {
		providerKey: "llm-grok",
		name: "Grok",
		read: (rpc, _refresh, signal) => readUsage(rpc, "/grok", {}, signal, decodePercentUsage)
	};
}
/** Create the Ollama Cloud quota reader declared by the Ollama client plugin. */
function createOllamaUsageReader() {
	return {
		providerKey: "llm-ollama",
		name: "Ollama Cloud",
		read: (rpc, _refresh, signal) => readUsage(rpc, "/ollama-cloud", {}, signal, (value) => decodeFractionUsage(["session", "weekly"], value))
	};
}
/** Create the CommandCode quota reader declared by the CommandCode client plugin. */
function createCommandCodeUsageReader() {
	return {
		providerKey: "llm-commandcode",
		name: "CommandCode",
		read: (rpc, _refresh, signal) => readUsage(rpc, "/commandcode", {}, signal, decodeCommandCodeUsage)
	};
}
/** Create the OpenCode Go quota reader declared by the OpenCode Go client plugin. */
function createOpenCodeGoUsageReader() {
	return {
		providerKey: "llm-opencode-go",
		name: "OpenCode Go",
		read: (rpc, _refresh, signal) => readUsage(rpc, "/opencode-go", {}, signal, (value) => decodeFractionUsage([
			"session",
			"weekly",
			"monthly"
		], value))
	};
}
//#endregion
export { createCodexUsageReader, createCommandCodeUsageReader, createCursorUsageReader, createGrokUsageReader, createOllamaUsageReader, createOpenCodeGoUsageReader, nonEmptyString, nonNegativeNumber, pickPrimaryWindow, recordUsageValue };
