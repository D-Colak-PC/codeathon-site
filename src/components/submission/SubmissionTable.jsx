"use client";

import { getRowBackgroundColor } from "../../utils/styleHelpers";

/**
 * Table component to display submissions for the current team
 * @param {Object} props - Component props
 * @param {Array} props.filteredHeaders - Headers to display
 * @param {Array} props.filteredData - Data filtered for current team
 * @param {string} props.teamId - Current team ID
 * @param {Function} props.fetchData - Function to refresh data
 */
export default function SubmissionTable({
	filteredHeaders,
	filteredData,
	teamId,
	fetchData,
}) {
	return (
		<div className="bg-white shadow-md rounded-lg overflow-hidden">
			<div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
				<h2 className="text-lg font-semibold text-gray-800">
					Submission Results
				</h2>
			</div>

			<div className="mb-6 flex justify-between items-center px-6 py-4">
				<div>
					{teamId ? (
						<h3 className="text-lg font-medium text-gray-700">
							Showing submissions for Team {teamId}
							{filteredData.length === 0 &&
								" (No submissions yet)"}
						</h3>
					) : (
						<h3 className="text-lg font-medium text-gray-700">
							Enter your Team Name in the top-right corner to view
							your submissions
						</h3>
					)}
				</div>
			</div>

			{filteredHeaders && filteredHeaders.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								{filteredHeaders.map((header, index) => (
									<th
										key={index}
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										{header}
									</th>
								))}
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{filteredData.length > 0 ? (
								filteredData.map((row, rowIndex) => (
									<tr
										key={rowIndex}
										className={getRowBackgroundColor(row)}
									>
										{filteredHeaders.map(
											(header, colIndex) => (
												<td
													key={colIndex}
													className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
												>
													{header === "File Link" &&
													row[header] ? (
														<a
															href={row[header]}
															target="_blank"
															rel="noopener noreferrer"
															className="text-blue-600 hover:underline"
														>
															View File
														</a>
													) : (
														row[header]
													)}
												</td>
											)
										)}
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan={filteredHeaders.length}
										className="px-6 py-4 text-center text-sm text-gray-500"
									>
										{teamId
											? `No submissions found for Team ${teamId}`
											: "Enter your Team Name to view your submissions"}
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			) : (
				<div className="p-8 text-center">
					<p className="text-gray-500">No data available</p>
				</div>
			)}
		</div>
	);
}
