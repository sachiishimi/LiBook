using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LiBook.Models
{
    public partial class Booking
    {
        public Booking()
        {
            this.Members = new HashSet<Member>();
        }

        [Key]
        public int ID { get; set; }

        [Required]
        [Display(Name = "Room")]
        public int RoomID { get; set; }

        [Required]
        [Display(Name = "Schedule")]
        public int ScheduleID { get; set; }

        // Database columns (these exist in DB)
        [Display(Name = "Student/Visitor ID")]
        [StringLength(20)]
        public string StudentNumber { get; set; }

        [Display(Name = "Program/Organization")]
        [StringLength(50)]
        public string Program { get; set; }

        [Required]
        [Display(Name = "Purpose")]
        [StringLength(255)]
        public string Purpose { get; set; }

        [Required]
        [Display(Name = "Booking Date")]
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime BookingDate { get; set; }

        [Display(Name = "Submitted At")]
        public DateTime? SubmittedAt { get; set; }

        [Display(Name = "Approved At")]
        public DateTime? ApprovedAt { get; set; }

        [Display(Name = "Cancelled At")]
        public DateTime? CancelledAt { get; set; }

        [Display(Name = "First Name")]
        [StringLength(100)]
        public string ReserveeFirstName { get; set; }

        [Display(Name = "Middle Name")]
        [StringLength(100)]
        public string ReserveeMiddleName { get; set; }

        [Display(Name = "Last Name")]
        [StringLength(100)]
        public string ReserveeLastName { get; set; }

        [Display(Name = "Suffix")]
        [StringLength(50)]
        public string ReserveeSuffix { get; set; }

        [Display(Name = "Email")]
        [StringLength(150)]
        [EmailAddress]
        public string ReserveeEmail { get; set; }

        // Navigation properties
        public virtual Room Room { get; set; }
        public virtual Schedule Schedule { get; set; }
        public virtual ICollection<Member> Members { get; set; }
    }
}
