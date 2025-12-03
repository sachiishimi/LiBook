using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace LiBook.Models
{
    public class ViewModel
    {
        public class ReservationTrendViewModel
        {
            public string Period { get; set; }
            public int Count { get; set; }
        }

        public class RoomUtilizationViewModel
        {
            public string Status { get; set; }
            public int Count { get; set; }
            public double Percentage { get; set; }
        }

        public class DashboardViewModel
        {
            public List<ReservationTrendViewModel> ReservationTrends { get; set; }
            public List<RoomUtilizationViewModel> RoomUtilization { get; set; }
        }
    }
}