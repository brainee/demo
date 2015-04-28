define(['UIDemoView', 'UIBubbleLayer'], function (UIDemoView, UIBubbleLayer) {
  var View = UIDemoView.extend({
    events: {
    },
    onCreate: function () {
    },
    onShow: function () {

      var scope = this;

this.header.set({
  view: this,
  back:
  {
    'tagname': 'back', callback: function () {
      console.log('back')
      Lizard.goBack();
    }
  },
  right: [

    { 'tagname': 'search'},
    
    {
      'tagname': 'custom', 'value': '定制化',
      itemFn: function () {
        return '<span class="cm-header-btn fr js_custom">定制化</span>';
      },
      callback: function () {
        console.log('定制化');
      }
    }
  ],
  //这里写title或者center都是支持的
  center: {
    'tagname': 'title', 'value': ['精品特价', '11月24日 周一出发']
  }
});
    },
    onHide: function () {

    }
  });

  return View;
});