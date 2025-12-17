// Controllers/LibrarianController.cs
using LiBook.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data.Entity;
using System.Linq;
using System.Web.Mvc;

namespace LiBook.Controllers
{
    [Authorize(Roles = "Librarian")]
    public class LibrarianController : Controller
    {
        private LiBookEntities db = new LiBookEntities();

        // ============================================
        // VIEW MODELS
        // ============================================

        public class RoomDetailsWithReservationsViewModel
        {
            public int RoomID { get; set; }
            public string RoomName { get; set; }
            public string RoomType { get; set; }
            public int Capacity { get; set; }
            public string Status { get; set; }
            public string UserType { get; set; }
            public string Equipment { get; set; }
            public string CurrentReservation { get; set; }
            public string NextReservation { get; set; }
            public List<RoomReservationViewModel> UpcomingReservations { get; set; }

            public RoomDetailsWithReservationsViewModel()
            {
                UpcomingReservations = new List<RoomReservationViewModel>();
            }
        }

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
            public bool IsPastBooking { get; set; }
            public bool IsWalkIn { get; set; }

            public string Status
            {
                get
                {
                    if (CancelledAt.HasValue) return "Cancelled";
                    if (IsPastBooking && ApprovedAt.HasValue) return "Successful";
                    if (ApprovedAt.HasValue) return "Accepted";
                    if (SubmittedAt.HasValue) return "Pending";
                    return "Unknown";
                }
            }

            public string TimeSlot =>
                $"{StartTime.Hours:00}:{StartTime.Minutes:00} - {EndTime.Hours:00}:{EndTime.Minutes:00}";

            public string FormattedDate =>
                BookingDate.ToString("MMM dd, yyyy");
        }

        public class RoomManagementViewModel
        {
            public int RoomID { get; set; }
            public string RoomName { get; set; }
            public string RoomType { get; set; }
            public int Capacity { get; set; }
            public string Status { get; set; }
            public string UserType { get; set; }
            public string Equipment { get; set; }
            public string CurrentReservation { get; set; }
            public string NextReservation { get; set; }
        }

        public class ArchiveReservationViewModel
        {
            public int ID { get; set; }
            public string ReservationID { get; set; }
            public string ReserveeName { get; set; }
            public string UserType { get; set; }
            public DateTime BookingDate { get; set; }
            public TimeSpan StartTime { get; set; }
            public TimeSpan EndTime { get; set; }
            public string RoomName { get; set; }
            public string Status { get; set; }
            public bool IsSuccessful { get; set; }
        }

        public class DashboardStatistics
        {
            public int TodayBookings { get; set; }
            public int AvailableRooms { get; set; }
            public int TotalRooms { get; set; }
            public int PendingApprovals { get; set; }
            public int TotalBookingsToday { get; set; }
        }

        public class ChartData
        {
            public List<string> Labels { get; set; }
            public List<int> Data { get; set; }
        }

        public class PieChartData
        {
            public List<string> Labels { get; set; }
            public List<int> Data { get; set; }
            public List<string> Colors { get; set; }
        }

        public class RoomOverviewViewModel
        {
            public int RoomID { get; set; }
            public string RoomName { get; set; }
            public int BookedUsers { get; set; }
            public string Status { get; set; }
        }

        public class AcceptedReservationViewModel
        {
            public string BookingID { get; set; }
            public string UserType { get; set; }
            public string RoomName { get; set; }
            public string UserName { get; set; }
            public TimeSpan StartTime { get; set; }
            public TimeSpan EndTime { get; set; }

            public string TimeSlot =>
                $"{StartTime.Hours:00}:{StartTime.Minutes:00} - {EndTime.Hours:00}:{EndTime.Minutes:00}";
        }

        // ============================================
        // DASHBOARD
        // ============================================
        public ActionResult LibrarianDashboard()
        {
            try
            {
                var now = DateTime.Now;
                var today = DateTime.Today;

                // Get dashboard statistics
                var dashboardData = GetDashboardStatistics(today, now);

                // Get chart data
                var bookingHoursData = GetBookingHoursChartData(today);
                var userTypeData = GetUserTypeChartData(today);

                // Get table data
                var roomOverviewData = GetRoomOverviewData();
                var todaysAcceptedReservations = GetTodaysAcceptedReservations(today);

                // Pass data to view
                ViewBag.TodayBookings = dashboardData.TodayBookings;
                ViewBag.RoomsAvailable = $"{dashboardData.AvailableRooms}/{dashboardData.TotalRooms}";
                ViewBag.PendingApprovals = dashboardData.PendingApprovals;
                ViewBag.TotalBookingsToday = dashboardData.TotalBookingsToday;

                ViewBag.BookingHoursLabels = Newtonsoft.Json.JsonConvert.SerializeObject(bookingHoursData.Labels);
                ViewBag.BookingHoursData = Newtonsoft.Json.JsonConvert.SerializeObject(bookingHoursData.Data);

                ViewBag.UserTypeLabels = Newtonsoft.Json.JsonConvert.SerializeObject(userTypeData.Labels);
                ViewBag.UserTypeData = Newtonsoft.Json.JsonConvert.SerializeObject(userTypeData.Data);
                ViewBag.UserTypeColors = Newtonsoft.Json.JsonConvert.SerializeObject(userTypeData.Colors);

                ViewBag.RoomOverview = roomOverviewData;
                ViewBag.TodaysAcceptedReservations = todaysAcceptedReservations;

                return View();
            }
            catch (Exception ex)
            {
                ViewBag.ErrorMessage = "Error loading dashboard data: " + ex.Message;
                return View();
            }
        }

