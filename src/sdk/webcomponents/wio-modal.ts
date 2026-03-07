export class WioModal extends HTMLElement {
  private shadow: ShadowRoot;
  private overlay!: HTMLDivElement;

  static get observedAttributes() {
    return ["open"];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.attachEvents();

    if (this.hasAttribute("open")) {
      this.open();
    }
  }

  attributeChangedCallback(name: string) {
    if (name === "open") {
      if (this.hasAttribute("open")) this.open();
      else this.close();
    }
  }

  private render() {
    this.shadow.innerHTML = `
      <style>
        :host {
          display: contents;
        }

        .overlay {
          position: fixed;
          inset: 0;
          display: none;
          align-items: center;
          justify-content: center;
          background-color: rgba(255,255,255,0.5);
          backdrop-filter: blur(1px);
          z-index: 1000;
        }

        .overlay.open {
          display: flex;
        }

        .modal {
          background: white;
          border-radius: 10px;
          padding: 20px;
          min-width: 320px;
          max-width: 90vw;
          max-height: 90vh;
          overflow: auto;
          box-shadow: 0 10px 40px rgba(0,0,0,0.25);
        }
      </style>

      <div class="overlay" part="overlay">
        <div class="modal" part="modal">
          <slot></slot>
        </div>
      </div>
    `;

    this.overlay = this.shadow.querySelector(".overlay") as HTMLDivElement;
  }

  private attachEvents() {
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen()) {
        this.close();
      }
    });
  }

  open() {
    this.overlay.classList.add("open");
    this.setAttribute("open", "");

    this.dispatchEvent(
      new CustomEvent("wio-modal-open", { bubbles: true, composed: true }),
    );
  }

  close() {
    this.overlay.classList.remove("open");
    this.removeAttribute("open");

    this.dispatchEvent(
      new CustomEvent("wio-modal-close", { bubbles: true, composed: true }),
    );
  }

  isOpen(): boolean {
    return this.overlay.classList.contains("open");
  }
}

if (!customElements.get("wio-modal")) {
  customElements.define("wio-modal", WioModal);
}
