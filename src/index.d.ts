export type Options = {
	ignoredPaths?: string[];
	command?: string;
	threshold?: number;
	customInfo?: string;
	customWarn?: string;
};

declare module 'vite-plugin-git-diff-reminder';
