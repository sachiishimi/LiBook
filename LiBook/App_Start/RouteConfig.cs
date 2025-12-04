using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace LiBook
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                name: "Login",
                url: "{controller}/{action}/{id}",
               defaults: new { controller = "Account", action = "Login", id = UrlParameter.Optional }

            );
            routes.MapRoute(
                name: "BookRoom",
                url: "book",
                defaults: new { controller = "Bookings", action = "Landing" }
            );

            routes.MapRoute(
                name: "BookingStart",
                url: "booking/start",
                defaults: new { controller = "Bookings", action = "Landing" }
            );

            // Home route
            routes.MapRoute(  
                name: "Home",
                url: "",
                defaults: new { controller = "Bookings", action = "Landing" }
            );

            routes.MapRoute(
               name: "Default",
               url: "",
               defaults: new { controller = "Home", action = "Index" }
);
        }
    }
}
