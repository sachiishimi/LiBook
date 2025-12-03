// Controllers/LibrarianController.cs
using LiBook.Models;
using LiBook.ViewModels;
using System;
using System.Collections.Generic;
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
        // ARCHIVES MANAGEMENT PAGE
        // ============================================
        public ActionResult LibrarianArchives(string statusFilter = "successful", string dateFilter = "all", string userTypeFilter = "all")
        {
            try
            {
                var now = DateTime.Now;

                // Get all completed bookings (both successful and cancelled)
                var allBookings = db.Bookings
                    .Include(b => b.Room)
                    .Include(b => b.Schedule)
                    .Include(b => b.Members)
                    .ToList();

                // Filter by status (successful vs cancelled)
                List<Booking> filteredBookings;

                if (statusFilter.ToLower() == "cancelled")
                {
                    // Cancelled bookings: have CancelledAt date
                    filteredBookings = allBookings
                        .Where(b => b.CancelledAt.HasValue)
                        .ToList();
                }
                else // successful (default)
                {
                    // Successful bookings: Completed reservations (BookingDate is in the past)
                    filteredBookings = allBookings
                        .Where(b => b.BookingDate < now.Date && // Booking date is in the past
                                   !b.CancelledAt.HasValue) // Not cancelled
                        .ToList();
                }

                // Transform to view models
                var archivedReservations = new List<ArchiveReservationViewModel>();

                foreach (var booking in filteredBookings)
                {
                    var vm = new ArchiveReservationViewModel
                    {
                        ID = booking.ID,
                        ReservationID = $"RES-{booking.ID:000}",
                        ReserveeName = FormatName(booking.ReserveeFirstName, booking.ReserveeMiddleName, booking.ReserveeLastName, booking.ReserveeSuffix),
                        UserType = DetermineUserType(booking),
                        BookingDate = booking.BookingDate,
                        StartTime = booking.Schedule?.StartTime ?? TimeSpan.Zero,
                        EndTime = booking.Schedule?.EndTime ?? TimeSpan.Zero,
                        RoomName = booking.Room?.RoomName ?? "Unknown Room",
                        Status = booking.CancelledAt.HasValue ? "Cancelled" : "Complete",
                        IsSuccessful = !booking.CancelledAt.HasValue && booking.BookingDate < now.Date
                    };

                    archivedReservations.Add(vm);
                }

                // Apply date filter
                if (!string.IsNullOrEmpty(dateFilter) && dateFilter.ToLower() != "all")
                {
                    switch (dateFilter.ToLower())
                    {
                        case "today":
                            var today = DateTime.Today;
                            archivedReservations = archivedReservations
                                .Where(r => r.BookingDate.Date == today)
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

                // Calculate statistics
                var successfulCount = allBookings.Count(b => !b.CancelledAt.HasValue && b.BookingDate < now.Date);
                var cancelledCount = allBookings.Count(b => b.CancelledAt.HasValue);
                var successfulToday = allBookings.Count(b =>
                    !b.CancelledAt.HasValue &&
                    b.BookingDate.Date == DateTime.Today &&
                    b.BookingDate < now.Date);
                var cancelledToday = allBookings.Count(b =>
                    b.CancelledAt.HasValue &&
                    b.CancelledAt.Value.Date == DateTime.Today);

                // Pass data to view
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
        // ROOM MANAGEMENT PAGE - Main Entry Point
        // ============================================
        public ActionResult RoomManagement(string status = "all", string userType = "all")
        {
            try
            {
                // Get all non-archived rooms from database
                var allRooms = db.Rooms.Where(r => !r.DateArchived.HasValue).ToList();
                var rooms = new List<RoomManagementViewModel>();

                // Transform database rooms to view models
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

                // Calculate statistics from ALL rooms (before filtering)
                ViewBag.AllCount = allRooms.Count;
                ViewBag.AvailableCount = allRooms.Count(r => r.Availability == "Available");
                ViewBag.UnavailableCount = allRooms.Count(r => r.Availability == "Unavailable");
                ViewBag.MaintenanceCount = allRooms.Count(r => r.Availability == "Under Maintenance");

                // Apply status filter
                if (!string.IsNullOrEmpty(status) && status.ToLower() != "all")
                {
                    // Map status parameter to database Availability values
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
                    }
                }

                // Apply user type (room type) filter
                if (!string.IsNullOrEmpty(userType) && userType.ToLower() != "all")
                {
                    rooms = rooms.Where(r => r.UserType.Equals(userType, StringComparison.OrdinalIgnoreCase)).ToList();
                }

                // Store current filter values for view
                ViewBag.CurrentStatus = status;
                ViewBag.CurrentUserType = userType;

                return View(rooms);
            }
            catch (Exception ex)
            {
                // Handle errors gracefully
                ViewBag.ErrorMessage = "Error loading rooms: " + ex.Message;
                ViewBag.AllCount = 0;
                ViewBag.AvailableCount = 0;
                ViewBag.UnavailableCount = 0;
                ViewBag.MaintenanceCount = 0;
                return View(new List<RoomManagementViewModel>());
            }
        }

        // ============================================
        // FILTER ROOMS - Redirect to main action with filters
        // ============================================
        public ActionResult FilterRooms(string status, string userType)
        {
            return RedirectToAction("RoomManagement", new { status = status, userType = userType });
        }

        // ============================================
        // REFRESH ROOMS - Reload page with current filters
        // ============================================
        public ActionResult RefreshRooms(string status = "all", string userType = "all")
        {
            return RedirectToAction("RoomManagement", new { status = status, userType = userType });
        }

        // ============================================
        // GET ROOM DETAILS - For modal viewing
        // ============================================
        public ActionResult GetRoomDetails(int roomId)
        {
            try
            {
                var room = db.Rooms.Find(roomId);
                if (room == null)
                {
                    TempData["ErrorMessage"] = "Room not found";
                    return RedirectToAction("RoomManagement");
                }

                // Get upcoming bookings for this room
                var bookings = db.Bookings
                    .Where(b => b.RoomID == roomId && !b.CancelledAt.HasValue)
                    .OrderBy(b => b.BookingDate)
                    .ThenBy(b => b.Schedule.StartTime)
                    .Take(5)
                    .ToList();

                // Create view model with room details
                var viewModel = new RoomDetailsViewModel
                {
                    RoomID = room.ID,
                    RoomName = room.RoomName,
                    RoomType = room.RoomType,
                    Capacity = room.Capacity,
                    Status = room.Availability,
                    Equipment = "Smart TV, Whiteboard, Projector",
                    Bookings = bookings.Select(b => new BookingInfoViewModel
                    {
                        ReserveeName = $"{b.ReserveeFirstName} {b.ReserveeLastName}",
                        BookingDate = b.BookingDate,
                        StartTime = b.Schedule?.StartTime ?? TimeSpan.Zero,
                        EndTime = b.Schedule?.EndTime ?? TimeSpan.Zero
                    }).ToList()
                };

                return View("RoomDetails", viewModel);
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = "Error loading room details: " + ex.Message;
                return RedirectToAction("RoomManagement");
            }
        }

        // ============================================
        // RESERVATIONS MANAGEMENT PAGE
        // ============================================
        public ActionResult LibrarianReservations()
        {
            try
            {
                var bookings = db.Bookings
                    .Include("Room")
                    .Include("Schedule")
                    .Include("Members")
                    .ToList();

                var reservations = new List<ReservationViewModel>();

                foreach (var booking in bookings)
                {
                    var vm = new ReservationViewModel
                    {
                        ID = booking.ID,
                        ReserveeName = FormatName(booking.ReserveeFirstName, booking.ReserveeMiddleName, booking.ReserveeLastName, booking.ReserveeSuffix),
                        Email = booking.ReserveeEmail ?? "No email",
                        RoomName = booking.Room?.RoomName ?? "Unknown Room",
                        BookingDate = booking.BookingDate,
                        StartTime = booking.Schedule?.StartTime.ToString(@"hh\:mm") ?? "00:00",
                        EndTime = booking.Schedule?.EndTime.ToString(@"hh\:mm") ?? "00:00",
                        Purpose = booking.Purpose ?? "Not specified",
                        Program = booking.Program ?? "Not specified",
                        StudentNumber = booking.StudentNumber ?? "N/A",
                        Members = booking.Members?.Select(m => m.FullName).ToList() ?? new List<string>()
                    };

                    vm.UserType = DetermineUserType(booking);
                    vm.Status = DetermineStatus(booking);

                    reservations.Add(vm);
                }

                var acceptedReservations = reservations.Where(r => r.Status == "accepted").ToList();
                var cancelledReservations = reservations.Where(r => r.Status == "cancelled").ToList();

                ViewBag.AcceptedReservations = acceptedReservations;
                ViewBag.CancelledReservations = cancelledReservations;
                ViewBag.AcceptedCount = acceptedReservations.Count;
                ViewBag.CancelledCount = cancelledReservations.Count;

                return View();
            }
            catch (Exception ex)
            {
                ViewBag.ErrorMessage = "Error loading reservations: " + ex.Message;
                ViewBag.AcceptedReservations = new List<ReservationViewModel>();
                ViewBag.CancelledReservations = new List<ReservationViewModel>();
                ViewBag.AcceptedCount = 0;
                ViewBag.CancelledCount = 0;
                return View();
            }
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
            if (!string.IsNullOrEmpty(booking.StudentNumber))
                return "Student";
            if (!string.IsNullOrEmpty(booking.Program) && booking.Program != "N/A")
                return "Faculty";
            if (booking.ReserveeEmail?.Contains("@admin") == true || booking.ReserveeEmail?.Contains("@staff") == true)
                return "Admin";
            return "Visitor";
        }

        private string DetermineStatus(Booking booking)
        {
            if (booking.CancelledAt.HasValue)
                return "cancelled";
            if (booking.ApprovedAt.HasValue)
                return "accepted";
            if (booking.SubmittedAt.HasValue && !booking.ApprovedAt.HasValue)
                return "pending";
            return "unknown";
        }

        private string GetCurrentReservation(int roomId)
        {
            var now = DateTime.Now;
            var today = DateTime.Today;

            var currentBooking = db.Bookings
                .Where(b => b.RoomID == roomId &&
                           DbFunctions.TruncateTime(b.BookingDate) == today &&
                           !b.CancelledAt.HasValue)
                .ToList()
                .Where(b => b.Schedule.StartTime <= now.TimeOfDay &&
                           b.Schedule.EndTime >= now.TimeOfDay)
                .FirstOrDefault();

            if (currentBooking != null)
            {
                return $"{currentBooking.ReserveeFirstName} {currentBooking.ReserveeLastName}";
            }
            return string.Empty;
        }

        private string GetNextReservation(int roomId)
        {
            var now = DateTime.Now;
            var today = DateTime.Today;

            var futureBookings = db.Bookings
                .Where(b => b.RoomID == roomId &&
                           !b.CancelledAt.HasValue &&
                           b.BookingDate >= today)
                .OrderBy(b => b.BookingDate)
                .ThenBy(b => b.Schedule.StartTime)
                .ToList();

            var nextBooking = futureBookings
                .Where(b => b.BookingDate > today ||
                           (b.BookingDate == today && b.Schedule.StartTime > now.TimeOfDay))
                .FirstOrDefault();

            if (nextBooking != null)
            {
                return $"{nextBooking.ReserveeFirstName} {nextBooking.ReserveeLastName} - {nextBooking.BookingDate:MMM dd}";
            }
            return string.Empty;
        }

        // ============================================
        // DASHBOARD
        // ============================================
        public ActionResult LibrarianDashboard()
        {
            return View();
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
        // VIEW MODELS - NESTED INSIDE CONTROLLER CLASS
        // ============================================

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
            public List<string> Members { get; set; }
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

        public class RoomDetailsViewModel
        {
            public int RoomID { get; set; }
            public string RoomName { get; set; }
            public string RoomType { get; set; }
            public int Capacity { get; set; }
            public string Status { get; set; }
            public string Equipment { get; set; }
            public List<BookingInfoViewModel> Bookings { get; set; }
        }

        public class BookingInfoViewModel
        {
            public string ReserveeName { get; set; }
            public DateTime BookingDate { get; set; }
            public TimeSpan StartTime { get; set; }
            public TimeSpan EndTime { get; set; }
        }
    }
}