import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { promises as fsPromises } from 'fs';
import fs from 'fs'; // Regular fs module for stream operations
import path from 'path';
import os from 'os';

export async function POST(request) {
  try {
    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file');
    const teamId = formData.get('teamId');
    const timestamp = formData.get('timestamp');
    
    if (!file || !teamId || !timestamp) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Format the timestamp for filename
    const formattedTimestamp = new Date(timestamp).toISOString()
      .replace(/:/g, '-')
      .replace(/\..+/, '');
    
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
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/drive']
    );
    
    const drive = google.drive({ version: 'v3', auth });
    
    // Check if team folder exists
    console.log(`Checking if folder for Team ${teamId} exists...`);
    const folderQuery = `name = 'Team ${teamId}' and '${process.env.DRIVE_FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const folderResponse = await drive.files.list({
      q: folderQuery,
      fields: 'files(id, name)',
      spaces: 'drive',
    });
    
    let teamFolderId;
    
    // If folder doesn't exist, create it
    if (folderResponse.data.files.length === 0) {
      console.log(`Creating folder for Team ${teamId}...`);
      const folderMetadata = {
        name: `Team ${teamId}`,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [process.env.DRIVE_FOLDER_ID]
      };
      
      const folder = await drive.files.create({
        resource: folderMetadata,
        fields: 'id'
      });
      
      teamFolderId = folder.data.id;
    } else {
      teamFolderId = folderResponse.data.files[0].id;
    }
    
    // Upload file to the team folder
    console.log(`Uploading file ${fileName} to Team ${teamId} folder...`);
    const fileMetadata = {
      name: fileName,
      parents: [teamFolderId]
    };
    
    // Use the standard fs module for createReadStream
    const media = {
      mimeType: file.type,
      body: fs.createReadStream(tempFilePath)
    };
    
    const uploadedFile = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink'
    });
    
    // Clean up the temp file
    await fsPromises.unlink(tempFilePath);
    
    return NextResponse.json({
      message: 'File uploaded successfully',
      fileLink: uploadedFile.data.webViewLink,
      fileId: uploadedFile.data.id
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', details: error.message },
      { status: 500 }
    );
  }
}