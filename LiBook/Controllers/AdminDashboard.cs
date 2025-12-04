using LiBook.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Web.Mvc;
using static LiBook.Models.ViewModel;
using EntityState = System.Data.Entity.EntityState;

namespace LiBook.Controllers
{
    [Authorize(Roles = "Admin")] // This protects ALL actions in this controller
    public class AdminDashboardController : Controller
    {
        private LiBookEntities db = new LiBookEntities();

        // GET: /AdminDashboard/Index (Dashboard)
        public ActionResult Index()
        {
            var today = DateTime.Today;
            var firstDayOfMonth = new DateTime(today.Year, today.Month, 1);
            var firstDayOfLastMonth = firstDayOfMonth.AddMonths(-1);
            var lastDayOfLastMonth = firstDayOfMonth.AddDays(-1);

            // Total Reservations
            ViewBag.TotalReservations = db.Bookings.Count();

            // Available Rooms (not archived and status is "Available")
            ViewBag.AvailableRooms = db.Rooms
                .Where(r => !r.DateArchived.HasValue &&
                            r.Availability == "Available")
                .Count();

            // Total Users (not archived)
            ViewBag.TotalUsers = db.Users
                .Where(u => !u.DateArchived.HasValue)
                .Count();

            // Calculate percentage changes
            try
            {
                // Get reservations for last month
                var lastMonthReservations = db.Bookings
                    .Where(b => b.BookingDate >= firstDayOfLastMonth &&
                               b.BookingDate <= lastDayOfLastMonth)
                    .Count();

                // Get reservations for current month (up to today)
                var currentMonthReservations = db.Bookings
                    .Where(b => b.BookingDate >= firstDayOfMonth &&
                               b.BookingDate <= today)
                    .Count();

                double reservationsChange = 0;
                if (lastMonthReservations > 0)
                {
                    reservationsChange = ((currentMonthReservations - lastMonthReservations) / (double)lastMonthReservations) * 100;
                }

                ViewBag.ReservationsChange = Math.Round(reservationsChange, 1);
            }
            catch (Exception)
            {
                // Fallback to static value if calculation fails
                ViewBag.ReservationsChange = 12.0;
            }

            // For rooms change
            ViewBag.RoomsChange = 3.0;

            // For user change
            ViewBag.UserChange = 8.0;

            // ===== NEW: Get Reservation Trends (Last 7 Days) =====
            var last7Days = Enumerable.Range(0, 7)
                .Select(i => today.AddDays(-i))
                .Reverse()
                .ToList();

            var reservationTrends = new List<ReservationTrendViewModel>();

            foreach (var date in last7Days)
            {
                var dayName = date.ToString("ddd"); // Mon, Tue, etc.
                var count = db.Bookings
                    .Where(b => DbFunctions.TruncateTime(b.BookingDate) == date)
                    .Count();

                reservationTrends.Add(new ReservationTrendViewModel
                {
                    Period = dayName,
                    Count = count
                });
            }

            // ===== NEW: Get Room Utilization =====
            var allRooms = db.Rooms.Where(r => !r.DateArchived.HasValue).ToList();
            var totalRooms = allRooms.Count();

            var roomUtilization = new List<RoomUtilizationViewModel>();

            if (totalRooms > 0)
            {
                // Group by Availability status
                var statusGroups = allRooms
                    .GroupBy(r => r.Availability ?? "Unknown")
                    .Select(g => new
                    {
                        Status = g.Key,
                        Count = g.Count()
                    })
                    .ToList();

                foreach (var group in statusGroups)
                {
                    var percentage = Math.Round((group.Count / (double)totalRooms) * 100, 1);

                    roomUtilization.Add(new RoomUtilizationViewModel
                    {
                        Status = group.Status,
                        Count = group.Count,
                        Percentage = percentage
                    });
                }
            }
            else
            {
                // Default data if no rooms exist
                roomUtilization = new List<RoomUtilizationViewModel>
        {
            new RoomUtilizationViewModel { Status = "Available", Count = 0, Percentage = 0 },
            new RoomUtilizationViewModel { Status = "Occupied", Count = 0, Percentage = 0 },
            new RoomUtilizationViewModel { Status = "Maintenance", Count = 0, Percentage = 0 }
        };
            }

            // Pass data to ViewBag
            ViewBag.ReservationTrends = reservationTrends;
            ViewBag.RoomUtilization = roomUtilization;
            ViewBag.ReservationTrendsJson = JsonConvert.SerializeObject(reservationTrends);
            ViewBag.RoomUtilizationJson = JsonConvert.SerializeObject(roomUtilization);

            // ===== Get Reservation Trends for different periods =====
            ViewBag.ReservationTrendsWeek = GetReservationTrendsForPeriod("week");
            ViewBag.ReservationTrendsMonth = GetReservationTrendsForPeriod("month");
            ViewBag.ReservationTrendsYear = GetReservationTrendsForPeriod("year");

            // Add these as JSON too
            ViewBag.ReservationTrendsWeekJson = JsonConvert.SerializeObject(ViewBag.ReservationTrendsWeek);
            ViewBag.ReservationTrendsMonthJson = JsonConvert.SerializeObject(ViewBag.ReservationTrendsMonth);
            ViewBag.ReservationTrendsYearJson = JsonConvert.SerializeObject(ViewBag.ReservationTrendsYear);

            return View();
        }

