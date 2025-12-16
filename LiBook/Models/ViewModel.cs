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

        public class RecentReservationViewModel
        {
            public int Id { get; set; }
            public string RoomName { get; set; }
            public string ReserveeName { get; set; }
            public string Status { get; set; }
            public DateTime BookingDate { get; set; }
            public TimeSpan StartTime { get; set; }
            public TimeSpan EndTime { get; set; }
            public DateTime? SubmittedAt { get; set; }
            public string Purpose { get; set; }

            public string TimeSlot => $"{StartTime.Hours:00}:{StartTime.Minutes:00} - {EndTime.Hours:00}:{EndTime.Minutes:00}";
            public string FormattedDate => BookingDate.ToString("MMM dd, yyyy");
            public string FormattedTime => TimeSlot;
            public string TimeAgo => GetTimeAgo(SubmittedAt);

            public string ActivityIcon
            {
                get
                {
                    if (Status == "Pending")
                        return "fas fa-clock";
                    if (Status == "Approved")
                        return "fas fa-check-circle";
                    if (Status == "Cancelled")
                        return "fas fa-times-circle";

                    return "fas fa-calendar-plus";
                }
            }

            public string ActivityIconColor
            {
                get
                {
                    if (Status == "Pending")
                        return "yellow";
                    if (Status == "Approved")
                        return "blue";
                    if (Status == "Cancelled")
                        return "dark";

                    return "blue";
                }
            }

            private string GetTimeAgo(DateTime? date)
            {
                if (!date.HasValue) return "Recently";

                var timeSpan = DateTime.Now - date.Value;

                if (timeSpan.TotalMinutes < 1)
                    return "Just now";
                if (timeSpan.TotalMinutes < 60)
                    return $"{(int)timeSpan.TotalMinutes} min ago";
                if (timeSpan.TotalHours < 24)
                    return $"{(int)timeSpan.TotalHours} hour{(timeSpan.TotalHours >= 2 ? "s" : "")} ago";
                if (timeSpan.TotalDays < 7)
                    return $"{(int)timeSpan.TotalDays} day{(timeSpan.TotalDays >= 2 ? "s" : "")} ago";

                return date.Value.ToString("MMM dd");
            }
        }

        public class RoomAvailabilityViewModel
        {
            public int Id { get; set; }
            public string RoomName { get; set; }
            public int Capacity { get; set; }
            public string Availability { get; set; }
            public bool HasBookingToday { get; set; }

            public string DisplayStatus
            {
                get
                {
                    if (Availability == "Available" && !HasBookingToday)
                        return "Available";
                    if (Availability == "Under Maintenance")
                        return "Maintenance";
                    if (HasBookingToday)
                        return "Occupied";
                    return Availability;
                }
            }

            public string StatusClass
            {
                get
                {
                    if (DisplayStatus == "Available")
                        return "available";
                    if (DisplayStatus == "Occupied")
                        return "occupied";
                    if (DisplayStatus == "Maintenance")
                        return "maintenance";

                    return "unknown";
                }
            }

            public string RankLetter => RoomName.Length > 0 ? RoomName[0].ToString() : "A";
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