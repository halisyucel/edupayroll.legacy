import pool from '../../../../lib/pool';
import { auth } from '../../../../utils/auth';
import { NextApiRequest, NextApiResponse } from 'next';

const right = async (req: NextApiRequest, res: NextApiResponse) => {
	if (!(await auth(req))) return res.status(401).json({ message: 'Unauthorized' });
	try {
		await pool.query(
			`
			UPDATE document_rows
			SET days = ?
			WHERE id = ?
		`,
			[JSON.stringify(req.body.days.map((i: number) => i === null ? 0 : i)), req.body.id],
		);
		res.status(200).json({ status: 'success' });
	} catch (err) {
		res.status(500).json({ status: 'error' });
	}
};

export default right;
