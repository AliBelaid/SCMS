using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Core.Entities.Identity;

namespace API.Hubs
{
    public class NotificationHub : Hub
    {
        public async Task SendRoleChangeNotification(string userCode, string newRole, string message)
        {
            await Clients.All.SendAsync("ReceiveRoleChangeNotification", new
            {
                UserCode = userCode,
                NewRole = newRole,
                Message = message,
                Timestamp = DateTime.UtcNow
            });
        }

        public async Task SendFileUpdateNotification(string fileName, string action)
        {
            await Clients.All.SendAsync("ReceiveFileNotification", new
            {
                FileName = fileName,
                Action = action,
                Timestamp = DateTime.UtcNow
            });
        }

        public async Task JoinUserGroup(string userCode)
        {
            Console.WriteLine($"SignalR Hub: User {userCode} joining group User_{userCode} with connection {Context.ConnectionId}");
            await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userCode}");
        }

        public async Task LeaveUserGroup(string userCode)
        {
            Console.WriteLine($"SignalR Hub: User {userCode} leaving group User_{userCode} with connection {Context.ConnectionId}");
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"User_{userCode}");
        }

        public override async Task OnConnectedAsync()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "AllUsers");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "AllUsers");
            await base.OnDisconnectedAsync(exception);
        }

        /// <summary>
        /// Join visitor management group to receive real-time updates
        /// </summary>
        public async Task JoinVisitorManagementGroup()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "VisitorManagement");
        }

        /// <summary>
        /// Leave visitor management group
        /// </summary>
        public async Task LeaveVisitorManagementGroup()
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "VisitorManagement");
        }

        /// <summary>
        /// Join employee management group to receive real-time updates
        /// </summary>
        public async Task JoinEmployeeManagementGroup()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "EmployeeManagement");
        }

        /// <summary>
        /// Leave employee management group
        /// </summary>
        public async Task LeaveEmployeeManagementGroup()
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "EmployeeManagement");
        }
    }
} 