        private List<ReservationTrendViewModel> GetReservationTrendsForPeriod(string period)
        {
            var today = DateTime.Today;
            List<ReservationTrendViewModel> trends = new List<ReservationTrendViewModel>();

            switch (period.ToLower())
            {
                case "week":
                    // Last 7 days
                    for (int i = 6; i >= 0; i--)
                    {
                        var date = today.AddDays(-i);
                        var dayName = date.ToString("ddd");
                        var count = db.Bookings
                            .Where(b => DbFunctions.TruncateTime(b.BookingDate) == date)
                            .Count();

                        trends.Add(new ReservationTrendViewModel
                        {
                            Period = dayName,
                            Count = count
                        });
                    }
                    break;

                case "month":
                    // Last 30 days, grouped by week
                    for (int i = 3; i >= 0; i--)
                    {
                        var startDate = today.AddDays(-((i + 1) * 7) + 1);
                        var endDate = today.AddDays(-(i * 7));
                        var weekLabel = $"Week {4 - i}";

                        var count = db.Bookings
                            .Where(b => b.BookingDate >= startDate && b.BookingDate <= endDate)
                            .Count();

                        trends.Add(new ReservationTrendViewModel
                        {
                            Period = weekLabel,
                            Count = count
                        });
                    }
                    break;

                case "year":
                    // Last 12 months
                    for (int i = 11; i >= 0; i--)
                    {
                        var monthDate = today.AddMonths(-i);
                        var monthName = monthDate.ToString("MMM");

                        var firstDayOfMonth = new DateTime(monthDate.Year, monthDate.Month, 1);
                        var lastDayOfMonth = firstDayOfMonth.AddMonths(1).AddDays(-1);

                        var count = db.Bookings
                            .Where(b => b.BookingDate >= firstDayOfMonth && b.BookingDate <= lastDayOfMonth)
                            .Count();

                        trends.Add(new ReservationTrendViewModel
                        {
                            Period = monthName,
                            Count = count
                        });
                    }
                    break;
            }

            return trends;
        }