        private DashboardStatistics GetDashboardStatistics(DateTime today, DateTime now)
        {
            var stats = new DashboardStatistics();

            // Today's bookings (all bookings for today)
            stats.TodayBookings = db.Bookings
                .Count(b => DbFunctions.TruncateTime(b.BookingDate) == today);

            // Available rooms
            stats.TotalRooms = db.Rooms.Count(r => !r.DateArchived.HasValue);

            // Update room statuses first
            UpdateRoomStatuses();

            stats.AvailableRooms = db.Rooms.Count(r => !r.DateArchived.HasValue &&
                r.Availability == "Available");

            // Pending approvals (bookings that need approval)
            stats.PendingApprovals = db.Bookings
                .Count(b => !b.ApprovedAt.HasValue && !b.CancelledAt.HasValue);

            // Total bookings today (for display purposes)
            stats.TotalBookingsToday = stats.TodayBookings;

            return stats;
        }

        private ChartData GetBookingHoursChartData(DateTime today)
        {
            var chartData = new ChartData();

            // Define time slots (9AM to 5PM)
            var timeSlots = new List<string>();
            var bookingCounts = new List<int>();

            for (int hour = 8; hour <= 17; hour++)
            {
                var startHour = hour;
                var displayHour = hour > 12 ? hour - 12 : hour;
                var amPm = hour >= 12 ? "PM" : "AM";

                timeSlots.Add($"{displayHour}:00 {amPm}");

                // Count bookings for this hour
                var bookingsCount = db.Bookings
                    .Where(b => DbFunctions.TruncateTime(b.BookingDate) == today &&
                               b.Schedule.StartTime.Hours == startHour &&
                               !b.CancelledAt.HasValue)
                    .Count();

                bookingCounts.Add(bookingsCount);
            }

            chartData.Labels = timeSlots;
            chartData.Data = bookingCounts;

            return chartData;
        }

        private PieChartData GetUserTypeChartData(DateTime today)
        {
            var chartData = new PieChartData();

            var allBookings = db.Bookings
                .Where(b => DbFunctions.TruncateTime(b.BookingDate) == today &&
                           !b.CancelledAt.HasValue)
                .ToList();

            var userTypeCounts = new Dictionary<string, int>
            {
                { "Students", 0 },
                { "Faculty", 0 },
                { "Admin", 0 },
                { "Visitors", 0 }
            };

            foreach (var booking in allBookings)
            {
                var userType = DetermineUserType(booking);
                userTypeCounts[userType] = userTypeCounts.ContainsKey(userType) ?
                    userTypeCounts[userType] + 1 : 1;
            }

            chartData.Labels = userTypeCounts.Keys.ToList();
            chartData.Data = userTypeCounts.Values.ToList();
            chartData.Colors = new List<string> { "#2c3e50", "#ffc107", "#c62828", "#27ae60" };

            return chartData;
        }

        private List<RoomOverviewViewModel> GetRoomOverviewData()
        {
            var roomOverview = new List<RoomOverviewViewModel>();

            var rooms = db.Rooms
                .Where(r => !r.DateArchived.HasValue)
                .Take(6)
                .ToList();

            foreach (var room in rooms)
            {
                var bookedCount = db.Bookings
                    .Count(b => b.RoomID == room.ID &&
                               !b.CancelledAt.HasValue &&
                               DbFunctions.TruncateTime(b.BookingDate) == DateTime.Today);

                var vm = new RoomOverviewViewModel
                {
                    RoomID = room.ID,
                    RoomName = room.RoomName,
                    BookedUsers = bookedCount,
                    Status = room.Availability
                };

                roomOverview.Add(vm);
            }

            return roomOverview;
        }

        private List<AcceptedReservationViewModel> GetTodaysAcceptedReservations(DateTime today)
        {
            var reservations = new List<AcceptedReservationViewModel>();

            var acceptedBookings = db.Bookings
                .Include(b => b.Room)
                .Include(b => b.Schedule)
                .Where(b => DbFunctions.TruncateTime(b.BookingDate) == today &&
                           b.ApprovedAt.HasValue &&
                           !b.CancelledAt.HasValue)
                .OrderBy(b => b.Schedule.StartTime)
                .Take(5)
                .ToList();

            int bookingCounter = 1;
            foreach (var booking in acceptedBookings)
            {
                var vm = new AcceptedReservationViewModel
                {
                    BookingID = $"#BK{bookingCounter:000}",
                    UserType = DetermineUserType(booking),
                    RoomName = booking.Room?.RoomName ?? "Unknown Room",
                    UserName = FormatName(booking.ReserveeFirstName, booking.ReserveeMiddleName,
                                         booking.ReserveeLastName, booking.ReserveeSuffix),
                    StartTime = booking.Schedule?.StartTime ?? TimeSpan.Zero,
                    EndTime = booking.Schedule?.EndTime ?? TimeSpan.Zero
                };

                reservations.Add(vm);
                bookingCounter++;
            }

            return reservations;
        }

