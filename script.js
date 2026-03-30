// Налаштування Telegram (ваші дані вже підставлені)
const TELEGRAM_BOT_TOKEN = '8780649579:AAFigMLzgyUs6Z1nX9optwtugIpdmymnoEA';
const TELEGRAM_CHAT_ID = '1334615761';

// 1. Оновлення лічильника кошика в хедері
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('ua_style_cart')) || [];
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const badge = document.getElementById('cart-count');
    if (badge) badge.innerText = count;
}

// 2. Відображення товарів на сторінці Checkout
function renderCheckoutSummary() {
    const cart = JSON.parse(localStorage.getItem('ua_style_cart')) || [];
    const itemsList = document.getElementById('cart-items-list');
    const totalDisplay = document.getElementById('total-price');
    
    if (!itemsList || !totalDisplay) return; // Якщо ми не на сторінці оформлення

    if (cart.length === 0) {
        itemsList.innerHTML = '<p>Кошик порожній</p>';
        totalDisplay.innerText = '0 ₴';
        return;
    }

    let html = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `
            <div class="cart-item-mini">
                <span>${item.name} (${item.size}) x${item.quantity}</span>
                <strong>${itemTotal.toLocaleString()} ₴</strong>
            </div>
        `;
    });

    itemsList.innerHTML = html;
    totalDisplay.innerText = `${total.toLocaleString()} ₴`;
}

// 3. Відправка замовлення в Telegram
async function sendOrderToTelegram(event) {
    event.preventDefault();

    const cart = JSON.parse(localStorage.getItem('ua_style_cart')) || [];
    if (cart.length === 0) {
        alert('Ваш кошик порожній!');
        return;
    }

    // Збір даних з форми
    const fio = document.getElementById('fio').value;
    const phone = document.getElementById('phone').value;
    const city = document.getElementById('city').value;
    const delivery = document.getElementById('delivery-method').options[document.getElementById('delivery-method').selectedIndex].text;
    const address = document.getElementById('address').value;
    const payment = document.querySelector('input[name="pay"]:checked').parentElement.querySelector('.pay-title').innerText;

    // Формування списку товарів
    let orderItems = "";
    let totalSum = 0;
    cart.forEach((item, index) => {
        orderItems += `${index + 1}. ${item.name} | Розмір: ${item.size} | К-сть: ${item.quantity} шт. | Ціна: ${item.price * item.quantity} ₴\n`;
        totalSum += item.price * item.quantity;
    });

    const message = `
📦 **НОВЕ ЗАМОВЛЕННЯ** 📦
-------------------------
👤 **Клієнт:** ${fio}
📞 **Телефон:** ${phone}
📍 **Місто:** ${city}
🚚 **Доставка:** ${delivery}
🏠 **Адреса:** ${address}
💳 **Оплата:** ${payment}
-------------------------
🛍 **Товари:**
${orderItems}
-------------------------
💰 **ЗАГАЛОМ до сплати: ${totalSum} ₴**
    `;

    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        if (response.ok) {
            alert('Дякуємо! Ваше замовлення прийнято і надіслано менеджеру.');
            localStorage.removeItem('ua_style_cart'); // Очистити кошик
            window.location.href = 'index.html'; // Повернути на головну
        } else {
            throw new Error('Помилка відправки');
        }
    } catch (error) {
        alert('Сталася помилка. Спробуйте ще раз або зв\'яжіться з нами за телефоном.');
    }
}

// Ініціалізація
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    renderCheckoutSummary();

    const form = document.getElementById('main-checkout-form');
    if (form) {
        form.addEventListener('submit', sendOrderToTelegram);
    }
});