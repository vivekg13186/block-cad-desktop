import * as _ from "lodash";
export class Command{
    id: any;
    args: any;
    children: any;
    blk_def: any;

     
    constructor(id,args,children,block_def){
    
        this.id = id;
        this.args = args;
        this.children=children;
        this.blk_def = block_def;
    }
    reset(){
        this.children=[];
        this.args=[];
    }

    toJSON(){       
        return {
            id : this.id,
            args:this.args,
            children:_.map(this.children,c=>{c.toJSON()})
        }
    }
}


class ScopeItem{
    parent: ScopeItem;
    items: Command[];
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
    toJSON(){
       return _.map(this.items,c=>{c.toJSON()})
    }
}
export class Scope{
    scopeItem: ScopeItem;
    context:{};

    constructor(){
        this.scopeItem=new ScopeItem(null);
        this.context={};
    }
    newScope(){
        this.scopeItem=new ScopeItem(this.scopeItem);
    }
    popScope(){
        this.scopeItem=this.scopeItem.parent;
    }
    push(item:Command){
        this.scopeItem.items.push(item);
    }
    reset(){
        this.scopeItem=new ScopeItem(null);
    }
    setVar(name,value){
        this.context[name]=value;
    }
}

export const scope= new Scope();