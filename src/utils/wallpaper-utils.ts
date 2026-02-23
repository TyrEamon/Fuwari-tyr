import type {
	DeviceImageSource,
	NavbarTransparentMode,
	ResponsiveImageSource,
	SiteConfig,
	WallpaperMode,
} from "@/types/config";

export const WALLPAPER_MODE_STORAGE_KEY = "wallpaper-mode";

export type WallpaperCapabilities = {
	enabled: boolean;
	banner: boolean;
	fullscreen: boolean;
};

function pickFirstSource(src?: DeviceImageSource): string | undefined {
	if (!src) return undefined;
	const values = Array.isArray(src) ? src : [src];
	for (const value of values) {
		if (typeof value !== "string") continue;
		const trimmed = value.trim();
		if (trimmed) return trimmed;
	}
	return undefined;
}

export function normalizeWallpaperMode(
	mode?: string | null,
	fallback: WallpaperMode = "fullscreen",
): WallpaperMode {
	if (mode === "banner" || mode === "fullscreen" || mode === "none") {
		return mode;
	}
	return fallback;
}

export function normalizeNavbarTransparentMode(
	mode?: string | null,
	fallback: NavbarTransparentMode = "semi",
): NavbarTransparentMode {
	if (mode === "semi" || mode === "full" || mode === "semifull") {
		return mode;
	}
	return fallback;
}

function getConfigCarrier(): HTMLElement | null {
	if (typeof document === "undefined") return null;
	const el = document.getElementById("config-carrier");
	return el instanceof HTMLElement ? el : null;
}

function parseBooleanDataset(value: string | undefined, fallback = false): boolean {
	if (value == null) return fallback;
	return value === "1" || value === "true";
}

export function getWallpaperCapabilitiesFromCarrier(): WallpaperCapabilities {
	const carrier = getConfigCarrier();
	if (!carrier) {
		return {
			enabled: true,
			banner: true,
			fullscreen: true,
		};
	}
	return {
		enabled: parseBooleanDataset(carrier.dataset.wallpaperEnabled, true),
		banner: parseBooleanDataset(carrier.dataset.wallpaperBannerEnabled, true),
		fullscreen: parseBooleanDataset(
			carrier.dataset.wallpaperFullscreenEnabled,
			true,
		),
	};
}

export function getDefaultWallpaperModeFromCarrier(): WallpaperMode {
	const carrier = getConfigCarrier();
	const fallback = "fullscreen";
	return normalizeWallpaperMode(carrier?.dataset.wallpaperModeDefault, fallback);
}

export function clampWallpaperModeByCapabilities(
	mode: WallpaperMode,
	caps: WallpaperCapabilities,
	fallback: WallpaperMode,
): WallpaperMode {
	if (!caps.enabled) return "none";
	if (mode === "banner" && !caps.banner) {
		return caps.fullscreen ? "fullscreen" : "none";
	}
	if (mode === "fullscreen" && !caps.fullscreen) {
		return caps.banner ? "banner" : "none";
	}
	if (mode === "none") return "none";
	return normalizeWallpaperMode(mode, fallback);
}

export function getWallpaperModeDefault(config: SiteConfig): WallpaperMode {
	if (config.wallpaper?.enable === false) return "none";

	const fallback: WallpaperMode = config.banner.enable
		? "banner"
		: config.background.enable
			? "fullscreen"
			: "none";

	return normalizeWallpaperMode(config.wallpaper?.modeDefault, fallback);
}

export function getNavbarTransparentModeForWallpaperMode(
	config: SiteConfig,
	mode: WallpaperMode,
): NavbarTransparentMode {
	if (mode === "banner") {
		return normalizeNavbarTransparentMode(
			config.wallpaper?.banner?.navbar?.transparentMode,
			"semifull",
		);
	}
	if (mode === "fullscreen") {
		return normalizeNavbarTransparentMode(
			config.wallpaper?.fullscreen?.navbar?.transparentMode,
			"full",
		);
	}
	return "semi";
}

function normalizeScrollThreshold(
	value: unknown,
	fallback = 20,
): number {
	if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
	if (value < 0) return 0;
	return value;
}

export function getNavbarScrollThresholdForWallpaperMode(
	config: SiteConfig,
	mode: WallpaperMode,
): number {
	if (mode === "banner") {
		return normalizeScrollThreshold(
			config.wallpaper?.banner?.navbar?.scrollThreshold,
			20,
		);
	}
	if (mode === "fullscreen") {
		return normalizeScrollThreshold(
			config.wallpaper?.fullscreen?.navbar?.scrollThreshold,
			20,
		);
	}
	return 20;
}

export function getStoredWallpaperMode(): WallpaperMode | null {
	if (typeof window === "undefined") return null;
	const stored = window.localStorage.getItem(WALLPAPER_MODE_STORAGE_KEY);
	if (!stored) return null;
	return normalizeWallpaperMode(stored);
}

export function setStoredWallpaperMode(mode: WallpaperMode): void {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(WALLPAPER_MODE_STORAGE_KEY, mode);
}

export function getActiveWallpaperModeForClient(): WallpaperMode {
	const caps = getWallpaperCapabilitiesFromCarrier();
	const fallback = clampWallpaperModeByCapabilities(
		getDefaultWallpaperModeFromCarrier(),
		caps,
		"fullscreen",
	);
	const stored = getStoredWallpaperMode();
	if (!stored) return fallback;
	return clampWallpaperModeByCapabilities(stored, caps, fallback);
}

export function applyWallpaperModeToDocument(mode: WallpaperMode): void {
	if (typeof document === "undefined") return;
	const root = document.documentElement;
	root.classList.remove(
		"wallpaper-mode-banner",
		"wallpaper-mode-fullscreen",
		"wallpaper-mode-none",
	);
	root.classList.add(`wallpaper-mode-${mode}`);

	if (mode === "banner") {
		root.classList.add("enable-banner");
	} else {
		root.classList.remove("enable-banner");
	}
	root.dataset.wallpaperMode = mode;
}

export function resolveResponsiveImageSource(
	src: ResponsiveImageSource | undefined,
	device: "desktop" | "mobile",
): string | undefined {
	if (!src) return undefined;
	if (typeof src === "string" || Array.isArray(src)) {
		return pickFirstSource(src);
	}

	const primary = pickFirstSource(src[device]);
	if (primary) return primary;

	const fallbackDevice = device === "desktop" ? "mobile" : "desktop";
	return pickFirstSource(src[fallbackDevice]);
}
