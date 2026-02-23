<script lang="ts">
import type { WallpaperMode } from "@/types/config";
import Icon from "@iconify/svelte";
import {
	applyWallpaperModeToDocument,
	clampWallpaperModeByCapabilities,
	getActiveWallpaperModeForClient,
	getDefaultWallpaperModeFromCarrier,
	getWallpaperCapabilitiesFromCarrier,
	setStoredWallpaperMode,
} from "@utils/wallpaper-utils";
import { onMount } from "svelte";

const BREAKPOINT_LG = 1024;
const modeSeq: WallpaperMode[] = ["banner", "fullscreen", "none"];

let wallpaperMode: WallpaperMode = "fullscreen";
let wallpaperCapabilities = {
	enabled: true,
	banner: true,
	fullscreen: true,
};
let isOpen = false;
let isRefreshingWallpaper = false;
let refreshTimer: number | undefined;

function applyMode(mode: WallpaperMode) {
	const fallback = clampWallpaperModeByCapabilities(
		getDefaultWallpaperModeFromCarrier(),
		wallpaperCapabilities,
		"fullscreen",
	);
	const nextMode = clampWallpaperModeByCapabilities(mode, wallpaperCapabilities, fallback);
	if (nextMode === wallpaperMode) return;
	wallpaperMode = nextMode;
	setStoredWallpaperMode(nextMode);
	applyWallpaperModeToDocument(nextMode);
	window.dispatchEvent(
		new CustomEvent("wallpaper:mode-change", {
			detail: { mode: nextMode },
		}),
	);
}

function cycleWallpaperMode() {
	const startIndex = Math.max(0, modeSeq.indexOf(wallpaperMode));
	for (let step = 1; step <= modeSeq.length; step++) {
		const candidate = modeSeq[(startIndex + step) % modeSeq.length];
		const fallback = clampWallpaperModeByCapabilities(
			getDefaultWallpaperModeFromCarrier(),
			wallpaperCapabilities,
			"fullscreen",
		);
		const clamped = clampWallpaperModeByCapabilities(
			candidate,
			wallpaperCapabilities,
			fallback,
		);
		if (clamped === candidate) {
			applyMode(candidate);
			return;
		}
	}
}

function openPanel() {
	isOpen = true;
}

function closePanel() {
	isOpen = false;
}

function togglePanel() {
	isOpen = !isOpen;
}

function handleSwitchClick() {
	if (window.innerWidth < BREAKPOINT_LG) {
		togglePanel();
		return;
	}
	cycleWallpaperMode();
}

function chooseMode(mode: WallpaperMode) {
	applyMode(mode);
	closePanel();
}

function refreshWallpaper() {
	if (wallpaperMode === "none" || isRefreshingWallpaper) return;
	isRefreshingWallpaper = true;
	const win = window as Window & {
		refreshWallpaperNow?: (mode?: WallpaperMode | "current") => boolean;
	};
	if (typeof win.refreshWallpaperNow === "function") {
		win.refreshWallpaperNow("current");
	} else {
		window.dispatchEvent(
			new CustomEvent("wallpaper:refresh-request", {
				detail: { mode: "current" },
			}),
		);
	}
	clearTimeout(refreshTimer);
	refreshTimer = window.setTimeout(() => {
		isRefreshingWallpaper = false;
	}, 600);
}

function handleDocumentClick(event: MouseEvent) {
	if (!isOpen) return;
	const target = event.target;
	if (!(target instanceof Node)) return;
	const panel = document.getElementById("wallpaper-mode-panel");
	const btn = document.getElementById("wallpaper-mode-switch");
	if (panel?.contains(target) || btn?.contains(target)) return;
	closePanel();
}

onMount(() => {
	wallpaperCapabilities = getWallpaperCapabilitiesFromCarrier();
	wallpaperMode = getActiveWallpaperModeForClient();
	document.addEventListener("click", handleDocumentClick);
	window.addEventListener("wallpaper:mode-change", () => {
		wallpaperMode = getActiveWallpaperModeForClient();
	});
	return () => {
		document.removeEventListener("click", handleDocumentClick);
		clearTimeout(refreshTimer);
	};
});
</script>

