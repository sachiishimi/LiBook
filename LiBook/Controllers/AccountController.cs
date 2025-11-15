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
                bool IsValidUser = context.Users.Any(user => user.Email.ToLower() ==
                     model.Email.ToLower() && user.UserPassword == model.UserPassword);
                if (IsValidUser)
                {
                    FormsAuthentication.SetAuthCookie(model.Email, false);
                    return RedirectToAction("Index", "AdminDashboard");
                }
                ModelState.AddModelError("", "invalid Username or Password");
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