import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/pool';

const all = async (req: NextApiRequest, res: NextApiResponse) => {
	const [rows] = await pool.query(`
		SELECT * FROM teachers ORDER BY id DESC
	`);
	res.status(200).json(rows);
};

export default all;
