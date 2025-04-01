"use client";

import SubmissionForm from "./SubmissionForm";
import SubmissionTable from "./SubmissionTable";
import StatusLegend from "./StatusLegend";
import RefreshButton from "../common/RefreshButton";

/**
 * Container component for the submission tab
 * @param {Object} props - Component props
 * @param {Object} props.submission - Submission state and handlers from useSubmission hook
 * @param {Object} props.sheetData - Sheet data from useSheetData hook
 * @param {string} props.teamId - Current team ID
 */
export default function SubmitTab({ submission, sheetData, teamId }) {
	return (
		<>
			<SubmissionForm
				selectedProblem={submission.selectedProblem}
				setSelectedProblem={submission.setSelectedProblem}
				submitting={submission.submitting}
				submitError={submission.submitError}
				submitSuccess={submission.submitSuccess}
				handleFileChange={submission.handleFileChange}
				handleSubmit={submission.handleSubmit}
			/>

			<div className="mb-6 flex justify-end">
				<RefreshButton
					onClick={sheetData.fetchData}
					text="Refresh Results"
				/>
			</div>

			<SubmissionTable
				filteredHeaders={sheetData.filteredHeaders}
				filteredData={sheetData.filteredData}
				teamId={teamId}
				fetchData={sheetData.fetchData}
			/>

			<StatusLegend />
		</>
	);
}
