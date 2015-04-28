using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace demo.Controllers
{
    public class ModelController : Controller
    {
        //
        // GET: /Model/

        public ActionResult Index()
        {
            return View();
        }
        public ActionResult CModel()
        {
            return View();
        }
        public ActionResult Timeout()
        {
            return View();
        }
    }
}