        // ============================================
        // GET ROOM DETAILS WITH RESERVATIONS - FOR MODAL
        // ============================================
        public ActionResult GetRoomDetailsWithReservations(int roomId)
        {
            try
            {
                var room = db.Rooms.Find(roomId);
                if (room == null)
                {
                    return Json(new { success = false, message = "Room not found" }, JsonRequestBehavior.AllowGet);
                }

                // Get upcoming reservations for this room
                var now = DateTime.Now;
                var today = DateTime.Today;

                var upcomingBookings = db.Bookings
                    .Include(b => b.Schedule)
                    .Include(b => b.Members)
                    .Where(b => b.RoomID == roomId
                             && !b.CancelledAt.HasValue
                             && (b.BookingDate > today || (b.BookingDate == today && b.Schedule.StartTime > now.TimeOfDay)))
                    .OrderBy(b => b.BookingDate)
                    .ThenBy(b => b.Schedule.StartTime)
                    .Take(10)
                    .ToList();

                var reservations = new List<RoomReservationViewModel>();

                foreach (var booking in upcomingBookings)
                {
                    var bookingDateTime = booking.BookingDate.Date.Add(booking.Schedule?.EndTime ?? TimeSpan.Zero);
                    var isPastBooking = bookingDateTime < now;
                    var isWalkIn = booking.SubmittedAt.HasValue && booking.ApprovedAt.HasValue &&
                                  (booking.ApprovedAt.Value - booking.SubmittedAt.Value).TotalMinutes < 1;

                    var reservation = new RoomReservationViewModel
                    {
                        BookingID = booking.ID,
                        ReserveeName = FormatName(booking.ReserveeFirstName, booking.ReserveeMiddleName,
                                                 booking.ReserveeLastName, booking.ReserveeSuffix),
                        ReserveeEmail = booking.ReserveeEmail,
                        Program = booking.Program,
                        StudentNumber = booking.StudentNumber,
                        UserType = DetermineUserType(booking),
                        BookingDate = booking.BookingDate,
                        StartTime = booking.Schedule?.StartTime ?? TimeSpan.Zero,
                        EndTime = booking.Schedule?.EndTime ?? TimeSpan.Zero,
                        Purpose = booking.Purpose,
                        SubmittedAt = booking.SubmittedAt,
                        ApprovedAt = booking.ApprovedAt,
                        CancelledAt = booking.CancelledAt,
                        IsPastBooking = isPastBooking,
                        IsWalkIn = isWalkIn,
                        Members = booking.Members?.Select(m => m.FullName).ToList() ?? new List<string>()
                    };

                    reservations.Add(reservation);
                }

                // Create view model
                var viewModel = new RoomDetailsWithReservationsViewModel
                {
                    RoomID = room.ID,
                    RoomName = room.RoomName,
                    RoomType = room.RoomType,
                    Capacity = room.Capacity,
                    Status = room.Availability,
                    UserType = room.RoomType,
                    Equipment = "Smart TV, Whiteboard, Projector, Wi-Fi",
                    CurrentReservation = GetCurrentReservation(roomId),
                    NextReservation = GetNextReservation(roomId),
                    UpcomingReservations = reservations
                };

                return PartialView("_RoomDetailsModal", viewModel);
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error loading room details: " + ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        // ============================================
        // ROOM MANAGEMENT PAGE - Main Entry Point
        // ============================================
        public ActionResult RoomManagement(string status = "all", string userType = "all")
        {
            try
            {
                // Update room statuses based on current bookings
                UpdateRoomStatuses();

                var allRooms = db.Rooms.Where(r => !r.DateArchived.HasValue).ToList();
                var rooms = new List<RoomManagementViewModel>();

                foreach (var r in allRooms)
                {
                    var vm = new RoomManagementViewModel
                    {
                        RoomID = r.ID,
                        RoomName = r.RoomName,
                        RoomType = r.RoomType,
                        Capacity = r.Capacity,
                        Status = r.Availability,
                        UserType = r.RoomType,
                        Equipment = "Smart TV, Whiteboard",
                        CurrentReservation = GetCurrentReservation(r.ID),
                        NextReservation = GetNextReservation(r.ID)
                    };
                    rooms.Add(vm);
                }

                // Calculate statistics
                ViewBag.AllCount = allRooms.Count;
                ViewBag.AvailableCount = allRooms.Count(r => r.Availability == "Available");
                ViewBag.UnavailableCount = allRooms.Count(r => r.Availability == "Unavailable");
                ViewBag.MaintenanceCount = allRooms.Count(r => r.Availability == "Under Maintenance");
                ViewBag.OccupiedCount = allRooms.Count(r => r.Availability == "Occupied");

                // Apply filters
                if (!string.IsNullOrEmpty(status) && status.ToLower() != "all")
                {
                    string availabilityFilter = status.ToLower();
                    switch (availabilityFilter)
                    {
                        case "available":
                            rooms = rooms.Where(r => r.Status == "Available").ToList();
                            break;
                        case "unavailable":
                            rooms = rooms.Where(r => r.Status == "Unavailable").ToList();
                            break;
                        case "maintenance":
                            rooms = rooms.Where(r => r.Status == "Under Maintenance").ToList();
                            break;
                        case "occupied":
                            rooms = rooms.Where(r => r.Status == "Occupied").ToList();
                            break;
                    }
                }

                if (!string.IsNullOrEmpty(userType) && userType.ToLower() != "all")
                {
                    rooms = rooms.Where(r => r.UserType.Equals(userType, StringComparison.OrdinalIgnoreCase)).ToList();
                }

                ViewBag.CurrentStatus = status;
                ViewBag.CurrentUserType = userType;

                return View(rooms);
            }
            catch (Exception ex)
            {
                ViewBag.ErrorMessage = "Error loading rooms: " + ex.Message;
                ViewBag.AllCount = 0;
                ViewBag.AvailableCount = 0;
                ViewBag.UnavailableCount = 0;
                ViewBag.MaintenanceCount = 0;
                ViewBag.OccupiedCount = 0;
                return View(new List<RoomManagementViewModel>());
            }
        }

        // Helper method to update room statuses based on current bookings
        private void UpdateRoomStatuses()
        {
            var now = DateTime.Now;
            var today = DateTime.Today;

            // Reset all rooms to Available first (except maintenance/unavailable)
            var allRooms = db.Rooms.Where(r => !r.DateArchived.HasValue).ToList();
            foreach (var room in allRooms)
            {
                if (room.Availability != "Under Maintenance" && room.Availability != "Unavailable")
                {
                    room.Availability = "Available";
                }
            }

            // Find rooms with current active bookings (including walk-ins)
            var activeBookings = db.Bookings
                .Include(b => b.Schedule)
                .Include(b => b.Room)
                .Where(b => DbFunctions.TruncateTime(b.BookingDate) == today
                         && !b.CancelledAt.HasValue
                         && b.ApprovedAt.HasValue
                         && b.Schedule.StartTime <= now.TimeOfDay
                         && b.Schedule.EndTime >= now.TimeOfDay)
                .ToList();

            // Mark these rooms as Occupied
            foreach (var booking in activeBookings)
            {
                if (booking.Room != null &&
                    booking.Room.Availability != "Under Maintenance" &&
                    booking.Room.Availability != "Unavailable")
                {
                    booking.Room.Availability = "Occupied";
                }
            }

            db.SaveChanges();
        }

        // ============================================
        // FILTER ROOMS
        // ============================================
        public ActionResult FilterRooms(string status, string userType)
        {
            return RedirectToAction("RoomManagement", new { status = status, userType = userType });
        }

        // ============================================
        // REFRESH ROOMS
        // ============================================
        public ActionResult RefreshRooms(string status = "all", string userType = "all")
        {
            return RedirectToAction("RoomManagement", new { status = status, userType = userType });
        }

        // ============================================
        // RESERVATIONS MANAGEMENT PAGE
        // ============================================
        public ActionResult LibrarianReservations(string statusFilter = "all")
        {
            try
            {
                var now = DateTime.Now;
                var bookings = db.Bookings
                    .Include(b => b.Room)
                    .Include(b => b.Schedule)
                    .Include(b => b.Members)
                    .OrderByDescending(b => b.BookingDate)
                    .ThenByDescending(b => b.SubmittedAt)
                    .ToList();

                var reservations = new List<ReservationViewModel>();

                foreach (var booking in bookings)
                {
                    // Calculate if booking is in the past (successful)
                    var bookingDateTime = booking.BookingDate.Date.Add(booking.Schedule?.EndTime ?? TimeSpan.Zero);
                    var isPastBooking = bookingDateTime < now;

                    // Check if it's a walk-in
                    var isWalkIn = booking.SubmittedAt.HasValue && booking.ApprovedAt.HasValue &&
                                  (booking.ApprovedAt.Value - booking.SubmittedAt.Value).TotalMinutes < 1;

                    // Skip successful reservations (past and approved) but NOT walk-ins
                    if (isPastBooking && booking.ApprovedAt.HasValue && !booking.CancelledAt.HasValue && !isWalkIn)
                    {
                        continue; // Don't add to reservations list
                    }

                    // Format reservation details
                    var reserveeName = FormatName(
                        booking.ReserveeFirstName,
                        booking.ReserveeMiddleName,
                        booking.ReserveeLastName,
                        booking.ReserveeSuffix
                    );

                    var userType = DetermineUserType(booking);
                    var status = DetermineStatus(booking, isPastBooking, isWalkIn);

                    var startTime = booking.Schedule?.StartTime.ToString(@"hh\:mm") ?? "00:00";
                    var endTime = booking.Schedule?.EndTime.ToString(@"hh\:mm") ?? "00:00";

                    // Create view model
                    var vm = new ReservationViewModel
                    {
                        ID = booking.ID,
                        ReserveeName = reserveeName,
                        Email = booking.ReserveeEmail ?? "No email provided",
                        RoomName = booking.Room?.RoomName ?? "Unknown Room",
                        BookingDate = booking.BookingDate,
                        StartTime = startTime,
                        EndTime = endTime,
                        Purpose = booking.Purpose ?? "Not specified",
                        Program = booking.Program ?? "Not specified",
                        StudentNumber = booking.StudentNumber ?? "N/A",
                        UserType = userType,
                        Status = status,
                        IsPastBooking = isPastBooking,
                        IsWalkIn = isWalkIn,
                        Members = booking.Members?.Select(m => m.FullName).ToList() ?? new List<string>()
                    };

                    // Add formatted properties for display
                    vm.FormattedDate = booking.BookingDate.ToString("MMM dd, yyyy");
                    vm.FormattedTime = $"{startTime} - {endTime}";

                    reservations.Add(vm);
                }

                // Filter reservations by status if specified
                if (!string.IsNullOrEmpty(statusFilter) && statusFilter.ToLower() != "all")
                {
                    reservations = reservations.Where(r => r.Status.ToLower() == statusFilter.ToLower()).ToList();
                }

                // Group reservations by status (excluding successful but including walk-ins)
                var acceptedReservations = reservations.Where(r => r.Status == "accepted").ToList();
                var cancelledReservations = reservations.Where(r => r.Status == "cancelled").ToList();
                var pendingReservations = reservations.Where(r => r.Status == "pending").ToList();

                ViewBag.AcceptedReservations = acceptedReservations;
                ViewBag.CancelledReservations = cancelledReservations;
                ViewBag.PendingReservations = pendingReservations;

                ViewBag.AcceptedCount = acceptedReservations.Count;
                ViewBag.CancelledCount = cancelledReservations.Count;
                ViewBag.PendingCount = pendingReservations.Count;

                ViewBag.CurrentStatusFilter = statusFilter;

                return View();
            }
            catch (Exception ex)
            {
                ViewBag.ErrorMessage = "Error loading reservations: " + ex.Message;
                ViewBag.AcceptedReservations = new List<ReservationViewModel>();
                ViewBag.CancelledReservations = new List<ReservationViewModel>();
                ViewBag.PendingReservations = new List<ReservationViewModel>();

                ViewBag.AcceptedCount = 0;
                ViewBag.CancelledCount = 0;
                ViewBag.PendingCount = 0;

                return View();
            }
        }

        // ============================================
        // HELPER METHODS - UPDATED DetermineStatus
        // ============================================
        private string DetermineStatus(Booking booking, bool isPastBooking, bool isWalkIn)
        {
            if (booking.CancelledAt.HasValue)
                return "cancelled";
            if (isPastBooking && booking.ApprovedAt.HasValue && !isWalkIn)
                return "successful"; // This won't be shown in reservations page
            if (booking.ApprovedAt.HasValue)
                return "accepted";
            if (booking.SubmittedAt.HasValue && !booking.ApprovedAt.HasValue)
                return "pending";
            return "unknown";
        }

        // ============================================
        // ARCHIVE RESERVATION
        // ============================================
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult ArchiveReservation(int id)
        {
            try
            {
                var booking = db.Bookings.Find(id);
                if (booking == null)
                {
                    TempData["ErrorMessage"] = "Reservation not found.";
                    return RedirectToAction("LibrarianReservations");
                }

                // If this is an active booking, update room status
                var now = DateTime.Now;
                var today = DateTime.Today;
                if (booking.BookingDate.Date == today &&
                    booking.Schedule.StartTime <= now.TimeOfDay &&
                    booking.Schedule.EndTime >= now.TimeOfDay &&
                    booking.ApprovedAt.HasValue &&
                    !booking.CancelledAt.HasValue)
                {
                    var room = db.Rooms.Find(booking.RoomID);
                    if (room != null && room.Availability == "Occupied")
                    {
                        room.Availability = "Available";
                        db.Entry(room).State = EntityState.Modified;
                    }
                }

                db.Bookings.Remove(booking);

                var members = db.Members.Where(m => m.BookingID == id).ToList();
                foreach (var member in members)
                {
                    db.Members.Remove(member);
                }

                db.SaveChanges();

                TempData["SuccessMessage"] = "Reservation archived successfully!";
                return RedirectToAction("LibrarianReservations");
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = $"Error archiving reservation: {ex.Message}";
                return RedirectToAction("LibrarianReservations");
            }
        }

        // ============================================
        // CANCEL RESERVATION
        // ============================================
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult CancelReservation(int id)
        {
            try
            {
                var booking = db.Bookings.Find(id);
                if (booking == null)
                {
                    TempData["ErrorMessage"] = "Reservation not found.";
                    return RedirectToAction("LibrarianReservations");
                }

                // If this is an active booking, update room status
                var now = DateTime.Now;
                var today = DateTime.Today;
                if (booking.BookingDate.Date == today &&
                    booking.Schedule.StartTime <= now.TimeOfDay &&
                    booking.Schedule.EndTime >= now.TimeOfDay &&
                    booking.ApprovedAt.HasValue &&
                    !booking.CancelledAt.HasValue)
                {
                    var room = db.Rooms.Find(booking.RoomID);
                    if (room != null && room.Availability == "Occupied")
                    {
                        room.Availability = "Available";
                        db.Entry(room).State = EntityState.Modified;
                    }
                }

                booking.CancelledAt = DateTime.Now;
                db.SaveChanges();

                TempData["SuccessMessage"] = "Reservation cancelled successfully!";
                return RedirectToAction("LibrarianReservations");
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = $"Error cancelling reservation: {ex.Message}";
                return RedirectToAction("LibrarianReservations");
            }
        }

        // ============================================
        // COMPLETE RESERVATION (Mark as Successful)
        // ============================================
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult CompleteReservation(int id)
        {
            try
            {
                var booking = db.Bookings.Find(id);
                if (booking == null)
                {
                    TempData["ErrorMessage"] = "Reservation not found.";
                    return RedirectToAction("LibrarianReservations");
                }

                // Just redirect since successful status is calculated automatically
                TempData["SuccessMessage"] = "Reservation marked as successful!";
                return RedirectToAction("LibrarianReservations");
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = $"Error completing reservation: {ex.Message}";
                return RedirectToAction("LibrarianReservations");
            }
        }

        // ============================================
        // FILTER RESERVATIONS
        // ============================================
        public ActionResult FilterReservations(string statusFilter)
        {
            return RedirectToAction("LibrarianReservations", new { statusFilter = statusFilter });
        }

        // ============================================
        // ARCHIVES MANAGEMENT PAGE
        // ============================================
        public ActionResult LibrarianArchives(string statusFilter = "successful", string dateFilter = "all", string userTypeFilter = "all")
        {
            try
            {
                var now = DateTime.Now;
                var today = DateTime.Today;

                // Get ALL bookings from database (not filtered yet)
                var allBookings = db.Bookings
                    .Include(b => b.Room)
                    .Include(b => b.Schedule)
                    .Include(b => b.Members)
                    .Where(b => b.ApprovedAt.HasValue) // Only approved bookings
                    .ToList();

                // Calculate booking end time for each booking to determine if it's successful
                var bookingsWithStatus = allBookings.Select(booking =>
                {
                    var bookingDateTime = booking.BookingDate.Date.Add(booking.Schedule?.EndTime ?? TimeSpan.Zero);
                    var isPastBooking = bookingDateTime < now;
                    var isWalkIn = booking.SubmittedAt.HasValue && booking.ApprovedAt.HasValue &&
                                  (booking.ApprovedAt.Value - booking.SubmittedAt.Value).TotalMinutes < 1;
                    var isSuccessful = !booking.CancelledAt.HasValue && isPastBooking && !isWalkIn;

                    return new
                    {
                        Booking = booking,
                        IsSuccessful = isSuccessful,
                        IsCancelled = booking.CancelledAt.HasValue,
                        IsWalkIn = isWalkIn,
                        BookingDateTime = bookingDateTime,
                        UserType = DetermineUserType(booking)
                    };
                }).ToList();

                // Filter based on statusFilter
                List<dynamic> filteredBookings;
                if (statusFilter.ToLower() == "cancelled")
                {
                    // Show cancelled bookings
                    filteredBookings = bookingsWithStatus
                        .Where(b => b.IsCancelled)
                        .Select(b => b.Booking)
                        .Cast<dynamic>()
                        .ToList();
                }
                else
                {
                    // Show successful bookings (past and not cancelled, not walk-ins)
                    filteredBookings = bookingsWithStatus
                        .Where(b => b.IsSuccessful)
                        .Select(b => b.Booking)
                        .Cast<dynamic>()
                        .ToList();
                }

                // Convert to ArchiveReservationViewModel
                var archivedReservations = new List<ArchiveReservationViewModel>();
                foreach (var booking in filteredBookings)
                {
                    var bookingObj = booking as Booking;
                    if (bookingObj == null) continue;

                    var bookingDateTime = bookingObj.BookingDate.Date.Add(bookingObj.Schedule?.EndTime ?? TimeSpan.Zero);
                    var isPast = bookingDateTime < now;
                    var isWalkIn = bookingObj.SubmittedAt.HasValue && bookingObj.ApprovedAt.HasValue &&
                                  (bookingObj.ApprovedAt.Value - bookingObj.SubmittedAt.Value).TotalMinutes < 1;

                    var vm = new ArchiveReservationViewModel
                    {
                        ID = bookingObj.ID,
                        ReservationID = $"BK-{bookingObj.ID:000}",
                        ReserveeName = FormatName(bookingObj.ReserveeFirstName, bookingObj.ReserveeMiddleName,
                                                 bookingObj.ReserveeLastName, bookingObj.ReserveeSuffix),
                        UserType = DetermineUserType(bookingObj),
                        BookingDate = bookingObj.BookingDate,
                        StartTime = bookingObj.Schedule?.StartTime ?? TimeSpan.Zero,
                        EndTime = bookingObj.Schedule?.EndTime ?? TimeSpan.Zero,
                        RoomName = bookingObj.Room?.RoomName ?? "Unknown Room",
                        Status = bookingObj.CancelledAt.HasValue ? "Cancelled" :
                                (isPast ? "Successful" : "Upcoming"),
                        IsSuccessful = !bookingObj.CancelledAt.HasValue && isPast && !isWalkIn
                    };
                    archivedReservations.Add(vm);
                }

                // Apply date filter
                if (!string.IsNullOrEmpty(dateFilter) && dateFilter.ToLower() != "all")
                {
                    switch (dateFilter.ToLower())
                    {
                        case "today":
                            var todayDate = DateTime.Today;
                            archivedReservations = archivedReservations
                                .Where(r => r.BookingDate.Date == todayDate)
                                .ToList();
                            break;
                        case "week":
                            var weekAgo = DateTime.Today.AddDays(-7);
                            archivedReservations = archivedReservations
                                .Where(r => r.BookingDate >= weekAgo)
                                .ToList();
                            break;
                        case "month":
                            var monthAgo = DateTime.Today.AddMonths(-1);
                            archivedReservations = archivedReservations
                                .Where(r => r.BookingDate >= monthAgo)
                                .ToList();
                            break;
                    }
                }

                // Apply user type filter
                if (!string.IsNullOrEmpty(userTypeFilter) && userTypeFilter.ToLower() != "all")
                {
                    archivedReservations = archivedReservations
                        .Where(r => r.UserType.Equals(userTypeFilter, StringComparison.OrdinalIgnoreCase))
                        .ToList();
                }

                // Calculate statistics - UPDATED to include successful count
                var successfulBookings = bookingsWithStatus
                    .Where(b => b.IsSuccessful)
                    .Select(b => b.Booking)
                    .ToList();

                var cancelledBookings = allBookings
                    .Where(b => b.CancelledAt.HasValue)
                    .ToList();

                var successfulCount = successfulBookings.Count;
                var cancelledCount = cancelledBookings.Count;

                // Successful today: past bookings that completed today
                var successfulToday = successfulBookings
                    .Where(b => b.BookingDate.Date == today)
                    .Count();

                // Cancelled today: cancelled bookings from today
                var cancelledToday = cancelledBookings
                    .Where(b => b.CancelledAt.HasValue && b.CancelledAt.Value.Date == today)
                    .Count();

                ViewBag.StatusFilter = statusFilter;
                ViewBag.DateFilter = dateFilter;
                ViewBag.UserTypeFilter = userTypeFilter;
                ViewBag.SuccessfulCount = successfulCount;
                ViewBag.CancelledCount = cancelledCount;
                ViewBag.SuccessfulToday = successfulToday;
                ViewBag.CancelledToday = cancelledToday;

                return View(archivedReservations);
            }
            catch (Exception ex)
            {
                ViewBag.ErrorMessage = "Error loading archives: " + ex.Message;
                ViewBag.SuccessfulCount = 0;
                ViewBag.CancelledCount = 0;
                ViewBag.SuccessfulToday = 0;
                ViewBag.CancelledToday = 0;
                return View(new List<ArchiveReservationViewModel>());
            }
        }

        // ============================================
        // FILTER ARCHIVES
        // ============================================
        public ActionResult FilterArchives(string statusFilter, string dateFilter, string userTypeFilter)
        {
            return RedirectToAction("LibrarianArchives", new
            {
                statusFilter = statusFilter ?? "successful",
                dateFilter = dateFilter ?? "all",
                userTypeFilter = userTypeFilter ?? "all"
            });
        }

        // ============================================
        // WALK-IN RESERVATION
        // ============================================
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult CreateWalkIn(WalkInViewModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    TempData["ErrorMessage"] = "Please fill in all required fields correctly.";
                    return RedirectToAction("RoomManagement");
                }

                var room = db.Rooms.Find(model.RoomID);
                if (room == null)
                {
                    TempData["ErrorMessage"] = "Room not found.";
                    return RedirectToAction("RoomManagement");
                }

                if (room.Availability != "Available")
                {
                    TempData["ErrorMessage"] = $"Room '{room.RoomName}' is not available for walk-in reservations.";
                    return RedirectToAction("RoomManagement");
                }

                if (model.BookingDate < DateTime.Today)
                {
                    TempData["ErrorMessage"] = "Booking date cannot be in the past.";
                    return RedirectToAction("RoomManagement");
                }

                TimeSpan startTime, endTime;
                if (!TimeSpan.TryParse(model.StartTime, out startTime) || !TimeSpan.TryParse(model.EndTime, out endTime))
                {
                    TempData["ErrorMessage"] = "Invalid time format.";
                    return RedirectToAction("RoomManagement");
                }

                if (endTime <= startTime)
                {
                    TempData["ErrorMessage"] = "End time must be after start time.";
                    return RedirectToAction("RoomManagement");
                }

                // Check for time conflicts
                var existingBooking = db.Bookings
                    .Include(b => b.Schedule)
                    .Where(b => b.RoomID == model.RoomID
                             && b.BookingDate == model.BookingDate
                             && !b.CancelledAt.HasValue
                             && b.ApprovedAt.HasValue
                             && ((b.Schedule.StartTime <= startTime && b.Schedule.EndTime > startTime)
                               || (b.Schedule.StartTime < endTime && b.Schedule.EndTime >= endTime)
                               || (b.Schedule.StartTime >= startTime && b.Schedule.EndTime <= endTime)))
                    .FirstOrDefault();

                if (existingBooking != null)
                {
                    TempData["ErrorMessage"] = "Time slot conflicts with an existing reservation.";
                    return RedirectToAction("RoomManagement");
                }

                // Get or create schedule
                var schedule = db.Schedules
                    .FirstOrDefault(s => s.StartTime == startTime && s.EndTime == endTime);

                if (schedule == null)
                {
                    schedule = new Schedule
                    {
                        StartTime = startTime,
                        EndTime = endTime
                    };
                    db.Schedules.Add(schedule);
                    db.SaveChanges();
                }

                // Create the walk-in booking
                var now = DateTime.Now;
                var booking = new Booking
                {
                    RoomID = model.RoomID,
                    ScheduleID = schedule.ID,
                    StudentNumber = model.StudentNumber,
                    Program = model.Program,
                    Purpose = model.Purpose,
                    BookingDate = model.BookingDate,
                    SubmittedAt = now,
                    ApprovedAt = now, // Auto-approve walk-ins immediately
                    ReserveeFirstName = model.ReserveeFirstName,
                    ReserveeMiddleName = model.ReserveeMiddleName,
                    ReserveeLastName = model.ReserveeLastName,
                    ReserveeSuffix = model.ReserveeSuffix,
                    ReserveeEmail = model.ReserveeEmail
                };

                db.Bookings.Add(booking);
                db.SaveChanges();

                // Generate booking reference
                string bookingId = $"BK-{booking.ID:000}";

                // Update room availability if it's for today and happening now
                if (model.BookingDate.Date == now.Date &&
                    startTime <= now.TimeOfDay &&
                    endTime > now.TimeOfDay)
                {
                    room.Availability = "Occupied";
                    db.Entry(room).State = EntityState.Modified;
                    db.SaveChanges();
                }

                TempData["SuccessMessage"] = $"Walk-in reservation created successfully for {room.RoomName}! Reservation ID: {bookingId}";

                // Redirect to RoomManagement with the same filters to see the updated status
                return RedirectToAction("RoomManagement", new
                {
                    status = Request.QueryString["status"] ?? "all",
                    userType = Request.QueryString["userType"] ?? "all"
                });
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = $"Error creating walk-in reservation: {ex.Message}";
                return RedirectToAction("RoomManagement");
            }
        }

