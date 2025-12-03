using System.Web.Mvc;

namespace LiBook.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            // Redirect to the booking landing view
            return View("~/Views/Bookings/BookingLanding.cshtml");
        }

        public ActionResult Login()
        {
            return View();
        }

        public ActionResult Admindashboard()
        {
            return View();
        }
    }
}