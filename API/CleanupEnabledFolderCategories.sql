-- Clean up malformed data in AspNetUsers.EnabledFolderCategories column
-- This script handles cases where the data might be stored in JSON array format or incomplete format

UPDATE AspNetUsers 
SET EnabledFolderCategories = CASE 
    -- Handle empty or null values
    WHEN EnabledFolderCategories IS NULL OR EnabledFolderCategories = '' THEN ''
    
    -- Handle JSON array format like '[1,2,3]'
    WHEN EnabledFolderCategories LIKE '[%]' THEN 
        REPLACE(REPLACE(EnabledFolderCategories, '[', ''), ']', '')
    
    -- Handle incomplete JSON arrays like '[1,2,3' or '[1'
    WHEN EnabledFolderCategories LIKE '[%' AND EnabledFolderCategories NOT LIKE '%]' THEN 
        SUBSTRING(EnabledFolderCategories, 2, LEN(EnabledFolderCategories) - 1)
    
    -- Handle already comma-separated values (keep as is)
    ELSE EnabledFolderCategories
END
WHERE EnabledFolderCategories IS NOT NULL
AND (
    EnabledFolderCategories LIKE '[%' OR 
    EnabledFolderCategories LIKE '%]' OR
    EnabledFolderCategories LIKE '%[%'
);

-- Verify the cleanup
SELECT Id, Email, EnabledFolderCategories 
FROM AspNetUsers 
WHERE EnabledFolderCategories IS NOT NULL AND EnabledFolderCategories <> ''; 