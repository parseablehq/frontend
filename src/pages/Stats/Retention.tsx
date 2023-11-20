import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Box, Button, Group, Modal, Stack, Text, TextInput, ThemeIcon, px } from '@mantine/core';
import { FC, useEffect } from 'react';
import classes from './Retention.module.css';
import { IconClockStop, IconFileAlert } from '@tabler/icons-react';
import { useGetLogStreamRetention } from '@/hooks/useGetLogStreamRetention';
import Loading from '@/components/Loading';
import { useDisclosure } from '@mantine/hooks';

import { usePutLogStreamRetention } from '@/hooks/usePutLogStreamRetention';
import { useForm } from '@mantine/form';

const Retention: FC = () => {
	const {
		state: { subAppContext },
	} = useHeaderContext();
	const {
		data: dataRetention,
		error: errorRetention,
		loading: loadingRetention,
		getLogRetention,
		resetData: resetDataRetention,
	} = useGetLogStreamRetention();

	const {
		data: resultRetentionData,
		error: retentionError,
		loading: retentionLoading,
		putRetentionData,
		resetData: resetRetentionData,
	} = usePutLogStreamRetention();

	const [opened, { open, close }] = useDisclosure(false);
	const form = useForm({
		initialValues: {
			description: '',
			duration: '',
			action: 'delete',
		},
		validate: {
			description: (value) => (value.length > 0 ? null : 'Please Fill the description'),
			duration: (value) => (Number.isInteger(Number(value)) ? null : 'Must be a number'),
			action: (value) => (value === 'delete' ? null : 'Action must be equal to delete'),
		},
	});

	useEffect(() => {
		const subQueryListener = subAppContext.subscribe((state) => {
			if (state.selectedStream) {
				if (dataRetention) {
					resetDataRetention();
					resetRetentionData();
					form.setFieldValue('description', '');
					form.setFieldValue('duration', '');
					form.setFieldValue('action', 'delete');
				}
				getLogRetention(state.selectedStream);
			}
		});
		return () => {
			subQueryListener();
		};
	}, []);

	useEffect(() => {
		if (subAppContext.get().selectedStream) {
			getLogRetention(subAppContext.get().selectedStream ?? '');
		}
		return () => {
			resetDataRetention();
		};
	}, []);

	const retry = () => {
		if (subAppContext.get().selectedStream) {
			getLogRetention(subAppContext.get().selectedStream ?? '');
		}
	};

	useEffect(() => {
		if (dataRetention?.length) {
			form.setFieldValue('description', dataRetention[0].description);
			form.setFieldValue('duration', dataRetention[0].duration.split('d')[0]);
			form.setFieldValue('action', dataRetention[0].action);
		}
	}, [dataRetention]);

	useEffect(() => {
		if (resultRetentionData) {
			if (resultRetentionData) {
				if (subAppContext.get().selectedStream) {
					getLogRetention(subAppContext.get().selectedStream ?? '');
				}
			}
		}
	}, [resultRetentionData]);

	const modalClose = () => {
		if (dataRetention?.length) {
			form.setFieldValue('description', dataRetention[0].description);
			form.setFieldValue('duration', dataRetention[0].duration.split('d')[0]);
			form.setFieldValue('action', dataRetention[0].action);
		}
		close();
	};

	const { headContainer, IconStyle, container, contentContainer, iconBox, heading, modalStyle } = classes;

	return (
		<Box className={container}>
			<Box className={headContainer}>
				<Text className={heading}>Retention</Text>
				{loadingRetention || retentionLoading ? (
					<Loading visible variant="oval" />
				) : errorRetention || retentionError ? (
					<Box
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '10px',
						}}>
						<ThemeIcon variant="filled" color="red" radius={'lg'} size={'lg'}>
							<IconFileAlert />
						</ThemeIcon>
						<Text color="red">Error :{errorRetention}</Text>
						<Button color="brandPrimary.4" onClick={retry}>
							Retry
						</Button>
					</Box>
				) : (
					dataRetention &&
					dataRetention.length === 0 && (
						<Box
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '10px',
							}}>
							<ThemeIcon variant="filled" color="red" radius={'lg'} size={'lg'}>
								<IconFileAlert />
							</ThemeIcon>
							<Text color="red">No Retention set</Text>
							<Button color="green.9" onClick={open}>
								Add Retention
							</Button>
						</Box>
					)
				)}
			</Box>
			{dataRetention &&
				dataRetention.length > 0 &&
				dataRetention.map((item: any, index: number) => {
					return (
						<Box key={index} className={contentContainer}>
							<Box className={iconBox}>
								<ThemeIcon radius={80} size={80} className={IconStyle}>
									<IconClockStop size={px('3.2rem')} stroke={1.2} />
								</ThemeIcon>
							</Box>
							<Box
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									width: '100%',
									margin: '10px',
								}}>
								<Box>
									<Text className={heading}>Description:</Text>
									<Text>{item.description}</Text>
								</Box>
								<Box>
									<Text className={heading}>Action : </Text>
									<Text>{item.action}</Text>
								</Box>
								<Box>
									<Text className={heading}>Duration : </Text>
									<Text>{item.duration}</Text>
								</Box>
								<Button color="green.9" onClick={open}>
									Update Retention
								</Button>
							</Box>
						</Box>
					);
				})}

			<Modal
				opened={opened}
				onClose={modalClose}
				centered
				title={dataRetention && dataRetention.length ? 'Update Retention' : 'Create Retention'}
				className={modalStyle}>
				<form
					onSubmit={form.onSubmit((values) => {
						close();
						if (!values.duration.endsWith('d')) {
							values.duration = values.duration + 'd';
						}
						putRetentionData(subAppContext.get().selectedStream ?? '', [values]);
					})}>
					<Stack>
						<TextInput
							type="text"
							label="Description"
							placeholder="Enter the description"
							{...form.getInputProps('description')}
							required
						/>
						<TextInput
							type="number"
							label="Duration (in days)"
							placeholder="Enter the duration"
							{...form.getInputProps('duration')}
							required
						/>
						<TextInput
							type="text"
							label="Action"
							placeholder="Enter action"
							{...form.getInputProps('action')}
							disabled
						/>
					</Stack>

					<Group justify="right" mt={10}>
						<Button variant="filled" color="green.9" type="submit">
							{dataRetention?.length ? 'Update' : 'Create'}
						</Button>
						<Button variant="outline" color="gray" onClick={modalClose}>
							Cancel
						</Button>
					</Group>
				</form>
			</Modal>
		</Box>
	);
};

export default Retention;
