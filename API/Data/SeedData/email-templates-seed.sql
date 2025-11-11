-- Email Templates Seed Data

-- First, clean existing data if needed
DELETE FROM EmailTemplates;

-- Reset Identity if applicable
DBCC CHECKIDENT ('EmailTemplates', RESEED, 0);

-- Insert default email templates
INSERT INTO EmailTemplates (Name, Subject, BodyTemplate, Description, IsActive, CreatedAt, CreatedBy, TemplateType, DefaultParametersJson)
VALUES 
-- Patient Registration Template
('PatientRegistration', 
 'Welcome to Medisoft Medical Center, {{PatientName}}!', 
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
    <div style="text-align: center; margin-bottom: 20px;">
        <img src="{{LogoUrl}}" alt="Medisoft Logo" style="max-width: 150px;">
    </div>
    <div style="margin-bottom: 20px;">
        <h2 style="color: #3f51b5;">Welcome to Medisoft Medical Center!</h2>
        <p>Dear {{PatientName}},</p>
        <p>Thank you for registering with Medisoft Medical Center. Your account has been successfully created.</p>
        <p><strong>Medical Record Number:</strong> {{MRN}}</p>
        <p><strong>Registration Date:</strong> {{RegistrationDate}}</p>
    </div>
    <div style="margin-bottom: 20px;">
        <h3 style="color: #3f51b5;">Your Account Information</h3>
        <p>You can now access our patient portal using the following credentials:</p>
        <p><strong>Username:</strong> {{Username}}</p>
        <p><strong>Password:</strong> The password you created during registration</p>
        <p>Please keep your login information secure.</p>
    </div>
    <div style="margin-bottom: 20px;">
        <h3 style="color: #3f51b5;">Next Steps</h3>
        <ul>
            <li>Complete your medical profile</li>
            <li>Schedule your first appointment</li>
            <li>Explore our services</li>
        </ul>
    </div>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777;">
        <p>If you have any questions, please contact us at {{ContactEmail}} or call {{ContactPhone}}.</p>
        <p>© {{CurrentYear}} Medisoft Medical Center. All rights reserved.</p>
    </div>
</div>', 
 'Template for new patient registration confirmation email', 
 1, 
 GETDATE(), 
 'System', 
 0, -- PatientRegistration
 '{"PatientName":"John Doe","MRN":"MRN123456","RegistrationDate":"2023-05-15","Username":"john.doe","LogoUrl":"https://example.com/logo.png","ContactEmail":"support@medisoft.com","ContactPhone":"+1-123-456-7890","CurrentYear":"2023"}'
),

-- Appointment Confirmation Template
('AppointmentConfirmation', 
 'Your appointment with {{DoctorName}} is confirmed', 
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
    <div style="text-align: center; margin-bottom: 20px;">
        <img src="{{LogoUrl}}" alt="Medisoft Logo" style="max-width: 150px;">
    </div>
    <div style="margin-bottom: 20px;">
        <h2 style="color: #3f51b5;">Appointment Confirmation</h2>
        <p>Dear {{PatientName}},</p>
        <p>Your appointment has been successfully scheduled. Here are the details:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
            <p><strong>Doctor:</strong> {{DoctorName}}</p>
            <p><strong>Specialization:</strong> {{Specialization}}</p>
            <p><strong>Date:</strong> {{AppointmentDate}}</p>
            <p><strong>Time:</strong> {{AppointmentTime}}</p>
            <p><strong>Location:</strong> {{ClinicLocation}}</p>
            <p><strong>Appointment ID:</strong> {{AppointmentId}}</p>
        </div>
    </div>
    <div style="margin-bottom: 20px;">
        <h3 style="color: #3f51b5;">Important Reminders</h3>
        <ul>
            <li>Please arrive 15 minutes before your scheduled appointment</li>
            <li>Bring your insurance card and ID</li>
            <li>Bring a list of current medications</li>
            <li>If you need to cancel or reschedule, please contact us at least 24 hours in advance</li>
        </ul>
    </div>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777;">
        <p>If you have any questions, please contact us at {{ContactEmail}} or call {{ContactPhone}}.</p>
        <p>© {{CurrentYear}} Medisoft Medical Center. All rights reserved.</p>
    </div>
</div>', 
 'Template for appointment confirmation emails', 
 1, 
 GETDATE(), 
 'System', 
 1, -- AppointmentConfirmation
 '{"PatientName":"John Doe","DoctorName":"Dr. Sarah Johnson","Specialization":"Cardiology","AppointmentDate":"June 15, 2023","AppointmentTime":"10:00 AM","ClinicLocation":"Main Building, Floor 3, Room 302","AppointmentId":"APT123456","LogoUrl":"https://example.com/logo.png","ContactEmail":"appointments@medisoft.com","ContactPhone":"+1-123-456-7890","CurrentYear":"2023"}'
),

