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

        // Helper properties for role checking
        public bool IsAdmin => Roles?.Contains("Admin") == true;
        public bool IsLibrarian => Roles?.Contains("Librarian") == true;
    }
}