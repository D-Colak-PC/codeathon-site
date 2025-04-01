"use client";

import { useState, useCallback } from "react";
import Toast from "../components/common/Toast";

/**
 * Custom hook for managing notification toasts
 * @returns {Object} Notification state and methods
 */
export const useNotification = () => {
	const [notifications, setNotifications] = useState([]);

	/**
	 * Show a success notification
	 * @param {string} message - The notification message
	 * @param {number} duration - Duration in ms (default: 3000)
	 */
	const showSuccess = useCallback((message, duration = 3000) => {
		const id = Date.now().toString();
		setNotifications((prev) => [
			...prev,
			{ id, message, type: "success", duration },
		]);

		// Auto-remove
		setTimeout(() => {
			removeNotification(id);
		}, duration + 300); // Adding 300ms for animation
	}, []);

	/**
	 * Show an error notification
	 * @param {string} message - The notification message
	 * @param {number} duration - Duration in ms (default: 5000)
	 */
	const showError = useCallback((message, duration = 5000) => {
		const id = Date.now().toString();
		setNotifications((prev) => [
			...prev,
			{ id, message, type: "error", duration },
		]);

		// Auto-remove
		setTimeout(() => {
			removeNotification(id);
		}, duration + 300); // Adding 300ms for animation
	}, []);

	/**
	 * Remove a notification by ID
	 * @param {string} id - The notification ID to remove
	 */
	const removeNotification = useCallback((id) => {
		setNotifications((prev) =>
			prev.filter((notification) => notification.id !== id)
		);
	}, []);

	/**
	 * Render all active notifications
	 * @returns {JSX.Element[]} Array of Toast components
	 */
	const renderNotifications = useCallback(() => {
		return notifications.map((notification) => (
			<Toast
				key={notification.id}
				message={notification.message}
				type={notification.type}
				duration={notification.duration}
				onClose={() => removeNotification(notification.id)}
			/>
		));
	}, [notifications, removeNotification]);

	return {
		notifications,
		showSuccess,
		showError,
		removeNotification,
		renderNotifications,
	};
};
