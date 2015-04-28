/**
 * Created by jp_wang on 2014/11/20.
 */
define(['UIDemoView', 'UILayer'], function (UIDemoView, UILayer) {

  var SimpleLayer = _.inherit(UILayer, {
    propertys: function ($super) {
      $super();

      this.datamodel = {
        title: '0',
        content: '1'
      };

    

      //每个组件都需要一个template模板字符串
      this.template = '<div class="self-layer" style="border: 1px solid gray; background: white; color: black ; "><div class="self-title"><%=title%></div><div class="self-content"><%=content%></div></div>';
    },

    setDatamodel: function (title, content) {
      this.datamodel = {
        title: title,
        content: content
      };
      this.refresh();
    },

    initialize: function ($super, opts) {
      $super(opts);
    }
  });

  var PriceLayer = _.inherit(UILayer, {
    propertys: function ($super) {
      $super();

      //不需要包裹层
      this.needRootWrapper = false;
      this.needMask = true;

      //动画class定制化
      this.animateInClass = 'cm-down-in';
      this.animateOutClass = 'cm-down-out';

      this.addUIStyle(' .hotel-p-s-filter {   width: 100%;      padding: 10px;      box-sizing: border-box;      background: #efefef;    }      .hotel-p-s-filter dt {        font-size: 14px;        padding-bottom: 5px;        clear: left;      }      .hotel-p-s-filter dd {        float: left;        background: #fff;        width: 25%;        padding: 10px 0;        margin-bottom: 10px;        text-align: center;        margin-left: -2px;        font-size: 11px;        white-space: nowrap;        letter-spacing: -1px;      }        .hotel-p-s-filter dd.current {          background: #099fde;          color: #fff;        }      .hotel-p-s-filter dt:nth-of-type(2) ~ dd {        width: 33.33333%;      }      .hotel-p-s-filter .g_btn_s {        clear: left;      }      .hotel-p-s-filter .g_btn_s {        clear: left;      }    .g_btn_s {      color: #FFF;      font-size: 18px;      width: 100%;      height: 44px;      line-height: 44px;      display: block;      -webkit-border-radius: 3px;      -moz-border-radius: 3px;      border-radius: 3px;      margin: 0 auto;      text-align: center;      background-color: #ff9a14;      -webkit-tap-highlight-color: #ff8c00;    }');

      //每个组件都需要一个template模板字符串
      this.template = '<div class="hotel-p-s-filter js_price_star_filter" style="z-index:9999"><dl><dt>价格(单选)</dt><dd class="js_price_h js_price_all current">不限</dd><dd class="js_price_h" data-price="0,150">￥150元以下</dd><dd class="js_price_h" data-price="150,300">￥150-￥300</dd><dd class="js_price_h" data-price="301,450">￥301-￥450</dd><dd class="js_price_h" data-price="451,600">￥451-￥600</dd><dd class="js_price_h" data-price="601,1000">￥601-￥1000</dd><dd class="js_price_h" data-price="1000">￥1000以上</dd><dt>星级(复选)</dt><dd class="js_star_h js_star_all current">不限</dd><dd class="js_star_h" data-star="liansuo" data-text="快捷连锁">快捷连锁</dd><dd class="js_star_h" data-star="0|1|2" data-text="二星级及以下/经济">二星级及以下/经济</dd><dd class="js_star_h" data-star="3" data-text="三星级/舒适">三星级/舒适</dd><dd class="js_star_h" data-star="4" data-text="四星级/高档">四星级/高档</dd><dd class="js_star_h" data-star="5" data-text="五星级/豪华">五星级/豪华</dd><div class="mt10"><button class="g_btn_s js_price_star_filter_ok">确定</button></div></dl></div>';

      
      //事件定义
      this.addEvents({
        'click dd': 'priceItemAction',
        'click .js_price_star_filter_ok': 'priceOkAction'
      });

    },

    reposition: function () {
      this.$root.css({
        'position': 'fixed',
        'left': '10px',
        'right': '10px',
        'bottom': '0',
        'padding': '10px 0'
      });
    },

    priceItemAction: function (e) {
      var el = $(e.currentTarget);

      if (el.hasClass('js_price_h')) {
        this.$('dd.js_price_h').removeClass('current');
      } else {
        this.$('dd.js_star_h').removeClass('current');
      }

      el.addClass('current');
    },

    priceOkAction: function () {
      this.hide();
    },

    addEvent: function ($super) {
      $super();

      this.on('onCreate', function () {
        this.$el.removeClass('cui-layer');
      });
    },

    initialize: function ($super, opts) {
      $super(opts);
    }
  });

  var View = UIDemoView.extend({
    events: {
      'click .js_demo01': 'demo01',
      'click .js_demo02': 'demo02',
    },

    demo01: function () {
      if (!this.layer01) {
        this.layer01 = new SimpleLayer({
          datamodel: {
            title: this.$('.demo01_title').val(),
            content: this.$('.demo01_content').val()
          }
        });
      } else {
        this.layer01.setDatamodel(this.$('.demo01_title').val(), this.$('.demo01_content').val());
      }
      this.layer01.show();
    },

    demo02: function () {
      if (!this.layer02) {
        this.layer02 = new PriceLayer({});
      }
      this.layer02.show();
    },

    onCreate: function () {

    },
    onShow: function () {
      this.header.set({
        view: this,
        title: '用户自定义弹出层',
        back: true
      });

      this.header.show()
    },
    onHide: function () {
      if (this.layer01) this.layer01.hide();
      if (this.layer02) this.layer02.hide();
    }
  });

  return View;
});