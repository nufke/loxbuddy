type LogMessage = {
	date: Date;
	level: string
	message: string
}

export const consoleArray: LogMessage[] = [];

/**
 * Helper function to log message in list
 */
const logMsg = ( (args: any, level: LogLevel) => {
	const msg = {
		date: new Date(),
		level: LogLevelNames[level],
		message: args.join(' ') + '\n' 
	}
	consoleArray.push(msg); 
});

/**
 * Basic logger function using the console, since this is a client app running in a browser
 */
export const Logger = (() => {
	const _debug = console.debug;
	const _log = console.log;
  const _info = console.info;
  const _warn = console.warn;
  const _error = console.error;
	return function (logLevel: LogLevel, toList: boolean = false) {
		switch (logLevel) {
			case LogLevel.DEBUG: {
				console.debug = toList ? (...args) => { logMsg(args, LogLevel.DEBUG); _info.apply(console, args) } : _debug;
				console.log = toList ? (...args) => { logMsg(args, LogLevel.DEBUG); _info.apply(console, args) } : _log;
				console.info = toList ? (...args) => { logMsg(args, LogLevel.INFO); _info.apply(console, args) } : _info;
				console.warn = toList ? (...args) => { logMsg(args, LogLevel.WARN); _warn.apply(console, args) } : _warn;
				console.error = toList ? (...args) => { logMsg(args, LogLevel.ERROR); _error.apply(console, args) } : _error;
				break;
			}
			case LogLevel.INFO: {
				console.debug = () => {};
				console.log = toList ? (...args) => { logMsg(args, LogLevel.DEBUG); _info.apply(console, args) } : _log;
				console.info = toList ? (...args) => { logMsg(args, LogLevel.INFO); _info.apply(console, args) } : _info;
				console.warn = toList ? (...args) => { logMsg(args, LogLevel.WARN); _warn.apply(console, args) } : _warn;
				console.error = toList ? (...args) => { logMsg(args, LogLevel.ERROR); _error.apply(console, args) } : _error;
				break;
			}
			case LogLevel.WARN: {
				console.debug = () => {};
				console.log = toList ? (...args) => { logMsg(args, LogLevel.DEBUG); _info.apply(console, args) } : _log;
				console.info = () => {};
				console.warn = toList ? (...args) => { logMsg(args, LogLevel.WARN); _warn.apply(console, args) } : _warn;
				console.error = toList ? (...args) => { logMsg(args, LogLevel.ERROR); _error.apply(console, args) } : _error;
				break;
			}
			case LogLevel.ERROR: {
				console.debug = () => {};
				console.log = toList ? (...args) => { logMsg(args, LogLevel.DEBUG); _info.apply(console, args) } : _log;
				console.info = () => {};
				console.warn = () => {};
				console.error = toList ? (...args) => { logMsg(args, LogLevel.ERROR); _error.apply(console, args) } : _error;
				break;
			}
		}
	};
})();

/**
 * LogLevel enumeration to specify the logging level
 */
export const enum LogLevel {
	DEBUG = 4,
	INFO = 3,
	WARN = 2,
	ERROR = 1,
	NONE = 0
}

const LogLevelNames = ['', 'ERROR', 'WARNING', 'INFO', 'DEBUG'];
