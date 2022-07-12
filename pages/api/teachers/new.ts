import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/pool';

const _new = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		await pool.query(
			`
			INSERT INTO teachers (
				name,
				branch,
				information,
				identity_number
			) VALUES (?, ?, ?, ?)
		`,
			[req.body.name, req.body.branch, req.body.information, req.body.identity_number],
		);
		res.status(200).json({ status: 'success' });
	} catch (err) {
		res.status(500).json({ status: 'error' });
	}
};

export default _new;
