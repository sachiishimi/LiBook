using System.Web.Mvc;
using System.Web.Security;
using System.Collections.Generic;
using System.Linq;

namespace LiBook.Controllers
{
    // User Role Enum
    public enum UserRole
    {
        Admin,
        Librarian
    }

    // User Model for authentication
    public class UserAccount
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public UserRole Role { get; set; }
    }

    public class AccountController : Controller
    {
        // Hardcoded user accounts (In production, use database)
        private static List<UserAccount> Users = new List<UserAccount>
        {
            new UserAccount
            {
                Email = "admin@libook.com",
                Password = "admin123",
                Role = UserRole.Admin
            },
            new UserAccount
            {
                Email = "librarian@libook.com",
                Password = "librarian123",
                Role = UserRole.Librarian
            }
        };

        // GET: /Account/Login
        public ActionResult Login()
        {
            if (User.Identity.IsAuthenticated)
            {
                // Get user role from session
                var userRole = Session["UserRole"] as string;

                if (userRole == UserRole.Admin.ToString())
                {
                    return RedirectToAction("Index", "AdminDashboard");
                }
                else if (userRole == UserRole.Librarian.ToString())
                {
                    return RedirectToAction("LibrarianDashboard", "Librarian");
                }
            }
            return View();
        }

        // POST: /Account/Login
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Login(string email, string password)
        {
            try
            {
                if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
                {
                    TempData["Error"] = "Please enter both email and password.";
                    return View();
                }

                var authenticatedUser = AuthenticateUser(email, password);

                if (authenticatedUser != null)
                {
                    // Set authentication cookie
                    FormsAuthentication.SetAuthCookie(email, false);

                    // Store user role in session
                    Session["UserRole"] = authenticatedUser.Role.ToString();
                    Session["UserEmail"] = authenticatedUser.Email;

                    // Redirect based on role
                    if (authenticatedUser.Role == UserRole.Admin)
                    {
                        return RedirectToAction("Index", "AdminDashboard");
                    }
                    else if (authenticatedUser.Role == UserRole.Librarian)
                    {
                        // FIXED: Changed from "Librarian" action to "LibrarianDashboard" action
                        return RedirectToAction("LibrarianDashboard", "Librarian");
                    }
                }
                else
                {
                    TempData["Error"] = "Invalid email or password.";
                    return View();
                }
            }
            catch
            {
                TempData["Error"] = "An error occurred during login. Please try again.";
                return View();
            }

            return View();
        }

        // POST: /Account/Logout
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Logout()
        {
            FormsAuthentication.SignOut();
            Session.Clear();
            Session.Abandon();
            return RedirectToAction("Login");
        }

        // Authenticate user and return user account if valid
        private UserAccount AuthenticateUser(string email, string password)
        {
            var user = Users.FirstOrDefault(u =>
                u.Email.Equals(email, System.StringComparison.OrdinalIgnoreCase) &&
                u.Password == password
            );

            return user;
        }

        // Helper method to check if current user is Admin
        public static bool IsAdmin(System.Web.HttpSessionStateBase session)
        {
            var userRole = session["UserRole"] as string;
            return userRole == UserRole.Admin.ToString();
        }

        // Helper method to check if current user is Librarian
        public static bool IsLibrarian(System.Web.HttpSessionStateBase session)
        {
            var userRole = session["UserRole"] as string;
            return userRole == UserRole.Librarian.ToString();
        }
    }
}