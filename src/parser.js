import {
    fontStyle,
    divStyle,
    defaultCodeStyle,
    defaultDivStyle,
    abstractSpan,
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

const codeRegExp = /^\\CODE(\([a-zA-Z-]*\))?$/g;
const codeWithLanguageRegExp = /^\\CODE\([a-zA-Z-]+\)$/g;
const allSequenceRegExp = /(\\[a-zA-Z-\\]+(\([\s\S]*?\))?)|(\${1,2})|(`)/g;
const setFontRegExp = /\\setfont\(([\s\S]*)\)/g;
export class essayCodeParser {
    root = null;
    currentFontStyle = new fontStyle();
    currentParagraph = null;
    currentSpan = null;
    currentDiv = null;
    essayCode = "";
    pushToDiv(paragraph_like) {
        if (this.currentDiv == null) {
            this.currentDiv = this.root;
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
        let spanCl = new span(spanContent, this.currentFontStyle.copy());
        this.pushToParagraph(spanCl);
        this.currentSpan = null;
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
            if (setFontRegExp.test(result[0])) {
                this.processCurrentSpan(spanBegin, result.index);
                let arg = result[0].substring(9, result[0].length - 1);
                let nfontStyle = new fontStyle();
                nfontStyle.upgradeFromString(arg);
                if (
                    this.currentFontStyle.textAlignment !=
                    nfontStyle.textAlignment
                ) {
                    this.pushToParagraph(this.currentSpan);
                    this.currentParagraph = null;
                }
                this.currentFontStyle = nfontStyle;
                this.spanBegin = result.index + result[0].length;
                continue;
            }
        }
    }
}
