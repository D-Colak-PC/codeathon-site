"use client";

import { useState, useEffect } from "react";

// Hooks
import { useTeamId } from "../hooks/useTeamId";
import { useSheetData } from "../hooks/useSheetData";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { useSubmission } from "../hooks/useSubmission";

// Common components
import Header from "./common/Header";
import TeamIdInput from "./common/TeamIdInput";
import TabNavigation from "./common/TabNavigation";
import LoadingState from "./common/LoadingState";
import ErrorState from "./common/ErrorState";

// Tab-specific components
import SubmitTab from "./submission/SubmitTab";
import LeaderboardTab from "./leaderboard/LeaderboardTab";

/**
 * Main component that orchestrates the competition dashboard
 */
export default function SheetDataTable() {
	const [activeTab, setActiveTab] = useState("submit");

	// Initialize hooks
	const teamIdHook = useTeamId();
	const sheetDataHook = useSheetData(teamIdHook.teamId);
	const leaderboardHook = useLeaderboard();
	const submissionHook = useSubmission(
		teamIdHook.teamId,
		sheetDataHook.fetchData
	);

	// Update leaderboard when sheet data changes
	useEffect(() => {
		if (sheetDataHook.sheetData && sheetDataHook.sheetData.data) {
			leaderboardHook.updateLeaderboard(sheetDataHook.sheetData);
		}
	}, [sheetDataHook.sheetData]);

	// Handle loading and error states
	if (sheetDataHook.loading && !sheetDataHook.sheetData.data) {
		return <LoadingState />;
	}

	if (sheetDataHook.error) {
		return (
			<ErrorState
				error={sheetDataHook.error}
				onRetry={sheetDataHook.fetchData}
			/>
		);
	}

	return (
		<div className="container mx-auto py-6 px-4 relative">
			{/* Team ID input (persistent across tabs) */}
			<TeamIdInput
				tempTeamId={teamIdHook.tempTeamId}
				handleTempTeamIdChange={teamIdHook.handleTempTeamIdChange}
				handleTeamIdKeyDown={teamIdHook.handleTeamIdKeyDown}
				saveTeamId={teamIdHook.saveTeamId}
			/>

			{/* Page Header (persistent across tabs) */}
			<Header lastUpdated={sheetDataHook.lastUpdated} />

			{/* Tab Navigation */}
			<TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

			{/* Tab Content */}
			{activeTab === "submit" ? (
				<SubmitTab
					submission={submissionHook}
					sheetData={sheetDataHook}
					teamId={teamIdHook.teamId}
				/>
			) : (
				<LeaderboardTab
					leaderboardData={leaderboardHook.leaderboardData}
					animatingTeams={leaderboardHook.animatingTeams}
					teamId={teamIdHook.teamId}
					fetchData={sheetDataHook.fetchData}
				/>
			)}

			<div className="mt-4 text-center text-xs text-gray-400">
				Data refreshes automatically every 10 seconds
			</div>
		</div>
	);
}
