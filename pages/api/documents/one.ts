import pool from '../../../lib/pool';
import { auth } from '../../../utils/auth';
import { RowDataPacket } from 'mysql2';
import { NextApiRequest, NextApiResponse } from 'next';

const one = async (req: NextApiRequest, res: NextApiResponse) => {
	if (!(await auth(req))) return res.status(401).json({ message: 'Unauthorized' });
	const [rows] = await pool.query(`SELECT * FROM documents WHERE id = ?`, [req.query.id]);
	if ((rows as RowDataPacket[]).length === 0) return res.status(404).json({ status: 'error' });
	res.status(200).json((rows as RowDataPacket[])[0]);
};

export default one;
