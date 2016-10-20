## mSlider
简单实用的手机端滑动组件， 支持多种过渡效果，左右/垂直切换，指示器等。
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

`PC预览`:  :point_right: [DEMO](https://kraaas.github.io/mSlider/)   
`手机扫码预览`:  
![](https://raw.githubusercontent.com/kraaas/mSlider/master/demo/img/qrcode.png)

## Table of Contents

* [Install](#install)
* [Useage](#useage)
* [API](#api)
* [License](#license)

## <span name="install">Install</span>

npm

```bash
npm install mSlider --save
```

git clone

```bash
git clone https://github.com/kraaas/mSlider.git
```

## <span name="useage">Useage</span>

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

### 1.配置项  

|配置项|说明|类型|默认值|
|------|----|----|------|
|el|slider容器|String/Element||
|data|用于slider展示的数据| Arrya| [ ]|
|width|slider宽度(px)|Number|el的宽度|
|height|slider高度(px)|Number|el的高度|
|initSlide|初始化后显示第几个slide|Number/String|1|
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

#### el
用于放置slider的容器，可设置其宽高，或者在配置项中指定slider的宽高.  
可以是`css`选择器, 也可以是Element对象： 
```javascript
// selector
new mSlider({
    el: '#slider'
    ...
})

// Element 
var container = document.querySelector('#slider')
new mSlider({
    el: container 
    ...
})
```

#### data
用于slider展示的数据，数组类型，数组项可以是以下三种类型的任意混合：

1.图片路径
```javascript
new mSlider({
    data: [
        'http://domain.img.com/slider1.jpg',
        'http://domain.img.com/slider2.jpg',
    ]
})
```
2.html字符串  

```javascript
new mSlider({
    data: [
        '<div>slider1</div>',
        '<div><a href="#">slider2</a></div>',
    ]
})
```
注：html字符串只允许有一个顶级元素
```javascript
// wrong
new mSlider({
    data: [
        '<div>slider1</div><div>wrong</div>',
    ]
})
// right
new mSlider({
    data: [
        '<div>slider1<div>right</div></div>',
    ]
})
```

3.对象  
对象有两个属性：  
`name`: slide的名称, 表示唯一标识， 可用于`slideTo`方法的跳转。  
`content`: slide内容, 可以是以上两种格式。
```javascript
new mSlider({
    data: [{
        name: 'slider1',
        content: 'http://domain.img.com/slider1.jpg'
    },{
        name: 'slider2',
        content: '<div>slider2</div>'
    }]
})
```

#### initSlide
初始化时显示的slide，可以是`Numbe`表示第几个slide,可以是`slide`的`name`属性：
```javascript
new mSlider({
    data: [{
        name: 'slider1',
        content: 'http://domain.img.com/slider1.jpg'
    },{
        name: 'slider2',
        content: '<div>slider2</div>'
    }],
    initSlide: 2 // 显示第二个slide
})

new mSlider({
    data: [{
        name: 'slider1',
        content: 'http://domain.img.com/slider1.jpg'
    },{
        name: 'slider2',
        content: '<div>slider2</div>'
    }],
    initSlide: 'slider2' // 也是显示第二个slide
})
```
#### transtionType
过渡效果的类型，支持滚动(normal),透明度渐变(fade)
#### transtionTimeFn
过渡效果的完成时间函数，支持`css transition`属性的值
#### indicatorPos
指示器的位置：`left`, `center`, `right`
#### indicatorType
指示器的类型：点状`normal`，圆形`circle`

### 2.slideTo(key)
跳转到指定的slide, 接受一个参数`key`, 可以为slide的序号和name属性： 

跳转到第2个slide
```javascript
slider.slideTo(2)
```

跳转到`name`属性为`food`的slide,若未找到则默认跳转到第一个slide。
```javascript
slider.slideTo('food')
```
### 3.slidePrev()
跳转到上一个slide
### 4.slideNext()
跳转到下一个slide
### 5.pause()
停止循环轮播(设置了`autoPlay`为`true`)
### 6.destroy()
注销slider 
## <span name="license">License</span>
[MIT](http://opensource.org/licenses/MIT)
