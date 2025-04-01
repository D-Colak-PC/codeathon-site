"use client";

import { useState } from "react";
import { getLanguageFromFilename } from "../utils/fileHelpers";
import { formatDateForSubmission } from "../utils/formatters";
import { PROBLEMS } from "../constants/problems";

/**
 * Hook to manage submission form state and actions
 * @param {string} teamId - Current team ID
 * @param {Function} fetchData - Function to refresh data after submission
 * @returns {Object} Submission state and handlers
 */
export const useSubmission = (teamId, fetchData) => {
	const [selectedProblem, setSelectedProblem] = useState("");
	const [selectedFile, setSelectedFile] = useState(null);
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState(null);
	const [submitSuccess, setSubmitSuccess] = useState(false);

	// Handle file selection
	const handleFileChange = (e) => {
		if (e.target.files && e.target.files.length > 0) {
			const file = e.target.files[0];
			const language = getLanguageFromFilename(file.name);

			if (!language) {
				setSubmitError(
					"Only Python (.py), Java (.class), and JavaScript (.js) files are allowed"
				);
				e.target.value = "";
				return;
			}

			setSelectedFile(file);
			setSubmitError(null);
		}
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();

		// Reset states
		setSubmitting(true);
		setSubmitError(null);
		setSubmitSuccess(false);

		// Validate inputs
		if (!teamId || typeof teamId !== "string" || teamId.trim() === "") {
			setSubmitError(
				"Please enter and save a valid Team Name in the top-right corner"
			);
			setSubmitting(false);
			return;
		}

		if (!selectedProblem) {
			setSubmitError("Please select a problem");
			setSubmitting(false);
			return;
		}

		if (!selectedFile) {
			setSubmitError("Please select a file to upload");
			setSubmitting(false);
			return;
		}

		// Check file type
		const language = getLanguageFromFilename(selectedFile.name);
		if (!language) {
			setSubmitError(
				"Only Python (.py), Java (.class), and JavaScript (.js) files are allowed"
			);
			setSubmitting(false);
			return;
		}

		try {
			// Prepare submission data
			const currentTime = new Date();
			// Format date as string immediately to avoid serialization issues
			const formattedTime = formatDateForSubmission(currentTime);
			const fileName = selectedFile.name;

			// Get problem name from selected problem id
			const problemObj = PROBLEMS.find(
				(p) => p.id === parseInt(selectedProblem)
			);
			if (!problemObj) {
				throw new Error("Invalid problem selected");
			}

			// Create form data for file upload
			const formData = new FormData();
			formData.append("file", selectedFile);
			formData.append("teamId", teamId);
			formData.append("timeSubmitted", currentTime);

			// Upload file to Google Drive
			const uploadResponse = await fetch("/api/uploadFile", {
				method: "POST",
				body: formData,
			});

			if (!uploadResponse.ok) {
				const errorData = await uploadResponse.json().catch(() => ({}));
				throw new Error(
					`Failed to upload file: ${
						errorData.error || "Unknown error"
					}`
				);
			}

			const uploadResult = await uploadResponse.json();

			// Add entry to Google Sheets
			const sheetResponse = await fetch("/api/addSheetEntry", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					teamId,
					problemName: problemObj.name,
					timeSubmitted: formattedTime, // Use the formatted string
					fileName,
					fileLink: uploadResult.fileLink,
					language,
					status: "Not Reviewed",
				}),
			});

			if (!sheetResponse.ok) {
				const errorData = await sheetResponse.json().catch(() => ({}));
				throw new Error(
					`Failed to add entry to spreadsheet: ${
						errorData.error || "Unknown error"
					}`
				);
			}

			// Success!
			setSubmitSuccess(true);
			setSelectedFile(null);

			// Reset form fields but keep the team ID
			if (document && document.getElementById("solution")) {
				document.getElementById("solution").value = "";
			}
			setSelectedProblem("");

			// Refresh data
			fetchData();
		} catch (error) {
			console.error("Submission error:", error);
			setSubmitError(`Error submitting solution: ${error.message}`);
		} finally {
			setSubmitting(false);
		}
	};

	return {
		selectedProblem,
		setSelectedProblem,
		selectedFile,
		submitting,
		submitError,
		submitSuccess,
		handleFileChange,
		handleSubmit,
	};
};
