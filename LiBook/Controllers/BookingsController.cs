using System;
using System.Linq;
using System.Web.Mvc;
using LiBook.Models;

namespace LiBook.Controllers
{
    public class BookingsController : Controller
    {
        private LiBookEntities db = new LiBookEntities();

        // GET: Bookings/Landing
        public ActionResult Landing()
        {
            ViewBag.Message = TempData["Message"];
            ViewBag.MessageType = TempData["MessageType"];
            return View("BookingLanding");
        }

        // POST: Bookings/SubmitVisitor
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult SubmitVisitor(VisitorBookingViewModel model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    // Get or create schedule based on BookingTime
                    var schedule = GetOrCreateSchedule(model.BookingTime);

                    // Get available room (simplified - first available room)
                    var availableRoom = db.Rooms.FirstOrDefault(r => r.Availability == "Available");
                    if (availableRoom == null)
                    {
                        TempData["Message"] = "No rooms available at the moment.";
                        TempData["MessageType"] = "error";
                        return RedirectToAction("Landing");
                    }

                    // Create booking entity
                    var booking = new Booking
                    {
                        ReserveeFirstName = model.FirstName,
                        ReserveeLastName = model.LastName,
                        ReserveeMiddleName = !string.IsNullOrEmpty(model.MiddleInitial) ? model.MiddleInitial : null,
                        ReserveeSuffix = model.Suffix,
                        ReserveeEmail = model.Email,
                        StudentNumber = "VISITOR", // Identifier for visitors
                        Program = model.Program,
                        Purpose = model.Purpose,
                        BookingDate = model.BookingDate,
                        RoomID = availableRoom.ID,
                        ScheduleID = schedule.ID,
                        SubmittedAt = DateTime.Now,
                        ApprovedAt = DateTime.Now // Auto-approve for now
                    };

                    db.Bookings.Add(booking);
                    db.SaveChanges();

                    // Add members if any
                    if (model.MemberNames != null)
                    {
                        for (int i = 1; i < model.MemberNames.Count && i < model.MemberCount; i++)
                        {
                            if (!string.IsNullOrWhiteSpace(model.MemberNames[i]))
                            {
                                db.Members.Add(new Member
                                {
                                    BookingID = booking.ID,
                                    FullName = model.MemberNames[i]
                                });
                            }
                        }
                        db.SaveChanges();
                    }

                    TempData["Message"] = $"Booking submitted successfully! Your booking ID is {booking.ID}.";
                    TempData["MessageType"] = "success";
                    return RedirectToAction("Landing");
                }

