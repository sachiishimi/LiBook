using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace LiBook.Models
{
    public class UserWithRolesViewModel
    {
        public int ID { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string MiddleName { get; set; }
        public string Suffix { get; set; }
        public string Email { get; set; }
        public string AccountStatus { get; set; }
        public DateTime? DateArchived { get; set; }
        public List<string> Roles { get; set; }

        // Helper properties for the view
        public string FullName => $"{FirstName} {LastName}";
        public string DisplayName => $"{FirstName} {LastName} {Suffix}".Trim();
        public bool IsAdmin => Roles?.Any(r => r.Equals("Admin", StringComparison.OrdinalIgnoreCase)) == true;
        public bool IsLibrarian => Roles?.Any(r => r.Equals("Librarian", StringComparison.OrdinalIgnoreCase)) == true;
    }
}