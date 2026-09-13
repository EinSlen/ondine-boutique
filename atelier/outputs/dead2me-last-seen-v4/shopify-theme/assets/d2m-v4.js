document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('[data-d2m-menu]').forEach(button=>button.addEventListener('click',()=>{
    const expanded=button.getAttribute('aria-expanded')==='true';button.setAttribute('aria-expanded',String(!expanded));
    document.documentElement.classList.toggle('menu-open',!expanded);
  }));
  document.querySelectorAll('[data-size-button]').forEach(button=>button.addEventListener('click',()=>{
    const scope=button.closest('[data-product-form]');if(!scope)return;scope.querySelectorAll('[data-size-button]').forEach(item=>item.classList.remove('selected'));button.classList.add('selected');
    const select=scope.querySelector('select[name="id"]');const option=select?.querySelector(`option[data-title="${CSS.escape(button.dataset.sizeButton)}"]`);if(option){select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}))}
  }));
});
