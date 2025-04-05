import {vikeHandler} from "./server/vike-handler";
import {Hono} from "hono";
import {createHandler} from "@universal-middleware/hono";
import {canonicalLogger, getLogger} from "@/server/canonical_logger";
import pino from "pino";

const app = new Hono();

app.onError((err, c) => {
	// @ts-ignore
	const requestId: string = c.get('request_id') || 'unknown';
	console.error(`Error in requestId ${requestId}:\n`, err);

	// Log the error with the logger (if available)
	try {
		const logger = getLogger(c);
		logger.addCtx({
			type: 'error',
			msg: err.message,
		});
	} catch (logErr) {
		pino().error(logErr, 'error while logging error');
	}

	return c.json({
		code: 500,
		message: 'Internal Server Error',
		requestId,
	}, 500);
});

// Add the logger middleware
app.use('*', canonicalLogger({
	level: 'info',
	excludePaths: ['/health', /^\/static\//],
}));


/**
 * Vike route
 *
 * @link {@see https://vike.dev}
 **/
app.all("*", createHandler(vikeHandler)());

export default app;
