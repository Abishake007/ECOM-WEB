import React, { useContext, useMemo, useState } from "react";
import { Form } from "react-bootstrap";
import AppContext from "../Context/Context";

const NEW_CATEGORY = "__create_new_category__";

const CategoryField = ({ value, onChange, label = "Category" }) => {
  const { data } = useContext(AppContext);
  const [creating, setCreating] = useState(false);
  const categories = useMemo(() => {
    const values = new Map();
    (data || []).forEach(product => {
      const category = product.category?.trim();
      if (category) values.set(category.toLocaleLowerCase(), category);
    });
    const current = value?.trim();
    if (current && !creating && !values.has(current.toLocaleLowerCase())) {
      values.set(current.toLocaleLowerCase(), current);
    }
    return [...values.values()].sort((a, b) => a.localeCompare(b));
  }, [data, value, creating]);

  const handleSelect = (event) => {
    if (event.target.value === NEW_CATEGORY) {
      setCreating(true);
      onChange("");
      return;
    }
    setCreating(false);
    onChange(event.target.value);
  };

  return (
    <Form.Group className="mb-4">
      <Form.Label className="Oswald-font fw-bold text-uppercase small">{label}</Form.Label>
      <Form.Select
        className="rounded-0 border-dark shadow-none py-2"
        value={creating ? NEW_CATEGORY : value || ""}
        onChange={handleSelect}
      >
        <option value="">SELECT CATEGORY</option>
        {categories.map(category => <option key={category} value={category}>{category}</option>)}
        <option value={NEW_CATEGORY}>+ CREATE NEW CATEGORY</option>
      </Form.Select>
      {creating && <Form.Control
        className="rounded-0 border-dark shadow-none py-2 mt-2"
        value={value || ""}
        onChange={event => onChange(event.target.value)}
        placeholder="Enter the new category name"
        maxLength={100}
        autoFocus
        required
        aria-label="New category name"
      />}
    </Form.Group>
  );
};

export default CategoryField;
