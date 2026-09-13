const CONFIG = {
  SHEET_NAME: 'Applications',
  DRIVE_FOLDER_NAME: 'GFCC Teachers Recruitment Documents',
  ADMIN_PASSWORD: 'CHANGE_THIS_PASSWORD'
};

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('GFCC Teachers Recruitment Portal')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sh) sh = ss.insertSheet(CONFIG.SHEET_NAME);
  const headers = [
    'Timestamp','Application ID','First Name','Middle Name','Surname','Full Name',
    'Gender','Date of Birth','Phone','Email','Position Applied For','Teaching Subject',
    'Highest Qualification','Field of Study','Institution','Graduation Year',
    'Teaching Experience (Years)','Programming/Digital Skills','Address',
    'Professional Experience','Passport URL','CV URL','Academic Certificate URL',
    'Professional Certificate URL','ID URL','Other Document URL','Status','Admin Remark'
  ];
  if (sh.getLastRow() === 0) {
    sh.getRange(1,1,1,headers.length).setValues([headers]);
    sh.setFrozenRows(1);
  }
  getOrCreateFolder_();
  return 'Setup complete.';
}

function submitApplication(data) {
  setup();
  if (!data || !data.firstName || !data.surname || !data.email || !data.phone) {
    return {ok:false,message:'Please complete all required fields.'};
  }

  const folder = getOrCreateFolder_();
  const applicationId = makeApplicationId_();
  const fileUrls = {};

  const fileMap = {
    passport:'Passport',
    cv:'CV',
    certificate:'Academic Certificate',
    professionalCertificate:'Professional Certificate',
    idDocument:'ID Document',
    otherDocument:'Other Document'
  };

  Object.keys(fileMap).forEach(key => {
    const f = data.files && data.files[key];
    if (f && f.data) {
      const bytes = Utilities.base64Decode(String(f.data).split(',')[1]);
      const blob = Utilities.newBlob(bytes, f.type || MimeType.PLAIN_TEXT, applicationId+'_'+f.name);
      const file = folder.createFile(blob);
      fileUrls[key] = file.getUrl();
    } else {
      fileUrls[key] = '';
    }
  });

  const fullName = [data.firstName,data.middleName,data.surname].filter(Boolean).join(' ');
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);

  sh.appendRow([
    new Date(), applicationId, data.firstName, data.middleName, data.surname, fullName,
    data.gender, data.dob, data.phone, data.email, data.position, data.subject,
    data.qualification, data.field, data.institution, data.graduationYear,
    data.experience, data.skills, data.address, data.professionalExperience,
    fileUrls.passport, fileUrls.cv, fileUrls.certificate,
    fileUrls.professionalCertificate, fileUrls.idDocument, fileUrls.otherDocument,
    'Submitted',''
  ]);

  return {ok:true,applicationId:applicationId};
}

function checkApplication(applicationId,email) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  if (!sh) return {found:false};
  const values = sh.getDataRange().getDisplayValues();
  if (values.length < 2) return {found:false};
  const h = values[0];
  const idCol = h.indexOf('Application ID');
  const emailCol = h.indexOf('Email');
  const nameCol = h.indexOf('Full Name');
  const posCol = h.indexOf('Position Applied For');
  const subCol = h.indexOf('Teaching Subject');
  const statusCol = h.indexOf('Status');
  const timeCol = h.indexOf('Timestamp');

  for (let i=1;i<values.length;i++) {
    if (String(values[i][idCol]).toLowerCase() === String(applicationId).toLowerCase() &&
        String(values[i][emailCol]).toLowerCase() === String(email).toLowerCase()) {
      return {
        found:true,
        applicationId:values[i][idCol],
        name:values[i][nameCol],
        position:values[i][posCol],
        subject:values[i][subCol],
        status:values[i][statusCol],
        date:values[i][timeCol]
      };
    }
  }
  return {found:false};
}

function verifyAdmin(password) {
  return {ok:String(password) === String(CONFIG.ADMIN_PASSWORD)};
}

function getApplications(password) {
  if (!verifyAdmin(password).ok) throw new Error('Unauthorized.');
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  const values = sh.getDataRange().getDisplayValues();
  if (values.length < 2) return [];
  const h = values[0];
  const idx = n => h.indexOf(n);
  return values.slice(1).reverse().map(r => ({
    id:r[idx('Application ID')],
    date:r[idx('Timestamp')],
    name:r[idx('Full Name')],
    phone:r[idx('Phone')],
    email:r[idx('Email')],
    position:r[idx('Position Applied For')],
    subject:r[idx('Teaching Subject')],
    qualification:r[idx('Highest Qualification')],
    status:r[idx('Status')]
  }));
}

function updateApplicationStatus(password,id,status,remark) {
  if (!verifyAdmin(password).ok) throw new Error('Unauthorized.');
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  const values = sh.getDataRange().getValues();
  const h = values[0];
  const idCol = h.indexOf('Application ID') + 1;
  const statusCol = h.indexOf('Status') + 1;
  const remarkCol = h.indexOf('Admin Remark') + 1;
  for (let r=2;r<=values.length;r++) {
    if (String(sh.getRange(r,idCol).getDisplayValue()) === String(id)) {
      sh.getRange(r,statusCol).setValue(status);
      sh.getRange(r,remarkCol).setValue(remark);
      return {ok:true,message:'Application status updated.'};
    }
  }
  return {ok:false,message:'Application ID not found.'};
}

function makeApplicationId_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  const last = sh.getLastRow();
  const next = Math.max(1,last);
  return 'GFCC-' + new Date().getFullYear() + '-' + String(next).padStart(4,'0');
}

function getOrCreateFolder_() {
  const it = DriveApp.getFoldersByName(CONFIG.DRIVE_FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(CONFIG.DRIVE_FOLDER_NAME);
}
