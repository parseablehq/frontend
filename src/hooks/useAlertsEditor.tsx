import { useMutation, useQuery } from 'react-query';
import { getLogStreamAlerts, putLogStreamAlerts } from '@/api/logStream';
import { notifyError, notifySuccess } from '@/utils/notification';
import { AxiosError } from 'axios';

export const useAlertsEditor = (streamName: string) => {
	const { mutate: updateLogStreamAlerts } = useMutation((data: any) => putLogStreamAlerts(streamName, data), {
		onSuccess: () => notifySuccess({ message: 'Updated Successfully' }),
		onError: (data: AxiosError) => {
			if (data.message) {
				notifyError({ message: data.message });
			}
		},
	});

	return {
		updateLogStreamAlerts,
	};
};

export const useGetAlerts = (streamName: string) => {
	const {
		data: getLogAlertData,
		isError: getLogAlertIsError,
		isSuccess: getLogAlertIsSuccess,
		isLoading: getLogAlertIsLoading,
	} = useQuery(['fetch-log-stream-alert', streamName], () => getLogStreamAlerts(streamName), {
		retry: false,
		enabled: streamName !== '',
		refetchOnWindowFocus: false,
	});

	return {
		getLogAlertData,
		getLogAlertIsError,
		getLogAlertIsSuccess,
		getLogAlertIsLoading,
	};
};
