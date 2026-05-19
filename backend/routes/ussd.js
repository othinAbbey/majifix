
// const express = require('express');
// const {
//   findWaterPointById,
//   createWaterPoint,
//   createFaultReport,
//   assignTechnicianToFault,
//   notifyAdminsAndDistrictOfficers,
//   updateWaterPointStatus,
//   findTechnicianByPhoneNumber,
//   createRepairLog,
// } = require('../utils/faultHelpers');

// const router = express.Router();

// const ISSUE_TYPES = [
//   { id: '1', label: 'Broken pump', value: 'broken_pump' },
//   { id: '2', label: 'No water', value: 'no_water' },
//   { id: '3', label: 'Low pressure', value: 'low_pressure' },
//   { id: '4', label: 'Contamination', value: 'contamination' },
//   { id: '5', label: 'Other', value: 'other' },
// ];

// /**
//  * USSD RESPONSE FORMAT (IMPORTANT)
//  * Africa's Talking expects plain text:
//  * CON message
//  * END message
//  */
// const buildResponse = (message, end = false) => {
//   return `${end ? 'END' : 'CON'} ${message}`;
// };

// const getIssueTypeById = (id) =>
//   ISSUE_TYPES.find((item) => item.id === id);

// const buildIssueTypePrompt = () => {
//   const options = ISSUE_TYPES
//     .map((item) => `${item.id}. ${item.label}`)
//     .join('\n');
//   return `Select issue type:\n${options}`;
// };

// const PROBLEM_TYPES = [
//   { id: '1', label: 'Broken seals', value: 'broken_seals' },
//   { id: '2', label: 'Broken rods', value: 'broken_rods' },
//   { id: '3', label: 'Missing parts', value: 'missing_parts' },
//   { id: '4', label: 'Leaking joints', value: 'leaking_joints' },
//   { id: '5', label: 'Motor failure', value: 'motor_failure' },
//   { id: '6', label: 'Other', value: 'other' },
// ];

// const REMEDY_OPTIONS = [
//   { id: '1', label: 'New part bought', value: 'new_part_bought' },
//   { id: '2', label: 'Old part repaired', value: 'old_part_repaired' },
//   { id: '3', label: 'No parts needed', value: 'no_parts_needed' },
//   { id: '4', label: 'Further assessment required', value: 'further_assessment' },
// ];

// const getProblemTypeById = (id) => PROBLEM_TYPES.find((item) => item.id === id);
// const buildProblemTypesPrompt = () => {
//   const options = PROBLEM_TYPES
//     .map((item) => `${item.id}. ${item.label}`)
//     .join('\n');
//   return `Select problem found:\n${options}`;
// };

// const getRemedyById = (id) => REMEDY_OPTIONS.find((item) => item.id === id);
// const buildRemedyPrompt = () => {
//   const options = REMEDY_OPTIONS
//     .map((item) => `${item.id}. ${item.label}`)
//     .join('\n');
//   return `Select remedy:\n${options}`;
// };

// const findAssignmentById = async (id) => {
//   const result = await require('../db').query(
//     `SELECT a.*, fr.water_point_id, fr.issue_type, fr.description, wp.name AS water_point_name, wp.district AS water_point_district, u.username AS technician_name
//      FROM assignments a
//      JOIN fault_reports fr ON a.fault_report_id = fr.id
//      JOIN water_points wp ON fr.water_point_id = wp.id
//      JOIN users u ON a.technician_id = u.id
//      WHERE a.id = $1`,
//     [id]
//   );
//   return result.rows[0];
// };

// router.post('/', async (req, res) => {
//   const { sessionId, phoneNumber, text = '' } = req.body;

//   console.log('USSD REQUEST:', req.body); // 🔥 DEBUG IMPORTANT

//   const trimmedText = String(text || '').trim();
//   const userInput =
//     trimmedText === '' ? [] : trimmedText.split('*');

//   try {
//     // 🔥 FIRST SCREEN (MAIN MENU)
//     if (userInput.length === 0) {
//       return res.send(
//         buildResponse(
//           `Welcome to MajiFix USSD
// 1. Report a fault
// 2. Check report status
// 3. Get water point info
// 4. Technician update
// 5. Help
// 6. Register water point`
//         )
//       );
//     }

//     const [option, step2, step3, step4, step5, ...rest] = userInput;
//     const descriptionText = (step4 || '').trim();
//     const fundsChoice = step5;
//     const fundsAmountText = rest.join('*').trim();

//     switch (option) {
//       /**
//        * =========================
//        * 1. REPORT FAULT FLOW
//        * =========================
//        */
//       case '1': {
//         if (!step2) {
//           return res.send(
//             buildResponse('Enter water point ID to report a fault:')
//           );
//         }

//         const waterPoint = await findWaterPointById(step2);

