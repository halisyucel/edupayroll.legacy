import pool from '../../../lib/pool';
import {
	CourseCodes,
	distinctCourseCodes,
	getDaysInMonth,
	getTotalDays,
	getTotalRows,
	isWeekend,
	MonthData,
	regenerateTwoDigitMonth,
	Row,
} from '../../../utils/documents';
import { School } from '../school/get';
import ExcelJS from 'exceljs';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

const download = async (req: NextApiRequest, res: NextApiResponse) => {
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
		[parseInt(req.query.id as string)],
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
		[parseInt(req.query.id as string)],
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
			[teacher.teacherID, parseInt(req.query.id as string)],
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
		parseInt(req.query.id as string),
	]);
	const documentData = JSON.parse(JSON.stringify(documentResult))[0];

	const numberOfDays = getDaysInMonth(documentData.month, documentData.year);

	if (req.query.f === '1') {
		const kbsFile = new ExcelJS.Workbook();
		const kbsSheet = kbsFile.addWorksheet('KBS');
		const firstRow = ['TCKN', 'Veri Tip'];
		for (let i = 1; i <= numberOfDays; i++) firstRow.push(`Gun${i}`);
		kbsSheet.addRow(firstRow);
		for (const row of documentRows) {
			const rowKbsData = [
				row.teacherIdentityNumber.toString(),
				row.courseCode.toString().slice(0, 3),
			];
			const rowDays = JSON.parse(row.days);
			console.log(rowDays);
			console.log(rowDays.length);
			
			for (let i = 0; i < numberOfDays; i++) {
				rowKbsData.push(rowDays[i].toString());
			}
			kbsSheet.addRow(rowKbsData);
		}
		const buffer = await kbsFile.xlsx.writeBuffer();

		res.setHeader(
			'Content-Type',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		);
		res.setHeader(
			'Content-Disposition',
			`attachment; filename="KBS-${documentData.month + 1}-${documentData.year}-${Math.floor(
				Math.random() * 100000,
			)}.xlsx"`,
		);
		res.send(buffer);
	}
	if (req.query.f === '2') {
		const usedCourseCodes = distinctCourseCodes(documentRows);
		const filesForPrint = new ExcelJS.Workbook();
		for (const courseCode of usedCourseCodes) {
			const courseText = CourseCodes.find((c) => c.value === courseCode)?.label;
			const sheet = filesForPrint.addWorksheet(`${courseText}`, {
				views: [{ zoomScale: 90, activeCell: 'A100' }],
			});

			sheet.getRow(1).font = { size: 20, underline: true, bold: true };
			sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
			sheet.getRow(1).getCell(3).value = 'EK DERS ÜCRET ÇİZELGESİ';
			sheet.mergeCells(1, 3, 1, numberOfDays + 2);

			sheet.getRow(2).getCell(1).value = 'Birimi:';
			sheet.getRow(2).getCell(1).font = { size: 12, bold: true };
			sheet.getRow(2).getCell(1).border = {
				top: { style: 'thick' },
				left: { style: 'thick' },
				bottom: { style: 'thin' },
				right: { style: 'thin' },
			};
			sheet.getRow(2).getCell(3).value = school.name;
			sheet.getRow(2).getCell(3).font = { size: 12, italic: true };
			sheet.getRow(2).getCell(3).alignment = { vertical: 'bottom', horizontal: 'left' };
			sheet.getRow(2).getCell(3).border = {
				top: { style: 'thick' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thick' },
			};
			sheet.getRow(2).getCell(5).value = courseText;
			sheet.getRow(2).getCell(5).alignment = { vertical: 'bottom', horizontal: 'center' };
			sheet.getRow(2).getCell(5).font = { size: 16, bold: true };
			sheet.mergeCells(2, 1, 2, 2);
			sheet.mergeCells(2, 3, 2, 4);
			sheet.mergeCells(2, 5, 2, numberOfDays - 8);

			sheet.getRow(3).getCell(1).value = 'Başlama Tarihi:';
			sheet.getRow(3).getCell(1).font = { size: 12, bold: true };
			sheet.getRow(3).getCell(1).border = {
				top: { style: 'thin' },
				left: { style: 'thick' },
				bottom: { style: 'thin' },
				right: { style: 'thin' },
			};
			sheet.getRow(3).getCell(3).value = `01.${regenerateTwoDigitMonth(documentData.month)}.${
				documentData.year
			}`;
			sheet.getRow(3).getCell(3).font = { size: 12, italic: true };
			sheet.getRow(3).getCell(3).alignment = { vertical: 'bottom', horizontal: 'left' };
			sheet.getRow(3).getCell(3).border = {
				top: { style: 'thin' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thick' },
			};
			sheet.getRow(3).getCell(numberOfDays).value = 'Ait Olduğu Ay:';
			sheet.getRow(3).getCell(numberOfDays).font = { size: 12, bold: true };
			sheet.getRow(3).getCell(numberOfDays).border = {
				top: { style: 'thick' },
				left: { style: 'thick' },
				bottom: { style: 'thin' },
				right: { style: 'thin' },
			};
			const monthText = MonthData.find((m) => m.value === documentData.month)?.label;
			sheet.getRow(3).getCell(numberOfDays + 6).value = monthText;
			sheet.getRow(3).getCell(numberOfDays + 6).font = { size: 12, italic: true };
			sheet.getRow(3).getCell(numberOfDays + 6).alignment = {
				vertical: 'bottom',
				horizontal: 'right',
			};
			sheet.getRow(3).getCell(numberOfDays + 6).border = {
				top: { style: 'thick' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thick' },
			};
			sheet.mergeCells(3, 1, 3, 2);
			sheet.mergeCells(3, 3, 3, 4);
			sheet.mergeCells(3, numberOfDays, 3, numberOfDays + 5);

			sheet.getRow(4).getCell(1).value = 'Bitiş Tarihi:';
			sheet.getRow(4).getCell(1).font = { size: 12, bold: true };
			sheet.getRow(4).getCell(1).border = {
				top: { style: 'thin' },
				left: { style: 'thick' },
				bottom: { style: 'thin' },
				right: { style: 'thin' },
			};
			sheet.getRow(4).getCell(3).value = `${numberOfDays}.${regenerateTwoDigitMonth(
				documentData.month,
			)}.${documentData.year}`;
			sheet.getRow(4).getCell(3).font = { size: 12, italic: true };
			sheet.getRow(4).getCell(3).alignment = { vertical: 'bottom', horizontal: 'left' };
			sheet.getRow(4).getCell(3).border = {
				top: { style: 'thin' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thick' },
			};
			sheet.getRow(4).getCell(numberOfDays).value = 'Bütçe Yılı:';
			sheet.getRow(4).getCell(numberOfDays).font = { size: 12, bold: true };
			sheet.getRow(4).getCell(numberOfDays).border = {
				top: { style: 'thin' },
				left: { style: 'thick' },
				bottom: { style: 'thin' },
				right: { style: 'thin' },
			};
			sheet.getRow(4).getCell(numberOfDays + 6).value = documentData.year;
			sheet.getRow(4).getCell(numberOfDays + 6).font = { size: 12, italic: true };
			sheet.getRow(4).getCell(numberOfDays + 6).alignment = {
				vertical: 'bottom',
				horizontal: 'right',
			};
			sheet.getRow(4).getCell(numberOfDays + 6).border = {
				top: { style: 'thin' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thick' },
			};
			sheet.mergeCells(4, 1, 4, 2);
			sheet.mergeCells(4, 3, 4, 4);
			sheet.mergeCells(4, numberOfDays, 4, numberOfDays + 5);

			sheet.getRow(5).font = { size: 12, bold: true };
			sheet.getRow(5).alignment = { vertical: 'bottom', horizontal: 'center' };
			sheet.getRow(5).getCell(1).value = 'ÖĞRETMENİN';
			sheet.getRow(5).getCell(1).border = {
				top: { style: 'thick' },
				left: { style: 'thick' },
				bottom: { style: 'thin' },
				right: { style: 'thin' },
			};
			sheet.mergeCells(5, 1, 5, 5);
			sheet.getRow(5).getCell(6).value = 'GÜNLÜK OKUTULAN EK DERS SAATLERİ';
			sheet.getRow(5).getCell(6).border = {
				top: { style: 'thick' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thin' },
			};
			sheet.getRow(5).getCell(numberOfDays + 6).border = {
				top: { style: 'thick' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thick' },
			};
			sheet.mergeCells(5, 6, 5, numberOfDays + 5);

			sheet.getRow(6).font = { size: 12, bold: true };
			sheet.getRow(6).alignment = { vertical: 'middle', horizontal: 'center' };
			sheet.getRow(6).getCell(1).value = 'Sıra No';
			sheet.getRow(6).getCell(1).alignment = {
				textRotation: 90,
				vertical: 'middle',
				horizontal: 'center',
			};
			sheet.getRow(6).getCell(2).value = 'TC Kimlik No';
			sheet.getRow(6).getCell(3).value = 'Adı Soyadı';
			sheet.getRow(6).getCell(4).value = 'Branşı';
			sheet.getRow(6).getCell(5).value = 'Açıklama';
			for (let i = 1; i <= numberOfDays; i++) {
				sheet.getRow(6).getCell(i + 5).value = i;
				sheet.getRow(6).getCell(i + 5).alignment = {
					vertical: 'bottom',
					horizontal: 'center',
				};
				if (isWeekend(i, documentData.month, documentData.year)) {
					sheet.getRow(6).getCell(i + 5).fill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: { argb: 'B7DEE8' },
					};
				}
			}
			for (let i = 1; i <= numberOfDays + 6; i++) {
				sheet.getRow(6).getCell(i).border = {
					top: { style: 'thin' },
					left: { style: i === 1 ? 'thick' : 'thin' },
					bottom: { style: 'thin' },
					right: { style: i === numberOfDays + 6 ? 'thick' : 'thin' },
				};
			}

			const documentRowsFiltered = documentRows.filter((r) => r.courseCode === courseCode);

			for (let i = 0; i < documentRowsFiltered.length; i++) {
				sheet.getRow(i + 7).font = { size: 12 };
				sheet.getRow(i + 7).alignment = { vertical: 'bottom', horizontal: 'left' };
				sheet.getRow(i + 7).getCell(1).value = i + 1;
				sheet.getRow(i + 7).getCell(1).alignment = { horizontal: 'center' };
				sheet.getRow(i + 7).getCell(2).value = parseInt(
					documentRowsFiltered[i].teacherIdentityNumber,
				);
				sheet.getRow(i + 7).getCell(3).value = documentRowsFiltered[i].teacherName;
				sheet.getRow(i + 7).getCell(4).value = documentRowsFiltered[i].teacherBranch;
				sheet.getRow(i + 7).getCell(5).value = documentRowsFiltered[i].teacherInformation;
				const rowDays = JSON.parse(documentRowsFiltered[i].days);
				for (let j = 0; j < numberOfDays; j++) {
					sheet.getRow(i + 7).getCell(j + 6).value = rowDays[j];
					sheet.getRow(i + 7).getCell(j + 6).alignment = {
						vertical: 'bottom',
						horizontal: 'center',
					};
					if (isWeekend(j + 1, documentData.month, documentData.year)) {
						sheet.getRow(i + 7).getCell(j + 6).fill = {
							type: 'pattern',
							pattern: 'solid',
							fgColor: { argb: 'B7DEE8' },
						};
					}
				}
				sheet.getRow(i + 7).getCell(numberOfDays + 6).value = getTotalRows(rowDays);
				sheet.getRow(i + 7).getCell(numberOfDays + 6).alignment = {
					vertical: 'bottom',
					horizontal: 'right',
				};
			}

			for (let i = 0; i < documentRowsFiltered.length; i++) {
				for (let j = 1; j <= numberOfDays + 6; j++) {
					sheet.getRow(i + 7).getCell(j).border = {
						top: { style: 'thin' },
						left: { style: j === 1 ? 'thick' : 'thin' },
						bottom: {
							style:
								i === documentRowsFiltered.length - 1
									? j <= numberOfDays
										? 'thick'
										: 'thin'
									: 'thin',
						},
						right: { style: j === numberOfDays + 6 ? 'thick' : 'thin' },
					};
				}
			}

			sheet.getRow(documentRowsFiltered.length + 7).getCell(numberOfDays + 1).value =
				'Toplam: ';
			sheet.getRow(documentRowsFiltered.length + 7).getCell(numberOfDays + 1).font = {
				size: 12,
				bold: true,
			};
			sheet.getRow(documentRowsFiltered.length + 7).getCell(numberOfDays + 1).alignment = {
				vertical: 'middle',
				horizontal: 'center',
			};
			sheet.getRow(documentRowsFiltered.length + 7).getCell(numberOfDays + 1).fill = {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: 'B7DEE8' },
			};
			sheet.getRow(documentRowsFiltered.length + 7).getCell(numberOfDays + 1).border = {
				top: { style: 'thin' },
				left: { style: 'thick' },
				bottom: { style: 'thick' },
				right: { style: 'thin' },
			};
			const totalDays = getTotalDays(documentRowsFiltered);
			sheet.getRow(documentRowsFiltered.length + 7).getCell(numberOfDays + 6).value =
				totalDays;
			sheet.getRow(documentRowsFiltered.length + 7).getCell(numberOfDays + 6).font = {
				size: 12,
				bold: true,
			};
			sheet.getRow(documentRowsFiltered.length + 7).getCell(numberOfDays + 6).alignment = {
				vertical: 'middle',
				horizontal: 'right',
			};
			sheet.getRow(documentRowsFiltered.length + 7).getCell(numberOfDays + 6).border = {
				top: { style: 'thin' },
				left: { style: 'thin' },
				bottom: { style: 'thick' },
				right: { style: 'thick' },
			};
			sheet.mergeCells(
				documentRowsFiltered.length + 7,
				numberOfDays + 1,
				documentRowsFiltered.length + 7,
				numberOfDays + 5,
			);

			// set column widths
			sheet.getColumn(1).width = 5;
			sheet.getColumn(2).width = 15;
			sheet.getColumn(3).width = 20;
			sheet.getColumn(4).width = 20;
			sheet.getColumn(5).width = 20;
			for (let i = 1; i <= numberOfDays; i++) sheet.getColumn(i + 5).width = 4;
			sheet.getColumn(numberOfDays + 6).width = 10;

			// set row heights
			sheet.getRow(1).height = 64;
			sheet.getRow(2).height = 24;
			sheet.getRow(3).height = 24;
			sheet.getRow(4).height = 24;
			sheet.getRow(5).height = 24;
			sheet.getRow(6).height = 72;
			for (let i = 0; i < documentRowsFiltered.length; i++) sheet.getRow(i + 7).height = 24;
			sheet.getRow(documentRowsFiltered.length + 7).height = 32;

			sheet.getRow(8 + documentRowsFiltered.length).height = 24;
			sheet
				.getRow(8 + documentRowsFiltered.length)
				.getCell(
					3,
				).value = `Yukarıda belirtilen kişiler tarafından ${monthText?.toUpperCase()} ayında toplam ${totalDays} saat ek ders okutulmuştur.`;
			sheet.getRow(8 + documentRowsFiltered.length).getCell(3).font = {
				size: 12,
				italic: true,
			};
			sheet.getRow(8 + documentRowsFiltered.length).getCell(3).alignment = {
				vertical: 'middle',
				horizontal: 'left',
			};
			sheet.mergeCells(
				8 + documentRowsFiltered.length,
				3,
				8 + documentRowsFiltered.length,
				15,
			);

			sheet.getRow(9 + documentRowsFiltered.length).height = 24;
			sheet.getRow(9 + documentRowsFiltered.length).getCell(16).value = 'DÜZENLEYEN';
			sheet.getRow(9 + documentRowsFiltered.length).getCell(16).font = { size: 12 };
			sheet.getRow(9 + documentRowsFiltered.length).getCell(16).alignment = {
				vertical: 'middle',
				horizontal: 'center',
			};
			sheet.mergeCells(
				9 + documentRowsFiltered.length,
				16,
				9 + documentRowsFiltered.length,
				22,
			);

			sheet.getRow(9 + documentRowsFiltered.length).getCell(24).value = 'UYGUNDUR';
			sheet.getRow(9 + documentRowsFiltered.length).getCell(24).font = { size: 12 };
			sheet.getRow(9 + documentRowsFiltered.length).getCell(24).alignment = {
				vertical: 'middle',
				horizontal: 'center',
			};
			sheet.mergeCells(
				9 + documentRowsFiltered.length,
				24,
				9 + documentRowsFiltered.length,
				30,
			);

			sheet.getRow(10 + documentRowsFiltered.length).height = 24;

			sheet.getRow(10 + documentRowsFiltered.length).getCell(12).value = 'Ad Soyad:';
			sheet.getRow(10 + documentRowsFiltered.length).getCell(12).font = { size: 10 };
			sheet.getRow(10 + documentRowsFiltered.length).getCell(12).alignment = {
				vertical: 'middle',
				horizontal: 'left',
			};
			sheet.mergeCells(
				10 + documentRowsFiltered.length,
				12,
				10 + documentRowsFiltered.length,
				14,
			);

			sheet.getRow(10 + documentRowsFiltered.length).getCell(16).value = school.editor;
			sheet.getRow(10 + documentRowsFiltered.length).getCell(16).font = {
				size: 14,
				bold: true,
			};
			sheet.getRow(10 + documentRowsFiltered.length).getCell(16).alignment = {
				vertical: 'middle',
				horizontal: 'center',
			};
			sheet.mergeCells(
				10 + documentRowsFiltered.length,
				16,
				10 + documentRowsFiltered.length,
				22,
			);

			sheet.getRow(10 + documentRowsFiltered.length).getCell(24).value = school.director;
			sheet.getRow(10 + documentRowsFiltered.length).getCell(24).font = {
				size: 14,
				bold: true,
			};
			sheet.getRow(10 + documentRowsFiltered.length).getCell(24).alignment = {
				vertical: 'middle',
				horizontal: 'center',
			};
			sheet.mergeCells(
				10 + documentRowsFiltered.length,
				24,
				10 + documentRowsFiltered.length,
				30,
			);

			sheet.getRow(11 + documentRowsFiltered.length).height = 24;

			sheet.getRow(11 + documentRowsFiltered.length).getCell(12).value = 'Ünvan:';
			sheet.getRow(11 + documentRowsFiltered.length).getCell(12).font = { size: 10 };
			sheet.getRow(11 + documentRowsFiltered.length).getCell(12).alignment = {
				vertical: 'middle',
				horizontal: 'left',
			};
			sheet.mergeCells(
				11 + documentRowsFiltered.length,
				12,
				11 + documentRowsFiltered.length,
				14,
			);

			sheet.getRow(11 + documentRowsFiltered.length).getCell(16).value = school.editorTitle;
			sheet.getRow(11 + documentRowsFiltered.length).getCell(16).font = { size: 12 };
			sheet.getRow(11 + documentRowsFiltered.length).getCell(16).alignment = {
				vertical: 'middle',
				horizontal: 'center',
			};
			sheet.mergeCells(
				11 + documentRowsFiltered.length,
				16,
				11 + documentRowsFiltered.length,
				22,
			);

			sheet.getRow(11 + documentRowsFiltered.length).getCell(24).value = 'Okul Müdürü';
			sheet.getRow(11 + documentRowsFiltered.length).getCell(24).font = { size: 12 };
			sheet.getRow(11 + documentRowsFiltered.length).getCell(24).alignment = {
				vertical: 'middle',
				horizontal: 'center',
			};
			sheet.mergeCells(
				11 + documentRowsFiltered.length,
				24,
				11 + documentRowsFiltered.length,
				30,
			);

			sheet.getRow(12 + documentRowsFiltered.length).height = 24;

			sheet.getRow(12 + documentRowsFiltered.length).getCell(12).value = 'İmza:';
			sheet.getRow(12 + documentRowsFiltered.length).getCell(12).font = { size: 10 };
			sheet.getRow(12 + documentRowsFiltered.length).getCell(12).alignment = {
				vertical: 'middle',
				horizontal: 'left',
			};
			sheet.mergeCells(
				12 + documentRowsFiltered.length,
				12,
				12 + documentRowsFiltered.length,
				14,
			);

			sheet.mergeCells(
				12 + documentRowsFiltered.length,
				16,
				12 + documentRowsFiltered.length,
				22,
			);
			sheet.mergeCells(
				12 + documentRowsFiltered.length,
				24,
				12 + documentRowsFiltered.length,
				30,
			);
		}

		const buffer = await filesForPrint.xlsx.writeBuffer();

		res.setHeader(
			'Content-Type',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		);
		res.setHeader(
			'Content-Disposition',
			`attachment; filename="CIZELGE-${documentData.month + 1}-${
				documentData.year
			}-${Math.floor(Math.random() * 100000)}.xlsx"`,
		);
		res.send(buffer);
	}
};

export default download;
