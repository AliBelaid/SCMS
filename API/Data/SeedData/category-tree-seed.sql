-- Category Tree Test Data

-- First clean existing data (if needed)
DELETE FROM CategoryServices;

-- Reset Identity
DBCC CHECKIDENT ('CategoryServices', RESEED, 0);

-- Root Level Categories
INSERT INTO CategoryServices (Name, Description, IsActive, DisplayOrder, ParentId, AllowChildren, Icon)
VALUES 
('Laboratory Services', 'Various laboratory testing services', 1, 10, NULL, 1, 'science'),
('Radiology', 'Imaging and radiology services', 1, 20, NULL, 1, 'radiation'),
('Consultations', 'Doctor consultation services', 1, 30, NULL, 1, 'person'),
('Surgical Procedures', 'Various surgical procedures', 1, 40, NULL, 1, 'medical_services'),
('Physical Therapy', 'Rehabilitation and physical therapy services', 1, 50, NULL, 1, 'accessibility');

-- Laboratory Services Sub-categories
INSERT INTO CategoryServices (Name, Description, IsActive, DisplayOrder, ParentId, AllowChildren, Icon)
VALUES 
('Blood Tests', 'Various blood testing services', 1, 10, 1, 1, 'bloodtype'),
('Urine Analysis', 'Various urine testing services', 1, 20, 1, 1, 'water_drop'),
('Microbiology', 'Microbiology testing services', 1, 30, 1, 1, 'bug_report'),
('Histopathology', 'Tissue examination services', 1, 40, 1, 1, 'visibility'),
('Hormonal Tests', 'Hormonal testing services', 1, 50, 1, 1, 'monitoring');

-- Blood Tests Sub-categories
INSERT INTO CategoryServices (Name, Description, IsActive, DisplayOrder, ParentId, AllowChildren, Icon)
VALUES 
('Complete Blood Count', 'CBC tests', 1, 10, 6, 0, 'show_chart'),
('Lipid Profile', 'Cholesterol tests', 1, 20, 6, 0, 'trending_up'),
('Liver Function Tests', 'LFT tests', 1, 30, 6, 0, 'trending_down'),
('Kidney Function Tests', 'Renal function tests', 1, 40, 6, 0, 'show_chart'),
('Diabetes Tests', 'Blood glucose and related tests', 1, 50, 6, 0, 'monitor_heart');

-- Radiology Sub-categories
INSERT INTO CategoryServices (Name, Description, IsActive, DisplayOrder, ParentId, AllowChildren, Icon)
VALUES 
('X-Ray', 'X-ray imaging services', 1, 10, 2, 1, 'broken_image'),
('Ultrasound', 'Ultrasound imaging services', 1, 20, 2, 1, 'waves'),
('CT Scan', 'Computed tomography services', 1, 30, 2, 1, '3d_rotation'),
('MRI', 'Magnetic resonance imaging services', 1, 40, 2, 1, 'view_in_ar'),
('Mammography', 'Breast imaging services', 1, 50, 2, 0, 'filter_center_focus');

-- Consultation Sub-categories
INSERT INTO CategoryServices (Name, Description, IsActive, DisplayOrder, ParentId, AllowChildren, Icon)
VALUES 
('General Medicine', 'General medicine consultations', 1, 10, 3, 0, 'medical_services'),
('Cardiology', 'Heart-related consultations', 1, 20, 3, 0, 'favorite'),
('Neurology', 'Nervous system consultations', 1, 30, 3, 0, 'psychology'),
('Dermatology', 'Skin-related consultations', 1, 40, 3, 0, 'spa'),
('Orthopedics', 'Bone and joint consultations', 1, 50, 3, 0, 'orthopedics'),
('Gynecology', 'Women health consultations', 1, 60, 3, 0, 'pregnant_woman'),
('Pediatrics', 'Child health consultations', 1, 70, 3, 0, 'child_care');

-- Surgical Procedures Sub-categories
INSERT INTO CategoryServices (Name, Description, IsActive, DisplayOrder, ParentId, AllowChildren, Icon)
VALUES 
('General Surgery', 'General surgical procedures', 1, 10, 4, 1, 'content_cut'),
('Cardiac Surgery', 'Heart surgical procedures', 1, 20, 4, 0, 'favorite'),
('Neurosurgery', 'Brain and nerve surgical procedures', 1, 30, 4, 0, 'psychology'),
('Orthopedic Surgery', 'Bone and joint surgical procedures', 1, 40, 4, 0, 'orthopedics');

-- General Surgery Sub-categories
INSERT INTO CategoryServices (Name, Description, IsActive, DisplayOrder, ParentId, AllowChildren, Icon)
VALUES 
('Appendectomy', 'Appendix removal', 1, 10, 26, 0, 'content_cut'),
('Hernia Repair', 'Hernia surgical procedures', 1, 20, 26, 0, 'healing'),
('Gallbladder Removal', 'Cholecystectomy procedures', 1, 30, 26, 0, 'remove_circle');

-- Physical Therapy Sub-categories
INSERT INTO CategoryServices (Name, Description, IsActive, DisplayOrder, ParentId, AllowChildren, Icon)
VALUES 
('Physiotherapy', 'Physical therapy sessions', 1, 10, 5, 0, 'accessibility_new'),
('Occupational Therapy', 'Occupational therapy sessions', 1, 20, 5, 0, 'work'),
('Speech Therapy', 'Speech and language therapy', 1, 30, 5, 0, 'record_voice_over'),
('Hydrotherapy', 'Water-based therapy sessions', 1, 40, 5, 0, 'pool'); 