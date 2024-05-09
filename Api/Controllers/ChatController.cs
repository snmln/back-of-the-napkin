using Api.Dtos;
using Api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;


namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly ChatService _chatService;
        public ChatController(ChatService chatService)
        {
            _chatService = chatService;
        }
        [HttpPost("register-user")]
        public IActionResult RegisterUser(UserDtoConnected model)
        {
            //check for a valid name 
            if (_chatService.AddUserToList(model.Name, model.Room))
            {
                    //202 status code
                    return NoContent();
            }
            return BadRequest("This name is taken please choose another name");

        }

    }
}

