// Minimal notification service placeholder.
// This file intentionally contains a small, safe implementation so that
// server builds do not fail when the real service is not yet implemented.

export type Notification = {
	id: string;
	title: string;
	message: string;
	userId?: string;
	createdAt?: string;
};

export async function sendNotification(notification: Notification): Promise<void> {
	// In production, wire this to an email/SMS/push provider.
	// For now, log to the server console for local development.
	console.log('[notification-service] sendNotification called:', notification);
}

export async function listNotificationsForUser(userId: string): Promise<Notification[]> {
	// No-op placeholder: return empty list.
	return [];
}

export default {
	sendNotification,
	listNotificationsForUser,
};

