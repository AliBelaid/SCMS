using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.SignalR
{
    public class PreenceTracker
    {
        private static readonly Dictionary<string, List<String>> OnlineUsers = new Dictionary<string, List<string>>();


        public Task<bool> UserConnected(string username, string connectionId)
        {bool isOnline =false;
            lock (OnlineUsers)
            {
                if (OnlineUsers.ContainsKey(username))
                {

                    OnlineUsers[username].Add(connectionId);
                        isOnline =true;
                }
                else
                {
                    OnlineUsers.Add(username, new List<string> { connectionId });
                }
            }
            return Task.FromResult(isOnline);
        }

        public Task<bool> UserDicconnected(string username, string connectionId)
        {
              bool isOffline = false;
            
            lock (OnlineUsers)
            {
                if (!OnlineUsers.ContainsKey(username)) return Task.FromResult(isOffline);
                OnlineUsers[username].Remove(connectionId);
                if (OnlineUsers[username].Count == 0)
                {
                    OnlineUsers.Remove(username);
                    isOffline =true;
                }
            }
            return   Task.FromResult(isOffline);
        }


        public Task<String[]> GetOnlineUsers()
        {
            string[] onlineUsers;
            lock (OnlineUsers)
            {
                onlineUsers = OnlineUsers.OrderBy(K => K.Key).Select(k => k.Key).ToArray();
            }

            return Task.FromResult(onlineUsers);
        }

        public Task<List<string>> GetConnecionForUser(string username) {
            List<String> connectionIds;
            lock(OnlineUsers) {
                connectionIds = OnlineUsers.GetValueOrDefault(username);
            }

            return Task.FromResult(connectionIds);
        }
    }
}