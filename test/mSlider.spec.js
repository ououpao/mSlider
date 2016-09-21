'use strict';
const expect = chai.expect
let slides = []
let len = 10
let instance

function initDom() {
  const sliderWrap = document.createElement('div')
  sliderWrap.classList.add('mslider')
  document.body.appendChild(sliderWrap)
}

function initData() {
  for (let i = 0; i < len; i++) {
    slides.unshift(`<div>slider${i}</div>`)
  }
}

initDom()
initData()

let options = {
  el: '.mslider',
  data: slides,
  replace: true,
  autoPlay: true,
  loop: true,
  vertical: false,
  transtionType: 'normal',
  duration: 2000,
  transtionTime: 300,
  showIndicator: true,
  indicatorPos: 'center',
  indicatorType: 'normal',
  touchRange: 10,
  initSlide: 0,
  height: '200px'
}

instance = new mSlider(options)

describe('instance of mSlider: ', function() {

  it('slides lenght to be equal data lenght', function() {
    expect(instance._slides.length).to.be.equal(len);
  })

  it('indicator lenght to be equal data lenght ', function() {
    if (instance.indicatorType == 'normal') {
      expect(instance.dots.length).to.be.equal(len);
    }
  })

  it('transtion types', function() {
  	var types = mSlider.transtionFns
  	for(let type in types) {
  		if(types.hasOwnProperty(type)) {
  			options.transtionType = type
  			new mSlider(options)
  		}
  	}
  })
  
})

describe('apis of mSlider: ', function() {
  it('slideTo', function() {
    for (let i = 0; i < len; i++) {
      instance.slideTo(i)
      expect(instance._currentIndex).to.be.equal(options.isLoop && (i == len - 1) ? 0 : i)
    }
  })

  it('slidePrev', function() {
    for (let i = 0; i < len; i++) {
      instance.slidePrev()
    }
  })

  it('slideNext', function() {
    for (let i = 0; i < len; i++) {
      instance.slideNext()
    }
  })

  it('pause', function() {
    if (instance.autoPlay) {
      instance.pause()
    }
  })

  it('destroy', function() {
    instance.destroy()
  })
})
