import type { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "@constants/constants";

export type WallpaperMode = "banner" | "fullscreen" | "none";
export type NavbarTransparentMode = "semi" | "full" | "semifull";

export type DeviceImageSource = string | string[];

export type ResponsiveImageSource =
	| DeviceImageSource
	| {
			desktop?: DeviceImageSource;
			mobile?: DeviceImageSource;
	  };

export type SiteConfig = {
	title: string;
	subtitle: string;
	description?: string;
	keywords?: string[];

	lang: string;

	themeColor: {
		hue: number;
		fixed: boolean;
		forceDarkMode?: boolean;
	};
	wallpaper?: {
		enable?: boolean;
		modeDefault?: WallpaperMode;
		// Twilight-style structure (compatibility layer for staged migration).
		banner?: {
			navbar?: {
				transparentMode?: NavbarTransparentMode;
				scrollThreshold?: number;
			};
		};
		fullscreen?: {
			navbar?: {
				transparentMode?: NavbarTransparentMode;
				scrollThreshold?: number;
			};
			opacity?: number;
			blur?: number;
		};
		carousel?: {
			enable?: boolean;
			interval?: number;
			kenBurns?: boolean;
		};
	};
	banner: {
		enable: boolean;
		src: ResponsiveImageSource;
		position?: "top" | "center" | "bottom";
		credit: {
			enable: boolean;
			text: string;
			url?: string;
		};
	};
	background: {
		enable: boolean;
		src: ResponsiveImageSource;
		position?: "top" | "center" | "bottom";
		size?: "cover" | "contain" | "auto";
		repeat?: "no-repeat" | "repeat" | "repeat-x" | "repeat-y";
		attachment?: "fixed" | "scroll" | "local";
		opacity?: number;
	};
	splash?: {
		enable: boolean;
		title?: string;
		subtitle?: string;
		buttonText?: string;
		autoCloseMs?: number;
	};
	toc: {
		enable: boolean;
		depth: 1 | 2 | 3;
	};

	favicon: Favicon[];
	preconnect?: string[];
	officialSites?: (string | { url: string; alias: string })[];
	server?: {
		url: string;
		text: string;
	}[];
};

export type Favicon = {
	src: string;
	theme?: "light" | "dark";
	sizes?: string;
};

export enum LinkPreset {
	Home = 0,
	Archive = 1,
}

export type NavBarLink = {
	name: string;
	url: string;
	external?: boolean;
	icon?: string;
	description?: string;
	children?: (NavBarLink | LinkPreset)[];
};

export type NavBarConfig = {
	links: (NavBarLink | LinkPreset)[];
};

export type ProfileConfig = {
	avatar?: string;
	name: string;
	bio?: string;
	links: {
		name: string;
		url: string;
		icon: string;
	}[];
};

export type LicenseConfig = {
	enable: boolean;
	name: string;
	url: string;
};

export type ImageFallbackConfig = {
	enable: boolean;
	originalDomain: string;
	fallbackDomain: string;
};

export type UmamiConfig = {
	enable: boolean;
	baseUrl: string;
	shareId: string;
	timezone: string;
};

export type LIGHT_DARK_MODE =
	| typeof LIGHT_MODE
	| typeof DARK_MODE
	| typeof AUTO_MODE;

export type BlogPostData = {
	body: string;
	title: string;
	published: Date;
	description: string;
	tags: string[];
	category?: string | null;
	draft?: boolean;
	image?: string;
	prevTitle?: string;
	prevSlug?: string;
	nextTitle?: string;
	nextSlug?: string;
};

export type ExpressiveCodeConfig = {
	theme: string;
};

export type GitHubEditConfig = {
	enable: boolean;
	baseUrl: string;
};
