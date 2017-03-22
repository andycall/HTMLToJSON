let fs = require('fs');
let path = require('path');
let htmlFiles = fs.readdirSync(path.join(__dirname, './data'));
let DOMParser = require('../output/index');
let jsdom = require('jsdom').jsdom;
let assert = require('assert');

htmlFiles = htmlFiles.map(name => {
    let filePath = path.join(__dirname, './data', name);
    let data = fs.readFileSync(filePath);
    console.log(name);
    return data;
})

describe("TextElement Test", () => {
    htmlFiles.forEach((data, index) => {
        if (index != 3) {
            return;
        }

        it(`${index + 1}.html test`, () => {
            let document = jsdom(data, {
                features: {
                    FetchExternalResources: false,
                    ProcessExternalResources: false
                }
            });

            let parser = new DOMParser(document.body);
            let json = parser.toJSON();

            // TODO more test
            console.log(require('util').inspect(json, true, 100));
            // assert.equal(json.items.length, 128);
        });
    })
});