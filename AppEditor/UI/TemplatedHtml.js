export default class TemplatedHtml{
    constructor(templateClassName){
        if(!templateClassName){
            return;
        }
        var templateElement = document.querySelector("#templates ."+templateClassName);
        this.element = templateElement.cloneNode(true);
    }
    static FromHTMLString(hs){
        var element = document.createElement("div");
        element.outerHTML = hs;
        var th = new TemplatedHtml();
        th.element = element;
        return th;
    }
    getElement(elClassName){
        return this.element.querySelector("."+elClassName);
    }
    setText(elClassName,content){
        this.element.querySelector("."+elClassName).textContent = content;
    }
    setSelectListOptions(elClassName,values,selected){
        var selectList = this.element.querySelector("."+elClassName);
        selectList.innerHTML = "";
        values.map(v=>{
            var optionElement = document.createElement("option");
            if(v.hasOwnProperty("text")){
                optionElement.textContent = v.text;
                optionElement.value = v.value;
            }else{
                optionElement.textContent = v;
                optionElement.value = v;
            }
            if(optionElement.value == selected){
                optionElement.selected="true";
            }
        });
    }
    setValue(elClassName,value){
        this.element.querySelector("."+elClassName).value = value;
    }
    destroy(){
        this.element.remove();
    }
}