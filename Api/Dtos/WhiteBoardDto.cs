using System;
using System.ComponentModel.DataAnnotations;

namespace Api.Dtos
{
  public class WhiteBoardDto
  {
    [Required]
    public int xCord { get; set; }
    [Required]
    public int yCord { get; set; }
    //public int strokeWidth { get; set; }
    //public string strokeColor { get; set; }

  }
}


