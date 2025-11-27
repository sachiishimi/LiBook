using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LiBook.Models
{
    public class StudentModel
    {
        [Required, MinLength(2), MaxLength(50)]
        public string LastName { get; set; }

        [Required, MinLength(2), MaxLength(50)]
        public string FirstName { get; set; }

        [RegularExpression(@"^[A-Za-z]?$")]
        public string MiddleInitial { get; set; }

        [RegularExpression(@"^(Jr|Sr|II|III|IV|MD|PhD|Dr)?$"), MaxLength(10)]
        public string Suffix { get; set; }

        [Required, MinLength(2), MaxLength(2)]
        public string StudentNumberPrefix { get; set; }

        [Required, MinLength(4), MaxLength(4)]
        public string StudentNumberSuffix { get; set; }

        [Required, EmailAddress, MaxLength(254)]
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

        [Required, Range(2, 10)]
        public int NumberOfMembers { get; set; }

        public List<string> Members { get; set; } = new List<string>();
    }
}
