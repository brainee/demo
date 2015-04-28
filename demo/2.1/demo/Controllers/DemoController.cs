using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace demo.Controllers
{
    public class DemoController : Controller
    {
        //
        // GET: /Demo/

        public ActionResult Index()
        {
            return View();
        }

        //GET: /detail/
        public ActionResult Detail() 
        {
            return View();
        }

    }
}
