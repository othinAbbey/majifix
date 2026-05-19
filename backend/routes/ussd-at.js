const express = require('express');
const AfricasTalking = require('africastalking');
const {
  findWaterPointById,
  createWaterPoint,
  findTechnicianByPhoneNumber,
  createFaultReport,
  assignTechnicianToFault,
  updateWaterPointStatus,
  notifyAdminsAndDistrictOfficers,
  createRepairLog,
} = require('../utils/faultHelpers');

const { AT_USERNAME, AT_API_KEY } = process.env;
if (!AT_USERNAME || !AT_API_KEY) {
  throw new Error('AT_USERNAME and AT_API_KEY are required to initialize Africa\'s Talking USSD route');
}

const atClient = AfricasTalking({ username: AT_USERNAME, apiKey: AT_API_KEY });
const ussdHandler = atClient.USSD;
const router = express.Router();

const ISSUE_TYPES = [
  { id: '1', label: 'Broken pump', value: 'broken_pump' },
  { id: '2', label: 'No water', value: 'no_water' },
  { id: '3', label: 'Low pressure', value: 'low_pressure' },
  { id: '4', label: 'Contamination', value: 'contamination' },
  { id: '5', label: 'Other', value: 'other' },
];

const PROBLEM_TYPES = [
  { id: '1', label: 'Broken seals', value: 'broken_seals' },
  { id: '2', label: 'Broken rods', value: 'broken_rods' },
  { id: '3', label: 'Missing parts', value: 'missing_parts' },
  { id: '4', label: 'Leaking joints', value: 'leaking_joints' },
  { id: '5', label: 'Motor failure', value: 'motor_failure' },
  { id: '6', label: 'Other', value: 'other' },
];

const REMEDY_OPTIONS = [
  { id: '1', label: 'New part bought', value: 'new_part_bought' },
  { id: '2', label: 'Old part repaired', value: 'old_part_repaired' },
  { id: '3', label: 'No parts needed', value: 'no_parts_needed' },
  { id: '4', label: 'Further assessment required', value: 'further_assessment' },
];

const getIssueTypeById = (id) => ISSUE_TYPES.find((item) => item.id === id);
const buildIssueTypePrompt = () => ISSUE_TYPES.map((item) => `${item.id}. ${item.label}`).join('\n');
const getProblemTypeById = (id) => PROBLEM_TYPES.find((item) => item.id === id);
const buildProblemTypesPrompt = () => PROBLEM_TYPES.map((item) => `${item.id}. ${item.label}`).join('\n');
const getRemedyById = (id) => REMEDY_OPTIONS.find((item) => item.id === id);
const buildRemedyPrompt = () => REMEDY_OPTIONS.map((item) => `${item.id}. ${item.label}`).join('\n');

const findAssignmentById = async (id) => {
  const result = await require('../db').query(
    `SELECT a.*, fr.water_point_id, fr.issue_type, fr.description, wp.name AS water_point_name, wp.district AS water_point_district, u.username AS technician_name
     FROM assignments a
     JOIN fault_reports fr ON a.fault_report_id = fr.id
     JOIN water_points wp ON fr.water_point_id = wp.id
     JOIN users u ON a.technician_id = u.id
     WHERE a.id = $1`,
    [id]
  );
  return result.rows[0];
};

const buildAssignmentStatusLine = (assignment) => {
  if (!assignment) return 'No assignment yet';
  return `Assignment #${assignment.id} - ${assignment.status} (${assignment.technician_name})`;
};

