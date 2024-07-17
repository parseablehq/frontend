import { parseLogData } from '@/utils';
import { Group, Stack, ActionIcon, Tooltip, Box } from '@mantine/core';
import { IconArrowNarrowRight } from '@tabler/icons-react';
import { FC, Fragment, useCallback, MouseEvent, useState, useEffect } from 'react';
import { Log } from '@/@types/parseable/api/query';
import tableStyles from '../../styles/Logs.module.css';
import { useLogsStore, logsStoreReducers } from '../../providers/LogsProvider';
import { IconCopy, IconCheck } from '@tabler/icons-react';

const columnsToSkip = ['p_metadata', 'p_tags'];

const { setSelectedLog } = logsStoreReducers;

type LogRowProps = {
	rowArrows?: boolean;
	isPinned?: boolean;
};

const CopyFieldValue = (props: { fieldValue: any }) => {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (copied) {
			const timer = setTimeout(() => {
				setCopied(false);
			}, 2000);
			return () => clearTimeout(timer);
		}
	}, [copied]);

	const copy = useCallback(async () => {
		await navigator.clipboard.writeText(props.fieldValue);
	},[props.fieldValue]);

	const handleCopyBtnClick = useCallback(
		async (e: MouseEvent) => {
			e.stopPropagation();
			await copy();
			setCopied(true);
		},
		[copy],
	);

	return (
		<Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
			<ActionIcon variant="subtle" onClick={handleCopyBtnClick}>
				{copied ? (
					<IconCheck size={12} style={{ backgroundColor: 'transparent', color: '#211F1F' }} stroke={1.5} />
				) : (
					<IconCopy size={12} style={{ backgroundColor: 'transparent', color: '#211F1F' }} stroke={1.5} />
				)}
			</ActionIcon>
		</Tooltip>
	);
};

const LogRow: FC<LogRowProps> = (props) => {
	const [hoveredCell, setHoveredCell] = useState<string | null>(null);
	const { isPinned, rowArrows } = props;
	const classes = tableStyles;
	const { trStyle, trEvenStyle } = classes;
	const [tableOpts, setLogsStore] = useLogsStore((store) => store.tableOpts);
	const { pinnedColumns, disabledColumns, headers, pageData } = tableOpts;
	const columnsToIgnore = [
		...disabledColumns,
		...columnsToSkip,
		...headers.filter((header) => (isPinned ? !pinnedColumns.includes(header) : pinnedColumns.includes(header))),
	];
	const columnsToShow = headers.filter((header) => !columnsToIgnore.includes(header));

	const handleMouseHover = useCallback(( isCursorInside: boolean, row?: number, column?: number) => {
		if (!isCursorInside) {
			setHoveredCell(null);
		} else {
			setHoveredCell(`${row}-${column}`);
		}
	}, []);

	const onClick = useCallback((log: Log) => {
		const selectedText = window.getSelection()?.toString();
		if (selectedText !== undefined && selectedText?.length > 0) return;

		setLogsStore((store) => setSelectedLog(store, log));
	}, []);

	return (
		<Fragment>
			{pageData.map((log, logIndex) => (
				<tr key={logIndex} className={logIndex % 2 ? trStyle : trEvenStyle} onClick={() => onClick(log)}>
					{columnsToShow.map((header, logSchemaIndex) => {
						const parsedData = parseLogData(log[header], header);

						return (
							<td
								key={`${header}-${logSchemaIndex}`}
								onMouseEnter={() => handleMouseHover( true, logIndex, logSchemaIndex,)}
								onMouseLeave={() => handleMouseHover(false)}>
								<Group style={{ position: 'relative' }} wrap="nowrap">
									{parsedData}
									{hoveredCell === `${logIndex}-${logSchemaIndex}` && (
										<Stack
											style={{
												position: 'absolute',
												right: '0',
												background: 'white',
											}}>
											<CopyFieldValue fieldValue={parsedData} />
										</Stack>
									)}
								</Group>
							</td>
						);
					})}
					{rowArrows && <ViewLogArrow />}
				</tr>
			))}
		</Fragment>
	);
};

const ViewLogArrow: FC = () => {
	const classes = tableStyles;
	const { tdArrow, tdArrowContainer } = classes;

	return (
		<td className={tdArrow}>
			<Box className={tdArrowContainer}>
				<IconArrowNarrowRight size={'1.4rem'} stroke={1} />
			</Box>
		</td>
	);
};

export default LogRow;
