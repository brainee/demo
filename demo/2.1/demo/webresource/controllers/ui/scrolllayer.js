/**
 * Created by jp_wang on 2014/11/20.
 */
define(['UIDemoView', 'UIScrollLayer', 'UIImageSlider'], function (UIDemoView, UIScrollLayer, UIImageSlider) {

  var View = UIDemoView.extend({
    events: {
      'click .js_demo01': 'demo01',
      'click .js_demo03': 'demo03',
      'click .js_demo02': 'demo02'
    },

demo01: function () {
  if (!this.scrollLayer01) {
    var html = '<div style="width:100%;">	<ul class="cost_detail">		<li>			<div class="cost_title">普通内舱三人房 11（1间，3位旅客）</div>							<div class="cost_list">					<div class="cost_list_price"><dfn>¥</dfn>4049/ x 2份</div><span class="cost_list_title">第1、2人</span></div>            				<div class="cost_list">					<div class="cost_list_price"><dfn>¥</dfn>2549/ x 1份</div><span class="cost_list_title">第3、4人</span></div><div class="sub_total">小计<dfn>¥</dfn>10647</div></li><li><div class="cost_title">其它费用</div><div class="cost_list"><div class="cost_list_price"><dfn>¥</dfn>200/人 x 3份</div><span class="cost_list_title">日本团队旅游签证（上海送签）</span></div><div class="cost_list"><div class="cost_list_price"><dfn>¥</dfn>105/人 x 3份</div><span class="cost_list_title">平安携程境外邮轮短线保险 普通型</span></div><div class="cost_list"><div class="cost_list_price"><dfn>¥</dfn>150/人 x 3份</div><span class="cost_list_title">济州+福冈岸上观光B线 休闲购物游</span></div><div class="cost_list"><div class="cost_list_price"><dfn>¥</dfn>15 x 1份</div><span class="cost_list_title">携程上门或快递配送服务</span></div><div class="sub_total">小计<dfn>¥</dfn>1380</div></li><li><div class="cost_title">优惠</div><div class="cost_list"><div class="cost_list_price">-<dfn>¥</dfn>2700</div><span class="cost_list_title">早订优惠</span></div><div class="sub_total">小计 -<dfn>¥</dfn>2700</div></li><li><div class="cost_list"><div class="cost_list_price"><dfn>¥</dfn>3109/人</div><span class="cost_list_title">人均金额</span></div></li><li><div class="cost_list"><div class="cost_list_price"><dfn>¥</dfn>9327</div><span class="cost_list_title">订单总额</span></div></li></ul></div>';

    this.scrollLayer01 = new UIScrollLayer({
      datamodel: {
        title: '费用明细',
        btns: []
      },
      events: {
        'click  .x-ico': 'selfClick',
        'click #bookBtn': 'bookAction'
      },
      width: $(window).width() * 0.8,
      maxHeight:  $(window).height() -150,
      selfClick: function () {
        this.hide();
      },
      bookAction: function () {
        alert('预定');
        this.hide();
      },
      uiStyle: '.isd-mapbox {      position: relative;      width: 100%;      min-width: 300px;      margin: 0 auto;      background-color: #fff;      overflow: hidden;      color: #000;    }    .isd-mapbox h3 {      background-color: #099fde;      color: #fff;      font-size: 15px;      padding: 5px 10px;    }    .isd-mapbox .content {      font-size: 12px;      padding: 5px 15px 0;    }    .isd-mapbox .btn-bar {      color: #ff9a14;      font-size: 12px;      padding: 0 15px;      overflow: hidden;      zoom: 1;    }      .isd-mapbox .btn-bar p {        display: inline-block;      }        .isd-mapbox .btn-bar p span {          font-size: 21px;        }      .isd-mapbox .btn-bar span.obtn {        font-size: 16px;        color: #fff;        background-color: #ff9a14;        display: inline-block;        padding: 3px 10px;        float: right;      }  .x-ico {    position: relative;    float: right;    top: 3px;    right: 0;    display: inline-block;    width: 40px;    height: 20px;  }    .x-ico:before {      content: "";      width: 1px;      height: 15px;      position: absolute;      right: 7px;      top: 0;      background-color: #fff;      -webkit-transform: rotate(-45deg);      -moz-transform: rotate(-45deg);      -ms-transform: rotate(-45deg);      transform: rotate(-45deg);    }    .x-ico:after {      content: "";      width: 15px;      height: 1px;      position: absolute;      right: 0;      top: 7px;      background-color: #fff;      -webkit-transform: rotate(-45deg);      -moz-transform: rotate(-45deg);      -ms-transform: rotate(-45deg);      transform: rotate(-45deg);    }  .map-content span {    position: relative;    padding: 1px 5px;    font-size: 14px;    color: #fff;    white-space: nowrap;    text-overflow: ellipsis;    overflow: hidden;    background: #31a9e9;  }',
      html: html,
      okAction: function () {
        console.log('that\'s ok');
        this.hide();
      },
      cancelAction: function () {
        console.log('that\'s cancel');
        this.hide();
      }
    });
  }
  this.scrollLayer01.show();
},

demo02: function () {
  var scope = this;
  if (!this.scroll3) {
    var html = '';

    for (var i = 0; i < 40; i++) {
      html += '<li data-index="' + i + '"><i class="id-checkbox"></i>项目名称' + i + '</li>';
    }
    html = '<ul class="line-list line-list--checkbox">' + html + '</ul>';
    this.scroll3 = new UIScrollLayer({
      maxHeight: 250,
      html: html,
      uiStyle: '.ttt { color: red;}',
      datamodel: {
        title: '模拟list',
        btns: [
          { name: '取消', className: 'cui-btns-cancel' },
          { name: '确定', className: 'cui-btns-ok' }
        ]
      },
      events: {
        'click .cui-btns-ok': 'myOkAction',
        'click .cui-btns-cancel': 'myCancelAction',
        'click .line-list li': 'itemClick'
      },
      myOkAction: function () {
        var doms = this.$('i.checked');
        var secHtml = '';

        $.each(doms, function (i, el) {
          el = $(el).parent();
          var i = el.attr('data-index');
          secHtml += i + ', ';
        });
        scope.showToast('所选索引： ' + secHtml);
        this.hide();
      },
      myCancelAction: function () {
        console.log('my cancel');
        this.hide();
      },
      itemClick: function (e) {
        var el = $(e.currentTarget);
        var i = el.attr('data-index');
        el = el.find('.id-checkbox');
        if (el.hasClass('checked')) el.removeClass('checked');
        else el.addClass('checked');

      }
    });
  }
  this.scroll3.show();
},

demo03: function () {
  var scope = this;
  if (!this.scroll4) {
    var html = '<div class="cui-bd" style="overflow: hidden; position: relative; width: 100%; max-height: 547px; min-height: 50px; background-color: rgb(250, 250, 250);"><div class="hotel-detail-layer" style="background-color: white;"><div class="js_pop_slide_container" style="width: 100%; height: 190px; margin: auto; overflow: hidden; position: relative;"><div class="xslide-box-container" style="width: 280px; height: 190px;"></div></div><ul class="layer-hd p10 js_part1_info"><li><i class="hotel-icon-area"></i><span>面积</span>26㎡</li> <li><i class="hotel-icon-people"></i><span>可住</span>2人</li> <li><i class="hotel-icon-bed2"></i>该房型不可加床</li> <li><i class="hotel-icon-floor"></i><span>楼层</span>3-8层</li> <li><i class="hotel-icon-beds-width"></i><span>床宽</span><p>大床 1.50米</p></li> <li><i class="hotel-icon-browser"></i><span>宽带</span><p>免费有线宽带</p></li>  <li><i class="hotel-icon-smoke"></i><span>无烟</span><p>该房可无烟处理</p></li>  </ul><ul class="layer-bd"> <li><span class="ico-txt"><em class="ico-2">可返</em></span><p>2014-09-23至2015-12-31期间入住，每间夜最多可以使用79元消费券。自入住日起3个月内申请返现，订单成交3个工作日后可获得等额返现至现金账户。</p></li>    </ul></div></div>';

    this.scroll4 = new UIScrollLayer({
      maxHeight: 300,
      html: html,
      scrollOpts: {
        scrollbars: false,
        bounce: false
      },
      datamodel: {
        title: '高级大床房',
        btns: '<div class="hotel-detail-layer"><ul class="layer-bd"><li><button class="hotel-g-btn js_btn_book ">预订</button><em class="g-price"><small>¥</small>830</em></li></ul></div>'
      },
      events: {
        'click .cui-btns-ok': 'myOkAction',
        'click .cui-btns-cancel': 'myCancelAction',
        'click .js_btn_book': 'booking'
      },
      myOkAction: function () {
        var doms = this.$('i.checked');
        var secHtml = '';

        $.each(doms, function (i, el) {
          el = $(el).parent();
          var i = el.attr('data-index');
          secHtml += i + ', ';
        });
        scope.showToast('所选索引： ' + secHtml);
        this.hide();
      },
      myCancelAction: function () {
        console.log('my cancel');
        this.hide();
      },
      booking: function (e) {
        scope.showToast('预定流程');
        this.hide();
      }
    });
  }
  this.scroll4.show();

  //在此装载slider组件
  var slider_wrapper = this.scroll4.$('.xslide-box-container');

  var data = [
      { id: 1, src: 'http://images.cnitblog.com/blog/294743/201412/051803075458022.jpg', href: './res/img/1.jpg' },
      { id: 2, src: 'http://images.cnitblog.com/blog/294743/201412/051803148429260.jpg', href: './res/img/2.jpg' },
      { id: 3, src: 'http://images.cnitblog.com/blog/294743/201412/051803198737858.jpg', href: './res/img/3.jpg' },
      { id: 4, src: 'http://images.cnitblog.com/blog/294743/201412/051803252488182.jpg', href: './res/img/4.jpg' }
  ];

  if (!this.imgSlider) {
    this.imgSlider = new UIImageSlider({
      datamodel: {
        data: data,
        itemFn: function (item) {
          return '<img src="' + item.src + '" class="xslide-image-loading">';
        }
      },

      displayNum: 1,
      wrapper: slider_wrapper,
      changed: function (item) {
      }
    });
  }
  this.imgSlider.show();

},

    onCreate: function () {
    },
    onShow: function () {
      this.header.set({
        view: this,
        title: 'scrolllayer',
        back: true
      });

      this.header.show()
    },
    onHide: function () {

    }
  });

  return View;
});