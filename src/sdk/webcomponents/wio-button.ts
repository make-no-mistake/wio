import { openModal } from "../helpers/modal";

export class WioButton extends HTMLElement {
  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const modal = this.getAttribute("modal");

    this.shadow.innerHTML = `
      <style>
        button {
          padding: 10px 16px;
          background: #f5f5f5;
          color: black;
          border-radius: 6px;
          border: 1px solid #ccc;
          font: inherit;
          cursor: pointer;
        }

        button:hover {
          background: #eaeaea;
        }
      </style>

      <button part="button">
        <slot></slot>
      </button>
    `;

    const button = this.shadow.querySelector("button");
    if (!button) return;

    button.addEventListener("click", () => {
      if (modal) openModal(modal);
    });
  }
}

if (!customElements.get("wio-button")) {
  customElements.define("wio-button", WioButton);
}
