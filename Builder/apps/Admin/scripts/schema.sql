-- 1. Forms Table: Stores the structure of the custom form
CREATE TABLE forms (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    config JSONB NOT NULL, -- Stores fields, types, validations, and UI layout
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Form Submissions: Stores actual data submitted by users
CREATE TABLE form_submissions (
    id SERIAL PRIMARY KEY,
    form_id INT REFERENCES forms(id) ON DELETE CASCADE,
    data JSONB NOT NULL, -- Stores the actual key-value answers
    status VARCHAR(50) DEFAULT 'pending', -- Links to workflows
    submitted_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Workflows Table: Defines the stages and actions
CREATE TABLE workflows (
    id SERIAL PRIMARY KEY,
    form_id INT REFERENCES forms(id),
    steps JSONB NOT NULL -- Define transition paths, e.g., Pending -> Approved
);

-- 4. Users Table: Stores user information
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. User Roles Table: Assigns roles to users
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES employees(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL
);

-- 6. User Permissions Table: Assigns permissions to users
CREATE TABLE user_permissions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES employees(id) ON DELETE CASCADE,
    permission VARCHAR(50) NOT NULL
);

CREATE TABLE ROLES (
    id SERIAL PRIMARY KEY,
    roleName VARCHAR(50) NOT NULL,
    roleDescription VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)