"use client";

import { useState, useEffect } from "react";
import SheetDataTable from "../components/SheetDataTable";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";

export default function Home() {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [connectionStatus, setConnectionStatus] = useState("connected");

	// Check connection status
	useEffect(() => {
		const checkConnection = () => {
			if (!navigator.onLine) {
				setConnectionStatus("disconnected");
			} else {
				setConnectionStatus("connected");
				// If we were previously disconnected, try to reload data
				if (connectionStatus === "disconnected") {
					window.location.reload();
				}
			}
		};

		// Check initial state
		checkConnection();

		// Set up listeners for online/offline events
		window.addEventListener("online", checkConnection);
		window.addEventListener("offline", checkConnection);

		// Simulate loading state
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 1000);

		return () => {
			window.removeEventListener("online", checkConnection);
			window.removeEventListener("offline", checkConnection);
			clearTimeout(timer);
		};
	}, [connectionStatus]);

	// Error handling function
	const handleError = (err) => {
		console.error("Application error:", err);
		setError(err.message || "An unexpected error occurred");
	};

	// If offline, show an offline message
	if (connectionStatus === "disconnected") {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="bg-white p-8 rounded-lg shadow-md max-w-md">
					<div className="flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mx-auto mb-4">
						<svg
							className="h-6 w-6 text-yellow-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>
					<h2 className="text-center text-lg font-medium text-gray-900 mb-1">
						You're offline
					</h2>
					<p className="text-center text-sm text-gray-500">
						Please check your internet connection and try again.
					</p>
				</div>
			</div>
		);
	}

	// While checking status, show loading
	if (isLoading) {
		return <LoadingState />;
	}

	// If there's an error, show error state
	if (error) {
		return (
			<ErrorState
				error={error}
				onRetry={() => window.location.reload()}
			/>
		);
	}

	// Render main component with error boundary
	try {
		return (
			<main className="min-h-screen py-10">
				<SheetDataTable onError={handleError} />
			</main>
		);
	} catch (err) {
		handleError(err);
		return (
			<ErrorState
				error={err.message}
				onRetry={() => window.location.reload()}
			/>
		);
	}
}
