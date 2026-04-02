using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MessManagementAPI.Data;
using MessManagementAPI.Models;

namespace MessManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly MessDbContext _context;

        public NotificationController(MessDbContext context)
        {
            _context = context;
        }

        // GET notifications for a role
        [HttpGet]
        public async Task<IActionResult> GetNotifications([FromQuery] string role)
        {
            var notifications = await _context.Notifications
                .Where(n => n.TargetRole == role || n.TargetRole == "all")
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return Ok(notifications);
        }

        // POST create notification
        [HttpPost]
        public async Task<IActionResult> CreateNotification([FromBody] Notification notification)
        {
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
            return Ok(notification);
        }

        // PATCH mark as read
        [HttpPatch("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null) return NotFound();

            notification.IsRead = true;
            await _context.SaveChangesAsync();
            return Ok(notification);
        }
    }
}