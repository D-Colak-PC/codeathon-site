"use client";

/**
 * Legend component for submission status colors
 */
export default function StatusLegend() {
	const statuses = [
		{ name: "Not Reviewed", color: "bg-white border border-gray-200" },
		{ name: "In Review", color: "bg-yellow-100" },
		{ name: "Incorrect", color: "bg-red-100" },
		{ name: "Correct", color: "bg-green-100" },
	];

	return (
		<div className="mt-6 flex flex-wrap justify-center gap-4">
			{statuses.map((status) => (
				<div key={status.name} className="flex items-center">
					<div
						className={`w-4 h-4 rounded mr-2 ${status.color}`}
					></div>
					<span className="text-xs text-gray-500">{status.name}</span>
				</div>
			))}
		</div>
	);
}
