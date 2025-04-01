"use client";

/**
 * Button component to refresh data
 * @param {Object} props - Component props
 * @param {Function} props.onClick - Click handler for the button
 * @param {string} props.text - Button text
 */
export default function RefreshButton({ onClick, text = "Refresh Results" }) {
	return (
		<button
			onClick={onClick}
			className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
		>
			<svg
				className="h-4 w-4 mr-2"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
					d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
				/>
			</svg>
			<span>{text}</span>
		</button>
	);
}
