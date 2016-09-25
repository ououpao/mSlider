var slider

var onMobile = false

var util = {
  isMobile: function() {
    return !!navigator.userAgent.match(/(iPhone|iPod|Android|ios|Windows Phone)/i)
  }
}

function createSlider() {
  if (util.isMobile() && !onMobile) {
    onMobile = true
    slider = new mSlider({
      el: '#slider',
      data: [
        'demo/img/slider1.png',
        'demo/img/slider2.png',
        'demo/img/slider3.png',
        'demo/img/slider4.png',
        'demo/img/slider5.png'
      ],
      autoPlay: false,
      height: '200px',
      replace: true
    })
  } else if(slider && !util.isMobile()) {
    slider.destroy()
  }
}

createSlider()

window.addEventListener('resize', createSlider, false)
