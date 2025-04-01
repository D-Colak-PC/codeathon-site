"use client";

import { PROBLEMS } from "../../constants/problems";

/**
 * Form component for submitting solutions
 * @param {Object} props - Component props
 * @param {string} props.selectedProblem - Currently selected problem ID
 * @param {Function} props.setSelectedProblem - Handler to set selected problem
 * @param {boolean} props.submitting - Whether submission is in progress
 * @param {string} props.submitError - Error message if submission failed
 * @param {boolean} props.submitSuccess - Whether submission was successful
 * @param {Function} props.handleFileChange - Handler for file input change
 * @param {Function} props.handleSubmit - Handler for form submission
 */
export default function SubmissionForm({
	selectedProblem,
	setSelectedProblem,
	submitting,
	submitError,
	submitSuccess,
	handleFileChange,
	handleSubmit,
}) {
	return (
		<div className="bg-white shadow-md rounded-lg mb-8 p-6">
			<h2 className="text-xl font-semibold text-gray-800 mb-4">
				Submit Your Solution
			</h2>

			{submitSuccess && (
				<div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
					Solution submitted successfully! Your submission is now
					being processed.
				</div>
			)}

			{submitError && (
				<div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
					{submitError}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="col-span-1">
						<label
							htmlFor="problem"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Select Problem
						</label>
						<select
							id="problem"
							className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
							value={selectedProblem}
							onChange={(e) => setSelectedProblem(e.target.value)}
							required
						>
							<option value="">-- Select a problem --</option>
							{PROBLEMS.map((problem) => (
								<option key={problem.id} value={problem.id}>
									{problem.name}
								</option>
							))}
						</select>
					</div>

					<div className="col-span-1">
						<label
							htmlFor="solution"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Upload Solution File
						</label>
						<input
							id="solution"
							type="file"
							accept=".py,.class,.js"
							onChange={handleFileChange}
							className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
							required
						/>
						<p className="mt-1 text-xs text-gray-500">
							Accepted file types: .py, .class, .js
						</p>
					</div>

					<div className="col-span-2 flex justify-end">
						<button
							type="submit"
							disabled={submitting}
							className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{submitting ? (
								<>
									<svg
										className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Submitting...
								</>
							) : (
								<>
									<svg
										className="h-5 w-5 mr-2"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
										/>
									</svg>
									Submit Solution
								</>
							)}
						</button>
					</div>
				</div>
			</form>
		</div>
	);
}
