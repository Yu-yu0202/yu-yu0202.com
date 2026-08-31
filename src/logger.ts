import { getTimeRotatingFileSink } from "@logtape/file";
import {
	configure,
	getAnsiColorFormatter,
	getConsoleSink,
	getJsonLinesFormatter,
	type LogRecord,
	getLogger as logtapeLogger,
	type Sink,
} from "@logtape/logtape";

const logDirectory = import.meta.env.DEV ? "./logs/" : "/var/log/astro-blog/";

const getFileSink = () =>
	getTimeRotatingFileSink({
		interval: "daily",
		directory: logDirectory,
		maxAgeMs: 30 * 24 * 60 * 60 * 1000,
		formatter: getJsonLinesFormatter(),
	});

const getLazyFileSink = (): Sink => {
	let sink: (Sink & Partial<Disposable>) | undefined;

	return Object.assign(
		(record: LogRecord) => {
			sink ??= getFileSink();
			sink(record);
		},
		{
			[Symbol.dispose]: () => sink?.[Symbol.dispose]?.(),
		},
	);
};

await configure({
	sinks: {
		console: getConsoleSink({ formatter: getAnsiColorFormatter() }),
		file: import.meta.env.DEV ? getFileSink() : getLazyFileSink(),
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