        // ============================================
        // HELPER METHODS
        // ============================================
        private string FormatName(string firstName, string middleName, string lastName, string suffix)
        {
            var nameParts = new List<string>();
            if (!string.IsNullOrEmpty(firstName)) nameParts.Add(firstName);
            if (!string.IsNullOrEmpty(middleName)) nameParts.Add(middleName);
            if (!string.IsNullOrEmpty(lastName)) nameParts.Add(lastName);
            if (!string.IsNullOrEmpty(suffix)) nameParts.Add(suffix);
            return string.Join(" ", nameParts);
        }

        private string DetermineUserType(Booking booking)
        {
            if (booking.StudentNumber == "VISITOR")
                return "Visitor";
            if (booking.StudentNumber == "FACULTY")
                return "Faculty";
            if (booking.StudentNumber == "ADMIN")
                return "Admin";
            if (!string.IsNullOrEmpty(booking.StudentNumber) && booking.StudentNumber != "VISITOR")
                return "Student";
            if (!string.IsNullOrEmpty(booking.Program) && booking.Program != "N/A")
                return "Faculty";
            return "Visitor";
        }

        private string GetCurrentReservation(int roomId)
        {
            var now = DateTime.Now;
            var today = DateTime.Today;

            var currentBooking = db.Bookings
                .Include(b => b.Schedule)
                .Where(b => b.RoomID == roomId
                         && DbFunctions.TruncateTime(b.BookingDate) == today
                         && !b.CancelledAt.HasValue
                         && b.ApprovedAt.HasValue) // Only show approved/active bookings
                .ToList()
                .Where(b => b.Schedule.StartTime <= now.TimeOfDay
                         && b.Schedule.EndTime >= now.TimeOfDay)
                .OrderByDescending(b => b.ApprovedAt) // Show most recent first
                .FirstOrDefault();

            if (currentBooking != null)
            {
                var reserveeName = FormatName(
                    currentBooking.ReserveeFirstName,
                    currentBooking.ReserveeMiddleName,
                    currentBooking.ReserveeLastName,
                    currentBooking.ReserveeSuffix);

                var timeSlot = $"{currentBooking.Schedule.StartTime.Hours:00}:{currentBooking.Schedule.StartTime.Minutes:00} - " +
                              $"{currentBooking.Schedule.EndTime.Hours:00}:{currentBooking.Schedule.EndTime.Minutes:00}";

                return $"{reserveeName} ({timeSlot})";
            }

            return string.Empty;
        }

