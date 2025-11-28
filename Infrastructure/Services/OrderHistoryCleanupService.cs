using System;
using System.Threading;
using System.Threading.Tasks;
using Core.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services
{
    /// <summary>
    /// Background service that periodically removes expired order history entries
    /// </summary>
    public class OrderHistoryCleanupService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<OrderHistoryCleanupService> _logger;
        private readonly TimeSpan _cleanupInterval = TimeSpan.FromDays(1);
        private readonly int _defaultRetentionMonths = 3;

        public OrderHistoryCleanupService(
            IServiceProvider serviceProvider,
            ILogger<OrderHistoryCleanupService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Order history cleanup service starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var lifecycleService = scope.ServiceProvider.GetRequiredService<IOrderHistoryLifecycleService>();
                    await lifecycleService.DeleteOldHistoryAsync(_defaultRetentionMonths);
                    _logger.LogInformation("Completed order history cleanup cycle.");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error while cleaning up order history.");
                }

                try
                {
                    await Task.Delay(_cleanupInterval, stoppingToken);
                }
                catch (TaskCanceledException)
                {
                    // ignore cancellation from Delay when stopping
                }
            }

            _logger.LogInformation("Order history cleanup service stopping.");
        }
    }

    public static class OrderHistoryServiceExtensions
    {
        public static IServiceCollection AddOrderHistoryServices(this IServiceCollection services)
        {
            services.AddScoped<IOrderHistoryLifecycleService, OrderHistoryLifecycleService>();
            services.AddHostedService<OrderHistoryCleanupService>();
            return services;
        }
    }
}

