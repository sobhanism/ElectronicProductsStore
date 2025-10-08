<template>
  <div style="padding: 25px">
    <!-- Header with Auth and Cart -->
    <div class="header-container">
      <div class="auth-section">
        <div v-if="authStore.isLoggedIn" class="user-info">
          <span class="welcome-text">سلام، {{ authStore.username }}</span>
          <button class="btn-secondary" @click="handleLogout">خروج</button>
        </div>
        <div v-else>
          <button class="btn-primary" @click="showAuthModal = true">ورود / ثبت‌نام</button>
        </div>
      </div>

      <div class="cart-container">
        <button class="cart-button" @click="showCart = true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span v-if="cartStore.itemCount > 0" class="cart-badge">{{ cartStore.itemCount }}</span>
        </button>
      </div>
    </div>

    <!-- Auth Modal -->
    <AuthModal :show="showAuthModal" @close="showAuthModal = false" @success="onAuthSuccess" />

    <!-- Cart Modal -->
    <div v-if="showCart" class="modal-overlay" @click="showCart = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>سبد خرید</h2>
          <button class="close-button" @click="showCart = false">×</button>
        </div>
        <div class="modal-body">
          <div v-if="cartStore.cart.items.length === 0" class="empty-cart">
            <p>سبد خرید شما خالی است</p>
          </div>
          <div v-else>
            <div v-for="item in cartStore.cart.items" :key="item.productId" class="cart-item">
              <div class="cart-item-info">
                <h3>{{ item.productName }}</h3>
                <div class="cart-item-pricing">
                  <p class="cart-item-details">تعداد: {{ item.count }}</p>
                  <div v-if="getProductDiscount(item.productId) > 0" class="discount-info">
                    <p class="cart-original-price">
                      قیمت اصلی: ${{ getProductPrice(item.productId) }}
                    </p>
                    <p class="cart-discount-badge">
                      {{ getProductDiscount(item.productId) }}% تخفیف
                    </p>
                  </div>
                  <p class="cart-item-details">
                    قیمت واحد: ${{ getDiscountedPrice(item.productId).toFixed(2) }}
                  </p>
                </div>
              </div>
              <div class="cart-item-price">
                ${{ (getDiscountedPrice(item.productId) * item.count).toFixed(2) }}
              </div>
            </div>
            <div class="cart-summary">
              <div v-if="getTotalDiscount() > 0" class="summary-row discount-row">
                <span>مجموع تخفیف:</span>
                <span class="discount-amount">-${{ getTotalDiscount().toFixed(2) }}</span>
              </div>
              <div class="cart-total">
                <h3>جمع کل:</h3>
                <h3 class="total-price">${{ getTotalPrice().toFixed(2) }}</h3>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showCart = false">بستن</button>
          <button
            v-if="cartStore.cart.items.length > 0"
            class="btn-danger"
            @click="clearCartHandler"
          >
            پاک کردن سبد
          </button>
        </div>
      </div>
    </div>
    <div class="products-container">
      <div v-for="item in productStore.products" :key="item.id" class="product-card">
        <div class="card-header">
          <h2 class="product-title">{{ item.name }}</h2>
        </div>
        <div class="card-body">
          <div class="product-image" v-if="item.coverImage">
            <img :src="item.coverImage" :alt="item.name" />
          </div>
          <div class="product-details">
            <div class="price-section">
              <p v-if="item.discount > 0" class="original-price">${{ item.price }}</p>
              <p class="product-price">
                ${{ (item.price - (item.price * item.discount) / 100).toFixed(2) }}
              </p>
            </div>
            <p class="product-discount">
              <span v-if="item.discount > 0" class="discount-label"
                >{{ item.discount }}% تخفیف</span
              >
              <span v-else>&nbsp;</span>
            </p>
          </div>
        </div>
        <div class="card-footer">
          <button class="btn-primary" @click="cartStore.decreaseFromCart(item.id)">-</button>
          <span class="item-count">{{ cartStore.getProductCount(item.id) }}</span>
          <button class="btn-primary" @click="cartStore.addToCart(item.id, item.name)">+</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useProductStore } from '@/stores/product-store'
import { useCartStore } from '@/stores/cart-store'
import { useAuthStore } from '@/stores/auth-store'
import AuthModal from './AuthModal.vue'

const productStore = useProductStore()
const cartStore = useCartStore()
const authStore = useAuthStore()

