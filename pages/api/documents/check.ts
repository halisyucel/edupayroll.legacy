import pool from '../../../lib/pool';
import { Row } from '../../../utils/documents';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

const check = async (req: NextApiRequest, res: NextApiResponse) => {
	if (!req.query.token) return res.status(401).json({ message: 'Unauthorized' });
	try {
		const d = jwt.verify(req.query.token as string, process.env.JWT_SECRET as string);
	} catch (err) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	const [documentRowsResult] = await pool.query(
		`
			SELECT
				document_rows.id as id,
				document_rows.teacherID,
				teachers.identity_number as teacherIdentityNumber,
				teachers.name as teacherName,
				teachers.branch as teacherBranch,
				teachers.information as teacherInformation,
				document_rows.courseCode,
				document_rows.days
			FROM document_rows
			LEFT JOIN teachers ON document_rows.teacherID = teachers.id
			WHERE documentID = ?
			ORDER BY teachers.name IS NULL, teachers.name, courseCode IS NULL, courseCode
		`,
		[parseInt(req.query.id as string)],
	);

	const documentRows: Row[] = JSON.parse(JSON.stringify(documentRowsResult));

	for (let i = 0; i < documentRows.length; i++) {
		if (documentRows[i].teacherID === null)
			return res.json({
				check: false,
				line: i + 1,
				cause: 'teacher',
			});
		if (documentRows[i].courseCode === null)
			return res.json({
				check: false,
				line: i + 1,
				cause: 'course',
			});
	}

	return res.json({ check: true });
};

export default check;
