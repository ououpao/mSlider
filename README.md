## eSlider
Simple & classicle slider for web apps. providers 2 transitions, fade and translateX.  

![](https://img.shields.io/npm/v/eSlider.svg)  ![](https://img.shields.io/npm/dm/eSlider.svg)  ![](https://img.shields.io/packagist/l/doctrine/orm.svg)  

```javascript
var slider = new eSlider({
    el: '#slider',
    data: [
      './img/slider1.png',
      '<img src="./img/slider5.png">',
      {
        name: 'first',
        content: '<img src="./img/slider5.png">'
      }
    ],
    autoPlay: false,
    loop: false,
    vertical: false,
    transtionType: 'normal',
    duration: 2000,
    indicatorPos: 'right',
    indicatorType: 'circle',
    touchRange: 10,
    initSlide: 2
})

```

PC:  :point_right: [DEMO](https://kraaas.github.io/eSlider/) 
Mobile:  
![](https://raw.githubusercontent.com/kraaas/eSlider/master/demo/img/qrcode.png)

## Table of Contents

* [Install](#install)
* [Useage](#useage)
* [API](#api)
* [License](#license)

## <span name="install">Install</span>

git clone

```bash
git clone https://github.com/kraaas/eSlider.git
```

npm

```bash
npm install eSlider --save
```

## <span name="useage">Useage</span>

create an empty container
    
```html
<div id="slider"></div>
```

inset `eSlider.min.js` & `eSlider.min.css` 

```html
<script src="eSlider.min.css"></script>
<script src="eSlider.min.js"></script>
```

fill data and options

```javascript
var slider = new eSlider({
    el: '#slider',
    data: [
        './img/img1.png',
        './img/img2.png',
        './img/img3.png'
    ],
    autoPlay: false,
    loop: false,
    ...
})
```

## <span name="api">API</span>

`updating...`

## <span name="license">License</span>
[MIT](http://opensource.org/licenses/MIT)
