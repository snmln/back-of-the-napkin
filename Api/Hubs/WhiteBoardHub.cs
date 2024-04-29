using System;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
namespace Api.Hubs


{
  public class WhiteboardHub : Hub
  {
    // the SendDraw action is to be invoked by the client when the user draws in the canvas
    // it receives data of type DrawData which must conform to the data being sent by the client
    public async Task SendDraw(DrawData data)
    {
      try
      {
        await Clients.Others.SendAsync("ReceiveDraw", data); // this invokes the ReceiveDraw action on all the connected clients.
                                                             // Console.WriteLine("Drawn: {0}, {1}", data.X, data.Y);
      }
      catch (Exception ex)
      {
        Console.Error.WriteLine($"Error in SendDraw: {ex.Message}");
      }
    }
  }

  // the data from the client is an object containing two doubles referring to the [relative] coordinates being drawn on on the canvas
  public class DrawData
  {
    public double X { get; set; }
    public double Y { get; set; }
  }
}

