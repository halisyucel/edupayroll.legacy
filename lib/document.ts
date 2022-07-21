import { Row } from '../pages/api/documents/download';
import { School } from '../pages/api/school/get';
import {
	getDaysInMonth,
	CourseCodes,
	isWeekend,
	MonthData,
	regenerateTwoDigitMonth,
} from '../utils/documents';
import ExcelJS from 'exceljs';
import fs from 'fs';

interface GenerateFiles {
	month: number;
	year: number;
	school: School;
	documentRows: Row[];
}

const getTotalRows = (days: number[]) => {
	let totalDays = 0;
	for (const day of days) totalDays += day;
	return totalDays;
};

const getTotalDays = (documentRows: Row[]) => {
	const days: number[] = [];
	for (const row of documentRows) days.push(getTotalRows(JSON.parse(row.days)));
	return getTotalRows(days);
};

const removeAllOldFiles = () => {
	const files = fs.readdirSync('./public/files');
	for (const file of files) fs.unlinkSync(`./public/files/${file}`);
};

const distinctCourseCodes = (documentRows: Row[]) => {
	const courseCodes: number[] = [];
	for (const row of documentRows)
		if (!courseCodes.includes(row.courseCode)) courseCodes.push(row.courseCode);
	return courseCodes.sort((a, b) => a - b);
};

export const generateFiles = async ({ month, year, school, documentRows }: GenerateFiles) => {
	removeAllOldFiles();
	const numberOfDays = getDaysInMonth(month, year);
	// kbs
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
		for (let i = 0; i < numberOfDays; i++) rowKbsData.push(rowDays[i].toString());
		kbsSheet.addRow(rowKbsData);
	}
	const kbsUrl = `KBS-${month + 1}-${year}-${Math.floor(Math.random() * 10000000)}.xlsx`;
	kbsFile.xlsx.writeFile(`public/files/${kbsUrl}`);
	// others
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
		sheet.getRow(3).getCell(3).value = `01.${regenerateTwoDigitMonth(month)}.${year}`;
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
		const monthText = MonthData.find((m) => m.value === month)?.label;
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
			month,
		)}.${year}`;
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
		sheet.getRow(4).getCell(numberOfDays + 6).value = year;
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
			sheet.getRow(6).getCell(i + 5).alignment = { vertical: 'bottom', horizontal: 'center' };
			if (isWeekend(i, month, year)) {
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
				if (isWeekend(j + 1, month, year)) {
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

		sheet.getRow(documentRowsFiltered.length + 7).getCell(numberOfDays + 1).value = 'Toplam: ';
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
		sheet.getRow(documentRowsFiltered.length + 7).getCell(numberOfDays + 6).value = totalDays;
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
		sheet.getRow(8 + documentRowsFiltered.length).getCell(3).font = { size: 12, italic: true };
		sheet.getRow(8 + documentRowsFiltered.length).getCell(3).alignment = {
			vertical: 'middle',
			horizontal: 'left',
		};
		sheet.mergeCells(8 + documentRowsFiltered.length, 3, 8 + documentRowsFiltered.length, 15);

		sheet.getRow(9 + documentRowsFiltered.length).height = 24;
		sheet.getRow(9 + documentRowsFiltered.length).getCell(16).value = 'DÜZENLEYEN';
		sheet.getRow(9 + documentRowsFiltered.length).getCell(16).font = { size: 12 };
		sheet.getRow(9 + documentRowsFiltered.length).getCell(16).alignment = {
			vertical: 'middle',
			horizontal: 'center',
		};
		sheet.mergeCells(9 + documentRowsFiltered.length, 16, 9 + documentRowsFiltered.length, 22);

		sheet.getRow(9 + documentRowsFiltered.length).getCell(24).value = 'UYGUNDUR';
		sheet.getRow(9 + documentRowsFiltered.length).getCell(24).font = { size: 12 };
		sheet.getRow(9 + documentRowsFiltered.length).getCell(24).alignment = {
			vertical: 'middle',
			horizontal: 'center',
		};
		sheet.mergeCells(9 + documentRowsFiltered.length, 24, 9 + documentRowsFiltered.length, 30);

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
		sheet.getRow(10 + documentRowsFiltered.length).getCell(16).font = { size: 14, bold: true };
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
		sheet.getRow(10 + documentRowsFiltered.length).getCell(24).font = { size: 14, bold: true };
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

	const cizelgelerUrl = `CIZELGE-${month + 1}-${year}-${Math.floor(
		Math.random() * 10000000,
	)}.xlsx`;
	await filesForPrint.xlsx.writeFile(`public/files/${cizelgelerUrl}`);

	return [kbsUrl, cizelgelerUrl];
};
