import type {
	ExpressiveCodeConfig,
	GitHubEditConfig,
	ImageFallbackConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
	UmamiConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "RuneByte Blog",
	subtitle: "tyreamon的个人博客",
	description: "素未谋面的你,我是Tyr。欢迎来到我的博客，我将向你分享我的学习之路和日常琐事，如果你也对此感兴趣，不妨留下一的评论吧！v(^_^)v",

	keywords: ["你的关键词"],
	lang: "zh_CN", // 'en', 'zh_CN', 'zh_TW', 'ja', 'ko', 'es', 'th'
	themeColor: {
		hue: 361, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed:false, // Hide the theme color picker for visitors
		forceDarkMode:false, // Force dark mode and hide theme switcher
	},
	banner: {
		enable:false,
		src: "https://pan.0106010.xyz/file/MyFlie/NFSW/sex/1769178860081_BQACAgUAAyEGAATPToMLAAEBUUZpc3WAY0iS4mQWcnufg3C51f_BPAACTBsAAiICoFes82qJmjzLgDgE.jpg", // Relative to the /src directory. Relative to the /public directory if it starts with '/'

		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable:true, // Display the credit text of the banner image
			text: "banner来源", // Credit text to be displayed

			url: "https://pan.0106010.xyz/file/MyFlie/NFSW/sex/1769178860081_BQACAgUAAyEGAATPToMLAAEBUUZpc3WAY0iS4mQWcnufg3C51f_BPAACTBsAAiICoFes82qJmjzLgDgE.jpg", // (Optional) URL link to the original artwork or artist's page
		},
	},
	background: {
		enable:true, // Enable background image
		src: "/random/h",   //备用随机图：https://t.alcy.cc/ycy  Background image URL (supports HTTPS)
		position: "center", // Background position: 'top', 'center', 'bottom'
		size: "cover", // Background size: 'cover', 'contain', 'auto'
		repeat: "no-repeat", // Background repeat: 'no-repeat', 'repeat', 'repeat-x', 'repeat-y'
		attachment: "fixed", // Background attachment: 'fixed', 'scroll', 'local'
		opacity: 1, // Background opacity (0-1)
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	favicon: [
		{
			src: "https://pan.0106010.xyz/file/Logo/Blog/1769235233816_IMG_20260124_141233.jpg",
		},
	],
	preconnect: [
		"https://umamii.zeabur.app",
		"https://rapi.0w0.us.ci", 
	],
	officialSites: [],
	server: [],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		{
			name: "友链",
			url: "/friends/", // Internal links should not include the base path, as it is automatically added
			external: false, // Show an external link icon and will open in a new tab
		},
		{
			name: "赞助",
			url: "/sponsors/", // Internal links should not include the base path, as it is automatically added
			external: false, // Show an external link icon and will open in a new tab
		},
		{
			name: "关于",
			url: "/about/",
			external: false,
		},
		{
			name: "统计",
			url: "https://umamii.zeabur.app/share/C8gWpSlbh6hrKEUL",
			external: true,
		},
		{
			name: "网页导航",
			url: "https://www.6858686.xyz/",
			external: true,
		},
				{
			name: "图站",
			url: "https://b.0106010.xyz",
			external: true,
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "https://pan.0106010.xyz/file/Bimg/1769431532412_h1.webp", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "TyrEamon",
	bio: "爱折腾的小白,似乎什么都不会\n那就好好学吧！小子\n------------------------------------------------\nCurated, as you see | : )",
	links: [
		{
			name: "QQ",
			icon: "qq", // Local icon
			url: "https://2409355340",
		},
		{
			name: "Telegram",
			icon: "telegram", // Local icon
			url: "https://t.me/trytwos",
		},
		{
			name: "Bilibili",
			icon: "bilibili", // Local icon
			url: "https://space.bilibili.com/414666371",
		},
		{
			name: "GitHub",
			icon: "github", // Local icon
			url: "https://github.com/TyrEamon",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const imageFallbackConfig: ImageFallbackConfig = {
	enable: false,
	originalDomain: "原图域名",
	fallbackDomain: "备用域名",
};

export const umamiConfig: UmamiConfig = {
	enable: true,
	baseUrl: "https://umamii.zeabur.app",
	shareId: "C8gWpSlbh6hrKEUL",
	timezone: "Asia/Shanghai",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	theme: "github-dark",
};

export const gitHubEditConfig: GitHubEditConfig = {
	enable: false,
	baseUrl: "https://github.com/TyrEamon/my-blog/blob/main/src/content/posts",
};

// todoConfig removed from here






