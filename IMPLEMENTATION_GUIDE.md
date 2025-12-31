# Visitor Management System - Implementation Guide

## Quick Start Guide

This guide will help you implement the visitor management enhancements step by step.

---

## ✅ Completed Changes

### 1. C# Entity Updates
- ✅ Updated `Visit.cs` with new status and rejection fields
- ✅ Updated `Visitor.cs` with block reason and audit fields

### 2. Angular Web Application
- ✅ Created `visitor-create.component.ts` for visitor pre-registration
- ✅ Created `visitor-create.component.html` with responsive form
- ✅ Created `visitor-create.component.scss` with modern styling
- ✅ Updated navigation to include "Create Visitor" menu item
- ✅ Added Arabic translation for "CREATE_VISITOR"
- ✅ Updated routes to include `/visitors/create`

### 3. Flutter POS Application
- ✅ Added RTL layout support in `main.dart`
- ✅ Wrapped `new_visit_screen.dart` in Directionality(RTL)
- ✅ Wrapped `visitor_search_screen.dart` in Directionality(RTL)
- ✅ Existing visitor status checking already implemented

---

## 🔄 Pending Implementation

### 1. Database Migration (CRITICAL - Do First!)

**Create Migration File:**
```bash
cd D:\myApps\SCMS\API
dotnet ef migrations add AddVisitorManagementEnhancements
```

**Migration Content:**
```csharp
public partial class AddVisitorManagementEnhancements : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Add new columns to Visits
        migrationBuilder.AddColumn<string>(
            name: "RejectionReason",
            table: "Visits",
            type: "nvarchar(500)",
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "RejectedAt",
            table: "Visits",
            type: "datetime2",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "RejectedByUserId",
            table: "Visits",
            type: "int",
            nullable: true);

        // Add new columns to Visitors
        migrationBuilder.AddColumn<string>(
            name: "BlockReason",
            table: "Visitors",
            type: "nvarchar(500)",
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "BlockedAt",
            table: "Visitors",
            type: "datetime2",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "BlockedByUserId",
            table: "Visitors",
            type: "int",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "CreatedByUserId",
            table: "Visitors",
            type: "int",
            nullable: false,
            defaultValue: 1);

        // Update existing status values
        migrationBuilder.Sql(
            "UPDATE Visits SET Status = 'checkedin' WHERE Status = 'ongoing'");
        migrationBuilder.Sql(
            "UPDATE Visits SET Status = 'checkedout' WHERE Status = 'completed'");
        migrationBuilder.Sql(
            "UPDATE Visits SET Status = 'rejected' WHERE Status = 'incomplete'");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "RejectionReason", table: "Visits");
        migrationBuilder.DropColumn(name: "RejectedAt", table: "Visits");
        migrationBuilder.DropColumn(name: "RejectedByUserId", table: "Visits");
        migrationBuilder.DropColumn(name: "BlockReason", table: "Visitors");
        migrationBuilder.DropColumn(name: "BlockedAt", table: "Visitors");
        migrationBuilder.DropColumn(name: "BlockedByUserId", table: "Visitors");
        migrationBuilder.DropColumn(name: "CreatedByUserId", table: "Visitors");
    }
}
```

**Apply Migration:**
```bash
dotnet ef database update
```

### 2. API Controller Updates

**VisitorsController.cs - Add CreateVisitor Endpoint:**

```csharp
/// <summary>
/// Create a new visitor (pre-registration)
/// POST /api/Visitors
/// </summary>
[HttpPost]
public async Task<ActionResult<VisitorDto>> CreateVisitor([FromBody] CreateVisitorDto createDto)
{
    try
    {
        // Get current user
        if (User.Identity?.Name == null)
        {
            return Unauthorized(new ApiResponse(401, "User not authenticated"));
        }

        var user = await _userManager.FindByNameAsync(User.Identity.Name);
        if (user == null)
        {
            return Unauthorized(new ApiResponse(401, "User not found"));
        }

        // Check if visitor already exists
        var existingVisitor = await _context.Visitors
            .FirstOrDefaultAsync(v => 
                v.NationalId == createDto.NationalId || 
                v.Phone == createDto.Phone);

        if (existingVisitor != null)
        {
            return BadRequest(new ApiResponse(400, "Visitor already exists"));
        }

        // Create new visitor
        var visitor = new Visitor
        {
            FullName = createDto.FullName,
            NationalId = createDto.NationalId,
            Phone = createDto.Phone,
            Company = createDto.Company,
            IsBlocked = false,
            CreatedByUserId = user.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Save images if provided
        if (!string.IsNullOrEmpty(createDto.PersonImageBase64))
        {
            var personImageUrl = await ImageUploadHelper.SavePersonImageAsync(
                createDto.PersonImageBase64,
                visitor.NationalId,
                _environment);
            if (personImageUrl != null)
                visitor.PersonImageUrl = personImageUrl;
        }

        if (!string.IsNullOrEmpty(createDto.IdCardImageBase64))
        {
            var idCardImageUrl = await ImageUploadHelper.SaveIdCardImageAsync(
                createDto.IdCardImageBase64,
                visitor.NationalId,
                _environment);
            if (idCardImageUrl != null)
                visitor.IdCardImageUrl = idCardImageUrl;
        }

        _context.Visitors.Add(visitor);
        await _context.SaveChangesAsync();

        _logger.LogInformation($"Visitor created: {visitor.FullName} by user {user.CodeUser}");

        var visitorDto = new VisitorDto
        {
            Id = visitor.Id,
            FullName = visitor.FullName,
            NationalId = visitor.NationalId,
            Phone = visitor.Phone,
            Company = visitor.Company,
            PersonImageUrl = visitor.PersonImageUrl,
            IdCardImageUrl = visitor.IdCardImageUrl,
            IsBlocked = visitor.IsBlocked,
            CreatedAt = visitor.CreatedAt
        };

        return CreatedAtAction(nameof(GetVisitorProfile), new { id = visitor.Id }, visitorDto);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error creating visitor");
        return StatusCode(500, new ApiResponse(500, "Error creating visitor"));
    }
}
```

