using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using LiBook.Models;

namespace LiBook.Controllers
{
    [Authorize(Roles = "Librarian")]
    public class LibrarianController : Controller
    {
        private LiBookEntities db = new LiBookEntities();

        // ============================================
        // DASHBOARD
        // ============================================
        public ActionResult LibrarianDashboard()
        {
            return View();
        }

        // ============================================
        // RESERVATIONS PAGE
        // ============================================
        public ActionResult LibrarianReservations()
        {
            return View();
        }

        // ============================================
        // ROOM MANAGEMENT PAGE - DATABASE ONLY
        // ============================================
        public ActionResult RoomManagement()
        {
            try
            {
                // Get all non-archived rooms
                var allRooms = db.Rooms.Where(r => !r.DateArchived.HasValue).ToList();

                // Create view models using ONLY actual database fields
                var rooms = allRooms.Select(r => new RoomManagementViewModel
                {
                    RoomID = r.ID,
                    RoomName = r.RoomName,
                    RoomType = r.RoomType,
                    Capacity = r.Capacity,
                    Status = r.Availability
                }).ToList();

                // Calculate stats based on Availability field
                ViewBag.AllCount = rooms.Count;
                ViewBag.AvailableCount = rooms.Count(r => r.Status != null && r.Status.Equals("Available", StringComparison.OrdinalIgnoreCase));
                ViewBag.UnavailableCount = rooms.Count(r => r.Status != null && r.Status.Equals("Unavailable", StringComparison.OrdinalIgnoreCase));
                ViewBag.MaintenanceCount = rooms.Count(r => r.Status != null && r.Status.Equals("Maintenance", StringComparison.OrdinalIgnoreCase));

                return View(rooms);
            }
            catch (Exception ex)
            {
                ViewBag.ErrorMessage = "Error loading rooms: " + ex.Message;
                ViewBag.AllCount = 0;
                ViewBag.AvailableCount = 0;
                ViewBag.UnavailableCount = 0;
                ViewBag.MaintenanceCount = 0;
                return View(new List<RoomManagementViewModel>());
            }
        }

        // ============================================
        // AJAX: GET ALL ROOMS - DATABASE ONLY
        // ============================================
        [HttpGet]
        public JsonResult GetAllRooms()
        {
            try
            {
                var allRooms = db.Rooms.Where(r => !r.DateArchived.HasValue).ToList();

                var rooms = allRooms.Select(r => new
                {
                    id = r.ID,
                    name = r.RoomName,
                    type = r.RoomType,
                    capacity = r.Capacity,
                    status = r.Availability
                }).ToList();

                var stats = new
                {
                    allCount = rooms.Count,
                    availableCount = rooms.Count(r => r.status != null && r.status.Equals("Available", StringComparison.OrdinalIgnoreCase)),
                    unavailableCount = rooms.Count(r => r.status != null && r.status.Equals("Unavailable", StringComparison.OrdinalIgnoreCase)),
                    maintenanceCount = rooms.Count(r => r.status != null && r.status.Equals("Maintenance", StringComparison.OrdinalIgnoreCase))
                };

                return Json(new { success = true, data = rooms, stats = stats }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        // ============================================
        // AJAX: GET ROOM DATA - DATABASE ONLY
        // ============================================
        [HttpGet]
        public JsonResult GetRoomData(int roomId)
        {
            try
            {
                var room = db.Rooms.FirstOrDefault(r => r.ID == roomId && !r.DateArchived.HasValue);

                if (room == null)
                {
                    return Json(new { success = false, message = "Room not found" }, JsonRequestBehavior.AllowGet);
                }

                var roomData = new
                {
                    id = room.ID,
                    name = room.RoomName,
                    type = room.RoomType,
                    capacity = room.Capacity,
                    status = room.Availability
                };

                return Json(new { success = true, data = roomData }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        // ============================================
        // AJAX: ADD NEW ROOM
        // ============================================
        [HttpPost]
        public JsonResult AddRoom(Room room)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    db.Rooms.Add(room);
                    db.SaveChanges();
                    return Json(new { success = true, message = "Room added successfully" });
                }
                return Json(new { success = false, message = "Invalid data" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        // ============================================
        // AJAX: UPDATE ROOM
        // ============================================
        [HttpPost]
        public JsonResult UpdateRoom(Room room)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    var existingRoom = db.Rooms.Find(room.ID);
                    if (existingRoom != null)
                    {
                        existingRoom.RoomName = room.RoomName;
                        existingRoom.RoomType = room.RoomType;
                        existingRoom.Capacity = room.Capacity;
                        existingRoom.Availability = room.Availability;
                        
                        db.SaveChanges();
                        return Json(new { success = true, message = "Room updated successfully" });
                    }
                    return Json(new { success = false, message = "Room not found" });
                }
                return Json(new { success = false, message = "Invalid data" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        // ============================================
        // AJAX: DELETE ROOM (Archive)
        // ============================================
        [HttpPost]
        public JsonResult DeleteRoom(int roomId)
        {
            try
            {
                var room = db.Rooms.Find(roomId);
                if (room != null)
                {
                    // Soft delete by setting DateArchived
                    room.DateArchived = DateTime.Now;
                    db.SaveChanges();
                    return Json(new { success = true, message = "Room archived successfully" });
                }
                return Json(new { success = false, message = "Room not found" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        // ============================================
        // ARCHIVES PAGE
        // ============================================
        public ActionResult LibrarianArchives()
        {
            return View();
        }

        // ============================================
        // CLEANUP
        // ============================================
        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
    }

    // ============================================
    // VIEW MODEL - DATABASE FIELDS ONLY
    // ============================================
    public class RoomManagementViewModel
    {
        public int RoomID { get; set; }
        public string RoomName { get; set; }
        public string RoomType { get; set; }
        public int Capacity { get; set; }
        public string Status { get; set; }
    }
}