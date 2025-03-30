import { google } from 'googleapis';
import { NextResponse } from 'next/server';

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
      status 
    } = requestData;
    
    // Validate required fields
    if (!teamId || !problemName || !timeSubmitted || !fileName || !fileLink || !language) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Configure Google Sheets API
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Format the time for display
    const formattedTime = new Date(timeSubmitted).toLocaleString();
    
    // Prepare the row data
    const rowData = [
      teamId.toString(),
      problemName,
      formattedTime,
      fileName,
      fileLink,
      language,
      status || 'Not Reviewed'
    ];
    
    // Append the row to the spreadsheet
    console.log('Adding new entry to the spreadsheet...');
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Sheet1!A:G', // 7 columns (A through G)
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [rowData]
      }
    });
    
    return NextResponse.json({
      message: 'Entry added successfully',
      updatedRows: response.data.updates.updatedRows
    });
  } catch (error) {
    console.error('Error adding sheet entry:', error);
    return NextResponse.json(
      { error: 'Failed to add entry to spreadsheet', details: error.message },
      { status: 500 }
    );
  }
}