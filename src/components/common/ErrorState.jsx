"use client";

/**
 * Error state component displayed when data fetching fails
 * @param {Object} props - Component props
 * @param {string} props.error - Error message
 * @param {Function} props.onRetry - Handler for retry button
 */
export default function ErrorState({ error, onRetry }) {
	return (
		<div className="flex items-center justify-center min-h-[50vh] bg-gray-50">
			<div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
				<div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto mb-4">
					<svg
						className="h-6 w-6 text-red-600"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</div>
				<h2 className="text-center text-lg font-medium text-gray-900 mb-1">
					Error
				</h2>
				<p className="text-center text-sm text-gray-500">{error}</p>
				<div className="flex justify-center mt-4">
					<button
						onClick={onRetry}
						className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
					>
						Try Again
					</button>
				</div>
			</div>
		</div>
	);
}
