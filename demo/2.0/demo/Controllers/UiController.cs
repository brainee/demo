using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace ui.Controllers
{
    public class UiController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Calendar()
        {
            return View();
        }

        public ActionResult Header()
        {
            return View();
        }
    }
}
