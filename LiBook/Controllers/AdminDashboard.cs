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

                        // OR asynchronous (fire-and-forget pattern — be careful)
                        // var _ = YourNamespace.Helpers.EmailHelper.SendEmailAsync(user.Email, subject, body);
                    }
                    catch (Exception mailEx)
                    {
                        // handle email errors (log them); do NOT necessarily fail the entire user creation
                        // Example: log to file/DB or add a ModelState warning
                        ModelState.AddModelError("", "User created but failed to send email: " + mailEx.Message);
                    }

                    return RedirectToAction("Librarian");
                }
                catch (Exception ex)
                {
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