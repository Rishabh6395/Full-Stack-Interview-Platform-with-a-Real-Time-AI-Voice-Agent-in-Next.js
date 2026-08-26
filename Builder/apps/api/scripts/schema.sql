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