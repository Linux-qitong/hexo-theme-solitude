class AIPostRenderer {
  static ANIMATION_DELAY_MS = 40;
  static AI_EXPLANATION_SELECTOR = ".ai-explanation";
  static AI_TAG_SELECTOR = ".ai-tag";

  constructor() {
    this.startTextAnimation = this.startTextAnimation.bind(this);
    this.animationFrame = null;
    this.isDeleting = false;
  }

  init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", this.initialize.bind(this));
    } else {
      this.initialize();
    }
  }

  initialize() {
    this.cacheElements();
    if (this.validateContent()) {
      this.renderAIContent();
    }
  }

  cacheElements() {
    this.refs = new WeakMap();
    this.refs.set(document, {
      explanationElement: document.querySelector(AIPostRenderer.AI_EXPLANATION_SELECTOR),
      tagElement: document.querySelector(AIPostRenderer.AI_TAG_SELECTOR)
    });
    const { explanationElement, tagElement } = this.refs.get(document) || {};
    this.explanationElement = explanationElement;
    this.tagElement = tagElement;
  }

  validateContent() {
    return (
      this.explanationElement &&
      this.tagElement &&
      this.aiContent.length &&
      !this.isAnimating
    );
  }

  renderAIContent() {
    this.prepareAnimation();
    setTimeout(() => {
      this.explanationElement.style.display = "block";
      this.explanationElement.classList.add("fast-blink");
      this.animationFrame = requestAnimationFrame(() =>
        this.startTextAnimation(0)
      );
    }, 3000);
  }

  prepareAnimation() {
    this.isAnimating = true;
    this.isDeleting = true;
    this.tagElement.classList.add("loadingAI");
  }

  startTextAnimation(index) {
    if (this.isDeleting) {
      const currentText = this.explanationElement.textContent;
      if (currentText.length > 0) {
        this.explanationElement.textContent = currentText.slice(0, -1);
        setTimeout(() => {
          this.animationFrame = requestAnimationFrame(() =>
            this.startTextAnimation(index)
          );
        }, AIPostRenderer.ANIMATION_DELAY_MS);
      } else {
        this.isDeleting = false;
        this.startTextAnimation(0);
      }
    } else {
      if (index >= this.aiContent.length) {
        this.completeAnimation();
      } else {
        this.explanationElement.textContent += this.aiContent[index];
        setTimeout(() => {
          this.animationFrame = requestAnimationFrame(() =>
            this.startTextAnimation(index + 1)
          );
        }, AIPostRenderer.ANIMATION_DELAY_MS);
      }
    }
  }

  completeAnimation() {
    cancelAnimationFrame(this.animationFrame);
    this.isAnimating = false;
    this.tagElement.classList.remove("loadingAI");
    this.explanationElement.classList.remove("fast-blink");
    const event = new CustomEvent("aiRenderComplete", {
      detail: { element: this.explanationElement }
    });
    document.dispatchEvent(event);
  }

  get aiContent() {
    return PAGE_CONFIG?.ai_text || "";
  }
}

const aiPostRenderer = (() => {
  let instance;
  return () => {
    if (!instance) {
      instance = new AIPostRenderer();
      instance.init();
    }
    return instance;
  };
})();

const ai = aiPostRenderer();
