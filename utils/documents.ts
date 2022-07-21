import fs from 'fs';
import path from 'path';

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

export const MonthData = [
	{
		label: 'Ocak',
		value: 0,
	},
	{
		label: 'Şubat',
		value: 1,
	},
	{
		label: 'Mart',
		value: 2,
	},
	{
		label: 'Nisan',
		value: 3,
	},
	{
		label: 'Mayıs',
		value: 4,
	},
	{
		label: 'Haziran',
		value: 5,
	},
	{
		label: 'Temmuz',
		value: 6,
	},
	{
		label: 'Ağustos',
		value: 7,
	},
	{
		label: 'Eylül',
		value: 8,
	},
	{
		label: 'Ekim',
		value: 9,
	},
	{
		label: 'Kasım',
		value: 10,
	},
	{
		label: 'Aralık',
		value: 11,
	},
];

export const getYearData = () => {
	const yearData = [];
	for (let i = 2018; i < 2040; i++) {
		yearData.push({
			value: i,
			label: i.toString(),
		});
	}
	return yearData;
};

export const fillDocumentRows = () => {
	setTimeout(() => {
		const documentRows = Array.from(document.querySelectorAll('.document-row')).filter(
			(row) => {
				return row.getAttribute('data-hidden') !== 'true';
			},
		);
		for (let i = 0; i < documentRows.length; i++) {
			const row = documentRows[i] as HTMLElement;
			if (i % 2 === 1) row.style.backgroundColor = 'transparent';
			else row.style.backgroundColor = 'rgba(52,152,255,0.1)';
		}
	}, 100);
};

export const CourseCodes = [
	{
		label: 'Gündüz',
		value: 101,
	},
	{
		label: 'Gece',
		value: 102,
	},
	{
		label: '%25 Fazla Gündüz',
		value: 103,
	},
	{
		label: '%25 Fazla Gece',
		value: 104,
	},
	{
		label: 'Belleticilik',
		value: 106,
	},
	{
		label: 'Sınav Görevi',
		value: 107,
	},
	{
		label: 'Egzersiz',
		value: 108,
	},
	{
		label: 'Hizmetiçi',
		value: 109,
	},
	{
		label: 'EYGG - Gündüz',
		value: 110,
	},
	{
		label: 'EYGG - Gece',
		value: 111,
	},
	{
		label: 'EYGG - %25 Gündüz',
		value: 112,
	},
	{
		label: 'EYGG - %25 Gece',
		value: 113,
	},
	{
		label: 'Atış Eğitimi',
		value: 114,
	},
	{
		label: 'Cezaevleri Eğitim Merkezi - 160*Saat',
		value: 115,
	},
	{
		label: 'Takviye Kursu (Gündüz)',
		value: 116,
	},
	{
		label: 'Takviye Kursu (Haftasonu/Gece)',
		value: 117,
	},
	{
		label: 'Belleticilik %25 Fazla',
		value: 118,
	},
	{
		label: 'Nöbet Görevi',
		value: 119,
	},
	{
		label: 'Salon Başkanı',
		value: 1070,
	},
	{
		label: 'Gözetmen',
		value: 10700,
	},
	{
		label: 'Yedek Gözetmen',
		value: 107000,
	},
	{
		label: 'Yedek Engelli Gözetmen',
		value: 1070000,
	},
	{
		label: 'Nöbet Ücreti % 25 Fazla',
		value: 121,
	},
	{
		label: 'İYEP - Gündüz',
		value: 122,
	},
	{
		label: 'İYEP - Gece - HS',
		value: 123,
	},
	{
		label: 'Gündüz (2/3-AFAD Eğt.Yard.)',
		value: 212,
	},
];

export const isWeekend = (day: number, month: number, year: number) => {
	const date = new Date(year, month, day);
	return date.getDay() === 6 || date.getDay() === 0;
};

export const getDaysInMonth = (month: number, year: number) => {
	return new Date(year, month, 0).getDate();
};

export const regenerateTwoDigitMonth = (month: number) => {
	month += 1;
	return month < 10 ? `0${month}` : `${month}`;
};

export const getTotalRows = (days: number[]) => {
	let totalDays = 0;
	for (const day of days) totalDays += day;
	return totalDays;
};

export const getTotalDays = (documentRows: Row[]) => {
	const days: number[] = [];
	for (const row of documentRows) days.push(getTotalRows(JSON.parse(row.days)));
	return getTotalRows(days);
};

export const distinctCourseCodes = (documentRows: Row[]) => {
	const courseCodes: number[] = [];
	for (const row of documentRows)
		if (!courseCodes.includes(row.courseCode)) courseCodes.push(row.courseCode);
	return courseCodes.sort((a, b) => a - b);
};
