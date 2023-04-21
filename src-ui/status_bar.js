import "./status.css"
export function init(element) {
    if (!element) return;
    var rootElement = element;
    rootElement.classList.add("status-bar");
    var iconElement = document.createElement("div");
    var progressElement = document.createElement("progress");
    var messageElement = document.createElement("div");
    iconElement.classList.add("icon");
    progressElement.classList.add("progress");
    messageElement.classList.add("message");
    rootElement.appendChild(iconElement);
    rootElement.appendChild(messageElement);
    rootElement.appendChild(progressElement);

    var sb = { rootElement, iconElement, progressElement, messageElement };
    progressElement.setAttribute("max", "100");
    setStatus(sb,"Welcome to Block CAD", "info", 0);

    return sb;

}

function _getIcon(tag) {
    switch (tag) {
        case "info":
            return `<span class="material-symbols-outlined">
            info
            </span>`;
        case "warn":
            return `<span class="material-symbols-outlined">
            error
            </span>`;
        case "error":
            return `<span class="material-symbols-outlined">
            bug_report
            </span>`
        default:
            return "<i></i>"
    }
}

export function setStatus(sb, message, tag, progress) {
    sb.messageElement.innerText = message;
    sb.progressElement.value = progress;
    sb.iconElement.innerHTML = _getIcon(tag);
}