        // GET: /AdminDashboard/Reservations
        public ActionResult Reservations()
        {
            return View(db.Rooms.Where(r => !r.DateArchived.HasValue).ToList());
        }
        // Add this method to AdminDashboardController.cs
        // Replace the GetRoomBookings method with this corrected version
        public ActionResult GetRoomBookings(int roomId)
        {
            var bookings = db.Bookings
                .Where(b => b.RoomID == roomId)
                .OrderByDescending(b => b.BookingDate)
                .Select(b => new
                {
                    Id = b.ID,
                    RoomID = b.RoomID,
                    RoomName = b.Room.RoomName,
                    ReserveeFirstName = b.ReserveeFirstName,
                    ReserveeMiddleName = b.ReserveeMiddleName,
                    ReserveeLastName = b.ReserveeLastName,
                    ReserveeEmail = b.ReserveeEmail,
                    StudentNumber = b.StudentNumber,
                    Program = b.Program,
                    Purpose = b.Purpose,
                    BookingDate = b.BookingDate,
                    SubmittedAt = b.SubmittedAt,
                    ApprovedAt = b.ApprovedAt,
                    CancelledAt = b.CancelledAt,
                    ScheduleStartTime = b.Schedule.StartTime,
                    ScheduleEndTime = b.Schedule.EndTime,
                    Members = b.Members.Select(m => m.FullName).ToList()
                })
                .ToList()
                .Select(b => new BookingViewModel
                {
                    Id = b.Id,
                    BookingId = b.Id.ToString("D4"), // Format after materialization
                    RoomId = b.RoomID,
                    RoomName = b.RoomName,
                    ReserveeName = FormatName(b.ReserveeLastName, b.ReserveeFirstName, b.ReserveeMiddleName),
                    ReserveeEmail = b.ReserveeEmail,
                    StudentNumber = b.StudentNumber,
                    Program = b.Program,
                    Purpose = b.Purpose,
                    BookingDate = b.BookingDate,
                    SubmittedAt = b.SubmittedAt,
                    ApprovedAt = b.ApprovedAt,
                    CancelledAt = b.CancelledAt,
                    Status = GetBookingStatus(b.SubmittedAt, b.ApprovedAt, b.CancelledAt),
                    Schedule = FormatSchedule(b.ScheduleStartTime, b.ScheduleEndTime),
                    Members = b.Members
                })
                .ToList();

            return Json(bookings, JsonRequestBehavior.AllowGet);
        }

        // Helper method to format name
        private string FormatName(string lastName, string firstName, string middleName)
        {
            var nameParts = new List<string>();

            if (!string.IsNullOrEmpty(lastName))
                nameParts.Add(lastName);

            if (!string.IsNullOrEmpty(firstName))
                nameParts.Add(firstName);

            if (!string.IsNullOrEmpty(middleName))
                nameParts.Add(middleName);

            return nameParts.Count > 0 ? string.Join(", ", nameParts) : "Unknown";
        }

        // Helper method to determine booking status
        private string GetBookingStatus(DateTime? submittedAt, DateTime? approvedAt, DateTime? cancelledAt)
        {
            if (cancelledAt.HasValue)
                return "Cancelled";
            if (approvedAt.HasValue)
                return "Approved";
            if (submittedAt.HasValue)
                return "Pending";
            return "Draft";
        }