        private string GetNextReservation(int roomId)
        {
            var now = DateTime.Now;
            var today = DateTime.Today;

            var futureBookings = db.Bookings
                .Include(b => b.Schedule)
                .Where(b => b.RoomID == roomId
                         && !b.CancelledAt.HasValue
                         && b.ApprovedAt.HasValue // Only approved bookings
                         && (b.BookingDate > today
                             || (b.BookingDate == today && b.Schedule.StartTime > now.TimeOfDay)))
                .OrderBy(b => b.BookingDate)
                .ThenBy(b => b.Schedule.StartTime)
                .ToList();

            var nextBooking = futureBookings.FirstOrDefault();

            if (nextBooking != null)
            {
                var reserveeName = FormatName(
                    nextBooking.ReserveeFirstName,
                    nextBooking.ReserveeMiddleName,
                    nextBooking.ReserveeLastName,
                    nextBooking.ReserveeSuffix);

                var timeSlot = $"{nextBooking.Schedule.StartTime.Hours:00}:{nextBooking.Schedule.StartTime.Minutes:00} - " +
                              $"{nextBooking.Schedule.EndTime.Hours:00}:{nextBooking.Schedule.EndTime.Minutes:00}";

                if (nextBooking.BookingDate.Date == today)
                {
                    return $"{reserveeName} (Today {timeSlot})";
                }
                else
                {
                    return $"{reserveeName} ({nextBooking.BookingDate:MMM dd} {timeSlot})";
                }
            }

            return string.Empty;
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        // ============================================
        // WALK-IN VIEW MODEL
        // ============================================
        public class WalkInViewModel
        {
            [Required]
            public int RoomID { get; set; }
            public string RoomName { get; set; }
            public string RoomType { get; set; }

            [Required(ErrorMessage = "First name is required")]
            [Display(Name = "First Name")]
            public string ReserveeFirstName { get; set; }

            [Display(Name = "Middle Name")]
            public string ReserveeMiddleName { get; set; }

            [Required(ErrorMessage = "Last name is required")]
            [Display(Name = "Last Name")]
            public string ReserveeLastName { get; set; }

            [Display(Name = "Suffix")]
            public string ReserveeSuffix { get; set; }

            [Required(ErrorMessage = "Email is required")]
            [EmailAddress(ErrorMessage = "Invalid email address")]
            [Display(Name = "Email Address")]
            public string ReserveeEmail { get; set; }

            [Display(Name = "Student Number")]
            public string StudentNumber { get; set; }

            [Display(Name = "Program")]
            public string Program { get; set; }

            [Required(ErrorMessage = "Purpose is required")]
            [Display(Name = "Purpose")]
            public string Purpose { get; set; }

            [Required(ErrorMessage = "Booking date is required")]
            [Display(Name = "Booking Date")]
            [DataType(DataType.Date)]
            public DateTime BookingDate { get; set; }

            [Required(ErrorMessage = "Start time is required")]
            [Display(Name = "Start Time")]
            public string StartTime { get; set; }

            [Required(ErrorMessage = "End time is required")]
            [Display(Name = "End Time")]
            public string EndTime { get; set; }

            [Display(Name = "Additional Notes")]
            public string AdditionalNotes { get; set; }
        }

        // ============================================
        // RESERVATION VIEW MODEL
        // ============================================
        public class ReservationViewModel
        {
            public int ID { get; set; }
            public string ReserveeName { get; set; }
            public string Email { get; set; }
            public string RoomName { get; set; }
            public DateTime BookingDate { get; set; }
            public string StartTime { get; set; }
            public string EndTime { get; set; }
            public string Purpose { get; set; }
            public string Program { get; set; }
            public string StudentNumber { get; set; }
            public string UserType { get; set; }
            public string Status { get; set; }
            public bool IsPastBooking { get; set; }
            public bool IsWalkIn { get; set; }
            public List<string> Members { get; set; }

            // Additional properties for display
            public string FormattedDate { get; set; }
            public string FormattedTime { get; set; }

            public ReservationViewModel()
            {
                Members = new List<string>();
            }
        }
    }
}