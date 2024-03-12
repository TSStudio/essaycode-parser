import {
    fontStyle,
    divStyle,
    defaultCodeStyle,
    defaultDivStyle,
    abstractSpan,
    br,
    span,
    inlineCode,
    formula,
    image,
    abstractParagraphBlock,
    paragraph,
    blockCode,
    title,
    smallTitle,
    div,
} from "./class_defines";

const essayCodeParserVersion = "2.0.0";
const essayCodeVersion = "1.1";
const lastfontstyle = "";

const codeRegExp = /^\\CODE(\([a-zA-Z-]*\))?$/;
const codeWithLanguageRegExp = /^\\CODE\([a-zA-Z-]+\)$/;
const allSequenceRegExp = /(\\[a-zA-Z-\\]+(\([\s\S]*?\))?)|(\${1,2})|(`)/g;
const setFontRegExp = /\\setfont\(([\s\S]*)\)/;
const imageRegExp = /\\image\(([\s\S]*)\)/;
const titleRegExp = /\\title\(([\s\S]*)\)/;
const smallTitleRegExp = /\\smalltitle\(([\s\S]*)\)/;
const parRegExp = /\\par/;
const lfRegExp = /\\\\/;
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
        if (spanBegin == spanEnd - 1) return;
        if (/^\s*$/.test(this.essayCode.substring(spanBegin, spanEnd))) return;
        let spanContent = this.essayCode.substring(spanBegin, spanEnd);
        let spanCl = new span(spanContent, this.currentFontStyle.copy());
        this.pushToParagraph(spanCl);
        this.currentSpan = null;
    }

    parse(essayCode) {
        this.essayCode = essayCode;
        this.root = new div();
        let spanBegin = 0;
        let isInCode = false;
        let isInInlineCode = false;
        let isInFormula = false;
        let result = {};
        while ((result = allSequenceRegExp.exec(essayCode))) {
            console.log(result);
            console.log(
                "processing " +
                    result[0] +
                    " at " +
                    result.index +
                    ", current SpanBegin is " +
                    spanBegin,
                "isInCode is " + isInCode,
                "isInInlineCode is " + isInInlineCode,
                "isInFormula is " + isInFormula
            );
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
                console.log("code detected");
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
                console.log("inline code detected");
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
                console.log("formula detected");
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
                console.log("processing setfont at " + result.index);
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
                console.log("processing image at " + result.index);
                this.processCurrentSpan(spanBegin, result.index);
                let arg = result[0].substring(7, result[0].length - 1);
                let img = new image();
                img.upgradeFromString(arg);
                this.pushToParagraph(img);
                spanBegin = result.index + result[0].length;
                continue;
            }
            if (titleRegExp.test(result[0])) {
                console.log("processing title at " + result.index);
                this.processCurrentSpan(spanBegin, result.index);
                this.currentParagraph = null;
                let arg = result[0].substring(7, result[0].length - 1);
                let titleObj = new title(arg);
                this.pushToDiv(titleObj);
                spanBegin = result.index + result[0].length;
                continue;
            }
            if (smallTitleRegExp.test(result[0])) {
                console.log("processing smalltitle at " + result.index);
                this.processCurrentSpan(spanBegin, result.index);
                this.currentParagraph = null;
                let arg = result[0].substring(12, result[0].length - 1);
                let titleObj = new smallTitle(arg);
                this.pushToDiv(titleObj);
                spanBegin = result.index + result[0].length;
                continue;
            }
            if (parRegExp.test(result[0])) {
                console.log("processing par at " + result.index);
                this.processCurrentSpan(spanBegin, result.index);
                this.currentParagraph = null;
                spanBegin = result.index + result[0].length;
                continue;
            }
            if (lfRegExp.test(result[0])) {
                console.log("processing lf at " + result.index);
                this.processCurrentSpan(spanBegin, result.index);
                let obj = new br();
                this.pushToParagraph(obj);
                spanBegin = result.index + 2;
                continue;
            }
            console.log("invalid control sequence");
        }
        this.processCurrentSpan(spanBegin, essayCode.length);
    }
}
