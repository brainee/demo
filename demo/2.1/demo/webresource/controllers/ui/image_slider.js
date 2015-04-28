/**
 * Created by jp_wang on 2014/11/20.
 */
define(['UIDemoView', 'UIImageSlider'], function (UIDemoView, UIImageSlider) {

  var View = UIDemoView.extend({
    events: {
      'focus .demo111': function () {
        this.header.set({
          title: '图片轮播111'
        });
      }
    },
    onCreate: function () {
    },
    onShow: function () {
      var scope = this;
      this.header.set({
        view: this,
        title: '图片轮播',
        back: true,
        right: [
          {
            tagname: 'wl', value: '刷新', callback: function () {
              var data = [
         { id: 1, src: 'http://images.cnitblog.com/blog/294743/201412/051803075458022.jpg', href: './res/img/1.jpg' },
         { id: 2, src: 'http://images.cnitblog.com/blog/294743/201412/051803148429260.jpg', href: './res/img/2.jpg' },
              ];
              if (scope.imgSlider01) {
                scope.imgSlider01.datamodel.data = data;
                scope.imgSlider01.refresh();

              }
            }
        }
        ]
      });

      this.header.show();

      this._resetWrapper();
      this.demo01();
      this.demo02();

    },

    _resetWrapper: function () {
      var scope = this;
      var resetWrapper = function () {
        var demo = scope.$('.demo01');
        var flag = parseInt(demo.width() - 400);
        demo.height(150 + 0.4 * flag);
        scope.$('.demo02').height(150 + 0.4 * flag);
      };

      resetWrapper();
      $(window).on('resize.imageslider1', $.proxy(function () {
        resetWrapper();
      }, this));
    },

    demo01: function () {

      if (this.imgSlider01) return;

      var data = [
         //{ id: 1, src: 'http://images.cnitblog.com/blog/294743/201412/051803075458022.jpg', href: './res/img/1.jpg' },
         { id: 2, src: 'http://images.cnitblog.com/blog/294743/201412/051803148429260.jpg', href: './res/img/2.jpg' },
         { id: 3, src: 'http://images.cnitblog.com/blog/294743/201412/051803198737858.jpg', href: './res/img/3.jpg' },
         { id: 4, src: 'http://images.cnitblog.com/blog/294743/201412/051803252488182.jpg', href: './res/img/4.jpg' }
      ];

      this.imgSlider01 = new UIImageSlider({
        autoPlay: true,
        needLoop: false,
        datamodel: {
          data: data,
          itemFn: function (item) {
            return '<img data-src="' + item.src + '" src="' + item.src + '" >';
          }
        },
        displayNum: 1,
        wrapper: this.$('.demo01')
      });
      this.imgSlider01.show();
    },

    demo02: function () {

      if (this.imgSlider02) return;

      var data = [
       { id: 1, src: 'http://images.cnitblog.com/blog/294743/201412/051803075458022.jpg', href: './res/img/1.jpg' },
       { id: 2, src: 'http://images.cnitblog.com/blog/294743/201412/051803148429260.jpg', href: './res/img/2.jpg' },
       { id: 3, src: 'http://images.cnitblog.com/blog/294743/201412/051803198737858.jpg', href: './res/img/3.jpg' },
       { id: 4, src: 'http://images.cnitblog.com/blog/294743/201412/051803252488182.jpg', href: './res/img/4.jpg' }
      ];

      this.imgSlider02 = new UIImageSlider({
        datamodel: {
          data: data,
          itemFn: function (item) {
            return '<img data-src="' + item.src + '" src="' + item.src + '" >';
          }
        },
        createNav: function () {
          if (this.sliderNav) return;
          var nav = '<div class="cui-navContainer cui-slide-nav-new" style="background: #f2f2f2; color: rgb(20, 145, 197); position: absolute;  bottom: 0; margin:0 auto;">';
          for (var i = 0; i < this.itemNum; i++) {
            nav += '<span class="cui-slide-nav-item" data-index="' + i + '"></span>';
          }
          nav += '</div>';
          this.sliderNav = $(nav);
          this.sliderNav.find('span').width(this.wrapper.width() / this.itemNum - 1);

          this.$el.append(this.sliderNav);
          this.setzIndexTop(this.sliderNav);
          this._setNavIndex(this.datamodel.index);
        },
        displayNum: 1,
        wrapper: this.$('.demo02')
      });
      this.imgSlider02.show();

    },

    onHide: function () {
      $(window).off('imageslider1');
    }
  });

  return View;
});