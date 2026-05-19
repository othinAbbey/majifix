const express = require('express');
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

const db = require('../db');

const router = express.Router();

// =======================================
// IMPORTANT MIDDLEWARE
// =======================================
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

// =======================================
// ISSUE TYPES
// =======================================
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

// =======================================
// HELPERS
// =======================================
const getIssueTypeById = (id) =>
  ISSUE_TYPES.find((item) => item.id === id);

const buildIssueTypePrompt = () =>
  ISSUE_TYPES.map((item) => `${item.id}. ${item.label}`).join('\n');

const getProblemTypeById = (id) =>
  PROBLEM_TYPES.find((item) => item.id === id);

const buildProblemTypesPrompt = () =>
  PROBLEM_TYPES.map((item) => `${item.id}. ${item.label}`).join('\n');

const getRemedyById = (id) =>
  REMEDY_OPTIONS.find((item) => item.id === id);

const buildRemedyPrompt = () =>
  REMEDY_OPTIONS.map((item) => `${item.id}. ${item.label}`).join('\n');

// =======================================
// FIND ASSIGNMENT
// =======================================
const findAssignmentById = async (id) => {
  const result = await db.query(
    `
    SELECT 
      a.*,
      fr.water_point_id,
      fr.issue_type,
      fr.description,
      wp.name AS water_point_name,
      wp.district AS water_point_district,
      u.username AS technician_name

    FROM assignments a

    JOIN fault_reports fr
      ON a.fault_report_id = fr.id

    JOIN water_points wp
      ON fr.water_point_id = wp.id

    JOIN users u
      ON a.technician_id = u.id

    WHERE a.id = $1
    `,
    [id]
  );

  return result.rows[0];
};

