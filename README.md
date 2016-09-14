## eSlider
simple & classicle slider for web apps. providers 2 transitions, fade and translateX.  
:point_right: [DEMO](https://kraaas.github.io/eSlider/)  
![](https://raw.githubusercontent.com/kraaas/eSlider/master/demo/img/qrcode.png)

## 安装

###### github clone

```bash
git clone https://github.com/kraaas/eSlider.git
```

###### npm

```bash
npm install eSlider --save
```

## 使用

###### 创建一个空的容器
    
```html
<div id="e-slider"></div>
```

###### 数据

```javascript
var data = [
    './img/img1.png',
    './img/img2.png',
    './img/img3.png'
]
```

###### 引入`eSlider`

```html
<script src="eSlider.min.js"></script>
```

###### 可以愉快的使用了

```javascript
var eSlider = ESlider({
    el: '#e-slider',
    data: data
})
```

## API

`updating...`
