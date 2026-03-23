// Google Apps Script Backend for Registration Form

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'Registrations';
const ADMIN_EMAIL = 'schoolofgrantsuccess@gmail.com'; // Change to your email

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();
    
    // Prepare row data
    const rowData = [
      data.timestamp || new Date().toISOString(),
      data.fullName || '',
      data.email || '',
      data.whatsapp || '',
      data.city || '',
      data.state || '',
      data.country || '',
      data.source?.utm_source || 'Direct',
      data.source?.utm_medium || '',
      data.source?.utm_campaign || '',
      data.source?.utm_content || '',
      data.source?.utm_term || '',
      'Pending' // Payment Status
    ];
    
    // Append row to sheet
    sheet.appendRow(rowData);
    
    // Send confirmation email to user
    sendConfirmationEmail(data.email, data.fullName);
    
    // Send notification to admin
    sendAdminNotification(data);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Registration received'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput('Registration API is running');
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    setupSheetHeaders(sheet);
  }
  
  return sheet;
}

function setupSheetHeaders(sheet) {
  const headers = [
    'Timestamp',
    'Full Name',
    'Email',
    'WhatsApp',
    'City',
    'State/Province',
    'Country',
    'UTM Source',
    'UTM Medium',
    'UTM Campaign',
    'UTM Content',
    'UTM Term',
    'Payment Status'
  ];
  
  // Set headers
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Style headers
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.getRange(1, 1, 1, headers.length).setBackground('#19A44D');
  sheet.getRange(1, 1, 1, headers.length).setFontColor('#FFFFFF');
  sheet.setFrozenRows(1);
  
  // Auto-resize columns
  for (let i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }
}

function sendConfirmationEmail(email, name) {
  try {
    const subject = 'Welcome to School of Grant Success! 🎉';
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #19A44D, #2D9961); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0;">Thank You for Registering!</h1>
        </div>
        
        <div style="padding: 40px 30px; background-color: #f9f9f9;">
          <h2 style="color: #19A44D;">Dear ${name},</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Thank you for registering for our Grant Writing Course!
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            You're now one step closer to winning grants for your business. 
            <strong>Please complete your payment to secure your spot.</strong>
          </p>
          
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-weight: 600;">
              ⚡ Early bird pricing ends soon! Secure your spot now.
            </p>
          </div>
          
          <h3 style="color: #19A44D;">What's Next?</h3>
          <ol style="font-size: 16px; line-height: 1.8; color: #333;">
            <li>Complete your payment via the link sent to you</li>
            <li>Join our WhatsApp community</li>
            <li>Receive your course access details</li>
            <li>Start your grant-winning journey!</li>
          </ol>
          
          <h3 style="color: #19A44D;">What You'll Get:</h3>
          <ul style="font-size: 16px; line-height: 1.8; color: #333;">
            <li>6-Week Live Training</li>
            <li>50+ Grant Writing Templates</li>
            <li>1-on-1 Mentorship</li>
            <li>Lifetime Community Access</li>
            <li>Grant Database Access</li>
            <li>Certificate of Completion</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://wa.me/2347045108885?text=Hi!%20I%20just%20registered%20for%20the%20course" 
               style="display: inline-block; background-color: #25D366; color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: bold;">
              Chat with Us on WhatsApp
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            For any questions, contact us:<br>
            📱 WhatsApp: +2347045108885<br>
            📧 Email: schoolofgrantsuccess@gmail.com
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin-top: 20px;">
            Best regards,<br>
            <strong>School of Grant Success Team</strong>
          </p>
        </div>
        
        <div style="background-color: #2C3E50; padding: 20px; text-align: center; color: white; font-size: 14px;">
          <p style="margin: 0;">© 2024 School of Grant Success. All rights reserved.</p>
        </div>
      </div>
    `;
    
    MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: htmlBody
    });
    
  } catch (error) {
    Logger.log('Email error: ' + error.toString());
  }
}

function sendAdminNotification(data) {
  try {
    const subject = '🎉 New Registration - Grant Writing Course';
    const body = `New registration received!

Name: ${data.fullName}
Email: ${data.email}
WhatsApp: ${data.whatsapp}
Location: ${data.city}, ${data.state}, ${data.country}
Source: ${data.source?.utm_source || 'Direct'}
Campaign: ${data.source?.utm_campaign || 'N/A'}

Timestamp: ${data.timestamp}

Check the Google Sheet for full details.`;
    
    MailApp.sendEmail(ADMIN_EMAIL, subject, body);
  } catch (error) {
    Logger.log('Admin notification error: ' + error.toString());
  }
}
```

---

## 📋 COMPLETE SETUP INSTRUCTIONS

### STEP 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create new spreadsheet
3. Name it: **"SGS Course Registrations"**
4. Copy the **Spreadsheet ID** from URL
```
https://docs.google.com/spreadsheets/d/COPY_THIS_PART/edit