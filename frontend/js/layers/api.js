/**
 * ApiService - A dedicated layer for all data fetching.
 */
const BASE_URL = 'http://localhost:5000'; // Express backend URL
const IS_LOCAL_JSON = false;

async function fetchJson(endpoint) {
    try {
        const url = IS_LOCAL_JSON ? `${BASE_URL}/${endpoint}.json` : `${BASE_URL}/api/${endpoint}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`DarazApi: Error fetching ${endpoint}:`, error);
        throw error;
    }
}

export const DarazApi = {
    getBanners: () => fetchJson('banners'),
    getProducts: () => fetchJson('products'),
    getNavCategories: () => fetchJson('categories/nav'),
    getSections: () => fetchJson('sections'),
    getProductDetails: (id) => fetchJson(`products/${id}`),
    getBrands: () => fetchJson('brands'),
    getSellers: () => fetchJson('sellers'),
    getDeliveryMethods: () => fetchJson('delivery-methods'),
    getUsers: () => fetchJson('users'),
    getCategories: () => fetchJson('categories')
};
