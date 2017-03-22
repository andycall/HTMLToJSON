class DOMStructor {
    constructor(root) {
        this.textElement = [];
        this.pathMap = new Map();
        this.imageCount = 0;
        this.imageIndex = [];
        this.imageKeyIndex = [];
        this.blockRegex = /^(address|figure|article|footer|blockquote|aside|output|body|header|hgroup|main|center|nav|section|dir|div|dl|fieldset|form|img|h[1-6]|hr|br|isindex|menu|noframes|noscript|ol|p|pre|table|ul|dd|dt|frameset|li|tbody|td|tfoot|th|thead|tr|html)$/i;
        this.textElement = [];
        this.pathMap = new Map();
        this.imageCount = 0;
        this.imageIndex = [];
        this.imageKeyIndex = [];
        this._simpleDOMStructor(root);
    }
    getElementNodeType(node) {
        if (node.nodeType !== 1) {
            return '';
        }
        return this.blockRegex.test(node.nodeName) ? 'block' : 'inline';
    }
    getAllChildrenDeep(node) {
        let children = [];
        let self = this;
        function finder(root) {
            let childNodes = [].slice.call(root.childNodes);
            childNodes.forEach((node) => {
                let nodeName = node.nodeName;
                if (nodeName === 'IMG') {
                    self.imageCount++;
                    self.imageIndex.push([self.textElement.length, children.length]);
                    self.imageKeyIndex.push(self.textElement.length);
                    children.push(node);
                }
                else if (nodeName === 'BR') {
                    children.push('__SEGMENT__');
                }
                else if (node.nodeType === 3) {
                    children.push(node);
                }
                else if (node.childNodes.length > 0) {
                    let childNodes = root.childNodes;
                    childNodes.forEach(finder);
                }
            });
        }
        finder(node);
        return children;
    }
    static createNodeUniquePath(node) {
        let uniquePath = '';
        if (node.nodeType === 3) {
            uniquePath = node.textContent.trim();
        }
        else {
            uniquePath = node.nodeName + '_' + node.textContent.trim();
        }
        let parent = node.parentNode;
        while (parent !== null) {
            let nodeName = parent.nodeName;
            uniquePath = nodeName + '_' + uniquePath;
            parent = parent.parentNode;
        }
        return uniquePath;
    }
    _simpleDOMStructor(rootDOM) {
        let childNodes = [].slice.call(rootDOM.childNodes);
        childNodes.forEach((node, index) => {
            let nodeType = node.nodeType;
            let elementNodeType = this.getElementNodeType(node);
            // 元素节点
            if (nodeType === 1 && elementNodeType !== 'inline') {
                let nodeName = node.nodeName;
                if (nodeName === 'IMG') {
                    this.imageCount++;
                    this.imageIndex.push([this.textElement.length, 0]);
                    this.imageKeyIndex.push(this.textElement.length);
                    this.textElement.push([node]);
                }
                else if (elementNodeType === 'block' && node.childNodes.length > 0) {
                    this._simpleDOMStructor(node);
                }
            }
            else {
                let text = node.textContent.trim();
                if (node.nodeType === 1) {
                    let result = this.getAllChildrenDeep(node);
                    this.textElement.push(result);
                    return;
                }
                else if (text.length === 0) {
                    return;
                }
                let point = node;
                let textBlock = [];
                while (point && (point.nodeType === 3 || this.getElementNodeType(point) === 'inline')) {
                    let text = point.textContent.trim();
                    let nodePath = DOMStructor.createNodeUniquePath(point);
                    if (text.length > 0 && !this.pathMap.has(nodePath)) {
                        textBlock.push(point);
                        this.pathMap.set(nodePath, point);
                    }
                    point = point.nextSibling;
                }
                if (textBlock.length > 0) {
                    this.textElement.push(textBlock);
                }
            }
        });
    }
    toJSON() {
        let ret = {
            image_num: this.imageCount,
            items: []
        };
        let self = this;
        self.textElement.forEach(function (node, index) {
            let imageIndex = self.imageKeyIndex.indexOf(index);
            // 图片节点
            if (imageIndex >= 0) {
                let imageLocation = self.imageIndex[imageIndex];
                let imgElement = self.textElement[imageLocation[0]][imageLocation[1]];
                ret.items.push({
                    type: 'image',
                    data: {
                        src: imgElement.src
                    }
                });
            }
            else {
                let text = node.reduce((total, nextNode) => {
                    if (nextNode === '__SEGMENT__') {
                        return total + '__SEGMENT__';
                    }
                    console.log(nextNode, nextNode.textContent);
                    let nodeText = nextNode.textContent.trim();
                    return total + nodeText;
                }, '');
                let textNode = text.split('__SEGMENT__');
                textNode.forEach(text => {
                    ret.items.push({
                        type: 'text',
                        data: text
                    });
                });
            }
        });
        return ret;
    }
    slice(index, options = {
            image: false
        }) {
        let result = [];
        if (index < 0) {
            let i = this.textElement.length - 1;
            while (index < 0) {
                if (!options.image && this.imageKeyIndex.indexOf(i) >= 0) {
                    i--;
                    continue;
                }
                let node = this.textElement[i];
                result.push(node);
                i--;
                index++;
            }
        }
        else if (index > 0) {
            let i = 0;
            while (i < index) {
                if (!options.image && this.imageKeyIndex.indexOf(i) >= 0) {
                    i++;
                    continue;
                }
                let node = this.textElement[i];
                result.push(node);
                i++;
            }
        }
        return result;
    }
    getTextElement() {
        return this.textElement;
    }
}
module.exports = DOMStructor;
