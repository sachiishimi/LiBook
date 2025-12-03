using System.Web.Mvc;
using System.Web.Security;
using System.Collections.Generic;
using System.Linq;
using LiBook.Models;

namespace LiBook.Controllers
{
    public class AccountController : Controller
    {
        public ActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public ActionResult Login(UserModel model)
        {
            using (LiBookEntities context = new LiBookEntities())
            {
                // First check if user exists and password matches
                var user = context.Users.FirstOrDefault(u => u.Email.ToLower() == model.Email.ToLower()
                                                          && u.UserPassword == model.UserPassword
                                                          && u.AccountStatus == "Active"
                                                          && u.DateArchived == null);

                if (user != null)
                {
                    // Get user roles
                    var userRoles = (from roleMapping in context.UserRolesMappings
                                     join role in context.RoleMasters
                                     on roleMapping.RoleID equals role.ID
                                     where roleMapping.UserID == user.ID
                                     select role.RoleName).ToArray();

                    // Check if user has Librarian OR Admin role
                    if (userRoles.Contains("Librarian") || userRoles.Contains("Admin"))
                    {
                        FormsAuthentication.SetAuthCookie(model.Email, false);

                        // Redirect based on role
                        if (userRoles.Contains("Admin"))
                        {
                            return RedirectToAction("Index", "AdminDashboard");
                        }
                        else
                        {
                            return RedirectToAction("LibrarianDashboard", "Librarian");
                        }
                    }
                    else
                    {
                        ModelState.AddModelError("", "Access denied. Librarian or Admin role required.");
                        return View();
                    }
                }

                ModelState.AddModelError("", "Invalid email or password");
                return View();
            }
        }

        public ActionResult Logout()
        {
            FormsAuthentication.SignOut();
            return RedirectToAction("Login");
        }
    }
}