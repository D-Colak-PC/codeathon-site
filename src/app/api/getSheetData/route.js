import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('API route called, attempting authentication');
    
    // More robust approach to handle the private key
    const privateKey = process.env.GOOGLE_PRIVATE_KEY ?
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') :
      undefined;
    
    console.log('Service account email:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    console.log('Private key loaded:', privateKey ? 'Yes (length: ' + privateKey.length + ')' : 'No');
    
    // Create JWT client
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });
    
    // Try to authorize (this validates the credentials)
    console.log('Attempting to authorize...');
    await auth.authorize();
    console.log('Authorization successful!');
    
    // Create sheets API client
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Get spreadsheet data
    console.log('Fetching spreadsheet data...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Sheet1!A1:G6', // Adjust if your sheet has a different name
    });
    
    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      console.log('No data found in spreadsheet');
      return NextResponse.json({ error: 'No data found.' }, { status: 404 });
    }
    
    // Assuming first row contains headers
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index] || '';
      });
      return rowData;
    });
    
    console.log('Data successfully retrieved');
    return NextResponse.json({ headers, data });
  } catch (error) {
    console.error('Error:', error.message);
    
    // Provide more specific error messages based on the error
    if (error.message.includes('invalid_grant')) {
      return NextResponse.json({ 
        error: 'Authentication Error', 
        details: 'There was a problem with the service account credentials. Make sure the service account exists and is active.'
      }, { status: 401 });
    } else if (error.message.includes('not found')) {
      return NextResponse.json({ 
        error: 'Spreadsheet Not Found', 
        details: 'The spreadsheet could not be found. Make sure the ID is correct and the spreadsheet is shared with ' + process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
      }, { status: 404 });
    } else {
      return NextResponse.json({ 
        error: 'Google Sheets API Error', 
        details: error.message
      }, { status: 500 });
    }
  }
}