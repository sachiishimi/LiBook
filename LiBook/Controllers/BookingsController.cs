using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace LiBook.Controllers
{
    public class BookingsController : Controller
    {
        // GET: Bookings/Landing
        public ActionResult Landing()
        {
            return View("BookingLanding"); // Explicitly specify your view name
        }

        // GET: Bookings/Index
        public ActionResult Index()
        {
            return View();
        }
    }
}