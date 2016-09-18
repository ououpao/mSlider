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

    isPlainObject: function(obj) {
      if (typeof obj != 'object') return
      var exit = false
      var key
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          exit = true
        }
      }
      return exit
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
      this.setCSSTranslate(prev, axis, offset - wh)
      next.style.zIndex = 1
      this.setCSSTranslate(next, axis, offset + wh)
      this.setCSSTranslate(current, axis, offset)
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

  var slideType = {
    NODE: 'node',
    IMG: 'img'
  }

  Slider.transtionFns = transtionFns

  function Slider(opt) {
    // options
    this.opt = _.extend({
      data: [],
      initSlide: 0,
      autoPlay: true,
      loop: true,
      duration: 3000,
      touchRange: 14,
      transtionType: 'normal',
      transtionTimeFn: 'ease-out',
      transtionTime: 300,
      showIndicator: true,
      indicatorPos: 'center',
      indicatorType: 'normal',
      vertical: false,
      enableGPU: true
    }, opt)

    // container
    this.el = _.query(this.opt.el)

    if (!this.el || this.el.nodeType != 1) {
      throw new TypeError('el should be a selector(String) or an Element!')
    }

    this.axis = this.opt.vertical ? 'Y' : 'X'

    this.wh = this.opt.vertical ? this.el.offsetHeight : this.el.offsetWidth

    // slide data
    this.data = this.opt.data

    // slides compiled with data
    this.slides = []

    // slide direction: X(default) | Y

    // transtion animation: normal(default) | fade
    this.transtionType = this.opt.transtionType

    this.transtionFn = transtionFns[this.transtionType]

    this.transtionTimeFn = this.opt.transtionTimeFn

    // unit: ms
    this.transtionTime = this.opt.transtionTime

    // auto play: true(defualt)
    this.autoPlay = this.opt.autoPlay

    this.autoPlayTimer = null

    // loop play: true(default)
    this.loop = this.opt.loop

    // suspending time. unit: ms | 3000ms(default)
    this.duration = this.opt.duration

    this.touchRange = this.opt.touchRange

    this.initSlide = this.opt.initSlide

    // init index of slides
    this.currentIndex = this.opt.initSlide || 0

    this.nextIndex = 0

    // show the indicator. true(default)
    this.showIndicator = this.opt.showIndicator

    this.dots = []

    // indicator's position: left | center(default) | right
    this.indicatorPos = this.opt.indicatorPos

    this.indicatorType = this.opt.indicatorType

    this.enableGPU = this.opt.enableGPU

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

      this.makeSlide()

      this.render()

      this.bindEvent()

      this.currentIndex = this.getCorrectIndex(this.initSlide)

      // set transition style
      if (this.transtionType === 'normal') {
        this.setSlidesPosition()
      }
      this.setTransitionStyle()

      // first render
      this.slideTo(this.currentIndex)

      this.autoPlay && this.autoPlayAction()
    },

    makeSlide: function() {
      var nodeReg = /^<.*/
      this.data.forEach(function(item, index, array) {
        var slide = {
          type: '',
          name: '',
          content: ''
        }
        if (typeof item == 'string') {
          slide.content = item
          slide.name = index
        } else if (_.isPlainObject(item)) {
          slide.content = item.content
          slide.name = item.name || index
        }
        slide.type = nodeReg.test(slide.content) ? slideType.NODE : slideType.IMG
        array[index] = slide
      })
    },

    /**
     * render the dom with dataList
     * @return {} 
     */
    render: function() {

      renderMain.call(this)

      this.showIndicator && renderIndicator.call(this)

      /**
       * render all slides
       * @return {} 
       */
      function renderMain() {
        var ul = _.createEl('ul')
        ul.classList.add(this.prefixCls + '_wrap')
        this.data.forEach((function(slide, index) {
          // li
          var li = _.createEl('li')
          var img = _.createEl('img')
          li.classList.add(this.itemPrefixCls)
          if (slide.type == slideType.IMG) {
            img.classList.add(this.prefixCls + '_img')
            img.src = slide.content
            li.appendChild(img)
          } else if (slide.type == slideType.NODE) {
            li.innerHTML = slide.content
          }
          ul.appendChild(li)
          this.slides.push(li)
        }).bind(this))
        this.el.appendChild(ul)
      }

      /**
       * render the indicator when showIndicator is true
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
        
      ].forEach((function(event) {
        this.el.addEventListener(event, this.eventHandler.bind(this))
      }).bind(this))

      this.resize = 'onorientationchange' in window ? 'orientationchange' : 'resize'
      window.addEventListener(this.resize, this.eventHandler.bind(this))
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
        case 'resize':
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
      var next
      next = distance >= boundary ? -1 : distance < -boundary ? 1 : 0
      this.slideTo(this.currentIndex + next)
      if (!distance || Math.abs(distance) < this.touchRange) {
        this.triggerLink(e && e.target)
      }
    },

    resizeHandler: function(e) {
      this.wh = this.opt.vertical ? this.el.offsetHeight : this.el.offsetWidth
      this.setSlidesPosition()
    },

    /**
     * switch slides
     * @param  {Number} nextIndex [the next slide's index (start form 0)] 
     * @return {}
     */
    slideTo: function(nextIndex) {
      if (typeof nextIndex == 'string') {
        nextIndex = this.getCorrectIndex(nextIndex)
      }
      this.autoPlay && this.pause()
      this.nextIndex = this.getNextIndex(nextIndex)
      this.showIndicator && this.switchIndicator(this.nextIndex)
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

    triggerLink: function(el) {
      var tagName = el.tagName
      if (tagName == 'A') {
        if (el.getAttribute('target') == '_blank') {
          window.open(el.href)
        } else {
          window.location.href = el.href
        }
      } else if (tagName == "LI" && el.classList.contains(this.itemPrefixCls) > -1) {
        return
      } else {
        this.triggerLink(el.parentNode)
      }
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
        this.transtionFn.call(
          this,
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

    getCorrectIndex: function(key) {
      var index = 0
      var exit = false
      var type = typeof key
      if (type == 'number') {
        index = this.initSlide
      } else if (type == 'string') {
        this.data.forEach((function(slide, i) {
          if (slide.name == key) {
            index = i
            exit = true
          }
        }).bind(this))
        if (!exit) {
          console.error('can\'t find the slide with the name: "' + this.initSlide + '"')
        }
      }
      return index
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
        this.setCSSTranslate(el, this.axis, x)
      }).bind(this))
    },

    setCSSTranslate: function(el, axis, value) {
      var x = 0,
        y = 0
      if (axis == 'X') {
        x = value
      } else {
        y = value
      }
      if (this.enableGPU) {
        el.style.cssText += ';-webkit-transform: translate3d(' + x + 'px, ' + y + 'px, 0)'
      } else {
        el.style.cssText += ';-webkit-transform: translate' + axis + '(' + value + 'px)'
      }
    },

    /**
     * set slides style when transition 
     */
    setTransitionStyle: function() {
      this.slides.forEach((function(el, index) {
        el.style.transition = 'all ' + this.transtionTime + 'ms ' + this.transtionTimeFn
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
     * stop autoPaly
     * @return {}
     */
    pause: function() {
      window.clearTimeout(this.autoPlayTimer)
    }
  }

  return Slider
})
