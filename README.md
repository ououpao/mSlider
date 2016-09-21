## mSlider
简单实用的手机端slider.  

![](https://img.shields.io/npm/v/eSlider.svg)  ![](https://img.shields.io/npm/dm/eSlider.svg)  ![](https://img.shields.io/packagist/l/doctrine/orm.svg)  

```javascript
var slider = new mSlider({
    el: '#slider',
    data: [
      './img/slider1.png',
      '<div>slider2</div>',{
        name: 'first',
        content: '<div>slider3</div>'
      }
    ],
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
})

```

PC:  :point_right: [DEMO](https://kraaas.github.io/mSlider/) 
Mobile:  
![](https://raw.githubusercontent.com/kraaas/mSlider/master/demo/img/qrcode.png)

## Table of Contents

* [安装](#install)
* [使用](#useage)
* [API](#api)
* [License](#license)

## <span name="install">安装</span>

npm

```bash
npm install mSlider --save
```

git clone

```bash
git clone https://github.com/kraaas/mSlider.git
```

## <span name="useage">使用</span>

1.创建一个空节点
    
```html
<div id="slider"></div>
```

2.引入 `mSlider.min.css`  和 `mSlider.min.js` 

```html
<script src="mSlider.min.css"></script>
<script src="mSlider.min.js"></script>
```

3.定义你的展示数据

```javascript
var data = [
    './img/img1.png',
    './img/img2.png',
    './img/img3.png'
]
```

4.创建 `mSlider` 实例
```javascript
var slider = new mSlider({
    el: '#slider',
    data: data,
    autoPlay: false,
    loop: false,
    ...
})
```

## <span name="api">API</span>

1.配置项  

|配置项|说明|类型|默认值|
|------|----|----|------|
|el|slider容器|String/Element||
|data|用于slider展示的数据| Arrya| [ ]|
|initSlide|初始化后选中的slide索引|Number/String|0|
|autoPlay|是否自动播放|Boolean|true|
|loop|是否循环播放|Boolean|true|
|duration|播放的时间间隔(ms)|Number|3000|
|touchRange|有效触摸范围(px)|Number|10|
|transtionType|过渡效果类型|String|normal|
|transtionTimeFn|过渡效果函数|String|easy-out|
|transtionTime|过渡效果完成时间(ms)|Number|300|
|showIndicator|是否显示指示器|Boolean|true|
|indicatorPos|指示器位置|String|center|
|indicatorType|指示器类型|String|normal|
|vertical|是否垂直滚动|Boolean|false|
|enableGPU|是否启用3D加速|Boolean|true|
|replace|是否覆盖容器|Boolean|flase|

## <span name="license">License</span>
[MIT](http://opensource.org/licenses/MIT)
