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

        // Helper property to determine if booking is in the past
        [NotMapped]
        public bool IsPastBooking
        {
            get
            {
                var currentDateTime = DateTime.Now;
                var bookingDateTime = BookingDate.Date.Add(Schedule?.EndTime ?? TimeSpan.Zero);
                return bookingDateTime < currentDateTime;
            }
        }

        // Property specifically for walk-in identification
        [NotMapped]
        public bool IsWalkIn
        {
            get
            {
                // Walk-ins are approved immediately upon creation
                // (SubmittedAt and ApprovedAt are essentially the same time)
                if (!SubmittedAt.HasValue || !ApprovedAt.HasValue)
                    return false;

                var timeDifference = (ApprovedAt.Value - SubmittedAt.Value).TotalMinutes;
                return timeDifference < 1; // Approved within 1 minute of submission
            }
        }

        // Helper property for status
        [NotMapped]
        public string DisplayStatus
        {
            get
            {
                if (CancelledAt.HasValue)
                    return "cancelled";

                if (IsPastBooking && ApprovedAt.HasValue && !IsWalkIn)
                    return "successful";

                if (ApprovedAt.HasValue)
                    return "accepted";

                if (SubmittedAt.HasValue && !ApprovedAt.HasValue)
                    return "pending";

                return "unknown";
            }
        }

        // Property to check if booking is currently active
        [NotMapped]
        public bool IsCurrentlyActive
        {
            get
            {
                var now = DateTime.Now;
                var today = DateTime.Today;

                if (BookingDate.Date != today || !ApprovedAt.HasValue || CancelledAt.HasValue)
                    return false;

                var startTime = Schedule?.StartTime ?? TimeSpan.Zero;
                var endTime = Schedule?.EndTime ?? TimeSpan.Zero;
                var currentTime = now.TimeOfDay;

                return startTime <= currentTime && endTime > currentTime;
            }
        }

        // Property for formatted time slot display
        [NotMapped]
        public string FormattedTimeSlot
        {
            get
            {
                if (Schedule == null)
                    return "N/A";

                return $"{Schedule.StartTime.Hours:00}:{Schedule.StartTime.Minutes:00} - " +
                       $"{Schedule.EndTime.Hours:00}:{Schedule.EndTime.Minutes:00}";
            }
        }

        // Property for formatted booking date
        [NotMapped]
        public string FormattedBookingDate
        {
            get
            {
                return BookingDate.ToString("MMM dd, yyyy");
            }
        }

        // Property for full reservee name
        [NotMapped]
        public string FullReserveeName
        {
            get
            {
                var nameParts = new List<string>();
                if (!string.IsNullOrEmpty(ReserveeFirstName)) nameParts.Add(ReserveeFirstName);
                if (!string.IsNullOrEmpty(ReserveeMiddleName)) nameParts.Add(ReserveeMiddleName);
                if (!string.IsNullOrEmpty(ReserveeLastName)) nameParts.Add(ReserveeLastName);
                if (!string.IsNullOrEmpty(ReserveeSuffix)) nameParts.Add(ReserveeSuffix);
                return string.Join(" ", nameParts);
            }
        }
    }
}