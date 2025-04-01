"use client";

import { getRankStyle, getTeamAnimation } from "../../utils/styleHelpers";
import { formatDate } from "../../utils/formatters";

/**
 * Medal icon for top teams
 * @param {number} rank - Team rank
 * @returns {JSX.Element|null} Medal icon component or null
 */
const MedalIcon = ({ rank }) => {
	if (rank > 3) return null;

	const colors = {
		1: "bg-yellow-400",
		2: "bg-gray-300",
		3: "bg-amber-600",
	};

	return (
		<div
			className={`absolute -top-2 -right-2 w-8 h-8 ${colors[rank]} rounded-full flex items-center justify-center shadow-md transform rotate-12`}
		>
			<svg
				className="w-5 h-5 text-white"
				fill="currentColor"
				viewBox="0 0 20 20"
			>
				<path
					fillRule="evenodd"
					d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L10 6.477 6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z"
					clipRule="evenodd"
				/>
			</svg>
		</div>
	);
};

/**
 * Card component for a team in the leaderboard
 * @param {Object} props - Component props
 * @param {Object} props.team - Team data
 * @param {string} props.currentTeamId - Current user's team ID
 * @param {Set} props.animatingTeams - Set of teams currently animating
 */
export default function LeaderboardCard({
	team,
	currentTeamId,
	animatingTeams,
}) {
	return (
		<div
			className={`rounded-lg p-6 relative transition-all duration-300 ${getRankStyle(
				team.rank
			)} ${
				team.teamId === currentTeamId ? "ring-2 ring-blue-400" : ""
			} ${getTeamAnimation(team, animatingTeams)}`}
		>
			{/* Medal icon for top 3 */}
			<MedalIcon rank={team.rank} />

			{/* Rank number and Team ID */}
			<div className="flex items-center mb-4">
				<div className="text-6xl font-bold text-gray-800 mr-3">
					{team.rank}
				</div>

				<div>
					<div className="text-2xl font-semibold text-gray-700">
						Team {team.teamId}
					</div>
					{team.teamId === currentTeamId && (
						<div className="text-sm text-blue-500 font-medium">
							That's you!
						</div>
					)}
				</div>
			</div>

			{/* Stats section */}
			<div className="mt-4 border-t pt-4 border-gray-100">
				<div className="grid grid-cols-2 gap-4">
					<div>
						<div className="text-sm text-gray-500">
							Problems Solved
						</div>
						<div className="text-xl font-semibold text-gray-800">
							{team.problemsSolved}
						</div>
					</div>

					<div>
						<div className="text-sm text-gray-500">
							Last Problem
						</div>
						<div
							className="text-lg text-gray-800 truncate"
							title={team.lastProblem}
						>
							{team.lastProblem || "-"}
						</div>
					</div>
				</div>

				<div className="mt-3">
					<div className="text-sm text-gray-500">Last Submission</div>
					<div className="text-base text-gray-800">
						{formatDate(team.lastSubmission)}
					</div>
				</div>
			</div>
		</div>
	);
}
