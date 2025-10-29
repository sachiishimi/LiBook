using System.Web.Mvc;

namespace LiBook.Controllers
{
    [Authorize] // This protects ALL actions in this controller
    public class AdminDashboardController : Controller
    {
        // GET: /AdminDashboard/Index
        public ActionResult Index()
        {
            return View(); // This will automatically find Views/AdminDashboard/Index.cshtml
        }
    }
}