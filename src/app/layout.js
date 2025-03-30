import "./globals.css";

export const metadata = {
	title: "Google Sheets Poller",
	description: "App that polls Google Sheets data every 10 seconds",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body className="bg-gray-50 min-h-screen">{children}</body>
		</html>
	);
}
