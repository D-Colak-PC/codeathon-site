import { google } from "googleapis";
import { NextResponse } from "next/server";

// Function to fetch team data (could be refactored into a shared utility)
async function getTeamsData() {
	// Get environment variables and validate
	const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
	const spreadsheetId = process.env.SPREADSHEET_ID;
	const privateKey = process.env.GOOGLE_PRIVATE_KEY
		? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
		: undefined;

	if (!serviceAccountEmail || !privateKey || !spreadsheetId) {
		console.error("Missing required environment variables for team auth");
		throw new Error("Server Configuration Error");
	}

	// Create JWT client
	const auth = new google.auth.JWT({
		email: serviceAccountEmail,
		key: privateKey,
		scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
	});

	await auth.authorize(); // Validate credentials

	// Create sheets API client
	const sheets = google.sheets({ version: "v4", auth });

	// Get spreadsheet data from "Teams" sheet
	const response = await sheets.spreadsheets.values.get({
		spreadsheetId: spreadsheetId,
		// IMPORTANT: Assuming columns are Team Name, Password, Team Members
		range: "Teams!A:C",
	});

	const rows = response.data.values;

	if (!rows || rows.length <= 1) {
		// <= 1 to account for header row
		console.log("No team data found in spreadsheet");
		throw new Error("No team data found.");
	}

	// Assuming first row contains headers: Team Name, Password, Team Members
	const headers = rows[0];
	const teamNameIndex = headers.findIndex(
		(h) => h.toLowerCase() === "team name"
	);
	const passwordIndex = headers.findIndex(
		(h) => h.toLowerCase() === "password"
	);

	if (teamNameIndex === -1 || passwordIndex === -1) {
		console.error(
			"Could not find 'Team Name' or 'Password' columns in Teams sheet"
		);
		throw new Error("Spreadsheet format error: Missing required columns.");
	}

	const teams = {};
	rows.slice(1).forEach((row) => {
		const teamName = row[teamNameIndex];
		const password = row[passwordIndex];
		if (teamName) {
			// Store password directly for comparison
			teams[teamName.trim()] = password;
		}
	});

	return teams;
}

export async function POST(request) {
	try {
		const { teamName, password } = await request.json();

		if (!teamName || !password) {
			return NextResponse.json(
				{
					authenticated: false,
					error: "Team Name and Password are required",
				},
				{ status: 400 }
			);
		}

		const teamsData = await getTeamsData();

		const storedPassword = teamsData[teamName.trim()];

		if (storedPassword && storedPassword === password) {
			// Authentication successful
			return NextResponse.json({ authenticated: true });
		} else {
			// Authentication failed
			return NextResponse.json(
				{
					authenticated: false,
					error: "Invalid Team Name or Password",
				},
				{ status: 401 } // Unauthorized
			);
		}
	} catch (error) {
		console.error("Authentication Error:", error.message);
		// Handle specific errors like config issues, sheet not found, etc.
		if (error.message.includes("Server Configuration Error")) {
			return NextResponse.json(
				{ authenticated: false, error: "Server Configuration Error" },
				{ status: 500 }
			);
		} else if (error.message.includes("No team data found")) {
			return NextResponse.json(
				{
					authenticated: false,
					error: "Team data sheet is empty or missing",
				},
				{ status: 500 }
			);
		} else if (error.message.includes("Spreadsheet format error")) {
			return NextResponse.json(
				{
					authenticated: false,
					error: "Team data sheet format is incorrect",
				},
				{ status: 500 }
			);
		}
		// Generic error for other Google API issues or unexpected problems
		return NextResponse.json(
			{
				authenticated: false,
				error: "An internal error occurred during authentication",
			},
			{ status: 500 }
		);
	}
}
