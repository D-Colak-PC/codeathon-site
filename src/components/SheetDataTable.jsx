'use client';

import { useState, useEffect } from 'react';

export default function SheetDataTable() {
  const [sheetData, setSheetData] = useState({ headers: [], data: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [teamId, setTeamId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Problems array with the requested format
  const problems = [
    { id: 1, name: 'Array Sorting' },
    { id: 2, name: 'String Manipulation' },
    { id: 3, name: 'Graph Traversal' },
    { id: 4, name: 'Dynamic Programming' },
    { id: 5, name: 'Binary Trees' },
  ];

  const fetchData = async () => {
    try {
      const response = await fetch('/api/getSheetData');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API response not OK:', response.status, errorData);
        setError(`API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      setSheetData(data);
      setError(null);
      setLoading(false);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data immediately when component mounts
    fetchData();
    
    // Set up polling every 10 seconds
    const intervalId = setInterval(fetchData, 10000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Function to determine language from file extension
  const getLanguageFromFilename = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    switch(extension) {
      case 'py':
        return 'python';
      case 'java':
        return 'java';
      case 'js':
        return 'javascript';
      default:
        return null;
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const language = getLanguageFromFilename(file.name);
      
      if (!language) {
        setSubmitError('Only Python (.py), Java (.java), and JavaScript (.js) files are allowed');
        e.target.value = '';
        return;
      }
      
      setSelectedFile(file);
      setSubmitError(null);
    }
  };

  // Handle team ID change
  const handleTeamIdChange = (e) => {
    const value = e.target.value;
    setTeamId(value);
    
    // Validate team ID
    if (value && (isNaN(parseInt(value)) || parseInt(value) < 1 || parseInt(value) > 100)) {
      setSubmitError('Team ID must be a number between 1 and 100');
    } else {
      setSubmitError(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset states
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    
    // Validate inputs
    if (!teamId || parseInt(teamId) < 1 || parseInt(teamId) > 100) {
      setSubmitError('Team ID must be a number between 1 and 100');
      setSubmitting(false);
      return;
    }
    
    if (!selectedProblem) {
      setSubmitError('Please select a problem');
      setSubmitting(false);
      return;
    }
    
    if (!selectedFile) {
      setSubmitError('Please select a file to upload');
      setSubmitting(false);
      return;
    }
    
    // Check file type
    const language = getLanguageFromFilename(selectedFile.name);
    if (!language) {
      setSubmitError('Only Python, Java, and JavaScript files are allowed');
      setSubmitting(false);
      return;
    }
    
    try {
      // Prepare submission data
      const currentTime = new Date();
      const formattedTime = currentTime.toISOString();
      const fileName = selectedFile.name;
      
      // Get problem name from selected problem id
      const problemObj = problems.find(p => p.id === parseInt(selectedProblem));
      if (!problemObj) {
        throw new Error('Invalid problem selected');
      }
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('teamId', teamId);
      formData.append('timestamp', formattedTime);
      
      // Upload file to Google Drive
      const uploadResponse = await fetch('/api/uploadFile', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        throw new Error(`Failed to upload file: ${errorData.error || 'Unknown error'}`);
      }
      
      const uploadResult = await uploadResponse.json();
      
      // Add entry to Google Sheets
      const sheetResponse = await fetch('/api/addSheetEntry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId,
          problemName: problemObj.name,
          timeSubmitted: formattedTime,
          fileName,
          fileLink: uploadResult.fileLink,
          language,
          status: 'Not Reviewed',
        }),
      });
      
      if (!sheetResponse.ok) {
        const errorData = await sheetResponse.json().catch(() => ({}));
        throw new Error(`Failed to add entry to spreadsheet: ${errorData.error || 'Unknown error'}`);
      }
      
      // Success!
      setSubmitSuccess(true);
      setSelectedFile(null);
      
      // Reset form fields but keep the team ID
      document.getElementById('solution').value = '';
      setSelectedProblem('');
      
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError(`Error submitting solution: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Function to determine row background color based on Status (7th column)
  const getRowBackgroundColor = (row) => {
    const status = row['Status'];
    
    if (!status) return 'bg-white';
    
    switch(status.trim()) {
      case 'In Review':
        return 'bg-yellow-100';
      case 'Incorrect':
        return 'bg-red-100';
      case 'Correct':
        return 'bg-green-100';
      case 'Not Reviewed':
      default:
        return 'bg-white';
    }
  };

  if (loading && !sheetData.data.length) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-gray-700 text-lg font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-center text-lg font-medium text-gray-900 mb-1">Error</h2>
          <p className="text-center text-sm text-gray-500">{error}</p>
          <div className="flex justify-center mt-4">
            <button 
              onClick={fetchData}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Coding Competition Dashboard</h1>
        {lastUpdated && (
          <p className="text-sm text-gray-500">
            Data last updated: {lastUpdated.toLocaleTimeString()} 
            <span className="ml-1 inline-flex h-2 w-2 bg-green-400 rounded-full animate-pulse"></span>
          </p>
        )}
      </div>
      
      {/* Problem Submission Form */}
      <div className="bg-white shadow-md rounded-lg mb-8 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Submit Your Solution</h2>
        
        {submitSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            Solution submitted successfully! Your submission is now being processed.
          </div>
        )}
        
        {submitError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {submitError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="col-span-1">
              <label htmlFor="teamId" className="block text-sm font-medium text-gray-700 mb-1">
                Team ID (1-100)
              </label>
              <input
                id="teamId"
                type="number"
                min="1"
                max="100"
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={teamId}
                onChange={handleTeamIdChange}
                required
              />
            </div>
            
            <div className="col-span-1">
              <label htmlFor="problem" className="block text-sm font-medium text-gray-700 mb-1">
                Select Problem
              </label>
              <select
                id="problem"
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedProblem}
                onChange={(e) => setSelectedProblem(e.target.value)}
                required
              >
                <option value="">-- Select a problem --</option>
                {problems.map((problem) => (
                  <option key={problem.id} value={problem.id}>
                    {problem.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-span-1">
              <label htmlFor="solution" className="block text-sm font-medium text-gray-700 mb-1">
                Upload Solution File
              </label>
              <input
                id="solution"
                type="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Accepted file types: .py, .java, .js
              </p>
            </div>
            
            <div className="col-span-1 flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Submit Solution
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Refresh Button */}
      <div className="mb-6 flex justify-end">
        <button 
          onClick={fetchData}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh Results</span>
        </button>
      </div>
      
      {/* Results Table - Now with 7 columns */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Submission Results</h2>
        </div>
        
        {sheetData.headers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {sheetData.headers.map((header, index) => (
                    <th 
                      key={index} 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sheetData.data.map((row, rowIndex) => (
                  <tr 
                    key={rowIndex} 
                    className={getRowBackgroundColor(row)}
                  >
                    {sheetData.headers.map((header, colIndex) => (
                      <td 
                        key={colIndex} 
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {header === 'File Link' && row[header] ? (
                          <a 
                            href={row[header]} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View File
                          </a>
                        ) : (
                          row[header]
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">No data available</p>
          </div>
        )}
      </div>
      
      {/* Status Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded mr-2 bg-white border border-gray-200"></div>
          <span className="text-xs text-gray-500">Not Reviewed</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded mr-2 bg-yellow-100"></div>
          <span className="text-xs text-gray-500">In Review</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded mr-2 bg-red-100"></div>
          <span className="text-xs text-gray-500">Incorrect</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded mr-2 bg-green-100"></div>
          <span className="text-xs text-gray-500">Correct</span>
        </div>
      </div>
      
      <div className="mt-4 text-center text-xs text-gray-400">
        Data refreshes automatically every 10 seconds
      </div>
    </div>
  );
}