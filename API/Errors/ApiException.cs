namespace API.Errors {
    public class ApiException {
        public ApiException(int statusCode, string? message = null, string? details = null) {
            StatusCode = statusCode;
            Message = message ?? GetDefaultMessageForStatusCode(statusCode);
            Details = details;
        }

        public int StatusCode { get; set; }
        public string Message { get; set; }
        public string? Details { get; set; }

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