// ViewModels/ReservationViewModel.cs
using System;
using System.Collections.Generic;

namespace LiBook.ViewModels
{
    public class ReservationViewModel
    {
        public int ID { get; set; }
        public string ReserveeName { get; set; }
        public string Email { get; set; }
        public string UserType { get; set; }
        public string RoomName { get; set; }
        public DateTime BookingDate { get; set; }
        public string StartTime { get; set; }
        public string EndTime { get; set; }
        public string Status { get; set; }
        public string Purpose { get; set; }
        public string Program { get; set; }
        public string StudentNumber { get; set; }
        public List<string> Members { get; set; }

        // Format the date for display (matches your database format)
        public string FormattedDate => BookingDate.ToString("yyyy-MM-dd");

        // Format the time for display
        public string FormattedTime => $"{StartTime} - {EndTime}";
    }
}