using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace demo.Controllers
{
    public class LizardController : Controller
    {
        //
        // GET: /Lizard/

        public ActionResult Index()
        {
            return View();
        }
        public ActionResult Jump()
        {
            return View();
        }
        public ActionResult appBaseUrl()
        {
            return View();
        }

        public ActionResult restfullApi()
        {
            return View();
        }

    }
}
