using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LiBook.Models
{
    // Base ViewModel - common fields
    public abstract class BaseBookingViewModel
    {
        [Required(ErrorMessage = "First name is required")]
        public string FirstName { get; set; }

        [Required(ErrorMessage = "Last name is required")]
        public string LastName { get; set; }

        public string MiddleInitial { get; set; }

        public string Suffix { get; set; }

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Purpose is required")]
        public string Purpose { get; set; }

        [Required(ErrorMessage = "Date is required")]
        [DataType(DataType.Date)]
        public DateTime BookingDate { get; set; }

        [Required(ErrorMessage = "Time is required")]
        public string BookingTime { get; set; }
    }

    // Visitor ViewModel
    public class VisitorBookingViewModel : BaseBookingViewModel
    {
        [Required(ErrorMessage = "Program/Organization is required")]
        public string Program { get; set; }

        [Required(ErrorMessage = "Member count is required")]
        [Range(1, 10)]
        public int MemberCount { get; set; }

        public List<string> MemberNames { get; set; } = new List<string>();
    }

    // Student ViewModel
    public class StudentBookingViewModel : BaseBookingViewModel
    {
        [Required(ErrorMessage = "Student ID is required")]
        public string StudentId { get; set; }

        [Required(ErrorMessage = "Program is required")]
        public string Program { get; set; }

        [Required(ErrorMessage = "Member count is required")]
        [Range(1, 10)]
        public int MemberCount { get; set; }

        public List<string> MemberNames { get; set; } = new List<string>();
    }

    // Faculty ViewModel
    public class FacultyBookingViewModel : BaseBookingViewModel
    {
        [Required(ErrorMessage = "Member count is required")]
        [Range(1, 10)]
        public int MemberCount { get; set; }

        public List<string> MemberNames { get; set; } = new List<string>();
    }

    // Admin ViewModel
    public class AdminBookingViewModel : BaseBookingViewModel
    {
        // Admin bookings don't have special fields that map to database
    }
}