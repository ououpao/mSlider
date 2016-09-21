/*!
 * mSlider.js v0.0.1
 * @author kraaas
 *   https://github.com/kraaas
 *   570453516@qq.com
 * Released under the MIT License.
 */
'use strict';

(function(factory) {
  var mSlider = factory()
  mSlider.VERSION = '0.0.1'
    /**
     * umd
     */
  if (typeof require === 'function' && typeof module === 'object' && module && typeof exports === 'object' && exports) {
    module.exports = mSlider
  } else if (typeof define === 'function' && define['amd']) {
    define(function() {
      return mSlider
    });
  } else {
    window['mSlider'] = mSlider
  }

})(function() {
  var utils = {
    query: function(el) {
      if (el && el.nodetype !== 1) {
        el = document.querySelector(el)
      }
      return el
    },

    createEl: function(tag) {
      return document.createElement(tag)
    },

    isObject: function(obj) {
      return Object.prototype.toString.call(obj) === '[object Object]'
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
      slide.style.zIndex = -1
      prev.style.zIndex = 1
      this._setCSSTranslate(prev, axis, offset - wh)
      next.style.zIndex = 0
      this._setCSSTranslate(next, axis, offset + wh)
      this._setCSSTranslate(current, axis, offset)
      current.style.zIndex = 2
    },

    fade: function(slide, prev, current, next, axis, offset, wh) {
      var opacity = Math.abs(offset) / wh
      next = offset >= 0 ? prev : next
      slide.style.zIndex = -1
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
    // proxy options to this
    // so that we can use directly
    // on this Object
    utils.extend(this, {
      el: '',
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
      enableGPU: true,
      replace: false
    }, opt)

    this.opt = opt

    // mSlider container
    // a selector or an Element
    this.el = utils.query(this.el)

    if (!this.el || this.el.nodeType != 1) {
      throw new TypeError('el should be a selector(String) or an Element!')
    }

    this.width = this.width ? this.width : this.el.offsetWidth

    this.height = this.height ? this.height : this.el.offsetHeight

    this._axis = this.vertical ? 'Y' : 'X'

    // slides compiled with data
    this._slides = []

    this._transtionFn = transtionFns[this.transtionType]

    this._nextIndex = 0

    // touch distance on X axis and Y axis
    this._offset = {}

    this._indexCache = {}

    this._prefixCls = 'mslider'

    this._itemPrefixCls = 'mslider_item'

    this._indicatorPrefixCls = 'mslider_indicator'

    this._init()

  }

  // APIs
  // private api start with _
  Slider.prototype = {

    constructor: Slider,

    _init: function() {

      this._initData()

      this._render()

      this._bindEvent()

      this._currentIndex = this._getCorrectIndex(this.initSlide)

      // if data is empty, 
      // stop continue init
      if(!this.data.length) {
        return
      }

      this._initSlideStyle()

      this._setCSSTransition()

      this.slideTo(this._currentIndex)

      this.autoPlay && this._autoPlayAction()
    },

    _initData: function() {
      this.data.forEach(function(item, index, array) {
        var slide = {
          type: '',
          name: '',
          content: '',
          description: ''
        }
        if (typeof item == 'string') {
          slide.content = item
          slide.name = index
        } else if (utils.isObject(item)) {
          slide.content = item.content
          slide.name = item.name || index
          slide.description = item.description
        }
        slide.type = slide.content[0] == '<' ? slideType.NODE : slideType.IMG
        array[index] = slide
      })
    },

    /**
     * render the dom with dataList
     * @return {} 
     */
    _render: function() {
      var mSlider = this.wrap = utils.createEl('div')
      mSlider.classList.add(this._prefixCls)
      mSlider.style.cssText += ';width:' + this.width + ';height:' + this.height

      renderMain.call(this)

      this.showIndicator && renderIndicator.call(this)

      if (this.replace) {
        this.el.parentNode.replaceChild(mSlider, this.el)
      } else {
        this.el.appendChild(mSlider)
      }

      /**
       * render all slides
       * @return {} 
       */
      function renderMain() {
        var ul = utils.createEl('ul')
        ul.classList.add(this._prefixCls + '_slides')
        this.data.forEach((function(slide, index) {
          // li
          var li = utils.createEl('li')
          var img = utils.createEl('img')
          li.classList.add(this._itemPrefixCls)
            // img
          if (slide.type == slideType.IMG) {
            img.classList.add(this._prefixCls + '_img')
            img.src = slide.content
            li.appendChild(img)
              // node
          } else if (slide.type == slideType.NODE) {
            li.innerHTML = slide.content
          }
          // description
          if (slide.description) {
            var description = utils.createEl('div')
            description.classList.add(this._prefixCls + '_description')
            description.textContent = slide.description

            if (slide.type == slideType.NODE) {
              li.firstChild.appendChild(description)
            } else {
              li.appendChild(description)
            }

          }
          ul.appendChild(li)
          this._slides.push(li)
        }).bind(this))
        mSlider.appendChild(ul)
      }

      /**
       * render the indicator when showIndicator is true
       * @return {} 
       */
      function renderIndicator() {
        var isNormal = this.indicatorType == 'normal'

        // wrap
        var indicatorWrap = this.indicatorWrap = utils.createEl(isNormal ? 'ul' : 'div')
        indicatorWrap.classList.add(
          this._indicatorPrefixCls,
          this._indicatorPrefixCls + '--' + this.indicatorPos,
          this._indicatorPrefixCls + '--' + this.indicatorType
        )
        if (isNormal) {
          // ul
          this.dots = []
          var normalPrefixCls = this.normalPrefixCls = this._prefixCls + '_dot'
          this.data.forEach((function(item, index) {
            // li
            var li = utils.createEl('li')
            li.classList.add(normalPrefixCls)
            if (index == this._currentIndex) {
              li.classList.add(normalPrefixCls + '--active')
            }
            // ul
            indicatorWrap.appendChild(li)
            this.dots.push(li)
          }).bind(this))
        } else {
          // current
          var circleCurrent = this.circleCurrent = utils.createEl('span')
          circleCurrent.classList.add(this._prefixCls + '_circle-current')
            // total
          var circleTotal = this.circleTotal = utils.createEl('span')
          circleTotal.textContent = '/' + this.data.length

          indicatorWrap.appendChild(circleCurrent)
          indicatorWrap.appendChild(circleTotal)
        }

        mSlider.appendChild(indicatorWrap)
      }
    },

    /**
     * bind touch events
     * @return {} 
     */
    _bindEvent: function() {
      this.envents = [
        'touchstart',
        'touchmove',
        'touchend',
        'touchcancel',
      ]
      this._eventHandler = this._eventHandler.bind(this)

      // registe touch events 
      this.envents.forEach((function(event) {
        this.wrap.addEventListener(event, this._eventHandler)
      }).bind(this))

      // resize
      this.resizeEvent = 'onorientationchange' in window ? 'orientationchange' : 'resize'
      window.addEventListener(this.resizeEvent, this._eventHandler)
    },

    /**
     * event handler
     * @param  {Event} e 
     * @return {}   
     */
    _eventHandler: function(e) {
      e.preventDefault()
      switch (e.type) {
        case 'touchstart':
          this._startHandler(e)
          break
        case 'touchmove':
          this._moveHandler(e)
          break
        case 'touchend':
        case 'touchcancel':
          this._endHandler(e)
          break
        case this.resizeEvent:
          this._resizeHandler(e)
          break
      }
    },

    /**
     * touchstart handler
     * @param  {Event} e 
     * @return {}   
     */
    _startHandler: function(e) {
      this._offset = {}
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
    _moveHandler: function(e) {
      var nextIndex
      var offset = {}
      var touche = e.targetTouches[0]
      offset.X = touche.pageX - this.startX
      offset.Y = touche.pageY - this.startY
      this._offset = offset

      // when loop config is false 
      // cancle transition when slide
      // index is the max or min.
      var addend = offset[this._axis] > 0 ? -1 : 1
      nextIndex = this._getNextIndex(this._currentIndex + addend)
      if ((isStart.call(this) || isEnd.call(this)) && !this.loop) {
        return
      }

      this._transition(this._offset[this._axis])

      function isStart() {
        return this._currentIndex == 0 && nextIndex == 0
      }

      function isEnd() {
        return this._currentIndex == nextIndex
      }
    },

    /**
     * touchend handler
     * @param  {Event} e 
     * @return {}   
     */
    _endHandler: function(e) {
      var endTime = new Date().getTime()
      var boundary = endTime - this.startTime > 300 ? this.wh / 2 : this.touchRange
      var distance = this._offset[this._axis]
      var next
      next = distance >= boundary ? -1 : distance < -boundary ? 1 : 0
      this.slideTo(this._currentIndex + next)
      if (!distance || Math.abs(distance) < this.touchRange) {
        this._triggerLink(e && e.target)
      }
    },

    _resizeHandler: function(e) {
      this._setWh()
      this._initSlideStyle()
    },

    _triggerLink: function(el) {
      var tagName = el.tagName
      if (tagName == 'A') {
        if (el.getAttribute('target') == '_blank') {
          window.open(el.href)
        } else {
          window.location.href = el.href
        }
      } else if (tagName == "LI" && el.classList.contains(this._itemPrefixCls)) {
        return
      } else if (el.classList.contains(this._indicatorPrefixCls)) {
        return
      } else {
        this._triggerLink(el.parentNode)
      }
    },

    /**
     * transition animation when switch 
     * @param  {Number} offset [touch distance]
     * @return {}
     */
    _transition: function(offset) {
      var max = this._slides.length - 1
      var cache = this._indexCache[this._currentIndex]
      var prevIndex, nextIndex
      if (cache) {
        prevIndex = cache.prevIndex
        nextIndex = cache.nextIndex
      } else {
        prevIndex = this._getNextIndex(this._currentIndex - 1)
        nextIndex = this._getNextIndex(this._currentIndex + 1)
        this._indexCache[this._currentIndex] = {
          prevIndex: prevIndex,
          nextIndex: nextIndex
        }
      }
      this._slides.forEach((function(slide, index) {
        this._transtionFn.call(
          this,
          slide,
          this._slides[prevIndex],
          this._slides[this._currentIndex],
          this._slides[nextIndex],
          this._axis,
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
    _getNextIndex: function(nextIndex) {
      var max = this._slides.length - 1
      if (this.loop) {
        nextIndex = nextIndex > max ? 0 : nextIndex < 0 ? max : nextIndex
      } else {
        nextIndex = nextIndex >= max ? max : nextIndex < 0 ? 0 : nextIndex
      }
      return nextIndex
    },

    _getCorrectIndex: function(key) {
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
    _initSlideStyle: function() {
      var value
      this._setWh()
      if (this.transtionType == 'normal') {
        this._slides.forEach((function(el, index) {
          if (index === this._currentIndex) {
            value = 0
          } else {
            value = (index - this._currentIndex) * this.wh
          }
          this._setCSSTranslate(el, this._axis, value)
        }).bind(this))
      }
    },

    _setWh: function() {
      this.wh = this.vertical ? this.wrap.offsetHeight : this.wrap.offsetWidth
    },

    _setCSSTranslate: function(el, axis, value) {
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
    _setCSSTransition: function() {
      this._slides.forEach((function(el, index) {
        el.style.transition = 'all ' + this.transtionTime + 'ms ' + this.transtionTimeFn
      }).bind(this))
    },

    /**
     * set dot style when active
     * @param {} 
     */
    _switchIndicator: function(nextIndex) {
      if (this.indicatorType == 'normal') {
        this.dots[this._currentIndex].classList.remove(this.normalPrefixCls + '--active')
        this.dots[this._nextIndex].classList.add(this.normalPrefixCls + '--active')
      } else {
        this.circleCurrent.textContent = nextIndex + 1
      }
    },

    /**
     * init auto play
     * @return {}
     */
    _autoPlayAction: function() {
      this.pause()
      this.autoPlayTimer = window.setTimeout((function() {
        this.slideTo(this._currentIndex + 1)
        this._autoPlayAction()
      }).bind(this), this.duration)
    },

    /**
     * switch slides
     * @param  {Number} nextIndex [the next slide's index (start form 0)] 
     * @return {}
     */
    slideTo: function(nextIndex) {
      if (typeof nextIndex == 'string') {
        nextIndex = this._getCorrectIndex(nextIndex)
      }
      this.autoPlay && this.pause()
      this._nextIndex = this._getNextIndex(nextIndex)
      this.showIndicator && this._switchIndicator(this._nextIndex)
      this._currentIndex = this._nextIndex
      this._transition(0)
      this.autoPlay && this._autoPlayAction()
      this._setCSSTransition()
      return this
    },

    slidePrev: function() {
      this.slideTo(this._currentIndex - 1)
      return this
    },

    slideNext: function() {
      this.slideTo(this._currentIndex + 1)
      return this
    },

    /**
     * stop autoPaly
     * @return {}
     */
    pause: function() {
      window.clearTimeout(this.autoPlayTimer)
      return this
    },

    destroy: function() {
      // destroy touch events
      this.envents.forEach((function(event) {
        this.wrap.removeEventListener(event, this._eventHandler)
      }).bind(this))

      // destroy resize event
      window.removeEventListener(this.resizeEvent, this._eventHandler)

      // empty container
      this.wrap.innerHTML = ''

      return this
    }
  }

  return Slider
})
