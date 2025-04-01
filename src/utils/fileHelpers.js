/**
 * Determines the programming language from a filename extension
 * @param {string} filename - The filename to check
 * @returns {string|null} The language or null if not supported
 */
export const getLanguageFromFilename = (filename) => {
	const extension = filename.split(".").pop().toLowerCase();
	switch (extension) {
		case "py":
			return "python";
		case "class":
			return "java";
		case "js":
			return "javascript";
		default:
			return null;
	}
};
