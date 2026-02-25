/// <reference types="mdast" />
import { h } from "hastscript";

/**
 * Render a markdown music card directive.
 *
 * Supported examples:
 * ::music{meting="https://api.i-meto.com/meting/api?..."}
 * ::music{netease="1390882521"}
 * ::music{netease="playlist:123456789"}
 * ::music{title="..." artist="..." cover="..." audio="..." lrc="..."}
 */
export function MusicCardComponent(properties, children) {
	const attrs = properties || {};
	const METING_API = String(attrs.metingApi || "https://api.i-meto.com/meting/api");

	const buildShortcutMetingUrl = (server, rawValue) => {
		const raw = String(rawValue || "").trim();
		if (!raw) return "";

		let type = "song";
		let id = raw;

		// Support shorthand like "playlist:123456" or "song:1390882521"
		if (raw.includes(":")) {
			const [maybeType, ...rest] = raw.split(":");
			const joined = rest.join(":").trim();
			const normalizedType = maybeType.trim().toLowerCase();
			const allowedTypes = new Set(["song", "playlist", "album", "artist"]);
			if (allowedTypes.has(normalizedType) && joined) {
				type = normalizedType;
				id = joined;
			}
		}

		if (!id) return "";
		const params = new URLSearchParams({ server, type, id });
		return `${METING_API}?${params.toString()}`;
	};

	const resolvePath = (value) => {
		if (!value) return "";
		if (value.startsWith("http://") || value.startsWith("https://")) return value;
		if (value.startsWith("/")) return value;
		return `/${value}`;
	};

	const metingUrl =
		String(attrs.meting || "") ||
		buildShortcutMetingUrl("netease", attrs.netease) ||
		buildShortcutMetingUrl("tencent", attrs.qq) ||
		buildShortcutMetingUrl("kugou", attrs.kugou);
	const title = String(attrs.title || (metingUrl ? "Loading..." : "Unknown Title"));
	const artist = String(attrs.artist || (metingUrl ? "Loading..." : "Unknown Artist"));
	const coverSrc = resolvePath(String(attrs.cover || ""));
	const audioSrc = resolvePath(String(attrs.audio || ""));
	const lrcSrc = resolvePath(String(attrs.lrc || ""));

	const extractNodeText = (node) => {
		if (!node) return "";
		if (typeof node.value === "string") return node.value;
		if (Array.isArray(node.children)) return node.children.map(extractNodeText).join("");
		return "";
	};

	const inlineLyrics = (Array.isArray(children) ? children : [])
		.map(extractNodeText)
		.join("\n")
		.trim();

	const cardId = `MC${Math.random().toString(36).slice(-6)}`;

	const nCover = h("div", {
		class: "music-cover",
		style: coverSrc ? `background-image:url('${coverSrc}');` : "",
	});
	const nTitle = h("div", { class: "music-title" }, title);
	const nArtist = h("div", { class: "music-artist" }, artist);
	const nHeader = h("div", { class: "music-header" }, [nTitle, nArtist]);
	const nLyric = h(
		"div",
		{
			class: "music-lyric",
			id: `${cardId}-lyric`,
			style: "display:grid;place-items:center;",
		},
		[
			h("div", {
				class: "lyric-exit",
				style: "grid-area:1/1;opacity:0;pointer-events:none;",
			}),
			h("div", { class: "lyric-current", style: "grid-area:1/1;" }, "Loading lyrics..."),
		],
	);

	const nPlayBtn = h(
		"button",
		{ class: "play-btn", id: `${cardId}-play`, "aria-label": "Play/Pause", type: "button" },
		[
			h("svg", { viewBox: "0 0 24 24", class: "play-icon" }, [h("path", { d: "M8 5v14l11-7z" })]),
			h(
				"svg",
				{ viewBox: "0 0 24 24", class: "pause-icon", style: "display:none;" },
				[h("path", { d: "M6 19h4V5H6v14zm8-14v14h4V5h-4z" })],
			),
		],
	);
	const nProgressBar = h("div", { class: "progress-bar", id: `${cardId}-progress-bar` });
	const nProgressContainer = h("div", { class: "progress-container", id: `${cardId}-progress-container` }, [
		nProgressBar,
	]);
	const nTimeDisplay = h("div", { class: "time-display", id: `${cardId}-time` }, "0:00 / 0:00");
	const nControls = h("div", { class: "music-controls" }, [
		nPlayBtn,
		nProgressContainer,
		nTimeDisplay,
	]);

	const nInfo = h("div", { class: "music-info" }, [nHeader, nLyric, nControls]);
	const nAudio = h("audio", {
		id: `${cardId}-audio`,
		src: audioSrc,
		preload: "metadata",
	});

	const scriptContent = `
(async function () {
	const cardId = ${JSON.stringify(cardId)};
	const audio = document.getElementById(cardId + '-audio');
	const playBtn = document.getElementById(cardId + '-play');
	if (!audio || !playBtn) return;
	const playIcon = playBtn.querySelector('.play-icon');
	const pauseIcon = playBtn.querySelector('.pause-icon');
	const progressContainer = document.getElementById(cardId + '-progress-container');
	const progressBar = document.getElementById(cardId + '-progress-bar');
	const timeDisplay = document.getElementById(cardId + '-time');
	const lyricContainer = document.getElementById(cardId + '-lyric');
	const currentLyricEl = lyricContainer?.querySelector('.lyric-current');
	const exitLyricEl = lyricContainer?.querySelector('.lyric-exit');

	let isPlaying = false;
	let lyrics = [];
	let inlineLyrics = ${JSON.stringify(inlineLyrics)};
	let lrcSrc = ${JSON.stringify(lrcSrc)};
	const metingUrl = ${JSON.stringify(metingUrl)};

	function formatTime(seconds) {
		if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return mins + ":" + (secs < 10 ? "0" : "") + secs;
	}

	function parseTimestamp(token) {
		if (!token) return null;
		const normalized = token.trim().replaceAll("：", ":");
		if (!normalized) return null;
		if (normalized.includes(":")) {
			const parts = normalized.split(":", 2);
			const minute = Number(parts[0]);
			if (!Number.isFinite(minute)) return null;
			let second = 0;
			let fraction = 0;
			if (parts[1].includes(".")) {
				const tmp = parts[1].split(".", 2);
				second = Number(tmp[0]);
				if (!Number.isFinite(second)) return null;
				const frac = (tmp[1] || "0").replace(/[^\\d]/g, "");
				fraction = frac ? Number(frac) / Math.pow(10, frac.length) : 0;
			} else {
				second = Number(parts[1]);
				if (!Number.isFinite(second)) return null;
			}
			return minute * 60 + second + fraction;
		}
		if (normalized.includes(".")) {
			const tmp = normalized.split(".", 2);
			const second = Number(tmp[0]);
			if (!Number.isFinite(second)) return null;
			const frac = (tmp[1] || "0").replace(/[^\\d]/g, "");
			const fraction = frac ? Number(frac) / Math.pow(10, frac.length) : 0;
			return second + fraction;
		}
		const second = Number(normalized);
		return Number.isFinite(second) ? second : null;
	}

	function parseLRC(input) {
		if (!input) return [];
		const out = [];
		const lines = input.split(/\\r?\\n/);
		for (const line of lines) {
			const matches = [...line.matchAll(/\\[([^\\]]+)\\]/g)];
			const text = line.replace(/\\[([^\\]]+)\\]/g, "").trim();
			if (!matches.length) continue;
			for (const m of matches) {
				const time = parseTimestamp(m[1]);
				if (time == null || Number.isNaN(time)) continue;
				out.push({ time, text: text || "..." });
			}
		}
		out.sort((a, b) => a.time - b.time);
		return out;
	}

	function renderLyric(index) {
		if (!currentLyricEl) return;
		if (!lyrics.length) return;
		const current = (index >= 0 && index < lyrics.length) ? lyrics[index] : lyrics[0];
		const nextText = current ? (current.text || "...") : "...";
		if (currentLyricEl.innerText === nextText) return;
		const prevText = currentLyricEl.innerText || "";

		if (exitLyricEl && prevText) {
			exitLyricEl.innerText = prevText;
			if (typeof exitLyricEl.animate === "function") {
				exitLyricEl.getAnimations().forEach((a) => a.cancel());
				exitLyricEl.animate(
					[
						{ opacity: 1, transform: "translateY(0) scale(1)", filter: "blur(0px)" },
						{ opacity: 0, transform: "translateY(-12px) scale(0.992)", filter: "blur(2px)" },
					],
					{ duration: 460, easing: "cubic-bezier(0.22,1,0.36,1)", fill: "both" }
				);
			} else {
				exitLyricEl.style.opacity = "0";
			}
		}

		currentLyricEl.innerText = nextText;
		if (typeof currentLyricEl.animate === "function") {
			currentLyricEl.getAnimations().forEach((a) => a.cancel());
			currentLyricEl.animate(
				[
					{ opacity: 0, transform: "translateY(12px) scale(0.992)", filter: "blur(2px)" },
					{ opacity: 0.92, transform: "translateY(-1px) scale(1.001)", filter: "blur(0.35px)" },
					{ opacity: 1, transform: "translateY(0) scale(1)", filter: "blur(0px)" },
				],
				{ duration: 460, easing: "cubic-bezier(0.64,0,0.78,0)", fill: "both" }
			);
		}
	}

	async function loadLyrics() {
		let lrcText = inlineLyrics;
		if ((!lrcText || !lrcText.trim()) && lrcSrc) {
			try {
				if (lrcSrc.startsWith('http') || lrcSrc.startsWith('/')) {
					const res = await fetch(lrcSrc);
					if (res.ok) lrcText = await res.text();
				} else {
					lrcText = lrcSrc;
				}
			} catch (e) {
				console.warn('[music-card] lyric load failed', e);
			}
		}
		if (lrcText) {
			lyrics = parseLRC(lrcText);
			renderLyric(0);
		} else if (currentLyricEl) {
			currentLyricEl.innerText = ${JSON.stringify(`${title} - ${artist}`)};
		}
	}

	if (metingUrl) {
		try {
			const res = await fetch(metingUrl);
			const data = await res.json();
			const music = Array.isArray(data) ? data[0] : data;
			if (music) {
				const titleEl = document.querySelector('#' + cardId + '-card .music-title');
				const artistEl = document.querySelector('#' + cardId + '-card .music-artist');
				const coverEl = document.querySelector('#' + cardId + '-card .music-cover');
				if (titleEl) titleEl.innerText = music.title || ${JSON.stringify(title)};
				if (artistEl) artistEl.innerText = music.author || ${JSON.stringify(artist)};
				if (coverEl && music.pic) coverEl.style.backgroundImage = 'url("' + music.pic + '")';
				if (music.url) audio.src = music.url;
				if (music.lrc) {
					lrcSrc = music.lrc;
					inlineLyrics = "";
				}
				await loadLyrics();
			}
		} catch (e) {
			console.error('[music-card] meting fetch error:', e);
			if (currentLyricEl) currentLyricEl.innerText = "Error loading music data";
		}
	} else {
		await loadLyrics();
	}

	function updatePlayState() {
		if (!playIcon || !pauseIcon) return;
		if (isPlaying) {
			playIcon.style.display = 'none';
			pauseIcon.style.display = 'block';
			audio.play().catch((e) => {
				console.error('[music-card] play error', e);
				isPlaying = false;
				updatePlayState();
			});
		} else {
			playIcon.style.display = 'block';
			pauseIcon.style.display = 'none';
			audio.pause();
		}
	}

	playBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		isPlaying = !isPlaying;
		updatePlayState();
	});

	audio.addEventListener('timeupdate', () => {
		const current = audio.currentTime;
		const duration = audio.duration || 0;
		if (progressBar) progressBar.style.width = (duration > 0 ? (current / duration) * 100 : 0) + '%';
		if (timeDisplay) timeDisplay.innerText = formatTime(current) + ' / ' + formatTime(duration);
		if (lyrics.length) {
			let idx = -1;
			for (let i = 0; i < lyrics.length; i++) {
				if (current >= lyrics[i].time) idx = i;
				else break;
			}
			renderLyric(idx);
		}
	});

	audio.addEventListener('loadedmetadata', () => {
		if (timeDisplay) timeDisplay.innerText = "0:00 / " + formatTime(audio.duration);
	});

	audio.addEventListener('ended', () => {
		isPlaying = false;
		updatePlayState();
		if (progressBar) progressBar.style.width = '0%';
		if (timeDisplay) timeDisplay.innerText = "0:00 / " + formatTime(audio.duration);
		if (lyrics.length) renderLyric(0);
	});

	if (progressContainer) {
		progressContainer.addEventListener('click', (e) => {
			e.stopPropagation();
			const rect = progressContainer.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const percent = rect.width > 0 ? x / rect.width : 0;
			audio.currentTime = percent * (audio.duration || 0);
		});
	}
})();
`;

	const nScript = h("script", { type: "text/javascript" }, scriptContent);

	return h("div", { class: "card-music no-hue-rotate", id: `${cardId}-card` }, [
		nCover,
		nInfo,
		nAudio,
		nScript,
	]);
}
