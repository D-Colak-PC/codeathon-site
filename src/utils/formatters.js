/**
 * Format date for submission in MM/DD/YY HH:MM:SS 12-hour format
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
		hour12: true,
	});
};

/**
 * Format date for display in the UI
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string or dash if no date
 */
export const formatDate = (date) => {
	if (!date) return "-";

	// Try to parse the date - handles both Date objects and string dates
	let dateObj;
	try {
		// If it's already a Date object, this will work fine
		// If it's a string or number, it will attempt to convert
		dateObj = new Date(date);

		// Check if we got a valid date
		if (isNaN(dateObj.getTime())) {
			// If it's a serial number from Excel/Google Sheets (e.g., 45747.94656)
			if (typeof date === "number" || !isNaN(parseFloat(date))) {
				const serialNumber = parseFloat(date);
				// Convert Excel/Google Sheets serial date to JavaScript Date
				// Excel's epoch starts on 1/1/1900, and Excel has a leap year bug
				const excelEpoch = new Date(1900, 0, 1);
				// Subtract 1 to account for Excel's leap year bug
				const daysOffset = serialNumber - 1;
				const millisecondsOffset = daysOffset * 24 * 60 * 60 * 1000;
				dateObj = new Date(excelEpoch.getTime() + millisecondsOffset);
			} else if (typeof date === "string") {
				// Handle the case where the date might have a leading apostrophe
				const cleanedDate = date.startsWith("'")
					? date.substring(1)
					: date;
				dateObj = new Date(cleanedDate);

				// Check again if we got a valid date after cleaning
				if (isNaN(dateObj.getTime())) {
					return "Invalid date";
				}
			} else {
				return "Invalid date";
			}
		}

		// Format the date in a user-friendly way
		return dateObj.toLocaleString("en-US", {
			month: "2-digit",
			day: "2-digit",
			year: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: true,
		});
	} catch (e) {
		console.error("Error parsing date:", e);
		return "Invalid date";
	}
};
