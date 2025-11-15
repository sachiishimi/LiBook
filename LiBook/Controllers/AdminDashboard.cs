using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using LiBook.Models;
using EntityState = System.Data.Entity.EntityState;

namespace LiBook.Controllers
{
    [Authorize(Roles = "Admin")] // This protects ALL actions in this controller
    public class AdminDashboardController : Controller
    {
        private LiBookEntities db = new LiBookEntities();

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



        // R00MS
        // GET: /AdminDashboard/Rooms
        public ActionResult Rooms()
        {
            return View(db.Rooms.Where(r => !r.DateArchived.HasValue).ToList());
        }
        // POST: AdminDashboard/CreateRoom
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult CreateRoom([Bind(Include = "ID,RoomName,RoomType,Capacity,Availability,DateArchived")] Room room)
        {
            if (ModelState.IsValid)
            {
                db.Rooms.Add(room);
                db.SaveChanges();
                return RedirectToAction("Rooms");
            }

            return View("Rooms", room);
        }
        // POST: AdminDashboard/EditRoom/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult EditRoom([Bind(Include = "ID,RoomName,RoomType,Capacity,Availability,DateArchived")] Room room)
        {
            if (ModelState.IsValid)
            {
                db.Entry(room).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Rooms");
            }
            return View(room);
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