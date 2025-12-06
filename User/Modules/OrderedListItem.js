class OrderedListItem{
    constructor({previousInList,item}){
        this.item = item;
        this.previousInList = previousInList;
    }
    get(){
        if(this.previousInList){
            return [this.item,...this.previousInList.get()];
        }
        return [this.item];
    }
}



export default{
    Dependencies:[
        {name:"previousInList",interface:"IOrderedListItemV0",functions:[{name:"get"}]},
        {name:"item",interface:false},
    ],
    Interface:{name:"IOrderedListItemV0",functions:[{name:"get"}]},
    module:OrderedListItem,
    name:"OrderedListItem"
}