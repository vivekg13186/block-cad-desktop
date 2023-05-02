class ScopeItem{
    parent: ScopeItem;
    items: any[];
    ctx:{};
    constructor(parent:ScopeItem|null){
        this.parent = parent;
        this.items =[];
    }
    push(item){
        this.items.push(item);
    }
    setVar(name,val){
        this.ctx[name]=val;
    }
}
export class Scope{
    scopeItem: ScopeItem;

    constructor(){
        this.scopeItem=new ScopeItem(null);
    }
    newScope(){
        this.scopeItem=new ScopeItem(this.scopeItem);
    }
    popScope(){
        this.scopeItem=this.scopeItem.parent;
    }
    push(item:any){
        this.scopeItem.items.push(item);
    }
    reset(){
        this.scopeItem=new ScopeItem(null);
    }
}

export const scope= new Scope();