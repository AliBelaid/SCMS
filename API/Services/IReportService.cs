using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IReportService
    {
        Task<byte[]> GeneratePdfReportAsync(DataTable data, string reportName, Dictionary<string, string> parameters);
        byte[] GenerateExcelReport(DataTable data, string reportName, Dictionary<string, string> parameters);
    }
} 