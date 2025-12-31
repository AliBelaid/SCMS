using System;
using System.Collections.Generic;
using System.Linq;
using Core.Entities.DocumentManagement;
using Core.Entities.DocumentViewer;
using Core.Entities.Identity;
using Core.Entities.VisitorManagement;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Identity
{
    public class AppIdentityDbContext : IdentityDbContext<AppUser, AppRole, int,
        IdentityUserClaim<int>, AppUserRole, IdentityUserLogin<int>,
        IdentityRoleClaim<int>, IdentityUserToken<int>>
    {
        public AppIdentityDbContext(DbContextOptions<AppIdentityDbContext> options)
            : base(options)
        {
        }

        // Legacy Document Viewer entities
        public DbSet<Document> Documents { get; set; }
        public DbSet<DocumentAccess> DocumentAccesses { get; set; }

        // Document Management System entities
        public DbSet<Order> Orders { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Subject> Subjects { get; set; }
        public DbSet<OrderAttachment> OrderAttachments { get; set; }
        public DbSet<OrderHistory> OrderHistories { get; set; }
        public DbSet<OrderPermission> OrderPermissions { get; set; }
        public DbSet<UserPermission> UserPermissions { get; set; }
        public DbSet<DepartmentUser> DepartmentUsers { get; set; }
        public DbSet<OrderDepartmentAccess> DepartmentAccesses { get; set; }
        public DbSet<OrderUserException> UserExceptions { get; set; }
        public DbSet<ArchivedOrder> ArchivedOrders { get; set; }
        public DbSet<OrderActivityLog> OrderActivityLogs { get; set; }

        // Visitor Management System entities
        public DbSet<Visitor> Visitors { get; set; }
        public DbSet<Visit> Visits { get; set; }
        public DbSet<VisitorDepartment> VisitorDepartments { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<EmployeeAttendance> EmployeeAttendances { get; set; }

        private static readonly ValueComparer<List<string>> StringListValueComparer =
            new(
                (left, right) => (left ?? new List<string>()).SequenceEqual(right ?? new List<string>()),
                list => list == null
                    ? 0
                    : list.Aggregate(
                        0,
                        (current, item) => HashCode.Combine(
                            current,
                            StringComparer.OrdinalIgnoreCase.GetHashCode(item ?? string.Empty))),
                list => list == null ? new List<string>() : list.ToList()
            );

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            ConfigureIdentity(builder);
            ConfigureLegacyDocumentViewer(builder);
            ConfigureDepartments(builder);
            ConfigureSubjects(builder);
            ConfigureOrders(builder);
            ConfigureOrderAttachments(builder);
            ConfigureOrderHistories(builder);
            ConfigureOrderPermissions(builder);
            ConfigureDepartmentUsers(builder);
            ConfigureOrderDepartmentAccesses(builder);
            ConfigureOrderUserExceptions(builder);
            ConfigureArchivedOrders(builder);
            ConfigureOrderActivityLogs(builder);
            
            // Visitor Management
            ConfigureVisitors(builder);
            ConfigureVisits(builder);
            ConfigureVisitorDepartments(builder);
            ConfigureEmployees(builder);
            ConfigureEmployeeAttendances(builder);

            SeedDepartments(builder);
            SeedSubjects(builder);
            SeedVisitorDepartments(builder);
            SeedVisitors(builder);
            // Note: SeedVisits moved to AppIdentityDbContextSeed to run after users are created
        }

        private static void ConfigureIdentity(ModelBuilder builder)
        {
            builder.Entity<AppUserRole>(userRole =>
            {
                userRole.HasKey(ur => new { ur.UserId, ur.RoleId });

                userRole.HasOne(ur => ur.Role)
                    .WithMany(r => r.UserRoles)
                    .HasForeignKey(ur => ur.RoleId)
                    .IsRequired();

                userRole.HasOne(ur => ur.User)
                    .WithMany(u => u.UserRoles)
                    .HasForeignKey(ur => ur.UserId)
                    .IsRequired();
            });
        }

        private static void ConfigureLegacyDocumentViewer(ModelBuilder builder)
        {
            builder.Entity<Document>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.FileName).IsRequired();
                entity.Property(e => e.FileType).IsRequired();
                entity.Property(e => e.FilePath).IsRequired();
                entity.Property(e => e.UploadedBy).IsRequired();
                entity.Property(e => e.DateUploaded).IsRequired();

                var excludedUsersProperty = entity.Property(e => e.ExcludedUsers);
                ConfigureStringListProperty(excludedUsersProperty);

                entity.HasOne(d => d.UploadedByUser)
                    .WithMany()
                    .HasForeignKey(d => d.UploadedById)
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired();
            });

            builder.Entity<DocumentAccess>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.DocumentId).IsRequired();
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.GrantedAt).IsRequired();
                entity.Property(e => e.GrantedBy).IsRequired();

                entity.HasOne(da => da.Document)
                    .WithMany()
                    .HasForeignKey(da => da.DocumentId)
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();

                entity.HasOne(da => da.User)
                    .WithMany()
                    .HasForeignKey(da => da.UserId)
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();
            });
        }

        private static void ConfigureDepartments(ModelBuilder builder)
        {
            builder.Entity<Department>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Code).IsRequired().HasMaxLength(10);
                entity.Property(e => e.NameAr).IsRequired().HasMaxLength(100);
                entity.Property(e => e.NameEn).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);

                entity.HasIndex(e => e.Code).IsUnique();

                entity.HasOne(d => d.Manager)
                    .WithMany()
                    .HasForeignKey(d => d.ManagerId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(d => d.ParentDepartment)
                    .WithMany(d => d.SubDepartments)
                    .HasForeignKey(d => d.ParentDepartmentId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }

        private static void ConfigureSubjects(ModelBuilder builder)
        {
            builder.Entity<Subject>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Code).IsRequired().HasMaxLength(10);
                entity.Property(e => e.NameAr).IsRequired().HasMaxLength(100);
                entity.Property(e => e.NameEn).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);

                entity.HasIndex(e => new { e.Code, e.DepartmentId }).IsUnique();

                entity.HasOne(s => s.Department)
                    .WithMany(d => d.Subjects)
                    .HasForeignKey(s => s.DepartmentId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }

        private static void ConfigureOrders(ModelBuilder builder)
        {
            builder.Entity<Order>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ReferenceNumber).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).HasMaxLength(1000);
                entity.Property(e => e.Notes).HasMaxLength(500);

                entity.HasIndex(e => e.ReferenceNumber).IsUnique();
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.Type);

                entity.HasOne(o => o.Department)
                    .WithMany(d => d.Orders)
                    .HasForeignKey(o => o.DepartmentId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(o => o.Subject)
                    .WithMany(s => s.Orders)
                    .HasForeignKey(o => o.SubjectId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(o => o.CreatedBy)
                    .WithMany()
                    .HasForeignKey(o => o.CreatedById)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(o => o.UpdatedBy)
                    .WithMany()
                    .HasForeignKey(o => o.UpdatedById)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(o => o.AssignedTo)
                    .WithMany()
                    .HasForeignKey(o => o.AssignedToId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(o => o.ArchivedBy)
                    .WithMany()
                    .HasForeignKey(o => o.ArchivedById)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }

        private static void ConfigureOrderAttachments(ModelBuilder builder)
        {
            builder.Entity<OrderAttachment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.FileName).IsRequired().HasMaxLength(255);
                entity.Property(e => e.FileType).IsRequired().HasMaxLength(50);
                entity.Property(e => e.FilePath).IsRequired().HasMaxLength(500);
                entity.Property(e => e.Description).HasMaxLength(500);

                entity.HasIndex(e => e.OrderId);

                entity.HasOne(a => a.Order)
                    .WithMany(o => o.Attachments)
                    .HasForeignKey(a => a.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(a => a.UploadedBy)
                    .WithMany()
                    .HasForeignKey(a => a.UploadedById)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }

        private static void ConfigureOrderHistories(ModelBuilder builder)
        {
            builder.Entity<OrderHistory>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Action).IsRequired().HasMaxLength(100);
                entity.Property(e => e.OldValue).HasMaxLength(100);
                entity.Property(e => e.NewValue).HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.IpAddress).HasMaxLength(50);
                entity.Property(e => e.UserAgent).HasMaxLength(200);

                entity.HasIndex(e => new { e.OrderId, e.PerformedAt });

                entity.HasOne(h => h.Order)
                    .WithMany(o => o.History)
                    .HasForeignKey(h => h.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(h => h.PerformedBy)
                    .WithMany()
                    .HasForeignKey(h => h.PerformedById)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }

        private static void ConfigureOrderPermissions(ModelBuilder builder)
        {
            builder.Entity<OrderPermission>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Notes).HasMaxLength(500);

                entity.HasIndex(e => new { e.OrderId, e.UserId, e.PermissionType }).IsUnique();
                entity.HasIndex(e => e.UserId);

                entity.HasOne(p => p.Order)
                    .WithMany(o => o.Permissions)
                    .HasForeignKey(p => p.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(p => p.User)
                    .WithMany()
                    .HasForeignKey(p => p.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(p => p.GrantedBy)
                    .WithMany()
                    .HasForeignKey(p => p.GrantedById)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure UserPermission to avoid cascade delete conflicts
            builder.Entity<UserPermission>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Notes).HasMaxLength(500);

                entity.HasIndex(e => new { e.OrderId, e.UserId }).IsUnique();
                entity.HasIndex(e => e.UserId);

                entity.HasOne(p => p.Order)
                    .WithMany()
                    .HasForeignKey(p => p.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(p => p.User)
                    .WithMany()
                    .HasForeignKey(p => p.UserId)
                    .OnDelete(DeleteBehavior.Restrict);  // Changed to Restrict to avoid cascade conflict

                entity.HasOne(p => p.GrantedBy)
                    .WithMany()
                    .HasForeignKey(p => p.GrantedById)
                    .OnDelete(DeleteBehavior.Restrict);  // Changed to Restrict to avoid cascade conflict
            });
        }

        private static void ConfigureDepartmentUsers(ModelBuilder builder)
        {
            builder.Entity<DepartmentUser>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Position).HasMaxLength(100);
                entity.Property(e => e.Notes).HasMaxLength(500);

                entity.HasIndex(e => new { e.DepartmentId, e.UserId }).IsUnique();
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.IsActive);

                entity.HasOne(du => du.Department)
                    .WithMany(d => d.DepartmentUsers)
                    .HasForeignKey(du => du.DepartmentId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(du => du.User)
                    .WithMany()
                    .HasForeignKey(du => du.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }

        private static void ConfigureOrderDepartmentAccesses(ModelBuilder builder)
        {
            builder.Entity<OrderDepartmentAccess>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Notes).HasMaxLength(500);

                entity.HasIndex(e => new { e.OrderId, e.DepartmentId }).IsUnique();

                entity.HasOne(e => e.Order)
                    .WithMany(o => o.DepartmentAccesses)
                    .HasForeignKey(e => e.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Department)
                    .WithMany(d => d.OrderAccesses)
                    .HasForeignKey(e => e.DepartmentId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.GrantedBy)
                    .WithMany()
                    .HasForeignKey(e => e.GrantedById)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }

        private static void ConfigureOrderUserExceptions(ModelBuilder builder)
        {
            builder.Entity<OrderUserException>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Reason).HasMaxLength(500);

                entity.HasIndex(e => new { e.OrderId, e.UserId }).IsUnique();

                entity.HasOne(e => e.Order)
                    .WithMany(o => o.UserExceptions)
                    .HasForeignKey(e => e.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.CreatedBy)
                    .WithMany()
                    .HasForeignKey(e => e.CreatedById)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }

        private static void ConfigureArchivedOrders(ModelBuilder builder)
        {
            builder.Entity<ArchivedOrder>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ReferenceNumber).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).HasMaxLength(1000);
                entity.Property(e => e.DepartmentName).HasMaxLength(200);
                entity.Property(e => e.SubjectName).HasMaxLength(200);
                entity.Property(e => e.ArchiveReason).HasMaxLength(500);
                entity.Property(e => e.OriginalCreatedByName).HasMaxLength(200);
                entity.Property(e => e.Notes).HasMaxLength(500);

                entity.HasIndex(e => e.OriginalOrderId);
                entity.HasIndex(e => e.ArchivedAt);

                entity.HasOne(e => e.OriginalOrder)
                    .WithMany()
                    .HasForeignKey(e => e.OriginalOrderId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.ArchivedBy)
                    .WithMany()
                    .HasForeignKey(e => e.ArchivedById)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }

        private static void ConfigureOrderActivityLogs(ModelBuilder builder)
        {
            builder.Entity<OrderActivityLog>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.UserName).IsRequired().HasMaxLength(150);
                entity.Property(e => e.UserCode).HasMaxLength(50);
                entity.Property(e => e.ControllerName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.ActionName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.HttpMethod).IsRequired().HasMaxLength(10);
                entity.Property(e => e.Path).IsRequired().HasMaxLength(500);
                entity.Property(e => e.QueryString).HasMaxLength(500);
                entity.Property(e => e.Summary).HasMaxLength(500);
                entity.Property(e => e.PayloadSnapshot).HasColumnType("nvarchar(max)");
                entity.Property(e => e.IpAddress).HasMaxLength(50);
                entity.Property(e => e.UserAgent).HasMaxLength(512);

                entity.HasIndex(e => e.OccurredAt);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.OrderId);

                entity.HasOne(e => e.Order)
                    .WithMany()
                    .HasForeignKey(e => e.OrderId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }

        private static void SeedDepartments(ModelBuilder builder)
        {
            var seedTimestamp = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);

            builder.Entity<Department>().HasData(
                new Department
                {
                    Id = 1,
                    Code = "HR",
                    NameAr = "الموارد البشرية",
                    NameEn = "Human Resources",
                    Description = "Human Resources Department",
                    IsActive = true,
                    CreatedAt = seedTimestamp
                },
                new Department
                {
                    Id = 2,
                    Code = "FIN",
                    NameAr = "المالية",
                    NameEn = "Finance",
                    Description = "Finance Department",
                    IsActive = true,
                    CreatedAt = seedTimestamp
                },
                new Department
                {
                    Id = 3,
                    Code = "OPS",
                    NameAr = "العمليات",
                    NameEn = "Operations",
                    Description = "Operations Department",
                    IsActive = true,
                    CreatedAt = seedTimestamp
                }
            );
        }

        private static void SeedSubjects(ModelBuilder builder)
        {
            var seedTimestamp = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);

            builder.Entity<Subject>().HasData(
                new Subject { Id = 1, Code = "REC", NameAr = "التوظيف", NameEn = "Recruitment", DepartmentId = 1, IsActive = true, CreatedAt = seedTimestamp },
                new Subject { Id = 2, Code = "TRN", NameAr = "التدريب", NameEn = "Training", DepartmentId = 1, IsActive = true, CreatedAt = seedTimestamp },
                new Subject { Id = 3, Code = "LEV", NameAr = "الإجازات", NameEn = "Leave", DepartmentId = 1, IsActive = true, CreatedAt = seedTimestamp },
                new Subject { Id = 4, Code = "SAL", NameAr = "الرواتب", NameEn = "Salaries", DepartmentId = 1, IsActive = true, CreatedAt = seedTimestamp },

                new Subject { Id = 5, Code = "BDG", NameAr = "الميزانية", NameEn = "Budget", DepartmentId = 2, IsActive = true, CreatedAt = seedTimestamp },
                new Subject { Id = 6, Code = "EXP", NameAr = "المصروفات", NameEn = "Expenses", DepartmentId = 2, IsActive = true, CreatedAt = seedTimestamp },
                new Subject { Id = 7, Code = "INV", NameAr = "الفواتير", NameEn = "Invoices", DepartmentId = 2, IsActive = true, CreatedAt = seedTimestamp },
                new Subject { Id = 8, Code = "AUD", NameAr = "التدقيق", NameEn = "Audit", DepartmentId = 2, IsActive = true, CreatedAt = seedTimestamp },

                new Subject { Id = 9, Code = "PRJ", NameAr = "المشاريع", NameEn = "Projects", DepartmentId = 3, IsActive = true, CreatedAt = seedTimestamp },
                new Subject { Id = 10, Code = "QUA", NameAr = "الجودة", NameEn = "Quality", DepartmentId = 3, IsActive = true, CreatedAt = seedTimestamp },
                new Subject { Id = 11, Code = "LOG", NameAr = "اللوجستيات", NameEn = "Logistics", DepartmentId = 3, IsActive = true, CreatedAt = seedTimestamp },
                new Subject { Id = 12, Code = "MTN", NameAr = "الصيانة", NameEn = "Maintenance", DepartmentId = 3, IsActive = true, CreatedAt = seedTimestamp }
            );
        }

        private static List<string> ConvertStringToStringList(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return new List<string>();
            }

            value = value.Trim();

            if (value.StartsWith("[") && value.EndsWith("]"))
            {
                value = value.Substring(1, value.Length - 2);
            }
            else if (value.StartsWith("[") && !value.EndsWith("]"))
            {
                value = value.Substring(1);
            }

            return value.Split(new[] { ',', ' ' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.Trim().Replace("\"", ""))
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .ToList();
        }

        private static string ConvertStringListToString(IEnumerable<string> values)
        {
            if (values == null)
            {
                return string.Empty;
            }

            var list = values
                .Where(v => !string.IsNullOrWhiteSpace(v))
                .Select(v => v.Trim())
                .ToList();

            return list.Any() ? string.Join(',', list) : string.Empty;
        }

        private static void ConfigureStringListProperty(PropertyBuilder<List<string>> propertyBuilder)
        {
            propertyBuilder.HasConversion(
                v => ConvertStringListToString(v),
                v => ConvertStringToStringList(v)
            );

            propertyBuilder.Metadata.SetValueComparer(StringListValueComparer);
        }

        private static void ConfigureVisitors(ModelBuilder builder)
        {
            builder.Entity<Visitor>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.FullName).IsRequired().HasMaxLength(200);
                entity.Property(e => e.NationalId).HasMaxLength(50);
                entity.Property(e => e.Phone).HasMaxLength(50);
                entity.Property(e => e.Company).HasMaxLength(200);
                entity.Property(e => e.MedicalNotes).HasMaxLength(500);
                entity.Property(e => e.PersonImageUrl).HasMaxLength(500);
                entity.Property(e => e.IdCardImageUrl).HasMaxLength(500);

                entity.HasIndex(e => e.NationalId);
                entity.HasIndex(e => e.Phone);
            });
        }

        private static void ConfigureVisits(ModelBuilder builder)
        {
            builder.Entity<Visit>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.VisitNumber).IsRequired().HasMaxLength(50);
                entity.Property(e => e.VisitorName).IsRequired().HasMaxLength(200);
                entity.Property(e => e.CarPlate).HasMaxLength(20);
                entity.Property(e => e.CarImageUrl).HasMaxLength(500);
                entity.Property(e => e.DepartmentName).IsRequired().HasMaxLength(200);
                entity.Property(e => e.EmployeeToVisit).IsRequired().HasMaxLength(200);
                entity.Property(e => e.VisitReason).HasMaxLength(500);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
                entity.Property(e => e.CreatedByUserName).IsRequired().HasMaxLength(200);

                entity.HasIndex(e => e.VisitNumber).IsUnique();
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CheckInAt);

                entity.HasOne(v => v.Visitor)
                    .WithMany()
                    .HasForeignKey(v => v.VisitorId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(v => v.CreatedByUser)
                    .WithMany()
                    .HasForeignKey(v => v.CreatedByUserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }

        private static void ConfigureVisitorDepartments(ModelBuilder builder)
        {
            builder.Entity<VisitorDepartment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.HasIndex(e => e.Name).IsUnique();
            });
        }

        private static void ConfigureEmployees(ModelBuilder builder)
        {
            builder.Entity<Employee>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.EmployeeId).IsRequired().HasMaxLength(50);
                entity.Property(e => e.EmployeeName).IsRequired().HasMaxLength(200);
                entity.Property(e => e.CardImageUrl).HasMaxLength(500);
                entity.Property(e => e.FaceImageUrl).HasMaxLength(500);

                entity.HasIndex(e => e.EmployeeId).IsUnique();

                entity.HasOne(e => e.Department)
                    .WithMany()
                    .HasForeignKey(e => e.DepartmentId)
                    .OnDelete(DeleteBehavior.SetNull);
            });
        }

        private static void ConfigureEmployeeAttendances(ModelBuilder builder)
        {
            builder.Entity<EmployeeAttendance>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Notes).HasMaxLength(500);

                entity.HasIndex(e => e.EmployeeId);
                entity.HasIndex(e => e.CheckInTime);

                entity.HasOne(e => e.Employee)
                    .WithMany()
                    .HasForeignKey(e => e.EmployeeId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }

        private static void SeedVisitorDepartments(ModelBuilder builder)
        {
            var seedTimestamp = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);

            builder.Entity<VisitorDepartment>().HasData(
                new VisitorDepartment
                {
                    Id = 1,
                    Name = "Human Resources",
                    Description = "HR Department",
                    IsActive = true,
                    CreatedAt = seedTimestamp
                },
                new VisitorDepartment
                {
                    Id = 2,
                    Name = "Finance",
                    Description = "Finance Department",
                    IsActive = true,
                    CreatedAt = seedTimestamp
                },
                new VisitorDepartment
                {
                    Id = 3,
                    Name = "Operations",
                    Description = "Operations Department",
                    IsActive = true,
                    CreatedAt = seedTimestamp
                },
                new VisitorDepartment
                {
                    Id = 4,
                    Name = "IT",
                    Description = "IT Department",
                    IsActive = true,
                    CreatedAt = seedTimestamp
                },
                new VisitorDepartment
                {
                    Id = 5,
                    Name = "Sales",
                    Description = "Sales Department",
                    IsActive = true,
                    CreatedAt = seedTimestamp
                }
            );
        }

        private static void SeedVisitors(ModelBuilder builder)
        {
            var seedTimestamp = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);

            builder.Entity<Visitor>().HasData(
                new Visitor
                {
                    Id = 1,
                    FullName = "Ahmed Ali Hassan",
                    NationalId = "2850123456789",
                    Phone = "0501234567",
                    Company = "Tech Solutions Ltd",
                    CreatedAt = seedTimestamp,
                    UpdatedAt = seedTimestamp
                },
                new Visitor
                {
                    Id = 2,
                    FullName = "Fatima Mohammed Ibrahim",
                    NationalId = "2920987654321",
                    Phone = "0559876543",
                    Company = "Global Consultants",
                    CreatedAt = seedTimestamp,
                    UpdatedAt = seedTimestamp
                },
                new Visitor
                {
                    Id = 3,
                    FullName = "Omar Abdullah Khalid",
                    Phone = "0551112233",
                    Company = "Business Partners Inc",
                    CreatedAt = seedTimestamp,
                    UpdatedAt = seedTimestamp
                },
                new Visitor
                {
                    Id = 4,
                    FullName = "Layla Hassan Ahmed",
                    NationalId = "2881234567890",
                    Phone = "0503334455",
                    CreatedAt = seedTimestamp,
                    UpdatedAt = seedTimestamp
                },
                new Visitor
                {
                    Id = 5,
                    FullName = "Khalid Yousef Mansour",
                    Phone = "0555556666",
                    Company = "Innovation Hub",
                    CreatedAt = seedTimestamp,
                    UpdatedAt = seedTimestamp
                }
            );
        }

        private static void SeedVisits(ModelBuilder builder)
        {
            var seedTimestamp = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            
            // Note: User IDs will be created by Identity - typically Admin=1, Member1=2, Member2=3, Member3=4
            // But we'll use a safe assumption that admin user exists with ID 1
            // In production, this should be handled more carefully or visits seeded after users are created

            builder.Entity<Visit>().HasData(
                // Completed visit - Ahmed visiting HR (yesterday)
                new Visit
                {
                    Id = 1,
                    VisitNumber = "V20250106-0001",
                    VisitorId = 1,
                    VisitorName = "Ahmed Ali Hassan",
                    CarPlate = "ABC-1234",
                    DepartmentId = 1,
                    DepartmentName = "Human Resources",
                    EmployeeToVisit = "Mohammed Abdullah",
                    VisitReason = "Job interview",
                    ExpectedDurationHours = 2,
                    Status = "completed",
                    CheckInAt = seedTimestamp.AddDays(-1).AddHours(9),
                    CheckOutAt = seedTimestamp.AddDays(-1).AddHours(11),
                    CreatedByUserId = 1,
                    CreatedByUserName = "ADMIN001",
                    CreatedAt = seedTimestamp.AddDays(-1).AddHours(9),
                    UpdatedAt = seedTimestamp.AddDays(-1).AddHours(11)
                },
                
                // Completed visit - Fatima visiting Finance
                new Visit
                {
                    Id = 2,
                    VisitNumber = "V20250106-0002",
                    VisitorId = 2,
                    VisitorName = "Fatima Mohammed Ibrahim",
                    DepartmentId = 2,
                    DepartmentName = "Finance",
                    EmployeeToVisit = "Sara Ahmed",
                    VisitReason = "Budget consultation",
                    ExpectedDurationHours = 3,
                    Status = "completed",
                    CheckInAt = seedTimestamp.AddDays(-1).AddHours(10),
                    CheckOutAt = seedTimestamp.AddDays(-1).AddHours(13),
                    CreatedByUserId = 1,
                    CreatedByUserName = "ADMIN001",
                    CreatedAt = seedTimestamp.AddDays(-1).AddHours(10),
                    UpdatedAt = seedTimestamp.AddDays(-1).AddHours(13)
                },
                
                // Ongoing visit - Omar visiting IT
                new Visit
                {
                    Id = 3,
                    VisitNumber = "V20250107-0001",
                    VisitorId = 3,
                    VisitorName = "Omar Abdullah Khalid",
                    CarPlate = "XYZ-5678",
                    DepartmentId = 4,
                    DepartmentName = "IT",
                    EmployeeToVisit = "Khalid Hassan",
                    VisitReason = "System demonstration",
                    ExpectedDurationHours = 4,
                    Status = "ongoing",
                    CheckInAt = seedTimestamp.AddHours(-2),
                    CreatedByUserId = 1,
                    CreatedByUserName = "ADMIN001",
                    CreatedAt = seedTimestamp.AddHours(-2),
                    UpdatedAt = seedTimestamp.AddHours(-2)
                },
                
                // Ongoing visit - Layla visiting Sales
                new Visit
                {
                    Id = 4,
                    VisitNumber = "V20250107-0002",
                    VisitorId = 4,
                    VisitorName = "Layla Hassan Ahmed",
                    DepartmentId = 5,
                    DepartmentName = "Sales",
                    EmployeeToVisit = "Noor Ibrahim",
                    VisitReason = "Product presentation",
                    ExpectedDurationHours = 2,
                    Status = "ongoing",
                    CheckInAt = seedTimestamp.AddHours(-1),
                    CreatedByUserId = 1,
                    CreatedByUserName = "ADMIN001",
                    CreatedAt = seedTimestamp.AddHours(-1),
                    UpdatedAt = seedTimestamp.AddHours(-1)
                },
                
                // Completed visit - Khalid visiting Operations (2 days ago)
                new Visit
                {
                    Id = 5,
                    VisitNumber = "V20250105-0001",
                    VisitorId = 5,
                    VisitorName = "Khalid Yousef Mansour",
                    CarPlate = "DEF-9999",
                    DepartmentId = 3,
                    DepartmentName = "Operations",
                    EmployeeToVisit = "Ahmed Youssef",
                    VisitReason = "Operations review meeting",
                    ExpectedDurationHours = 5,
                    Status = "completed",
                    CheckInAt = seedTimestamp.AddDays(-2).AddHours(8),
                    CheckOutAt = seedTimestamp.AddDays(-2).AddHours(13),
                    CreatedByUserId = 1,
                    CreatedByUserName = "ADMIN001",
                    CreatedAt = seedTimestamp.AddDays(-2).AddHours(8),
                    UpdatedAt = seedTimestamp.AddDays(-2).AddHours(13)
                },
                
                // Completed visit - Ahmed 2nd visit to Finance (3 days ago)
                new Visit
                {
                    Id = 6,
                    VisitNumber = "V20250104-0001",
                    VisitorId = 1,
                    VisitorName = "Ahmed Ali Hassan",
                    DepartmentId = 2,
                    DepartmentName = "Finance",
                    EmployeeToVisit = "Sara Ahmed",
                    VisitReason = "Contract discussion",
                    ExpectedDurationHours = 1,
                    Status = "completed",
                    CheckInAt = seedTimestamp.AddDays(-3).AddHours(14),
                    CheckOutAt = seedTimestamp.AddDays(-3).AddHours(15),
                    CreatedByUserId = 1,
                    CreatedByUserName = "ADMIN001",
                    CreatedAt = seedTimestamp.AddDays(-3).AddHours(14),
                    UpdatedAt = seedTimestamp.AddDays(-3).AddHours(15)
                },
                
                // Completed visit - Fatima visiting HR (4 days ago)
                new Visit
                {
                    Id = 7,
                    VisitNumber = "V20250103-0001",
                    VisitorId = 2,
                    VisitorName = "Fatima Mohammed Ibrahim",
                    CarPlate = "LMN-3333",
                    DepartmentId = 1,
                    DepartmentName = "Human Resources",
                    EmployeeToVisit = "Mohammed Abdullah",
                    VisitReason = "Training session",
                    ExpectedDurationHours = 6,
                    Status = "completed",
                    CheckInAt = seedTimestamp.AddDays(-4).AddHours(9),
                    CheckOutAt = seedTimestamp.AddDays(-4).AddHours(15),
                    CreatedByUserId = 1,
                    CreatedByUserName = "ADMIN001",
                    CreatedAt = seedTimestamp.AddDays(-4).AddHours(9),
                    UpdatedAt = seedTimestamp.AddDays(-4).AddHours(15)
                },
                
                // Ongoing visit - Omar 2nd visit to Sales
                new Visit
                {
                    Id = 8,
                    VisitNumber = "V20250107-0003",
                    VisitorId = 3,
                    VisitorName = "Omar Abdullah Khalid",
                    DepartmentId = 5,
                    DepartmentName = "Sales",
                    EmployeeToVisit = "Noor Ibrahim",
                    VisitReason = "Partnership discussion",
                    ExpectedDurationHours = 3,
                    Status = "ongoing",
                    CheckInAt = seedTimestamp.AddMinutes(-30),
                    CreatedByUserId = 1,
                    CreatedByUserName = "ADMIN001",
                    CreatedAt = seedTimestamp.AddMinutes(-30),
                    UpdatedAt = seedTimestamp.AddMinutes(-30)
                },
                
                // Completed visit - Layla visiting IT (5 days ago)
                new Visit
                {
                    Id = 9,
                    VisitNumber = "V20250102-0001",
                    VisitorId = 4,
                    VisitorName = "Layla Hassan Ahmed",
                    DepartmentId = 4,
                    DepartmentName = "IT",
                    EmployeeToVisit = "Khalid Hassan",
                    VisitReason = "Technical support",
                    ExpectedDurationHours = 2,
                    Status = "completed",
                    CheckInAt = seedTimestamp.AddDays(-5).AddHours(10),
                    CheckOutAt = seedTimestamp.AddDays(-5).AddHours(12),
                    CreatedByUserId = 1,
                    CreatedByUserName = "ADMIN001",
                    CreatedAt = seedTimestamp.AddDays(-5).AddHours(10),
                    UpdatedAt = seedTimestamp.AddDays(-5).AddHours(12)
                },
                
                // Completed visit - Khalid visiting HR (6 days ago)
                new Visit
                {
                    Id = 10,
                    VisitNumber = "V20250101-0001",
                    VisitorId = 5,
                    VisitorName = "Khalid Yousef Mansour",
                    CarPlate = "DEF-9999",
                    DepartmentId = 1,
                    DepartmentName = "Human Resources",
                    EmployeeToVisit = "Mohammed Abdullah",
                    VisitReason = "Employee onboarding",
                    ExpectedDurationHours = 4,
                    Status = "completed",
                    CheckInAt = seedTimestamp.AddDays(-6).AddHours(9),
                    CheckOutAt = seedTimestamp.AddDays(-6).AddHours(13),
                    CreatedByUserId = 1,
                    CreatedByUserName = "ADMIN001",
                    CreatedAt = seedTimestamp.AddDays(-6).AddHours(9),
                    UpdatedAt = seedTimestamp.AddDays(-6).AddHours(13)
                }
            );
        }
    }
}
