import {
    fontStyle,
    divStyle,
    defaultCodeStyle,
    br,
    span,
    inlineCode,
    formula,
    image,
    paragraph,
    blockCode,
    title,
    smallTitle,
    div,
} from "./class_defines";

const essayCodeParserVersion = "2.0.2";
const essayCodeVersion = "1.1";

const codeRegExp = /^\\CODE(\([a-zA-Z-]*\))?$/;
const codeWithLanguageRegExp = /^\\CODE\([a-zA-Z-]+\)$/;
const allSequenceRegExp = /(\\[a-zA-Z-\\]+(\([\s\S]*?\))?)|(\${1,2})|(`)/g;
const setFontRegExp = /\\setfont\(([\s\S]*)\)/;
const imageRegExp = /\\image\(([\s\S]*)\)/;
const titleRegExp = /\\title\(([\s\S]*)\)/;
const smallTitleRegExp = /\\smalltitle\(([\s\S]*)\)/;
const parRegExp = /\\par/;
const lfRegExp = /\\\\/;
const divRegExp = /\\beginbox\(([\s\S]*)\)/;
const divEndRegExp = /\\endbox\(\)/;
export default class essayCodeParser {
    root = null;
    currentFontStyle = new fontStyle();
    defaultFontStyle = new fontStyle();
    currentParagraph = null;
    currentSpan = null;
    currentDiv = null;
    essayCode = "";
    pushToDiv(paragraph_like) {
        if (this.currentDiv == null) {
            this.currentDiv = this.root;
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
        console.log(
            "processing span from " +
                spanBegin +
                " to " +
                spanEnd +
                " is " +
                this.essayCode.substring(spanBegin, spanEnd)
        );
        if (spanBegin == spanEnd) return;
        if (/^\s*$/.test(this.essayCode.substring(spanBegin, spanEnd))) return;
        let spanContent = this.essayCode.substring(spanBegin, spanEnd);
        let spanCl = new span(spanContent, this.currentFontStyle.copy());
        this.pushToParagraph(spanCl);
        this.currentSpan = null;
    }

    parse(essayCode) {
        this.currentFontStyle = this.defaultFontStyle.copy();
        this.essayCode = essayCode;
        this.root = new div();
        let spanBegin = 0;
        let isInCode = false;
        let isInInlineCode = false;
        let isInFormula = false;
        let result = {};
        while ((result = allSequenceRegExp.exec(essayCode))) {
            if (isInCode) {
                if (result[0] == "\\CODE") {
                    isInCode = false;
                    let code = essayCode.substring(spanBegin, result.index);
                    this.currentParagraph.content = code;
                    this.currentParagraph = null;
                    spanBegin = result.index + result[0].length;
                }
                continue;
            }
            if (isInInlineCode) {
                if (result[0] == "`") {
                    isInInlineCode = false;
                    let code = essayCode.substring(spanBegin, result.index);
                    this.currentSpan.content = code;
                    this.currentSpan = null;
                    spanBegin = result.index + result[0].length;
                }
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
                this.currentParagraph = new blockCode("code", language, "");
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
            if (isInFormula) {
                if (result[0] == "$" || result[0] == "$$") {
                    isInFormula = false;
                    let formula = essayCode.substring(
                        spanBegin,
                        result.index + result[0].length
                    );
                    this.currentSpan.content = formula;
                    this.currentSpan = null;
                    spanBegin = result.index + result[0].length;
                }
                continue;
            }
            if (result[0] == "$" || result[0] == "$$") {
                this.processCurrentSpan(spanBegin, result.index);
                this.currentSpan = new formula(
                    "",
                    this.defaultFontStyle.copy()
                );
                this.pushToParagraph(this.currentSpan);
                spanBegin = result.index;
                isInFormula = true;
                continue;
            }
            if (setFontRegExp.test(result[0])) {
                this.processCurrentSpan(spanBegin, result.index);
                let arg = result[0].substring(9, result[0].length - 1);
                let nfontStyle = this.defaultFontStyle.copy();
                nfontStyle.upgradeFromString(arg);
                if (
                    this.currentFontStyle.textAlignment !=
                    nfontStyle.textAlignment
                ) {
                    this.pushToParagraph(this.currentSpan);
                    this.currentParagraph = null;
                }
                this.currentFontStyle = nfontStyle;
                spanBegin = result.index + result[0].length;
                continue;
            }
            if (imageRegExp.test(result[0])) {
                this.processCurrentSpan(spanBegin, result.index);
                let arg = result[0].substring(7, result[0].length - 1);
                let img = new image();
                img.upgradeFromString(arg);
                this.pushToParagraph(img);
                spanBegin = result.index + result[0].length;
                continue;
            }
            if (titleRegExp.test(result[0])) {
                this.processCurrentSpan(spanBegin, result.index);
                this.currentParagraph = null;
                let arg = result[0].substring(7, result[0].length - 1);
                let titleObj = new title(arg);
                this.pushToDiv(titleObj);
                spanBegin = result.index + result[0].length;
                continue;
            }
            if (smallTitleRegExp.test(result[0])) {
                this.processCurrentSpan(spanBegin, result.index);
                this.currentParagraph = null;
                let arg = result[0].substring(12, result[0].length - 1);
                let titleObj = new smallTitle(arg);
                this.pushToDiv(titleObj);
                spanBegin = result.index + result[0].length;
                continue;
            }
            if (parRegExp.test(result[0])) {
                this.processCurrentSpan(spanBegin, result.index);
                this.currentParagraph = null;
                spanBegin = result.index + result[0].length;
                continue;
            }
            if (lfRegExp.test(result[0])) {
                this.processCurrentSpan(spanBegin, result.index);
                let obj = new br();
                this.pushToParagraph(obj);
                spanBegin = result.index + 2;
                continue;
            }
            if (divRegExp.test(result[0])) {
                this.processCurrentSpan(spanBegin, result.index);
                this.currentParagraph = null;
                let arg = result[0].substring(10, result[0].length - 1);
                let divObj = new div(this.currentDiv);
                let style = new divStyle();
                style.upgradeFromString(arg);
                divObj.style = style;
                this.pushToDiv(divObj);
                this.currentDiv = divObj;
                spanBegin = result.index + result[0].length;
                continue;
            }
            if (divEndRegExp.test(result[0])) {
                this.processCurrentSpan(spanBegin, result.index);
                this.currentParagraph = null;
                if (this.currentDiv.parent != null)
                    this.currentDiv = this.currentDiv.parent;
                spanBegin = result.index + result[0].length;
                continue;
            }
            console.warn("Invalid control sequence");
        }
        this.processCurrentSpan(spanBegin, essayCode.length);
    }
}
