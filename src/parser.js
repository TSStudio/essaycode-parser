const essayCodeParserVersion = "2.0.0";
const essayCodeVersion = "1.1";
const lastfontstyle = "";

export class fontStyle{
    fontSize;
    fontWeight;
    color;
    textAlignment;
    textDecoration;
    fontFamily;
    constructor(fontSize = "15px", fontWeight = "normal", color = "#000000", textAlignment = "justify", textDecoration = "none", fontFamily = "-apple-system,BlinkMacSystemFont,Helvetica Neue,PingFang SC,Microsoft YaHei,Source Han Sans SC,Noto Sans CJK SC,WenQuanYi Micro Hei,sans-serif"){
        this.fontSize = fontSize;
        this.fontWeight = fontWeight;
        this.color = color;
        this.textAlignment = textAlignment;
        this.textDecoration = textDecoration;
        this.fontFamily = fontFamily;
    }
    upgradeFromArray(arr){
        if(arr.length<1) return;
        this.fontSize = arr[0];
        if(arr.length<2) return;
        this.fontWeight = arr[1];
        if(arr.length<3) return;
        this.color = arr[2];
        if(arr.length<4) return;
        this.textAlignment = arr[3];
        if(arr.length<5) return;
        this.textDecoration = arr[4];
        if(arr.length<6) return;
        this.fontFamily = arr[5];
    }
    generateCSSString(with_alignment = false){
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
        if(with_alignment){
            lastfontstyle += "text-align:" + this.textAlignment + ";";
        }
        return lastfontstyle;
    }
    copy(){
        return new fontStyle(this.fontSize, this.fontWeight, this.color, this.textAlignment, this.textDecoration, this.fontFamily);
    }
}

export class essayCodeParser {
   
}
