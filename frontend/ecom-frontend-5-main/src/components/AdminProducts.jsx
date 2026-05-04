import React, { useContext } from 'react';
import AppContext from "../Context/Context";
import { Link } from "react-router-dom";
import unplugged from "../assets/unplugged.png";
import { Table, Button, Badge, Card } from 'react-bootstrap';

const AdminProducts = () => {
    const { data, deleteProduct } = useContext(AppContext);

    const handleDelete = (id) => {
        // Confirmation dialog remains a standard safety feature for IT management portals
        if (window.confirm("Are you sure you want to delete this product? This will also remove it from customer wishlists.")) {
            deleteProduct(id);
        }
    };

    return (
        <div className="admin-inventory-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold mb-0">Inventory Management</h3>
                <Link to="/add_product" className="btn btn-primary rounded-pill px-4">
                    <i className="bi bi-plus-lg me-2"></i>New Product
                </Link>
            </div>

            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="table-light">
                        <tr className="text-muted small text-uppercase">
                            <th className="ps-4">Product</th>
                            <th>Brand</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock Level</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((product) => (
                            <tr key={product.id}>
                                <td className="ps-4">
                                    <div className="d-flex align-items-center">
                                        <img 
                                            src={product.imageData ? `data:${product.imageType};base64,${product.imageData}` : unplugged} 
                                            alt={product.name} 
                                            className="rounded-3 border me-3"
                                            style={{ width: '45px', height: '45px', objectFit: 'contain', backgroundColor: '#f8f9fa' }} 
                                        />
                                        <span className="fw-bold text-dark">{product.name}</span>
                                    </div>
                                </td>
                                <td><span className="text-muted">{product.brand}</span></td>
                                <td>
                                    <Badge bg="light" text="dark" className="border fw-normal">
                                        {product.category}
                                    </Badge>
                                </td>
                                <td className="fw-bold">${product.price}</td>
                                <td>
                                    {product.stockQuantity > 10 ? (
                                        <Badge pill bg="success-subtle" className="text-success border border-success-subtle px-3">
                                            {product.stockQuantity} In Stock
                                        </Badge>
                                    ) : product.stockQuantity > 0 ? (
                                        <Badge pill bg="warning-subtle" className="text-warning-emphasis border border-warning-subtle px-3">
                                            {product.stockQuantity} Low Stock
                                        </Badge>
                                    ) : (
                                        <Badge pill bg="danger-subtle" className="text-danger border border-danger-subtle px-3">
                                            Out of Stock
                                        </Badge>
                                    )}
                                </td>
                                <td>
                                    <div className="d-flex justify-content-center gap-2">
                                        <Link 
                                            to={`/product/update/${product.id}`} 
                                            className="btn btn-sm btn-outline-primary rounded-circle p-2 d-flex align-items-center justify-content-center"
                                            style={{ width: '35px', height: '35px' }}
                                            title="Edit Product"
                                        >
                                            <i className="bi bi-pencil-square"></i>
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(product.id)} 
                                            className="btn btn-sm btn-outline-danger rounded-circle p-2 d-flex align-items-center justify-content-center"
                                            style={{ width: '35px', height: '35px' }}
                                            title="Delete Product"
                                        >
                                            <i className="bi bi-trash3"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
        </div>
    );
};

export default AdminProducts;