**VisitorsController.cs - Update Block Endpoint:**

```csharp
/// <summary>
/// Update visitor blocked status with reason (Admin only)
/// PUT /api/Visitors/{id}/block
/// </summary>
[HttpPut("{id}/block")]
[Authorize(Roles = "Admin")]
public async Task<ActionResult<VisitorDto>> UpdateBlockStatus(
    int id, 
    [FromBody] BlockVisitorDto blockDto)
{
    try
    {
        var visitor = await _context.Visitors.FindAsync(id);
        if (visitor == null)
        {
            return NotFound(new ApiResponse(404, "Visitor not found"));
        }

        // Get current user
        if (User.Identity?.Name == null)
        {
            return Unauthorized(new ApiResponse(401, "User not authenticated"));
        }

        var user = await _userManager.FindByNameAsync(User.Identity.Name);
        if (user == null)
        {
            return Unauthorized(new ApiResponse(401, "User not found"));
        }

        visitor.IsBlocked = blockDto.IsBlocked;
        
        if (blockDto.IsBlocked)
        {
            visitor.BlockReason = blockDto.BlockReason;
            visitor.BlockedAt = DateTime.UtcNow;
            visitor.BlockedByUserId = user.Id;
        }
        else
        {
            visitor.BlockReason = null;
            visitor.BlockedAt = null;
            visitor.BlockedByUserId = null;
        }
        
        visitor.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            $"Visitor {visitor.FullName} {(blockDto.IsBlocked ? "blocked" : "unblocked")} by {user.CodeUser}");

        var visitorDto = new VisitorDto
        {
            Id = visitor.Id,
            FullName = visitor.FullName,
            NationalId = visitor.NationalId,
            Phone = visitor.Phone,
            Company = visitor.Company,
            PersonImageUrl = visitor.PersonImageUrl,
            IdCardImageUrl = visitor.IdCardImageUrl,
            IsBlocked = visitor.IsBlocked,
            BlockReason = visitor.BlockReason,
            BlockedAt = visitor.BlockedAt,
            CreatedAt = visitor.CreatedAt
        };

        return Ok(visitorDto);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, $"Error updating visitor block status: {id}");
        return StatusCode(500, new ApiResponse(500, "Error updating visitor block status"));
    }
}
```

**VisitsController.cs - Add Reject Visit Endpoint:**

```csharp
/// <summary>
/// Reject a visit
/// POST /api/Visits/{visitNumber}/reject
/// </summary>
[HttpPost("{visitNumber}/reject")]
public async Task<ActionResult<VisitDto>> RejectVisit(
    string visitNumber, 
    [FromBody] RejectVisitDto rejectDto)
{
    try
    {
        var visit = await _context.Visits
            .Include(v => v.Visitor)
            .FirstOrDefaultAsync(v => v.VisitNumber == visitNumber);

        if (visit == null)
        {
            return NotFound(new ApiResponse(404, "Visit not found"));
        }

        if (visit.Status != "checkedin")
        {
            return BadRequest(new ApiResponse(400, "Only checked-in visits can be rejected"));
        }

        // Get current user
        if (User.Identity?.Name == null)
        {
            return Unauthorized(new ApiResponse(401, "User not authenticated"));
        }

        var user = await _userManager.FindByNameAsync(User.Identity.Name);
        if (user == null)
        {
            return Unauthorized(new ApiResponse(401, "User not found"));
        }

        visit.Status = "rejected";
        visit.RejectionReason = rejectDto.RejectionReason;
        visit.RejectedAt = DateTime.UtcNow;
        visit.RejectedByUserId = user.Id;
        visit.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation($"Visit rejected: {visit.VisitNumber} by user {user.CodeUser}");

        var visitDto = _mapper.Map<VisitDto>(visit);

        // Send SignalR notification
        await _hubContext.Clients.Group("VisitorManagement").SendAsync("VisitRejected", new
        {
            Visit = visitDto,
            RejectedBy = user.CodeUser,
            Timestamp = DateTime.UtcNow
        });

        return Ok(visitDto);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, $"Error rejecting visit: {visitNumber}");
        return StatusCode(500, new ApiResponse(500, "Error rejecting visit"));
    }
}
```

