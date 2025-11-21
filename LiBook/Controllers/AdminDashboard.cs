using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using LiBook.Models;
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
            return View();
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
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult CreateUser([Bind(Include = "ID,FirstName,LastName,MiddleName,Suffix,Email,UserPassword,AccountStatus,DateArchived")] User user, int roleId)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    // Set default values
                    user.AccountStatus = "Active"; // Set status to Active by default
                    user.DateArchived = null; // Ensure DateArchived is null for active accounts

                    // Generate simple random password
                    user.UserPassword = GeneratePassword();

                    // Add user to database
                    db.Users.Add(user);
                    db.SaveChanges(); // This will generate the User ID

                    // Create user role mapping
                    var userRoleMapping = new UserRolesMapping
                    {
                        UserID = user.ID, // The generated User ID
                        RoleID = roleId   // The role ID passed from the view
                    };

                    // Add the mapping to database
                    db.UserRolesMappings.Add(userRoleMapping);
                    db.SaveChanges();

                    return RedirectToAction("Librarian");
                }
                catch (Exception ex)
                {
                    // Handle any exceptions (log them, show error message, etc.)
                    ModelState.AddModelError("", "An error occurred while creating the user: " + ex.Message);
                }
            }

            return View(user);
        }
        private string GeneratePassword()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 8)
                .Select(s => s[random.Next(s.Length)]).ToArray());
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