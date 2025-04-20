"use client";

import { useState, useEffect } from "react";
import { useNotification } from "./useNotification"; // Import notification hook

/**
 * Hook to manage team ID with local storage persistence and authentication
 * @returns {Object} Team ID state and handlers
 */
export const useTeamId = () => {
	const [teamId, setTeamId] = useState("");
	const [tempTeamId, setTempTeamId] = useState("");
	const [password, setPassword] = useState(""); // Add password state
	const [isLoading, setIsLoading] = useState(false); // Add loading state
	const [error, setError] = useState(null); // Add error state
	const { addNotification } = useNotification(); // Get notification function

	// Load team ID from localStorage on component mount
	useEffect(() => {
		const savedTeamId = localStorage.getItem("teamId");
		if (savedTeamId) {
			setTeamId(savedTeamId);
			setTempTeamId(savedTeamId);
		}
	}, []);

	// Handle password input change
	const handlePasswordChange = (e) => {
		setPassword(e.target.value);
		setError(null); // Clear error on input change
	};

	// Handle team name input change
	const handleTempTeamIdChange = (e) => {
		setTempTeamId(e.target.value);
		setError(null); // Clear error on input change
	};

	// Handle sign-in attempt
	const handleSignIn = async () => {
		if (!tempTeamId || !password) {
			setError("Team Name and Password are required.");
			// alert("Team Name and Password are required."); // Use state instead of alert
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/authenticateTeam", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ teamName: tempTeamId, password }),
			});

			const data = await response.json();

			if (response.ok && data.authenticated) {
				// Authentication successful
				localStorage.setItem("teamId", tempTeamId);
				setTeamId(tempTeamId);
				setPassword(""); // Clear password field on success
				setError(null);
				addNotification("Signed in successfully!", "success");

				// Optional: Visual feedback (can be handled in the component)
				// const teamIdInput = document.getElementById("teamIdTop");
				// if (teamIdInput) { ... }
			} else {
				// Authentication failed
				const errorMessage = data.error || "Invalid credentials.";
				setError(errorMessage);
				// alert(`Sign-in failed: ${errorMessage}`); // Use state instead of alert
				setTeamId(""); // Ensure teamId is cleared if auth fails
				localStorage.removeItem("teamId"); // Remove potentially stale teamId
			}
		} catch (err) {
			console.error("Sign-in API call failed:", err);
			const errorMessage = "Sign-in failed. Please try again later.";
			setError(errorMessage);
			// alert(errorMessage); // Use state instead of alert
			setTeamId("");
			localStorage.removeItem("teamId");
		} finally {
			setIsLoading(false);
		}
	};

	// Handle Enter key press for team ID or password
	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSignIn(); // Trigger sign-in on Enter
		}
	};

	return {
		teamId,
		tempTeamId,
		password, // Expose password state
		isLoading, // Expose loading state
		error, // Expose error state
		setTeamId, // Keep for potential manual override/logout?
		setTempTeamId,
		setPassword, // Expose password setter
		handleSignIn, // Expose the new sign-in handler
		handleKeyDown, // Expose the unified keydown handler
		handleTempTeamIdChange,
		handlePasswordChange, // Expose password change handler
	};
};
