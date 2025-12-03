//using System;
//using System.Collections.Generic;
//using System.Data;
//using System.Data.Entity;
//using System.Linq;
//using System.Net;
//using System.Web;
//using System.Web.Mvc;
//using LiBook.Models;
//using EntityState = System.Data.Entity.EntityState;

//namespace LiBook.Controllers
//{
//    public class BookingsController : Controller
//    {
//        private LiBookEntities db = new LiBookEntities();

//        // GET: Bookings
//        public ActionResult Index()
//        {
//            var bookings = db.Bookings.Include(b => b.Room).Include(b => b.Schedule);
//            return View(bookings.ToList());
//        }

//        // GET: Bookings/Details/5
//        public ActionResult Details(int? id)
//        {
//            if (id == null)
//            {
//                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
//            }
//            Booking booking = db.Bookings.Find(id);
//            if (booking == null)
//            {
//                return HttpNotFound();
//            }
//            return View(booking);
//        }

//        // GET: Bookings/Create
//        public ActionResult Create()
//        {
//            ViewBag.RoomID = new SelectList(db.Rooms, "ID", "RoomName");
//            ViewBag.ScheduleID = new SelectList(db.Schedules, "ID", "ID");
//            return View();
//        }

//        // POST: Bookings/Create
//        // To protect from overposting attacks, enable the specific properties you want to bind to, for 
//        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.
//        [HttpPost]
//        [ValidateAntiForgeryToken]
//        public ActionResult Create([Bind(Include = "ID,RoomID,ScheduleID,StudentNumber,Program,Purpose,BookingDate,SubmittedAt,ApprovedAt,CancelledAt,ReserveeFirstName,ReserveeMiddleName,ReserveeLastName,ReserveeSuffix,ReserveeEmail")] Booking booking)
//        {
//            if (ModelState.IsValid)
//            {
//                db.Bookings.Add(booking);
//                db.SaveChanges();
//                return RedirectToAction("Index");
//            }

//            ViewBag.RoomID = new SelectList(db.Rooms, "ID", "RoomName", booking.RoomID);
//            ViewBag.ScheduleID = new SelectList(db.Schedules, "ID", "ID", booking.ScheduleID);
//            return View(booking);
//        }

//        // GET: Bookings/Edit/5
//        public ActionResult Edit(int? id)
//        {
//            if (id == null)
//            {
//                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
//            }
//            Booking booking = db.Bookings.Find(id);
//            if (booking == null)
//            {
//                return HttpNotFound();
//            }
//            ViewBag.RoomID = new SelectList(db.Rooms, "ID", "RoomName", booking.RoomID);
//            ViewBag.ScheduleID = new SelectList(db.Schedules, "ID", "ID", booking.ScheduleID);
//            return View(booking);
//        }

//        // POST: Bookings/Edit/5
//        // To protect from overposting attacks, enable the specific properties you want to bind to, for 
//        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.
//        [HttpPost]
//        [ValidateAntiForgeryToken]
//        public ActionResult Edit([Bind(Include = "ID,RoomID,ScheduleID,StudentNumber,Program,Purpose,BookingDate,SubmittedAt,ApprovedAt,CancelledAt,ReserveeFirstName,ReserveeMiddleName,ReserveeLastName,ReserveeSuffix,ReserveeEmail")] Booking booking)
//        {
//            if (ModelState.IsValid)
//            {
//                db.Entry(booking).State = EntityState.Modified;
//                db.SaveChanges();
//                return RedirectToAction("Index");
//            }
//            ViewBag.RoomID = new SelectList(db.Rooms, "ID", "RoomName", booking.RoomID);
//            ViewBag.ScheduleID = new SelectList(db.Schedules, "ID", "ID", booking.ScheduleID);
//            return View(booking);
//        }

//        // GET: Bookings/Delete/5
//        public ActionResult Delete(int? id)
//        {
//            if (id == null)
//            {
//                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
//            }
//            Booking booking = db.Bookings.Find(id);
//            if (booking == null)
//            {
//                return HttpNotFound();
//            }
//            return View(booking);
//        }

//        // POST: Bookings/Delete/5
//        [HttpPost, ActionName("Delete")]
//        [ValidateAntiForgeryToken]
//        public ActionResult DeleteConfirmed(int id)
//        {
//            Booking booking = db.Bookings.Find(id);
//            db.Bookings.Remove(booking);
//            db.SaveChanges();
//            return RedirectToAction("Index");
//        }

//        protected override void Dispose(bool disposing)
//        {
//            if (disposing)
//            {
//                db.Dispose();
//            }
//            base.Dispose(disposing);
//        }
//    }
//}


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