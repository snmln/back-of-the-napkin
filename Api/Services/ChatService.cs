using System;
using System.Collections;
using System.Collections.Generic;
using Api.Dtos;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Api.Services
{
    public class ChatService
    {
        public static readonly Dictionary<string, UserDtoConnected> Users = new Dictionary<string, UserDtoConnected>();
        public HashSet<string> groupList = new();

        public bool AddUserToList(string userToAdd)
        {
            lock (Users)
            {
                foreach (var user in Users)
                {
                    if (user.Key.ToLower() == userToAdd.ToLower())
                    {
                        return false;
                    }
                }

                var RoomName = GenerateRoomName();
                while(groupList.Contains(RoomName))
                {
                    RoomName = GenerateRoomName();
                };

                var newItem = new UserDtoConnected
                {
                    Name = userToAdd,
                    Room = RoomName,

                };
                Users.Add(userToAdd, newItem);

                foreach (KeyValuePair<string, UserDtoConnected> kvp in Users)
                {
                    Console.WriteLine("Key = {0}, Name = {1}, Room = {2}, ConnectionId = {3}", kvp.Key, kvp.Value.Name, kvp.Value.Room, kvp.Value.ConnectionId);
                }
                return true;
            }

        }


        public void AddUsersConnectionId(string user, string connectionId)
        {
            lock (Users)
            {
                if (Users.ContainsKey(user))
                {
                    Users[user].ConnectionId = connectionId;
                    foreach (KeyValuePair<string, UserDtoConnected> kvp in Users)
                    {
                        Console.WriteLine("Key = {0}, Name = {1}, Room = {2}, ConnectionId = {3}", kvp.Key, kvp.Value.Name, kvp.Value.Room, kvp.Value.ConnectionId);
                    }
                }
            }
        }



        public string GetUserByConnectionId(string connectionId)
        {
            lock (Users)
            {
                return Users.Where(x => x.Value.ConnectionId == connectionId).Select(x => x.Key).FirstOrDefault();
            }
        }
        public string GetConnectionIdByUser(string user)
        {
            lock (Users)
            {
                return Users.Where(x => x.Key == user).Select(x => x.Value.ConnectionId).FirstOrDefault();
            }
        }
        public void RemoveUserFromList(string user)
        {
            lock (Users)
            {
                if (Users.ContainsKey(user))
                {
                    Users.Remove(user);
                }
            }
        }
        public string[] GetOnlineUsers()
        {
            lock (Users)
            {
                return Users.OrderBy(x => x.Key).Select(x => x.Key).ToArray();
            }
        }

        public string GenerateRoomName()
        {
            Random random = new Random();
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

            var roomCode = new string(Enumerable.Repeat(chars, 5)
               .Select(s => s[random.Next(s.Length)]).ToArray());
            return roomCode;
        }
    }
}

