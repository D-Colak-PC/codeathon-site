"use client";

import { useState, useRef } from "react";

/**
 * Process raw sheet data into leaderboard data
 * @param {Array} data - Raw data from sheet
 * @param {Object} rankingsRef - Ref to previous rankings
 * @returns {Object} Processed leaderboard data and related info
 */
const processLeaderboardData = (data, rankingsRef) => {
	if (!data || data.length === 0) {
		return { leaderboardData: [], animatingTeams: new Set() };
	}

	// Group submissions by team ID
	const teamSubmissions = {};

	data.forEach((submission) => {
		const teamId = submission["Team ID"];
		if (!teamId) return;

		if (!teamSubmissions[teamId]) {
			teamSubmissions[teamId] = [];
		}

		// Add this submission to the team's list
		teamSubmissions[teamId].push({
			problem: submission["Problem"],
			time: new Date(submission["Time"]),
			status: submission["Status"],
		});
	});

	// Calculate statistics for each team
	const leaderboardEntries = Object.keys(teamSubmissions).map((teamId) => {
		// Filter for only correct solutions
		const correctSubmissions = teamSubmissions[teamId].filter(
			(submission) => submission.status === "Correct"
		);

		// Count unique problems solved correctly
		const uniqueProblems = new Set(
			correctSubmissions.map((sub) => sub.problem)
		);
		const problemsSolved = uniqueProblems.size;

		// Find the most recent correct submission
		let lastSubmission = null;
		let lastProblem = "";

		if (correctSubmissions.length > 0) {
			// Sort by time, newest first
			const sortedSubmissions = [...correctSubmissions].sort(
				(a, b) => b.time - a.time
			);

			lastSubmission = sortedSubmissions[0].time;
			lastProblem = sortedSubmissions[0].problem;
		}

		return {
			teamId,
			problemsSolved,
			lastProblem,
			lastSubmission,
		};
	});

	// Sort the leaderboard:
	// 1. By problems solved (descending)
	// 2. Then by last submission time (ascending) if problems solved is equal
	const sortedLeaderboard = leaderboardEntries.sort((a, b) => {
		if (b.problemsSolved !== a.problemsSolved) {
			return b.problemsSolved - a.problemsSolved; // More problems = higher rank
		}

		// If same number of problems, earlier submission time wins
		if (a.lastSubmission && b.lastSubmission) {
			return a.lastSubmission - b.lastSubmission;
		}

		// If one team has no submissions, the team with submissions ranks higher
		if (a.lastSubmission) return -1;
		if (b.lastSubmission) return 1;

		// If neither has submissions, sort by team ID
		return parseInt(a.teamId) - parseInt(b.teamId);
	});

	// Add ranks and track rank changes
	const newRankings = {};
	const animatingTeams = new Set();

	const rankedLeaderboard = sortedLeaderboard.map((entry, index) => {
		const rankNum = index + 1;
		const oldRank = rankingsRef.current[entry.teamId] || rankNum;

		// Store new rank
		newRankings[entry.teamId] = rankNum;

		// Check if rank changed
		if (
			oldRank !== rankNum &&
			oldRank !== undefined &&
			Object.keys(rankingsRef.current).length > 0
		) {
			animatingTeams.add(entry.teamId);
		}

		return {
			rank: rankNum,
			oldRank,
			...entry,
		};
	});

	return {
		leaderboardData: rankedLeaderboard,
		newRankings,
		animatingTeams,
	};
};

/**
 * Hook to manage leaderboard data
 * @returns {Object} Leaderboard data and related state
 */
export const useLeaderboard = () => {
	const [leaderboardData, setLeaderboardData] = useState([]);
	const [prevRankings, setPrevRankings] = useState({});
	const [animatingTeams, setAnimatingTeams] = useState(new Set());

	const rankingsRef = useRef({});

	// Update leaderboard when new data is fetched
	const updateLeaderboard = (data) => {
		if (!data || !data.data) return;

		// Save previous rankings before updating
		setPrevRankings({ ...rankingsRef.current });

		// Process data for leaderboard
		const { leaderboardData, newRankings, animatingTeams } =
			processLeaderboardData(data.data, rankingsRef);

		// Update the rankings ref for the next comparison
		rankingsRef.current = newRankings;

		if (animatingTeams.size > 0) {
			setAnimatingTeams(animatingTeams);

			// Clear animations after they complete
			setTimeout(() => {
				setAnimatingTeams(new Set());
			}, 1500); // Match this to the animation duration
		}

		setLeaderboardData(leaderboardData);
	};

	return {
		leaderboardData,
		prevRankings,
		animatingTeams,
		updateLeaderboard,
	};
};
