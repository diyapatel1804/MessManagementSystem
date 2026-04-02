using System;
using System.ComponentModel.DataAnnotations;

namespace MessManagementAPI.Models
{
    public class Notification
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }   // Notification title

        [Required]
        public string Message { get; set; } // Detailed message

        [Required]
        public string Type { get; set; }    // menu_change / low_stock / payment / event

        [Required]
        public string TargetRole { get; set; } // student / staff / all

        public bool IsRead { get; set; } = false; // default false

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}