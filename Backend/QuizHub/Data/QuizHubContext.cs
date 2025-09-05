using Microsoft.EntityFrameworkCore;
using QuizHub.Models;

namespace QuizHub.Data
{
    public class QuizHubContext : DbContext
    {
        public QuizHubContext(DbContextOptions<QuizHubContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                entity.HasIndex(e => e.Username).IsUnique();
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.UserType).HasConversion<string>();
            });
        }
    }
}