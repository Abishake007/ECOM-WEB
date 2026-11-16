import React, { useEffect, useMemo, useState, useContext } from "react";
import { Spinner } from "react-bootstrap";
import API from "../axios";
import AppContext from "../Context/Context";

const currency = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const isRevenueOrder = (order) => (order.status || "").toLocaleLowerCase() !== "cancelled";

const AdminOverview = () => {
  const { data: products } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    API.get("/admin/orders")
      .then(response => setOrders(Array.isArray(response.data) ? response.data : []))
      .catch(error => {
        console.error("Error loading dashboard orders:", error);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const monthlyRevenue = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleDateString(undefined, { month: "short" }),
        revenue: 0,
      };
    });
    const monthIndex = new Map(months.map((month, index) => [month.key, index]));

    orders.filter(isRevenueOrder).forEach(order => {
      const date = new Date(order.orderDate);
      if (Number.isNaN(date.getTime())) return;
      const index = monthIndex.get(`${date.getFullYear()}-${date.getMonth()}`);
      if (index !== undefined) months[index].revenue += Number(order.totalAmount) || 0;
    });
    return months;
  }, [orders]);

  const statuses = useMemo(() => {
    const counts = new Map();
    orders.forEach(order => {
      const status = (order.status || "Processing").trim();
      const key = status.toLocaleLowerCase();
      const current = counts.get(key) || { label: status, count: 0 };
      current.count += 1;
      counts.set(key, current);
    });
    return [...counts.values()].sort((a, b) => b.count - a.count);
  }, [orders]);

  const maxRevenue = Math.max(...monthlyRevenue.map(month => month.revenue), 1);
  const totalRevenue = orders.filter(isRevenueOrder).reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
  const lowStockCount = products.filter(product => Number(product.stockQuantity) <= 10).length;

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" variant="dark" /><p className="mt-3 small fw-bold text-uppercase">Loading dashboard data…</p></div>;
  }

  return (
    <section className="admin-overview">
      <div className="d-flex justify-content-between align-items-end border-bottom border-dark pb-3 mb-4">
        <div>
          <h2 className="fw-black text-uppercase mb-1 Oswald-font">Store Overview</h2>
          <p className="mb-0 text-muted small">A snapshot of sales and inventory performance.</p>
        </div>
        <span className="small text-muted">Last 6 months</span>
      </div>

      {loadError && <div className="alert alert-warning rounded-0">Order data could not be loaded. Sales charts may be incomplete.</div>}

      <div className="row g-3 mb-4">
        <Metric label="Total Revenue" value={currency(totalRevenue)} icon="bi-currency-rupee" />
        <Metric label="Total Orders" value={orders.length.toLocaleString()} icon="bi-bag-check" />
        <Metric label="Products" value={products.length.toLocaleString()} icon="bi-box-seam" />
        <Metric label="Low Stock" value={lowStockCount.toLocaleString()} icon="bi-exclamation-triangle" />
      </div>

      <div className="row g-4">
        <div className="col-12">
          <div className="admin-chart-card h-100">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h3 className="h5 fw-black text-uppercase Oswald-font mb-1">Monthly Revenue</h3>
                <p className="small text-muted mb-0">Revenue by order date</p>
              </div>
              <i className="bi bi-bar-chart-line fs-4" aria-hidden="true" />
            </div>
            <div className="revenue-chart" role="img" aria-label={`Monthly revenue chart: ${monthlyRevenue.map(m => `${m.label} ${currency(m.revenue)}`).join(", ")}`}>
              {monthlyRevenue.map(month => (
                <div className="revenue-chart-column" key={month.key}>
                  <span className="revenue-chart-value">{currency(month.revenue)}</span>
                  <div className="revenue-chart-track">
                    <div className="revenue-chart-bar" style={{ height: `${Math.max(month.revenue ? (month.revenue / maxRevenue) * 100 : 0, month.revenue ? 5 : 0)}%` }} />
                  </div>
                  <span className="revenue-chart-label">{month.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="admin-chart-card">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h3 className="h5 fw-black text-uppercase Oswald-font mb-1">Order Status</h3>
                <p className="small text-muted mb-0">Current order distribution</p>
              </div>
              <i className="bi bi-pie-chart fs-4" aria-hidden="true" />
            </div>
            {statuses.length === 0 ? <p className="text-muted mb-0">No order data to display yet.</p> : (
              <div className="status-chart">
                {statuses.map(({ label, count }) => (
                  <div className="status-chart-row" key={label.toLocaleLowerCase()}>
                    <div className="d-flex justify-content-between small fw-bold text-uppercase mb-2">
                      <span>{label}</span><span>{count} <span className="text-muted">/ {orders.length}</span></span>
                    </div>
                    <div className="status-chart-track"><div className="status-chart-bar" style={{ width: `${(count / orders.length) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const Metric = ({ label, value, icon }) => (
  <div className="col-6 col-xl-3">
    <div className="admin-metric-card h-100">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <span className="admin-metric-label">{label}</span>
        <i className={`bi ${icon} fs-5`} aria-hidden="true" />
      </div>
      <div className="admin-metric-value">{value}</div>
    </div>
  </div>
);

export default AdminOverview;
