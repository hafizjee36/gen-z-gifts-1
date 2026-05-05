const API_BASE_URL = 'http://localhost:3002/backend/api';
// const API_BASE_URL = 'https://genzgifts.com/backend/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers,
        ...options,
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || 'Request failed' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }); 
  }

  async register(email: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getUser() {
    return this.request('/auth/user');
  }

  // Products
  async getAdminProduct() {
    return this.request('/products');
  }

  async getProducts() {
    return this.request('/products/list');
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  async getProductBySlug(slug: string) {
    return this.request(`/products/by-slug/${slug}`);
  }

  async createProduct(product: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, product: any) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async updateProductOrder(products: { id: string; sort_order: number }[]) {
    return this.request('/products/reorder', {
      method: 'PUT',
      body: JSON.stringify({ products }),
    });
  }

  // Categories
  async getCategories() {
    return this.request('/categories'); 
  }
  async getCategoriesList() {
    return this.request('/categories/list'); 
  }

  async createCategory(category: any) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  async updateCategory(id: string, category: any) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Orders
  async getOrders() {
    return this.request('/orders');
  }

  async getOrder(orderNumber: string) {
    return this.request(`/orders?order_number=${orderNumber}`);
  }

  async trackOrder(orderNumber: string) {
    return this.request(`/track/${orderNumber}`);
  }

  async createOrder(order: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify({
        ...order,
        payment_screenshot: order.payment_screenshot || 'N/A',
      }),
    });
  }

  async updateOrder(id: string, order: any) {
    return this.request(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(order),
    });
  }

  // Order Items
  async getOrderItems(orderId?: string) {
    const endpoint = orderId ? `/order-items?order_id=${orderId}` : '/order-items';
    return this.request(endpoint);
  }

  async createOrderItem(item: any) {
    return this.request('/order-items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  // Site Settings
  async getSiteSettings() {
    return this.request('/site-settings');
  }

  async updateSiteSettings(settings: any) {
    return this.request('/site-settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // User Roles
  async getUserRoles() {
    return this.request('/user-roles');
  }

  async createUserRole(role: any) {
    return this.request('/user-roles', {
      method: 'POST',
      body: JSON.stringify(role),
    });
  }

  async deleteUserRole(id: string) {
    return this.request(`/user-roles/${id}`, {
      method: 'DELETE',
    });
  }

  // Image Upload
  async uploadImage(file: File): Promise<{ url?: string; error?: string }> {
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('image', file);

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}/products/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || 'Upload failed' };
      }

      const data = await response.json();
      return { url: data.url };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  // Multiple Image Upload
  async uploadMultipleImages(files: File[]): Promise<{ urls?: string[]; error?: string }> {
    try {
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${this.baseUrl}/products/upload`, {
          method: 'POST',
          headers,
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        const data = await response.json();
        return data.url;
      });

      const urls = await Promise.all(uploadPromises);
      return { urls };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  // Payment Screenshot Upload
  async uploadPaymentScreenshot(file: File): Promise<{ url?: string; error?: string }> {
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('image', file);

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}/products/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || 'Upload failed' };
      }

      const data = await response.json();
      // Return the full URL with the base URL
      const baseUrl = this.baseUrl.replace('/backend/api', '');
      return { url: `${data.url}` };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  // Stripe Checkout
  async createCheckout(checkoutData: {
    items: Array<{
      product_id: string;
      name: string;
      price: number;
      quantity: number;
      image?: string;
    }>;
    customerEmail: string;
    customerName: string;
    customerPhone: string;
    shippingAddress: string;
    shippingCity: string;
    shippingZip: string;
    shippingCountry: string;
    shippingCost: number;
  }): Promise<ApiResponse<{ url: string; orderId?: string; orderNumber?: string }>> {
    return this.request('/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    });
  }

  // Reviews
  async getReviews() {
    return this.request('/reviews');
  }

  async getProductReviews(productId: string) {
    return this.request(`/reviews/product/${productId}`);
  }

  async createReview(review: {
    order_number: string;
    product_id: number;
    customer_email: string;
    rating: number;
    review_text?: string;
  }) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(review),
    });
  }

  async deleteReview(id: string) {
    return this.request(`/reviews/${id}`, {
      method: 'DELETE',
    });
  }

  // Coupons
  async getCoupons() {
    return this.request('/coupons');
  }

  async createCoupon(coupon: {
    code: string;
    description?: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_order_amount?: number;
    max_uses?: number;
    is_active?: boolean;
    valid_from?: string;
    valid_until?: string;
  }) {
    return this.request('/coupons', {
      method: 'POST',
      body: JSON.stringify(coupon),
    });
  }

  async updateCoupon(id: string, coupon: {
    code?: string;
    description?: string;
    discount_type?: 'percentage' | 'fixed';
    discount_value?: number;
    min_order_amount?: number;
    max_uses?: number;
    is_active?: boolean;
    valid_from?: string;
    valid_until?: string;
  }) {
    return this.request(`/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(coupon),
    });
  }

  async deleteCoupon(id: string) {
    return this.request(`/coupons/${id}`, {
      method: 'DELETE',
    });
  }

  async validateCoupon(code: string, orderAmount: number) {
    return this.request('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, orderAmount }),
    });
  }

  async useCoupon(code: string) {
    return this.request('/coupons/use', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // Visitors
  async getGeo() {
    const apis = [
      {
        url: 'https://ipwho.is/',
        parse: (data: any) => data.success !== false ? { country: data.country || '', city: data.city || '' } : null,
      },
      {
        url: 'https://ipapi.co/json/',
        parse: (data: any) => ({ country: data.country_name || '', city: data.city || '' }),
      },
      {
        url: 'https://ipinfo.io/json',
        parse: (data: any) => ({ country: data.country || '', city: data.city || '' }),
      },
    ];

    // Try to get results from two APIs and use consensus
    const results: { country: string; city: string }[] = [];

    const promises = apis.map(async (apiDef) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const response = await fetch(apiDef.url, { signal: controller.signal });
        clearTimeout(timeout);
        if (!response.ok) return null;
        const data = await response.json();
        return apiDef.parse(data);
      } catch {
        return null;
      }
    });

    const settled = await Promise.allSettled(promises);
    for (const r of settled) {
      if (r.status === 'fulfilled' && r.value && (r.value.country || r.value.city)) {
        results.push(r.value);
      }
    }

    if (results.length === 0) return { country: '', city: '' };

    // If multiple results, prefer the most common country (consensus)
    if (results.length >= 2) {
      const countryCount: Record<string, number> = {};
      for (const r of results) {
        if (r.country) {
          countryCount[r.country] = (countryCount[r.country] || 0) + 1;
        }
      }
      const bestCountry = Object.entries(countryCount).sort((a, b) => b[1] - a[1])[0]?.[0];
      const bestResult = results.find(r => r.country === bestCountry) || results[0];
      return bestResult;
    }

    return results[0];
  }

  async trackVisitor(visitor: {
    page_url: string;
    referrer: string;
    country: string;
    city: string;
    user_agent: string;
    session_id: string;
  }) {
    return this.request('/visitors', {
      method: 'POST',
      body: JSON.stringify(visitor),
    });
  }

  async getVisitors(dateRange?: '7d' | '30d' | 'all') {
    const endpoint = dateRange ? `/visitors?date_range=${dateRange}` : '/visitors';
    return this.request(endpoint);
  }

  // Banners
  async getBanners() {
    return this.request('/banners/list');
  }

  async getAdminBanners() {
    return this.request('/banners');
  }

  async createBanner(banner: any) {
    return this.request('/banners', {
      method: 'POST',
      body: JSON.stringify(banner),
    });
  }

  async updateBanner(id: string, banner: any) {
    return this.request(`/banners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(banner),
    });
  }

  async deleteBanner(id: string) {
    return this.request(`/banners/${id}`, {
      method: 'DELETE',
    });
  }

  // Bundles
  async getBundles() {
    return this.request('/bundles?active=true');
  }

  async getAdminBundles() {
    return this.request('/bundles');
  }

  async createBundle(bundle: { name: string; image_url: string; min_items: number; is_active: boolean; display_order: number }) {
    return this.request('/bundles', {
      method: 'POST',
      body: JSON.stringify(bundle),
    });
  }

  async updateBundle(id: string, bundle: Partial<{ name: string; image_url: string; min_items: number; is_active: boolean; display_order: number }>) {
    return this.request(`/bundles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bundle),
    });
  }

  async deleteBundle(id: string) {
    return this.request(`/bundles/${id}`, {
      method: 'DELETE',
    });
  }

}

export const api = new ApiClient(API_BASE_URL);

