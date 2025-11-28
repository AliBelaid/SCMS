using System;
using System.Collections.Generic;
using System.Linq;
using Core.Entities.DocumentManagement;
using Core.Entities.DocumentViewer;
using Core.Entities.Identity;
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

            SeedDepartments(builder);
            SeedSubjects(builder);
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
    }
}
