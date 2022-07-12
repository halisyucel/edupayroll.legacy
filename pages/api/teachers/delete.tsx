import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/pool';

const _delete = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		await pool.query(`DELETE FROM teachers WHERE id = ?`, [req.query.id]);
		res.status(200).json({ status: 'success' });
	} catch (err) {
		res.status(500).json({ status: 'error' });
	}
};

export default _delete;