### 3. Create DTOs

**CreateVisitorDto.cs:**
```csharp
public class CreateVisitorDto
{
    public string FullName { get; set; }
    public string NationalId { get; set; }
    public string Phone { get; set; }
    public string? Company { get; set; }
    public string? PersonImageBase64 { get; set; }
    public string? IdCardImageBase64 { get; set; }
}
```

**BlockVisitorDto.cs:**
```csharp
public class BlockVisitorDto
{
    public bool IsBlocked { get; set; }
    public string? BlockReason { get; set; }
}
```

**RejectVisitDto.cs:**
```csharp
public class RejectVisitDto
{
    public string RejectionReason { get; set; }
}
```

### 4. Update VisitorDto to include new fields

```csharp
public class VisitorDto
{
    public int Id { get; set; }
    public string FullName { get; set; }
    public string? NationalId { get; set; }
    public string? Phone { get; set; }
    public string? Company { get; set; }
    public string? PersonImageUrl { get; set; }
    public string? IdCardImageUrl { get; set; }
    public bool IsBlocked { get; set; }
    public string? BlockReason { get; set; }  // NEW
    public DateTime? BlockedAt { get; set; }  // NEW
    public DateTime CreatedAt { get; set; }
}
```

### 5. Update VisitDto to include rejection fields

```csharp
public class VisitDto
{
    // ... existing fields ...
    public string? RejectionReason { get; set; }  // NEW
    public DateTime? RejectedAt { get; set; }     // NEW
}
```

---

## 🧪 Testing Steps

### 1. Test Database Migration
```bash
# Check migration status
dotnet ef migrations list

# Apply migration
dotnet ef database update

# Verify in SQL Server
SELECT * FROM Visits WHERE Status = 'checkedin'
SELECT * FROM Visitors WHERE BlockReason IS NOT NULL
```

### 2. Test API Endpoints

**Create Visitor:**
```bash
POST http://localhost:5000/api/Visitors
Content-Type: application/json

{
  "fullName": "Ahmed Ali",
  "nationalId": "1234567890",
  "phone": "0501234567",
  "company": "ABC Corp"
}
```

**Block Visitor:**
```bash
PUT http://localhost:5000/api/Visitors/1/block
Content-Type: application/json

{
  "isBlocked": true,
  "blockReason": "Security concern"
}
```

**Reject Visit:**
```bash
POST http://localhost:5000/api/Visits/V20231226-0001/reject
Content-Type: application/json

{
  "rejectionReason": "Visitor not authorized"
}
```

### 3. Test Angular Web

1. Navigate to `/app/visitor-management/visitors/create`
2. Fill in visitor form
3. Upload images
4. Submit form
5. Verify visitor created
6. Navigate to visitors list
7. Find created visitor
8. Click "Block" (Admin only)
9. Enter block reason
10. Verify visitor blocked

### 4. Test Flutter POS

1. Open app
2. Verify RTL layout
3. Navigate to New Visit
4. Search for visitor
5. Select blocked visitor
6. Verify warning message
7. Verify cannot create visit
8. Search for active visitor
9. Create visit successfully

---

## 📋 Deployment Checklist

### Backend
- [ ] Create and apply database migration
- [ ] Update VisitorsController with new endpoints
- [ ] Update VisitsController with reject endpoint
- [ ] Create new DTOs
- [ ] Update existing DTOs
- [ ] Test all endpoints
- [ ] Deploy to production server

### Angular Web
- [ ] Build production: `ng build --configuration production`
- [ ] Test create visitor form
- [ ] Test visitor blocking
- [ ] Test visitor search
- [ ] Deploy to web server
- [ ] Clear browser cache

### Flutter POS
- [ ] Update version in pubspec.yaml
- [ ] Test RTL layout
- [ ] Test visitor status checking
- [ ] Build APK: `flutter build apk --release`
- [ ] Distribute to POS devices
- [ ] Verify API connectivity

---

## 🐛 Troubleshooting

### Issue: Migration fails
**Solution:** Check connection string, ensure database is accessible

### Issue: RTL layout not working in Flutter
**Solution:** Ensure `Directionality` widget wraps Scaffold, check locale settings

### Issue: Visitor creation fails
**Solution:** Check API logs, verify all required fields, check image size limits

### Issue: Block status not updating
**Solution:** Verify user has Admin role, check API logs

---

## 📞 Support

For issues or questions, refer to:
- `VISITOR_MANAGEMENT_ENHANCEMENTS.md` - Complete feature documentation
- API logs in `D:\myApps\SCMS\API\logs`
- Flutter logs in device console

---

## ✅ Summary

**Completed:**
- Entity updates (Visit, Visitor)
- Angular visitor creation component
- Flutter RTL layout support
- Navigation and routing updates
- Arabic translations

**Pending:**
- Database migration (CRITICAL)
- API controller updates
- DTO creation
- Testing and deployment

**Estimated Time:**
- Database migration: 15 minutes
- API updates: 2 hours
- Testing: 1 hour
- Deployment: 30 minutes
- **Total: ~4 hours**

