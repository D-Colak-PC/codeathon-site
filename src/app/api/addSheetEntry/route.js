import { google } from "googleapis";
import { NextResponse } from "next/server";

// List of allowed languages
const ALLOWED_LANGUAGES = ["python", "java", "javascript"];

// List of valid status values
const VALID_STATUSES = ["Not Reviewed", "In Review", "Incorrect", "Correct"];

export async function POST(request) {
	try {
		// Parse the request body
		const requestData = await request.json();
		const {
			teamId,
			problemName,
			timeSubmitted,
			fileName,
			fileLink,
			language,
			status,
		} = requestData;

		// Validate required fields
		if (
			!teamId ||
			!problemName ||
			!timeSubmitted ||
			!fileName ||
			!fileLink ||
			!language
		) {
			return NextResponse.json(
				{
					error: "Missing required fields",
					details: "All fields except status are required",
				},
				{ status: 400 }
			);
		}

		// Validate team ID is provided as a non-empty string
		if (!teamId || typeof teamId !== "string" || teamId.trim() === "") {
			return NextResponse.json(
				{
					error: "Invalid team ID",
					details: "Team ID must be a non-empty string",
				},
				{ status: 400 }
			);
		}

		// Validate language
		if (!ALLOWED_LANGUAGES.includes(language.toLowerCase())) {
			return NextResponse.json(
				{
					error: "Invalid language",
					details:
						"Language must be one of: python, java, javascript",
				},
				{ status: 400 }
			);
		}

		// Validate status if provided
		if (status && !VALID_STATUSES.includes(status)) {
			return NextResponse.json(
				{
					error: "Invalid status",
					details:
						"Status must be one of: Not Reviewed, In Review, Incorrect, Correct",
				},
				{ status: 400 }
			);
		}

		// Validate environment variables
		if (
			!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
			!process.env.GOOGLE_PRIVATE_KEY ||
			!process.env.SPREADSHEET_ID
		) {
			return NextResponse.json(
				{
					error: "Server configuration error",
					details: "Missing required environment variables",
				},
				{ status: 500 }
			);
		}

		// Configure Google Sheets API
		const auth = new google.auth.JWT(
			process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
			null,
			process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
			["https://www.googleapis.com/auth/spreadsheets"]
		);

		const sheets = google.sheets({ version: "v4", auth });

		// Format date in MM/DD/YY HH:MM:SS format with 12-hour clock
		let formattedDate;
		try {
			// If timeSubmitted is a Date object stringified in the frontend
			const dateObj = new Date(timeSubmitted);

			// Format in the desired 12-hour format for display in Google Sheets
			formattedDate = dateObj.toLocaleString("en-US", {
				month: "2-digit",
				day: "2-digit",
				year: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				hour12: true,
			});
		} catch (e) {
			// If parsing fails, use as is
			console.error("Error formatting date:", e);
			formattedDate = timeSubmitted;
		}

		// Prepare the row data
		const rowData = [
			teamId, // teamId sent as a string
			problemName,
			formattedDate,
			fileName,
			fileLink,
			language,
			status || "Not Reviewed",
		];

		// Append the row to the spreadsheet
		console.log("Adding new entry to the spreadsheet...");
		const response = await sheets.spreadsheets.values.append({
			spreadsheetId: process.env.SPREADSHEET_ID,
			range: "Sheet1!A:G", // 7 columns (A through G)
			valueInputOption: "USER_ENTERED", // Change back to USER_ENTERED
			insertDataOption: "INSERT_ROWS",
			resource: {
				values: [rowData],
			},
		});

		// Log the success
		console.log(`Added entry for Team ${teamId}, problem "${problemName}"`);

		return NextResponse.json({
			message: "Entry added successfully",
			updatedRows: response.data.updates.updatedRows,
			teamId: teamId,
			problem: problemName,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Error adding sheet entry:", error);

		// Categorize errors for more helpful responses
		if (error.message.includes("insufficientPermissions")) {
			return NextResponse.json(
				{
					error: "Permission denied",
					details:
						"The application doesn't have permission to modify the spreadsheet",
				},
				{ status: 403 }
			);
		} else if (error.message.includes("invalid_grant")) {
			return NextResponse.json(
				{
					error: "Authentication error",
					details: "Failed to authenticate with Google Sheets API",
				},
				{ status: 401 }
			);
		} else if (error.message.includes("not found")) {
			return NextResponse.json(
				{
					error: "Spreadsheet not found",
					details:
						"The spreadsheet ID is invalid or the spreadsheet doesn't exist",
				},
				{ status: 404 }
			);
		} else if (error.message.includes("rate")) {
			return NextResponse.json(
				{
					error: "Rate limit exceeded",
					details:
						"Too many requests to Google Sheets API. Please try again later.",
				},
				{ status: 429 }
			);
		} else {
			return NextResponse.json(
				{
					error: "Failed to add entry to spreadsheet",
					details: error.message,
				},
				{ status: 500 }
			);
		}
	}
}
