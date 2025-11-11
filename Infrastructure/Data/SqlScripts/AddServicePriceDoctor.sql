-- Create the ServicePriceDoctor table
CREATE TABLE ServicePriceDoctors (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ServicePriceId INT NOT NULL,
    DoctorId INT NOT NULL,
    CONSTRAINT FK_ServicePriceDoctor_ServicePrice FOREIGN KEY (ServicePriceId) REFERENCES ServicePrices(Id),
    CONSTRAINT FK_ServicePriceDoctor_Doctor FOREIGN KEY (DoctorId) REFERENCES Doctors(Id)
);

-- Migrate data from the old schema to the new schema
INSERT INTO ServicePriceDoctors (ServicePriceId, DoctorId)
SELECT Id AS ServicePriceId, DoctorId
FROM ServicePrices
WHERE DoctorId IS NOT NULL AND AllDoctors = 0;

-- Add an index for faster lookups
CREATE INDEX IX_ServicePriceDoctors_ServicePriceId ON ServicePriceDoctors(ServicePriceId);
CREATE INDEX IX_ServicePriceDoctors_DoctorId ON ServicePriceDoctors(DoctorId); 