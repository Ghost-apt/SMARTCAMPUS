const cron = require('node-cron');
const { Assignment, Notification, StudentProfile, User } = require('../models/CampusModels');

// Automated assignment deadline scanner (idempotent)
const triggerDeadlineReminders = async () => {
  try {
    const now = new Date();
    const horizon = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from now

    // Find assignments due in the next 48 hours that are still Open
    const upcomingAssignments = await Assignment.find({
      dueDate: { $gte: now, $lte: horizon },
      status: { $ne: 'Closed' }
    });

    if (upcomingAssignments.length === 0) return { remindersSent: 0 };

    let remindersSent = 0;

    for (const assignment of upcomingAssignments) {
      // Find students enrolled in the assignment's course & semester
      const profiles = await StudentProfile.find({
        course: assignment.courseCode || 'BCA',
        semester: assignment.semester || 5
      });

      for (const profile of profiles) {
        const studentUserId = profile.user.toString();

        // Check if student already submitted this assignment
        const alreadySubmitted = (assignment.submissions || []).some(
          (s) => s.student && s.student.toString() === studentUserId
        );

        if (alreadySubmitted) continue;

        // Check if a reminder for this assignment was already sent to this student
        const existingNotification = await Notification.findOne({
          recipient: profile.user,
          type: 'ASSIGNMENT_DEADLINE',
          'metadata.assignmentId': assignment._id
        });

        if (existingNotification) continue;

        const formattedDate = new Date(assignment.dueDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        await Notification.create({
          recipient: profile.user,
          type: 'ASSIGNMENT_DEADLINE',
          title: `Assignment Due Soon: ${assignment.title}`,
          message: `The deadline for "${assignment.title}" is ${formattedDate}. Please submit your deliverables before the portal closes.`,
          link: '/student/assignments',
          metadata: {
            assignmentId: assignment._id,
            dueDate: assignment.dueDate
          }
        });

        remindersSent += 1;
      }
    }

    return { remindersSent };
  } catch (err) {
    console.error('❌ Error in triggerDeadlineReminders scheduler:', err.message);
    return { error: err.message, remindersSent: 0 };
  }
};

// Initialize recurring background automation
const initScheduler = () => {
  // Run every 2 hours in standard production mode
  cron.schedule('0 */2 * * *', async () => {
    console.log('⏰ Running automated academic deadline scanner...');
    const result = await triggerDeadlineReminders();
    if (result.remindersSent > 0) {
      console.log(`📬 Dispatched ${result.remindersSent} assignment deadline reminder(s).`);
    }
  });

  console.log('🗓️ SmartCampus Automation Scheduler initialized.');
};

module.exports = {
  triggerDeadlineReminders,
  initScheduler
};
