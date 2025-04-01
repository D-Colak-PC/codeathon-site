"use client";

/**
 * Legend component for leaderboard rank meanings
 * @param {Object} props - Component props
 * @param {string} props.teamId - Current team ID
 */
export default function LeaderboardLegend({ teamId }) {
	const ranks = [
		{
			name: "Gold (1st Place)",
			color: "bg-yellow-400 border border-yellow-500",
		},
		{
			name: "Silver (2nd Place)",
			color: "bg-gray-300 border border-gray-400",
		},
		{
			name: "Bronze (3rd Place)",
			color: "bg-amber-600 border border-amber-700",
		},
	];

	return (
		<div className="mt-8 flex flex-wrap justify-center gap-4">
			{ranks.map((rank) => (
				<div key={rank.name} className="flex items-center">
					<div
						className={`w-4 h-4 rounded-full mr-2 ${rank.color}`}
					></div>
					<span className="text-sm text-gray-500">{rank.name}</span>
				</div>
			))}

			{teamId && (
				<div className="flex items-center">
					<div className="w-4 h-4 rounded-full mr-2 bg-blue-100 border-2 border-blue-400"></div>
					<span className="text-sm text-gray-500">Your Team</span>
				</div>
			)}
		</div>
	);
}
