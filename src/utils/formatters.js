/**
 * Format date for submission in MM/DD/YY HH:MM:SS format
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDateForSubmission = (date) => {
	return date.toLocaleString("en-US", {
		month: "2-digit",
		day: "2-digit",
		year: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	});
};

/**
 * Format date for display in the UI
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string or dash if no date
 */
export const formatDate = (date) => {
	if (!date) return "-";
	return new Date(date).toLocaleString();
};
