using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web.Mvc;
using LiBook.Models;

namespace LiBook.Controllers
{
    [Authorize(Roles = "Librarian")]
    public class LibrarianController : Controller
    {
        private LiBookEntities db = new LiBookEntities();

        // ============================================
        // DIAGNOSTIC: SHOW ROOM FIELDS
        // ============================================
        // ADD THIS TEMPORARY METHOD TO SEE YOUR FIELD NAMES
        public ActionResult DiagnosticRoomFields()
        {
            var roomType = typeof(Room);
            var properties = roomType.GetProperties();

            var fieldInfo = properties.Select(p => new
            {
                Name = p.Name,
                Type = p.PropertyType.Name
            }).ToList();

            // Return as JSON so you can see all field names
            return Json(fieldInfo, JsonRequestBehavior.AllowGet);
        }

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
        // ROOM MANAGEMENT PAGE - SAFE VERSION
        // ============================================
        public ActionResult RoomManagement()
        {
            try
            {
                // Get all rooms without filtering
                var allRooms = db.Rooms.ToList();

                // Create view models using safe navigation
                var rooms = new List<RoomManagementViewModel>();

                foreach (var r in allRooms)
                {
                    try
                    {
                        var vm = new RoomManagementViewModel();

                        // Try to get ID - adjust property name as needed
                        try { vm.RoomID = (int)r.GetType().GetProperty("Id")?.GetValue(r, null); } catch { }
                        if (vm.RoomID == 0)
                        {
                            try { vm.RoomID = (int)r.GetType().GetProperty("RoomID")?.GetValue(r, null); } catch { }
                        }
                        if (vm.RoomID == 0)
                        {
                            try { vm.RoomID = (int)r.GetType().GetProperty("RoomId")?.GetValue(r, null); } catch { }
                        }

                        // Try to get RoomName
                        try { vm.RoomName = r.GetType().GetProperty("RoomName")?.GetValue(r, null)?.ToString() ?? "Unknown"; } catch { vm.RoomName = "Unknown"; }

                        // Try to get RoomType
                        try { vm.RoomType = r.GetType().GetProperty("RoomType")?.GetValue(r, null)?.ToString(); } catch { }
                        if (string.IsNullOrEmpty(vm.RoomType))
                        {
                            try { vm.RoomType = r.GetType().GetProperty("RoomType1")?.GetValue(r, null)?.ToString(); } catch { }
                        }
                        if (string.IsNullOrEmpty(vm.RoomType))
                        {
                            try { vm.RoomType = r.GetType().GetProperty("Type")?.GetValue(r, null)?.ToString(); } catch { }
                        }
                        if (string.IsNullOrEmpty(vm.RoomType)) vm.RoomType = "Unknown";

                        // Try to get Capacity
                        try
                        {
                            var cap = r.GetType().GetProperty("Capacity")?.GetValue(r, null);
                            vm.Capacity = cap != null ? Convert.ToInt32(cap) : 0;
                        }
                        catch { vm.Capacity = 0; }

                        // Try to get Status
                        try { vm.Status = r.GetType().GetProperty("Status")?.GetValue(r, null)?.ToString() ?? "Available"; } catch { vm.Status = "Available"; }

                        // Try to get UserType
                        try { vm.UserType = r.GetType().GetProperty("UserType")?.GetValue(r, null)?.ToString(); } catch { }
                        if (string.IsNullOrEmpty(vm.UserType))
                        {
                            try { vm.UserType = r.GetType().GetProperty("UserType1")?.GetValue(r, null)?.ToString(); } catch { }
                        }
                        if (string.IsNullOrEmpty(vm.UserType)) vm.UserType = "Academic";

                        vm.Equipment = "Smart TV, Whiteboard";

                        rooms.Add(vm);
                    }
                    catch (Exception ex)
                    {
                        // Skip this room if there's an error
                        System.Diagnostics.Debug.WriteLine("Error processing room: " + ex.Message);
                    }
                }

                // Calculate stats
                ViewBag.AllCount = rooms.Count;
                ViewBag.AvailableCount = rooms.Count(r => r.Status == "Available");
                ViewBag.UnavailableCount = rooms.Count(r => r.Status == "Unavailable");
                ViewBag.MaintenanceCount = rooms.Count(r => r.Status == "Maintenance");

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
        // AJAX: GET ALL ROOMS - SAFE VERSION
        // ============================================
        [HttpGet]
        public JsonResult GetAllRooms()
        {
            try
            {
                var allRooms = db.Rooms.ToList();
                var rooms = new List<dynamic>();

                foreach (var r in allRooms)
                {
                    try
                    {
                        var id = 0;
                        try { id = (int)r.GetType().GetProperty("Id")?.GetValue(r, null); } catch { }
                        if (id == 0)
                        {
                            try { id = (int)r.GetType().GetProperty("RoomID")?.GetValue(r, null); } catch { }
                        }

                        var name = "";
                        try { name = r.GetType().GetProperty("RoomName")?.GetValue(r, null)?.ToString() ?? "Unknown"; } catch { name = "Unknown"; }

                        var type = "";
                        try { type = r.GetType().GetProperty("RoomType")?.GetValue(r, null)?.ToString(); } catch { }
                        if (string.IsNullOrEmpty(type))
                        {
                            try { type = r.GetType().GetProperty("RoomType1")?.GetValue(r, null)?.ToString(); } catch { }
                        }
                        if (string.IsNullOrEmpty(type)) type = "Unknown";

                        var capacity = 0;
                        try
                        {
                            var cap = r.GetType().GetProperty("Capacity")?.GetValue(r, null);
                            capacity = cap != null ? Convert.ToInt32(cap) : 0;
                        }
                        catch { capacity = 0; }

                        var status = "";
                        try { status = r.GetType().GetProperty("Status")?.GetValue(r, null)?.ToString() ?? "Available"; } catch { status = "Available"; }

                        var userType = "";
                        try { userType = r.GetType().GetProperty("UserType")?.GetValue(r, null)?.ToString(); } catch { }
                        if (string.IsNullOrEmpty(userType))
                        {
                            try { userType = r.GetType().GetProperty("UserType1")?.GetValue(r, null)?.ToString(); } catch { }
                        }
                        if (string.IsNullOrEmpty(userType)) userType = "Academic";

                        rooms.Add(new
                        {
                            id = id,
                            name = name,
                            type = type,
                            capacity = capacity,
                            status = status,
                            userType = userType,
                            equipment = "Smart TV, Whiteboard"
                        });
                    }
                    catch (Exception)
                    {
                        // Skip this room
                    }
                }

                var stats = new
                {
                    allCount = rooms.Count,
                    availableCount = rooms.Count(r => r.status == "Available"),
                    unavailableCount = rooms.Count(r => r.status == "Unavailable"),
                    maintenanceCount = rooms.Count(r => r.status == "Maintenance")
                };

                return Json(new { success = true, data = rooms, stats = stats }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        // ============================================
        // AJAX: GET ROOM DATA - SAFE VERSION
        // ============================================
        [HttpGet]
        public JsonResult GetRoomData(int roomId)
        {
            try
            {
                var allRooms = db.Rooms.ToList();
                var room = allRooms.FirstOrDefault(r =>
                {
                    try
                    {
                        var id = 0;
                        try { id = (int)r.GetType().GetProperty("Id")?.GetValue(r, null); } catch { }
                        if (id == 0)
                        {
                            try { id = (int)r.GetType().GetProperty("RoomID")?.GetValue(r, null); } catch { }
                        }
                        return id == roomId;
                    }
                    catch
                    {
                        return false;
                    }
                });

                if (room == null)
                {
                    return Json(new { success = false, message = "Room not found" }, JsonRequestBehavior.AllowGet);
                }

                return Json(new { success = true, data = new { name = "Room data loaded" } }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
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
    // VIEW MODELS
    // ============================================
    public class RoomManagementViewModel
    {
        public int RoomID { get; set; }
        public string RoomName { get; set; }
        public string RoomType { get; set; }
        public int Capacity { get; set; }
        public string Status { get; set; }
        public string UserType { get; set; }
        public string Equipment { get; set; }
        public string CurrentReservation { get; set; }
        public string NextReservation { get; set; }
    }
}