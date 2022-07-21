import React, { useCallback, useEffect, useState } from 'react';
import { NextPage } from 'next';
import Layout from '../../components/layout';
import { Button, Input, InputPicker, Loader } from 'rsuite';
import { fillDocumentRows, getYearData, MonthData } from '../../utils/documents';
import { openSnackbar } from '../../redux/features/snackbar';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import DocumentRow from '../../components/document-row';

export interface Document {
	id: number;
	name: string;
	year: number;
	month: number;
}

const Document: NextPage = () => {
	const dispatch = useDispatch();
	const [refreshData, setRefreshData] = useState<number>(0);
	// append new document
	const [isNewDocumentFormOpen, setIsNewDocumentFormOpen] = useState<boolean>(false);
	const [isLoadingNewDocumentForm, setIsLoadingNewDocumentForm] = useState<boolean>(false);
	const [newDocumentName, setNewDocumentName] = useState<string>('');
	const [newDocumentMonth, setNewDocumentMonth] = useState<number>((new Date()).getMonth());
	const [newDocumentYear, setNewDocumentYear] = useState<number>((new Date()).getFullYear());
	const resetNewDocumentForm = useCallback(() => {
		setNewDocumentName('');
		setNewDocumentMonth((new Date()).getMonth());
		setNewDocumentYear((new Date()).getFullYear());
		setIsNewDocumentFormOpen(false);
	}, []);
	const handleNewDocumentForm = useCallback(() => {
		if (!newDocumentName.trim()) {
			dispatch(
				openSnackbar({
					message: 'Lütfen belgenize bir ad verin.',
					variant: 'error',
				}),
			);
			return;
		}
		setIsLoadingNewDocumentForm(true);
		axios.post('/api/documents/new', {
			name: newDocumentName,
			month: newDocumentMonth,
			year: newDocumentYear,
		})
			.then(() => {
				dispatch(
					openSnackbar({
						message: 'Belge başarıyla oluşturuldu.',
						variant: 'success',
					}),
				);
				setRefreshData(refreshData + 1);
				resetNewDocumentForm();
			})
			.catch(() => {
				dispatch(
					openSnackbar({
						message: 'Belge oluşturulurken bir hata oluştu.',
						variant: 'error',
					}),
				);
			})
			.finally(() => {
				setIsLoadingNewDocumentForm(false);
			});
	}, [
		newDocumentName,
		newDocumentMonth,
		newDocumentYear,
		dispatch,
		refreshData,
		resetNewDocumentForm,
	]);
	// get all documents
	const [isLoadingDocuments, setIsLoadingDocuments] = useState<boolean>(false);
	const [documents, setDocuments] = useState<Document[]>([]);
	useEffect(() => {
		setIsLoadingDocuments(true);
		axios
			.get('/api/documents/all')
			.then((res) => {
				setDocuments(res.data);
				fillDocumentRows();
			})
			.catch(() => {
				dispatch(
					openSnackbar({
						message: 'Belgeler alınırken bir hata oluştu.',
						variant: 'error',
					}),
				);
			})
			.finally(() => {
				setIsLoadingDocuments(false);
			});
	}, [refreshData, dispatch]);
	return (
		<Layout>
			<div className={'w-full border-b-2 pb-2 flex'}>
				<h2 className={'text-2xl font-extrabold font-source-sans m-0 p-0'}>Belgeler</h2>
			</div>
			<div className={'w-full border-b-2 py-4 flex'}>
				{isNewDocumentFormOpen ? (
					<React.Fragment>
						<label className={'block min-w-[16rem] mr-2'}>
							<Input
								size={'sm'}
								placeholder={'Belge adı'}
								spellCheck={false}
								value={newDocumentName}
								onChange={(value) => setNewDocumentName(value)}
								readOnly={isLoadingNewDocumentForm}
								maxLength={256}
							/>
						</label>
						<label className={'block min-w-[8rem] max-w-[8rem] mr-2'}>
							<InputPicker
								block={true}
								size={'sm'}
								data={MonthData}
								cleanable={false}
								placeholder={'Ay seçiniz'}
								value={newDocumentMonth}
								onChange={(value) => setNewDocumentMonth(value)}
							/>
						</label>
						<label className={'block min-w-[8rem] max-w-[8rem] mr-2'}>
							<InputPicker
								block={true}
								size={'sm'}
								data={[ ...getYearData() ]}
								cleanable={false}
								placeholder={'Yıl seçiniz'}
								value={newDocumentYear}
								onChange={(value) => setNewDocumentYear(value)}
							/>
						</label>
						<span className={'flex-1'} />
						<Button
							size={'sm'}
							className={'mr-2'}
							disabled={isLoadingNewDocumentForm}
							onClick={() => resetNewDocumentForm()}
						>
							İptal
						</Button>
						<Button
							size={'sm'}
							color={'green'}
							appearance={'primary'}
							loading={isLoadingNewDocumentForm}
							onClick={() => handleNewDocumentForm()}
						>
							Kaydet
						</Button>
					</React.Fragment>
				) : (
					<React.Fragment>
						<Button
							size={'sm'}
							appearance={'primary'}
							onClick={() => setIsNewDocumentFormOpen(true)}
						>
							Yeni Belge Ekle
						</Button>
					</React.Fragment>
				)}
			</div>
			<div className={'w-full border-b-2 py-2 pl-1.5 pt-6 flex'}>
				<div className={'min-w-[18rem] mr-2 px-2 font-bold border-r-2'}>Belge Adı</div>
				<div className={'min-w-[12rem] mr-2 px-2 font-bold border-r-2'}>Ay</div>
				<div className={'min-w-[12rem] mr-2 px-2 font-bold border-r-2'}>Yıl</div>
			</div>
			<div className={'w-full relative h-[calc(100%-156px)] overflow-auto'}>
				<div
					className={`w-full h-full absolute inset-0 bg-gray-100/70 pt-6 justify-center items-start ${
						isLoadingDocuments ? 'flex' : 'hidden'
					}`}
				>
					<Loader />
				</div>
				{documents.map((document: Document) => (
					<DocumentRow
						key={document.id}
						id={document.id}
						name={document.name}
						month={document.month}
						year={document.year}
					/>
				))}
			</div>
		</Layout>
	);
};

export default Document;
