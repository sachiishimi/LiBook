using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace LiBook.Controllers
{
    public class FormController : Controller
    {
        public ActionResult StudentView() => View();
        public ActionResult FacultyView() => View();
        public ActionResult AdminView() => View();
        public ActionResult VisitorView() => View();
    }
}