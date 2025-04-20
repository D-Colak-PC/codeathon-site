"use client";

/**
 * Component for team sign-in with name and password.
 * @param {Object} props - Component props from useTeamId hook
 */
export default function TeamIdInput({
	tempTeamId,
	password,
	isLoading,
	error,
	handleTempTeamIdChange,
	handlePasswordChange,
	handleKeyDown, // Use the unified keydown handler
	handleSignIn, // Use the sign-in handler
}) {
	return (
		<div className="absolute top-4 right-4 flex flex-col items-end space-y-1">
			<div className="flex items-end space-x-1">
				{/* Team Name Input */}
				<div className="flex flex-col">
					<label
						htmlFor="teamIdTop"
						className="block text-xs font-medium text-gray-700 mb-1"
					>
						Team Name
					</label>
					<input
						id="teamIdTop"
						type="text"
						className="w-28 px-2 py-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 text-sm"
						value={tempTeamId}
						onChange={handleTempTeamIdChange}
						onKeyDown={handleKeyDown} // Use unified handler
						placeholder="Team Name"
						disabled={isLoading} // Disable when loading
						style={{ appearance: "textfield" }}
					/>
				</div>

				{/* Password Input */}
				<div className="flex flex-col">
					<label
						htmlFor="passwordTop"
						className="block text-xs font-medium text-gray-700 mb-1"
					>
						Password
					</label>
					<input
						id="passwordTop"
						type="password"
						className="w-28 px-2 py-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 text-sm"
						value={password}
						onChange={handlePasswordChange}
						onKeyDown={handleKeyDown} // Use unified handler
						placeholder="Password"
						disabled={isLoading} // Disable when loading
					/>
				</div>

				{/* Sign In Button */}
				<button
					onClick={handleSignIn} // Use sign-in handler
					disabled={isLoading} // Disable when loading
					className={`px-3 py-1 ${
						isLoading
							? "bg-gray-400"
							: "bg-blue-600 hover:bg-blue-700"
					} text-white rounded-md transition-colors text-sm h-[34px] self-end`} // Match height
				>
					{isLoading ? "Signing In..." : "Sign In"}
				</button>
			</div>

			{/* Error Message Display */}
			{error && (
				<p className="text-xs text-red-600 mt-1 text-right w-full max-w-xs truncate">
					{error}
				</p>
			)}
		</div>
	);
}
