/*!
 * eSlider.js v0.0.1
 * @author kraaas
 *   https://github.com/kraaas
 *   570453516@qq.com
 * Released under the MIT License.
 */
'use strict';

(function(window, factory) {
  var eSlider = factory()
  eSlider.VERSION = '0.0.1'
  /**
   * umd
   */
  if (typeof require === 'function' && typeof module === 'object' && module && typeof exports === 'object' && exports) {
    module.exports = eSlider
  } else if (typeof define === 'function' && define['amd']) {
    define(function() {
      return eSlider
    });
  } else {
    window['eSlider'] = eSlider
  }

})(window, function() {
  var _ = {
    query: function(el) {
      if (el && el.nodetype !== 1) {
        el = document.querySelector(el)
      }
      return el
    },
    createEl: function(tag) {
      return document.createElement(tag)
    },
    setTransform: function(el, axis, value) {
      el.style.transform = 'translate' + axis + '(' + value + 'px)'
    },
    extend: (function() {
      return Object.assign || function(target) {
        if (target == null) {
          throw new TypeError('Cannot convert undefined or null to object')
        }
        target = Object(target)
        for (var index = 1; index < arguments.length; index++) {
          var source = arguments[index]
          if (source != null) {
            for (var key in source) {
              if (source.hasOwnProperty(key)) {
                target[key] = source[key];
              }
            }
          }
        }
        return target;
      }
    })()
  }

  var transtionFns = {
    /**
     * transition type
     * @param  {Element} slide    [each slide]
     * @param  {Element} prev     [prev slide]
     * @param  {Element} current  [current slide]
     * @param  {Element} next     [next slide]
     * @param  {Number}  offset   [move distance]
     * @param  {Number}  wh       [vertical ? height : width]
     * @return {}
     */
    normal: function(slide, prev, current, next, axis, offset, wh) {
      slide.style.transition = 'none'
      slide.style.zIndex = 0
      prev.style.zIndex = 1
      _.setTransform(prev, axis, offset - wh)
      next.style.zIndex = 1
      _.setTransform(next, axis, offset + wh)
      _.setTransform(current, axis, offset)
      current.style.zIndex = 2
    },

    fade: function(slide, prev, current, next, axis, offset, wh) {
      var opacity = Math.abs(offset) / wh
      next = offset >= 0 ? prev : next
      slide.style.zIndex = 0
      slide.style.opacity = 0
      next.style.zIndex = 1
      next.style.opacity = opacity
      current.style.zIndex = 2
      current.style.opacity = 1 - opacity
    }
  }

  Slider.transtionFns = transtionFns

  function Slider(opt) {
    // options
    this.opt = _.extend({
      data: [],
      autoPlay: true,
      loop: true,
      duration: 3000,
      touchRange: 14,
      transtionType: 'normal',
      indicatorPos: 'center',
      indicatorType: 'normal',
      vertical: false,
    }, opt)

    // container
    this.el = _.query(this.opt.el)

    if (!this.el || this.el.nodeType != 1) {
      throw new TypeError('el should be a selector(String) or an Element!')
    }

    this.axis = this.opt.vertical ? 'Y' : 'X'

    this.width = this.el.offsetWidth

    this.height = this.el.offsetHeight

    this.wh = this.opt.vertical ? this.height : this.width

    // slide data
    this.data = this.opt.data

    // slides compiled with data
    this.slides = []

    // slide direction: X(default) | Y

    // transtion animation: normal(default) | fade
    this.transtionType = this.opt.transtionType

    this.transtionFn = transtionFns[this.transtionType]

    // unit: ms
    this.transtionTime = 300

    // auto play: true(defualt)
    this.autoPlay = this.opt.autoPlay

    this.autoPlayTimer = null

    // loop play: true(default)
    this.loop = this.opt.loop

    // suspending time. unit: ms | 3000ms(default)
    this.duration = this.opt.duration

    this.touchRange = this.opt.touchRange

    // init index of slides
    this.currentIndex = 0

    this.nextIndex = 0

    // show the indicator. true(default)
    this.showDot = true

    this.dots = []

    // indicator's position: left | center(default) | right
    this.indicatorPos = this.opt.indicatorPos

    this.indicatorType = this.opt.indicatorType

    // touch distance
    this.offset = {}

    this.prefixCls = 'slider'

    this.itemPrefixCls = 'slider_item'

    this.indicatorPrefixCls = 'slider_indicator'

    this.init()
  }

  Slider.prototype = {
    constructor: Slider,

    init: function() {
      this.render()

      this.bindEvent()

      // set transition style
      if (this.transtionType === 'normal') {
        this.setSlidesPosition()
      }
      this.setTransitionStyle()

      // first render
      this.slideTo(this.currentIndex)

      this.autoPlay && this.autoPlayAction()
    },

    /**
     * render the dom with dataList
     * @return {} 
     */
    render: function() {

      renderMain.call(this)

      this.showDot && renderIndicator.call(this)

      /**
       * render all slides
       * @return {} 
       */
      function renderMain() {
        var ul = _.createEl('ul')
        ul.classList.add(this.prefixCls + '_wrap')
        this.data.forEach((function(item, index) {
          // li
          var li = _.createEl('li')
          li.classList.add(this.itemPrefixCls)

          var img = _.createEl('img')
          img.classList.add(this.prefixCls + '_img')
          img.src = item

          li.appendChild(img)
          ul.appendChild(li)
          this.slides.push(li)
        }).bind(this))
        this.el.appendChild(ul)
      }

      /**
       * render the indicator when showDot is true
       * @return {} 
       */
      function renderIndicator() {
        // outer wrap 
        var outer = _.createEl('div')
        outer.classList.add(
          this.indicatorPrefixCls + '-outer',
          this.indicatorPrefixCls + '--' + this.indicatorPos,
          this.indicatorPrefixCls + '--' + this.indicatorType
        )
        if (this.indicatorType == 'normal') {
          // ul
          var normalPrefixCls = this.normalPrefixCls = 'slider_dot'
          var inner = _.createEl('ul')
          inner.classList.add(this.indicatorPrefixCls + '-inner')

          this.data.forEach((function(item, index) {
            // li
            var li = _.createEl('li')
            li.classList.add(normalPrefixCls)
            if (index == this.currentIndex) {
              li.classList.add(normalPrefixCls + '--active')
            }
            // ul
            inner.appendChild(li)
            this.dots.push(li)
          }).bind(this))
          outer.appendChild(inner)
        } else {
          var inner
          var circleCurrent
          var circleTotal
          inner = _.createEl('div')
          inner.classList.add(this.indicatorPrefixCls + '-inner')
          circleCurrent = this.circleCurrent = _.createEl('span')
          circleCurrent.classList.add('slider_circle-current')
          circleTotal = this.circleTotal = _.createEl('span')
          circleTotal.textContent = '/' + this.data.length
          inner.appendChild(circleCurrent)
          inner.appendChild(circleTotal)
          outer.appendChild(inner)
        }
        this.el.appendChild(outer)
      }
    },

    /**
     * bind touch envents
     * @return {} 
     */
    bindEvent: function() {
      [
        'touchstart',
        'touchmove',
        'touchend',
        'touchcancel',
        'resize'
      ].forEach((function(event) {
        this.el.addEventListener(event, this.eventHandler.bind(this))
      }).bind(this))
    },

    /**
     * event handler
     * @param  {Event} e 
     * @return {}   
     */
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
        case 'orientationchange':
          this.resizeHandler(e)
          break
      }
    },

    /**
     * touchstart handler
     * @param  {Event} e 
     * @return {}   
     */
    startHandler: function(e) {
      this.offset = {}
      this.pause()
      this.startX = e.targetTouches[0].pageX
      this.startY = e.targetTouches[0].pageY
      this.startTime = new Date().getTime()
    },

    /**
     * touchmove handler
     * @param  {Event} e 
     * @return {}   
     */
    moveHandler: function(e) {
      var nextIndex
      var offset = {}
      var touche = e.targetTouches[0]
      offset.X = touche.pageX - this.startX
      offset.Y = touche.pageY - this.startY
      this.offset = offset

      // when loop config is false 
      // cancle transition when slide
      // index is the max or min.
      var addend = offset[this.axis] > 0 ? -1 : 1
      nextIndex = this.getNextIndex(this.currentIndex + addend)
      if ((isStart.call(this) || isEnd.call(this)) && !this.loop) {
        return
      }

      this.transition(this.offset[this.axis])

      function isStart() {
        return this.currentIndex == 0 && nextIndex == 0
      }

      function isEnd() {
        return this.currentIndex == nextIndex
      }
    },

    /**
     * touchend handler
     * @param  {Event} e 
     * @return {}   
     */
    endHandler: function(e) {
      var endTime = new Date().getTime()
      var boundary = endTime - this.startTime > 300 ? this.wh / 2 : this.touchRange
      var distance = this.offset[this.axis]
      var next = distance >= boundary ? -1 : distance < -boundary ? 1 : 0
      this.slideTo(this.currentIndex + next)
    },

    resizeHandler: function(e) {
      this.width = this.el.offsetWidth
      this.height = this.el.offsetHeight
      this.setSlidesPosition()
    },

    /**
     * switch slides
     * @param  {Number} nextIndex [the next slide's index (start form 0)] 
     * @return {}
     */
    slideTo: function(nextIndex) {
      this.autoPlay && this.pause()
      this.nextIndex = this.getNextIndex(nextIndex)
      this.showDot && this.switchIndicator(this.nextIndex)
      this.currentIndex = this.nextIndex
      this.transition(0)
      this.autoPlay && this.autoPlayAction()
      this.setTransitionStyle()
    },

    slidePrev: function() {
      this.slideTo(this.currentIndex - 1)
    },

    slideNext: function() {
      this.slideTo(this.currentIndex + 1)
    },

    /**
     * transition animation when switch 
     * @param  {Number} offset [touch distance]
     * @return {}
     */
    transition: function(offset) {
      var max = this.slides.length - 1
      var prevIndex = this.getNextIndex(this.currentIndex - 1)
      var nextIndex = this.getNextIndex(this.currentIndex + 1)
      this.slides.forEach((function(slide, index) {
        this.transtionFn(
          slide,
          this.slides[prevIndex],
          this.slides[this.currentIndex],
          this.slides[nextIndex],
          this.axis,
          offset,
          this.wh
        )
      }).bind(this))
    },

    /**
     * get the next index
     * eg: the slides's length is 5, 
     * the max index you can get is 4 and min is 0
     * @param  {[type]} nextIndex [description]
     * @return {[type]}           [description]
     */
    getNextIndex: function(nextIndex) {
      var max = this.slides.length - 1
      if (this.loop) {
        nextIndex = nextIndex > max ? 0 : nextIndex < 0 ? max : nextIndex
      } else {
        nextIndex = nextIndex >= max ? max : nextIndex < 0 ? 0 : nextIndex
      }
      return nextIndex
    },

    /**
     * set slides position when 
     * the tansition type is normal
     */
    setSlidesPosition: function() {
      var x
      this.slides.forEach((function(el, index) {
        if (index === this.currentIndex) {
          x = 0
        } else {
          x = (index - this.currentIndex) * this.wh
        }
        _.setTransform(el, this.axis, x)
      }).bind(this))
    },

    /**
     * set slides style when transition 
     */
    setTransitionStyle: function() {
      this.slides.forEach((function(el, index) {
        el.style.transition = 'all ' + this.transtionTime + 'ms ease'
      }).bind(this))
    },

    /**
     * set dot style when active
     * @param {} 
     */
    switchIndicator: function(nextIndex) {
      if (this.indicatorType == 'normal') {
        this.dots[this.currentIndex].classList.remove(this.normalPrefixCls + '--active')
        this.dots[this.nextIndex].classList.add(this.normalPrefixCls + '--active')
      } else {
        this.circleCurrent.textContent = nextIndex + 1
      }
    },

    /**
     * init auto play
     * @return {}
     */
    autoPlayAction: function() {
      this.pause()
      this.autoPlayTimer = window.setTimeout((function() {
        this.slideTo(this.currentIndex + 1)
        this.autoPlayAction()
      }).bind(this), this.duration)
    },

    /**
     * stop auto paly when transition
     * @return {}
     */
    pause: function() {
      window.clearTimeout(this.autoPlayTimer)
    }
  }

  return Slider
})
