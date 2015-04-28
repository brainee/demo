/**
 * @fileoverview ui controller
 * @author wliao <wliao@Ctrip.com> 
 */
define([
  'cPageView',
  'cHolidayPriceCalendar'
], function (
  PageView,
  HolidayPriceCalendar
) {

  var View = PageView.extend({
    events: {
      'click .js-calendar': 'calendarAction'
    },
    onCreate: function() {

    },
    onShow: function() {
      this.header.set({
        title: 'calendar',
        events: {
          returnHandler: function () {
            Lizard.goBack();
          }
        }
      });
      this.header.show();
      
    },
    onHide: function() {

    },
    calendarAction: function() {
      var calender = new HolidayPriceCalendar({
        monthsNum: 8,
        startTime: new Date(2014, 10, 2),
        priceDate: [
          { date: new Date('2014/11/9 0:00:00'), price: 30 },
          { date: new Date('2014/11/10 0:00:00'), price: 40 }
        ],
        onShow: function() {
          window.scrollTo(0, 0);
        },
        onHide: function() {
          this.remove();
        },
        callback: function(date, dateStyle, target) {
          console.log(dateStyle);
        }
      });

      calender.show();
    }
  });

  return View;
});