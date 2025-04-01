"use client";

/**
 * Tab navigation component for switching between views
 * @param {Object} props - Component props
 * @param {string} props.activeTab - Currently active tab
 * @param {Function} props.setActiveTab - Function to set active tab
 */
export default function TabNavigation({ activeTab, setActiveTab }) {
	return (
		<div className="mb-6 border-b border-gray-200">
			<div className="flex space-x-8">
				<button
					onClick={() => setActiveTab("submit")}
					className={`py-4 px-1 text-center border-b-2 font-medium text-sm ${
						activeTab === "submit"
							? "border-blue-500 text-blue-600"
							: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
					}`}
				>
					Submit Here
				</button>
				<button
					onClick={() => setActiveTab("leaderboard")}
					className={`py-4 px-1 text-center border-b-2 font-medium text-sm ${
						activeTab === "leaderboard"
							? "border-blue-500 text-blue-600"
							: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
					}`}
				>
					Leaderboard
				</button>
			</div>
		</div>
	);
}
