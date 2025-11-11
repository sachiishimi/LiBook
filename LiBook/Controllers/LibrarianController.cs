using System.Web.Mvc;

namespace LiBook.Controllers
{
    public class LibrarianController : Controller
    {
        // GET: /Librarian/LibrarianDashboard
        public ActionResult LibrarianDashboard()
        {
            if (!User.Identity.IsAuthenticated || Session["UserRole"] as string != "Librarian")
            {
                return RedirectToAction("Login", "Account");
            }

            ViewBag.UserEmail = Session["UserEmail"];
            ViewBag.UserRole = Session["UserRole"];
            return View("LibrarianDashboard"); // Explicitly specify view name
        }

        // GET: /Librarian/LibrarianReservations
        public ActionResult LibrarianReservations()
        {
            if (!User.Identity.IsAuthenticated || Session["UserRole"] as string != "Librarian")
            {
                return RedirectToAction("Login", "Account");
            }

            ViewBag.UserEmail = Session["UserEmail"];
            ViewBag.UserRole = Session["UserRole"];
            return View("LibrarianReservations"); // Explicitly specify view name
        }

        // GET: /Librarian/RoomManagement
        public ActionResult RoomManagement()
        {
            if (!User.Identity.IsAuthenticated || Session["UserRole"] as string != "Librarian")
            {
                return RedirectToAction("Login", "Account");
            }

            ViewBag.UserEmail = Session["UserEmail"];
            ViewBag.UserRole = Session["UserRole"];
            return View("RoomManagement"); // Explicitly specify view name
        }

        // GET: /Librarian/LibrarianArchives
        public ActionResult LibrarianArchives()
        {
            if (!User.Identity.IsAuthenticated || Session["UserRole"] as string != "Librarian")
            {
                return RedirectToAction("Login", "Account");
            }

            ViewBag.UserEmail = Session["UserEmail"];
            ViewBag.UserRole = Session["UserRole"];
            return View("LibrarianArchives"); // Explicitly specify view name
        }
    }
}