import express from 'express';
import db from '@repo/db';
import { authenticate, requireAdmin } from '@repo/auth';

const router = express.Router();

router.post('/builder/createComponents', authenticate, async(req, res) =>{
    try {
        const {name, componentDescription, componentType, formId } = req.body;

        const checkForm = await db.query('SELECT * FROM forms WHERE id = $1', [formId]);
        if (checkForm.rows.length === 0) {
            return res.status(404).json({ error: 'Form does not exist.' });
        }

        const newComponent = await db.query(
            "INSERT INTO form_components (name, component_description, component_type, form_id) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, componentDescription, componentType, formId]
        )
        res.status(201).json({ success: true, data: newComponent.rows[0] });

    } catch (error:any) {
        console.error(error.message);
        res.status(500).send('Server Error, check server logs');        
    }
})

export default router;