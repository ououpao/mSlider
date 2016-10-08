(function() {
  var slider

  var onMobile = false

  var ready = false

  var slidersCls = [
    '.slider',
    '.slider2',
    '.slider3',
    '.slider4'
  ]

  var initData = [
    'demo/img/slider1.png',
    'demo/img/slider2.png',
    'demo/img/slider3.png',
    'demo/img/slider4.png',
    'demo/img/slider5.png'
  ]

  var instance = {}

  window.addEventListener('resize', switchMode, false)

  switchMode()

  function isMobile() {
    return !!navigator.userAgent.match(/(iPhone|iPod|Android|ios|Windows Phone)/i)
  }

  function switchMode() {
    onMobile = isMobile()
    switchBodyCls(onMobile)

    if (onMobile && !ready) {
      createSlider()
      ready = true
    }
  }

  function switchBodyCls(isMobile) {
    var cls = document.body.classList
    cls.remove(isMobile ? 'pc' : 'mb')
    cls.add(isMobile ? 'mb' : 'pc')
  }

  function getConfig(slideCls) {
    var configArea = document.querySelector(slideCls + ' .config_area')
    var configs = configArea.nextSibling
    var len = configs.length
    var $config
    var result = {}
    var key
    var dataset
    while(len--) {
      debugger;
      $config = configs[len]
      if($config.classList.contains('btn--selected') > -1) {
        dataset = $config.dataset
        result[dataset.key] = dataset.value
      }
    }
    debugger;
    return result
  }

  function createSlider() {
    slidersCls.forEach(function(cls, index) {
      var config = getConfig(cls)
      var opt = Object.assign({
        el: cls,
        data: initData,
        height: '200px'
      }, config)

      instance['slide' + (index + 1)] = new mSlider(opt)
    })
  }
})()
