<template>
  <div class="electronic-store">
    <h1>فروشگاه محصولات الکترونیکی</h1>

    <div v-if="productStore.products.length === 0" class="loading">در حال بارگذاری محصولات...</div>

    <div v-else class="products-grid">
      <div v-for="product in activeProducts" :key="product.id" class="product-card">
        <div class="product-image">
          <img :src="product.coverImage" :alt="product.name" />
        </div>

        <div class="product-info">
          <h3 class="product-name">{{ product.name }}</h3>

          <div class="price-info">
            <span v-if="product.discount > 0" class="original-price"> ${{ product.price }} </span>
            <span class="final-price"> ${{ finalPrice(product) }} </span>
            <span v-if="product.discount > 0" class="discount">
              {{ product.discount }}% تخفیف
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useProductStore } from '@/stores/product-store'

type Product = {
  id: string
  name: string
  discount: number
  price: number
  active: boolean
  coverImage: string
  images: string[]
}

const productStore = useProductStore()

// محصولات فعال
const activeProducts = computed(() => {
  return productStore.products.filter((product) => product.active)
})

// محاسبه قیمت نهایی با تخفیف
const finalPrice = (product: Product) => {
  if (product.discount > 0) {
    return ((product.price * (100 - product.discount)) / 100).toFixed(2)
  }
  return product.price.toFixed(2)
}

// بارگذاری محصولات هنگام mount شدن کامپوننت
onMounted(() => {
  productStore.fetchProducts()
})
</script>

<style scoped>
.electronic-store {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 2.5rem;
}

.loading {
  text-align: center;
  font-size: 1.2rem;
  color: #7f8c8d;
  padding: 2rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.product-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.product-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 1.5rem;
}

.product-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
}

.price-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.original-price {
  font-size: 1rem;
  color: #95a5a6;
  text-decoration: line-through;
}

.final-price {
  font-size: 1.4rem;
  font-weight: 700;
  color: #27ae60;
}

.discount {
  background: #e74c3c;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}
</style>