const showCart = ref(false)
const showAuthModal = ref(false)

// بارگذاری محصولات و بررسی وضعیت احراز هویت
onMounted(() => {
  productStore.fetchProducts()
  authStore.checkAuth()
  cartStore.loadCartFromLocalStorage()
})

const onAuthSuccess = () => {
  // هنگام لاگین موفق، سبد خرید کاربر بارگذاری می‌شود
  console.log('ورود موفقیت‌آمیز بود')
}

const handleLogout = async () => {
  if (confirm('آیا مطمئن هستید که می‌خواهید خارج شوید؟')) {
    await authStore.logout()
  }
}

const getProductPrice = (productId: string): number => {
  const product = productStore.products.find((p) => p.id === productId)
  return product ? product.price : 0
}

const getProductDiscount = (productId: string): number => {
  const product = productStore.products.find((p) => p.id === productId)
  return product ? product.discount : 0
}

const getDiscountedPrice = (productId: string): number => {
  const product = productStore.products.find((p) => p.id === productId)
  if (!product) return 0
  const discount = product.discount || 0
  return product.price - (product.price * discount) / 100
}

const getTotalPrice = (): number => {
  return cartStore.cart.items.reduce((total, item) => {
    return total + getDiscountedPrice(item.productId) * item.count
  }, 0)
}

const getTotalDiscount = (): number => {
  return cartStore.cart.items.reduce((total, item) => {
    const originalPrice = getProductPrice(item.productId)
    const discountedPrice = getDiscountedPrice(item.productId)
    return total + (originalPrice - discountedPrice) * item.count
  }, 0)
}

const clearCartHandler = () => {
  if (confirm('آیا مطمئن هستید که می‌خواهید سبد خرید را خالی کنید؟')) {
    cartStore.clearCart()
  }
}
</script>

<style scoped>
/* Header Styles */
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.auth-section {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.welcome-text {
  font-weight: 600;
  color: #1f2937;
  font-size: 1rem;
}

.products-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.product-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  border: 1px solid #e5e7eb;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-header {
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.product-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
}

.card-body {
  padding: 1.5rem;
}

.product-image {
  text-align: center;
  margin-bottom: 1rem;
}

.product-image img {
  max-width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #f3f4f6;
}

.product-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.price-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.original-price {
  font-size: 1rem;
  color: #9ca3af;
  text-decoration: line-through;
  margin: 0;
}

.product-price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #059669;
  margin: 0;
}

.product-discount {
  display: flex;
  align-items: center;
  margin: 0;
}

.discount-label {
  background: #dc2626;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.3);
}

.card-footer {
  padding: 1rem;
  background: #f9fafb;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn-primary {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  flex: 1;
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.item-count {
  font-size: 1.2rem;
  font-weight: bold;
  color: #1f2937;
  min-width: 40px;
  text-align: center;
}

.cart-container {
  display: flex;
  align-items: center;
}

.cart-button {
  position: relative;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.cart-button:hover {
  background: #2563eb;
  transform: scale(1.05);
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #dc2626;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px 16px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.empty-cart {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.empty-cart p {
  font-size: 1.1rem;
  margin: 0;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  transition: background 0.2s ease;
}

.cart-item:hover {
  background: #f9fafb;
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #1f2937;
}

.cart-item-pricing {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.cart-item-details {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.discount-info {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin: 0.25rem 0;
}

.cart-original-price {
  margin: 0;
  font-size: 0.85rem;
  color: #9ca3af;
  text-decoration: line-through;
}

.cart-discount-badge {
  margin: 0;
  background: #dc2626;
  color: white;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
}

.cart-item-price {
  font-size: 1.2rem;
  font-weight: bold;
  color: #059669;
}

.cart-summary {
  margin-top: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
}

.discount-row {
  background: #fef2f2;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.discount-amount {
  color: #dc2626;
  font-weight: bold;
  font-size: 1.1rem;
}

.cart-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1rem 0.5rem;
  margin-top: 1rem;
  border-top: 2px solid #667eea;
}

.cart-total h3 {
  margin: 0;
  font-size: 1.3rem;
}

.total-price {
  color: #059669;
  font-size: 1.5rem !important;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  background: white;
  color: #374151;
}

.btn-secondary:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.btn-danger {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  background: #dc2626;
  color: white;
}

.btn-danger:hover {
  background: #b91c1c;
}
</style>
