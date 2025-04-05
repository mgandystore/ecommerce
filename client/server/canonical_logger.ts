import {type Context, type Env, Hono, type MiddlewareHandler, type Next} from 'hono';
import {randomUUID} from 'crypto';
import pino from 'pino';

// Configuration interface for the logger
export interface CanonicalLoggerOptions {
	logger?: pino.Logger;
	level?: string;
	redactHeaders?: string[];
	generateRequestId?: () => string;
	excludePaths?: (string | RegExp)[];
}

// Request metrics to track
interface RequestMetrics {
	startTime: number;
	endTime?: number;
	duration?: number;
}

// Log data collection container
interface LogContext {
	messages: Array<{ type: string, msg?: string, [key: string]: any }>;
	logger: pino.Logger;
}

// Function to check if a path should be excluded from logging
const shouldExcludePath = (path: string, excludePaths: (string | RegExp)[] = []): boolean => {
	return excludePaths.some(pattern => {
		if (pattern instanceof RegExp) {
			return pattern.test(path);
		}
		return path === pattern;
	});
};

// Main middleware factory function
// This function returns a middleware handler that logs requests and responses
export const canonicalLogger = (options: CanonicalLoggerOptions = {}): MiddlewareHandler => {
	// Setup defaults
	const {
		logger = pino(),
		level = 'info',
		redactHeaders = ['authorization', 'cookie', 'set-cookie'],
		excludePaths = [],
	} = options;

	// Return the middleware handler
	return async (c: Context, next: Next) => {
		// Skip logging for excluded paths
		if (shouldExcludePath(c.req.path, excludePaths)) {
			return next();
		}

		const requestId = c.req.header('x-request-id') || randomUUID()
		const method = c.req.method;
		const path = c.req.path;
		const url = new URL(c.req.url);

		// Extract route pattern from Hono context
		// This will be undefined until after 'next()' is called
		let routePattern: string | undefined;

		// Start tracking metrics
		const metrics: RequestMetrics = {
			startTime: performance.now(),
		};

		// Capture filtered headers
		const headers = Object.fromEntries(
			Object.entries(c.req.header())
				.filter(([key]: [string, string]) => !redactHeaders.includes(key.toLowerCase()))
				.map(([key, value]) => [key, value])
		);

		// Create child logger with request context
		const reqLogger = logger.child({
			requestId,
			method,
			path,
			query: Object.fromEntries(url.searchParams),
		});

		// Create log context to collect messages
		const logContext: LogContext = {
			messages: [],
			logger: reqLogger
		};

		// Add log collector with addCtx method
		c.set('logger', {
			addCtx: (obj: Record<string, any>) => {
				logContext.messages.push(obj);
				return logContext.logger;
			}
		});

		// Add request id to response headers
		c.header('x-request-id', requestId)
		c.set('request_id', requestId)

		// Initialize response status
		let responseStatus = c.res.status;
		let error: Error | null = null;

		try {
			// Process the request
			await next();

			// After next() is called, we can access the matched route
			routePattern = (c as any).req.routePath || c.req.path;
			responseStatus = c.res.status;
		} catch (err) {
			// Catch any errors
			pino().error(error, 'unable to execute code')
			error = err as Error;
			responseStatus = 500;
			throw err;
		} finally {
			// Complete metrics calculation
			metrics.endTime = performance.now();
			metrics.duration = metrics.endTime - metrics.startTime;

			// Create log entry with all collected data
			const logEntry: Record<string, any> = {
				headers,
				status: responseStatus,
				duration: Math.round(metrics.duration),
				routePattern, // Add the route pattern to the log
				events: logContext.messages,
			};

			// Add error information if present
			if (error) {
				pino().error(error, "there is an error");
				logEntry.error = {
					name: error.name,
					message: error.message,
					stack: error.stack ? error.stack.split('\n') : undefined,
				};
			}

			// Log single consolidated line
			if (error || responseStatus >= 500) {
				// Add error level explicitly for error tracking systems
				logEntry.level = 'error';
				reqLogger.error(logEntry);
			} else {
				logEntry.level = level;
				(reqLogger as any)[level](logEntry);
			}
		}
	};
};

// Utility to get the logger from the Hono context
export const getLogger = <E extends Env>(c: Context<E>): { addCtx: (obj: Record<string, any>) => any } => {
	return (c as any).get('logger') || {
		addCtx: () => {
		}
	};
};
