﻿using Api.Dtos;
using Api.Services;
using Microsoft.AspNetCore.SignalR;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Api.Hubs
{
	public class ChatHub: Hub
	{
		private readonly ChatService _chatService;

		public ChatHub(ChatService chatService)
		{
			_chatService = chatService;
        }

		public override async Task OnConnectedAsync()
		{
			await Groups.AddToGroupAsync(Context.ConnectionId, "Come2Chat");
			await Clients.Caller.SendAsync("UserConnected");
		}
		public override async Task OnDisconnectedAsync(Exception exception)
		{
			await Groups.RemoveFromGroupAsync(Context.ConnectionId, "Come2Chat");
			var user = _chatService.GetUserByConnectionId(Context.ConnectionId);
			_chatService.RemoveUserFromList(user);
            await DisplayOnlineUsers();
            await base.OnDisconnectedAsync(exception);
		}

		public async Task AddUserConnectionId(string name) {
			_chatService.AddUsersConnectionId(name, Context.ConnectionId);
            await DisplayOnlineUsers();
        }
    public async Task RecieveMessage(MessageDto message)
        {
            await Clients.Group("Come2Chat").SendAsync("NewMessage", message);
        }
        private async Task DisplayOnlineUsers() {
			var onlineUsers = _chatService.GetOnlineUsers();
			await Clients.Groups("Come2Chat").SendAsync("OnlineUsers", onlineUsers);
		}

		public async Task CreatePrivateChat(MessageDto message) {
			string privateGroupName = GetPrivateGroupName(message.From, message.To);
			await Groups.AddToGroupAsync(Context.ConnectionId, privateGroupName);
			var toConnectionId = _chatService.GetConnectionIdByUser(message.To);
			await Groups.AddToGroupAsync(toConnectionId, privateGroupName); 
			await Clients.Client(toConnectionId).SendAsync("OpenPrivateChat", message);
		}

		public async Task RecievePrivateMessage(MessageDto message) {
			string privateGroupName = GetPrivateGroupName(message.From, message.To);
			await Clients.Group(privateGroupName).SendAsync("NewPrivateMessage", message);
				}

		public async Task RemovePrivateChat(string from, string to)
		{
            string privateGroupName = GetPrivateGroupName(from, to);
			await Clients.Group(privateGroupName).SendAsync("ClosePrivateChat");

			await Groups.RemoveFromGroupAsync(Context.ConnectionId,privateGroupName);
			var toConnectionId = _chatService.GetConnectionIdByUser(to);
			await Groups.RemoveFromGroupAsync(toConnectionId, privateGroupName);
        }

        private string GetPrivateGroupName(string from, string to) {

			var stringCompare = string.CompareOrdinal(from, to) < 0;
            return stringCompare ? $"{from}-{to}" : $"{to}-{from}";
		}
    public async Task SendDraw(WhiteBoardDto coordinates)
    {
	
      await Clients.Groups("Come2Chat").SendAsync("ReceiveDraw", coordinates);
      Console.WriteLine("Drawn: {0}, {1}", coordinates.xCord, coordinates.yCord);
    }


  }

}

