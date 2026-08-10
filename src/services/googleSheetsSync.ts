import { WorkoutLog, Routine, Exercise, GoogleSheetsConfig } from '../types';

export const GOOGLE_APPS_SCRIPT_TEMPLATE = `
/**
 * PULSE FITNESS - GOOGLE SHEETS DATABASE & GMAIL AUTOMATION SCRIPT
 * 
 * Instructions:
 * 1. Open your Google Sheet (create tabs named: "Workouts", "Routines", "Exercises", "AI_Logs").
 * 2. Go to Extensions > Apps Script.
 * 3. Replace all code in Code.gs with this script and save.
 * 4. Click 'Deploy' > 'New deployment' > Select type 'Web app'.
 * 5. Execute as: "Me", Who has access: "Anyone".
 * 6. Copy the Webhook URL into Pulse Fit settings!
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "sync_workout") {
      var sheet = ss.getSheetByName("Workouts") || ss.insertSheet("Workouts");
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["ID", "Date", "Routine Name", "Duration (mins)", "Total Volume (kg)", "Sets Completed", "Notes", "AI Review"]);
      }
      var log = data.payload;
      sheet.appendRow([
        log.id,
        log.date,
        log.routineName,
        log.durationMinutes,
        log.totalVolumeKg,
        log.totalSetsCompleted,
        log.notes || "",
        log.aiReview || ""
      ]);

      // If Gmail notification requested
      if (data.sendGmailNotification && data.userEmail) {
        var emailBody = "⚡ PULSE FITNESS DAILY WORKOUT SUMMARY ⚡\\n\\n" +
          "Routine: " + log.routineName + "\\n" +
          "Date: " + log.date + "\\n" +
          "Duration: " + log.durationMinutes + " mins\\n" +
          "Total Volume: " + log.totalVolumeKg + " kg\\n" +
          "Sets Completed: " + log.totalSetsCompleted + "\\n\\n" +
          "AI Review:\\n" + (log.aiReview || "Great job completing your workout today!") + "\\n\\n" +
          "Keep pushing boundaries! ⚡";
          
        GmailApp.sendEmail(data.userEmail, "🔥 Workout Logged: " + log.routineName, emailBody);
      }

      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Workout appended to Google Sheet" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Unknown action" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "online", app: "Pulse Fit Google Sheets DB Engine" }))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

export const GoogleSheetsSyncService = {
  async syncWorkoutLogToSheets(log: WorkoutLog, config: GoogleSheetsConfig, userEmail?: string): Promise<{ success: boolean; message: string }> {
    if (!config.webhookUrl) {
      return {
        success: false,
        message: 'Google Sheets Webhook URL is not configured. Using local database storage.'
      };
    }

    try {
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sync_workout',
          payload: log,
          sendGmailNotification: Boolean(userEmail),
          userEmail: userEmail || '',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: result.status === 'success',
        message: result.message || 'Synced to Google Sheets successfully!',
      };
    } catch (err: any) {
      console.warn('Google Sheets sync warning:', err);
      return {
        success: false,
        message: `Sync failed: ${err.message || 'Network issue'}. Workout is safely stored in local database.`,
      };
    }
  },

  exportLogsToCSV(logs: WorkoutLog[]): string {
    const headers = ['ID', 'Date', 'Routine Name', 'Duration (Mins)', 'Total Volume (kg)', 'Total Sets', 'Notes', 'AI Review'];
    const rows = logs.map(l => [
      `"${l.id}"`,
      `"${l.date}"`,
      `"${l.routineName.replace(/"/g, '""')}"`,
      l.durationMinutes,
      l.totalVolumeKg,
      l.totalSetsCompleted,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
      `"${(l.aiReview || '').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  exportRoutinesToJSON(routines: Routine[], exercises: Exercise[]): string {
    return JSON.stringify({ routines, exercises, exportedAt: new Date().toISOString() }, null, 2);
  }
};
