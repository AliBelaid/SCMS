using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ClosedXML.Excel;
using Microsoft.Extensions.Logging;

namespace API.Services
{
    public class ReportService : IReportService
    {
        private readonly ILogger<ReportService> _logger;

        public ReportService(ILogger<ReportService> logger)
        {
            _logger = logger;
        }

        public async Task<byte[]> GeneratePdfReportAsync(DataTable data, string reportName, Dictionary<string, string> parameters)
        {
            try
            {
                // Using a basic PDF generation approach
                // In a real system, you would use a proper PDF library like iTextSharp or PDFsharp
                using var ms = new MemoryStream();
                using var document = new System.IO.StringWriter();
                
                document.Write("<html><head>");
                document.Write("<style>");
                document.Write("body { font-family: Arial, sans-serif; margin: 20px; }");
                document.Write("h1 { color: #333; text-align: center; }");
                document.Write("table { border-collapse: collapse; width: 100%; }");
                document.Write("th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }");
                document.Write("th { background-color: #f2f2f2; }");
                document.Write(".summary-row { font-weight: bold; background-color: #eaf7ea; }");
                document.Write(".header { margin-bottom: 20px; }");
                document.Write(".header p { margin: 5px 0; }");
                document.Write("</style>");
                document.Write("</head><body>");
                
                // Report title
                document.Write($"<h1>{reportName}</h1>");
                
                // Parameters section
                document.Write("<div class='header'>");
                foreach (var param in parameters)
                {
                    document.Write($"<p><strong>{param.Key}:</strong> {param.Value}</p>");
                }
                document.Write("</div>");
                
                // Table data
                document.Write("<table>");
                
                // Header row
                document.Write("<tr>");
                foreach (DataColumn column in data.Columns)
                {
                    document.Write($"<th>{column.ColumnName}</th>");
                }
                document.Write("</tr>");
                
                // Data rows
                foreach (DataRow row in data.Rows)
                {
                    string rowClass = row["Patient"]?.ToString() == "SUMMARY" ? "class='summary-row'" : "";
                    document.Write($"<tr {rowClass}>");
                    foreach (DataColumn column in data.Columns)
                    {
                        var value = row[column] ?? "";
                        document.Write($"<td>{value}</td>");
                    }
                    document.Write("</tr>");
                }
                
                document.Write("</table>");
                document.Write("</body></html>");
                
                // In a real implementation, you would convert the HTML to PDF here
                // For simplicity, we're just returning the HTML as bytes
                var html = document.ToString();
                var bytes = System.Text.Encoding.UTF8.GetBytes(html);
                
                return bytes;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating PDF report");
                throw;
            }
        }

        public byte[] GenerateExcelReport(DataTable data, string reportName, Dictionary<string, string> parameters)
        {
            try
            {
                using var workbook = new XLWorkbook();
                var worksheet = workbook.Worksheets.Add(reportName);
                
                // Add title
                worksheet.Cell(1, 1).Value = reportName;
                worksheet.Cell(1, 1).Style.Font.Bold = true;
                worksheet.Cell(1, 1).Style.Font.FontSize = 16;
                worksheet.Range(1, 1, 1, data.Columns.Count).Merge();
                
                // Add parameters
                int row = 3;
                foreach (var param in parameters)
                {
                    worksheet.Cell(row, 1).Value = param.Key + ":";
                    worksheet.Cell(row, 1).Style.Font.Bold = true;
                    worksheet.Cell(row, 2).Value = param.Value;
                    worksheet.Range(row, 2, row, data.Columns.Count).Merge();
                    row++;
                }
                
                row += 2; // Add some space
                
                // Add headers
                int col = 1;
                foreach (DataColumn column in data.Columns)
                {
                    worksheet.Cell(row, col).Value = column.ColumnName;
                    worksheet.Cell(row, col).Style.Font.Bold = true;
                    worksheet.Cell(row, col).Style.Fill.BackgroundColor = XLColor.LightGray;
                    col++;
                }
                
                // Add data
                for (int i = 0; i < data.Rows.Count; i++)
                {
                    col = 1;
                    foreach (DataColumn column in data.Columns)
                    {
                        worksheet.Cell(row + i + 1, col).Value = data.Rows[i][column].ToString();
                        
                        // If it's a summary row, make it bold and with background
                        if (data.Rows[i]["Patient"]?.ToString() == "SUMMARY")
                        {
                            worksheet.Cell(row + i + 1, col).Style.Font.Bold = true;
                            worksheet.Cell(row + i + 1, col).Style.Fill.BackgroundColor = XLColor.LightGreen;
                        }
                        col++;
                    }
                }
                
                // Auto-fit columns
                worksheet.Columns().AdjustToContents();
                
                using var ms = new MemoryStream();
                workbook.SaveAs(ms);
                return ms.ToArray();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating Excel report");
                throw;
            }
        }
    }
} 