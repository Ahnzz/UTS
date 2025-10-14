// script.js
// Cart key for localStorage
const CART_KEY = "neat_cart_v1";

/* ---------- helper ---------- */
function rupiah(n){
  return "Rp" + Number(n).toLocaleString("id-ID");
}
function getCart(){
  const raw = localStorage.getItem(CART_KEY);
  return raw ? JSON.parse(raw) : {};
}
function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartIndicator();
}

/* ---------- UI: cart indicator (only if element exists) ---------- */
function updateCartIndicator(){
  const el = document.getElementById("cartCount");
  if(!el) return;
  const cart = getCart();
  const count = Object.values(cart).reduce((s,i)=>s + (i.qty || 0), 0);
  el.textContent = count;
}

/* ---------- Toast ---------- */
let toastTimer = null;
function showToast(msg = "Pesanan Berhasil Ditambahkan"){
  const t = document.getElementById("toast");
  if(!t) return;
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.classList.add("hidden"), 1800);
}

/* ---------- Cart modal ---------- */
function openCart(){
  const modal = document.getElementById("cartModal");
  if(!modal) return;
  renderCartItems();
  modal.classList.remove("hidden");
}
function closeCart(){
  const modal = document.getElementById("cartModal");
  if(!modal) return;
  modal.classList.add("hidden");
}

function renderCartItems(){
  const container = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  if(!container || !totalEl) return;
  const cart = getCart();
  container.innerHTML = "";
  const ids = Object.keys(cart);
  if(ids.length === 0){
    container.innerHTML = "<p>Keranjang kosong.</p>";
    totalEl.textContent = rupiah(0);
    return;
  }
  let total = 0;
  ids.forEach(id=>{
    const it = cart[id];
    const subtotal = it.qty * it.price;
    total += subtotal;
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="ci-left">
        <div class="ci-name">${escapeHtml(it.name)}</div>
        <div class="ci-price">${rupiah(it.price)} x ${it.qty}</div>
      </div>
      <div class="qty-controls">
        <button class="dec" data-id="${id}">-</button>
        <div>${it.qty}</div>
        <button class="inc" data-id="${id}">+</button>
        <button class="remove" data-id="${id}" title="Hapus" style="margin-left:8px;">🗑</button>
      </div>
    `;
    container.appendChild(row);
  });
  totalEl.textContent = rupiah(total);

  // bind controls
  container.querySelectorAll(".inc").forEach(b=> b.addEventListener("click", ()=>{
    changeQty(b.dataset.id, +1);
  }));
  container.querySelectorAll(".dec").forEach(b=> b.addEventListener("click", ()=>{
    changeQty(b.dataset.id, -1);
  }));
  container.querySelectorAll(".remove").forEach(b=> b.addEventListener("click", ()=>{
    removeItem(b.dataset.id);
  }));
}

/* ---------- cart ops ---------- */
function addToCart(item){
  const cart = getCart();
  if(!cart[item.id]) cart[item.id] = { id:item.id, name:item.name, price:item.price, qty:0 };
  cart[item.id].qty += item.qty || 1;
  saveCart(cart);
  showToast("Pesanan Berhasil Ditambahkan");
}
function changeQty(id, delta){
  const cart = getCart();
  if(!cart[id]) return;
  cart[id].qty += delta;
  if(cart[id].qty <= 0) delete cart[id];
  saveCart(cart);
  renderCartItems();
}
function removeItem(id){
  const cart = getCart();
  if(!cart[id]) return;
  delete cart[id];
  saveCart(cart);
  renderCartItems();
}
function clearCart(){
  localStorage.removeItem(CART_KEY);
  updateCartIndicator();
  renderCartItems();
}

/* ---------- Checkout ---------- */
function checkout(){
  const cart = getCart();
  if(Object.keys(cart).length === 0){
    alert("Keranjang kosong!");
    return;
  }
  // simulate success
  closeCart();
  clearCart();
  openSuccessModal();
}

/* ---------- Success modal ---------- */
function openSuccessModal(){
  const m = document.getElementById("successModal");
  if(!m) return;
  m.classList.remove("hidden");
}
function closeSuccessModal(){
  const m = document.getElementById("successModal");
  if(!m) return;
  m.classList.add("hidden");
}

/* ---------- safety escape ---------- */
function escapeHtml(s){
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

/* ---------- init ---------- */
document.addEventListener("DOMContentLoaded", ()=>{
  updateCartIndicator();

  // add to cart buttons (on menu page)
  document.querySelectorAll(".add-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const card = btn.closest(".menu-card");
      if(!card) return;
      const id = card.dataset.id;
      const name = card.dataset.name;
      const price = parseInt(card.dataset.price, 10) || 0;
      const qtyInput = card.querySelector(".qty-input");
      const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
      addToCart({ id, name, price, qty });
    });
  });

  // cart open/close
  const cartBtn = document.getElementById("cartBtn");
  if(cartBtn) cartBtn.addEventListener("click", openCart);
  const closeCartBtn = document.getElementById("closeCart");
  if(closeCartBtn) closeCartBtn.addEventListener("click", closeCart);

  // clear
  const clearBtn = document.getElementById("clearCart");
  if(clearBtn) clearBtn.addEventListener("click", ()=>{
    if(confirm("Kosongkan keranjang?")) clearCart();
  });

  // checkout
  const checkoutBtn = document.getElementById("checkoutBtn");
  if(checkoutBtn) checkoutBtn.addEventListener("click", ()=> checkout());

  // success modal close
  const cs = document.getElementById("closeSuccess");
  if(cs) cs.addEventListener("click", ()=> closeSuccessModal());

  // close modal when clicking outside (for cart modal)
  document.querySelectorAll(".modal").forEach(mod=>{
    mod.addEventListener("click", (ev)=>{
      if(ev.target === mod && !mod.classList.contains("centered")) mod.classList.add("hidden");
    });
  });

  // contact form submit (on contact page)
  const contactForm = document.getElementById("contactForm");
  if(contactForm){
    contactForm.addEventListener("submit", (e)=>{
      e.preventDefault();
      const fb = document.getElementById("contactFeedback");
      fb.textContent = "Pesan Anda telah dikirim. Terima kasih!";
      fb.style.color = "#008a4a";
      contactForm.reset();
    });
  }



});
