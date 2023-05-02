import "./status.css"


 class StatusBar{
    rootElement:HTMLElement;
    iconElement:HTMLElement;
    progressElement:HTMLProgressElement;
    messageElement:HTMLElement;

    constructor(element:HTMLElement) {
        this.rootElement = element;
        this.rootElement.classList.add("status-bar");
        this.iconElement = document.createElement("div");
        this.progressElement = document.createElement("progress");
        this.messageElement = document.createElement("div");
        this.iconElement.classList.add("icon");
        this.progressElement.classList.add("progress");
        this.messageElement.classList.add("message");
        this.rootElement.appendChild(this.iconElement);
        this.rootElement.appendChild(this.messageElement);
        this.rootElement.appendChild(this.progressElement);
    
        
        this.progressElement.setAttribute("max", "100");
        this.setStatus("Welcome to Block CAD", "info", 0);
    
  
    
    }
    
     _getIcon(tag:string) {
        switch (tag) {
            case "info":
                return `<span class="material-symbols-outlined" style="color:green">
                info
                </span>`;
            case "warn":
                return `<span class="material-symbols-outlined" style="color:yellow">
                warning
                </span>`;
            case "error":
                return `<span class="material-symbols-outlined" style="color:red">
                bug_report
                </span>`
            default:
                return "<i></i>"
        }
    }
    
      setStatus( message:string, tag:string, progress:number) {
        this.messageElement.innerText = message;
        this.progressElement.value = progress;
        this.iconElement.innerHTML = this._getIcon(tag);
    }
    logError(message:string){
        this.messageElement.innerText = message;
        this.progressElement.value = 0;
        this.iconElement.innerHTML = this._getIcon("error");
    }
    logWarn(message:string){
        this.messageElement.innerText = message;
        this.progressElement.value = 0;
        this.iconElement.innerHTML = this._getIcon("warn");
    }
    logInfo(message:string){
        this.messageElement.innerText = message;
        this.progressElement.value = 0;
        this.iconElement.innerHTML = this._getIcon("info");
    }
}


export const statusBar = new StatusBar(document.getElementById("status-bar"));