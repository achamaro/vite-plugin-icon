import { getIcon } from "./icons";

export { addIconifyIcon } from "./icons";

export class Icon extends HTMLElement {
  public svg: SVGSVGElement;
  private $style: HTMLStyleElement;

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    this.$style = document.createElement("style");
    this.$style.textContent = this.styleContent();
    shadow.appendChild(this.$style);

    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("viewBox", `0 0 16 16`);
    this.svg.setAttribute("width", "100%");
    this.svg.setAttribute("height", "100%");
    this.svg.setAttribute("role", "img");
    shadow.appendChild(this.svg);

    this.renderIcon();
  }

  private styleContent(width: number = 1, height: number = 1) {
    return `:host{display:inline-block;vertical-align:middle;width:${
      width / height
    }em;height:1em;}`;
  }

  // name属性が変更されたらアイコンを再描画する
  static get observedAttributes() {
    return ["name"];
  }
  attributeChangedCallback() {
    this.renderIcon();
  }

  async renderIcon() {
    const name = this.getAttribute("name");
    if (!name) {
      return;
    }

    const icon = await getIcon(name);
    if (name !== this.getAttribute("name")) {
      return;
    }

    const { left = 0, top = 0, width = 16, height = 16, body } = icon;
    this.$style.textContent = this.styleContent(width, height);
    this.svg.setAttribute("viewBox", `${left} ${top} ${width} ${height}`);
    this.svg.innerHTML = body;
  }
}

export function define(name = "i-") {
  customElements.get(name) ?? customElements.define(name, Icon);
}
