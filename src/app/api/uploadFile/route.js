import { google } from "googleapis";
import { NextResponse } from "next/server";
import { promises as fsPromises } from "fs";
import fs from "fs"; // Regular fs module for stream operations
import path from "path";
import os from "os";

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed file types
const ALLOWED_FILE_TYPES = [
	"text/x-python", // .py files
	"application/octet-stream", // .class files
	"text/javascript", // .js files
	"application/javascript", // Alternative MIME type for .js
];

export async function POST(request) {
	try {
		// Parse the form data
		const formData = await request.formData();
		const file = formData.get("file");
		const teamId = formData.get("teamId");
		const timeSubmitted = formData.get("timeSubmitted");

		// Validate required fields
		if (!file || !teamId || !timeSubmitted) {
			return NextResponse.json(
				{
					error: "Missing required fields",
					details:
						"All fields (file, teamId, timeSubmitted) are required",
				},
				{ status: 400 }
			);
		}

		// Validate team ID
		const teamIdNum = parseInt(teamId);
		if (isNaN(teamIdNum) || teamIdNum < 1 || teamIdNum > 100) {
			return NextResponse.json(
				{
					error: "Invalid team ID",
					details: "Team ID must be a number between 1 and 100",
				},
				{ status: 400 }
			);
		}

		// File size validation
		if (file.size > MAX_FILE_SIZE) {
			return NextResponse.json(
				{
					error: "File too large",
					details: "Maximum file size is 5MB",
				},
				{ status: 400 }
			);
		}

		// File type validation
		if (
			!ALLOWED_FILE_TYPES.includes(file.type) &&
			!file.name.endsWith(".py") &&
			!file.name.endsWith(".class") &&
			!file.name.endsWith(".js")
		) {
			return NextResponse.json(
				{
					error: "Invalid file type",
					details:
						"Only Python (.py), Java (.class), and JavaScript (.js) files are allowed",
				},
				{ status: 400 }
			);
		}

		// Validate environment variables
		if (
			!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
			!process.env.GOOGLE_PRIVATE_KEY ||
			!process.env.DRIVE_FOLDER_ID
		) {
			return NextResponse.json(
				{
					error: "Server configuration error",
					details: "Missing required environment variables",
				},
				{ status: 500 }
			);
		}

		// Format the timestamp for filename
		const formattedTimestamp = new Date(timeSubmitted)
			.toISOString()
			.replace(/:/g, "-")
			.replace(/\..+/, "");

		// Get the file content
		const fileBuffer = Buffer.from(await file.arrayBuffer());
		const fileName = `${formattedTimestamp}-${file.name}`;

		// Temporarily save the file
		const tempDir = os.tmpdir();
		const tempFilePath = path.join(tempDir, fileName);
		await fsPromises.writeFile(tempFilePath, fileBuffer);

		// Configure Google Drive API
		const auth = new google.auth.JWT(
			process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
			null,
			process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
			["https://www.googleapis.com/auth/drive"]
		);

		const drive = google.drive({ version: "v3", auth });

		// Check if team folder exists
		console.log(`Checking if folder for Team ${teamId} exists...`);
		const folderQuery = `name = 'Team ${teamId}' and '${process.env.DRIVE_FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
		const folderResponse = await drive.files.list({
			q: folderQuery,
			fields: "files(id, name)",
			spaces: "drive",
		});

		let teamFolderId;

		// If folder doesn't exist, create it
		if (folderResponse.data.files.length === 0) {
			console.log(`Creating folder for Team ${teamId}...`);
			const folderMetadata = {
				name: `Team ${teamId}`,
				mimeType: "application/vnd.google-apps.folder",
				parents: [process.env.DRIVE_FOLDER_ID],
			};

			const folder = await drive.files.create({
				resource: folderMetadata,
				fields: "id",
			});

			teamFolderId = folder.data.id;
		} else {
			teamFolderId = folderResponse.data.files[0].id;
		}

		// Upload file to the team folder
		console.log(`Uploading file ${fileName} to Team ${teamId} folder...`);
		const fileMetadata = {
			name: fileName,
			parents: [teamFolderId],
		};

		// Use the standard fs module for createReadStream
		const media = {
			mimeType: file.type,
			body: fs.createReadStream(tempFilePath),
		};

		const uploadedFile = await drive.files.create({
			resource: fileMetadata,
			media: media,
			fields: "id, webViewLink",
		});

		// Clean up the temp file
		await fsPromises.unlink(tempFilePath);

		return NextResponse.json({
			message: "File uploaded successfully",
			fileLink: uploadedFile.data.webViewLink,
			fileId: uploadedFile.data.id,
		});
	} catch (error) {
		console.error("Error uploading file:", error);

		// Categorize errors for more helpful responses
		if (error.message.includes("insufficientPermissions")) {
			return NextResponse.json(
				{
					error: "Permission denied",
					details:
						"The application doesn't have permission to access Google Drive",
				},
				{ status: 403 }
			);
		} else if (error.message.includes("rate limit")) {
			return NextResponse.json(
				{
					error: "Rate limit exceeded",
					details:
						"Too many requests to Google Drive API. Please try again later.",
				},
				{ status: 429 }
			);
		} else if (error.message.includes("ENOSPC")) {
			return NextResponse.json(
				{
					error: "Server storage full",
					details:
						"Not enough disk space on the server to process the file",
				},
				{ status: 507 }
			);
		} else {
			return NextResponse.json(
				{
					error: "Failed to upload file",
					details: error.message,
				},
				{ status: 500 }
			);
		}
	}
}

// Increase the body size limit for file uploads
export const config = {
	api: {
		bodyParser: false,
		responseLimit: false,
	},
};
