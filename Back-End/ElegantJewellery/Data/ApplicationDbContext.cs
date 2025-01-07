using ElegantJewellery.Models;
using Microsoft.EntityFrameworkCore;
namespace ElegantJewellery.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Existing relationship configurations
            modelBuilder.Entity<User>()
                .HasOne(u => u.Cart)
                .WithOne(c => c.User)
                .HasForeignKey<Cart>(c => c.UserId);

            modelBuilder.Entity<Product>()
                .HasOne(p => p.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CategoryId);

            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.Cart)
                .WithMany(c => c.CartItems)
                .HasForeignKey(ci => ci.CartId);

            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.Product)
                .WithMany(p => p.CartItems)
                .HasForeignKey(ci => ci.ProductId);

            modelBuilder.Entity<Order>()
                .HasOne(o => o.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(o => o.UserId);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Product)
                .WithMany(p => p.OrderItems)
                .HasForeignKey(oi => oi.ProductId);

            // Seed Categories
            modelBuilder.Entity<Category>().HasData(
                new Category
                {
                    Id = 1,
                    Name = "Rings",
                    Description = "Beautiful collection of rings"
                },
                new Category
                {
                    Id = 2,
                    Name = "Necklaces",
                    Description = "Elegant necklaces for all occasions"
                },
                new Category
                {
                    Id = 3,
                    Name = "Earrings",
                    Description = "Stunning earrings collection"
                },
                new Category
                {
                    Id = 4,
                    Name = "Bracelets",
                    Description = "Charming bracelets and bangles"
                }
            );

            modelBuilder.Entity<Product>().HasData(
        // Rings (Category 1)
        new Product
        {
            Id = 1,
            Name = "Diamond Solitaire Ring",
            Price = 124499,
            Stock = 10,
            ImageUrl = "https://cdn.bradojewellery.com/p/540x/1710406122399.jpeg",
            CategoryId = 1
        },
        new Product
        {
            Id = 2,
            Name = "Rose Gold Wedding Band",
            Price = 66399,
            Stock = 15,
            ImageUrl = "https://cdn.bradojewellery.com/p/540x/1710404013885.jpeg",
            CategoryId = 1
        },

        // Necklaces (Category 2)
        new Product
        {
            Id = 3,
            Name = "Pearl Pendant Necklace",
            Price = 49799,
            Stock = 8,
            ImageUrl = "https://cdn.bradojewellery.com/p/540x/1711022791462.jpeg",
            CategoryId = 2
        },
        new Product
        {
            Id = 4,
            Name = "Gold Chain Necklace",
            Price = 74699,
            Stock = 12,
            ImageUrl = "https://cdn.bradojewellery.com/p/540x/1734852671201.jpeg",
            CategoryId = 2
        },

        // Earrings (Category 3)
        new Product
        {
            Id = 5,
            Name = "Diamond Stud Earrings",
            Price = 82999,
            Stock = 10,
            ImageUrl = "https://cdn.bradojewellery.com/p/540x/1722072430751.jpeg",
            CategoryId = 3
        },
        new Product
        {
            Id = 6,
            Name = "Sapphire Drop Earrings",
            Price = 107899,
            Stock = 6,
            ImageUrl = "https://cdn.bradojewellery.com/p/540x/1719922648757.jpeg",
            CategoryId = 3
        },

        // Bracelets (Category 4)
        new Product
        {
            Id = 7,
            Name = "Tennis Bracelet",
            Price = 207499,
            Stock = 5,
            ImageUrl = "https://cdn.bradojewellery.com/p/540x/1689066649407.jpeg",
            CategoryId = 4
        },
        new Product
        {
            Id = 8,
            Name = "Charm Bracelet",
            Price = 33199,
            Stock = 20,
            ImageUrl = "https://cdn.bradojewellery.com/p/540x/1691123242398.jpeg",
            CategoryId = 4
        }

        );

        }
    }
}