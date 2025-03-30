'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SheetDataTable() {
  const [sheetData, setSheetData] = useState({ headers: [], data: [] });
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [prevRankings, setPrevRankings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [teamId, setTeamId] = useState('');
  const [tempTeamId, setTempTeamId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('submit');
  const [animatingTeams, setAnimatingTeams] = useState(new Set());
  
  const rankingsRef = useRef({});

  // Problems array with the requested format
  const problems = [
    { id: 1, name: 'Array Sorting' },
    { id: 2, name: 'String Manipulation' },
    { id: 3, name: 'Graph Traversal' },
    { id: 4, name: 'Dynamic Programming' },
    { id: 5, name: 'Binary Trees' },
  ];

  // Load team ID from localStorage on component mount
  useEffect(() => {
    const savedTeamId = localStorage.getItem('teamId');
    if (savedTeamId) {
      setTeamId(savedTeamId);
      setTempTeamId(savedTeamId);
    }
  }, []);

  // Function to save team ID to localStorage
  const saveTeamId = () => {
    if (tempTeamId && !isNaN(parseInt(tempTeamId)) && parseInt(tempTeamId) >= 1 && parseInt(tempTeamId) <= 100) {
      localStorage.setItem('teamId', tempTeamId);
      setTeamId(tempTeamId);
      // Show a brief flash of success
      const teamIdInput = document.getElementById('teamIdTop');
      teamIdInput.classList.add('bg-green-50');
      teamIdInput.classList.add('border-green-500');
      setTimeout(() => {
        teamIdInput.classList.remove('bg-green-50');
        teamIdInput.classList.remove('border-green-500');
      }, 1000);
    } else {
      // Show validation error
      alert('Please enter a valid Team ID (1-100)');
    }
  };

  // Handle Enter key press for team ID
  const handleTeamIdKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveTeamId();
    }
  };

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
      
      // Save previous rankings before updating
      setPrevRankings(rankingsRef.current);
      
      // Process data for leaderboard
      processLeaderboardData(data.data);
      
      setError(null);
      setLoading(false);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Process data for the leaderboard
  const processLeaderboardData = (data) => {
    if (!data || data.length === 0) {
      setLeaderboardData([]);
      return;
    }

    // Group submissions by team ID
    const teamSubmissions = {};
    
    data.forEach(submission => {
      const teamId = submission['Team ID'];
      if (!teamId) return;
      
      if (!teamSubmissions[teamId]) {
        teamSubmissions[teamId] = [];
      }
      
      // Add this submission to the team's list
      teamSubmissions[teamId].push({
        problem: submission['Problem'],
        time: new Date(submission['Time']),
        status: submission['Status']
      });
    });
    
    // Calculate statistics for each team
    const leaderboardEntries = Object.keys(teamSubmissions).map(teamId => {
      // Filter for only correct solutions
      const correctSubmissions = teamSubmissions[teamId].filter(
        submission => submission.status === 'Correct'
      );
      
      // Count unique problems solved correctly
      const uniqueProblems = new Set(correctSubmissions.map(sub => sub.problem));
      const problemsSolved = uniqueProblems.size;
      
      // Find the most recent correct submission
      let lastSubmission = null;
      let lastProblem = '';
      
      if (correctSubmissions.length > 0) {
        // Sort by time, newest first
        const sortedSubmissions = [...correctSubmissions].sort(
          (a, b) => b.time - a.time
        );
        
        lastSubmission = sortedSubmissions[0].time;
        lastProblem = sortedSubmissions[0].problem;
      }
      
      return {
        teamId,
        problemsSolved,
        lastProblem,
        lastSubmission,
      };
    });
    
    // Sort the leaderboard
    // 1. By problems solved (descending)
    // 2. Then by last submission time (ascending) if problems solved is equal
    const sortedLeaderboard = leaderboardEntries.sort((a, b) => {
      if (b.problemsSolved !== a.problemsSolved) {
        return b.problemsSolved - a.problemsSolved; // More problems = higher rank
      }
      
      // If same number of problems, earlier submission time wins
      if (a.lastSubmission && b.lastSubmission) {
        return a.lastSubmission - b.lastSubmission;
      }
      
      // If one team has no submissions, the team with submissions ranks higher
      if (a.lastSubmission) return -1;
      if (b.lastSubmission) return 1;
      
      // If neither has submissions, sort by team ID
      return parseInt(a.teamId) - parseInt(b.teamId);
    });
    
    // Add ranks and track rank changes
    const newRankings = {};
    const animatingTeams = new Set();
    
    const rankedLeaderboard = sortedLeaderboard.map((entry, index) => {
      const rankNum = index + 1;
      const oldRank = rankingsRef.current[entry.teamId] || rankNum;
      
      // Store new rank
      newRankings[entry.teamId] = rankNum;
      
      // Check if rank changed
      if (oldRank !== rankNum && oldRank !== undefined && Object.keys(rankingsRef.current).length > 0) {
        animatingTeams.add(entry.teamId);
      }
      
      return {
        rank: rankNum,
        oldRank,
        ...entry,
      };
    });
    
    // Update the rankings ref for the next comparison
    rankingsRef.current = newRankings;
    
    if (animatingTeams.size > 0) {
      setAnimatingTeams(animatingTeams);
      
      // Clear animations after they complete
      setTimeout(() => {
        setAnimatingTeams(new Set());
      }, 1500); // Match this to the animation duration
    }
    
    setLeaderboardData(rankedLeaderboard);
  };

  useEffect(() => {
    // Fetch data immediately when component mounts
    fetchData();
    
    // Set up polling every 10 seconds
    const intervalId = setInterval(fetchData, 10000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Filter out the columns we don't want to display
  const filteredHeaders = sheetData.headers ? 
    sheetData.headers.filter(header => 
      header !== 'Team ID' && header !== 'File Name'
    ) : [];

  // Filter data to show only rows matching the current teamId
  const filteredData = teamId && sheetData.data ? 
    sheetData.data.filter(row => row['Team ID']?.toString() === teamId.toString())
    : (sheetData.data || []);

  // Function to determine language from file extension
  const getLanguageFromFilename = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    switch(extension) {
      case 'py':
        return 'python';
      case 'class':  // Changed from 'java' to 'class'
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
        setSubmitError('Only Python (.py), Java (.class), and JavaScript (.js) files are allowed');
        e.target.value = '';
        return;
      }
      
      setSelectedFile(file);
      setSubmitError(null);
    }
  };

  // Handle temporary team ID change (for the top-right input)
  const handleTempTeamIdChange = (e) => {
    setTempTeamId(e.target.value);
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
      setSubmitError('Please enter and save a valid Team ID (1-100) in the top-right corner');
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
      setSubmitError('Only Python (.py), Java (.class), and JavaScript (.js) files are allowed');
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

  // Format date for leaderboard display
  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString();
  };

  // Get style classes for rank
  const getRankStyle = (rank) => {
    switch(rank) {
      case 1:
        return 'border-4 border-yellow-400 bg-yellow-50 shadow-xl'; // Gold
      case 2: 
        return 'border-4 border-gray-300 bg-gray-50 shadow-lg'; // Silver
      case 3:
        return 'border-4 border-amber-600 bg-amber-50 shadow-md'; // Bronze
      default:
        return 'border border-gray-200 bg-white shadow-sm';
    }
  };

  // Get animation classes for team cards
  const getTeamAnimation = (team) => {
    if (!animatingTeams.has(team.teamId)) return '';
    
    // Team moved up in rank
    if (team.oldRank > team.rank) {
      return 'animate-rank-improved';
    }
    
    // Team moved down in rank
    if (team.oldRank < team.rank) {
      return 'animate-rank-decreased';
    }
    
    return '';
  };

  // Get medal icon for top ranks
  const getMedalIcon = (rank) => {
    switch(rank) {
      case 1:
        return (
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-md transform rotate-12">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L10 6.477 6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 2:
        return (
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center shadow-md transform rotate-12">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L10 6.477 6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 3:
        return (
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center shadow-md transform rotate-12">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L10 6.477 6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading && !sheetData.data) {
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
    <div className="container mx-auto py-6 px-4 relative">
      {/* Team ID in top-right corner (persistent across tabs) */}
      <div className="absolute top-6 right-4 flex items-center space-x-2">
        <div className="flex flex-col">
          <label htmlFor="teamIdTop" className="block text-xs font-medium text-gray-700 mb-1">
            Team ID (1-100)
          </label>
          <div className="flex">
            <input
              id="teamIdTop"
              type="number"
              min="1"
              max="100"
              className="w-24 px-3 py-2 bg-white border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
              value={tempTeamId}
              onChange={handleTempTeamIdChange}
              onKeyDown={handleTeamIdKeyDown}
              placeholder="Team ID"
              style={{ appearance: 'textfield' }} // Remove spinner arrows
            />
            <button
              onClick={saveTeamId}
              className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Page Header (persistent across tabs) */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Coding Competition Dashboard</h1>
        {lastUpdated && (
          <p className="text-sm text-gray-500">
            Data last updated: {lastUpdated.toLocaleTimeString()} 
            <span className="ml-1 inline-flex h-2 w-2 bg-green-400 rounded-full animate-pulse"></span>
          </p>
        )}
      </div>
      
      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('submit')}
            className={`py-4 px-1 text-center border-b-2 font-medium text-sm ${
              activeTab === 'submit'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Submit Here
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`py-4 px-1 text-center border-b-2 font-medium text-sm ${
              activeTab === 'leaderboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Leaderboard
          </button>
        </div>
      </div>
      
      {/* Submit Tab Content */}
      {activeTab === 'submit' && (
        <>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    accept=".py,.class,.js"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Accepted file types: .py, .class, .js
                  </p>
                </div>
                
                <div className="col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
          
          {/* Table Info and Refresh Button */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              {teamId ? (
                <h3 className="text-lg font-medium text-gray-700">
                  Showing submissions for Team {teamId}
                  {filteredData.length === 0 && " (No submissions yet)"}
                </h3>
              ) : (
                <h3 className="text-lg font-medium text-gray-700">
                  Enter your Team ID in the top-right corner to view your submissions
                </h3>
              )}
            </div>
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
          
          {/* Results Table - Fixed Header with Separate Scroll for Body */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">Submission Results</h2>
            </div>
            
            {sheetData.headers && sheetData.headers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {filteredHeaders.map((header, index) => (
                        <th 
                          key={index} 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.length > 0 ? (
                      filteredData.map((row, rowIndex) => (
                        <tr 
                          key={rowIndex} 
                          className={getRowBackgroundColor(row)}
                        >
                          {filteredHeaders.map((header, colIndex) => (
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
                      ))
                    ) : (
                      <tr>
                        <td 
                          colSpan={filteredHeaders.length} 
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          {teamId ? `No submissions found for Team ${teamId}` : 'Enter your Team ID to view your submissions'}
                        </td>
                      </tr>
                    )}
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
        </>
      )}
      
      {/* Leaderboard Tab Content - Now with Card Design */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Competition Leaderboard</h2>
          
          <div className="mb-4 flex justify-end">
            <button 
              onClick={fetchData}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh Leaderboard</span>
            </button>
          </div>
          
          {/* Card-based leaderboard layout */}
          {leaderboardData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leaderboardData.map((team) => (
                <div
                  key={team.teamId}
                  className={`rounded-lg p-6 relative transition-all duration-300 ${
                    getRankStyle(team.rank)
                  } ${
                    team.teamId === teamId ? 'ring-2 ring-blue-400' : ''
                  } ${
                    getTeamAnimation(team)
                  }`}
                >
                  {/* Medal icon for top 3 */}
                  {getMedalIcon(team.rank)}
                  
                  {/* Rank number (largest text) */}
                  <div className="flex items-center mb-4">
                    <div className="text-6xl font-bold text-gray-800 mr-3">
                      {team.rank}
                    </div>
                    
                    {/* Team ID (second largest text) */}
                    <div>
                      <div className="text-2xl font-semibold text-gray-700">
                        Team {team.teamId}
                      </div>
                      {team.teamId === teamId && (
                        <div className="text-sm text-blue-500 font-medium">
                          That's you!
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Stats section */}
                  <div className="mt-4 border-t pt-4 border-gray-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Problems Solved</div>
                        <div className="text-xl font-semibold text-gray-800">
                          {team.problemsSolved}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500">Last Problem</div>
                        <div className="text-lg text-gray-800 truncate" title={team.lastProblem}>
                          {team.lastProblem || '-'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-sm text-gray-500">Last Submission</div>
                      <div className="text-base text-gray-800">
                        {formatDate(team.lastSubmission)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No leaderboard data available</h3>
              <p className="mt-1 text-sm text-gray-500">
                Once teams submit solutions and they're reviewed, their rankings will appear here.
              </p>
            </div>
          )}
          
          {leaderboardData.length > 0 && (
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full mr-2 bg-yellow-400 border border-yellow-500"></div>
                <span className="text-sm text-gray-500">Gold (1st Place)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full mr-2 bg-gray-300 border border-gray-400"></div>
                <span className="text-sm text-gray-500">Silver (2nd Place)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full mr-2 bg-amber-600 border border-amber-700"></div>
                <span className="text-sm text-gray-500">Bronze (3rd Place)</span>
              </div>
              {teamId && (
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2 bg-blue-100 border-2 border-blue-400"></div>
                  <span className="text-sm text-gray-500">Your Team</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="mt-4 text-center text-xs text-gray-400">
        Data refreshes automatically every 10 seconds
      </div>
      
      {/* Add global CSS for animations and styling */}
      <style jsx global>{`
        /* Remove spinner for Chrome, Safari, Edge, Opera */
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        /* Remove spinner for Firefox */
        input[type=number] {
          -moz-appearance: textfield;
        }
        
        /* Rank change animations */
        @keyframes rankImproved {
          0% { transform: translateY(0); }
          25% { transform: translateY(-20px); background-color: rgba(167, 243, 208, 0.5); }
          50% { transform: translateY(-10px); }
          75% { transform: translateY(-5px); }
          100% { transform: translateY(0); }
        }
        
        @keyframes rankDecreased {
          0% { transform: translateY(0); }
          25% { transform: translateY(20px); background-color: rgba(254, 202, 202, 0.5); }
          50% { transform: translateY(10px); }
          75% { transform: translateY(5px); }
          100% { transform: translateY(0); }
        }
        
        .animate-rank-improved {
          animation: rankImproved 1.5s ease-in-out;
        }
        
        .animate-rank-decreased {
          animation: rankDecreased 1.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}