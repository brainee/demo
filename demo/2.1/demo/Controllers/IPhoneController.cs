using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace demo.Controllers
{
    public class IPhoneController : Controller
    {
        //
        // GET: /IPhone/

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult keyboard()
        {
            return View();
        }

    }
}
