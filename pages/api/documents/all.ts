import pool from '../../../lib/pool';
import { auth } from '../../../utils/auth';
import { NextApiRequest, NextApiResponse } from 'next';

const all = async (req: NextApiRequest, res: NextApiResponse) => {
	if (!(await auth(req))) return res.status(401).json({ message: 'Unauthorized' });
	const [rows] = await pool.query(`
		SELECT * FROM documents ORDER BY id DESC
	`);
	res.status(200).json(rows);
};

export default all;
