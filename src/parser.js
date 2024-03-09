const essayCodeParserVersion = "2.0.0";
const essayCodeVersion = "1.1";
const lastfontstyle = "";

export class fontStyle {
    fontSize;
    fontWeight;
    color;
    textAlignment;
    textDecoration;
    fontFamily;
    constructor(
        fontSize = "15px",
        fontWeight = "normal",
        color = "#000000",
        textAlignment = "justify",
        textDecoration = "none",
        fontFamily = "-apple-system,BlinkMacSystemFont,Helvetica Neue,PingFang SC,Microsoft YaHei,Source Han Sans SC,Noto Sans CJK SC,WenQuanYi Micro Hei,sans-serif"
    ) {
        this.fontSize = fontSize;
        this.fontWeight = fontWeight;
        this.color = color;
        this.textAlignment = textAlignment;
        this.textDecoration = textDecoration;
        this.fontFamily = fontFamily;
    }
    upgradeFromArray(arr) {
        if (arr.length < 1) return;
        this.fontSize = arr[0];
        if (arr.length < 2) return;
        this.fontWeight = arr[1];
        if (arr.length < 3) return;
        this.color = arr[2];
        if (arr.length < 4) return;
        this.textAlignment = arr[3];
        if (arr.length < 5) return;
        this.textDecoration = arr[4];
        if (arr.length < 6) return;
        this.fontFamily = arr[5];
    }
    generateCSSString(with_alignment = false) {
        let lastfontstyle =
            "font-size:" +
            this.fontSize +
            ";font-weight:" +
            this.fontWeight +
            ";color:" +
            this.color +
            ";text-decoration:" +
            this.textDecoration +
            ";font-family:" +
            this.fontFamily +
            ";";
        if (with_alignment) {
            lastfontstyle += "text-align:" + this.textAlignment + ";";
        }
        return lastfontstyle;
    }
    copy() {
        return new fontStyle(
            this.fontSize,
            this.fontWeight,
            this.color,
            this.textAlignment,
            this.textDecoration,
            this.fontFamily
        );
    }
}
export class divStyle {
    width;
    alignment;
    backgroundColor;
    constructor(
        width = "100%",
        alignment = "center",
        backgroundColor = "transparent"
    ) {
        this.width = width;
        this.alignment = alignment;
        this.backgroundColor = backgroundColor;
    }
    upgradeFromArray(arr) {
        if (arr.length < 1) return;
        this.width = arr[0];
        if (arr.length < 2) return;
        this.alignment = arr[1];
        if (arr.length < 3) return;
        this.backgroundColor = arr[2];
    }
    generateCSSString() {
        if (this.alignment == "center") {
            return (
                "width:" +
                this.width +
                ";margin-left:auto;margin-right:auto;background-color:" +
                this.backgroundColor +
                ";"
            );
        } else {
            return (
                "width:" +
                this.width +
                ";mbackground-color:" +
                this.backgroundColor +
                ";"
            );
        }
    }
    copy() {
        return new divStyle(this.backgroundColor, this.padding, this.margin);
    }
}

const defaultCodeStyle = {
    display: "inline-block",
    backgroundColor: "#eeeeee",
    color: "#020202",
    border: "1px solid black",
    fontFamily: "Consolas,Courier New",
    textIndent: "0",
    generateCSSString() {
        return (
            "display:" +
            this.display +
            ";background-color:" +
            this.backgroundColor +
            ";color:" +
            this.color +
            ";border:" +
            this.border +
            ";font-family:" +
            this.fontFamily +
            ";text-indent:" +
            this.textIndent +
            ";"
        );
    },
};

