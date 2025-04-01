"use client";

import LeaderboardCard from "./LeaderboardCard";
import LeaderboardLegend from "./LeaderboardLegend";
import RefreshButton from "../common/RefreshButton";

/**
 * Container component for the leaderboard tab
 * @param {Object} props - Component props
 * @param {Array} props.leaderboardData - Processed leaderboard data
 * @param {Set} props.animatingTeams - Set of team IDs that should animate
 * @param {string} props.teamId - Current team ID
 * @param {Function} props.fetchData - Function to refresh data
 */
export default function LeaderboardTab({
	leaderboardData,
	animatingTeams,
	teamId,
	fetchData,
}) {
	return (
		<div className="bg-white shadow-md rounded-lg p-6">
			<h2 className="text-xl font-semibold text-gray-800 mb-6">
				Competition Leaderboard
			</h2>

			<div className="mb-4 flex justify-end">
				<RefreshButton onClick={fetchData} text="Refresh Leaderboard" />
			</div>

			{/* Card-based leaderboard layout */}
			{leaderboardData.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{leaderboardData.map((team) => (
						<LeaderboardCard
							key={team.teamId}
							team={team}
							currentTeamId={teamId}
							animatingTeams={animatingTeams}
						/>
					))}
				</div>
			) : (
				<div className="text-center py-12 bg-gray-50 rounded-lg">
					<svg
						className="mx-auto h-12 w-12 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="1.5"
							d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
						/>
					</svg>
					<h3 className="mt-2 text-lg font-medium text-gray-900">
						No leaderboard data available
					</h3>
					<p className="mt-1 text-sm text-gray-500">
						Once teams submit solutions and they're reviewed, their
						rankings will appear here.
					</p>
				</div>
			)}

			{leaderboardData.length > 0 && (
				<LeaderboardLegend teamId={teamId} />
			)}
		</div>
	);
}
