/**
 * Created by jp_wang on 2014/11/20.
 */
define(['UIDemoView', 'UIGroupSelect', 'cStore', 'cCoreInherit'], function (UIDemoView, UIGroupSelect, AbstractStore, Inherit) {

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
      'click .js_demo01': 'demo01'
    },

    //
    _getBirthInitData: function () {

      //处理数据逻辑代码
      var i, len, item;
      var _now = new Date();

      var _year = _now.getFullYear();
      var yearData = [];
      var monthData = [];
      var dayData = [];

      len = _year - 1939;

      for (i = 0; i < len; i++) {
        item = {
          id: 1940 + i,
          name: (1940 + i) + '年'
        };
        yearData.push(item);
      }

      for (i = 0; i < 12; i++) {
        item = {
          id: 1 + i,
          name: ((1 + i) < 10 ? ('0' + (1 + i)) : (1 + i)) + '月'
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

      return {
        maxYear: _now.getFullYear(),
        maxMonth: _now.getMonth(),
        maxDay: _now.getDate(),
        yearData: yearData,
        monthData: monthData,
        dayData: dayData
      };

    },

    demo01: function () {

      //由文本框获取当前日期项目
      var curBirth = this.$('.js_demo01_val');
      var birthArray = curBirth.val().split('-');
      var year_sec, month_sec, day_sec, scope = this;
      var birthObj = this._getBirthInitData();

      var dayData = birthObj.dayData;

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
          scope.list01.scrollArr[2].reload(dayData);
        }
      };

      if (!this.list01) {

        this.list01 = new UIGroupSelect({
          onHide: function () {
            this._destroyScroll();
          }, 
          datamodel: {
            title: '生日选择器'
          },
          data: [birthObj.yearData, birthObj.monthData, birthObj.dayData],
          changedArr: [
            //年改变触发回调
            function (item) {
              _yearOrMonthChanged(this.scrollArr[0].getSelected(), this.scrollArr[1].getSelected());
              //scope._setBirth();

              this.setTips(this.scrollArr[0].getSelected().id + '-' + this.scrollArr[1].getSelected().id + '-' + this.scrollArr[2].getSelected().id);

            },
            //月改变触发回调
            function (item) {
              _yearOrMonthChanged(this.scrollArr[0].getSelected(), this.scrollArr[1].getSelected());
              //scope._setBirth();
              this.setTips(this.scrollArr[0].getSelected().id + '-' + this.scrollArr[1].getSelected().id + '-' + this.scrollArr[2].getSelected().id);
            },
            //日改变触发回调
            function (item) {
              //scope._setBirth();

              this.setTips(this.scrollArr[0].getSelected().id + '-' + this.scrollArr[1].getSelected().id + '-' + this.scrollArr[2].getSelected().id);

            }
          ],
          onOkAction: function (items) {
            console.log('ok', items);
            scope._setBirth();
            this.hide();
          },
          onCancelAction: function () {
            console.log('cancel');
            this.hide();
          }
        });
      }

      this.list01.show();

      if (birthArray.length == 3) {
        this.list01.scrollArr[0].setId(birthArray[0]);
        this.list01.scrollArr[1].setId(birthArray[1]);
        this.list01.scrollArr[2].setId(birthArray[2]);
        _yearOrMonthChanged(this.list01.scrollArr[0].getSelected(), this.list01.scrollArr[1].getSelected());
      }

    },
   
    _setBirth: function () {
      var curBirth = this.$('.js_demo01_val');

      var yearItem, monthItem, dayItem;
      yearItem = this.list01.scrollArr[0].getSelected();
      monthItem = this.list01.scrollArr[1].getSelected();
      dayItem = this.list01.scrollArr[2].getSelected();

      birth.set({
        year: yearItem.id,
        month: monthItem.id,
        day: dayItem.id
      });

      curBirth.val(yearItem.id + '-' + monthItem.id + '-' + dayItem.id);
    },

    onCreate: function () {
    },
    onShow: function () {
      this.header.set({
        view: this,
        title: 'group select组合应用',
        back: true
      });

      this.header.show();

      var localBirObj = birth.get();
      var curBirth = this.$('.js_demo01_val');
      if (localBirObj)
      curBirth.val(localBirObj.year + '-' + localBirObj.month + '-' + localBirObj.day);

    },
    onHide: function () {

    }
  });

  return View;
});