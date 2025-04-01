import { google } from "googleapis";
import { NextResponse } from "next/server";
import { cache } from "react";

// Cache results for 5 seconds to prevent excessive API calls
let cachedData = null;
let cacheTime = 0;
const CACHE_DURATION = 5000; // 5 seconds

export async function GET() {
	try {
		// Check if we have cached data that's still fresh
		const now = Date.now();
		if (cachedData && now - cacheTime < CACHE_DURATION) {
			console.log("Serving cached sheet data");
			return NextResponse.json(cachedData);
		}

		console.log("API route called, attempting authentication");

		// Get environment variables and validate
		const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
		const spreadsheetId = process.env.SPREADSHEET_ID;

		// More robust approach to handle the private key
		const privateKey = process.env.GOOGLE_PRIVATE_KEY
			? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
			: undefined;

		// Validate required environment variables
		if (!serviceAccountEmail || !privateKey || !spreadsheetId) {
			console.error("Missing required environment variables");
			return NextResponse.json(
				{
					error: "Server Configuration Error",
					details:
						"The server is missing required configuration. Please contact the administrator.",
				},
				{ status: 500 }
			);
		}

		console.log("Service account email:", serviceAccountEmail);
		console.log(
			"Private key loaded:",
			privateKey ? "Yes (length: " + privateKey.length + ")" : "No"
		);

		// Create JWT client
		const auth = new google.auth.JWT({
			email: serviceAccountEmail,
			key: privateKey,
			scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
		});

		// Try to authorize (this validates the credentials)
		console.log("Attempting to authorize...");
		await auth.authorize();
		console.log("Authorization successful!");

		// Create sheets API client
		const sheets = google.sheets({ version: "v4", auth });

		// Get spreadsheet data
		console.log("Fetching spreadsheet data...");
		const response = await sheets.spreadsheets.values.get({
			spreadsheetId: spreadsheetId,
			range: "Submissions!A:G", // Adjust if your sheet has a different name
		});

		const rows = response.data.values;

		if (!rows || rows.length === 0) {
			console.log("No data found in spreadsheet");
			return NextResponse.json(
				{
					error: "No data found.",
					details: "The spreadsheet appears to be empty.",
				},
				{ status: 404 }
			);
		}

		// Assuming first row contains headers
		const headers = rows[0];
		const data = rows.slice(1).map((row) => {
			const rowData = {};
			headers.forEach((header, index) => {
				rowData[header] = row[index] || "";
			});
			return rowData;
		});

		// Cache the result
		cachedData = { headers, data };
		cacheTime = now;

		console.log("Data successfully retrieved");
		return NextResponse.json({ headers, data });
	} catch (error) {
		console.error("Error:", error.message);

		// Provide more specific error messages based on the error
		if (error.message.includes("invalid_grant")) {
			return NextResponse.json(
				{
					error: "Authentication Error",
					details:
						"There was a problem with the service account credentials. Make sure the service account exists and is active.",
				},
				{ status: 401 }
			);
		} else if (error.message.includes("not found")) {
			return NextResponse.json(
				{
					error: "Spreadsheet Not Found",
					details:
						"The spreadsheet could not be found. Make sure the ID is correct and the spreadsheet is shared with " +
						process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
				},
				{ status: 404 }
			);
		} else if (error.message.includes("Rate Limit Exceeded")) {
			return NextResponse.json(
				{
					error: "API Rate Limit Exceeded",
					details:
						"Too many requests to Google Sheets API. Please try again later.",
				},
				{ status: 429 }
			);
		} else if (error.message.includes("insufficient authorization")) {
			return NextResponse.json(
				{
					error: "Insufficient Permissions",
					details:
						"The service account doesn't have permission to access this spreadsheet.",
				},
				{ status: 403 }
			);
		} else {
			return NextResponse.json(
				{
					error: "Google Sheets API Error",
					details: error.message,
				},
				{ status: 500 }
			);
		}
	}
}