        // Helper method to format schedule
        private string FormatSchedule(TimeSpan? startTime, TimeSpan? endTime)
        {
            if (!startTime.HasValue || !endTime.HasValue)
                return "No schedule";

            return $"{startTime.Value:hh\\:mm} - {endTime.Value:hh\\:mm}";
        }
        // Add this method to get a single booking's details
        // Update the GetBookingDetails method in AdminDashboardController.cs
        public ActionResult GetBookingDetails(int id)
        {
            var booking = db.Bookings
                .Include(b => b.Members) // Make sure to include Members
                .Include(b => b.Room)
                .Include(b => b.Schedule)
                .Where(b => b.ID == id)
                .Select(b => new
                {
                    Id = b.ID,
                    RoomID = b.RoomID,
                    RoomName = b.Room.RoomName,
                    ReserveeFirstName = b.ReserveeFirstName,
                    ReserveeMiddleName = b.ReserveeMiddleName,
                    ReserveeLastName = b.ReserveeLastName,
                    ReserveeEmail = b.ReserveeEmail,
                    StudentNumber = b.StudentNumber,
                    Program = b.Program,
                    Purpose = b.Purpose,
                    BookingDate = b.BookingDate,
                    SubmittedAt = b.SubmittedAt,
                    ApprovedAt = b.ApprovedAt,
                    CancelledAt = b.CancelledAt,
                    ScheduleStartTime = b.Schedule.StartTime,
                    ScheduleEndTime = b.Schedule.EndTime,
                    Members = b.Members.Select(m => m.FullName).ToList() // Ensure this is properly populated
                })
                .FirstOrDefault();

            if (booking == null)
            {
                return Json(new { error = "Booking not found" }, JsonRequestBehavior.AllowGet);
            }

            var bookingViewModel = new BookingViewModel
            {
                Id = booking.Id,
                BookingId = booking.Id.ToString("D4"),
                RoomId = booking.RoomID,
                RoomName = booking.RoomName,
                ReserveeName = FormatName(booking.ReserveeLastName, booking.ReserveeFirstName, booking.ReserveeMiddleName),
                ReserveeEmail = booking.ReserveeEmail,
                StudentNumber = booking.StudentNumber,
                Program = booking.Program,
                Purpose = booking.Purpose,
                BookingDate = booking.BookingDate,
                SubmittedAt = booking.SubmittedAt,
                ApprovedAt = booking.ApprovedAt,
                CancelledAt = booking.CancelledAt,
                Status = GetBookingStatus(booking.SubmittedAt, booking.ApprovedAt, booking.CancelledAt),
                Schedule = FormatSchedule(booking.ScheduleStartTime, booking.ScheduleEndTime),
                Members = booking.Members // This should now have the members
            };

            return Json(bookingViewModel, JsonRequestBehavior.AllowGet);
        }
        // Add these methods for bulk cancellation
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult CancelMultipleBookings(List<int> ids)
        {
            try
            {
                var bookings = db.Bookings.Where(b => ids.Contains(b.ID)).ToList();
                foreach (var booking in bookings)
                {
                    booking.CancelledAt = DateTime.Now;
                }

                db.SaveChanges();
                return Json(new { success = true, count = bookings.Count });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult CancelAllBookings(int roomId)
        {
            try
            {
                var bookings = db.Bookings.Where(b => b.RoomID == roomId && !b.CancelledAt.HasValue).ToList();
                foreach (var booking in bookings)
                {
                    booking.CancelledAt = DateTime.Now;
                }

                db.SaveChanges();
                return Json(new { success = true, count = bookings.Count });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }


        // R00MS
        // GET: /AdminDashboard/Rooms
        public ActionResult Rooms()
        {
            return View(db.Rooms.Where(r => !r.DateArchived.HasValue).ToList());
        }
        // POST: AdminDashboard/CreateRoom
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult CreateRoom([Bind(Include = "ID,RoomName,RoomType,Capacity,Availability,DateArchived")] Room room)
        {
            if (ModelState.IsValid)
            {
                db.Rooms.Add(room);
                db.SaveChanges();
                return RedirectToAction("Rooms");
            }

            return View("Rooms", room);
        }
        // POST: AdminDashboard/EditRoom/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult EditRoom([Bind(Include = "ID,RoomName,RoomType,Capacity,Availability,DateArchived")] Room room)
        {
            if (ModelState.IsValid)
            {
                db.Entry(room).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Rooms");
            }
            return View(room);
        }

        // Add this method to AdminDashboard.cs
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult ArchiveRoom(int id)
        {
            var room = db.Rooms.Find(id);
            if (room != null)
            {
                room.DateArchived = DateTime.Now;
                db.Entry(room).State = EntityState.Modified;
                db.SaveChanges();
            }

            return RedirectToAction("Rooms");
        }
        // Ensure this method exists and is correct
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult CancelBooking(int id)
        {
            try
            {
                var booking = db.Bookings.Find(id);
                if (booking != null)
                {
                    booking.CancelledAt = DateTime.Now;
                    db.Entry(booking).State = EntityState.Modified;
                    db.SaveChanges();
                    return Json(new { success = true });
                }
                return Json(new { success = false, message = "Booking not found" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }
        // Archive multiple bookings
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult ArchiveBookings(List<int> ids)
        {
            try
            {
                var bookings = db.Bookings.Where(b => ids.Contains(b.ID)).ToList();
                foreach (var booking in bookings)
                {
                    // Add DateArchived field to Booking model first
                    // Then uncomment this:
                    // booking.DateArchived = DateTime.Now;
                }

                db.SaveChanges();
                return Json(new { success = true, count = bookings.Count });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        // Archive single booking
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult ArchiveBooking(int id)
        {
            try
            {
                var booking = db.Bookings.Find(id);
                if (booking != null)
                {
                    // Add DateArchived field to Booking model first
                    // Then uncomment this:
                    // booking.DateArchived = DateTime.Now;
                    db.Entry(booking).State = EntityState.Modified;
                    db.SaveChanges();
                    return Json(new { success = true });
                }
                return Json(new { success = false, message = "Booking not found" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }



        // USERS
        // GET: /AdminDashboard/Librarian (User actually)
        public ActionResult Librarian()
        {
            var usersWithRoles = GetUsersWithRoles();
            return View(usersWithRoles);
        }
        private List<UserWithRolesViewModel> GetUsersWithRoles()
        {
            var usersWithRoles = (from user in db.Users
                                  where user.DateArchived == null // Only active users
                                  select new UserWithRolesViewModel
                                  {
                                      ID = user.ID,
                                      FirstName = user.FirstName,
                                      LastName = user.LastName,
                                      MiddleName = user.MiddleName,
                                      Suffix = user.Suffix,
                                      Email = user.Email,
                                      AccountStatus = user.AccountStatus,
                                      DateArchived = user.DateArchived,
                                      Roles = (from roleMapping in db.UserRolesMappings
                                               join role in db.RoleMasters
                                               on roleMapping.RoleID equals role.ID
                                               where roleMapping.UserID == user.ID
                                               select role.RoleName).ToList()
                                  }).ToList();

            return usersWithRoles;
        }
        // Helper methods to get separated lists
        public List<UserWithRolesViewModel> GetAdmins(List<UserWithRolesViewModel> allUsers)
        {
            return allUsers.Where(u => u.IsAdmin).ToList();
        }
        public List<UserWithRolesViewModel> GetLibrarians(List<UserWithRolesViewModel> allUsers)
        {
            return allUsers.Where(u => u.IsLibrarian).ToList();
        }
        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
        // POST: AdminDashboard/CreateUser
        // In your AdminDashboardController, update the CreateUser method to ensure proper role assignment:

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult CreateUser([Bind(Include = "ID,FirstName,LastName,MiddleName,Suffix,Email,UserPassword,AccountStatus,DateArchived")] User user, int roleId)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    // Set default values
                    user.AccountStatus = "Active";
                    user.DateArchived = null;

                    // Generate simple random password
                    user.UserPassword = GeneratePassword();

                    // Add user
                    db.Users.Add(user);
                    db.SaveChanges(); // user.ID is generated here

                    // Create user role mapping
                    var userRoleMapping = new UserRolesMapping
                    {
                        UserID = user.ID,
                        RoleID = roleId
                    };

                    db.UserRolesMappings.Add(userRoleMapping);
                    db.SaveChanges();

                    // ---- EMAIL: notify user of their account ----
                    try
                    {
                        string subject = "Your LiBook account has been created";
                        string body = $@"
            <p>Hi {System.Web.HttpUtility.HtmlEncode(user.FirstName)},</p>
            <p>Your account was created. Here are your login details:</p>
            <ul>
              <li><strong>Email:</strong> {System.Web.HttpUtility.HtmlEncode(user.Email)}</li>
              <li><strong>Password:</strong> {System.Web.HttpUtility.HtmlEncode(user.UserPassword)}</li>
            </ul>
            <p>Thanks,<br/>Your Team</p>";

                        // Synchronous send:
                        LiBook.Helpers.EmailHelper.SendEmail(user.Email, subject, body);
                    }
                    catch (Exception mailEx)
                    {
                        // Log email error but don't fail user creation
                        System.Diagnostics.Debug.WriteLine("Email sending failed: " + mailEx.Message);
                    }

                    return RedirectToAction("Librarian");
                }
                catch (Exception ex)
                {
                    ModelState.AddModelError("", "An error occurred while creating the user: " + ex.Message);
                }
            }

            // If we got here, something went wrong - reload the page with users
            var usersWithRoles = GetUsersWithRoles();
            return View("Librarian", usersWithRoles);
        }
        private string GeneratePassword()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 8)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
        // POST: AdminDashboard/EditUser/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult EditUser([Bind(Include = "ID,FirstName,LastName,MiddleName,Suffix,Email,UserPassword,AccountStatus,DateArchived")] User user)
        {
            if (ModelState.IsValid)
            {
                db.Entry(user).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Librarian");
            }
            return RedirectToAction("Librarian");
        }
        // Add this method to AdminDashboard.cs (after the EditUser method)
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult ArchiveUser(int id)
        {
            var user = db.Users.Find(id);
            if (user != null)
            {
                user.DateArchived = DateTime.Now;
                user.AccountStatus = "Inactive";
                db.Entry(user).State = EntityState.Modified;
                db.SaveChanges();
            }

            return RedirectToAction("Librarian");
        }








        // GET: /AdminDashboard/AdminManagement
        public ActionResult AdminManagement()
        {
            return View();
        }

        // GET: /AdminDashboard/Archives
        // In AdminDashboardController.cs, add this method in the Archives section:

        public ActionResult Archives()
        {
            // Get archived rooms
            var archivedRooms = db.Rooms
                .Where(r => r.DateArchived.HasValue)
                .OrderByDescending(r => r.DateArchived)
                .ToList();
            ViewBag.ArchivedRooms = archivedRooms;

            // Get cancelled bookings
            var cancelledBookings = db.Bookings
                .Where(b => b.CancelledAt.HasValue)
                .OrderByDescending(b => b.CancelledAt)
                .ToList();
            ViewBag.CancelledBookings = cancelledBookings;

            // Get archived users
            var archivedUsers = db.Users
                .Where(u => u.DateArchived.HasValue)
                .OrderByDescending(u => u.DateArchived)
                .ToList();
            ViewBag.ArchivedUsers = archivedUsers;

            return View();
        }

        // Add restore/unarchive methods:

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult RestoreRoom(int id)
        {
            var room = db.Rooms.Find(id);
            if (room != null)
            {
                room.DateArchived = null;
                db.Entry(room).State = EntityState.Modified;
                db.SaveChanges();
                TempData["SuccessMessage"] = "Room has been restored successfully.";
            }
            else
            {
                TempData["ErrorMessage"] = "Room not found.";
            }
            return RedirectToAction("Archives");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult ApproveBooking(int id)
        {
            var booking = db.Bookings.Find(id);
            if (booking != null)
            {
                // Instead of unarchiving, we'll just remove the cancelled status
                // Or you might want to create a new booking - depending on your business logic
                // For now, let's just remove the cancellation
                booking.CancelledAt = null;
                db.Entry(booking).State = EntityState.Modified;
                db.SaveChanges();
                TempData["SuccessMessage"] = "Booking has been approved/restored successfully.";
            }
            else
            {
                TempData["ErrorMessage"] = "Booking not found.";
            }
            return RedirectToAction("Archives");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult RestoreUser(int id)
        {
            var user = db.Users.Find(id);
            if (user != null)
            {
                user.DateArchived = null;
                user.AccountStatus = "Active";
                db.Entry(user).State = EntityState.Modified;
                db.SaveChanges();
                TempData["SuccessMessage"] = "User has been restored successfully.";
            }
            else
            {
                TempData["ErrorMessage"] = "User not found.";
            }
            return RedirectToAction("Archives");
        }
    }
}