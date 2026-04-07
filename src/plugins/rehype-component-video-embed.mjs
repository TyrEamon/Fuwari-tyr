/// <reference types="mdast" />
import { h } from "hastscript";

const DEFAULT_VIDEO_HOST = "https://v.kaza.de5.net";
const DEFAULT_PLAYER_PATH = "/player.html";
const DEFAULT_ASPECT_RATIO = "16 / 9";

function asString(value) {
	if (value == null) return "";
	return String(value).trim();
}

function normalizeCssSize(value, fallback) {
	const raw = asString(value);
	if (!raw) return fallback;
	if (/^\d+(\.\d+)?$/.test(raw)) return `${raw}px`;
	return raw;
}

function normalizeAspectRatio(value) {
	const raw = asString(value);
	if (!raw) return DEFAULT_ASPECT_RATIO;

	const fractionMatch = raw.match(/^(\d+(?:\.\d+)?)\s*[:/]\s*(\d+(?:\.\d+)?)$/);
	if (fractionMatch) {
		const left = Number(fractionMatch[1]);
		const right = Number(fractionMatch[2]);
		if (left > 0 && right > 0) return `${left} / ${right}`;
		return DEFAULT_ASPECT_RATIO;
	}

	const numeric = Number(raw);
	if (Number.isFinite(numeric) && numeric > 0) return String(numeric);

	return DEFAULT_ASPECT_RATIO;
}

function normalizePlayerType(value) {
	const raw = asString(value).toLowerCase();
	if (!raw) return "";
	if (raw === "h" || raw === "hls") return "hls";
	if (raw === "d" || raw === "dash") return "dash";
	return "";
}

function normalizeBool(value, fallback = false) {
	if (value == null || value === "") return fallback;
	if (typeof value === "boolean") return value;
	const raw = asString(value).toLowerCase();
	if (!raw) return fallback;
	if (["1", "true", "yes", "on"].includes(raw)) return true;
	if (["0", "false", "no", "off"].includes(raw)) return false;
	return fallback;
}

function stripTrailingSlash(value) {
	return value.replace(/\/+$/, "");
}

function ensureLeadingSlash(value) {
	if (!value) return "/";
	return value.startsWith("/") ? value : `/${value}`;
}