class abstractSpan {}
class span extends abstractSpan {
    content;
    fontstyle;
    constructor(content, fontstyle) {
        this.content = content;
        this.fontstyle = fontstyle;
    }
    generateHTML() {
        return (
            "<span style='" +
            this.fontstyle.generateCSSString() +
            "'>" +
            this.content +
            "</span>"
        );
    }
    generateDOMElem() {
        let elem = document.createElement("span");
        elem.style = this.fontstyle.generateCSSString();
        elem.innerHTML = this.content;
        return elem;
    }
}
class inlineCode extends abstractSpan {
    content;
    codeStyle;
    constructor(content, codeStyle = defaultCodeStyle) {
        this.content = content;
        this.codeStyle = codeStyle;
    }
    generateHTML() {
        return (
            "<span style='" +
            this.codeStyle.generateCSSString() +
            "'>" +
            this.content +
            "</span>"
        );
    }
    generateDOMElem() {
        let elem = document.createElement("span");
        elem.style = this.codeStyle.generateCSSString();
        elem.innerHTML = this.content;
        return elem;
    }
}
class formula extends abstractSpan {
    content;
    constructor(content) {
        this.content = content;
    }
    generateHTML() {
        return (
            "<span style='" +
            this.fontstyle.generateCSSString() +
            "'>" +
            this.content +
            "</span>"
        );
    }
    generateDOMElem() {
        let elem = document.createElement("span");
        elem.style = this.fontstyle.generateCSSString();
        elem.innerHTML = this.content;
        return elem;
    }
}
class image extends abstractSpan {
    src;
    relativeSize;
    alt;
    constructor(src, relativeSize, alt) {
        this.src = src;
        this.relativeSize = relativeSize;
        this.alt = alt;
    }
    generateHTML() {
        return (
            "<img src='" +
            this.src +
            "' alt='" +
            this.alt +
            "style='width:" +
            this.relativeSize +
            ";'>"
        );
    }
    generateDOMElem() {
        let elem = document.createElement("img");
        elem.src = this.src;
        elem.alt = this.alt;
        elem.style = "width:" + this.relativeSize + ";";
        return elem;
    }
}
class abstractParagraphBlock {}
class paragraph extends abstractParagraphBlock {
    textAlignment;
    spans = [];
    constructor(textAlignment) {
        this.textAlignment = textAlignment;
    }
    pushSpan(span) {
        this.spans.push(span);
    }
    generateHTML() {
        let html = "";
        for (let i = 0; i < this.spans.length; i++) {
            html += this.spans[i].generateHTML();
        }
        return "<p>" + html + "</p>";
    }
    generateDOMElem() {
        let elem = document.createElement("p");
        for (let i = 0; i < this.spans.length; i++) {
            elem.appendChild(this.spans[i].generateDOMElem());
        }
        elem.style = "text-align:" + this.textAlignment + ";";
        return elem;
    }
}
class blockCode extends abstractParagraphBlock {
    type = ""; //inline or block
    language = "";
    content = "";
    constructor(type, language, content) {
        this.type = type;
        this.language = language;
        this.content = content;
    }
    generateHTML() {
        return (
            '<pre style="width:100%;overflow-x:auto;"><code class="language-' +
            this.language +
            ">" +
            this.content +
            "</code></pre>"
        );
    }
    generateDOMElem() {
        let elem = document.createElement("pre");
        elem.style = "width:100%;overflow-x:auto;";
        let elem2 = document.createElement("code");
        elem2.classList.add("language-" + this.language);
        elem2.innerHTML = this.content;
        elem.appendChild(elem2);
        return elem;
    }
}
class title extends abstractParagraphBlock {
    content = "";
    constructor(content) {
        this.content = content;
    }
    generateHTML() {
        return "<center><h1>" + this.content + "</h1></center>";
    }
    generateDOMElem() {
        let elem = document.createElement("center");
        let elem2 = document.createElement("h1");
        elem2.innerHTML = this.content;
        elem.appendChild(elem2);
        return elem;
    }
}
class smallTitle extends abstractParagraphBlock {
    content = "";
    constructor(content) {
        this.content = content;
    }
    generateHTML() {
        return "<center><h3>" + this.content + "</h3></center>";
    }
    generateDOMElem() {
        let elem = document.createElement("center");
        let elem2 = document.createElement("h1");
        elem2.innerHTML = this.content;
        elem.appendChild(elem2);
        return elem;
    }
}

class div {
    paragraphs = [];
    constructor(textAlignment) {
        this.textAlignment = textAlignment;
    }
}

export class essayCodeParser {
    parse(essayCode) {}
}
