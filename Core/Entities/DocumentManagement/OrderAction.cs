namespace Core.Entities.DocumentManagement
{
    public enum OrderAction
    {
        Created = 1,
        Updated = 2,
        StatusChanged = 3,
        PriorityChanged = 4,
        Assigned = 5,
        AttachmentAdded = 6,
        AttachmentRemoved = 7,
        PermissionGranted = 8,
        PermissionRevoked = 9,
        DepartmentAccessGranted = 10,
        DepartmentAccessRevoked = 11,
        UserExceptionAdded = 12,
        UserExceptionRemoved = 13,
        ExpirationSet = 14,
        Archived = 15,
        Restored = 16,
        Deleted = 17,
        ExpirationRemoved = 18
    }
}

