using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using LiBook.Models;
using Newtonsoft.Json;
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








        // GET: /AdminDashboard/AdminManagement
        public ActionResult AdminManagement()
        {
            return View();
        }

        // GET: /AdminDashboard/Archives
        public ActionResult Archives()
        {
            return View();
        }
    }
}