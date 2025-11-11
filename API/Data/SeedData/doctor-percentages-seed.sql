-- Doctor Percentage Presets for Service Pricing

-- Create table if it doesn't exist (you may want to create this in your actual migrations)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DoctorPercentagePresets')
BEGIN
    CREATE TABLE DoctorPercentagePresets (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        Description NVARCHAR(255),
        DoctorPercentage INT NOT NULL,
        CenterPercentage INT NOT NULL,
        IsDefault BIT NOT NULL DEFAULT 0,
        CategoryId INT NULL,
        CONSTRAINT CHK_Percentages CHECK (DoctorPercentage + CenterPercentage = 100),
        CONSTRAINT CHK_PercentageRange CHECK (DoctorPercentage >= 0 AND DoctorPercentage <= 100 AND CenterPercentage >= 0 AND CenterPercentage <= 100)
    );
END

-- Clear existing data
DELETE FROM DoctorPercentagePresets;

-- Reset Identity
DBCC CHECKIDENT ('DoctorPercentagePresets', RESEED, 0);

-- Insert global presets
INSERT INTO DoctorPercentagePresets (Name, Description, DoctorPercentage, CenterPercentage, IsDefault, CategoryId)
VALUES
('Default', 'Standard revenue split for most services', 70, 30, 1, NULL),
('High Doctor Share', 'Higher doctor percentage for specialized services', 80, 20, 0, NULL),
('Balanced Split', 'Equal split between doctor and center', 50, 50, 0, NULL),
('Center Focus', 'Higher center percentage for equipment-intensive services', 40, 60, 0, NULL),
('Minimum Doctor', 'Minimum doctor percentage for basic services', 30, 70, 0, NULL);

-- Specialty specific presets - Laboratory Services (CategoryId = 1)
INSERT INTO DoctorPercentagePresets (Name, Description, DoctorPercentage, CenterPercentage, IsDefault, CategoryId)
VALUES
('Standard Lab', 'Standard split for laboratory services', 60, 40, 1, 1);

-- Specialty specific presets - Radiology (CategoryId = 2)
INSERT INTO DoctorPercentagePresets (Name, Description, DoctorPercentage, CenterPercentage, IsDefault, CategoryId)
VALUES
('Radiology Standard', 'Standard split for radiology services', 55, 45, 1, 2),
('Complex Imaging', 'Split for complex imaging procedures', 65, 35, 0, 2);

-- Specialty specific presets - Consultations (CategoryId = 3)
INSERT INTO DoctorPercentagePresets (Name, Description, DoctorPercentage, CenterPercentage, IsDefault, CategoryId)
VALUES
('Consultation Standard', 'Standard split for consultations', 75, 25, 1, 3),
('Specialist Consultation', 'Split for specialist consultations', 85, 15, 0, 3);

-- Specialty specific presets - Surgical Procedures (CategoryId = 4)
INSERT INTO DoctorPercentagePresets (Name, Description, DoctorPercentage, CenterPercentage, IsDefault, CategoryId)
VALUES
('Surgery Standard', 'Standard split for surgical procedures', 65, 35, 1, 4),
('Complex Surgery', 'Split for complex surgical procedures', 75, 25, 0, 4),
('Minor Surgery', 'Split for minor surgical procedures', 60, 40, 0, 4);

-- Specialty specific presets - Physical Therapy (CategoryId = 5)
INSERT INTO DoctorPercentagePresets (Name, Description, DoctorPercentage, CenterPercentage, IsDefault, CategoryId)
VALUES
('Therapy Standard', 'Standard split for therapy services', 60, 40, 1, 5); 