import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import productService from '../services/productService';
import './Products.css';

const CATEGORIES = ['All', 'Grains', 'Vegetables', 'Commercial', 'Oilseeds', 'Pulses', 'Fruits'];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await productService.getProducts({
        search,
        category: category !== 'All' ? category : undefined,
        location: location || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sort,
        limit: 50
      });

      if (res.data) {
        setProducts(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setSearchParams({});
    setTimeout(() => {
      productService.getProducts({ limit: 50 }).then(res => {
        if (res.data) setProducts(res.data);
      });
    }, 50);
  };

  return (
    <div className="page-container products-page">
      <div className="products-header">
        <h1 className="products-title">Farm Produce Marketplace</h1>
        <p className="products-subtitle">
          Discover verified crop listings directly from farmers with transparent pricing.
        </p>
      </div>

      <div className="products-layout">
        {/* Left Filter Sidebar */}
        <aside className="products-filter-card">
          <div className="filter-header">
            <h3>Filter Produce</h3>
            <button onClick={handleResetFilters} className="filter-reset-btn">
              Reset All
            </button>
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <label className="filter-label">Crop Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-select"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="filter-group">
            <label className="filter-label">Farm Location / District</label>
            <input
              type="text"
              placeholder="e.g. Pune, Nashik"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Price Range Filter */}
          <div className="filter-group">
            <label className="filter-label">Price Range (₹)</label>
            <div className="filter-price-inputs">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="form-input"
                min="0"
              />
              <span>—</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="form-input"
                min="0"
              />
            </div>
          </div>

          <button onClick={fetchProducts} className="btn btn-primary btn-sm">
            Apply Filters
          </button>
        </aside>

        {/* Right Main Column */}
        <main className="products-main">
          {/* Search & Sort Toolbar */}
          <div className="products-toolbar">
            <form onSubmit={handleSearchSubmit} className="products-search-wrap">
              <input
                type="text"
                placeholder="Search crops by name or variety..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="products-search-input"
              />
            </form>

            <div className="products-sort-wrap">
              <span>Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="products-sort-select"
              >
                <option value="newest">Recently Added</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Crop Name (A-Z)</option>
              </select>
            </div>

            <div className="products-results-count">
              Showing <strong>{products.length}</strong> available crops
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div className="loading-spinner">Loading marketplace produce...</div>
          ) : products.length > 0 ? (
            <div className="products-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No Crops Found</h3>
              <p>Try clearing your filters or searching with a different term.</p>
              <button onClick={handleResetFilters} className="btn btn-outline btn-sm" style={{ marginTop: '16px' }}>
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

