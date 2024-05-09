using System;
using System.ComponentModel.DataAnnotations;

namespace Api.Dtos
{
	public class UserDto
	{
		[StringLength(15, MinimumLength = 3, ErrorMessage ="Name must be at atleast {2}, and maximum {1} characters")]
        [Required]
        public string Name { get; set; }
		
    }

    public class UserDtoConnected: UserDto {
            public string ConnectionId { get; set; }
        public string Room { get; set; }

    }

}

