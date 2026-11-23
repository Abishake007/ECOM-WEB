import React, { useContext, useMemo, useState } from 'react';
import AppContext from "../Context/Context";
import { Link } from "react-router-dom";
import unplugged from "../assets/unplugged.png";
import { Table, Badge } from 'react-bootstrap';

const AdminProducts = () => {
    const { data, deleteProduct } = useContext(AppContext);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [sortBy, setSortBy] = useState("name-asc");

    const categoryLabels = new Map();
    data.forEach(product => {
        const label = product.category?.trim();
        if (label) categoryLabels.set(label.toLocaleLowerCase(), categoryLabels.get(label.toLocaleLowerCase()) || label);
    });
    const categories = [...categoryLabels.values()].sort((a, b) => a.localeCompare(b));

    const visibleProducts = useMemo(() => {
        const query = search.trim().toLocaleLowerCase();
        return data
            .filter(product => {
                const matchesSearch = !query || [product.name, product.brand, product.category]
                    .some(value => value?.toLocaleLowerCase().includes(query));
                const matchesCategory = !category || product.category?.trim().toLocaleLowerCase() === category.toLocaleLowerCase();
                return matchesSearch && matchesCategory;
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case "name-desc": return (b.name || "").localeCompare(a.name || "");
                    case "category-asc": return (a.category || "").localeCompare(b.category || "") || (a.name || "").localeCompare(b.name || "");
                    case "price-asc": return Number(a.price || 0) - Number(b.price || 0);
                    case "price-desc": return Number(b.price || 0) - Number(a.price || 0);
                    case "stock-asc": return Number(a.stockQuantity || 0) - Number(b.stockQuantity || 0);
                    default: return (a.name || "").localeCompare(b.name || "");
                }
            });
    }, [data, search, category, sortBy]);

    const handleDelete = (id) => {
        if (window.confirm("CONFIRM DELETION: This action will permanently remove the item from inventory and customer wishlists.")) {
            deleteProduct(id);
        }
    };

    const getStockBadge = (quantity) => {
        const baseStyle = { borderRadius: '0px', letterSpacing: '1px', fontWeight: '900', fontSize: '10px' };
        if (quantity > 10) return <Badge style={baseStyle} bg="dark">IN STOCK [{quantity}]</Badge>;
        if (quantity > 0) return <Badge style={baseStyle} bg="secondary">LOW STOCK [{quantity}]</Badge>;
        return <Badge style={baseStyle} bg="danger">OUT OF STOCK</Badge>;
    };

    return (
        <div className="admin-inventory-container">
            <div className="d-flex justify-content-between align-items-end border-bottom border-dark pb-3 mb-4">
                <h3 className="fw-black text-uppercase mb-0 Oswald-font" style={{ letterSpacing: '1px' }}>
                    Inventory
                </h3>
                <Link to="/add_product" className="btn btn-dark fw-black text-uppercase rounded-0 px-4 py-2 Oswald-font" style={{ fontSize: '12px', letterSpacing: '1px' }}>
                    <i className="bi bi-plus-lg me-2"></i>New Entry
                </Link>
            </div>

            <div className="row g-2 align-items-end mb-3">
                <div className="col-12 col-md-5">
                    <label htmlFor="inventory-search" className="form-label small fw-bold text-uppercase Oswald-font">Search products</label>
                    <div className="input-group">
                        <span className="input-group-text bg-white border-dark rounded-0"><i className="bi bi-search" /></span>
                        <input id="inventory-search" type="search" className="form-control border-dark rounded-0" placeholder="Name, brand, or category" value={search} onChange={event => setSearch(event.target.value)} />
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <label htmlFor="inventory-category" className="form-label small fw-bold text-uppercase Oswald-font">Category</label>
                    <select id="inventory-category" className="form-select border-dark rounded-0" value={category} onChange={event => setCategory(event.target.value)}>
                        <option value="">All categories</option>
                        {categories.map(item => <option key={item} value={item}>{item}</option>)}
                    </select>
                </div>
                <div className="col-6 col-md-4">
                    <label htmlFor="inventory-sort" className="form-label small fw-bold text-uppercase Oswald-font">Sort by</label>
                    <select id="inventory-sort" className="form-select border-dark rounded-0" value={sortBy} onChange={event => setSortBy(event.target.value)}>
                        <option value="name-asc">Name: A to Z</option>
                        <option value="name-desc">Name: Z to A</option>
                        <option value="category-asc">Category</option>
                        <option value="price-asc">Price: low to high</option>
                        <option value="price-desc">Price: high to low</option>
                        <option value="stock-asc">Stock: low to high</option>
                    </select>
                </div>
                <div className="col-12 d-flex justify-content-between align-items-center pt-1">
                    <small className="text-muted">Showing {visibleProducts.length} of {data.length} products</small>
                    {(search || category) && <button type="button" className="btn btn-link btn-sm text-dark p-0" onClick={() => { setSearch(""); setCategory(""); }}>Clear filters</button>}
                </div>
            </div>

            <div className="border border-dark bg-white">
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-dark text-white">
                        <tr className="Oswald-font small text-uppercase" style={{ letterSpacing: '1px' }}>
                            <th className="ps-4 py-3 border-0">Product Details</th>
                            <th className="border-0">Category</th>
                            <th className="border-0">Price</th>
                            <th className="border-0">Offer</th>
                            <th className="border-0">Availability</th>
                            <th className="text-center border-0 pe-4">Manage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleProducts.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-5 text-muted fw-bold text-uppercase Oswald-font">No products match these filters.</td>
                            </tr>
                        ) : visibleProducts.map((product) => (
                            <tr key={product.id} className="border-bottom border-light">
                                <td className="ps-4">
                                    <div className="d-flex align-items-center py-2">
                                        <div className="border border-dark p-1 me-3 bg-light">
                                            <img 
                                                src={product.imageUrl || unplugged}
                                                alt={product.name} 
                                                style={{ width: '50px', height: '50px', objectFit: 'contain' }} 
                                            />
                                        </div>
                                        <div className="d-flex flex-column">
                                            <span className="fw-black text-uppercase Oswald-font" style={{ fontSize: '14px' }}>{product.name}</span>
                                            <span className="text-muted text-uppercase fw-bold" style={{ fontSize: '10px', letterSpacing: '1px' }}>{product.brand}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className="text-uppercase fw-bold small Oswald-font" style={{ letterSpacing: '0.5px' }}>{product.category}</span>
                                </td>
                                <td>
                                    <span className="fw-black Oswald-font">₹{product.price}</span>
                                </td>
                                <td><Badge bg={Number(product.discountPercentage) > 0 ? "danger" : "secondary"}>{Number(product.discountPercentage || 0)}% OFF</Badge></td>
                                <td>
                                    {getStockBadge(product.stockQuantity)}
                                </td>
                                <td className="pe-4">
                                    <div className="d-flex justify-content-center gap-2">
                                        <Link 
                                            to={`/product/update/${product.id}`} 
                                            className="btn btn-sm btn-outline-dark rounded-0 border-2 fw-black p-2 d-flex align-items-center justify-content-center"
                                            style={{ width: '35px', height: '35px' }}
                                        >
                                            <i className="bi bi-pencil"></i>
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(product.id)} 
                                            className="btn btn-sm btn-dark rounded-0 p-2 d-flex align-items-center justify-content-center"
                                            style={{ width: '35px', height: '35px' }}
                                        >
                                            <i className="bi bi-trash3"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            <style>{`
                .fw-black { font-weight: 900 !important; }
                .Oswald-font { font-family: 'Oswald', sans-serif; }
                .table-hover tbody tr:hover {
                    background-color: #f8f9fa !important;
                }
                .btn-outline-dark:hover {
                    background-color: #000 !important;
                    color: #fff !important;
                }
            `}</style>
        </div>
    );
};

export default AdminProducts;
