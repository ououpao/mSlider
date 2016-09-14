/*!
 * eSlider.js v0.0.1
 * @author kraaas
 *   https://github.com/kraaas
 *   570453516@qq.com
 * Released under the MIT License.
 */
'use strict';

(function(window, factory) {
  var Slider = factory()
  Slider.VERSION = '0.0.1'

  function sliderCreator(opt) {
    return new Slider(opt)
  }
  /**
   * umd
   */
  if (typeof require === 'function' && typeof module === 'object' && module && typeof exports === 'object' && exports) {
    module.exports = sliderCreator
  } else if (typeof define === 'function' && define['amd']) {
    define(function() {
      return sliderCreator
    });
  } else {
    window['Slider'] = sliderCreator
  }

})(window, function() {
  var uilt = {
    query: function(el) {
      if (el && el.nodetype !== 1) {
        el = document.querySelector(el)
      }
      return el
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
     * @param  {Element} slide       [each slide]
     * @param  {Element} prev     [prev slide]
     * @param  {Element} current  [current slide]
     * @param  {Element} next     [next slide]
     * @param  {Number} offset    [move distance]
     * @param  {Number} width     [container width]
     * @return {}
     */
    normal: function(slide, prev, current, next, offset, width) {
      slide.style.transition = 'none'
      slide.style.zIndex = 0
      prev.style.transform = 'translateX(' + (offset - width) + 'px)'
      current.style.transform = 'translateX(' + offset + 'px)'
      current.style.zIndex = 2
      next.style.transform = 'translateX(' + (offset + width) + 'px)'
    },

    fade: function(slide, prev, current, next, offset, width) {
      var opacity = Math.abs(offset) / width
      next = offset >= 0 ? prev : next
      slide.style.zIndex = 0
      slide.style.opacity = 0
      next.style.zIndex = 1
      next.style.opacity = opacity
      current.style.zIndex = 2
      current.style.opacity = 1 - opacity
    }
  }

  function Slider(opt) {
    // options
    this.opt = uilt.extend({}, opt)

    // container
    this.el = uilt.query(this.opt.el)

    this.width = this.el.offsetWidth

    // slide data
    this.data = this.opt.data || []

    // slides compiled with data
    this.slides = []

    // slide direction: X(default) | Y
    this.axis = this.opt.vertical ? 'Y' : 'X'

    // transtion animation: normal(default) | fade
    this.transtionName = this.opt.transtionName || 'normal'

    this.transtionFn = transtionFns[this.transtionName]

    // unit: ms
    this.transtionTime = 300

    this.isAutoPlay = true

    this.autoPlayTimer = null

    // suspending time. unit: ms
    this.duration = this.opt.duration || 2000

    // init index of slides
    this.currentIndex = 0

    this.nextIndex = 0

    // show the indicator. true(default)
    this.showDot = true

    this.dots = []

    // indicator's position: left | center(default) | right
    this.dotPosition = this.opt.dotPosition || 'center'

    // touch distance
    this.offset = {}

    this.prefixCls = 'slider'

    this.itemPrefixCls = 'slider_item'

    this.dotPrefixCls = 'slider_dot'

    this.init()
  }

  Slider.prototype = {
    constructor: Slider,

    init: function() {
      if (!this.el || this.el.nodeType != 1) {
        throw new TypeError('el should be a String or Element!')
      }

      this.render()

      this.bindEvent()

      // set transition style
      if (this.transtionName === 'normal') {
        this.setSlidesPosition()
      }
      this.setTransitionStyle()

      // first render
      this.slideTo(this.currentIndex)

      this.isAutoPlay && this.autoPlay()
    },

    /**
     * render the dom with dataList
     * @return {} 
     */
    render: function() {

      renderMain.call(this)

      this.showDot && renderDot.call(this)

      /**
       * render all slides
       * @return {} 
       */
      function renderMain() {
        var ul = document.createElement('ul')
        ul.classList.add(this.prefixCls + '_wrap')
        this.data.forEach((function(item, index) {
          // li
          var li = document.createElement('li')
          li.classList.add(this.itemPrefixCls)

          var img = document.createElement('img')
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
      function renderDot() {
        // outer wrap 
        var outer = document.createElement('div')
        var cls = this.dotPrefixCls + '-outer'
        outer.classList.add(cls, cls + '--' + this.dotPosition)

        // ul
        var ul = document.createElement('ul')
        ul.classList.add(this.dotPrefixCls + '-inner')

        this.data.forEach((function(item, index) {
          // li
          var li = document.createElement('li')
          li.classList.add(this.dotPrefixCls)
          if (index == this.currentIndex) {
            li.classList.add(this.dotPrefixCls + '--active')
          }
          // ul
          ul.appendChild(li)
          this.dots.push(li)
        }).bind(this))
        outer.appendChild(ul)
        this.el.appendChild(outer)
      }
    },

    /**
     * bind touch envents
     * @return {} 
     */
    bindEvent: function() {
      this.el.addEventListener('touchstart', this.eventHandler.bind(this))
      this.el.addEventListener('touchmove', this.eventHandler.bind(this))
      this.el.addEventListener('touchend', this.eventHandler.bind(this))
      this.el.addEventListener('touchcancel', this.eventHandler.bind(this))
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
      var offset = {}
      offset.X = e.targetTouches[0].pageX - this.startX
      offset.Y = e.targetTouches[0].pageY - this.startY
      this.offset = offset
      this.transition(this.offset.X)
    },

    /**
     * touchend handler
     * @param  {Event} e 
     * @return {}   
     */
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

    /**
     * switch slides
     * @param  {Number} nextIndex [the next slide's index (start form 0)] 
     * @return {}
     */
    slideTo: function(nextIndex) {
      this.isAutoPlay && this.pause()
      this.nextIndex = this.getNextIndex(nextIndex)
      this.showDot && this.setDot(this.nextIndex)
      this.currentIndex = this.nextIndex
      this.transition(0, true)
      this.isAutoPlay && this.autoPlay()
      this.setTransitionStyle()
    },

    /**
     * transition animation when switch 
     * @param  {Number} offset [touch distance]
     * @return {}
     */
    transition: function(offset) {
      var prevIndex = this.getNextIndex(this.currentIndex - 1)
      var nextIndex = this.getNextIndex(this.currentIndex + 1)
      this.slides.forEach((function(slide, index) {
        this.transtionFn(slide, this.slides[prevIndex], this.slides[this.currentIndex], this.slides[nextIndex], offset, this.width)
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
      nextIndex = nextIndex > max ? 0 : nextIndex < 0 ? max : nextIndex
      return nextIndex
    },

    /**
     * set slides position when 
     * the tansition type is normal
     */
    setSlidesPosition: function() {
      this.slides.forEach((function(el, index) {
        var x
        if (index === this.currentIndex) {
          x = 0
        } else {
          x = (index - this.currentIndex) * this.width
        }
        el.style.transform = 'translateX(' + x + 'px)'
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
    setDot: function(nextIndex) {
      this.dots[this.currentIndex].classList.remove('slider_dot--active')
      this.dots[this.nextIndex].classList.add('slider_dot--active')
    },

    /**
     * init auto play
     * @return {}
     */
    autoPlay: function() {
      this.pause()
      this.autoPlayTimer = setTimeout((function() {
        this.slideTo(this.currentIndex + 1)
        this.autoPlay()
      }).bind(this), this.duration)
    },

    /**
     * stop auto paly when transition
     * @return {}
     */
    pause: function() {
      clearTimeout(this.autoPlayTimer)
    }
  }

  return Slider
})
