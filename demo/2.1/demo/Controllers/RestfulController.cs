using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace demo.Controllers
{
    public class RestfulController : Controller
    {
        //
        // GET: /Restful/

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Dependent()
        {
            return View();
        }

        public ActionResult LocalStorage()
        {
            return View();
        }

        public ActionResult Timeout()
        {
            return View();
        }
    }
}
