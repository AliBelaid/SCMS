using System;

namespace API.Errors {
        public class ApiResponse {
            public int StatusCode { get; set; }
            public string Message { get; set; }

            public ApiResponse (int statusCode, string? message = null) {
                StatusCode = statusCode;
                Message = message ?? GetDefaultMessageForStatusCode(statusCode);
            }

            private string? GetDefaultMessageForStatusCode(int statusCode) {
                return statusCode switch {
                     400 => "A bad request was made",
                     401 => "You are not authorized",
                     403 => "You are forbidden from accessing this resource",
                     404 => "Resource not found",
                     500 => "Internal server error",
                     _ => null
                };
            }
        }
}