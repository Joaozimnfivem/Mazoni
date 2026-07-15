// ==================== INTERATIVIDADE DO SITE ====================

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Alternar Tema (Escuro / Claro)
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');
    const body = document.body;

    // Check saved theme
    const savedTheme = localStorage.getItem('theme') || 'light-theme';
    body.className = savedTheme;
    updateThemeIcons(savedTheme);

    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('light-theme')) {
            body.classList.replace('light-theme', 'dark-theme');
            localStorage.setItem('theme', 'dark-theme');
            updateThemeIcons('dark-theme');
        } else {
            body.classList.replace('dark-theme', 'light-theme');
            localStorage.setItem('theme', 'light-theme');
            updateThemeIcons('light-theme');
        }
    });

    function updateThemeIcons(theme) {
        if (theme === 'dark-theme') {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    }

    // 2. Menu Responsivo Mobile
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const nav = document.querySelector('.nav');

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('open');
        nav.classList.toggle('open');
    });

    // Fechar menu mobile ao clicar em um link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('open');
            nav.classList.remove('open');
        });
    });

    // 3. Filtros do Cardápio
    const filterButtons = document.querySelectorAll('.filter-btn');
    const menuItems = document.querySelectorAll('.item-lanche');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover classe active de todos
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            menuItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filterValue === 'todos' || category === filterValue) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // 4. Sistema de Carrinho Avançado
    let cart = [];
    const cartBtn = document.getElementById('cart-btn');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCart = document.getElementById('close-cart');
    const cartCountElement = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalValue = document.getElementById('cart-total-value');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Abrir / Fechar Carrinho
    cartBtn.addEventListener('click', () => {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('open');
    });

    const closeCartFunc = () => {
        cartSidebar.classList.remove('open');
        cartOverlay.classList.remove('open');
    };

    closeCart.addEventListener('click', closeCartFunc);
    cartOverlay.addEventListener('click', closeCartFunc);

    // Adicionar itens
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const name = btn.getAttribute('data-name');
            const price = parseFloat(btn.getAttribute('data-price'));

            addToCart(id, name, price);
        });
    });

    function addToCart(id, name, price) {
        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.qty += 1;
        } else {
            cart.push({ id, name, price, qty: 1 });
        }

        updateCartUI();
        
        // Efeito visual no botão de carrinho
        cartBtn.style.transform = 'scale(1.2)';
        setTimeout(() => cartBtn.style.transform = 'scale(1)', 200);
    }

    function updateCartUI() {
        // Quantidade total
        const totalItems = cart.reduce((acc, curr) => acc + curr.qty, 0);
        cartCountElement.textContent = totalItems;

        // Limpar container do carrinho
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-message">Seu carrinho está vazio 😔</p>';
            cartTotalValue.textContent = 'R$ 0,00';
            checkoutBtn.disabled = true;
            return;
        }

        checkoutBtn.disabled = false;
        let total = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.qty;
            total += itemTotal;

            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <span>R$ ${item.price.toFixed(2).replace('.', ',')} x ${item.qty}</span>
                </div>
                <div class="cart-item-qty">
                    <button class="qty-btn" data-action="decrease" data-id="${item.id}">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        cartTotalValue.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

        // Ouvir cliques nos botões de quantidade dentro do carrinho
        document.querySelectorAll('.qty-btn').forEach(button => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-id');
                const action = button.getAttribute('data-action');
                changeQty(id, action);
            });
        });
    }

    function changeQty(id, action) {
        const item = cart.find(i => i.id === id);
        if (!item) return;

        if (action === 'increase') {
            item.qty += 1;
        } else if (action === 'decrease') {
            item.qty -= 1;
            if (item.qty === 0) {
                cart = cart.filter(i => i.id !== id);
            }
        }
        updateCartUI();
    }

    // Finalizar Pedido - Gerar WhatsApp Dinâmico
    checkoutBtn.addEventListener('click', () => {
        let text = "Olá! Gostaria de fazer o seguinte pedido:\n\n";
        let total = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.qty;
            total += itemTotal;
            text += `*${item.qty}x* - _${item.name}_ (R$ ${itemTotal.toFixed(2).replace('.', ',')})\n`;
        });

        text += `\n*Total do Pedido:* R$ ${total.toFixed(2).replace('.', ',')}\n\n `;

        // Encode URI para formatar corretamente na URL do WhatsApp
        const encodedText = encodeURIComponent(text);
        const whatsappUrl = `https://wa.me/5514996095434?text=${encodedText}`;

        // Abrir em nova aba
        window.open(whatsappUrl, '_blank');
        
        // Limpar carrinho
        cart = [];
        updateCartUI();
        closeCartFunc();
    });
});
