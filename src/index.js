const ignoredPathsPreset = ['.svelte-kit/'];
import { exec } from 'child_process';

/**
 * @template {import('./types.d.ts').Options} Options
 */

/**
 * @param {Options} [options]
 * @param {Options['ignoredPaths']} [options.ignoredPaths] Contains a list of folders to be ignored on hot update
 * @example ['.svelte-kit/', 'donotincludethisfolder/']
 * @param {Options['command']} [options.command] Command to be run during every hot update. Defaults to `git --no-pager diff`
 * @param {Options['threshold']} [options.threshold] Minimum lines of code change before the plugins starts telling you to commit. Defaults to `50`
 * @param {Options['customInfo']} [options.customInfo] Personalize the info text being shown during every hot update. Use `{threshold}` and `{totalLinesChanged}` as placeholders
 * @example 'All good to go. You have less than {threshold} [{totalLinesChanged}] lines of unstaged changes.'
 * @param {Options['customWarn']} [options.customWarn] Personalize the warn text being shown during every hot update. Use `{thresold}` and `{totalLinesChanged}` as placeholders
 * @example '⛔⛔⛔ You have {totalLinesChanged} lines of unstaged changes. I think it\'s time to commit! ⛔⛔⛔'
 */
export default function gitDiffReminder(options) {
	if (!options) options = {};

	const ignoredPaths = [...ignoredPathsPreset, ...(options.ignoredPaths || [])];
	options.threshold = options.threshold || 50;

	return {
		name: 'git-diff-reminder',
		handleHotUpdate({ file }) {
			for (let i = 0; i < ignoredPaths.length; i++) {
				const ignoredPath = ignoredPaths[i];
				if (file.includes(ignoredPath)) return;
			}

			exec(options.command || 'git --no-pager diff', (err, stdout) => {
				if (!stdout) return;
				const diffString = stdout.split('\n');
				let addedLines = 0;
				let removedLines = 0;
				diffString.forEach((line) => {
					if (line.charAt(0) === '+' && line.charAt(1) !== '+') {
						addedLines++;
					}
					if (line.charAt(0) === '-' && line.charAt(1) !== '-') {
						removedLines++;
					}
				});

				const totalLinesChanged = addedLines > removedLines ? addedLines : removedLines;
				if (totalLinesChanged < options.threshold) {
					if (options.customInfo)
						console.log(options.customInfo.replaceAll('{threshold}', options.threshold).replaceAll('{totalLinesChanged}', options.totalLinesChanged));
					else console.log(`All good to go. You have less than ${options.threshold} [${totalLinesChanged}] lines of unstaged changes.`);
				} else {
					if (options.customWarn) console.warn(options.customWarn.replaceAll('{threshold}', options.threshold).replaceAll('{totalLinesChanged}'));
					else console.warn(`⛔⛔⛔ You have ${totalLinesChanged} lines of unstaged changes. I think it's time to commit! ⛔⛔⛔`);
				}
			});
		},
	};
}
