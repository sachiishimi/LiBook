using System.Web.Mvc;

namespace LiBook.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult RoleSelection(string role)
        {
            if (string.IsNullOrEmpty(role))
            {
                ViewBag.Error = "Please select a role.";
                return View();
            }

            switch (role)
            {
                case "Student": return RedirectToAction("StudentView", "Form");
                case "Faculty": return RedirectToAction("FacultyView", "Form");
                case "Admin": return RedirectToAction("AdminView", "Form");
                case "Visitor": return RedirectToAction("VisitorView", "Form");
                default: return View();
            }
        }


    }
}
