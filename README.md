# HTMLToJSON
Flatten your html source, and generate json text data

## Platform
Browser Or jsdom

## What is Used To be
If we have some html code
```html
<div>
    <p>helloworld</p>
    <span>
        text
        <span>text3</span>
        <span>text4</span>
    </span>
    <p>123456<span>78</span>90<br/><span>2333333</span></p>
</div>
<img src="https://avatars3.githubusercontent.com/u/4409743?v=3&s=460"/>
wwwww
<span>12323</span>
1232323
213123123
<br />
```
Without CSS Stylesheets, This code should looking like this:

![image](https://cloud.githubusercontent.com/assets/4409743/24209325/e1985ab4-0f60-11e7-9b24-e2297e3c01a9.png)

This Project can help to generate json with data and keep the newline of the text;

```json
{ image_num: 1,
  items:
   [ { type: 'text', data: 'helloworld' },
     { type: 'text', data: 'text\n        text3\n        text4' },
     { type: 'text', data: '1234567890' },
     { type: 'text', data: '2333333' },
     { type: 'image',
       data: { src: 'https://avatars3.githubusercontent.com/u/4409743?v=3&s=460' } },
     { type: 'text', data: 'wwwww123231232323\n213123123' },
     [length]: 6 ] }
```


## How to Use


```javascript
let jsdom = require('jsdom');
let html = `
<div>
    <p>helloworld</p>
    <span>
        text
        <span>text3</span>
        <span>text4</span>
    </span>
    <p>123456<span>78</span>90<br/><span>2333333</span></p>
</div>
<img src="https://avatars3.githubusercontent.com/u/4409743?v=3&s=460"/>
wwwww
<span>12323</span>
1232323
213123123
<br />
`

let document = jsdom(html, {
    features: {
        FetchExternalResources: false,
        ProcessExternalResources: false
    }
});
let DOMParser = require('html-to-json');
let parser = new DOMParser(document.body);
let json = parser.toJSON();

console.log(json);
```