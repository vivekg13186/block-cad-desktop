import "./toolbar.css"
export class Toolbar{
    root:HTMLElement;
    callback:Function;
    constructor(e:HTMLElement,callback){
        this.root =e;
        e.classList.add("toolbar");
        this.callback = callback;
    }
    addIcon(command:string,icon:string,help:string){
        var element = document.createElement("div");
        element.id =`tool-item-${command}`;
        element.classList.add("toolbar-icon");
        element.title=help;
        element.innerHTML=icon;
        var self = this;
        element.addEventListener("click",function(e){
            self.click(command);
        });
        this.root.appendChild(element);
    }
    click(command:string){
         this.callback(command);
    }

}