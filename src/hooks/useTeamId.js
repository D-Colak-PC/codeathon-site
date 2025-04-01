"use client";

import { useState, useEffect } from "react";

/**
 * Hook to manage team ID with local storage persistence
 * @returns {Object} Team ID state and handlers
 */
export const useTeamId = () => {
	const [teamId, setTeamId] = useState("");
	const [tempTeamId, setTempTeamId] = useState("");

	// Load team ID from localStorage on component mount
	useEffect(() => {
		const savedTeamId = localStorage.getItem("teamId");
		if (savedTeamId) {
			setTeamId(savedTeamId);
			setTempTeamId(savedTeamId);
		}
	}, []);

	// Save team ID to localStorage
	const saveTeamId = () => {
		if (tempTeamId) {
			localStorage.setItem("teamId", tempTeamId);
			setTeamId(tempTeamId);

			// Show a brief flash of success
			const teamIdInput = document.getElementById("teamIdTop");
			if (teamIdInput) {
				teamIdInput.classList.add("bg-green-50");
				teamIdInput.classList.add("border-green-500");
				setTimeout(() => {
					teamIdInput.classList.remove("bg-green-50");
					teamIdInput.classList.remove("border-green-500");
				}, 1000);
			}

			return true;
		}

		// Show validation error
		alert("Please enter a valid Team Name");
		return false;
	};

	// Handle Enter key press for team ID
	const handleTeamIdKeyDown = (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			saveTeamId();
		}
	};

	const handleTempTeamIdChange = (e) => {
		setTempTeamId(e.target.value);
	};

	return {
		teamId,
		tempTeamId,
		setTeamId,
		setTempTeamId,
		saveTeamId,
		handleTeamIdKeyDown,
		handleTempTeamIdChange,
	};
};
