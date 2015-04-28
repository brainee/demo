using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace demo
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                name: "ui",
                url: "ui/{action}",
                defaults: new { controller = "Ui", action = "Index", id = UrlParameter.Optional }
            );

           routes.MapRoute(
               name: "restful",
               url: "restful/{action}",
               defaults: new { controller = "Restful", action = "Index", id = UrlParameter.Optional }
           );

           routes.MapRoute(
              name: "lizard",
              url: "lizard/{action}",
              defaults: new { controller = "Lizard", action = "Index", id = UrlParameter.Optional }
          );

           routes.MapRoute(
              name: "ux",
              url: "ux/{action}",
              defaults: new { controller = "Ux", action = "Index", id = UrlParameter.Optional }
          );

           routes.MapRoute(
               name: "hybrid",
               url: "hybrid/{action}",
               defaults: new { controller = "Hybrid", action = "Index", id = UrlParameter.Optional }
           );

           routes.MapRoute(
               name: "pageview",
               url: "pageview/{action}",
               defaults: new { controller = "pageview", action = "Index", id = UrlParameter.Optional }
           );

          routes.MapRoute(
              name: "model",
              url: "model/{action}",
              defaults: new { controller = "model", action = "Index", id = UrlParameter.Optional }
          );

          routes.MapRoute(
              name: "hole",
              url: "hole/{action}",
              defaults: new { controller = "hole", action = "Index", id = UrlParameter.Optional }
          );

          routes.MapRoute(
              name: "iphone",
              url: "iphone/{action}",
              defaults: new { controller = "iphone", action = "Index", id = UrlParameter.Optional }
          );

           routes.MapRoute(
               name: "Default",
               url: "{action}/{id}",
               defaults: new { controller = "Demo", action = "Index", id = UrlParameter.Optional }
           );
        }
    }
}