import "./globals.css";
import { Inter, Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Configure fonts
const inter = Inter({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-inter",
});

const poppins = Poppins({
	weight: ["400", "500", "600", "700"],
	subsets: ["latin"],
	display: "swap",
	variable: "--font-poppins",
});

export const metadata = {
	title: "Codeathon Competition Dashboard",
	description: "Track submissions, view results, and check the leaderboard for the Pine Crest 2025 Spring Codeathon Competition.",
	keywords: ["coding competition", "hackathon", "programming contest", "leaderboard", "codeathon"],
	authors: [{ name: "Dennis Colak" }],
	viewport: "width=device-width, initial-scale=1",
	robots: {
		index: false,
		follow: false,
		nocache: true,
		googleBot: {
			index: false,
			follow: false,
			noimageindex: true,
		},
	},
	icons: {
		icon: "/favicon.ico",
	},
};

export default function RootLayout({ children }) {
	return <div>Under Maintenance</div>;
	// return (
	// 	<html lang="en" className={`${inter.variable} ${poppins.variable}`}>
	// 		<body className="bg-gray-50 min-h-screen font-sans">
	// 			{/* Toast container for notifications */}
	// 			<div id="toast-container"></div>

	// 			{/* Page content */}
	// 			{children}

	// 			{/* Footer */}
	// 			<footer className="mt-16 py-8 bg-gray-100 border-t border-gray-200">
	// 				<div className="container mx-auto px-4 text-center text-gray-500 text-sm">
	// 					<p>
	// 						Built with Next.js, React, Tailwind CSS, and Google
	// 						APIs. Deployed on Vercel.
	// 					</p>
	// 					<p className="mt-2">Made by Denins Colak</p>
	// 				</div>
	// 			</footer>

	// 			{/* Analytics */}
	// 			<Analytics />
	// 			<SpeedInsights />
	// 		</body>
	// 	</html>
	// );
}
