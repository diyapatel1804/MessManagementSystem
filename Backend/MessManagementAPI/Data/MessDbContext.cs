using Microsoft.EntityFrameworkCore;
using MessManagementAPI.Models;

namespace MessManagementAPI.Data
{
    public class MessDbContext : DbContext
    {
        public MessDbContext(DbContextOptions<MessDbContext> options)
            : base(options)
        {
        }

        public DbSet<Student> Students { get; set; }

        public DbSet<MealMenu> MealMenus { get; set; }

        public DbSet<MealAttendance> MealAttendances { get; set; }

        public DbSet<Payment> Payments { get; set; }

        public DbSet<Complaint> Complaints { get; set; }

        public DbSet<Notification> Notifications { get; set; }
    }
}