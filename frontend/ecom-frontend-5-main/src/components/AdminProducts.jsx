import React, { useContext } from 'react';
import AppContext from "../Context/Context";
import { Link } from "react-router-dom";
import unplugged from "../assets/unplugged.png";
import { Table, Badge } from 'react-bootstrap';

const AdminProducts = () => {
    const { data, deleteProduct } = useContext(AppContext);

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

            <div className="border border-dark bg-white">
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-dark text-white">
                        <tr className="Oswald-font small text-uppercase" style={{ letterSpacing: '1px' }}>
                            <th className="ps-4 py-3 border-0">Product Details</th>
                            <th className="border-0">Category</th>
                            <th className="border-0">Price</th>
                            <th className="border-0">Availability</th>
                            <th className="text-center border-0 pe-4">Manage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((product) => (
                            <tr key={product.id} className="border-bottom border-light">
                                <td className="ps-4">
                                    <div className="d-flex align-items-center py-2">
                                        <div className="border border-dark p-1 me-3 bg-light">
                                            <img 
                                                src={product.imageData ? `data:${product.imageType};base64,${product.imageData}` : unplugged} 
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