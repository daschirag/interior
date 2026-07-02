ADMIN CMS

1. Authentication
   - Admin Login

2. Dashboard
   - Total Projects
   - Total Services
   - Total Leads
   - Recent Leads

3. Projects
   - Add Project
   - Edit Project
   - Delete Project
   - View Projects

4. Services
   - Add Service
   - Edit Service
   - Delete Service
   - View Services

5. Materials
   - Add Material
   - Edit Material
   - Delete Material

6. Leads
   - View Leads
   - Change Status
   - Delete Lead

7. Settings
   - Phone
   - Email
   - Social Links
   - Catalog Links

  
  
  
 DATABASE TABLES

1. users
2. projects
3. materials
4. room_showcase
5. leads
6. settings
7. site_statistics

# Backend Architecture

## 1. Authentication

- Admin Login
- JWT Authentication
- Protected Routes

---

## 2. Dashboard

- Total Projects
- Total Services
- Total Leads
- Recent Leads

---

## 3. Projects

Features:
- Add Project
- Edit Project
- Delete Project
- View Projects

Fields:
- title
- type
- city
- year
- description
- cover_image
- before_image
- after_image

Tables:
- projects
- project_images
- project_tags

---

## 4. Services

Features:
- Add Service
- Edit Service
- Delete Service
- View Services

Fields:
- title
- description
- image_url

---

## 5. Materials

Features:
- Add Material
- Edit Material
- Delete Material
- View Materials

Fields:
- name
- type
- image_url

---

## 6. Leads

Features:
- View Leads
- Delete Leads

Fields:
- name
- email
- phone
- message
- created_at

---

## 7. Settings

Fields:
- phone
- email
- youtube_url
- facebook_url
- instagram_url

---

## Tech Stack

Frontend:
- React + Vite

Backend:
- Node.js
- Express.js

Database:
- PostgreSQL (Supabase)

Storage:
- Cloudinary

Hosting:
- Render


#Database Design

Tables

1. users
2. projects
3. project_images
4. project_tags
5. services
6. materials
7. leads
8. settings