{#if wallpaperCapabilities.enabled}
	<div class="relative z-50 hidden md:block" role="menu" tabindex="-1" on:mouseleave={closePanel}>
		<button
			aria-label="Wallpaper Mode"
			role="menuitem"
			class="relative btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90"
			id="wallpaper-mode-switch"
			on:mouseenter={openPanel}
			on:click={handleSwitchClick}
		>
			<div class="absolute inset-0 flex items-center justify-center transition-opacity" class:opacity-0={wallpaperMode !== "banner"}>
				<Icon icon="material-symbols:image-outline-rounded" class="text-[1.25rem]" />
			</div>
			<div class="absolute inset-0 flex items-center justify-center transition-opacity" class:opacity-0={wallpaperMode !== "fullscreen"}>
				<Icon icon="material-symbols:wallpaper-rounded" class="text-[1.25rem]" />
			</div>
			<div class="absolute inset-0 flex items-center justify-center transition-opacity" class:opacity-0={wallpaperMode !== "none"}>
				<Icon icon="material-symbols:hide-image-outline-rounded" class="text-[1.25rem]" />
			</div>
		</button>

		<div
			id="wallpaper-mode-panel"
			class="absolute transition top-11 -right-2 pt-5"
			class:float-panel-closed={!isOpen}
		>
			<div class="float-panel card-base min-w-[8.25rem] p-1">
				<button
					class="wallpaper-mode-item"
					class:is-active={wallpaperMode === "banner"}
					disabled={!wallpaperCapabilities.banner}
					on:click={() => chooseMode("banner")}
				>
					<Icon icon="material-symbols:image-outline-rounded" class="text-[1.15rem]" />
					<span>横幅模式</span>
				</button>
				<button
					class="wallpaper-mode-item"
					class:is-active={wallpaperMode === "fullscreen"}
					disabled={!wallpaperCapabilities.fullscreen}
					on:click={() => chooseMode("fullscreen")}
				>
					<Icon icon="material-symbols:wallpaper-rounded" class="text-[1.15rem]" />
					<span>全屏模式</span>
				</button>
				<button
					class="wallpaper-mode-item"
					class:is-active={wallpaperMode === "none"}
					on:click={() => chooseMode("none")}
				>
					<Icon icon="material-symbols:hide-image-outline-rounded" class="text-[1.15rem]" />
					<span>无图模式</span>
				</button>
				<div class="my-1 h-px bg-black/8 dark:bg-white/8"></div>
				<button
					class="wallpaper-mode-item"
					disabled={wallpaperMode === "none" || isRefreshingWallpaper}
					on:click={refreshWallpaper}
				>
					<Icon
						icon="material-symbols:refresh-rounded"
						class={`text-[1.15rem]${isRefreshingWallpaper ? " animate-spin" : ""}`}
					/>
					<span>换一张</span>
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.wallpaper-mode-item {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.65rem;
		padding: 0.55rem 0.75rem;
		border-radius: 0.6rem;
		color: rgba(0, 0, 0, 0.72);
		font-weight: 600;
		transition: color 0.15s ease, background-color 0.15s ease, opacity 0.15s ease;
	}

	:root.dark .wallpaper-mode-item {
		color: rgba(255, 255, 255, 0.78);
	}

	.wallpaper-mode-item:hover:not(:disabled) {
		background: var(--btn-plain-bg-hover);
		color: var(--primary);
	}

	.wallpaper-mode-item:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.wallpaper-mode-item.is-active {
		background: color-mix(in srgb, var(--primary), transparent 88%);
		color: var(--primary);
	}

	:root.dark .wallpaper-mode-item.is-active {
		background: color-mix(in srgb, var(--primary), transparent 84%);
	}
</style>

