import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve(process.cwd(), "dist");

async function getPreferredOrigin() {
	const indexHtmlPath = path.join(distDir, "index.html");
	const html = await readFile(indexHtmlPath, "utf8");
	const rssHrefMatch = html.match(
		/<link\s+rel="alternate"[^>]*href="(https?:\/\/[^"]+)rss\.xml"/i,
	);
	if (rssHrefMatch?.[1]) {
		return rssHrefMatch[1].replace(/\/+$/, "");
	}

	const ogUrlMatch = html.match(
		/<meta\s+property="og:url"\s+content="(https?:\/\/[^"]+)"/i,
	);
	if (ogUrlMatch?.[1]) {
		return new URL(ogUrlMatch[1]).origin;
	}

	throw new Error("Unable to detect current site origin from dist/index.html");
}

function replaceSitemapOrigins(xml, preferredOrigin) {
	const locMatches = [...xml.matchAll(/<loc>(https?:\/\/[^<]+)<\/loc>/g)];
	if (!locMatches.length) return xml;

	const oldOrigins = new Set(
		locMatches.map((match) => {
			try {
				return new URL(match[1]).origin;
			} catch {
				return null;
			}
		}).filter(Boolean),
	);

	let nextXml = xml;
	for (const oldOrigin of oldOrigins) {
		if (oldOrigin === preferredOrigin) continue;
		nextXml = nextXml.split(oldOrigin).join(preferredOrigin);
	}
	return nextXml;
}

async function main() {
	const preferredOrigin = await getPreferredOrigin();
	const files = await readdir(distDir);
	const sitemapFiles = files.filter((name) => /^sitemap.*\.xml$/i.test(name));
	if (!sitemapFiles.length) return;

	for (const name of sitemapFiles) {
		const filePath = path.join(distDir, name);
		const original = await readFile(filePath, "utf8");
		const updated = replaceSitemapOrigins(original, preferredOrigin);
		if (updated !== original) {
			await writeFile(filePath, updated, "utf8");
			console.log(`[fix-sitemap-domain] updated ${name} -> ${preferredOrigin}`);
		}
	}
}

main().catch((error) => {
	console.error("[fix-sitemap-domain] failed:", error);
	process.exitCode = 1;
});
