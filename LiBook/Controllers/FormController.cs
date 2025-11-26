using System;
using System.Collections.Generic;
using System.Web.Mvc;
using LiBook.Models; // Make sure to include your Models namespace


namespace LiBook.Controllers
{
    public class FormController : Controller
    {
        // GET methods
        public ActionResult StudentView() => View();
        public ActionResult FacultyView() => View();
        public ActionResult AdminView() => View();
        public ActionResult VisitorView() => View();

        // POST method for the Student form
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult StudentView(StudentViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            System.Diagnostics.Debug.WriteLine($"Student: {model.LastName}, {model.FirstName}, {model.MiddleInitial}");
            System.Diagnostics.Debug.WriteLine($"Student Number: {model.StudentNumberPrefix}-{model.StudentNumberSuffix}");
            System.Diagnostics.Debug.WriteLine($"Email: {model.Email}");
            System.Diagnostics.Debug.WriteLine($"Program: {model.Program}");
            System.Diagnostics.Debug.WriteLine($"Purpose: {model.Purpose}");
            System.Diagnostics.Debug.WriteLine($"Date: {model.Date.ToShortDateString()}");
            System.Diagnostics.Debug.WriteLine($"Time: {model.TimeStart} - {model.TimeEnd}");
            System.Diagnostics.Debug.WriteLine($"Number of Members: {model.NumberOfMembers}");

            if (model.Members != null)
            {
                var membersList = string.Join(", ", model.Members);
                System.Diagnostics.Debug.WriteLine(membersList);
            }

            TempData["SuccessMessage"] = "Form submitted successfully!";
            return RedirectToAction("StudentView");
        }
    }
}
