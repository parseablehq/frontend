import { useMutation, useQuery } from 'react-query';
import { getLogStreamAlerts, putLogStreamAlerts } from '@/api/logStream';
import { IconCheck, IconFileAlert } from '@tabler/icons-react';
import { notifyApi } from '@/utils/notification';
import { notifications } from '@mantine/notifications';
import useMountedState from './useMountedState';

export const useAlertsEditor = (streamName: string) => {
	const [alertQuery, setAlertQuery] = useMountedState<string | undefined>('');

	const {
		mutate: updateLogStreamAlerts,
		data: alertQueryData,
		isSuccess: updateLogStreamIsSuccess,
	} = useMutation((data: string) => putLogStreamAlerts(streamName, data), {
		onSuccess: () => {
			notifyApi({
				color: 'green',
				message: 'Alert Added.',
				icon: <IconCheck size="1rem" />,
			});
		},
		onError: () => {
			notifyApi(
				{
					color: 'red',
					title: 'Error occurred',
					message: `Error occurred, please check your query and try again`,
					icon: <IconFileAlert size="1rem" />,
					autoClose: 3000,
				},
				true,
			);
		},
	});

	const { data: getLogAlertData } = useQuery(
		['fetch-log-stream-alert', streamName, updateLogStreamIsSuccess],
		() => getLogStreamAlerts(streamName),
		{
			onError: () => {
				notifyApi({
					color: 'red',
					message: 'Failed to log streams alert',
					icon: <IconFileAlert size="1rem" />,
				});
			},
			retry: false,
			enabled: streamName !== '',
		},
	);

	const handleAlertQueryChange = (value: string | undefined) => setAlertQuery(value);

	const submitAlertQuery = () => {
		try {
			JSON.parse(alertQuery!);
			updateLogStreamAlerts(alertQuery!);
		} catch (e) {
			notifications.show({
				id: 'load-data',
				loading: false,
				color: 'red',
				title: 'Error occurred',
				message: `Error occurred, please check your query and try again ${e}`,
				icon: <IconFileAlert size="1rem" />,
				autoClose: 3000,
			});
		}
	};

	return {
		alertQuery,
		handleAlertQueryChange,
		submitAlertQuery,
		alertQueryData,
		getLogAlertData,
	};
};
