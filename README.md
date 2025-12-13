# 🛒 ECOM-WEB – Full Stack E-Commerce Web Application

ECOM-WEB is a full-stack e-commerce web application built using **React + Vite** for the frontend and **Spring Boot** for the backend.  
Both frontend and backend are managed and run inside **VS Code**, following a clean and scalable project structure.

---

## 📌 Project Overview

This project demonstrates a real-world **full-stack web application architecture**:
- Frontend handles UI and user interactions
- Backend exposes REST APIs and business logic
- MySQL is used for persistent data storage
- Frontend and backend communicate using **JSON-based REST APIs**

---

## 🧱 Tech Stack

### Frontend
- React
- Vite
- Bootstrap
- HTML5
- CSS3
- JavaScript (ES6+)
- ESLint
- Hot Module Replacement (HMR)

**Vite Plugins**
- `@vitejs/plugin-react` (Babel – Fast Refresh)
- OR `@vitejs/plugin-react-swc` (SWC – Fast Refresh)

---

### Backend
- Java
- Spring Boot
- REST API
- Maven

---

### Database
- MySQL

---

## 📁 Project Structure


---

## ⚙️ How to Run the Project

### ▶ Database Setup (MySQL)

1. Start MySQL server
2. Create database:
```sql
CREATE DATABASE ecom_web;

Open terminal and navigate:
cd backend

Configure application.properties:
spring.datasource.url=jdbc:mysql://localhost:3306/ecom_web
spring.datasource.username=your_username
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

## Run backend
mvn spring-boot:run

## ▶ Frontend (React + Vite)
cd frontend
npm install
npm run dev

Sample REST Endpoints
GET    /api/products
POST   /api/products
PUT    /api/products/{id}
DELETE /api/products/{id}
