import pool from '../../../lib/pool';
import { auth } from '../../../utils/auth';
import { ResultSetHeader } from 'mysql2';
import { NextApiRequest, NextApiResponse } from 'next';

const _new = async (req: NextApiRequest, res: NextApiResponse) => {
	if (!(await auth(req))) return res.status(401).json({ message: 'Unauthorized' });
	try {
		const days: number[] = [];
		for (let i = 1; i <= 31; i++) days.push(0);
		const [result] = await pool.query(
			`INSERT INTO document_rows (documentID, days) VALUES (?, ?)`,
			[req.body.documentID, JSON.stringify(days)],
		);
		res.status(200).json({
			status: 'success',
			data: {
				id: (result as ResultSetHeader).insertId,
				documentID: req.body.documentID,
				teacherID: null,
				courseCode: null,
				days,
			},
		});
	} catch (err) {
		res.status(500).json({ status: 'error' });
	}
};

export default _new;