                // If model state is invalid, show errors
                TempData["Message"] = "Please correct the errors in the form.";
                TempData["MessageType"] = "error";
                return RedirectToAction("Landing");
            }
            catch (Exception ex)
            {
                TempData["Message"] = $"An error occurred: {ex.Message}";
                TempData["MessageType"] = "error";
                return RedirectToAction("Landing");
            }
        }

        // POST: Bookings/SubmitStudent
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult SubmitStudent(StudentBookingViewModel model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    var schedule = GetOrCreateSchedule(model.BookingTime);
                    var availableRoom = db.Rooms.FirstOrDefault(r => r.Availability == "Available");

                    if (availableRoom == null)
                    {
                        TempData["Message"] = "No rooms available at the moment.";
                        TempData["MessageType"] = "error";
                        return RedirectToAction("Landing");
                    }

                    var booking = new Booking
                    {
                        ReserveeFirstName = model.FirstName,
                        ReserveeLastName = model.LastName,
                        ReserveeMiddleName = !string.IsNullOrEmpty(model.MiddleInitial) ? model.MiddleInitial : null,
                        ReserveeSuffix = model.Suffix,
                        ReserveeEmail = model.Email,
                        StudentNumber = model.StudentId,
                        Program = model.Program,
                        Purpose = model.Purpose,
                        BookingDate = model.BookingDate,
                        RoomID = availableRoom.ID,
                        ScheduleID = schedule.ID,
                        SubmittedAt = DateTime.Now,
                        ApprovedAt = DateTime.Now
                    };

                    db.Bookings.Add(booking);
                    db.SaveChanges();

                    // Add members
                    if (model.MemberNames != null)
                    {
                        for (int i = 1; i < model.MemberNames.Count && i < model.MemberCount; i++)
                        {
                            if (!string.IsNullOrWhiteSpace(model.MemberNames[i]))
                            {
                                db.Members.Add(new Member
                                {
                                    BookingID = booking.ID,
                                    FullName = model.MemberNames[i]
                                });
                            }
                        }
                        db.SaveChanges();
                    }

                    TempData["Message"] = $"Booking submitted successfully! Your booking ID is {booking.ID}.";
                    TempData["MessageType"] = "success";
                    return RedirectToAction("Landing");
                }

                TempData["Message"] = "Please correct the errors in the form.";
                TempData["MessageType"] = "error";
                return RedirectToAction("Landing");
            }
            catch (Exception ex)
            {
                TempData["Message"] = $"An error occurred: {ex.Message}";
                TempData["MessageType"] = "error";
                return RedirectToAction("Landing");
            }
        }

        // POST: Bookings/SubmitFaculty
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult SubmitFaculty(FacultyBookingViewModel model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    var schedule = GetOrCreateSchedule(model.BookingTime);
                    var availableRoom = db.Rooms.FirstOrDefault(r => r.Availability == "Available");

                    if (availableRoom == null)
                    {
                        TempData["Message"] = "No rooms available at the moment.";
                        TempData["MessageType"] = "error";
                        return RedirectToAction("Landing");
                    }

                    var booking = new Booking
                    {
                        ReserveeFirstName = model.FirstName,
                        ReserveeLastName = model.LastName,
                        ReserveeMiddleName = !string.IsNullOrEmpty(model.MiddleInitial) ? model.MiddleInitial : null,
                        ReserveeSuffix = model.Suffix,
                        ReserveeEmail = model.Email,
                        StudentNumber = "FACULTY",
                        Program = "FACULTY", // Set to FACULTY since Department property doesn't exist
                        Purpose = model.Purpose,
                        BookingDate = model.BookingDate,
                        RoomID = availableRoom.ID,
                        ScheduleID = schedule.ID,
                        SubmittedAt = DateTime.Now,
                        ApprovedAt = DateTime.Now
                    };

                    db.Bookings.Add(booking);
                    db.SaveChanges();

                    // Add members
                    if (model.MemberNames != null)
                    {
                        for (int i = 1; i < model.MemberNames.Count && i < model.MemberCount; i++)
                        {
                            if (!string.IsNullOrWhiteSpace(model.MemberNames[i]))
                            {
                                db.Members.Add(new Member
                                {
                                    BookingID = booking.ID,
                                    FullName = model.MemberNames[i]
                                });
                            }
                        }
                        db.SaveChanges();
                    }

                    TempData["Message"] = $"Booking submitted successfully! Your booking ID is {booking.ID}.";
                    TempData["MessageType"] = "success";
                    return RedirectToAction("Landing");
                }

                TempData["Message"] = "Please correct the errors in the form.";
                TempData["MessageType"] = "error";
                return RedirectToAction("Landing");
            }
            catch (Exception ex)
            {
                TempData["Message"] = $"An error occurred: {ex.Message}";
                TempData["MessageType"] = "error";
                return RedirectToAction("Landing");
            }
        }

        // POST: Bookings/SubmitAdmin
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult SubmitAdmin(AdminBookingViewModel model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    var schedule = GetOrCreateSchedule(model.BookingTime);
                    var availableRoom = db.Rooms.FirstOrDefault(r => r.Availability == "Available");

                    if (availableRoom == null)
                    {
                        TempData["Message"] = "No rooms available at the moment.";
                        TempData["MessageType"] = "error";
                        return RedirectToAction("Landing");
                    }

                    var booking = new Booking
                    {
                        ReserveeFirstName = model.FirstName,
                        ReserveeLastName = model.LastName,
                        ReserveeMiddleName = !string.IsNullOrEmpty(model.MiddleInitial) ? model.MiddleInitial : null,
                        ReserveeSuffix = model.Suffix,
                        ReserveeEmail = model.Email,
                        StudentNumber = "ADMIN",
                        Program = "ADMIN", // Set to ADMIN since Office property doesn't exist
                        Purpose = model.Purpose,
                        BookingDate = model.BookingDate,
                        RoomID = availableRoom.ID,
                        ScheduleID = schedule.ID,
                        SubmittedAt = DateTime.Now,
                        ApprovedAt = DateTime.Now
                    };

                    db.Bookings.Add(booking);
                    db.SaveChanges();

                    TempData["Message"] = $"Booking submitted successfully! Your booking ID is {booking.ID}.";
                    TempData["MessageType"] = "success";
                    return RedirectToAction("Landing");
                }

                TempData["Message"] = "Please correct the errors in the form.";
                TempData["MessageType"] = "error";
                return RedirectToAction("Landing");
            }
            catch (Exception ex)
            {
                TempData["Message"] = $"An error occurred: {ex.Message}";
                TempData["MessageType"] = "error";
                return RedirectToAction("Landing");
            }
        }

        // Helper method to get or create schedule
        private Schedule GetOrCreateSchedule(string bookingTime)
        {
            try
            {
                // Parse the time string (format: "HH:00")
                if (TimeSpan.TryParse(bookingTime, out var time))
                {
                    // Calculate end time (1 hour duration)
                    var endTime = time.Add(TimeSpan.FromHours(1));

                    // Check if schedule exists
                    var existingSchedule = db.Schedules.FirstOrDefault(s =>
                        s.StartTime == time && s.EndTime == endTime);

                    if (existingSchedule != null)
                    {
                        return existingSchedule;
                    }

                    // Create new schedule
                    var newSchedule = new Schedule
                    {
                        StartTime = time,
                        EndTime = endTime
                    };

                    db.Schedules.Add(newSchedule);
                    db.SaveChanges();
                    return newSchedule;
                }

                // Default schedule if parsing fails
                return db.Schedules.FirstOrDefault() ?? new Schedule
                {
                    StartTime = TimeSpan.FromHours(9),
                    EndTime = TimeSpan.FromHours(10)
                };
            }
            catch
            {
                // Return default schedule if error occurs
                return db.Schedules.FirstOrDefault() ?? new Schedule
                {
                    StartTime = TimeSpan.FromHours(9),
                    EndTime = TimeSpan.FromHours(10)
                };
            }
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
}
