<template>
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
          <p class="product-price">${{ item.price }}</p>
          <p class="product-discount">
            <span v-if="item.discount > 0">{{ item.discount }}% OFF</span>
            <span v-else>&nbsp;</span>
          </p>
        </div>
      </div>
      <div class="card-footer">
        <button class="btn-primary">Add to Cart</button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useProductStore } from '@/stores/product-store'
const productStore = useProductStore()
productStore.fetchProducts()
</script>

<style scoped>
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

.product-price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #059669;
  margin: 0;
}

.product-discount {
  color: #dc2626;
  font-weight: 500;
  margin: 0;
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
</style>
