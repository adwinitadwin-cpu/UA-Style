const TELEGRAM_BOT_TOKEN = '8780649579:AAFigMLzgyUs6Z1nX9optwtugIpdmymnoEA';
const TELEGRAM_CHAT_ID = '1334615761';

let cart = JSON.parse(localStorage.getItem('catjoy_cart')) || [];

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('active');
}

function addToCart(name, price, img) {
    const existing = cart.find(i => i.name === name);
    if (existing) { existing.quantity++; } 
    else { cart.push({ name, price, img, quantity: 1 }); }
    updateCart();
    if (!document.getElementById('cart-sidebar').classList.contains('active')) toggleCart();
}

function updateCart() {
    localStorage.setItem('catjoy_cart', JSON.stringify(cart));
    document.getElementById('cart-count').innerText = cart.reduce((t, i) => t + i.quantity, 0);
    
    const container = document.getElementById('cart-items');
    container.innerHTML = cart.map((item, idx) => `
        <div class="cart-item">
            <img src="${item.img}" style="width:50px; height:50px; object-fit:contain;">
            <div style="flex:1; margin-left:10px;">
                <b>${item.name}</b><br>${item.price} грн
            </div>
            <button onclick="changeQty(${idx}, -1)">-</button>
            <span>${item.quantity}</span>
            <button onclick="changeQty(${idx}, 1)">+</button>
        </div>
    `).join('');
    document.getElementById('cart-total').innerText = cart.reduce((t, i) => t + (i.price * i.quantity), 0);
}

function changeQty(idx, delta) {
    cart[idx].quantity += delta;
    if (cart[idx].quantity <= 0) cart.splice(idx, 1);
    updateCart();
}

// ГЕОЛОКАЦІЯ: Автоматичне місто через IP
async function fetchLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.city) {
            document.getElementById('city').value = data.city;
            document.getElementById('geo-status').innerText = `📍 Визначено: ${data.city}`;
        }
    } catch (e) {
        document.getElementById('geo-status').innerText = '📍 Введіть місто вручну';
    }
}

// ВІДПРАВКА
async function sendOrder(event) {
    event.preventDefault();
    const message = `
🚀 НОВЕ ЗАМОВЛЕННЯ
👤 Клієнт: ${document.getElementById('fio').value}
📞 Тел: ${document.getElementById('phone').value}
📍 Місто: ${document.getElementById('city').value}
📮 Пошта: ${document.getElementById('post-office').value}
🛍 Товари:
${cart.map(i => `• ${i.name} x${i.quantity}`).join('\n')}
💰 Разом: ${document.getElementById('cart-total').innerText} грн
    `;

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message })
    });

    alert('Замовлення прийнято!');
    cart = [];
    updateCart();
    toggleCart();
}

document.addEventListener('DOMContentLoaded', () => {
    updateCart();
    fetchLocation();
    document.getElementById('main-checkout-form').addEventListener('submit', sendOrder);
});
