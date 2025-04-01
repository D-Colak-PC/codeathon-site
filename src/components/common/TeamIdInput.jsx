"use client";

/**
 * Component for team ID input that persists across the application
 * @param {Object} props - Component props
 * @param {string} props.tempTeamId - Current temporary team ID
 * @param {Function} props.handleTempTeamIdChange - Handler for team ID change
 * @param {Function} props.handleTeamIdKeyDown - Handler for keydown events
 * @param {Function} props.saveTeamId - Handler to save team ID
 */
export default function TeamIdInput({
	tempTeamId,
	handleTempTeamIdChange,
	handleTeamIdKeyDown,
	saveTeamId,
}) {
	return (
		<div className="absolute top-6 right-4 flex items-center space-x-2">
			<div className="flex flex-col">
				<label
					htmlFor="teamIdTop"
					className="block text-xs font-medium text-gray-700 mb-1"
				>
					Team ID (1-100)
				</label>
				<div className="flex">
					<input
						id="teamIdTop"
						type="number"
						min="1"
						max="100"
						className="w-24 px-3 py-2 bg-white border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
						value={tempTeamId}
						onChange={handleTempTeamIdChange}
						onKeyDown={handleTeamIdKeyDown}
						placeholder="Team ID"
						style={{ appearance: "textfield" }} // Remove spinner arrows
					/>
					<button
						onClick={saveTeamId}
						className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
					>
						Save
					</button>
				</div>
			</div>
		</div>
	);
}