//         if (!waterPoint) {
//           return res.send(
//             buildResponse(
//               'Water point not found. Please try again.',
//               true
//             )
//           );
//         }

//         if (!step3) {
//           return res.send(
//             buildResponse(
//               `Reporting for ${waterPoint.name}\n${buildIssueTypePrompt()}`
//             )
//           );
//         }

//         const issue = getIssueTypeById(step3);

//         if (!issue) {
//           return res.send(
//             buildResponse(
//               'Invalid issue type. Restart and try again.',
//               true
//             )
//           );
//         }

//         if (!step4) {
//           return res.send(buildResponse('Describe the fault in a few words:'));
//         }

//         if (!fundsChoice) {
//           return res.send(buildResponse('Request technician funds?\n1. Yes\n2. No'));
//         }

//         if (fundsChoice === '1') {
//           if (!fundsAmountText) {
//             return res.send(buildResponse('Enter amount requested for technician funds:'));
//           }

//           const requestedAmount = parseFloat(fundsAmountText);
//           if (Number.isNaN(requestedAmount) || requestedAmount <= 0) {
//             return res.send(buildResponse('Invalid amount. Enter a numeric amount:'));
//           }

//           const report = await createFaultReport(waterPoint.id, issue.value, descriptionText, null, true, requestedAmount, 'Village requested technician funds');
//           await updateWaterPointStatus(waterPoint.id, 'broken');
//           await notifyAdminsAndDistrictOfficers(waterPoint.district, `New fault report #${report.id} created for ${waterPoint.name}.`, 'fault_report');
//           const assignment = await assignTechnicianToFault(report.id, waterPoint);
//           const assignmentMessage = assignment ? ` Assigned to ${assignment.technician.username}.` : ' No technician is available in the area yet.';
//           return res.send(buildResponse(`Fault report #${report.id} created for ${waterPoint.name}. Requested funds: ${requestedAmount}.${assignmentMessage}`, true));
//         }

//         if (fundsChoice === '2') {
//           const report = await createFaultReport(waterPoint.id, issue.value, descriptionText, null, false, null, null);
//           await updateWaterPointStatus(waterPoint.id, 'broken');
//           await notifyAdminsAndDistrictOfficers(waterPoint.district, `New fault report #${report.id} created for ${waterPoint.name}.`, 'fault_report');
//           const assignment = await assignTechnicianToFault(report.id, waterPoint);
//           const assignmentMessage = assignment ? ` Assigned to ${assignment.technician.username}.` : ' No technician is available in the area yet.';
//           return res.send(buildResponse(`Fault report #${report.id} created for ${waterPoint.name}.${assignmentMessage}`, true));
//         }

//         return res.send(
//           buildResponse('Invalid choice. Enter 1 for Yes or 2 for No.', true)
//         );
//       }

//       /**
//        * =========================
//        * 2. CHECK REPORT STATUS
//        * =========================
//        */
//       case '2': {
//         if (!step2) {
//           return res.send(
//             buildResponse('Enter report ID:')
//           );
//         }

//         const result = await require('../db').query(
//           `SELECT fr.id, fr.issue_type, fr.description, fr.timestamp, fr.requested_funds, fr.requested_funds_amount, wp.name AS water_point_name,
//                   a.id AS assignment_id, a.status AS assignment_status, u.username AS technician_name
//            FROM fault_reports fr
//            JOIN water_points wp ON fr.water_point_id = wp.id
//            LEFT JOIN assignments a ON a.fault_report_id = fr.id
//            LEFT JOIN users u ON a.technician_id = u.id
//            WHERE fr.id = $1`,
//           [step2]
//         );

//         const report = result.rows[0];

//         if (!report) {
//           return res.send(buildResponse('Report not found', true));
//         }

//         const fundsLine = report.requested_funds
//           ? `Requested funds: ${report.requested_funds_amount}`
//           : 'Requested funds: none';
//         const assignmentLine = report.assignment_id
//           ? `Assignment ${report.assignment_id}: ${report.assignment_status} - ${report.technician_name}`
//           : 'Assignment pending';

//         return res.send(
//           buildResponse(
//             `Report #${report.id} for ${report.water_point_name}:\nIssue: ${report.issue_type}\n${fundsLine}\n${assignmentLine}\nDate: ${new Date(report.timestamp).toLocaleString()}`,
//             true
//           )
//         );
//       }

//       /**
//        * =========================
//        * 3. WATER POINT INFO
//        * =========================
//        */
//       case '3': {
//         if (!step2) {
//           return res.send(
//             buildResponse('Enter water point ID:')
//           );
//         }

//         const waterPoint = await findWaterPointById(step2);

//         if (!waterPoint) {
//           return res.send(
//             buildResponse('Water point not found', true)
//           );
//         }

