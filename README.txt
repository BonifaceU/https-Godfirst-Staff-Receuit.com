# GFCC Teachers Recruitment Portal

## What this version does
- Centralizes every application in ONE Google Sheet named `Applications`.
- Works from the published Google Apps Script Web App URL on phones and computers.
- Uploads documents to a Google Drive folder.
- Gives each applicant a unique Application ID.
- Lets applicants check their status using Application ID + email.
- Gives an admin panel for viewing applications and updating status.
- Includes HTML, CSS, JavaScript and a Programming/Digital Skills field prefilled with HTML, CSS, JavaScript, Python.

## Installation
1. Create a new Google Sheet.
2. Open Extensions -> Apps Script.
3. Create an HTML file named `index` and paste the contents of `index.html`.
4. Open the Apps Script code file (usually `Code.gs`) and paste `Code.gs`.
5. In `Code.gs`, change:
   `ADMIN_PASSWORD: 'CHANGE_THIS_PASSWORD'`
   to a strong private password.
6. Save.
7. Run the `setup` function once from Apps Script and authorize the requested Google permissions.
8. Deploy -> New deployment -> Web app.
9. Execute as: Me.
10. Who has access: Anyone (or the access option appropriate for your school).
11. Deploy and copy the Web App URL.
12. Open that URL in any supported browser/device.

## Important
Do NOT use localStorage for the central database. This version sends submissions to Google Apps Script, which writes them to the same Google Sheet and stores uploaded documents in Google Drive.

For public recruitment, use a dedicated school Google account and protect the admin password. Keep the spreadsheet and Drive folder restricted to authorized school administrators.

Google Apps Script quotas and file-size limits apply. The portal limits passport photos to 3 MB and other uploaded documents to 5 MB each.