const handleUssd = async (payload, reply) => {
  const { text = '', phoneNumber = '' } = payload;
  const trimmedText = String(text || '').trim();
  const userInput = trimmedText === '' ? [] : trimmedText.split('*');

  try {
    if (userInput.length === 0) {
      return reply({
        response: 'Welcome to MajiFix USSD.\n1. Report a fault\n2. Check report status\n3. Get water point info\n4. Technician update\n5. Help\n6. Register water point',
        endSession: false,
      });
    }

    const [option, step2, step3, step4, step5, step6, step7, ...rest] = userInput;
    const notesText = rest.join('*').trim();

    switch (option) {
      case '1': {
        if (!step2) {
          return reply({ response: 'Enter water point ID to report a fault:', endSession: false });
        }

        const waterPoint = await findWaterPointById(step2);
        if (!waterPoint) {
          return reply({ response: 'Water point not found. Please try again or end the session.', endSession: true });
        }

        if (!step3) {
          return reply({ response: `Reporting for ${waterPoint.name}.\n${buildIssueTypePrompt()}`, endSession: false });
        }

        const issue = getIssueTypeById(step3);
        if (!issue) {
          return reply({ response: 'Invalid issue type. Please restart the menu and try again.', endSession: true });
        }

        if (!step4) {
          return reply({ response: 'Describe the fault in a few words:', endSession: false });
        }

        if (!step5) {
          return reply({ response: 'Request technician funds?\n1. Yes\n2. No', endSession: false });
        }

        if (step5 === '1') {
          if (!step6) {
            return reply({ response: 'Enter amount requested for technician funds:', endSession: false });
          }

          const requestedAmount = parseFloat(step6);
          if (Number.isNaN(requestedAmount) || requestedAmount <= 0) {
            return reply({ response: 'Invalid amount. Enter a numeric amount:', endSession: false });
          }

          const report = await createFaultReport(waterPoint.id, issue.value, step4, null, true, requestedAmount, 'Village requested technician funds');
          await updateWaterPointStatus(waterPoint.id, 'broken');
          await notifyAdminsAndDistrictOfficers(waterPoint.district, `New fault report #${report.id} created for ${waterPoint.name}.`, 'fault_report');
          const assignment = await assignTechnicianToFault(report.id, waterPoint);

          const assignmentMessage = assignment
            ? ` Assigned to ${assignment.technician.username}.`
            : ' No technician is available in the area yet.';

          return reply({ response: `Fault report #${report.id} created for ${waterPoint.name}. Requested funds: ${requestedAmount}.${assignmentMessage}`, endSession: true });
        }

        if (step5 === '2') {
          const report = await createFaultReport(waterPoint.id, issue.value, step4, null, false, null, null);
          await updateWaterPointStatus(waterPoint.id, 'broken');
          await notifyAdminsAndDistrictOfficers(waterPoint.district, `New fault report #${report.id} created for ${waterPoint.name}.`, 'fault_report');
          const assignment = await assignTechnicianToFault(report.id, waterPoint);

          const assignmentMessage = assignment
            ? ` Assigned to ${assignment.technician.username}.`
            : ' No technician is available in the area yet.';

          return reply({ response: `Fault report #${report.id} created for ${waterPoint.name}.${assignmentMessage}`, endSession: true });
        }

        return reply({ response: 'Invalid choice. Enter 1 for Yes or 2 for No.', endSession: true });
      }

      case '2': {
        if (!step2) {
          return reply({ response: 'Enter fault report ID to check status:', endSession: false });
        }

        const result = await require('../db').query(
          `SELECT fr.id, fr.issue_type, fr.description, fr.timestamp, fr.requested_funds, fr.requested_funds_amount, wp.name AS water_point_name,
                  a.id AS assignment_id, a.status AS assignment_status, u.username AS technician_name
           FROM fault_reports fr
           JOIN water_points wp ON fr.water_point_id = wp.id
           LEFT JOIN assignments a ON a.fault_report_id = fr.id
           LEFT JOIN users u ON a.technician_id = u.id
           WHERE fr.id = $1`,
          [step2]
        );

        const report = result.rows[0];
        if (!report) {
          return reply({ response: 'Fault report not found. Please check the ID and try again.', endSession: true });
        }

        const fundsLine = report.requested_funds
          ? `Requested funds: ${report.requested_funds_amount}`
          : 'Requested funds: none';
        const assignmentLine = report.assignment_id
          ? `Assignment ${report.assignment_id}: ${report.assignment_status} - ${report.technician_name}`
          : 'Assignment pending';

        return reply({
          response: `Report #${report.id} for ${report.water_point_name}:\nIssue: ${report.issue_type}\n${fundsLine}\n${assignmentLine}\nDate: ${new Date(report.timestamp).toLocaleString()}`,
          endSession: true,
        });
      }

      case '3': {
        if (!step2) {
          return reply({ response: 'Enter water point ID to view information:', endSession: false });
        }

        const waterPoint = await findWaterPointById(step2);
        if (!waterPoint) {
          return reply({ response: 'Water point not found. Please check the ID and try again.', endSession: true });
        }

        return reply({ response: `Water Point: ${waterPoint.name}\nLocation: ${waterPoint.district}, ${waterPoint.village}\nStatus: ${waterPoint.status}`, endSession: true });
      }

      case '4': {
        if (!step2) {
          return reply({ response: 'Enter assignment ID to log progress:', endSession: false });
        }

        const assignment = await findAssignmentById(step2);
        if (!assignment) {
          return reply({ response: 'Assignment not found. Please check the ID and try again.', endSession: true });
        }

        const technician = await findTechnicianByPhoneNumber(phoneNumber);
        if (!technician || technician.id !== assignment.technician_id) {
          return reply({ response: 'Your number is not attached to this assignment or you are not a registered technician.', endSession: true });
        }

        if (!step3) {
          return reply({ response: 'Enter transport cost in KES:', endSession: false });
        }

        if (!step4) {
          return reply({ response: `Problem found:\n${buildProblemTypesPrompt()}`, endSession: false });
        }

        const problem = getProblemTypeById(step4);
        if (!problem) {
          return reply({ response: 'Invalid problem category. Please restart the technician flow.', endSession: true });
        }

        if (!step5) {
          return reply({ response: `Remedy options:\n${buildRemedyPrompt()}`, endSession: false });
        }

        const remedy = getRemedyById(step5);
        if (!remedy) {
          return reply({ response: 'Invalid remedy selection. Please restart the technician flow.', endSession: true });
        }

        if (!step6) {
          return reply({ response: 'Enter material costs in KES (enter 0 if none):', endSession: false });
        }

        if (!step7) {
          return reply({ response: 'Add additional notes or press 0 for none:', endSession: false });
        }

        const transportCost = parseFloat(step3);
        const materialsCost = parseFloat(step6);
        const notes = step7 === '0' ? '' : [step7, ...rest].join('*').trim();

        if (Number.isNaN(transportCost) || transportCost < 0) {
          return reply({ response: 'Invalid transport cost. Please restart and enter a numeric value.', endSession: true });
        }
        if (Number.isNaN(materialsCost) || materialsCost < 0) {
          return reply({ response: 'Invalid materials cost. Please restart and enter a numeric value.', endSession: true });
        }

        const repair = await createRepairLog({
          assignmentId: assignment.id,
          technicianId: technician.id,
          transportCost,
          materialsCost,
          problemFound: problem.value,
          remedy: remedy.value,
          additionalNotes: notes,
        });

        await notifyAdminsAndDistrictOfficers(
          assignment.water_point_district,
          `Technician ${technician.username} logged progress for assignment #${assignment.id}.`,
          'repair_progress'
        );

        return reply({ response: `Repair logged. Assignment ${assignment.id} updated to ${repair.repair_status}. Total cost: ${repair.cost} KES.`, endSession: true });
      }

      case '5': {
        return reply({ response: 'MajiFix USSD help:\n1 - Report a fault\n2 - Check report status\n3 - Water point info\n4 - Technician update\n6 - Register water point\nEnd the session by pressing 0 or hanging up.', endSession: true });
      }

      case '6': {
        if (!step2) {
          return reply({ response: 'Enter district:', endSession: false });
        }

        if (!step3) {
          return reply({ response: 'Enter parish:', endSession: false });
        }

        if (!step4) {
          return reply({ response: 'Enter village:', endSession: false });
        }

        if (!step5) {
          return reply({ response: 'Enter water point number or code:', endSession: false });
        }

        const district = step2.trim();
        const parish = step3.trim();
        const village = step4.trim();
        const waterPointNumber = step5.trim();

        if (!district || !parish || !village || !waterPointNumber) {
          return reply({ response: 'All fields are required. Restart and provide district, parish, village, and water point number.', endSession: true });
        }

        const newPoint = await createWaterPoint({
          name: `WP ${waterPointNumber}`,
          district,
          parish,
          village,
          waterPointNumber,
          status: 'working',
          createdViaUssd: true,
        });

        await notifyAdminsAndDistrictOfficers(district, `New water point ${newPoint.name} created in ${village}, ${parish}, ${district}.`, 'water_point_created');

        return reply({ response: `Water point ${newPoint.name} created with ID ${newPoint.id}. Use option 1 to report a fault if needed.`, endSession: true });
      }

      default:
        return reply({ response: 'Invalid option. Please try again.', endSession: true });
    }
  } catch (error) {
    console.error('Africa Talking USSD error:', error);
    return reply({ response: 'An error occurred. Please try again later.', endSession: true });
  }
};

router.post('/', ...ussdHandler(handleUssd));

module.exports = router;
