if (!customElements.get('featured-product-form')) {
  customElements.define('featured-product-form', class ProductForm extends HTMLElement {
    constructor() {
      super();

      this.form = this.querySelector('form');
      this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
      this.cartNotification = document.querySelector('cart-notification');
    }

    onSubmitHandler(evt) {
      evt.preventDefault();
      this.cartNotification.setActiveElement(document.activeElement);

      const submitButton = this.querySelector('[type="submit"]');

      submitButton.setAttribute('disabled', true);
      submitButton.classList.add('loading');

      const body = JSON.stringify({
        ...JSON.parse(serializeForm(this.form)),
        sections: this.cartNotification.getSectionsToRender().map((section) => section.id),
        sections_url: window.location.pathname
      });

      fetch(`${routes.cart_add_url}`, { ...fetchConfig('javascript'), body })
        .then((response) => response.json())
        .then((parsedState) => {
          this.cartNotification.renderContents(parsedState);
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          submitButton.classList.remove('loading');
          submitButton.removeAttribute('disabled');

          //In case you want to hide the product after adding to cart
          submitButton.closest('.featured-products__item').classList.add('hidden');

          const cartItemsId = document.getElementById('main-cart-items').dataset.id;
          const cartFooterId = document.getElementById('main-cart-footer').dataset.id;
          const cartItemsBlock = document.querySelector('cart-items');
          const cartFooterBlock = document.getElementById('main-cart-footer');

          fetch(`https://volleyball-store-123.myshopify.com/cart?sections=${cartItemsId},${cartFooterId}`)
            .then((response) => response.json())
            .then((htmlString) => {
              const parser = new DOMParser();

              const newCartItems = parser
                .parseFromString(htmlString[`${cartItemsId}`], 'text/html')
                .querySelector('cart-items')
                .innerHTML;

              const newCartFooter = parser
                .parseFromString(htmlString[`${cartFooterId}`], 'text/html')
                .querySelector('#main-cart-footer')
                .innerHTML;

              cartItemsBlock.classList.remove('is-empty')
              cartFooterBlock.classList.remove('is-empty')
              cartItemsBlock.innerHTML = newCartItems;
              cartFooterBlock.innerHTML= newCartFooter;
            });
        });
    }
  });
}