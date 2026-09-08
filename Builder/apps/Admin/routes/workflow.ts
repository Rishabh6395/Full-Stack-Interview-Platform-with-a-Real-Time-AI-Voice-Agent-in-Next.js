import express from 'express';
// import db from '../db/db.js';
import db from "@repo/db";

const router = express.Router();


router.post('/admin/v1/create-workflow', async (req, res) => {
    const {workflowName, WorkflowID, Status, CreatedBy, ModifiedBy} = req.body;

    try {
        const queryText = 'INSERT INTO workflows (workflow_name, WorkflowID, Status, CreatedBy, ModifiedBy) VALUES ($1, $2, $3, $4, $5) RETURNING *';
        const result = await db.query(queryText, [workflowName, WorkflowID, Status, CreatedBy, ModifiedBy]);
        res.json(result.rows[0]); // pg returns rows as a flat array of objects
        console.log(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database Error');
    }
})


export default router;