"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Hook to fetch and manage data from Google Sheets
 * @param {string} teamId - Current team ID
 * @returns {Object} Sheet data and related state
 */
export const useSheetData = (teamId) => {
	const [sheetData, setSheetData] = useState({ headers: [], data: [] });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [lastUpdated, setLastUpdated] = useState(null);

	const fetchData = useCallback(async () => {
		try {
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
				return null;
			}

			const data = await response.json();
			setSheetData(data);
			setError(null);
			setLoading(false);
			setLastUpdated(new Date());
			return data;
		} catch (err) {
			console.error("Error fetching data:", err);
			setError(err.message);
			setLoading(false);
			return null;
		}
	}, []);

	// Fetch data immediately when component mounts and set up polling
	useEffect(() => {
		fetchData();
		const intervalId = setInterval(fetchData, 60000); // Poll every 60 seconds
		return () => clearInterval(intervalId);
	}, [fetchData]);

	// Filter data for the current team
	const filteredData =
		teamId && sheetData.data
			? sheetData.data.filter(
					(row) => row["Team Name"]?.toString() === teamId.toString()
			  )
			: sheetData.data || [];

	// Filter out columns we don't want to display
	const filteredHeaders = sheetData.headers
		? sheetData.headers.filter(
				(header) => header !== "Team Name" && header !== "File Name"
		  )
		: [];

	return {
		sheetData,
		filteredData,
		filteredHeaders,
		loading,
		error,
		lastUpdated,
		fetchData,
	};
};