// =======================================
// MAIN USSD ROUTE
// =======================================
router.post('/', async (req, res) => {

  console.log("🔥 USSD REQUEST:", req.body);

  try {

    const sessionId = req.body?.sessionId;
    const phoneNumber = req.body?.phoneNumber;
    const text = req.body?.text || '';

    console.log("📱 PHONE:", phoneNumber);
    console.log("📝 TEXT:", text);

    const trimmedText = String(text).trim();

    const userInput =
      trimmedText === ''
        ? []
        : trimmedText.split('*');

    const reply = (response, endSession = false) => {

      const prefix = endSession ? 'END ' : 'CON ';

      console.log("📤 RESPONSE:", prefix + response);

      res.set('Content-Type', 'text/plain');

      return res.send(prefix + response);
    };

    // =======================================
    // MAIN MENU
    // =======================================
    if (userInput.length === 0) {

      return reply(
`Welcome to MajiFix USSD

1. Report a fault
2. Check report status
3. Get water point info
4. Technician update
5. Help
6. Register water point`,
        false
      );
    }

    const [
      option,
      step2,
      step3,
      step4,
      step5,
      step6,
      step7,
      ...rest
    ] = userInput;

    // =======================================
    // OPTION 1 - REPORT FAULT
    // =======================================
    if (option === '1') {

      if (!step2) {
        return reply(
          'Enter water point ID:',
          false
        );
      }

      const waterPoint = await findWaterPointById(step2);

      if (!waterPoint) {
        return reply(
          'Water point not found.',
          true
        );
      }

      if (!step3) {
        return reply(
`Reporting for ${waterPoint.name}

${buildIssueTypePrompt()}`,
          false
        );
      }

      const issue = getIssueTypeById(step3);

      if (!issue) {
        return reply(
          'Invalid issue type.',
          true
        );
      }

      if (!step4) {
        return reply(
          'Describe the fault:',
          false
        );
      }

      const report = await createFaultReport(
        waterPoint.id,
        issue.value,
        step4,
        null,
        false,
        null,
        null
      );

      await updateWaterPointStatus(
        waterPoint.id,
        'broken'
      );

      await notifyAdminsAndDistrictOfficers(
        waterPoint.district,
        `New fault report #${report.id} created.`,
        'fault_report'
      );

      const assignment =
        await assignTechnicianToFault(
          report.id,
          waterPoint
        );

      const assignmentMessage = assignment
        ? ` Assigned to ${assignment.technician.username}.`
        : ` No technician available.`;

      return reply(
`Fault report #${report.id} created.${assignmentMessage}`,
        true
      );
    }

    // =======================================
    // OPTION 2 - CHECK STATUS
    // =======================================
    if (option === '2') {

      if (!step2) {
        return reply(
          'Enter fault report ID:',
          false
        );
      }

      const result = await db.query(
        `
        SELECT
          fr.id,
          fr.issue_type,
          wp.name AS water_point_name

        FROM fault_reports fr

        JOIN water_points wp
          ON fr.water_point_id = wp.id

        WHERE fr.id = $1
        `,
        [step2]
      );

      const report = result.rows[0];

      if (!report) {
        return reply(
          'Report not found.',
          true
        );
      }

      return reply(
`Report #${report.id}

Water Point:
${report.water_point_name}

Issue:
${report.issue_type}`,
        true
      );
    }

    // =======================================
    // OPTION 3 - WATER POINT INFO
    // =======================================
    if (option === '3') {

      if (!step2) {
        return reply(
          'Enter water point ID:',
          false
        );
      }

      const waterPoint =
        await findWaterPointById(step2);

      if (!waterPoint) {
        return reply(
          'Water point not found.',
          true
        );
      }

      return reply(
`Water Point:
${waterPoint.name}

District:
${waterPoint.district}

Village:
${waterPoint.village}

Status:
${waterPoint.status}`,
        true
      );
    }

    // =======================================
    // OPTION 4 - TECHNICIAN UPDATE
    // =======================================
    if (option === '4') {

      if (!step2) {
        return reply(
          'Enter assignment ID:',
          false
        );
      }

      const assignment =
        await findAssignmentById(step2);

      if (!assignment) {
        return reply(
          'Assignment not found.',
          true
        );
      }

      const technician =
        await findTechnicianByPhoneNumber(
          phoneNumber
        );

      console.log("👷 TECHNICIAN:", technician);

      if (!technician) {
        return reply(
          'Technician not found.',
          true
        );
      }

      if (!step3) {
        return reply(
          'Enter transport cost:',
          false
        );
      }

      if (!step4) {
        return reply(
`Problem found:

${buildProblemTypesPrompt()}`,
          false
        );
      }

      const problem =
        getProblemTypeById(step4);

      if (!problem) {
        return reply(
          'Invalid problem type.',
          true
        );
      }

      if (!step5) {
        return reply(
`Select remedy:

${buildRemedyPrompt()}`,
          false
        );
      }

      const remedy =
        getRemedyById(step5);

      if (!remedy) {
        return reply(
          'Invalid remedy.',
          true
        );
      }

      if (!step6) {
        return reply(
          'Enter materials cost:',
          false
        );
      }

      if (!step7) {
        return reply(
          'Enter notes or 0:',
          false
        );
      }

      const transportCost =
        parseFloat(step3);

      const materialsCost =
        parseFloat(step6);

      const notes =
        step7 === '0'
          ? ''
          : [step7, ...rest].join('*');

      const repair =
        await createRepairLog({
          assignmentId: assignment.id,
          technicianId: technician.id,
          transportCost,
          materialsCost,
          problemFound: problem.value,
          remedy: remedy.value,
          additionalNotes: notes,
        });

      return reply(
`Repair logged successfully.

Assignment:
${assignment.id}

Cost:
${repair.cost}`,
        true
      );
    }

    // =======================================
    // OPTION 5 - HELP
    // =======================================
    if (option === '5') {

      return reply(
`MajiFix Help

1 - Report fault
2 - Check report
3 - Water point info
4 - Technician update
6 - Register water point`,
        true
      );
    }

    // =======================================
    // OPTION 6 - REGISTER WATER POINT
    // =======================================
    if (option === '6') {

      if (!step2) {
        return reply(
          'Enter district:',
          false
        );
      }

      if (!step3) {
        return reply(
          'Enter parish:',
          false
        );
      }

      if (!step4) {
        return reply(
          'Enter village:',
          false
        );
      }

      if (!step5) {
        return reply(
          'Enter water point code:',
          false
        );
      }

      const newPoint =
        await createWaterPoint({
          name: `WP ${step5}`,
          district: step2,
          parish: step3,
          village: step4,
          waterPointNumber: step5,
          status: 'working',
          createdViaUssd: true,
        });

      return reply(
`Water point created.

ID:
${newPoint.id}

Name:
${newPoint.name}`,
        true
      );
    }

    // =======================================
    // INVALID OPTION
    // =======================================
    return reply(
      'Invalid option.',
      true
    );

  } catch (error) {

    console.error(
      "❌ USSD ERROR:",
      error
    );

    res.set('Content-Type', 'text/plain');

    return res.send(
      'END System error occurred'
    );
  }
});

module.exports = router;