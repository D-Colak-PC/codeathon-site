"use client";

/**
 * Main header component for the competition dashboard
 * @param {Object} props - Component props
 * @param {Date} props.lastUpdated - Last time data was updated
 */
export default function Header({ lastUpdated }) {
	return (
		<div className="text-center mb-6">
			<h1 className="text-3xl font-bold text-gray-900 mb-2">
				Pine Crest Spring 2025 Codeathon Dashboard
			</h1>
			{lastUpdated && (
				<p className="text-sm text-gray-500">
					Data last updated: {lastUpdated.toLocaleTimeString()}
					<span className="ml-1 inline-flex h-2 w-2 bg-green-400 rounded-full animate-pulse"></span>
				</p>
			)}
		</div>
	);
}
