using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace LiBook.Models
{
    public class ViewModel
    {
        public class ReservationTrendViewModel
        {
            public string Period { get; set; }
            public int Count { get; set; }
        }

        public class RoomUtilizationViewModel
        {
            public string Status { get; set; }
            public int Count { get; set; }
            public double Percentage { get; set; }
        }

        public class DashboardViewModel
        {
            public List<ReservationTrendViewModel> ReservationTrends { get; set; }
            public List<RoomUtilizationViewModel> RoomUtilization { get; set; }
        }


        public class BookingViewModel
        {
            public int Id { get; set; }
            public string BookingId { get; set; }
            public int RoomId { get; set; }
            public string RoomName { get; set; }
            public string ReserveeName { get; set; }
            public string ReserveeEmail { get; set; }
            public string StudentNumber { get; set; }
            public string Program { get; set; }
            public string Purpose { get; set; }
            public DateTime BookingDate { get; set; }
            public DateTime? SubmittedAt { get; set; }
            public DateTime? ApprovedAt { get; set; }
            public DateTime? CancelledAt { get; set; }
            public string Status { get; set; }
            public string Schedule { get; set; }
            public List<string> Members { get; set; }
        }
    }
}