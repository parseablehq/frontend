import bugError from '@/assets/images/bug_error.webp';
import { HOME_ROUTE } from '@/constants/routes';
import FullPageLayout from '@/layouts/FullPageLayout';
import type { ImageProps } from '@mantine/core';
import { Box, Button, Center, Group, Image, Text, Title } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import type { FC } from 'react';
import classes from './Errors.module.css';

const Illustration: FC<ImageProps> = (props) => {
	return <Image src={bugError} {...props} alt="Bug" mx="auto" />;
};

const BugPage: FC = () => {
	useDocumentTitle('Oops!');

	const onHome = () => {
		window.location.href = HOME_ROUTE;
	};

	const { container, titleStyle, descriptionStyle } = classes;

	return (
		<FullPageLayout>
			<Center className={container}>
				<Box>
					<Illustration maw={400} />
					<Title className={titleStyle}>Oops</Title>
					<Text color="dimmed" size="lg" ta="center" className={descriptionStyle}>
						Sorry, it seems like something unexpected happened. We now know about this mistake and are working to fix
						it.
					</Text>
					<Group justify="center">
						<Button variant="outline" size="md" onClick={onHome}>
							Take me back to home page
						</Button>
					</Group>
				</Box>
			</Center>
		</FullPageLayout>
	);
};

export default BugPage;
