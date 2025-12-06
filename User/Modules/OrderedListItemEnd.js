class EndOfOrderedList{
    constructor({item}){
        this.item = item;
    }
    get(){
        return[this.item];
    }
}

export default{
    Dependencies:[
        {name:"item",interface:false},
    ],
    Interface:{name:"IOrderedListItemV0",functions:[{name:"get"}]},
    module:EndOfOrderedList,
    name:"EndOfOrderedList"
}