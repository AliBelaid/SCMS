using System;
using System.Collections.Generic;
using System.Linq;
using Core.Entities;
using Core.Entities.DocumentManagement;
using Core.Entities.DocumentViewer;
using Core.Entities.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

using DocumentOrder = Core.Entities.DocumentManagement.Order;

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
        
        // Client entity
          
        public DbSet<Document> Documents { get; set; }
        public DbSet<DocumentAccess> DocumentAccesses { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Subject> Subjects { get; set; }
        public DbSet<DocumentOrder> Orders { get; set; }
        public DbSet<OrderAttachment> OrderAttachments { get; set; }
        
 
        

    
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Configure Identity relationships
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

       
            
          
            
            // Note: FolderType entity removed - using built-in categories instead


 
    
            
            // Configure Document Viewer entities
            builder.Entity<Document>(entity => {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.FileName).IsRequired();
                entity.Property(e => e.FileType).IsRequired();
                entity.Property(e => e.FilePath).IsRequired();
                entity.Property(e => e.UploadedBy).IsRequired();
                entity.Property(e => e.DateUploaded).IsRequired();
                
                // Configure List<string> properties
                entity.Property(e => e.ExcludedUsers)
                    .HasConversion(
                        v => ConvertStringListToString(v),
                        v => ConvertStringToStringList(v)
                    );
                
                // Configure relationship with AppUser
                entity.HasOne(d => d.UploadedByUser)
                    .WithMany()
                    .HasForeignKey(d => d.UploadedById)
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired();
            });

            // Configure Document Management entities
            builder.Entity<Department>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => e.Code).IsUnique();
                entity.Property(e => e.NameAr).IsRequired().HasMaxLength(200);
                entity.Property(e => e.NameEn).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).HasMaxLength(1000);
                entity.Property(e => e.CreatedBy).HasMaxLength(256);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
            });

            builder.Entity<Subject>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => new { e.DepartmentId, e.Code }).IsUnique();
                entity.Property(e => e.NameAr).IsRequired().HasMaxLength(200);
                entity.Property(e => e.NameEn).IsRequired().HasMaxLength(200);
                entity.Property(e => e.IncomingPrefix).HasMaxLength(20);
                entity.Property(e => e.OutgoingPrefix).HasMaxLength(20);
                entity.Property(e => e.CreatedBy).HasMaxLength(256);

                entity.HasOne(e => e.Department)
                    .WithMany(d => d.Subjects)
                    .HasForeignKey(e => e.DepartmentId)
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();
            });

            builder.Entity<DocumentOrder>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ReferenceNumber).IsRequired().HasMaxLength(100);
                entity.HasIndex(e => e.ReferenceNumber).IsUnique();
                entity.Property(e => e.Type)
                    .HasConversion<string>()
                    .IsRequired();
                entity.Property(e => e.DepartmentCode).HasMaxLength(50);
                entity.Property(e => e.SubjectCode).HasMaxLength(50);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(500);
                entity.Property(e => e.Description).HasMaxLength(2000);
                entity.Property(e => e.Status)
                    .HasConversion<string>()
                    .IsRequired();
                entity.Property(e => e.Priority)
                    .HasConversion<string>()
                    .IsRequired();
                entity.Property(e => e.CreatedBy).HasMaxLength(256);
                entity.Property(e => e.UpdatedBy).HasMaxLength(256);
                entity.Property(e => e.UpdatedAt);
                entity.Property(e => e.DueDate);

                entity.HasOne(e => e.Department)
                    .WithMany()
                    .HasForeignKey(e => e.DepartmentId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired();

                entity.HasOne(e => e.Subject)
                    .WithMany()
                    .HasForeignKey(e => e.SubjectId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired();

                entity.OwnsOne(e => e.Permissions, permissions =>
                {
                    permissions.Property(p => p.CanView)
                        .HasColumnName("PermissionsCanView")
                        .HasConversion(
                            v => ConvertStringListToString(v),
                            v => ConvertStringToStringList(v)
                        );

                    permissions.Property(p => p.CanEdit)
                        .HasColumnName("PermissionsCanEdit")
                        .HasConversion(
                            v => ConvertStringListToString(v),
                            v => ConvertStringToStringList(v)
                        );

                    permissions.Property(p => p.CanDelete)
                        .HasColumnName("PermissionsCanDelete")
                        .HasConversion(
                            v => ConvertStringListToString(v),
                            v => ConvertStringToStringList(v)
                        );

                    permissions.Property(p => p.ExcludedUsers)
                        .HasColumnName("PermissionsExcludedUsers")
                        .HasConversion(
                            v => ConvertStringListToString(v),
                            v => ConvertStringToStringList(v)
                        );

                    permissions.Property(p => p.IsPublic)
                        .HasColumnName("PermissionsIsPublic");
                });
            });

            builder.Entity<OrderAttachment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.FileName).IsRequired().HasMaxLength(255);
                entity.Property(e => e.FileType).IsRequired().HasMaxLength(100);
                entity.Property(e => e.FileUrl).IsRequired().HasMaxLength(1000);
                entity.Property(e => e.UploadedBy).IsRequired().HasMaxLength(256);
                entity.Property(e => e.UploadedAt).IsRequired();
                entity.Property(e => e.FileSize).IsRequired();

                entity.HasOne(e => e.Order)
                    .WithMany(o => o.Attachments)
                    .HasForeignKey(e => e.OrderId)
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();
            });
            
            builder.Entity<DocumentAccess>(entity => {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.DocumentId).IsRequired();
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.GrantedAt).IsRequired();
                entity.Property(e => e.GrantedBy).IsRequired();
                
                // Configure relationships
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
            
    
        
            
      

                // Note: FolderType relationship removed - using built-in categories instead
 
           
                
        
        }
        
        private static List<string> ConvertStringToStringList(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return new List<string>();
            
            // Handle different possible formats
            value = value.Trim();
            
            // Remove JSON array brackets if present
            if (value.StartsWith("[") && value.EndsWith("]"))
            {
                value = value.Substring(1, value.Length - 2);
            }
            else if (value.StartsWith("[") && !value.EndsWith("]"))
            {
                // Handle incomplete JSON arrays like "[tax_returns"
                value = value.Substring(1);
            }
            
            // Split by comma and clean up
            return value.Split(new char[] { ',', ' ' }, StringSplitOptions.RemoveEmptyEntries)
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

            var list = values.Where(v => !string.IsNullOrWhiteSpace(v))
                             .Select(v => v.Trim())
                             .ToList();

            return list.Any() ? string.Join(',', list) : string.Empty;
        }
    }
}