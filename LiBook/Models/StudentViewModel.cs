using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LiBook.Models
{
    public class StudentViewModel
    {
        [Required]
        public string LastName { get; set; }
        [Required]
        public string FirstName { get; set; }
        public string MiddleInitial { get; set; }
        public string Suffix { get; set; }
        [Required]
        public string StudentNumberPrefix { get; set; }
        [Required]
        public string StudentNumberSuffix { get; set; }
        [Required, EmailAddress]
        public string Email { get; set; }
        [Required]
        public string Purpose { get; set; }
        [Required]
        public string Program { get; set; }
        [Required, DataType(DataType.Date)]
        public DateTime Date { get; set; }
        [Required]
        public string TimeStart { get; set; }
        [Required]
        public string TimeEnd { get; set; }
        [Required]
        public int NumberOfMembers { get; set; }
        public List<string> Members { get; set; } = new List<string>();

    }
}
