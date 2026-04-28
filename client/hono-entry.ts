import {vikeHandler} from "./server/vike-handler";
import {Hono} from "hono";
import {createHandler} from "@universal-middleware/hono";
import {canonicalLogger, getLogger} from "./server/canonical_logger";
import pino from "pino";

const app = new Hono();
const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
const siteUrl = (
	process.env.PUBLIC_ENV__FRONT_URL ||
	metaEnv?.PUBLIC_ENV__FRONT_URL ||
	"https://assmac.com"
).replace(/\/$/, "");

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

const permanentRedirects: Record<string, string> = {
	"/pages/index": "/",
	"/pages/index/": "/",
	"/pages/sales-terms": "/cgv",
	"/pages/sales-terms/": "/cgv",
	"/pages/legal-notices": "/mention-legales",
	"/pages/legal-notices/": "/mention-legales",
};

Object.entries(permanentRedirects).forEach(([from, to]) => {
	app.get(from, (c) => c.redirect(to, 301));
});

app.get("/robots.txt", (c) => {
	return c.text(`User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`, 200, {
		"Content-Type": "text/plain; charset=utf-8",
		"Cache-Control": "public, max-age=3600",
	});
});

app.get("/sitemap.xml", (c) => {
	const urls = [
		`${siteUrl}/`,
		`${siteUrl}/cgv`,
		`${siteUrl}/mention-legales`,
	];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>
    <loc>${url}</loc>
  </url>`).join("\n")}
</urlset>
`;

	return c.body(body, 200, {
		"Content-Type": "application/xml; charset=utf-8",
		"Cache-Control": "public, max-age=3600",
	});
});


/**
 * Vike route
 *
 * @link {@see https://vike.dev}
 **/
app.all("*", createHandler(vikeHandler)());

export default app;
