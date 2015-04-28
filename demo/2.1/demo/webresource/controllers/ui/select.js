/**
 * Created by jp_wang on 2014/11/20.
 */
define(['UIDemoView', 'UISelect', 'cStore', 'cCoreInherit'], function (UIDemoView, UISelect, AbstractStore, Inherit) {

  var BirthDay = Inherit.Class(AbstractStore, {
    __propertys__: function () {
      this.key = 'demo21_UI_depart_date';
      this.lifeTime = '1D';
    },
    initialize: function ($super, options) {
      $super(options);
    }
  });

  var birth = BirthDay.getInstance();

  var View = UIDemoView.extend({
    events: {
    },
    onCreate: function () {
    },
    onShow: function () {
      this.header.set({
        view: this,
        title: '竖直滚动，传统select组件',
        back: true
      });

      this.header.show();

      this.demo01();
      //this.demo02();

    },

demo01: function () {

  var scope = this, curItem;
  var demo01Sec = scope.$('.js_sec01');
  if (!this.demo1) {
    this.demo1 = new UISelect({
      datamodel: {
        data: [
          { id: 1, name: '中国' }, { id: 2, name: '美国' }, { id: 3, name: '英国' },
          { id: 4, name: '中国1' }, { id: 5, name: '美国2' }, { id: 6, name: '英国3' },
           { id: 1, name: '中国' }, { id: 2, name: '美国' }, { id: 3, name: '英国' },
          { id: 4, name: '中国1' }, { id: 5, name: '美国2' }, { id: 6, name: '英国3' },
          { id: 1, name: '中国' }, { id: 2, name: '美国' }, { id: 3, name: '英国' },
          { id: 4, name: '中国1' }, { id: 5, name: '美国2' }, { id: 6, name: '英国3' }
        ]
      },
      displayNum: 5,
      changed: function (item) {
        demo01Sec.html(item.id + ': ' + item.name);
      },
      wrapper: this.$('.js_demo01')
    });

    this.demo1.show();

    curItem = this.demo1.getSelected();
    demo01Sec.html(curItem.id + ': ' + curItem.name);
  }
},

demo02: function () {

  var i, len, item;
  var scope = this, curItem;
  var _now = new Date();

  var _year = _now.getFullYear();
  var _month = _now.getMonth();
  var _day = _now.getDate();
  var yearData = [];
  var monthData = [];
  var dayData = [];

  len = _year - 1939;

  for (i = 0; i < len; i++) {
    item = {
      id: 1940 + i,
      name: (1940 + i)+'年'
    };
    yearData.push(item);
  }

  for (i = 0; i < 12; i++) {
    item = {
      id: 1 + i,
      name: ((1 + i) < 10 ? ('0' + (1+i)) : (1+i)) + '月'
    };
    monthData.push(item);
  }

  for (i = 0; i < 31; i++) {
    item = {
      id: 1 + i,
      name: ((1 + i) < 10 ? ('0' + (1 + i)) : (1 + i)) + '日'
    };
    dayData.push(item);
  }

  //由localstorage读取数据
  var birObj = birth.get();

  //当年或者月改变后，日期需要判断闰年，或者日期变化的行为
  var _yearOrMonthChanged = function (yearItem, monthItem) {
    //处理month的时候日应该有所变化
    var dayFlag = { 1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31 };

    //闰年处理，需要先获取年份
    if (_.dateUtil.isLeapYear(yearItem.id)) {
      dayFlag[2] = 29;
    }

    var changed = false;
    //此处重置日期接口，并且需要重置“天”的dom结构
    for (var i = 0; i < 31; i++) {
      //设置该项不可选取
      dayData[i].disabled = true;
    }

    for (i = 31; i > dayFlag[monthItem.id] && i > 0; i--) {
      dayData[i - 1].disabled = false;
      changed = true;
    }

    if (changed) {
      scope.day.reload(dayData);
    }
  };

  if (!this.year) {
    this.year = new UISelect({
      datamodel: {
        data: yearData
      },
      displayNum: 5,
      changed: function (item) {
        //demo02Sec.html(item.id + ': ' + item.name);

        _yearOrMonthChanged(item, scope.month.getSelected());

        scope._setBirth();

      },
      wrapper: this.$('.js_year_wrapper')
    });
  }

  if (!this.month) {
    this.month = new UISelect({
      datamodel: {
        data: monthData
      },
      displayNum: 5,
      changed: function (item) {
        //demo02Sec.html(item.id + ': ' + item.name);

        _yearOrMonthChanged(scope.year.getSelected(), item);

        scope._setBirth();

      },
      wrapper: this.$('.js_month_wrapper')
    });
  }

  if (!this.day) {
    this.day = new UISelect({
      datamodel: {
        data: dayData
      },
      displayNum: 5,
      changed: function (item) {
        //demo02Sec.html(item.id + ': ' + item.name);

        scope._setBirth();
      },
      wrapper: this.$('.js_day_wrapper')
    });
  }

  //因为年月日有依赖关系，这里得注意
  this.year.show();
  this.month.show();
  this.day.show();

  //如果已经保存了日期对象，直接读出
  if (birObj) {
    this.year.setId(birObj.year);
    this.month.setId(birObj.month);
    this.day.setId(birObj.day);
    _yearOrMonthChanged(scope.year.getSelected(), scope.month.getSelected());
  }

  this._setBirth();
},

_setBirth: function () {
  var demo02Sec = this.$('.js_sec02');
  var yearItem, monthItem, dayItem;
  yearItem = this.year.getSelected();
  monthItem = this.month.getSelected();
  dayItem = this.day.getSelected();

  birth.set({
    year: yearItem.id,
    month: monthItem.id,
    day: dayItem.id
  });

  demo02Sec.html(yearItem.name + monthItem.name + dayItem.name);
},

    onHide: function () {

    }
  });

  return View;
});