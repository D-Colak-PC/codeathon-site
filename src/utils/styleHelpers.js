/**
 * Determine row background color based on submission status
 * @param {Object} row - The row data object
 * @returns {string} CSS class name
 */
export const getRowBackgroundColor = (row) => {
	const status = row["Status"];

	if (!status) return "bg-white";

	switch (status.trim()) {
		case "In Review":
			return "bg-yellow-100";
		case "Incorrect":
			return "bg-red-100";
		case "Correct":
			return "bg-green-100";
		case "Not Reviewed":
		default:
			return "bg-white";
	}
};

/**
 * Get style classes for rank position
 * @param {number} rank - The rank position
 * @returns {string} CSS class names
 */
export const getRankStyle = (rank) => {
	switch (rank) {
		case 1:
			return "border-4 border-yellow-400 bg-yellow-50 shadow-xl"; // Gold
		case 2:
			return "border-4 border-gray-300 bg-gray-50 shadow-lg"; // Silver
		case 3:
			return "border-4 border-amber-600 bg-amber-50 shadow-md"; // Bronze
		default:
			return "border border-gray-200 bg-white shadow-sm";
	}
};

/**
 * Get animation classes for team cards based on rank changes
 * @param {Object} team - Team data including rank info
 * @param {Set} animatingTeams - Set of team IDs that should animate
 * @returns {string} CSS animation class
 */
export const getTeamAnimation = (team, animatingTeams) => {
	if (!animatingTeams.has(team.teamId)) return "";

	// Team moved up in rank
	if (team.oldRank > team.rank) {
		return "animate-rank-improved";
	}

	// Team moved down in rank
	if (team.oldRank < team.rank) {
		return "animate-rank-decreased";
	}

	return "";
};
