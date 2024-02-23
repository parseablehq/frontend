import { Box, Button, Modal, Text, Tooltip, px } from '@mantine/core';
import { FC, useEffect, useMemo } from 'react';
import { useAbout } from '@/hooks/useGetAbout';
import { IconAlertCircle, IconBook2, IconBrandGithub, IconBrandSlack, IconBusinessplan } from '@tabler/icons-react';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import styles from './styles/HelpModal.module.css'

const helpResources = [
	{
		icon: IconBusinessplan,
		title: 'Production support',
		description: 'Get production support',
		href: 'mailto:sales@parseable.io?subject=Production%20Support%20Query', //https://www.parseable.io/pricing
	},
	{
		icon: IconBrandSlack,
		title: 'Slack',
		description: 'Join the Slack community',
		href: 'https://join.slack.com/t/parseable/shared_invite/zt-23t505gz7-zX4T10OvkS8RAhnme4gDZQ',
	},
	{
		icon: IconBrandGithub,
		title: 'GitHub',
		description: 'Find resources on GitHub',
		href: 'https://github.com/parseablehq/parseable',
	},
	{
		icon: IconBook2,
		title: 'Documentation',
		description: 'Refer the documentation',
		href: 'https://www.parseable.com/docs',
	},
];

type HelpCardProps = {
	data: (typeof helpResources)[number];
};

const HelpCard: FC<HelpCardProps> = (props) => {
	const { data } = props;

	const classes = styles;
	const { HelpIconBox } = classes;

	return (
		<Tooltip label={data.description} position="bottom" withArrow style={{ color: 'white', backgroundColor: 'black' }}>
			<Button className={HelpIconBox} component={'a'} href={data.href} target="_blank">
				<data.icon size={px('1.2rem')} stroke={1.5} />
			</Button>
		</Tooltip>
	);
};

type HelpModalProps = {
	opened: boolean;
	close(): void;
};

const HelpModal: FC<HelpModalProps> = (props) => {
	const { opened, close } = props;
	const {
		state: { subInstanceConfig },
	} = useHeaderContext();

	const { getAboutData, getAboutIsError, getAboutIsLoading } = useAbout();

	const llmStatus = useMemo(() => {
		let status = 'LLM API Key not set';
		if (getAboutData?.data?.llmActive) {
			status = `${getAboutData?.data.llmProvider} configured`;
		}
		return status;
	}, [getAboutData?.data?.llmActive]);

	useEffect(() => {
		if (getAboutData?.data) {
			subInstanceConfig.set(getAboutData?.data);
		}
	}, [getAboutData?.data]);

	const classes = styles;
	const {
		container,
		aboutTitle,
		aboutDescription,
		actionBtn,
		helpIconContainer,
		aboutTextBox,
		aboutTextKey,
		aboutTextValue,
		aboutTextInnerBox,
		actionBtnRed,
	} = classes;

	return (
		<Modal opened={opened} onClose={close} withinPortal withCloseButton={false} size="xl" centered padding={40}>
			<Box className={container}>
				<Text className={aboutTitle}>Need help?</Text>
				<Text className={aboutDescription}>Ensure uninterrupted deployment</Text>
				<Box mt={15} className={helpIconContainer}>
					{helpResources.map((data) => (
						<HelpCard key={data.title} data={data} />
					))}
				</Box>
			</Box>
		</Modal>
	);
};

export default HelpModal;
