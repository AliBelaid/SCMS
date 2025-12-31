using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Errors;
using Core.Entities.DocumentManagement;
using Core.Entities.Identity;
using Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DepartmentsController : BaseController
    {
        private readonly AppIdentityDbContext _context;
        private readonly ILogger<DepartmentsController> _logger;

        public DepartmentsController(
            AppIdentityDbContext context,
            ILogger<DepartmentsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Get all departments with users and subjects
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetDepartments()
        {
            try
            {
                var departments = await _context.Departments
                    .Include(d => d.Subjects)
                    .Include(d => d.Manager)
                    .Include(d => d.DepartmentUsers)
                        .ThenInclude(du => du.User)
                    .OrderBy(d => d.NameAr)
                    .Select(d => new
                    {
                        id = d.Id.ToString(),
                        code = d.Code,
                        nameAr = d.NameAr,
                        nameEn = d.NameEn,
                        description = d.Description,
                        isActive = d.IsActive,
                        createdAt = d.CreatedAt,
                        managerId = d.ManagerId,
                        managerName = d.Manager != null ? d.Manager.CodeUser : null,
                        usersCount = d.DepartmentUsers.Count(du => du.IsActive),
                        subjects = d.Subjects.Select(s => new
                        {
                            id = s.Id.ToString(),
                            code = s.Code,
                            nameAr = s.NameAr,
                            nameEn = s.NameEn,
                            departmentId = s.DepartmentId.ToString(),
                            description = s.Description,
                            isActive = s.IsActive,
                            createdAt = s.CreatedAt
                        }).ToList()
                    })
                    .ToListAsync();

                return Ok(departments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting departments");
                return StatusCode(500, new ApiResponse(500, "Error retrieving departments"));
            }
        }

        /// <summary>
        /// Get subjects for a specific department
        /// </summary>
        [HttpGet("{id}/subjects")]
        public async Task<ActionResult<IEnumerable<object>>> GetDepartmentSubjects(string id)
        {
            try
            {
                if (!int.TryParse(id, out int departmentId))
                {
                    return BadRequest(new ApiResponse(400, "Invalid department ID"));
                }

                var subjects = await _context.Subjects
                    .Where(s => s.DepartmentId == departmentId && s.IsActive)
                    .OrderBy(s => s.NameAr)
                    .Select(s => new
                    {
                        id = s.Id.ToString(),
                        code = s.Code,
                        nameAr = s.NameAr,
                        nameEn = s.NameEn,
                        description = s.Description ?? string.Empty,
                        departmentId = s.DepartmentId.ToString(),
                        isActive = s.IsActive,
                        createdAt = s.CreatedAt
                    })
                    .ToListAsync();

                return Ok(subjects);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting subjects for department ID: {id}");
                return StatusCode(500, new ApiResponse(500, "Error retrieving subjects"));
            }
        }

        /// <summary>
        /// Get available users (not in department)
        /// </summary>
        [HttpGet("{id}/available-users")]
        public async Task<ActionResult<IEnumerable<object>>> GetAvailableUsers(string id)
        {
            try
            {
                if (!int.TryParse(id, out int departmentId))
                {
                    return BadRequest(new ApiResponse(400, "Invalid department ID"));
                }

                var departmentUserIds = await _context.DepartmentUsers
                    .Where(du => du.DepartmentId == departmentId && du.IsActive)
                    .Select(du => du.UserId)
                    .ToListAsync();

                var availableUsers = await _context.Users
                    .Where(u => !departmentUserIds.Contains(u.Id))
                    .Select(u => new
                    {
                        id = u.Id,
                        code = u.CodeUser,
                        email = u.Email,
                        name = u.CodeUser
                    })
                    .ToListAsync();

                return Ok(availableUsers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting available users");
                return StatusCode(500, new ApiResponse(500, "Error getting available users"));
            }
        }

        /// <summary>
        /// Get department by ID with full details
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetDepartment(string id)
        {
            try
            {
                if (!int.TryParse(id, out int departmentId))
                {
                    return BadRequest(new ApiResponse(400, "Invalid department ID"));
                }

                var department = await _context.Departments
                    .Include(d => d.Subjects)
                    .Include(d => d.Manager)
                    .Include(d => d.DepartmentUsers)
                        .ThenInclude(du => du.User)
                    .Where(d => d.Id == departmentId)
                    .Select(d => new
                    {
                        id = d.Id.ToString(),
                        code = d.Code,
                        nameAr = d.NameAr,
                        nameEn = d.NameEn,
                        description = d.Description,
                        isActive = d.IsActive,
                        createdAt = d.CreatedAt,
                        managerId = d.ManagerId,
                        managerName = d.Manager != null ? d.Manager.CodeUser : null,
                        subjects = d.Subjects.Select(s => new
                        {
                            id = s.Id.ToString(),
                            code = s.Code,
                            nameAr = s.NameAr,
                            nameEn = s.NameEn,
                            departmentId = s.DepartmentId.ToString(),
                            description = s.Description,
                            isActive = s.IsActive,
                            createdAt = s.CreatedAt
                        }).ToList(),
                        users = d.DepartmentUsers
                            .Where(du => du.IsActive)
                            .Select(du => new
                            {
                                id = du.Id.ToString(),
                                userId = du.UserId.ToString(),
                                userCode = du.User.CodeUser,
                                userEmail = du.User.Email,
                                userName = du.User.CodeUser,
                                position = du.Position,
                                isHead = du.IsHead,
                                joinedAt = du.JoinedAt,
                                notes = du.Notes
                            }).ToList()
                    })
                    .FirstOrDefaultAsync();

                if (department == null)
                {
                    return NotFound(new ApiResponse(404, "Department not found"));
                }

                return Ok(department);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting department: {id}");
                return StatusCode(500, new ApiResponse(500, "Error retrieving department"));
            }
        }

        /// <summary>
        /// Create a new department
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<object>> CreateDepartment([FromBody] CreateDepartmentDto dto)
        {
            try
            {
                // Check if code already exists
                if (await _context.Departments.AnyAsync(d => d.Code == dto.Code))
                {
                    return BadRequest(new ApiResponse(400, "Department code already exists"));
                }

                var department = new Department
                {
                    Code = dto.Code,
                    NameAr = dto.NameAr,
                    NameEn = dto.NameEn,
                    Description = dto.Description,
                    IsActive = dto.IsActive ?? true,
                    ManagerId = dto.ManagerId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Departments.Add(department);
                await _context.SaveChangesAsync();

                // Add subjects if provided
                if (dto.Subjects != null && dto.Subjects.Any())
                {
                    foreach (var subjectDto in dto.Subjects)
                    {
                        var subject = new Subject
                        {
                            Code = subjectDto.Code,
                            NameAr = subjectDto.NameAr,
                            NameEn = subjectDto.NameEn,
                            DepartmentId = department.Id,
                            Description = subjectDto.Description,
                            IsActive = subjectDto.IsActive ?? true,
                            CreatedAt = DateTime.UtcNow
                        };
                        _context.Subjects.Add(subject);
                    }
                }

                // Add users if provided
                if (dto.Users != null && dto.Users.Any())
                {
                    foreach (var userDto in dto.Users)
                    {
                        var departmentUser = new DepartmentUser
                        {
                            DepartmentId = department.Id,
                            UserId = userDto.UserId,
                            Position = userDto.Position,
                            IsHead = userDto.IsHead ?? false,
                            Notes = userDto.Notes,
                            JoinedAt = DateTime.UtcNow,
                            IsActive = true
                        };
                        _context.DepartmentUsers.Add(departmentUser);
                    }
                }

                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetDepartment), new { id = department.Id.ToString() }, new
                {
                    id = department.Id.ToString(),
                    code = department.Code,
                    nameAr = department.NameAr,
                    nameEn = department.NameEn,
                    description = department.Description,
                    isActive = department.IsActive,
                    createdAt = department.CreatedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating department");
                return StatusCode(500, new ApiResponse(500, "Error creating department"));
            }
        }

        /// <summary>
        /// Update a department
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<object>> UpdateDepartment(string id, [FromBody] UpdateDepartmentDto dto)
        {
            try
            {
                if (!int.TryParse(id, out int departmentId))
                {
                    return BadRequest(new ApiResponse(400, "Invalid department ID"));
                }

                var department = await _context.Departments.FindAsync(departmentId);
                if (department == null)
                {
                    return NotFound(new ApiResponse(404, "Department not found"));
                }

                // Check if code already exists (for other departments)
                if (!string.IsNullOrEmpty(dto.Code) && dto.Code != department.Code)
                {
                    if (await _context.Departments.AnyAsync(d => d.Code == dto.Code && d.Id != departmentId))
                    {
                        return BadRequest(new ApiResponse(400, "Department code already exists"));
                    }
                }

                if (!string.IsNullOrEmpty(dto.Code)) department.Code = dto.Code;
                if (!string.IsNullOrEmpty(dto.NameAr)) department.NameAr = dto.NameAr;
                if (!string.IsNullOrEmpty(dto.NameEn)) department.NameEn = dto.NameEn;
                if (dto.Description != null) department.Description = dto.Description;
                if (dto.IsActive.HasValue) department.IsActive = dto.IsActive.Value;
                if (dto.ManagerId.HasValue) department.ManagerId = dto.ManagerId.Value;
                department.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    id = department.Id.ToString(),
                    code = department.Code,
                    nameAr = department.NameAr,
                    nameEn = department.NameEn,
                    description = department.Description,
                    isActive = department.IsActive,
                    managerId = department.ManagerId,
                    updatedAt = department.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating department: {id}");
                return StatusCode(500, new ApiResponse(500, "Error updating department"));
            }
        }

        /// <summary>
        /// Delete a department
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteDepartment(string id)
        {
            try
            {
                if (!int.TryParse(id, out int departmentId))
                {
                    return BadRequest(new ApiResponse(400, "Invalid department ID"));
                }

                var department = await _context.Departments
                    .Include(d => d.Orders)
                    .Include(d => d.Subjects)
                    .Include(d => d.DepartmentUsers)
                    .FirstOrDefaultAsync(d => d.Id == departmentId);

                if (department == null)
                {
                    return NotFound(new ApiResponse(404, "Department not found"));
                }

                // Check if department has orders
                if (department.Orders.Any())
                {
                    return BadRequest(new ApiResponse(400, "Cannot delete department with existing orders"));
                }

                // Delete related data
                _context.DepartmentUsers.RemoveRange(department.DepartmentUsers);
                _context.Subjects.RemoveRange(department.Subjects);
                _context.Departments.Remove(department);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Department deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting department: {id}");
                return StatusCode(500, new ApiResponse(500, "Error deleting department"));
            }
        }

        // ==================== Department Users Management ====================

        /// <summary>
        /// Add user to department
        /// </summary>
        [HttpPost("{id}/users")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> AddUserToDepartment(string id, [FromBody] AddDepartmentUserDto dto)
        {
            try
            {
                if (!int.TryParse(id, out int departmentId))
                {
                    return BadRequest(new ApiResponse(400, "Invalid department ID"));
                }

                // Check if user already exists in department
                var existing = await _context.DepartmentUsers
                    .AnyAsync(du => du.DepartmentId == departmentId && du.UserId == dto.UserId && du.IsActive);

                if (existing)
                {
                    return BadRequest(new ApiResponse(400, "User already exists in this department"));
                }

                var departmentUser = new DepartmentUser
                {
                    DepartmentId = departmentId,
                    UserId = dto.UserId,
                    Position = dto.Position,
                    IsHead = dto.IsHead ?? false,
                    Notes = dto.Notes,
                    JoinedAt = DateTime.UtcNow,
                    IsActive = true
                };

                _context.DepartmentUsers.Add(departmentUser);
                await _context.SaveChangesAsync();

                return Ok(new { message = "User added to department successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error adding user to department: {id}");
                return StatusCode(500, new ApiResponse(500, "Error adding user to department"));
            }
        }

        /// <summary>
        /// Remove user from department
        /// </summary>
        [HttpDelete("{id}/users/{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> RemoveUserFromDepartment(string id, string userId)
        {
            try
            {
                if (!int.TryParse(id, out int departmentId) || !int.TryParse(userId, out int userIdInt))
                {
                    return BadRequest(new ApiResponse(400, "Invalid ID"));
                }

                var departmentUser = await _context.DepartmentUsers
                    .FirstOrDefaultAsync(du => du.DepartmentId == departmentId && du.UserId == userIdInt && du.IsActive);

                if (departmentUser == null)
                {
                    return NotFound(new ApiResponse(404, "User not found in department"));
                }

                departmentUser.IsActive = false;
                departmentUser.LeftAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new { message = "User removed from department successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error removing user from department");
                return StatusCode(500, new ApiResponse(500, "Error removing user from department"));
            }
        }

        /// <summary>
        /// Update user in department
        /// </summary>
        [HttpPut("{id}/users/{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> UpdateDepartmentUser(string id, string userId, [FromBody] UpdateDepartmentUserDto dto)
        {
            try
            {
                if (!int.TryParse(id, out int departmentId) || !int.TryParse(userId, out int userIdInt))
                {
                    return BadRequest(new ApiResponse(400, "Invalid ID"));
                }

                var departmentUser = await _context.DepartmentUsers
                    .FirstOrDefaultAsync(du => du.DepartmentId == departmentId && du.UserId == userIdInt && du.IsActive);

                if (departmentUser == null)
                {
                    return NotFound(new ApiResponse(404, "User not found in department"));
                }

                if (!string.IsNullOrEmpty(dto.Position)) departmentUser.Position = dto.Position;
                if (dto.IsHead.HasValue) departmentUser.IsHead = dto.IsHead.Value;
                if (dto.Notes != null) departmentUser.Notes = dto.Notes;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Department user updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating department user");
                return StatusCode(500, new ApiResponse(500, "Error updating department user"));
            }
        }

        // ==================== Subjects Management ====================

        /// <summary>
        /// Add subject to department
        /// </summary>
        [HttpPost("{id}/subjects")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> AddSubject(string id, [FromBody] CreateSubjectDto dto)
        {
            try
            {
                if (!int.TryParse(id, out int departmentId))
                {
                    return BadRequest(new ApiResponse(400, "Invalid department ID"));
                }

                var subject = new Subject
                {
                    Code = dto.Code,
                    NameAr = dto.NameAr,
                    NameEn = dto.NameEn,
                    DepartmentId = departmentId,
                    Description = dto.Description,
                    IsActive = dto.IsActive ?? true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Subjects.Add(subject);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Subject added successfully", subjectId = subject.Id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error adding subject");
                return StatusCode(500, new ApiResponse(500, "Error adding subject"));
            }
        }

        /// <summary>
        /// Update subject
        /// </summary>
        [HttpPut("{id}/subjects/{subjectId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> UpdateSubject(string id, string subjectId, [FromBody] UpdateSubjectDto dto)
        {
            try
            {
                if (!int.TryParse(subjectId, out int subjectIdInt))
                {
                    return BadRequest(new ApiResponse(400, "Invalid subject ID"));
                }

                var subject = await _context.Subjects.FindAsync(subjectIdInt);
                if (subject == null)
                {
                    return NotFound(new ApiResponse(404, "Subject not found"));
                }

                if (!string.IsNullOrEmpty(dto.Code)) subject.Code = dto.Code;
                if (!string.IsNullOrEmpty(dto.NameAr)) subject.NameAr = dto.NameAr;
                if (!string.IsNullOrEmpty(dto.NameEn)) subject.NameEn = dto.NameEn;
                if (dto.Description != null) subject.Description = dto.Description;
                if (dto.IsActive.HasValue) subject.IsActive = dto.IsActive.Value;
                subject.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Subject updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating subject");
                return StatusCode(500, new ApiResponse(500, "Error updating subject"));
            }
        }

        /// <summary>
        /// Delete subject
        /// </summary>
        [HttpDelete("{id}/subjects/{subjectId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteSubject(string id, string subjectId)
        {
            try
            {
                if (!int.TryParse(subjectId, out int subjectIdInt))
                {
                    return BadRequest(new ApiResponse(400, "Invalid subject ID"));
                }

                var subject = await _context.Subjects
                    .Include(s => s.Orders)
                    .FirstOrDefaultAsync(s => s.Id == subjectIdInt);

                if (subject == null)
                {
                    return NotFound(new ApiResponse(404, "Subject not found"));
                }

                if (subject.Orders.Any())
                {
                    return BadRequest(new ApiResponse(400, "Cannot delete subject with existing orders"));
                }

                _context.Subjects.Remove(subject);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Subject deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting subject");
                return StatusCode(500, new ApiResponse(500, "Error deleting subject"));
            }
        }
    }

    // ==================== DTOs ====================

    public class CreateDepartmentDto
    {
        public string Code { get; set; }
        public string NameAr { get; set; }
        public string NameEn { get; set; }
        public string Description { get; set; }
        public bool? IsActive { get; set; }
        public int? ManagerId { get; set; }
        public List<CreateSubjectDto> Subjects { get; set; }
        public List<AddDepartmentUserDto> Users { get; set; }
    }

    public class UpdateDepartmentDto
    {
        public string Code { get; set; }
        public string NameAr { get; set; }
        public string NameEn { get; set; }
        public string Description { get; set; }
        public bool? IsActive { get; set; }
        public int? ManagerId { get; set; }
    }

    public class CreateSubjectDto
    {
        public string Code { get; set; }
        public string NameAr { get; set; }
        public string NameEn { get; set; }
        public string Description { get; set; }
        public bool? IsActive { get; set; }
    }

    public class UpdateSubjectDto
    {
        public string Code { get; set; }
        public string NameAr { get; set; }
        public string NameEn { get; set; }
        public string Description { get; set; }
        public bool? IsActive { get; set; }
    }

    public class AddDepartmentUserDto
    {
        public int UserId { get; set; }
        public string Position { get; set; }
        public bool? IsHead { get; set; }
        public string Notes { get; set; }
    }

    public class UpdateDepartmentUserDto
    {
        public string Position { get; set; }
        public bool? IsHead { get; set; }
        public string? Notes { get; set; }
    }
}