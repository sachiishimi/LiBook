using System.Web.Mvc;

namespace LiBook.Controllers
{
    [Authorize] // This protects ALL actions in this controller
    public class AdminDashboardController : Controller
    {
        // GET: /AdminDashboard/Index (Dashboard)
        public ActionResult Index()
        {
            return View();
        }

        // GET: /AdminDashboard/Reservations
        public ActionResult Reservations()
        {
            return View();
        }

        public ActionResult Rooms()
        {
            return View();
        }

        // GET: /AdminDashboard/Librarian
        public ActionResult Librarian()
        {
            return View();
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