"use client";

import { useState, useEffect } from "react";
import { useLeaderboard } from "../hooks/useLeaderboard";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import RefreshButton from "../components/common/RefreshButton";

// Define a standalone leaderboard card component without "That's you" indicator
const StandaloneLeaderboardCard = ({ team }) => {
	const getRankStyle = (rank) => {
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

	// Medal icon for top teams
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

	// Format date for display
	const formatDate = (date) => {
		if (!date) return "-";

		try {
			let dateObj = new Date(date);

			if (isNaN(dateObj.getTime())) {
				if (typeof date === "number" || !isNaN(parseFloat(date))) {
					const serialNumber = parseFloat(date);
					const excelEpoch = new Date(1900, 0, 1);
					const daysOffset = serialNumber - 1;
					const millisecondsOffset = daysOffset * 24 * 60 * 60 * 1000;
					dateObj = new Date(
						excelEpoch.getTime() + millisecondsOffset
					);
				} else if (typeof date === "string") {
					const cleanedDate = date.startsWith("'")
						? date.substring(1)
						: date;
					dateObj = new Date(cleanedDate);

					if (isNaN(dateObj.getTime())) {
						return "Invalid date";
					}
				} else {
					return "Invalid date";
				}
			}

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

	return (
		<div
			className={`rounded-lg p-6 relative transition-all duration-300 ${getRankStyle(
				team.rank
			)}`}
		>
			{/* Medal icon for top 3 */}
			<MedalIcon rank={team.rank} />

			{/* Rank number and Team ID */}
			<div className="flex items-center mb-4">
				<div className="text-6xl font-bold text-gray-800 mr-3">
					#{team.rank}
				</div>

				<div>
					<div className="text-2xl font-semibold text-gray-700">
						{team.teamId}
					</div>
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
};

// Standalone Leaderboard Legend
const StandaloneLegend = () => {
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
		</div>
	);
};

// Custom hook to fetch and process data for the leaderboard
const useStandaloneLeaderboard = () => {
	const [data, setData] = useState({ headers: [], data: [] });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [lastUpdated, setLastUpdated] = useState(null);
	const leaderboardHook = useLeaderboard();

	const fetchData = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/getSheetData");

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				console.error(
					"API response not OK:",
					response.status,
					errorData
				);
				setError(
					`API error: ${response.status} - ${
						errorData.error || "Unknown error"
					}`
				);
				setLoading(false);
				return;
			}

			const result = await response.json();
			setData(result);
			leaderboardHook.updateLeaderboard(result);
			setLastUpdated(new Date());
			setError(null);
		} catch (err) {
			console.error("Error fetching leaderboard data:", err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	// Fetch data immediately and set up polling
	useEffect(() => {
		fetchData();
		const intervalId = setInterval(fetchData, 60000); // Poll every 60 seconds

		return () => clearInterval(intervalId);
	}, []);

	return {
		leaderboardData: leaderboardHook.leaderboardData,
		animatingTeams: leaderboardHook.animatingTeams,
		loading,
		error,
		lastUpdated,
		fetchData,
	};
};

// Main Leaderboard Page
export default function StandaloneLeaderboardPage() {
	const {
		leaderboardData,
		animatingTeams,
		loading,
		error,
		lastUpdated,
		fetchData,
	} = useStandaloneLeaderboard();

	if (loading && leaderboardData.length === 0) {
		return <LoadingState />;
	}

	if (error) {
		return <ErrorState error={error} onRetry={fetchData} />;
	}

	return (
		<div className="container mx-auto py-6 px-4">
			<div className="text-center mb-6">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					Coding Competition Leaderboard
				</h1>
				{lastUpdated && (
					<p className="text-sm text-gray-500">
						Data last updated: {lastUpdated.toLocaleTimeString()}
						<span className="ml-1 inline-flex h-2 w-2 bg-green-400 rounded-full animate-pulse"></span>
					</p>
				)}
			</div>

			<div className="bg-white shadow-md rounded-lg p-6">
				<div className="mb-4 flex justify-end">
					<RefreshButton
						onClick={fetchData}
						text="Refresh Leaderboard"
					/>
				</div>

				{/* Card-based leaderboard layout */}
				{leaderboardData.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{leaderboardData.map((team) => (
							<StandaloneLeaderboardCard
								key={team.teamId}
								team={team}
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
							Once teams submit solutions and they're reviewed,
							their rankings will appear here.
						</p>
					</div>
				)}

				{leaderboardData.length > 0 && <StandaloneLegend />}
			</div>

			<div className="mt-4 text-center text-xs text-gray-400">
				Data refreshes automatically every 10 seconds
			</div>
		</div>
	);
}
