// This file is temporarily disabled to fix build issues
/*
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.IO;
using Core.Entities.Medical;
using Core.Entities;
using Infrastructure.Identity;
using HtmlAgilityPack;
using System.Text.RegularExpressions;
using System.Text.Json;
using StackExchange.Redis;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;

namespace API.Data
{
    public static class SeedData
    {
        public static async Task Initialize(IServiceProvider serviceProvider, string connectionString = null)
        {
            // Try to get the connection string from service provider if not provided
            if (string.IsNullOrEmpty(connectionString))
            {
                try 
                {
                    var configuration = serviceProvider.GetService(typeof(IConfiguration)) as IConfiguration;
                    connectionString = configuration?.GetConnectionString("DefaultConnection");
                }
                catch
                {
                    // Use a fallback connection string if can't get from service provider
                    connectionString = "Server=(localdb)\\mssqllocaldb;Database=MedisoftDb;Trusted_Connection=True;MultipleActiveResultSets=true";
                }
            }

            // Create the context with the connection string
            var optionsBuilder = new DbContextOptionsBuilder<AppIdentityDbContext>();
            optionsBuilder.UseSqlServer(connectionString);
            
            using var context = new AppIdentityDbContext(optionsBuilder.Options);

            if (await context.CategoryServices.AnyAsync())
            {
                return; // DB has been seeded
            }

            // Seed Categories
            var categories = new List<CategoryService>
            {
                new CategoryService
                {
                    Name = "Radiology",
                    Description = "Medical imaging services",
                    IsActive = true,
                    DisplayOrder = 1,
                    AllowChildren = true,
                    Icon = "radiology"
                },
                new CategoryService
                {
                    Name = "Laboratory",
                    Description = "Medical laboratory services",
                    IsActive = true,
                    DisplayOrder = 2,
                    AllowChildren = true,
                    Icon = "lab"
                },
                new CategoryService
                {
                    Name = "Consultation",
                    Description = "Medical consultation services",
                    IsActive = true,
                    DisplayOrder = 3,
                    AllowChildren = true,
                    Icon = "consultation"
                }
            };

            await context.CategoryServices.AddRangeAsync(categories);
            await context.SaveChangesAsync();

            // Get the created categories
            var radiologyCategory = await context.CategoryServices.FirstOrDefaultAsync(c => c.Name == "Radiology");
            var labCategory = await context.CategoryServices.FirstOrDefaultAsync(c => c.Name == "Laboratory");
            var consultationCategory = await context.CategoryServices.FirstOrDefaultAsync(c => c.Name == "Consultation");

            // Add subcategories
            var subcategories = new List<CategoryService>
            {
                new CategoryService
                {
                    Name = "X-Ray",
                    Description = "X-Ray imaging services",
                    IsActive = true,
                    DisplayOrder = 1,
                    ParentId = radiologyCategory.Id,
                    AllowChildren = false,
                    Icon = "xray"
                },
                new CategoryService
                {
                    Name = "MRI",
                    Description = "Magnetic Resonance Imaging",
                    IsActive = true,
                    DisplayOrder = 2,
                    ParentId = radiologyCategory.Id,
                    AllowChildren = false,
                    Icon = "mri"
                },
                new CategoryService
                {
                    Name = "Blood Tests",
                    Description = "Blood analysis services",
                    IsActive = true,
                    DisplayOrder = 1,
                    ParentId = labCategory.Id,
                    AllowChildren = false,
                    Icon = "blood"
                },
                new CategoryService
                {
                    Name = "General Consultation",
                    Description = "General medical consultation",
                    IsActive = true,
                    DisplayOrder = 1,
                    ParentId = consultationCategory.Id,
                    AllowChildren = false,
                    Icon = "general"
                }
            };

            await context.CategoryServices.AddRangeAsync(subcategories);
            await context.SaveChangesAsync();

            // Get the created subcategories
            var xrayCategory = await context.CategoryServices.FirstOrDefaultAsync(c => c.Name == "X-Ray");
            var mriCategory = await context.CategoryServices.FirstOrDefaultAsync(c => c.Name == "MRI");
            var bloodTestCategory = await context.CategoryServices.FirstOrDefaultAsync(c => c.Name == "Blood Tests");
            var generalConsultCategory = await context.CategoryServices.FirstOrDefaultAsync(c => c.Name == "General Consultation");

            // Add sample services
            var services = new List<MedicalService>
            {
                new MedicalService
                {
                    Name = "Chest X-Ray",
                    Description = "Standard chest X-Ray examination",
                    CategoryId = xrayCategory.Id,
                    IsActive = true,
                    Prices = new List<ServicePrice>
                    {
                        new ServicePrice { 
                            PatientType = PatientType.Citizen, 
                            Price = 50, 
                            DoctorAmount = 70, 
                            DoctorPaymentType = PaymentCalculationType.Percentage,
                            CenterPercentage = 30 
                        },
                        new ServicePrice { 
                            PatientType = PatientType.Insurance, 
                            Price = 75, 
                            DoctorAmount = 65, 
                            DoctorPaymentType = PaymentCalculationType.Percentage,
                            CenterPercentage = 35 
                        },
                        new ServicePrice { 
                            PatientType = PatientType.Company, 
                            Price = 100, 
                            DoctorAmount = 60, 
                            DoctorPaymentType = PaymentCalculationType.Percentage,
                            CenterPercentage = 40 
                        },
                        new ServicePrice { 
                            PatientType = PatientType.Foreigner, 
                            Price = 150, 
                            DoctorAmount = 75, 
                            DoctorPaymentType = PaymentCalculationType.Percentage,
                            CenterPercentage = 25 
                        }
                    }
                },
                new MedicalService
                {
                    Name = "Brain MRI",
                    Description = "Magnetic Resonance Imaging of the brain",
                    CategoryId = mriCategory.Id,
                    IsActive = true,
                    Prices = new List<ServicePrice>
                    {
                        new ServicePrice { 
                            PatientType = PatientType.Citizen, 
                            Price = 300, 
                            DoctorAmount = 80, 
                            DoctorPaymentType = PaymentCalculationType.Percentage,
                            CenterPercentage = 20 
                        },
                        new ServicePrice { 
                            PatientType = PatientType.Insurance, 
                            Price = 400, 
                            DoctorAmount = 75, 
                            DoctorPaymentType = PaymentCalculationType.Percentage,
                            CenterPercentage = 25 
                        },
                        new ServicePrice { 
                            PatientType = PatientType.Company, 
                            Price = 500, 
                            DoctorAmount = 70, 
                            DoctorPaymentType = PaymentCalculationType.Percentage,
                            CenterPercentage = 30 
                        },
                        new ServicePrice { 
                            PatientType = PatientType.Foreigner, 
                            Price = 600, 
                            DoctorAmount = 85, 
                            DoctorPaymentType = PaymentCalculationType.Percentage,
                            CenterPercentage = 15 
                        }
                    }
                },
                new MedicalService
                {
                    Name = "Complete Blood Count",
                    Description = "Full blood count analysis",
                    CategoryId = bloodTestCategory.Id,
                    IsActive = true,
                    Prices = new List<ServicePrice>
                    {
                        new ServicePrice { 
                            PatientType = PatientType.Citizen, 
                            Price = 30, 
                            DoctorAmount = 60, 
                            DoctorPaymentType = PaymentCalculationType.Percentage,
                            CenterPercentage = 40 
                        },
                        new ServicePrice { 
                            PatientType = PatientType.Insurance, 
                            Price = 40, 
                            DoctorAmount = 55, 
                            DoctorPaymentType = PaymentCalculationType.Percentage,
                            CenterPercentage = 45 
                        },
                        new ServicePrice { 
                            PatientType = PatientType.Company, 
                            Price = 50, 
                            DoctorAmount = 50, 
                            DoctorPaymentType = PaymentCalculationType.Percentage,
                            CenterPercentage = 50 
                        },
                        new ServicePrice { 
                            PatientType = PatientType.Foreigner, 
                            Price = 60, 
                            DoctorAmount = 65, 
                            DoctorPaymentType = PaymentCalculationType.Percentage,
                            CenterPercentage = 35 
                        }
                    }
                },
                new MedicalService
                {
                    Name = "General Medical Consultation",
                    Description = "Standard medical consultation",
                    CategoryId = generalConsultCategory.Id,
                    IsActive = true,
                    Prices = new List<ServicePrice>
                    {
                        new ServicePrice { 
                            PatientType = PatientType.Citizen, 
                            Price = 100, 
                            DoctorAmount = 80, 
                            DoctorPaymentType = PaymentCalculationType.Percentage,
                            CenterPercentage = 20 
                        },
                        new ServicePrice { 
                            PatientType = PatientType.Insurance, 
                            Price = 120, 
                            DoctorAmount = 75, 
                            DoctorPaymentType = PaymentCalculationType.Percentage,
                            CenterPercentage = 25 
                        },
                        new ServicePrice { 
                            PatientType = PatientType.Company, 
                            Price = 150, 
                            DoctorAmount = 70, 
                            DoctorPaymentType = PaymentCalculationType.Percentage,
                            CenterPercentage = 30 
                        },
                        new ServicePrice { 
                            PatientType = PatientType.Foreigner, 
                            Price = 200, 
                            DoctorAmount = 85, 
                            DoctorPaymentType = PaymentCalculationType.Percentage,
                            CenterPercentage = 15 
                        }
                    }
                }
            };

            await context.MedicalServices.AddRangeAsync(services);
            await context.SaveChangesAsync();
        }
    }
}
*/ 