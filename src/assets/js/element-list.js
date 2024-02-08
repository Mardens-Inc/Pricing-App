export default class List extends HTMLElement {

    /**
     * Initializes a new instance of the Constructor class.
     *
     * @param {string} icon - The icon of the constructor.
     * @param {string} name - The name of the constructor.
     * @param {boolean} [modifiable=true] - Indicates whether the constructor is modifiable. Default is true.
     * @param {Array} [more=[{name: "", action: ()=>{}}]] - Additional information about the constructor. Default is an empty array.
     * @param {string} [more[].name] - The name of the additional information.
     * @param {function} [more[].action] - The action of the additional information.
     */
    constructor(icon, name, modifiable = true, more = []) {
        super();
        this.icon = icon;
        this.name = name;
        this.modifiable = modifiable;
        this.more = more;
    }

    connectedCallback() {
        this.name = this.getAttribute('name') || this.name;
        this.icon = this.getAttribute('icon') || this.icon;
        this.modifiable = this.getAttribute('modifiable') || this.modifiable;
        if(this.getAttribute('more') !== null) {
            this.more = JSON.parse(this.getAttribute('more'));
        }

        this.render();
    }

    render() {
        this.innerHTML = `
            <img src="${this.icon}" alt="">
            <span class="title">${this.name}</span>
            ${this.modifiable ? this.renderModifiable() : ''}
            ${this.more.length ? this.renderMore() : ''}
        `;
    }

    renderMore() {
        let actions = this.more.map(i => `action-${i.name.replace(/\s/g, '-')}="${i.action}"`).join(' ');
        return `<button class="more-options" title="More Options" dropdown="${this.more.map(i => i.name).join(';')}" ${actions}><img src="assets/images/icons/more.svg" alt=""></button>`;
    }

    renderModifiable() {
        return `<button class="edit-list-button" title="Edit product"><img src="assets/images/icons/edit.svg" alt=""></button>`;
    }

}

customElements.define('list-item', List);