//         return res.send(
//           buildResponse(
//             `Name: ${waterPoint.name}
// Location: ${waterPoint.district}, ${waterPoint.village}
// Status: ${waterPoint.status}`,
//             true
//           )
//         );
//       }

//       /**
//        * =========================
//        * 4. TECHNICIAN UPDATE
//        * =========================
//        */
//       case '4': {
//         if (!step2) {
//           return res.send(buildResponse('Enter assignment ID to log progress:'));
//         }

//         const assignment = await findAssignmentById(step2);
//         if (!assignment) {
//           return res.send(buildResponse('Assignment not found. Please check the ID and try again.', true));
//         }

//         const technician = await findTechnicianByPhoneNumber(phoneNumber);
//         if (!technician || technician.id !== assignment.technician_id) {
//           return res.send(buildResponse('Your number is not attached to this assignment or you are not a registered technician.', true));
//         }

//         if (!step3) {
//           return res.send(buildResponse('Enter transport cost in KES:'));
//         }

//         if (!step4) {
//           return res.send(buildResponse(`${buildProblemTypesPrompt()}`));
//         }

//         const problem = getProblemTypeById(step4);
//         if (!problem) {
//           return res.send(buildResponse('Invalid problem category. Please restart the technician flow.', true));
//         }

//         if (!step5) {
//           return res.send(buildResponse(`${buildRemedyPrompt()}`));
//         }

//         const remedy = getRemedyById(step5);
//         if (!remedy) {
//           return res.send(buildResponse('Invalid remedy selection. Please restart the technician flow.', true));
//         }

//         if (!step6) {
//           return res.send(buildResponse('Enter material costs in KES (enter 0 if none):'));
//         }

//         if (!step7) {
//           return res.send(buildResponse('Add additional notes or press 0 for none:'));
//         }

//         const transportCost = parseFloat(step3);
//         const materialsCost = parseFloat(step6);
//         const notes = step7 === '0' ? '' : [step7, ...rest].join('*').trim();

//         if (Number.isNaN(transportCost) || transportCost < 0) {
//           return res.send(buildResponse('Invalid transport cost. Please restart and enter a numeric value.', true));
//         }
//         if (Number.isNaN(materialsCost) || materialsCost < 0) {
//           return res.send(buildResponse('Invalid materials cost. Please restart and enter a numeric value.', true));
//         }

//         const repair = await createRepairLog({
//           assignmentId: assignment.id,
//           technicianId: technician.id,
//           transportCost,
//           materialsCost,
//           problemFound: problem.value,
//           remedy: remedy.value,
//           additionalNotes: notes,
//         });

//         await notifyAdminsAndDistrictOfficers(assignment.water_point_district, `Technician ${technician.username} logged progress for assignment #${assignment.id}.`, 'repair_progress');

//         return res.send(buildResponse(`Repair logged. Assignment ${assignment.id} updated to ${repair.repair_status}. Total cost: ${repair.cost} KES.`, true));
//       }

//       case '5': {
//         return res.send(buildResponse(`MajiFix Help:\n1 - Report fault\n2 - Check report status\n3 - Water point info\n4 - Technician update\n6 - Register water point\n0 - Exit`, true));
//       }

//       case '6': {
//         if (!step2) {
//           return res.send(buildResponse('Enter district:'));
//         }

//         if (!step3) {
//           return res.send(buildResponse('Enter parish:'));
//         }

//         if (!step4) {
//           return res.send(buildResponse('Enter village:'));
//         }

//         if (!step5) {
//           return res.send(buildResponse('Enter water point number or code:'));
//         }

//         const district = step2.trim();
//         const parish = step3.trim();
//         const village = step4.trim();
//         const waterPointNumber = step5.trim();

//         if (!district || !parish || !village || !waterPointNumber) {
//           return res.send(buildResponse('All fields are required. Restart and provide district, parish, village, and water point number.', true));
//         }

//         const newPoint = await createWaterPoint({
//           name: `WP ${waterPointNumber}`,
//           district,
//           parish,
//           village,
//           waterPointNumber,
//           status: 'working',
//           createdViaUssd: true,
//         });

//         await notifyAdminsAndDistrictOfficers(district, `New water point ${newPoint.name} created in ${village}, ${parish}, ${district}.`, 'water_point_created');

//         return res.send(buildResponse(`Water point ${newPoint.name} created with ID ${newPoint.id}. Use option 1 to report a fault if needed.`, true));
//       }

//       default:
//         return res.send(buildResponse('Invalid option', true));
//     }
//   } catch (error) {
//     console.error('USSD ERROR:', error);

//     return res.send(
//       buildResponse(
//         'System error. Try again later.',
//         true
//       )
//     );
//   }
// });

// module.exports = router;


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