-- Test Results Template
('TestResults', 
 'Your test results are available', 
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
    <div style="text-align: center; margin-bottom: 20px;">
        <img src="{{LogoUrl}}" alt="Medisoft Logo" style="max-width: 150px;">
    </div>
    <div style="margin-bottom: 20px;">
        <h2 style="color: #3f51b5;">Test Results Available</h2>
        <p>Dear {{PatientName}},</p>
        <p>Your recent test results for <strong>{{TestName}}</strong> performed on {{TestDate}} are now available.</p>
    </div>
    <div style="margin-bottom: 20px; text-align: center;">
        <a href="{{ResultsLink}}" style="background-color: #3f51b5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Your Results</a>
    </div>
    <div style="margin-bottom: 20px;">
        <p>Your doctor, {{DoctorName}}, has reviewed these results. {{AdditionalNotes}}</p>
        <p>If you have any questions about your results, please contact your doctor''s office.</p>
    </div>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777;">
        <p>If you did not request these test results or believe you received this email in error, please contact us at {{ContactEmail}} or call {{ContactPhone}}.</p>
        <p>© {{CurrentYear}} Medisoft Medical Center. All rights reserved.</p>
    </div>
</div>', 
 'Template for notifying patients about available test results', 
 1, 
 GETDATE(), 
 'System', 
 3, -- TestResults
 '{"PatientName":"John Doe","TestName":"Complete Blood Count (CBC)","TestDate":"May 10, 2023","ResultsLink":"https://portal.medisoft.com/results/123456","DoctorName":"Dr. Robert Chen","AdditionalNotes":"A follow-up appointment is recommended.","LogoUrl":"https://example.com/logo.png","ContactEmail":"results@medisoft.com","ContactPhone":"+1-123-456-7890","CurrentYear":"2023"}'
),

-- Password Reset Template
('PasswordReset', 
 'Password Reset Request', 
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
    <div style="text-align: center; margin-bottom: 20px;">
        <img src="{{LogoUrl}}" alt="Medisoft Logo" style="max-width: 150px;">
    </div>
    <div style="margin-bottom: 20px;">
        <h2 style="color: #3f51b5;">Password Reset Request</h2>
        <p>Dear {{UserName}},</p>
        <p>We received a request to reset your password for your Medisoft account. If you didn''t make this request, you can safely ignore this email.</p>
    </div>
    <div style="margin-bottom: 20px; text-align: center;">
        <p>To reset your password, click the button below:</p>
        <a href="{{ResetLink}}" style="background-color: #3f51b5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        <p style="font-size: 12px; margin-top: 10px;">This link will expire in {{ExpirationTime}} hours.</p>
    </div>
    <div style="margin-bottom: 20px;">
        <p>If the button above doesn''t work, copy and paste the following link into your browser:</p>
        <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 3px; font-size: 12px;">{{ResetLink}}</p>
    </div>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777;">
        <p>If you didn''t request a password reset or need assistance, please contact us at {{ContactEmail}} or call {{ContactPhone}}.</p>
        <p>© {{CurrentYear}} Medisoft Medical Center. All rights reserved.</p>
    </div>
</div>', 
 'Template for password reset emails', 
 1, 
 GETDATE(), 
 'System', 
 7, -- PasswordReset
 '{"UserName":"John Doe","ResetLink":"https://medisoft.com/reset-password?token=abc123def456","ExpirationTime":"24","LogoUrl":"https://example.com/logo.png","ContactEmail":"support@medisoft.com","ContactPhone":"+1-123-456-7890","CurrentYear":"2023"}'
),

-- Payment Confirmation Template
('PaymentConfirmation', 
 'Payment Confirmation - Receipt #{{ReceiptNumber}}', 
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
    <div style="text-align: center; margin-bottom: 20px;">
        <img src="{{LogoUrl}}" alt="Medisoft Logo" style="max-width: 150px;">
    </div>
    <div style="margin-bottom: 20px;">
        <h2 style="color: #3f51b5;">Payment Confirmation</h2>
        <p>Dear {{PatientName}},</p>
        <p>Thank you for your payment. This email serves as your receipt.</p>
    </div>
    <div style="margin-bottom: 20px; background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        <h3 style="color: #3f51b5; margin-top: 0;">Receipt Details</h3>
        <p><strong>Receipt Number:</strong> {{ReceiptNumber}}</p>
        <p><strong>Payment Date:</strong> {{PaymentDate}}</p>
        <p><strong>Amount Paid:</strong> {{Amount}}</p>
        <p><strong>Payment Method:</strong> {{PaymentMethod}}</p>
        <p><strong>Service:</strong> {{ServiceDescription}}</p>
    </div>
    <div style="margin-bottom: 20px;">
        <p>You can view your complete payment history and download receipts from your patient portal account.</p>
        <div style="text-align: center; margin-top: 15px;">
            <a href="{{PortalLink}}" style="background-color: #3f51b5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Access Patient Portal</a>
        </div>
    </div>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777;">
        <p>If you have any questions about this payment, please contact our billing department at {{BillingEmail}} or call {{BillingPhone}}.</p>
        <p>© {{CurrentYear}} Medisoft Medical Center. All rights reserved.</p>
    </div>
</div>', 
 'Template for payment confirmation and receipts', 
 1, 
 GETDATE(), 
 'System', 
 5, -- PaymentConfirmation
 '{"PatientName":"John Doe","ReceiptNumber":"INV-12345","PaymentDate":"May 15, 2023","Amount":"$150.00","PaymentMethod":"Credit Card","ServiceDescription":"Cardiology Consultation","PortalLink":"https://portal.medisoft.com/payments","LogoUrl":"https://example.com/logo.png","BillingEmail":"billing@medisoft.com","BillingPhone":"+1-123-456-7890","CurrentYear":"2023"}'
); 