function toAbsoluteUrl(value, host) {
	const raw = asString(value);
	if (!raw) return "";
	if (/^https?:\/\//i.test(raw)) return raw;
	if (raw.startsWith("//")) return `https:${raw}`;
	const hostPrefix = stripTrailingSlash(asString(host) || DEFAULT_VIDEO_HOST);
	return `${hostPrefix}${ensureLeadingSlash(raw)}`;
}

function extractText(node) {
	if (!node) return "";
	if (typeof node.value === "string") return node.value;
	if (Array.isArray(node.children)) return node.children.map(extractText).join("");
	return "";
}

function normalizeDirectiveChildren(properties, children) {
	let remainingChildren = Array.isArray(children) ? [...children] : [];
	let labelText = "";

	if (properties?.["has-directive-label"] && remainingChildren.length > 0) {
		labelText = extractText(remainingChildren[0]).trim();
		remainingChildren = remainingChildren.slice(1);
	}

	return { labelText, remainingChildren };
}

function hasExplicitTargetAttrs(attrs) {
	if (!attrs || typeof attrs !== "object") return false;
	return Boolean(
		attrs.iframe ||
			attrs.url ||
			attrs.manifest ||
			attrs.playlist ||
			attrs.m ||
			attrs.src ||
			attrs.path ||
			attrs.route ||
			attrs.p ||
			attrs.v ||
			attrs.slug ||
			attrs.id,
	);
}

function parseVideoTargetInput(input) {
	const raw = asString(input);
	if (!raw) return { slug: "", inferredType: "", route: "" };

	const normalized = raw.replace(/^\//, "");

	const protoMatch = normalized.match(/^(h|d)\/(.+)$/i);
	if (protoMatch) {
		const slug = asString(protoMatch[2]);
		const type = protoMatch[1].toLowerCase() === "h" ? "hls" : "dash";
		return {
			slug,
			inferredType: type,
			route: `/${protoMatch[1].toLowerCase()}/${slug}`,
		};
	}

	if (raw.startsWith("/")) {
		return { slug: "", inferredType: "", route: raw };
	}

	return { slug: raw, inferredType: "", route: "" };
}

function looksLikePlayerPageUrl(value) {
	const raw = asString(value);
	if (!raw) return false;
	return /(?:^|\/)player\.html(?:[?#]|$)/i.test(raw);
}

function shouldUseIframeMode(attrs) {
	const mode = asString(attrs.mode || attrs.render || attrs.kind).toLowerCase();
	if (mode === "iframe" || mode === "page") return true;
	if (asString(attrs.iframe)) return true;
	const rawUrl = asString(attrs.url);
	return Boolean(rawUrl && looksLikePlayerPageUrl(rawUrl));
}

function buildIframePageSrc(attrs, labelSlug) {
	const explicitIframeUrl = asString(attrs.iframe || attrs.url);
	if (explicitIframeUrl) return explicitIframeUrl;

	const manifestSrc = asString(attrs.manifest || attrs.playlist || attrs.m || attrs.src);
	const pathSrc = asString(attrs.path || attrs.route || attrs.p);
	const targetInput = asString(attrs.v || attrs.slug || attrs.id || labelSlug);
	const parsedTarget = parseVideoTargetInput(targetInput);
	const slug = parsedTarget.slug;
	const type =
		normalizePlayerType(attrs.type || attrs.protocol || attrs.t) || parsedTarget.inferredType;
	const host = asString(attrs.host) || DEFAULT_VIDEO_HOST;
	const playerTarget = asString(attrs.player) || DEFAULT_PLAYER_PATH;

	let playerUrl = "";
	if (/^https?:\/\//i.test(playerTarget)) {
		playerUrl = playerTarget;
	} else {
		playerUrl = `${stripTrailingSlash(host)}${ensureLeadingSlash(playerTarget)}`;
	}

	const params = new URLSearchParams();
	if (manifestSrc) {
		params.set("src", manifestSrc);
	} else if (pathSrc) {
		params.set("src", pathSrc);
	} else if (parsedTarget.route) {
		params.set("src", parsedTarget.route);
	} else if (slug) {
		params.set("v", slug);
	} else {
		return "";
	}

	if (type === "hls" || type === "dash") {
		params.set("type", type);
	}

	const separator = playerUrl.includes("?") ? "&" : "?";
	return `${playerUrl}${separator}${params.toString()}`;
}

function buildStreamConfig(attrs, labelSlug) {
	const host = stripTrailingSlash(asString(attrs.host) || DEFAULT_VIDEO_HOST);
	const targetInput = asString(attrs.v || attrs.slug || attrs.id || labelSlug);
	const parsedTarget = parseVideoTargetInput(targetInput);
	const pathInput = asString(attrs.path || attrs.route || attrs.p);
	const parsedPath = pathInput ? parseVideoTargetInput(pathInput) : null;

	const slug = asString(parsedPath?.slug || parsedTarget.slug);
	const routePath = asString(parsedPath?.route || parsedTarget.route || pathInput);
	const type =
		normalizePlayerType(attrs.type || attrs.protocol || attrs.t) ||
		normalizePlayerType(parsedPath?.inferredType) ||
		normalizePlayerType(parsedTarget.inferredType);

	let explicitStream = asString(attrs.manifest || attrs.playlist || attrs.m || attrs.src);
	const rawUrl = asString(attrs.url);
	if (!explicitStream && rawUrl && !looksLikePlayerPageUrl(rawUrl)) {
		explicitStream = rawUrl;
	}

	const streamUrl = explicitStream
		? toAbsoluteUrl(explicitStream, host)
		: routePath
			? toAbsoluteUrl(routePath, host)
			: "";

	const safeSlug = slug ? encodeURIComponent(slug) : "";

	return {
		host,
		slug,
		type,
		streamUrl,
		routePath,
		hlsUrl: safeSlug ? `${host}/h/${safeSlug}` : "",
		dashUrl: safeSlug ? `${host}/d/${safeSlug}` : "",
		catalogUrl: `${host}/catalog.json`,
		preload: asString(attrs.preload) || "metadata",
		autoplay: normalizeBool(attrs.autoplay, false),
		muted: normalizeBool(attrs.muted, false),
		loop: normalizeBool(attrs.loop, false),
		poster: asString(attrs.poster) ? toAbsoluteUrl(attrs.poster, host) : "",
	};
}

function buildFigureStyles(attrs) {
	const ratio = normalizeAspectRatio(attrs.ratio || attrs.aspect);
	const radius = normalizeCssSize(attrs.radius || attrs.rounded, "12px");
	const margin = normalizeCssSize(attrs.margin, "1rem");

	const figureStyle = [`margin:${margin} 0;`, "width:100%;"].join("");

	const frameStyle = [
		"position:relative;",
		"width:100%;",
		`aspect-ratio:${ratio};`,
		"overflow:hidden;",
		`border-radius:${radius};`,
		"background:#000;",
		"box-shadow:0 6px 22px rgba(0,0,0,0.12);",
		"border:1px solid rgba(127,127,127,0.15);",
	].join("");

	return { figureStyle, frameStyle, radius };
}

function buildFigcaptionNode(attrs, remainingChildren) {
	const captionAttr = asString(attrs.caption);
	if (!captionAttr && (!Array.isArray(remainingChildren) || remainingChildren.length === 0)) {
		return null;
	}

	return h(
		"figcaption",
		{
			style:
				"margin-top:0.5rem;font-size:0.9rem;line-height:1.45;color:var(--text-secondary, var(--text-muted, #666));",
		},
		captionAttr || remainingChildren,
	);
}

function buildFigureBase(attrs) {
	const extraClass = Array.isArray(attrs.className)
		? attrs.className.join(" ")
		: asString(attrs.className || attrs.class);

	return {
		figureClass: ["video-embed-directive", extraClass].filter(Boolean).join(" "),
	};
}

function renderIframeFigure({ attrs, title, iframeSrc, remainingChildren }) {
	const { figureClass } = buildFigureBase(attrs);
	const { figureStyle, frameStyle } = buildFigureStyles(attrs);
	const figcaptionNode = buildFigcaptionNode(attrs, remainingChildren);
	const iframeStyle = [
		"position:absolute;",
		"inset:0;",
		"width:100%;",
		"height:100%;",
		"border:0;",
	].join("");

	const figureChildren = [
		h("div", { class: "video-embed-frame", style: frameStyle }, [
			h("iframe", {
				src: iframeSrc,
				title,
				loading: "lazy",
				allow: "autoplay; fullscreen; picture-in-picture",
				allowfullscreen: true,
				referrerpolicy: "no-referrer",
				style: iframeStyle,
			}),
		]),
	];

	if (figcaptionNode) {
		figureChildren.push(figcaptionNode);
	}

	return h(
		"figure",
		{
			class: figureClass,
			style: figureStyle,
			"data-embed-type": "video-iframe",
		},
		figureChildren,
	);
}

function renderInternalPlayerFigure({ attrs, title, streamConfig, remainingChildren }) {
	const { figureClass } = buildFigureBase(attrs);
	const { figureStyle, frameStyle, radius } = buildFigureStyles(attrs);
	const figcaptionNode = buildFigcaptionNode(attrs, remainingChildren);
	const playerId = `VP${Math.random().toString(36).slice(-7)}`;
	const configJson = JSON.stringify({
		...streamConfig,
		title,
	});

	const preload = streamConfig.preload || "metadata";
	const videoAttrs = {
		class: "fv-player-video",
		playsinline: true,
		"webkit-playsinline": "true",
		preload,
		crossorigin: "anonymous",
		style:
			"width:100%;height:100%;display:block;background:#000;object-fit:contain;position:relative;z-index:1;",
	};

	if (streamConfig.poster) {
		videoAttrs.poster = streamConfig.poster;
	}
	if (streamConfig.autoplay) {
		videoAttrs.autoplay = true;
	}
	if (streamConfig.muted) {
		videoAttrs.muted = true;
	}
	if (streamConfig.loop) {
		videoAttrs.loop = true;
	}

	const styleNode = h(
		"style",
		{ type: "text/css" },
		`
.fv-player-root{position:relative;width:100%;height:100%;background:#000;color:#fff;overflow:hidden}
.fv-player-overlay{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;z-index:3;transition:opacity .25s ease;background:linear-gradient(180deg,rgba(0,0,0,.14),rgba(0,0,0,.24))}
.fv-player-overlay[data-hidden="true"]{opacity:0}
.fv-player-overlay .fv-player-message{padding:.55rem .8rem;border-radius:999px;background:rgba(0,0,0,.62);backdrop-filter:blur(6px);font-size:.85rem;line-height:1.2;border:1px solid rgba(255,255,255,.12);box-shadow:0 6px 22px rgba(0,0,0,.25);max-width:min(92%,36rem);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fv-player-badge{position:absolute;top:.7rem;left:.7rem;z-index:4;display:flex;gap:.35rem;align-items:center;padding:.35rem .55rem;border-radius:999px;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.10);font-size:.72rem;line-height:1;color:#fff;pointer-events:none}
.fv-player-badge .dot{width:.4rem;height:.4rem;border-radius:999px;background:#7dd3fc;box-shadow:0 0 0 2px rgba(125,211,252,.18)}
.fv-player-badge[data-state="error"] .dot{background:#f87171;box-shadow:0 0 0 2px rgba(248,113,113,.15)}
.fv-player-badge[data-state="loading"] .dot,.fv-player-badge[data-state="buffering"] .dot{background:#fbbf24;box-shadow:0 0 0 2px rgba(251,191,36,.15)}
.fv-player-badge[data-state="playing"] .dot{background:#4ade80;box-shadow:0 0 0 2px rgba(74,222,128,.15)}
.fv-player-root .plyr{width:100%;height:100%;position:relative;z-index:2}
.fv-player-root .plyr__video-wrapper{background:#000}
.fv-player-root .plyr video{width:100%;height:100%;object-fit:contain;background:#000}
@media (prefers-reduced-motion: reduce){
  .fv-player-overlay{transition:none}
}
`,
	);

	const playerRoot = h(
		`div#${playerId}`,
		{
			class: "fv-player-root",
			"data-config": configJson,
			"data-init": "0",
			style: `border-radius:${radius};`,
		},
		[
			h("div", { class: "fv-player-badge", "data-role": "badge", "data-state": "loading" }, [
				h("span", { class: "dot", "aria-hidden": "true" }),
				h("span", { "data-role": "badge-text" }, "Loading"),
			]),
			h("div", { class: "fv-player-overlay", "data-role": "overlay", "data-hidden": "false" }, [
				h("div", { class: "fv-player-message", "data-role": "message" }, "Loading player..."),
			]),
			h("video", videoAttrs),
		],
	);

	const scriptNode = h(
		"script",
		{ type: "text/javascript" },
		`
(async function () {
  const root = document.getElementById(${JSON.stringify(playerId)});
  if (!root || root.dataset.init === "1") return;
  root.dataset.init = "1";

  const video = root.querySelector("video");
  const overlayEl = root.querySelector('[data-role="overlay"]');
  const messageEl = root.querySelector('[data-role="message"]');
  const badgeEl = root.querySelector('[data-role="badge"]');
  const badgeTextEl = root.querySelector('[data-role="badge-text"]');
  if (!video || !overlayEl || !messageEl || !badgeEl || !badgeTextEl) return;

  let config = {};
  try {
    config = JSON.parse(root.getAttribute("data-config") || "{}");
  } catch (_err) {
    config = {};
  }

  let hls = null;
  let dash = null;
  let plyr = null;
  let hasStartedPlayback = false;
  let candidateIndex = -1;
  let candidates = [];
  let currentLoadToken = 0;

  function inferTypeFromUrl(url) {
    const raw = String(url || "").toLowerCase();
    if (raw.includes("/h/")) return "hls";
    if (raw.includes("/d/")) return "dash";
    if (raw.endsWith(".m3u8")) return "hls";
    if (raw.endsWith(".mpd")) return "dash";
    return "";
  }

  function setBadge(text, state) {
    badgeTextEl.textContent = text || "";
    badgeEl.dataset.state = state || "info";
  }

  function showOverlay(text, state) {
    messageEl.textContent = text || "";
    overlayEl.dataset.hidden = "false";
    setBadge(text, state || "loading");
  }

  function hideOverlay() {
    overlayEl.dataset.hidden = "true";
    if (badgeEl.dataset.state !== "error") {
      setBadge("Playing", "playing");
    }
  }

  function setError(text) {
    messageEl.textContent = text || "Playback error";
    overlayEl.dataset.hidden = "false";
    setBadge("Error", "error");
  }

  function setBuffering(text) {
    overlayEl.dataset.hidden = "false";
    messageEl.textContent = text || "Buffering...";
    setBadge("Buffering", "buffering");
  }

  function cleanupEngines() {
    try {
      if (hls) {
        hls.destroy();
      }
    } catch (_err) {}
    hls = null;

    try {
      if (dash) {
        dash.reset();
      }
    } catch (_err) {}
    dash = null;

    try {
      video.removeAttribute("src");
      video.load();
    } catch (_err) {}
  }

  function addOnceVideoListener(type, handler) {
    const wrapped = function (event) {
      video.removeEventListener(type, wrapped);
      handler(event);
    };
    video.addEventListener(type, wrapped);
  }

  function wireVideoStateEvents() {
    if (video.dataset.fvStateWired === "1") return;
    video.dataset.fvStateWired = "1";

    video.addEventListener("playing", function () {
      hasStartedPlayback = true;
      hideOverlay();
    });

    video.addEventListener("canplay", function () {
      if (!video.paused) hideOverlay();
    });

    video.addEventListener("waiting", function () {
      if (!video.ended) {
        setBuffering("Buffering...");
      }
    });

    video.addEventListener("stalled", function () {
      if (!video.ended) {
        setBuffering("Loading data...");
      }
    });

    video.addEventListener("pause", function () {
      if (!video.ended && hasStartedPlayback && !video.seeking) {
        setBadge("Paused", "info");
      }
    });

    video.addEventListener("ended", function () {
      setBadge("Ended", "info");
    });
  }

  function loadCssOnce(href) {
    const key = "__fv_css__" + href;
    if (window[key]) return window[key];

    window[key] = new Promise(function (resolve, reject) {
      const existing = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).find(function (link) {
        return link.href === href;
      });
      if (existing) {
        resolve();
        return;
      }

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.onload = function () { resolve(); };
      link.onerror = function () { reject(new Error("Failed to load CSS: " + href)); };
      document.head.appendChild(link);
    });

    return window[key];
  }

  function loadScriptOnce(src, globalCheck) {
    const key = "__fv_js__" + src;
    if (globalCheck && globalCheck()) return Promise.resolve();
    if (window[key]) return window[key];

    window[key] = new Promise(function (resolve, reject) {
      if (globalCheck && globalCheck()) {
        resolve();
        return;
      }

      const existing = Array.from(document.querySelectorAll("script[src]")).find(function (script) {
        return script.src === src;
      });
      if (existing) {
        existing.addEventListener("load", function () { resolve(); }, { once: true });
        existing.addEventListener("error", function () { reject(new Error("Failed to load script: " + src)); }, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = function () { resolve(); };
      script.onerror = function () { reject(new Error("Failed to load script: " + src)); };
      document.head.appendChild(script);
    });

    return window[key];
  }

  async function ensurePlayerAssets() {
    if (!window.__fvPlayerAssetsPromise) {
      window.__fvPlayerAssetsPromise = (async function () {
        await loadCssOnce("https://cdn.jsdelivr.net/npm/plyr@3/dist/plyr.css");
        await Promise.all([
          loadScriptOnce("https://cdn.jsdelivr.net/npm/plyr@3/dist/plyr.polyfilled.min.js", function () { return !!window.Plyr; }),
          loadScriptOnce("https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js", function () { return !!window.Hls; }),
          loadScriptOnce("https://cdn.jsdelivr.net/npm/dashjs@4/dist/dash.all.min.js", function () { return !!(window.dashjs && window.dashjs.MediaPlayer); }),
        ]);
      })();
    }
    return window.__fvPlayerAssetsPromise;
  }

  function ensurePlyr() {
    if (plyr || !window.Plyr) return;
    plyr = new window.Plyr(video, {
      controls: [
        "play-large",
        "play",
        "progress",
        "current-time",
        "mute",
        "volume",
        "settings",
        "pip",
        "fullscreen"
      ],
      settings: ["speed"],
      speed: { selected: 1, options: [0.75, 1, 1.25, 1.5, 2] },
      keyboard: { focused: true, global: false },
      tooltips: { controls: true, seek: true }
    });
  }

  async function getCatalogItemBySlug() {
    if (!config.slug || !config.catalogUrl) return null;
    const cacheKey = "__fv_catalog_cache__" + String(config.catalogUrl);
    try {
      if (!window[cacheKey]) {
        window[cacheKey] = fetch(config.catalogUrl, { cache: "no-store" }).then(function (res) {
          if (!res.ok) throw new Error("catalog fetch failed: " + res.status);
          return res.json();
        });
      }
      const catalog = await window[cacheKey];
      const items = Array.isArray(catalog && catalog.items) ? catalog.items : [];
      return items.find(function (item) {
        return item && item.slug === config.slug;
      }) || null;
    } catch (_err) {
      return null;
    }
  }

  async function resolveCandidates() {
    const out = [];

    if (config.streamUrl) {
      out.push({
        type: config.type || inferTypeFromUrl(config.streamUrl) || "hls",
        url: config.streamUrl,
        source: "explicit"
      });
      return out;
    }

    if (config.type === "hls" && config.hlsUrl) {
      out.push({ type: "hls", url: config.hlsUrl, source: "slug-hls" });
      return out;
    }

    if (config.type === "dash" && config.dashUrl) {
      out.push({ type: "dash", url: config.dashUrl, source: "slug-dash" });
      return out;
    }

    if (config.slug) {
      const item = await getCatalogItemBySlug();
      if (item && item.protocols) {
        const host = String(config.host || "").replace(/\\/+$/, "");
        const addPathCandidate = function (path, type, source) {
          if (!path) return;
          const url = /^https?:\\/\\//i.test(path) ? path : host + (String(path).startsWith("/") ? path : "/" + path);
          out.push({ type, url, source });
        };

        const defaultType = String(item.protocols.defaultProtocol || "").toLowerCase();
        if (defaultType === "hls") {
          addPathCandidate(item.urls && item.urls.hls, "hls", "catalog-default");
          addPathCandidate(item.urls && item.urls.dash, "dash", "catalog-fallback");
        } else if (defaultType === "dash") {
          addPathCandidate(item.urls && item.urls.dash, "dash", "catalog-default");
          addPathCandidate(item.urls && item.urls.hls, "hls", "catalog-fallback");
        } else {
          addPathCandidate(item.urls && item.urls.hls, "hls", "catalog");
          addPathCandidate(item.urls && item.urls.dash, "dash", "catalog");
        }
      }
    }

    if (out.length === 0) {
      if (config.hlsUrl) out.push({ type: "hls", url: config.hlsUrl, source: "heuristic-hls" });
      if (config.dashUrl) out.push({ type: "dash", url: config.dashUrl, source: "heuristic-dash" });
    }

    const seen = new Set();
    return out.filter(function (item) {
      const key = item.type + "::" + item.url;
      if (!item.url || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function tryNextCandidate(reason) {
    const nextIndex = candidateIndex + 1;
    if (!Array.isArray(candidates) || nextIndex >= candidates.length) {
      setError(reason || "No compatible stream found");
      return;
    }
    loadCandidate(nextIndex, reason);
  }

  function attachNativeHls(url, token) {
    showOverlay("Loading HLS...", "loading");
    setBadge("HLS", "loading");

    addOnceVideoListener("loadedmetadata", function () {
      if (token !== currentLoadToken) return;
      setBadge("HLS", "info");
      if (config.autoplay) {
        video.play().catch(function () {});
      } else {
        overlayEl.dataset.hidden = "true";
      }
    });

    addOnceVideoListener("error", function () {
      if (token !== currentLoadToken) return;
      tryNextCandidate("HLS failed");
    });

    video.src = url;
    video.load();
  }

  function attachHls(url, token) {
    if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
      attachNativeHls(url, token);
      return;
    }

    if (!(window.Hls && window.Hls.isSupported && window.Hls.isSupported())) {
      tryNextCandidate("HLS not supported");
      return;
    }

    showOverlay("Loading HLS...", "loading");
    setBadge("HLS", "loading");

    hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: false
    });

    hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
      if (token !== currentLoadToken) return;
      hls.loadSource(url);
    });

    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
      if (token !== currentLoadToken) return;
      setBadge("HLS", "info");
      if (config.autoplay) {
        video.play().catch(function () {});
      } else {
        overlayEl.dataset.hidden = "true";
      }
    });

    hls.on(window.Hls.Events.ERROR, function (_event, data) {
      if (token !== currentLoadToken) return;
      const isFatal = Boolean(data && data.fatal);
      if (isFatal && !hasStartedPlayback) {
        tryNextCandidate("HLS load error");
        return;
      }
      if (isFatal) {
        setError("HLS playback error");
      }
    });

    hls.attachMedia(video);
  }

  function attachDash(url, token) {
    if (!(window.dashjs && window.dashjs.MediaPlayer)) {
      tryNextCandidate("DASH not supported");
      return;
    }

    showOverlay("Loading DASH...", "loading");
    setBadge("DASH", "loading");

    dash = window.dashjs.MediaPlayer().create();
    dash.initialize(video, url, false);
    if (typeof dash.updateSettings === "function") {
      try {
        dash.updateSettings({
          streaming: {
            lowLatencyEnabled: false
          }
        });
      } catch (_err) {}
    }

    const dashEvents = window.dashjs.MediaPlayer.events || {};
    if (dashEvents.STREAM_INITIALIZED) {
      dash.on(dashEvents.STREAM_INITIALIZED, function () {
        if (token !== currentLoadToken) return;
        setBadge("DASH", "info");
        overlayEl.dataset.hidden = "true";
        if (config.autoplay) {
          video.play().catch(function () {});
        }
      });
    }

    if (dashEvents.ERROR) {
      dash.on(dashEvents.ERROR, function (_event) {
        if (token !== currentLoadToken) return;
        if (!hasStartedPlayback) {
          tryNextCandidate("DASH load error");
          return;
        }
        setError("DASH playback error");
      });
    }
  }

  function loadCandidate(index, reason) {
    candidateIndex = index;
    currentLoadToken += 1;
    const token = currentLoadToken;
    hasStartedPlayback = false;
    cleanupEngines();

    const candidate = candidates[index];
    if (!candidate) {
      setError("No stream candidate");
      return;
    }

    const label = candidate.type === "dash" ? "DASH" : "HLS";
    showOverlay(reason ? "Retrying with " + label + "..." : "Loading " + label + "...", "loading");

    if (candidate.type === "dash") {
      attachDash(candidate.url, token);
      return;
    }

    attachHls(candidate.url, token);
  }

  wireVideoStateEvents();

  try {
    showOverlay("Loading player libraries...", "loading");
    await ensurePlayerAssets();
    ensurePlyr();

    candidates = await resolveCandidates();
    if (!candidates.length) {
      setError("No stream source resolved");
      return;
    }

    loadCandidate(0);
  } catch (error) {
    setError("Player init failed");
    console.error("[video-embed] init error", error);
  }
})();
`,
	);

	const figureChildren = [
		h("div", { class: "video-embed-frame", style: frameStyle }, [styleNode, playerRoot, scriptNode]),
	];

	if (figcaptionNode) {
		figureChildren.push(figcaptionNode);
	}

	return h(
		"figure",
		{
			class: figureClass,
			style: figureStyle,
			"data-embed-type": "video-player",
		},
		figureChildren,
	);
}

/**
 * Render a markdown video embed directive.
 *
 * Default behavior uses a built-in player (video + hls.js + dash.js + Plyr UI shell).
 * Optional legacy iframe/page mode:
 * ::vplayer{iframe="https://v.kaza.de5.net/player.html?v=001"}
 * ::vplayer{mode="iframe" v="001"}
 *
 * Supported examples:
 * ::v[001]
 * ::v[h/001]
 * ::v[d/e-m]
 * ::v[001]{type="hls"}
 * ::v[e-m]{t="d"}
 * ::vplayer{v="e-m" type="dash"}
 * ::vplayer{manifest="https://v.kaza.de5.net/e-m.mpd" type="dash"}
 * ::vplayer{path="/d/e-m"}
 */
export function VideoEmbedComponent(properties, children) {
	const attrs = properties || {};
	let { labelText, remainingChildren } = normalizeDirectiveChildren(attrs, children);

	if (!labelText && !hasExplicitTargetAttrs(attrs) && remainingChildren.length > 0) {
		const fallbackLabel = remainingChildren.map(extractText).join("").trim();
		if (fallbackLabel) {
			labelText = fallbackLabel;
			remainingChildren = [];
		}
	}

	const slugLike = asString(attrs.v || attrs.slug || attrs.id || labelText);
	const title = asString(attrs.title) || (slugLike ? `Video ${slugLike}` : "Embedded video");

	if (shouldUseIframeMode(attrs)) {
		const iframeSrc = buildIframePageSrc(attrs, labelText);
		if (!iframeSrc) {
			return h(
				"div",
				{ class: "hidden" },
				'Invalid vplayer directive. Use "::v[001]" / "::v[h/001]" or provide a valid iframe URL.',
			);
		}

		return renderIframeFigure({
			attrs,
			title,
			iframeSrc,
			remainingChildren,
		});
	}

	const streamConfig = buildStreamConfig(attrs, labelText);
	if (!streamConfig.streamUrl && !streamConfig.slug) {
		return h(
			"div",
			{ class: "hidden" },
			'Invalid vplayer directive. Use "::v[001]" / "::v[h/001]" / "::vplayer{manifest=\\"...\\"}".',
		);
	}

	return renderInternalPlayerFigure({
		attrs,
		title,
		streamConfig,
		remainingChildren,
	});
}
