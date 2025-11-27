using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace LiBook.Models
{
    public class VisitorModel
    {
        [Required, MinLength(2), MaxLength(50)]
        public string LastName { get; set; }

        [Required, MinLength(2), MaxLength(50)]
        public string FirstName { get; set; }

        [RegularExpression(@"^[A-Za-z]?$")]
        public string MiddleInitial { get; set; }

        [RegularExpression(@"^(Jr|Sr|II|III|IV|MD|PhD|Dr)?$"), MaxLength(10)]
        public string Suffix { get; set; }

        [Required]
        public string Purpose { get; set; }

        [Required, MinLength(2), MaxLength(50)]
        public string Institution { get; set; }

        [Required, EmailAddress, MaxLength(254)]
        public string Email { get; set; }

        [Required, DataType(DataType.Date)]
        public DateTime Date { get; set; }

        [Required]
        public string TimeStart { get; set; }

        [Required]
        public string TimeEnd { get; set; }

        [Range(2, 10)]
        public int NumberOfMembers { get; set; }
    }
}