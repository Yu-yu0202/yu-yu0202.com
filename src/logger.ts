import { getTimeRotatingFileSink } from "@logtape/file";
import {
	configure,
	getAnsiColorFormatter,
	getConsoleSink,
	getJsonLinesFormatter,
	getLogger as logtapeLogger,
} from "@logtape/logtape";

const logDirectory = import.meta.env.DEV ? "./logs/" : "/var/log/astro-blog/";

await configure({
	sinks: {
		console: getConsoleSink({ formatter: getAnsiColorFormatter() }),
		file: getTimeRotatingFileSink({
			interval: "daily",
			directory: logDirectory,
			maxAgeMs: 30 * 24 * 60 * 60 * 1000,
			formatter: getJsonLinesFormatter(),
		}),
	},
	loggers: [
		{
			category: ["API"],
			sinks: ["console", "file"],
			lowestLevel: import.meta.env.DEV ? "debug" : "info",
		},
		{
			category: ["logtape", "meta"],
			sinks: ["console"],
			lowestLevel: "warning",
		},
	],
	reset: import.meta.env.DEV,
});

export const getLogger = logtapeLogger;
