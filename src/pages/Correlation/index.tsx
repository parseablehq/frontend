import { useCallback, useEffect, useState } from 'react';
import { useDocumentTitle } from '@mantine/hooks';
import { Stack, Box, TextInput, Text, Select, Button, Center, Stepper, Badge, SelectProps, Group } from '@mantine/core';
import { IconTrashX, IconX } from '@tabler/icons-react';
import {
	PRIMARY_HEADER_HEIGHT,
	STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT,
	STREAM_PRIMARY_TOOLBAR_HEIGHT,
	STREAM_SECONDARY_TOOLBAR_HRIGHT,
} from '@/constants/theme';
import classes from './styles/Correlation.module.css';
import { useCorrelationQueryLogs } from '@/hooks/useCorrelationQueryLogs';
import { useGetMultipleStreamSchemas, useGetStreamSchema } from '@/hooks/useGetCorrelationStreamSchema';
import { useFetchStreamData } from '@/hooks/useFetchStreamData';
import { correlationStoreReducers, useCorrelationStore } from './providers/CorrelationProvider';
import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import CorrelationTable from './Views/CorrelationTable';
import CorrelationFooter from './Views/CorrelationFooter';
import TimeRange from '@/components/Header/TimeRange';
import RefreshInterval from '@/components/Header/RefreshInterval';
import RefreshNow from '@/components/Header/RefreshNow';
import MultiEventTimeLineGraph from './components/MultiEventTimeLineGraph';
import { CorrelationEmptyPlaceholder } from './components/CorrelationEmptyPlaceholder';
import { StreamSelectBox } from './components/StreamSelectBox';
import { CorrelationFieldItem, dataTypeIcons } from './components/CorrelationFieldItem';
import { MaximizeButton } from '../Stream/components/PrimaryToolbar';
import ShareButton from './components/ShareButton';
import useParamsController from './hooks/useParamsController';
import _ from 'lodash';
import { useCorrelationsQuery } from '@/hooks/useCorrelations';
import SavedCorrelationsButton from './components/SavedCorrelationsBtn';
import SavedCorrelationsModal from './components/SavedCorrelationsModal';
import SaveCorrelationModal from './components/SaveCorrelationModal';
import { useCorrelationFetchCount } from './hooks/useCorrelationFetchCount';
import CorrleationJSONView from './Views/CorrelationJSONView';
import ViewToggle from './components/CorrelationViewToggle';
import dayjs from 'dayjs';

const { changeStream, syncTimeRange, setTimeRange } = appStoreReducers;
const {
	deleteStreamData,
	setSelectedFields,
	deleteSelectedField,
	setCorrelationCondition,
	setIsCorrelatedFlag,
	toggleSaveCorrelationModal,
	setActiveCorrelation,
	setCorrelationId,
	setPageAndPageData,
	setTargetPage,
} = correlationStoreReducers;

