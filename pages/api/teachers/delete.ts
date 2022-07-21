import pool from '../../../lib/pool';
import { auth } from '../../../utils/auth';
import { NextApiRequest, NextApiResponse } from 'next';

const _delete = async (req: NextApiRequest, res: NextApiResponse) => {
	if (!(await auth(req))) return res.status(401).json({ message: 'Unauthorized' });
	try {
		await pool.query(`DELETE FROM teachers WHERE id = ?`, [req.query.id]);
		await pool.query(`DELETE FROM document_rows WHERE teacherID = ?`, [req.query.id]);
		res.status(200).json({ status: 'success' });
	} catch (err) {
		res.status(500).json({ status: 'error' });
	}
};

export default _delete;
