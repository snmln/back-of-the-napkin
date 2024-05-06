using System;
using System.Collections.Generic;
using Api.Dtos;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Api.Services
{
    public class ChatService
    {
		private static readonly Dictionary<string, UserDto> Users = new Dictionary<string, UserDto>();
        public List<string> groupList = new();

        public bool AddUserToList(string userToAdd)
		{
			lock (Users)
			{
				foreach(var user in Users)
				{
					if (user.ToLower() == userToAdd.ToLower())
					{
						return false;
					}
				}
                var RoomName = GenerateRoomName();

                var newItem = new UserDto
                {
                    Name = userToAdd,
                    Room = RoomName
                };
				Users.Add(userToAdd, newItem);
                return true;
			}

		}

        //public bool AddRoomToUser(string userToAdd, UserDto model)
        //{
        //    lock (Users) {
        //        Users.Where(i => i.Name == userToAdd).FirstOrDefault();

        //    }
        //}

        public void AddUsersConnectionId(string user, string connectionId, string room)
		{
			lock (Users)
			{
				if (Users.ContainsKey(user))
				{
					Users[user] = connectionId;
                }
			}
		}

        public void AddUsersRoom(string user, string connectionId)
        {
            lock (Users)
            {
                if (Users.ContainsKey(user))
                {
                    Users[user] = connectionId;

                }
            }
        }

        public string GetUserByConnectionId(string connectionId)
		{
			lock(Users)
			{
				return Users.Where(x => x.Value == connectionId).Select(x => x.Key).FirstOrDefault();
			}
		}
        public string GetConnectionIdByUser(string user)
        {
            lock (Users)
            {
                return Users.Where(x => x.Key == user).Select(x => x.Value).FirstOrDefault();
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

        //public void AddRoomName(string newRoomName)
        //{
        //    lock (groupList)
        //    {
        //        groupList.Add(Room, newRoomName);
        //    }
        //}

        //    public string[] GetRoomKey(string newRoomName)
        //    {
        //        lock (groupList)
        //        {
        //return newRoomName;
        //        }
        //    }
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

