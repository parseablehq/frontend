import { Box, Loader, px, Stack } from '@mantine/core';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import SideBar from './SideBar';
import Dashboard from './Dashboard';
import { useDashboardsStore } from './providers/DashboardsProvider';
import CreateDashboardModal from './CreateDashboardModal';
import { useEffect } from 'react';
import { useDashboardsQuery } from '@/hooks/useDashboards';

const LoadingView = () => {
	return (
		<Stack style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
			<Loader/>
		</Stack>
	)
}

const Dashboards = () => {
	const [dashboards] = useDashboardsStore(store => store.dashboards);
	const { fetchDashboards } = useDashboardsQuery();
	useEffect(() => {
		fetchDashboards();
	}, []);

	return (
		<Box
			style={{
				flex: 1,
				display: 'flex',
				position: 'relative',
				flexDirection: 'row',
				width: '100%',
			}}>
			{dashboards === null ? (
				<LoadingView />
			) : (
				<>
					<SideBar />
					<CreateDashboardModal />
					<Dashboard />
				</>
			)}
		</Box>
	);
};

export default Dashboards;
