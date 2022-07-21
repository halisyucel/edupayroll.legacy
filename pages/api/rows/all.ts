import pool from '../../../lib/pool';
import { auth } from '../../../utils/auth';
import { NextApiRequest, NextApiResponse } from 'next';

const all = async (req: NextApiRequest, res: NextApiResponse) => {
	if (!(await auth(req))) return res.status(401).json({ message: 'Unauthorized' });
	const [rows] = await pool.query(
		`
			SELECT
				document_rows.id as id,
				document_rows.documentID,
				document_rows.teacherID,
				document_rows.courseCode,
				document_rows.days
			FROM document_rows
			LEFT JOIN teachers ON document_rows.teacherID = teachers.id
			WHERE documentID = ?
			ORDER BY teachers.name IS NULL, teachers.name, courseCode IS NULL, courseCode
		`,
		[parseInt(req.query.documentID as string)],
	);
	const result = JSON.parse(JSON.stringify(rows));
	res.status(200).json(
		result.map((row: any) => ({
			...row,
			days: JSON.parse(row.days),
		})),
	);
};

export default all;
