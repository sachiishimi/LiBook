using System.Web.Mvc;
using System.Web.Security;

namespace LiBook.Controllers
{
    public class AccountController : Controller
    {
        // GET: /Account/Login
        public ActionResult Login()
        {
            if (User.Identity.IsAuthenticated)
            {
                return RedirectToAction("Index", "AdminDashboard");
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

                if (AuthenticateAdmin(email, password))
                {
                    FormsAuthentication.SetAuthCookie(email, false);
                    return RedirectToAction("Index", "AdminDashboard");
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
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Logout()
        {
            FormsAuthentication.SignOut();
            return RedirectToAction("Login");
        }

        private bool AuthenticateAdmin(string email, string password)
        {
            var validAdminEmail = "admin@libook.com";
            var validAdminPassword = "admin123";
            return email.ToLower() == validAdminEmail.ToLower() && password == validAdminPassword;
        }
    }
}