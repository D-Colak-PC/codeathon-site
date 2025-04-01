"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Toast notification component
 * @param {Object} props - Component props
 * @param {string} props.message - The notification message
 * @param {string} props.type - The type of notification ('success' or 'error')
 * @param {number} props.duration - Duration in ms before auto-hiding (default: 3000)
 * @param {Function} props.onClose - Function to call when toast is closed
 */
export default function Toast({
	message,
	type = "success",
	duration = 3000,
	onClose,
}) {
	const [visible, setVisible] = useState(true);
	const [portalElement, setPortalElement] = useState(null);

	useEffect(() => {
		// Find or create toast container
		let toastContainer = document.getElementById("toast-container");
		if (!toastContainer) {
			toastContainer = document.createElement("div");
			toastContainer.id = "toast-container";
			document.body.appendChild(toastContainer);
		}
		setPortalElement(toastContainer);

		// Auto-hide after duration
		const timer = setTimeout(() => {
			setVisible(false);
			setTimeout(() => {
				if (onClose) onClose();
			}, 300); // Give time for transition
		}, duration);

		return () => {
			clearTimeout(timer);
		};
	}, [duration, onClose]);

	// If no portal element, don't render anything
	if (!portalElement) return null;

	return createPortal(
		<div
			className={`toast toast-${type} ${
				visible ? "toast-visible" : "toast-hidden"
			}`}
			role="alert"
		>
			<div className="flex items-center">
				{type === "success" ? (
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
							d="M5 13l4 4L19 7"
						/>
					</svg>
				) : (
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
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				)}
				<span>{message}</span>
				<button
					className="ml-4 text-white hover:text-gray-200"
					onClick={() => {
						setVisible(false);
						setTimeout(() => {
							if (onClose) onClose();
						}, 300);
					}}
				>
					<svg
						className="h-4 w-4"
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
				</button>
			</div>
		</div>,
		portalElement
	);
}

/**
 * Utility functions to show toast notifications from anywhere in the app
 */
export const showToast = {
	success: (message, duration = 3000) => {
		const toastId = `toast-${Date.now()}`;
		const toastContainer = document.getElementById("toast-container");

		if (!toastContainer) return;

		const toastElement = document.createElement("div");
		toastElement.id = toastId;
		toastContainer.appendChild(toastElement);

		const onClose = () => {
			const element = document.getElementById(toastId);
			if (element) element.remove();
		};

		// Render toast into the element
		createPortal(
			<Toast
				message={message}
				type="success"
				duration={duration}
				onClose={onClose}
			/>,
			toastElement
		);
	},

	error: (message, duration = 5000) => {
		const toastId = `toast-${Date.now()}`;
		const toastContainer = document.getElementById("toast-container");

		if (!toastContainer) return;

		const toastElement = document.createElement("div");
		toastElement.id = toastId;
		toastContainer.appendChild(toastElement);

		const onClose = () => {
			const element = document.getElementById(toastId);
			if (element) element.remove();
		};

		// Render toast into the element
		createPortal(
			<Toast
				message={message}
				type="error"
				duration={duration}
				onClose={onClose}
			/>,
			toastElement
		);
	},
};
