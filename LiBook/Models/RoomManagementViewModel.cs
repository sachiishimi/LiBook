// ============================================
// ROOM DETAILS VIEW MODEL WITH RESERVATIONS
// ============================================
using System;
using System.Collections.Generic;

public class RoomDetailsWithReservationsViewModel
{
    public int RoomID { get; set; }
    public string RoomName { get; set; }
    public string RoomType { get; set; }
    public int Capacity { get; set; }
    public string Status { get; set; }
    public string UserType { get; set; }
    public string Equipment { get; set; }

    // Current reservation info
    public string CurrentReservation { get; set; }
    public string NextReservation { get; set; }

    // Upcoming reservations list for modal
    public List<RoomReservationViewModel> UpcomingReservations { get; set; }

    public RoomDetailsWithReservationsViewModel()
    {
        UpcomingReservations = new List<RoomReservationViewModel>();
    }
}

// ============================================
// ROOM RESERVATION VIEW MODEL
// ============================================
public class RoomReservationViewModel
{
    public int BookingID { get; set; }
    public string ReserveeName { get; set; }
    public string ReserveeEmail { get; set; }
    public string Program { get; set; }
    public string StudentNumber { get; set; }
    public string UserType { get; set; }
    public DateTime BookingDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string Purpose { get; set; }
    public List<string> Members { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTime? CancelledAt { get; set; }

    public string Status
    {
        get
        {
            if (CancelledAt.HasValue) return "Cancelled";
            if (ApprovedAt.HasValue) return "Approved";
            if (SubmittedAt.HasValue) return "Pending";
            return "Unknown";
        }
    }

    public string TimeSlot =>
        $"{StartTime.Hours:00}:{StartTime.Minutes:00} - {EndTime.Hours:00}:{EndTime.Minutes:00}";

    public string FormattedDate =>
        BookingDate.ToString("MMM dd, yyyy");
}