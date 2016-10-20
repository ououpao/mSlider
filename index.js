(function() {
  var slider
  var onMobile = false
  var ready = false
  var initData = [
    'demo/img/slider1.png',
    'demo/img/slider2.png',
    'demo/img/slider3.png',
    'demo/img/slider4.png',
    'demo/img/slider5.png'
  ]

  window.addEventListener('resize', switchMode, false)

  switchMode()

  function isMobile() {
    return !!navigator.userAgent.match(/(iPhone|iPod|Android|ios|Windows Phone)/i)
  }

  function switchMode() {
    onMobile = isMobile()
    switchBodyCls(onMobile)

    if (onMobile && !ready) {
      ready = true
    }
  }

  function switchBodyCls(isMobile) {
    var cls = document.body.classList
    cls.remove(isMobile ? 'pc' : 'mb')
    cls.add(isMobile ? 'mb' : 'pc')
  }

  new mSlider({
    el: '#demo1',
    data: initData,
    height: '200px'
  })

  new mSlider({
    el: '#demo2',
    data: initData,
    height: '200px',
    transtionType: 'fade'

  })

  new mSlider({
    el: '#demo3',
    data: initData,
    height: '200px',
    vertical: true,
    autoPlay: false
  })

  new mSlider({
    el: '#demo4',
    data: initData,
    height: '200px',
    indicatorType: 'circle',
    indicatorPos: 'right'
  })

})()
