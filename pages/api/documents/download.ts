import { generateFiles } from '../../../lib/document';
import pool from '../../../lib/pool';
import { auth } from '../../../utils/auth';
import { CourseCodes } from '../../../utils/documents';
import { School } from '../school/get';
import { NextApiRequest, NextApiResponse } from 'next';

export interface Row {
	id: number;
	documentID: number;
	teacherID: number;
	courseCode: number;
	teacherIdentityNumber: string;
	teacherName: string;
	teacherBranch: string;
	teacherInformation: string;
	days: string;
}

const download = async (req: NextApiRequest, res: NextApiResponse) => {
	if (!(await auth(req))) return res.status(401).json({ message: 'Unauthorized' });
	// verify
	const [documentRowsResult] = await pool.query(
		`
			SELECT
				document_rows.id as id,
				document_rows.documentID,
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
		[parseInt(req.body.id as string)],
	);

	const documentRows: Row[] = JSON.parse(JSON.stringify(documentRowsResult));

	for (let i = 0; i < documentRows.length; i++) {
		const row = documentRows[i];
		if (row.teacherID === null)
			return res.status(400).json({
				message: `${i + 1}.satırda öğretmen seçilmediğinden dosyalar hazırlanamadı.`,
			});
		if (row.courseCode === null)
			return res.status(400).json({
				message: `${i + 1}.satırda ek ders tipi seçilmediğinden dosyalar hazırlanamadı.`,
			});
	}

	const [teachersResult] = await pool.query(
		`
			SELECT DISTINCT teacherID, teachers.name as teacherName
			FROM document_rows
			INNER JOIN teachers ON document_rows.teacherID = teachers.id
			WHERE documentID = ? and teacherID IS NOT NULL
		`,
		[parseInt(req.body.id as string)],
	);

	const teachers: { teacherID: number; teacherName: string }[] = JSON.parse(
		JSON.stringify(teachersResult),
	);

	for (const teacher of teachers) {
		const [duplicateResult] = await pool.query(
			`
				SELECT courseCode, COUNT(*) numberOfDuplicates
				FROM document_rows WHERE teacherID = ? and documentID = ?
				GROUP BY courseCode HAVING numberOfDuplicates > 1
			`,
			[teacher.teacherID, parseInt(req.body.id as string)],
		);
		const duplicates: { courseCode: number; numberOfDuplicates: number }[] = JSON.parse(
			JSON.stringify(duplicateResult),
		);
		if (duplicates.length > 0) {
			for (const duplicate of duplicates) {
				const courseCodeText = CourseCodes.find(
					(c) => c.value === duplicate.courseCode,
				)?.label;
				return res.status(400).json({
					message: `"${teacher.teacherName}" adlı öğretmenin "${courseCodeText}" ek dersi ${duplicate.numberOfDuplicates} kez eklenmiş.`,
				});
			}
		}
	}

	// generate files
	const [schoolResult] = await pool.query(`SELECT * FROM school_information WHERE id = 1`);
	const school: School = JSON.parse(JSON.stringify(schoolResult))[0];
	const [documentResult] = await pool.query('SELECT * FROM documents WHERE id = ?', [
		parseInt(req.body.id as string),
	]);
	const documentData = JSON.parse(JSON.stringify(documentResult))[0];
	const links = await generateFiles({
		month: documentData.month,
		year: documentData.year,
		school,
		documentRows,
	});

	res.status(200).json(links);
};

export default download;
