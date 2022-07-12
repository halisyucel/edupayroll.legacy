import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/pool';

const edit = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		await pool.query(
			`
			UPDATE teachers
			SET name = ?, branch = ?, information = ?, identity_number = ?
			WHERE id = ?
		`,
			[
				req.body.name,
				req.body.branch,
				req.body.information,
				req.body.identity_number,
				req.body.id,
			],
		);
		res.status(200).json({ status: 'success' });
	} catch (err) {
		res.status(500).json({ status: 'error' });
	}
};

export default edit;
