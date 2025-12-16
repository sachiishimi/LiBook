using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using LiBook.Models;

namespace LiBook.Controllers
{
    [Authorize(Roles = "Librarian")]
    public class NotificationsController : Controller
    {
        private LiBookEntities db = new LiBookEntities();

        // GET: GetNotifications
        public JsonResult GetNotifications()
        {
            try
            {
                var notifications = new List<NotificationViewModel>();

                // Get recent bookings (last 24 hours)
                var recentBookings = db.Bookings
                    .Where(b => b.BookingDate >= DateTime.Now.AddHours(-24))
                    .OrderByDescending(b => b.BookingDate)
                    .Take(10)
                    .ToList();

                foreach (var booking in recentBookings)
                {
                    // Determine if it's a cancellation or new booking
                    var isCancelled = booking.Status != null &&
                                     (booking.Status.ToLower() == "cancelled" ||
                                      booking.Status.ToLower() == "canceled" ||
                                      booking.Status.ToLower() == "declined");

                    // Get room name
                    var roomName = booking.Room != null ? booking.Room.RoomName : "Unknown Room";

                    // Get reservee name (from Member or direct fields)
                    string reserveeName = "Guest";
                    if (booking.Member != null)
                    {
                        reserveeName = $"{booking.Member.FirstName} {booking.Member.LastName}";
                    }
                    else if (!string.IsNullOrEmpty(booking.ReserveeFirstName))
                    {
                        reserveeName = $"{booking.ReserveeFirstName} {booking.ReserveeLastName}";
                    }

                    notifications.Add(new NotificationViewModel
                    {
                        Id = booking.BookingID,
                        Type = isCancelled ? "decline" : "booking",
                        Title = isCancelled ? "Reservation Cancelled" : "New Reservation",
                        Message = $"{reserveeName} {(isCancelled ? "cancelled" : "booked")} {roomName}",
                        Time = GetTimeAgo(booking.BookingDate),
                        IsRead = false, // Always show as unread for now
                        Icon = isCancelled ? "fa-times-circle" : "fa-calendar-check",
                        Color = isCancelled ? "#e74c3c" : "#27ae60",
                        ActionUrl = "/Librarian/LibrarianReservations",
                        CreatedAt = booking.BookingDate
                    });
                }

                // Get recently added rooms (last 7 days)
                // Note: Since DateAdded doesn't exist yet, we'll use top 5 most recent rooms
                var recentRooms = db.Rooms
                    .OrderByDescending(r => r.RoomID)
                    .Take(5)
                    .ToList();

                // Only add if rooms were created recently (you can adjust this logic)
                foreach (var room in recentRooms)
                {
                    // Assuming newer RoomIDs mean recently added
                    // You can remove this section if you don't want room notifications yet
                    notifications.Add(new NotificationViewModel
                    {
                        Id = room.RoomID,
                        Type = "room",
                        Title = "Room Available",
                        Message = $"{room.RoomName} is available for booking",
                        Time = "Recently added",
                        IsRead = false,
                        Icon = "fa-door-open",
                        Color = "#3498db",
                        ActionUrl = "/Librarian/RoomManagement",
                        CreatedAt = DateTime.Now.AddDays(-1) // Default date
                    });
                }

                // Sort all notifications by creation date
                var sortedNotifications = notifications
                    .OrderByDescending(n => n.CreatedAt)
                    .Take(20) // Limit to 20 most recent
                    .ToList();

                // Count unread notifications
                var unreadCount = sortedNotifications.Count(n => !n.IsRead);

                return Json(new
                {
                    success = true,
                    unreadCount = unreadCount,
                    notifications = sortedNotifications
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Error loading notifications: " + ex.Message
                }, JsonRequestBehavior.AllowGet);
            }
        }

        // POST: MarkAsRead
        [HttpPost]
        public JsonResult MarkAsRead(int notificationId, string notificationType)
        {
            try
            {
                // For now, just return success
                // After database migration, implement actual mark as read functionality
                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        // POST: MarkAllAsRead
        [HttpPost]
        public JsonResult MarkAllAsRead()
        {
            try
            {
                // For now, just return success
                // After database migration, implement actual mark all as read functionality
                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        private string GetTimeAgo(DateTime dateTime)
        {
            var timeSpan = DateTime.Now - dateTime;

            if (timeSpan.TotalMinutes < 1)
                return "Just now";
            else if (timeSpan.TotalMinutes < 60)
                return $"{(int)timeSpan.TotalMinutes} minute{(timeSpan.TotalMinutes >= 2 ? "s" : "")} ago";
            else if (timeSpan.TotalHours < 24)
                return $"{(int)timeSpan.TotalHours} hour{(timeSpan.TotalHours >= 2 ? "s" : "")} ago";
            else if (timeSpan.TotalDays < 7)
                return $"{(int)timeSpan.TotalDays} day{(timeSpan.TotalDays >= 2 ? "s" : "")} ago";
            else
                return dateTime.ToString("MMM dd, yyyy");
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
    }

    // View Model for notifications
    public class NotificationViewModel
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public string Time { get; set; }
        public bool IsRead { get; set; }
        public string Icon { get; set; }
        public string Color { get; set; }
        public string ActionUrl { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}