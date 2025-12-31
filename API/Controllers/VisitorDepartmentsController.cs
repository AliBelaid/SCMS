using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Errors;
using Core.Dtos.VisitorManagement;
using Core.Entities.VisitorManagement;
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
    public class VisitorDepartmentsController : BaseController
    {
        private readonly AppIdentityDbContext _context;
        private readonly ILogger<VisitorDepartmentsController> _logger;

        public VisitorDepartmentsController(
            AppIdentityDbContext context,
            ILogger<VisitorDepartmentsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Get all active visitor departments
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DepartmentDto>>> GetDepartments()
        {
            try
            {
                var departments = await _context.VisitorDepartments
                    .Where(d => d.IsActive)
                    .OrderBy(d => d.Name)
                    .Select(d => new DepartmentDto
                    {
                        Id = d.Id,
                        Name = d.Name
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
        /// Get department by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<DepartmentDto>> GetDepartment(int id)
        {
            try
            {
                var department = await _context.VisitorDepartments
                    .Where(d => d.Id == id && d.IsActive)
                    .Select(d => new DepartmentDto
                    {
                        Id = d.Id,
                        Name = d.Name
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
        public async Task<ActionResult<DepartmentDto>> CreateDepartment([FromBody] Core.Dtos.VisitorManagement.CreateDepartmentDto createDto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(createDto.Name))
                {
                    return BadRequest(new ApiResponse(400, "Department name is required"));
                }

                // Check if department with same name already exists
                var departmentName = createDto.Name!;
                var exists = await _context.VisitorDepartments
                    .AnyAsync(d => d.Name.ToLower() == departmentName.ToLower());
                
                if (exists)
                {
                    return BadRequest(new ApiResponse(400, "Department with this name already exists"));
                }

                var department = new Core.Entities.VisitorManagement.VisitorDepartment
                {
                    Name = departmentName.Trim(),
                    Description = createDto.Description?.Trim(),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.VisitorDepartments.Add(department);
                await _context.SaveChangesAsync();

                var departmentDto = new DepartmentDto
                {
                    Id = department.Id,
                    Name = department.Name
                };

                _logger.LogInformation($"Department created: {department.Id} - {department.Name}");
                return CreatedAtAction(nameof(GetDepartment), new { id = department.Id }, departmentDto);
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
        public async Task<ActionResult<DepartmentDto>> UpdateDepartment(int id, [FromBody] Core.Dtos.VisitorManagement.UpdateDepartmentDto updateDto)
        {
            try
            {
                var department = await _context.VisitorDepartments.FindAsync(id);
                if (department == null)
                {
                    return NotFound(new ApiResponse(404, "Department not found"));
                }

                if (string.IsNullOrWhiteSpace(updateDto.Name))
                {
                    return BadRequest(new ApiResponse(400, "Department name is required"));
                }

                // Check if another department with same name already exists
                var departmentName = updateDto.Name!;
                var exists = await _context.VisitorDepartments
                    .AnyAsync(d => d.Id != id && d.Name.ToLower() == departmentName.ToLower());
                
                if (exists)
                {
                    return BadRequest(new ApiResponse(400, "Department with this name already exists"));
                }

                department.Name = departmentName.Trim();
                if (updateDto.Description != null)
                {
                    department.Description = updateDto.Description.Trim();
                }
                if (updateDto.IsActive.HasValue)
                {
                    department.IsActive = updateDto.IsActive.Value;
                }

                await _context.SaveChangesAsync();

                var departmentDto = new DepartmentDto
                {
                    Id = department.Id,
                    Name = department.Name
                };

                _logger.LogInformation($"Department updated: {department.Id} - {department.Name}");
                return Ok(departmentDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating department: {id}");
                return StatusCode(500, new ApiResponse(500, "Error updating department"));
            }
        }

        /// <summary>
        /// Delete a department (soft delete - sets IsActive to false)
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteDepartment(int id)
        {
            try
            {
                var department = await _context.VisitorDepartments.FindAsync(id);
                if (department == null)
                {
                    return NotFound(new ApiResponse(404, "Department not found"));
                }

                // Soft delete - set IsActive to false
                department.IsActive = false;
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Department deleted: {department.Id} - {department.Name}");
                return Ok(new ApiResponse(200, "Department deleted successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting department: {id}");
                return StatusCode(500, new ApiResponse(500, "Error deleting department"));
            }
        }

        /// <summary>
        /// Get all departments including inactive (for admin)
        /// </summary>
        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<DepartmentDto>>> GetAllDepartments([FromQuery] bool includeInactive = false)
        {
            try
            {
                var query = _context.VisitorDepartments.AsQueryable();
                
                if (!includeInactive)
                {
                    query = query.Where(d => d.IsActive);
                }

                var departments = await query
                    .OrderBy(d => d.Name)
                    .Select(d => new DepartmentDto
                    {
                        Id = d.Id,
                        Name = d.Name
                    })
                    .ToListAsync();

                return Ok(departments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all departments");
                return StatusCode(500, new ApiResponse(500, "Error retrieving departments"));
            }
        }
    }
}