const Correlation = () => {
	useDocumentTitle('Parseable | Correlation');
	// State Management Hooks
	const [userSpecificStreams] = useAppStore((store) => store.userSpecificStreams);
	const [
		{
			fields,
			selectedFields,
			tableOpts,
			isCorrelatedData,
			activeCorrelation,
			correlationCondition,
			correlationId,
			savedCorrelationId,
			viewMode,
			correlations,
		},
		setCorrelationData,
	] = useCorrelationStore((store) => store);

	const { isStoreSynced } = useParamsController();
	const [timeRange] = useAppStore((store) => store.timeRange);
	const [currentStream, setAppStore] = useAppStore((store) => store.currentStream);
	const [maximized] = useAppStore((store) => store.maximized);
	const { isLoading: schemaLoading } = useGetStreamSchema({
		streamName: currentStream || '',
	});
	const isSavedCorrelation = correlationId !== savedCorrelationId;
	const streamsToFetch =
		(isSavedCorrelation && activeCorrelation?.tableConfigs.map((config: { tableName: string }) => config.tableName)) ||
		[];
	const { isLoading: multipleSchemasLoading } = useGetMultipleStreamSchemas(streamsToFetch);

	const { getCorrelationData, loadingState, error: errorMessage } = useCorrelationQueryLogs();
	const { getFetchStreamData, loading: streamsLoading } = useFetchStreamData();
	const { fetchCorrelations } = useCorrelationsQuery();
	const { refetchCount, countLoading } = useCorrelationFetchCount();

	// Local State
	const [searchText, setSearchText] = useState('');
	const [select1Value, setSelect1Value] = useState<string | null>(null);
	const [select2Value, setSelect2Value] = useState<string | null>(null);
	const [isCorrelationEnabled, setIsCorrelationEnabled] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	// Derived Constants
	const primaryHeaderHeight = maximized
		? 0
		: PRIMARY_HEADER_HEIGHT + STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT + STREAM_SECONDARY_TOOLBAR_HRIGHT;

	const streamNames = Object.keys(fields);
	const streamData =
		userSpecificStreams?.map((stream: any) => ({
			value: stream.name,
			label: stream.name,
		})) ?? [];
	const { currentOffset, pageData, targetPage, currentPage } = tableOpts;

	// Effects
	useEffect(() => {
		if (isStoreSynced) {
			fetchCorrelations();
			setIsLoading(false);
		}
	}, [isStoreSynced]);

	useEffect(() => {
		if (multipleSchemasLoading || !activeCorrelation) return;

		const tableOrder = activeCorrelation?.tableConfigs.reduce((acc, config, index) => {
			acc[config.tableName] = index;
			return acc;
		}, {} as Record<string, number>);

		const sortedJoinConditions = [...(activeCorrelation?.joinConfig.joinConditions || [])].sort(
			(a, b) => (tableOrder[a.tableName] || 0) - (tableOrder[b.tableName] || 0),
		);

		if (sortedJoinConditions[0]) {
			setSelect1Value(sortedJoinConditions[0].field);
		}
		if (sortedJoinConditions[1]) {
			setSelect2Value(sortedJoinConditions[1].field);
		}

		activeCorrelation?.tableConfigs.flatMap((config) =>
			config.selectedFields.map((field: string) =>
				setCorrelationData((store) => setSelectedFields(store, field, config.tableName)),
			),
		) || [];
	}, [activeCorrelation, multipleSchemasLoading]);

	useEffect(() => {
		if (!isSavedCorrelation || !correlationId) return;
		const activeCorrelation = correlations?.find((correlation) => correlation.id === correlationId) || null;
		activeCorrelation?.startTime &&
			activeCorrelation?.endTime &&
			setAppStore((store) =>
				setTimeRange(store, {
					startTime: dayjs(activeCorrelation?.startTime),
					endTime: dayjs(activeCorrelation?.endTime),
					type: 'custom',
				}),
			);
		setSelect1Value(null);
		setSelect2Value(null);
		setCorrelationData((store) => setCorrelationCondition(store, ''));
		setCorrelationData((store) => setSelectedFields(store, '', '', true));
		setCorrelationData((store) => setActiveCorrelation(store, activeCorrelation));
	}, [correlationId, correlations]);

	useEffect(() => {
		if (currentStream && streamNames.length > 0 && Object.keys(fields).includes(currentStream)) {
			getFetchStreamData();
		}
	}, [currentStream, fields]);

	useEffect(() => {
		if (isCorrelatedData) {
			getCorrelationData();
		} else {
			getFetchStreamData();
		}
	}, [currentOffset, timeRange]);

	useEffect(() => {
		updateCorrelationCondition();
		if (activeCorrelation && correlationCondition && isSavedCorrelation) {
			refetchCount();
			getCorrelationData();
		}
		correlationCondition && setIsCorrelationEnabled(true);
	}, [select1Value, select2Value, activeCorrelation, correlationCondition]);

	// Utility Functions
	const filterFields = (fieldsIter: any) => {
		const typedFields = Object.keys(fieldsIter.fieldTypeMap) as string[];
		return searchText
			? typedFields.filter((field) => field.toLowerCase().includes(searchText.toLowerCase()))
			: typedFields;
	};

	const updateCorrelationCondition = () => {
		if (select1Value && select2Value) {
			const condition = `"${streamNames[0]}".${select1Value} = "${streamNames[1]}".${select2Value}`;
			setAppStore((store) => changeStream(store, 'correlatedStream'));
			setCorrelationData((store) => setCorrelationCondition(store, condition));
		}
	};

	// Event Handlers
	const addStream = (value: string | null) => {
		if (value) {
			setAppStore((store) => changeStream(store, value));
		}
	};

	const handleFieldChange = (fieldValue: string | null, isFirstField: boolean) => {
		if (isFirstField) {
			setSelect1Value(fieldValue);
		} else {
			setSelect2Value(fieldValue);
		}
	};

	const clearQuery = () => {
		setSelect1Value(null);
		setSelect2Value(null);
		setCorrelationData((store) => setCorrelationCondition(store, ''));
		setCorrelationData((store) => setSelectedFields(store, '', '', true));
		setCorrelationData((store) => setIsCorrelatedFlag(store, false));
		setCorrelationData((store) => setCorrelationId(store, ''));
		setCorrelationData((store) => setActiveCorrelation(store, null));
		setIsCorrelationEnabled(false);
		setAppStore(syncTimeRange);
	};
	const openSaveCorrelationModal = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.stopPropagation();
		setCorrelationData((store) => toggleSaveCorrelationModal(store, true));
	}, []);

	const renderJoinOneOptions: SelectProps['renderOption'] = ({ option }) => {
		const fieldType = fields[streamNames[0]]?.fieldTypeMap[option.value];
		return (
			<div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
				{option.label}
				{dataTypeIcons('black')[fieldType]}
			</div>
		);
	};

	const renderJoinTwoOptions: SelectProps['renderOption'] = ({ option }) => {
		const fieldType = fields[streamNames[1]]?.fieldTypeMap[option.value];
		return (
			<div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
				{option.label}
				{dataTypeIcons('black')[fieldType]}
			</div>
		);
	};

	// View Flags
	const hasContentLoaded = !schemaLoading && !loadingState && !streamsLoading && !multipleSchemasLoading;
	const hasNoData = hasContentLoaded && !errorMessage && pageData.length === 0;
	const showTable = hasContentLoaded && !hasNoData && !errorMessage;

	useEffect(() => {
		if (!showTable) return;

		if (targetPage) {
			setCorrelationData((store) => setPageAndPageData(store, targetPage));
			if (currentPage === targetPage) {
				setCorrelationData((store) => setTargetPage(store, undefined));
			}
		}
	}, [loadingState, currentPage]);

	if (isLoading) return;

	return (
		<Box className={classes.correlationWrapper}>
			<SavedCorrelationsModal />
			<SaveCorrelationModal />
			<div className={classes.correlationSideBarWrapper}>
				<Text>Streams</Text>
				<TextInput
					disabled={streamNames.length === 0}
					w="100%"
					radius="md"
					placeholder="Search Fields"
					key="search-fields"
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
				/>
				<div className={classes.streamBox}>
					{Object.entries(fields).map(([stream, fieldsIter]: [any, any]) => {
						if (!fieldsIter) return;
						const filteredFields = filterFields(fieldsIter);
						const totalStreams = Object.entries(fields).length;
						const heightPercentage = totalStreams === 1 ? '50%' : `${100 / totalStreams}%`;

						const isLoading = loadingState || schemaLoading || streamsLoading || multipleSchemasLoading;
						return (
							<div
								key={stream}
								className={classes.streamWrapper}
								style={{
									height: heightPercentage,
									border: `1px solid ${fieldsIter.color}`,
								}}>
								<div className={classes.streamNameWrapper}>
									<Text
										size="md"
										tt="capitalize"
										style={{ color: fieldsIter.headerColor }}
										className={classes.streamName}>
										{stream}
									</Text>
									<IconTrashX
										color={fieldsIter.headerColor}
										cursor="pointer"
										size={14}
										onClick={() => {
											setAppStore((store) => changeStream(store, ''));
											setCorrelationData((store) => setIsCorrelatedFlag(store, false));
											setSelect1Value(null);
											setSelect2Value(null);
											setCorrelationData((store) => deleteStreamData(store, stream));
										}}
									/>
								</div>
								{filteredFields.length > 0 ? (
									<div className={classes.fieldsWrapper}>
										{filteredFields.map((field: string) => {
											const isSelected = selectedFields[stream]?.includes(field);
											const dataType = fieldsIter.fieldTypeMap[field];
											return (
												<CorrelationFieldItem
													key={`${stream}-${field}`}
													headerColor={fieldsIter.headerColor}
													backgroundColor={fieldsIter.backgroundColor}
													iconColor={fieldsIter.iconColor}
													fieldName={field.replace(`${stream}.`, '')}
													dataType={dataType}
													isSelected={isSelected}
													onClick={() => {
														if (isLoading) return;
														if (isCorrelatedData) {
															setIsCorrelationEnabled(true);
															setCorrelationData((store) => setIsCorrelatedFlag(store, false));
														}
														setCorrelationData((store) => setSelectedFields(store, field, stream));
													}}
												/>
											);
										})}
									</div>
								) : (
									<Text className={classes.noFieldText}>No fields match your search.</Text>
								)}
							</div>
						);
					})}
					{streamNames.length === 0 && (
						<>
							{/* First box */}
							<StreamSelectBox
								label="Add Stream 1"
								placeholder="Select Stream 1"
								disabled={false}
								onChange={(value) => value && addStream(value)}
								data={streamData.filter((stream) => !streamNames.includes(stream.value))}
								isFirst={true}
							/>

							{/* Second box */}
							<StreamSelectBox
								label="Add Stream 2"
								placeholder="Select Stream 2"
								disabled={streamNames.length < 1}
								onChange={(value) => addStream(value)}
								data={streamData.filter((stream) => !streamNames.includes(stream.value))}
								isFirst={false}
							/>
						</>
					)}
					{streamNames.length === 1 && (
						<>
							{/* Render the single existing field */}
							<StreamSelectBox
								label="Add Stream 2"
								placeholder="Select Stream 2"
								disabled={loadingState}
								onChange={(value) => addStream(value)}
								data={streamData.filter((stream) => !streamNames.includes(stream.value))}
								isFirst={false}
							/>
						</>
					)}
				</div>
			</div>
			<Stack
				gap={0}
				style={{ maxHeight: maximized ? '100vh' : `calc(100vh - ${PRIMARY_HEADER_HEIGHT}px)` }}
				className={classes.selectionWrapper}>
				<Stack className={classes.topSectionWrapper}>
					<Stack>
						<div className={classes.fieldsJoinsWrapper}>
							<Text
								style={{
									width: '35px',
									color: streamNames.length > 0 ? 'black' : '#CBCBCB',
								}}>
								Fields
							</Text>
							<div
								style={{
									border: streamNames.length > 0 ? '1px solid #CBCBCB' : '1px solid #e1e5e8',
									backgroundColor: streamNames.length > 0 ? 'white' : '#F7F8F9',
								}}
								className={classes.fieldsPillsWrapper}>
								{Object.keys(selectedFields).length < 1 && (
									<Text c={'#ACB5BD'} size="sm">
										Click on fields to correlate
									</Text>
								)}
								{Object.entries(selectedFields).map(([streamName, fieldsMap]: [any, any]) =>
									fieldsMap.map((field: any, index: any) => (
										<CorrelationFieldItem
											key={`${streamName}-${index}`}
											headerColor={fields[streamName]['headerColor']}
											backgroundColor={fields[streamName]['backgroundColor']}
											iconColor={fields[streamName]['iconColor']}
											fieldName={field}
											onDelete={() => {
												isCorrelatedData && setIsCorrelationEnabled(true);
												setCorrelationData((store) => deleteSelectedField(store, field, streamName));
											}}
										/>
									)),
								)}
							</div>
						</div>
						<div className={classes.fieldsJoinsWrapper} style={{ height: STREAM_PRIMARY_TOOLBAR_HEIGHT }}>
							<Text
								style={{
									width: '35px',
									color: streamNames.length > 0 ? 'black' : '#CBCBCB',
									flexShrink: 0,
									flexGrow: 0,
								}}>
								Joins
							</Text>
							<div className={classes.joinsWrapper}>
								<div style={{ width: '50%' }}>
									<Select
										styles={{
											input: { height: 26 },
										}}
										disabled={streamNames.length === 0}
										placeholder={streamNames[0] ? `Select field from ${streamNames[0]}` : 'Select Stream 1'}
										style={{ height: '100%' }}
										radius="md"
										data={
											streamNames.length > 0
												? Object.keys(fields[streamNames[0]].fieldTypeMap).filter(
														(key) => fields[streamNames[0]].fieldTypeMap[key] !== 'list',
												  )
												: []
										}
										value={select1Value}
										onChange={(value) => handleFieldChange(value, true)}
										renderOption={renderJoinOneOptions}
									/>
								</div>
								<Text size="md"> = </Text>
								<div style={{ width: '50%' }}>
									<Select
										styles={{
											input: { height: 26 },
										}}
										disabled={streamNames.length < 2}
										placeholder={streamNames[1] ? `Select field from ${streamNames[1]}` : 'Select Stream 2'}
										radius="md"
										data={
											streamNames.length > 1
												? Object.keys(fields[streamNames[1]].fieldTypeMap).filter(
														(key) => fields[streamNames[1]].fieldTypeMap[key] !== 'list',
												  )
												: []
										}
										value={select2Value}
										onChange={(value) => handleFieldChange(value, false)}
										renderOption={renderJoinTwoOptions}
									/>
								</div>
								<div style={{ height: '100%', width: '20%', display: 'flex' }}>
									{isCorrelatedData && (
										<Badge
											variant="outline"
											color="#535BED"
											h={'100%'}
											size="lg"
											styles={{
												root: {
													textTransform: 'none',
												},
											}}
											rightSection={
												<IconX
													style={{ cursor: 'pointer' }}
													size={12}
													color="#535BED"
													onClick={() => {
														setSelect1Value(null);
														setSelect2Value(null);
														setCorrelationData((store) => setCorrelationCondition(store, ''));
														setCorrelationData((store) => setIsCorrelatedFlag(store, false));
														setCorrelationData((store) => setCorrelationId(store, ''));
														setCorrelationData((store) => setActiveCorrelation(store, null));
														setIsCorrelationEnabled(false);
														setAppStore(syncTimeRange);
													}}
												/>
											}>
											Join Applied
										</Badge>
									)}
								</div>
								<div style={{ display: 'flex', gap: '5px', alignItems: 'center', height: '25px' }}>
									<Button
										className={classes.correlateBtn}
										variant="outline"
										disabled={!isCorrelatedData}
										onClick={(e) => {
											openSaveCorrelationModal(e);
										}}>
										Save
									</Button>
									<Button
										className={classes.correlateBtn}
										disabled={!isCorrelationEnabled || Object.keys(selectedFields).length === 0}
										variant="filled"
										onClick={() => {
											setCorrelationData((store) => setIsCorrelatedFlag(store, true));
											setIsCorrelationEnabled(false);
											refetchCount();
											getCorrelationData();
										}}>
										Correlate
									</Button>
									<Button
										className={classes.clearBtn}
										onClick={clearQuery}
										disabled={streamNames.length == 0 || Object.keys(selectedFields).length === 0}>
										Clear
									</Button>
								</div>
							</div>
						</div>
					</Stack>
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							width: '100%',
						}}>
						{/* <CorrelationFilters /> */}
						<div className={classes.logTableControlWrapper}>
							<div style={{ display: 'flex', gap: '10px' }}>
								<SavedCorrelationsButton />
								<TimeRange />
								<RefreshInterval />
								<RefreshNow />
							</div>
							<div style={{ display: 'flex', gap: '10px' }}>
								<ViewToggle />
								<ShareButton />
								<MaximizeButton />
							</div>
						</div>
					</div>
				</Stack>
				<Stack className={classes.logsSecondaryToolbar} style={{ height: STREAM_SECONDARY_TOOLBAR_HRIGHT }}>
					<MultiEventTimeLineGraph />
				</Stack>
				{Object.keys(selectedFields).length > 0 && (
					<>
						{viewMode === 'table' ? (
							<>
								<CorrelationTable
									{...{ errorMessage, logsLoading: loadingState, streamsLoading, showTable, hasNoData }}
									primaryHeaderHeight={primaryHeaderHeight}
								/>
							</>
						) : (
							<CorrleationJSONView
								{...{ errorMessage, logsLoading: loadingState, streamsLoading, showTable, hasNoData }}
							/>
						)}
						<CorrelationFooter loaded={showTable} hasNoData={hasNoData} isFetchingCount={countLoading} />
					</>
				)}
				{Object.keys(selectedFields).length === 0 && (
					<Center className={classes.container}>
						<CorrelationEmptyPlaceholder height={200} width={200} />
						<Stepper
							styles={{
								stepBody: {
									marginTop: '5%',
									color: 'var(--mantine-color-gray-6)',
								},
								stepCompletedIcon: {
									color: '#535BED',
								},
								stepIcon: {
									color: 'var(--mantine-color-gray-6)',
								},
							}}
							color="gray"
							active={streamNames.length}
							orientation="vertical">
							<Stepper.Step label="Select first stream" />
							<Stepper.Step label="Select second stream" />
							<Stepper.Step label="Click on fields to correlate" />
						</Stepper>
					</Center>
				)}
			</Stack>
		</Box>
	);
};
export default Correlation;
