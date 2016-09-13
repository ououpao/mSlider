(function(window) {

  var uilt = {
    query: function(el) {
      if (el && el.nodetype !== 1) {
        el = document.querySelector(el)
      }
      return el
    },
    error: function(error) {
      throw new Error(error)
    }
  }

  var transtionFns = {
    normal: function(el, prev, current, forward, offset, width) {
      el.style.transition = 'none'
      el.style.zIndex = 0
      prev.style.transform = 'translateX(' + (offset - width) + 'px)'
      current.style.transform = 'translateX(' + offset + 'px)'
      current.style.zIndex = 2
      forward.style.transform = 'translateX(' + (offset + width) + 'px)'
    },
    /**
     * fade animation
     * @param  {Element} el      [description]
     * @param  {Element} prev    [description]
     * @param  {Element} current [description]
     * @param  {Element} forward [description]
     * @param  {Number} offset  [description]
     * @param  {Number} width   [description]
     * @return {[type]}         [description]
     */
    fade: function(el, prev, current, forward, offset, width) {
      el.style.zIndex = 0
      el.style.opacity = 0
      var opacity = Math.abs(offset) / width
      var next = offset >= 0 ? prev : forward
      next.style.zIndex = 1
      next.style.opacity = opacity
      current.style.zIndex = 2
      current.style.opacity = 1 - opacity
    }
  }

  function Slider(opt) {
    // config
    this.opt = opt
      // container
    this.el = uilt.query(this.opt.el)

    this.width = this.el.offsetWidth

    // items
    this.els = []

    this.axis = 'X'

    this.dots = []

    // transtion animation: normal(default) | fade
    this.transtionName = this.opt.transtionName || 'normal'

    this.transtionFn = transtionFns[this.transtionName]

    this.transtionTime = 300

    this.isAutoPlay = true

    this.autoPlayTimer = null

    this.duration = this.opt.duration || 2000

    this.currentIndex = 0

    this.nextIndex = 0

    this.showDot = true

    this.offset = {}

    // left | center(default) | right
    this.dotPosition = this.opt.dotPosition || 'center'

    this.prefixCls = 'slider'

    this.itemPrefixCls = 'slider_item'

    this.dotPrefixCls = 'slider_dot'

    this.init()
  }

  Slider.prototype = {
    constructor: Slider,

    init: function() {
      if (!this.el) {
        uilt.error('el(selector or Element) is requied!')
      }
      this.render()
      this.bindEvent()

      if (this.transtionName === 'normal') {
        this.setElsPosition()
      }

      this.setTransitionStyle()

      // first
      this.slideTo(this.currentIndex)
      this.isAutoPlay && this.autoPlay()
    },

    render: function() {
      var data = this.opt.data || []
      var _this = this

      renderMain()

      this.showDot && renderDot()

      function renderMain() {
        var ul = document.createElement('ul')
        ul.classList.add(_this.prefixCls + '_wrap')
        data.forEach(function(item, index) {
          // li
          var li = document.createElement('li')
          li.classList.add(_this.itemPrefixCls)
            // if (index == _this.currentIndex) {
            //   li.classList.add(_this.itemPrefixCls + '--active')
            // }
            // img
          var img = document.createElement('img')
          img.classList.add(_this.prefixCls + '_img')
          img.src = item

          li.appendChild(img)
          ul.appendChild(li)
          _this.els.push(li)
        })
        _this.el.appendChild(ul)
      }

      function renderDot() {
        // outer wrap 
        var outer = document.createElement('div')
        var cls = _this.dotPrefixCls + '-outer'
        outer.classList.add(cls, cls + '--' + _this.dotPosition)

        // ul
        var ul = document.createElement('ul')
        ul.classList.add(_this.dotPrefixCls + '-inner')

        data.forEach(function(item, index) {
          // li
          var li = document.createElement('li')
          li.classList.add(_this.dotPrefixCls)
          if (index == _this.currentIndex) {
            li.classList.add(_this.dotPrefixCls + '--active')
          }
          // ul
          ul.appendChild(li)
          _this.dots.push(li)
        })
        outer.appendChild(ul)
        _this.el.appendChild(outer)
      }
    },

    bindEvent: function() {
      var _this = this
      this.el.addEventListener('touchstart', this.eventHandler.bind(this))
      this.el.addEventListener('touchmove', this.eventHandler.bind(this))
      this.el.addEventListener('touchend', this.eventHandler.bind(this))
      this.el.addEventListener('touchcancel', this.eventHandler.bind(this))
    },

    eventHandler: function(e) {
      e.preventDefault()
      switch (e.type) {
        case 'touchstart':
          this.startHandler(e)
          break
        case 'touchmove':
          this.moveHandler(e)
          break
        case 'touchend':
        case 'touchcancel':
          this.endHandler(e)
          break
      }
    },

    startHandler: function(e) {
      this.offset = {}
      this.pause()
      this.startX = e.targetTouches[0].pageX
      this.startY = e.targetTouches[0].pageY
      this.startTime = new Date().getTime()
    },

    moveHandler: function(e) {
      var offset = {}
      var _this = this
      offset.X = e.targetTouches[0].pageX - this.startX
      offset.Y = e.targetTouches[0].pageY - this.startY
      this.offset = offset
      this.transition(this.offset.X)
    },

    endHandler: function(e) {
      var endTime = new Date().getTime()
      var boundary = endTime - this.startTime > 300 ? this.width / 2 : 14
      if (this.offset[this.axis] >= boundary) {
        this.slideTo(this.currentIndex - 1)
      } else if (this.offset[this.axis] < -boundary) {
        this.slideTo(this.currentIndex + 1)
      } else {
        this.slideTo(this.currentIndex)
      }
    },

    slideTo: function(nextIndex) {
      this.isAutoPlay && this.pause()
      this.nextIndex = this.getNextIndex(nextIndex)
      this.showDot && this.setDot(this.nextIndex)
      this.currentIndex = this.nextIndex
      this.transition(0, true)
      this.isAutoPlay && this.autoPlay()
      this.setTransitionStyle()
    },

    transition: function(offset) {
      var _this = this
      var prevIndex = this.getNextIndex(this.currentIndex - 1)
      var nextIndex = this.getNextIndex(this.currentIndex + 1)
      this.els.forEach(function(el, index) {
        _this.transtionFn(el, _this.els[prevIndex], _this.els[_this.currentIndex], _this.els[nextIndex], offset, _this.width)
      })
    },

    getNextIndex: function(nextIndex) {
      var max = this.els.length - 1
      nextIndex = nextIndex > max ? 0 : nextIndex < 0 ? max : nextIndex
      return nextIndex
    },

    setElsPosition: function() {
      var _this = this
      this.els.forEach(function(el, index) {
        var x
        if (index === _this.currentIndex) {
          x = 0
        } else {
          x = (index - _this.currentIndex) * _this.width
        }
        el.style.transform = 'translateX(' + x + 'px)'
      })
    },

    setTransitionStyle: function() {
      var _this = this
      this.els.forEach(function(el, index) {
        el.style.transition = 'all ' + _this.transtionTime / 1000 + 's ease'
      })
    },

    setDot: function(nextIndex) {
      this.dots[this.currentIndex].classList.remove('slider_dot--active')
      this.dots[this.nextIndex].classList.add('slider_dot--active')
    },

    autoPlay: function() {
      var _this = this
      this.pause()
      this.autoPlayTimer = setTimeout(function() {
        _this.slideTo(_this.currentIndex + 1)
        _this.autoPlay()
      }, this.duration)
    },

    pause: function() {
      clearTimeout(this.autoPlayTimer)
    }
  }

  new Slider({
    el: '#slider',
    data: [
      './img/slider1.png',
      './img/slider2.png',
      './img/slider3.png',
      './img/slider4.png',
      './img/slider5.png'
    ]
  })

})(window)
