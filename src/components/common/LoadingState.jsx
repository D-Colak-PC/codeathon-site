"use client";

/**
 * Loading state component displayed while data is being fetched
 */
export default function LoadingState() {
	return (
		<div className="flex items-center justify-center min-h-[50vh] bg-gray-50">
			<div className="flex items-center space-x-2">
				<div className="h-8 w-8 bg-blue-500 rounded-full animate-pulse"></div>
				<span className="text-gray-700 text-lg font-medium">
					Loading...
				</span>
			</div>
		</div>
	);
}
