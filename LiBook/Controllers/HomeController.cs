using System.Web.Mvc;

namespace LiBook.Controllers
{
    public class HomeController : Controller
    {
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
