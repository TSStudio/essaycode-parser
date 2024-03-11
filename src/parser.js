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
const defaultDivStyle = new divStyle();

class abstractSpan {
    parent;
}
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
class abstractParagraphBlock {
    parent;
}
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
    parent;
    divStyle;
    constructor(divStyle = defaultDivStyle, parent = null) {
        this.divStyle = divStyle;
    }
    pushParagraph(paragraph) {
        this.paragraphs.push(paragraph);
    }
    generateHTML() {
        let html = "";
        for (let i = 0; i < this.paragraphs.length; i++) {
            html += this.paragraphs[i].generateHTML();
        }
        return (
            '<div style="' +
            this.divStyle.generateCSSString() +
            '">' +
            html +
            "</div>"
        );
    }
    generateDOMElem() {
        let elem = document.createElement("div");
        for (let i = 0; i < this.paragraphs.length; i++) {
            elem.appendChild(this.paragraphs[i].generateDOMElem());
        }
        elem.style = this.divStyle.generateCSSString();
        return elem;
    }
}

const codeRegExp = /^\\CODE(\([a-zA-Z-]*\))?$/g;
const codeWithLanguageRegExp = /^\\CODE\([a-zA-Z-]+\)$/g;
const allSequenceRegExp = /(\\[a-zA-Z-\\]+(\([\s\S]*?\))?)|(\${1,2})|(`)/g;
export class essayCodeParser {
    root = null;
    currentFontStyle = new fontStyle();
    currentParagraph = null;
    currentSpan = null;
    currentDiv = null;
    essayCode = "";
    pushToDiv(paragraph_like) {
        if (this.currentDiv == null) {
            this.currentDiv = new div();
            this.root.pushParagraph(this.currentDiv);
        }
        this.currentDiv.pushParagraph(paragraph_like);
    }
    pushToParagraph(span_like) {
        if (this.currentParagraph == null) {
            this.currentParagraph = new paragraph("justify");
            this.pushToDiv(this.currentParagraph);
        }
        this.currentParagraph.pushSpan(span_like);
    }
    processCurrentSpan(spanBegin, spanEnd) {
        if (spanBegin == spanEnd - 1) return;
        if (/^\s*$/.test(this.essayCode[spanBegin])) return;
        let spanContent = this.essayCode.substring(spanBegin, spanEnd);
        let span = new span(spanContent, this.currentFontStyle.copy());
        this.pushToParagraph(span);
    }

    parse(essayCode) {
        this.essayCode = essayCode;
        this.root = new div();
        controlSequences = [];
        let spanBegin = 0;
        let isInCode = false;
        let isInInlineCode = false;
        let isInFormula = false;
        while ((result = allSequenceRegExp.exec(essayCode))) {
            if (isInCode) {
                if (result[0] == "\\CODE") {
                    isInCode = false;
                    let code = essayCode.substring(spanBegin, result.index);
                    this.currentParagraph.content = code;
                    this.currentParagraph = null;
                }
                spanBegin = result.index + result[0].length;
                continue;
            }
            if (isInInlineCode) {
                if (result[0] == "`") {
                    isInInlineCode = false;
                    let code = essayCode.substring(spanBegin, result.index);
                    this.currentSpan.content = code;
                    this.currentSpan = null;
                }
                spanBegin = result.index + result[0].length;
                continue;
            }
            if (codeRegExp.test(result[0])) {
                this.processCurrentSpan(spanBegin, result.index);
                isInCode = true;
                let codeStyle = defaultCodeStyle;
                let language = "";
                if (codeWithLanguageRegExp.test(result[0])) {
                    language = result[0].substring(6, result[0].length - 1);
                }
                spanBegin = result.index + result[0].length;
                this.currentParagraph = new blockCode(
                    "code",
                    codeStyle.language,
                    ""
                );
                this.pushToDiv(this.currentParagraph);
                continue;
            }
            if (result[0] == "`") {
                this.processCurrentSpan(spanBegin, result.index);
                isInInlineCode = true;
                spanBegin = result.index + result[0].length;
                this.currentSpan = new inlineCode("");
                this.pushToParagraph(this.currentSpan);
                continue;
            }
            if (result[0] == "$" || result[0] == "$$") {
                if (isInFormula) {
                    isInFormula = false;
                    let formula = essayCode.substring(
                        spanBegin,
                        result.index + result[0].length
                    );
                    this.currentSpan.content = formula;
                    this.currentSpan = null;
                    spanBegin = result.index + result[0].length;
                    continue;
                }
                this.processCurrentSpan(spanBegin, result.index);
                this.currentSpan = new formula("");
                this.pushToParagraph(this.currentSpan);
                spanBegin = result.index;
                continue;
            }
        }
    }
}
