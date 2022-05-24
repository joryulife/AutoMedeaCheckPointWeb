import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LoginFrom from './loginform';
import Files from './files';
import Record from './record';
import OutPut from './output';


interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
        role="tabpanel"
        hidden={value !== index}
        id={`vertical-tabpanel-${index}`}
        aria-labelledby={`vertical-tab-${index}`}
        {...other}
        >
        {value === index && (
            <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
            </Box>
        )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

export default function VerticalTabs() {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const [Info,setInfo] = React.useState({
        id:"",
        username : "",
        message : "あなたは現在ログインしていません。"
    });

    const ChangeInfo = (e1:any ,e2 : any) => {
        setInfo({
            ...Info,
            id:e1,
            username : e2,
            message : "あなたは現在" + e2 + "でログインしています。"
        })
        console.log(Info);
    }

    return (
        <Box
        sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: 224 }}
        >
            <Tabs
                orientation="vertical"
                variant="scrollable"
                value={value}
                onChange={handleChange}
                aria-label="Vertical tabs example"
                sx={{ borderRight: 1, borderColor: 'divider' }}
            >
                <Tab label="Sign In/Sign Up" {...a11yProps(0)} />
                <Tab label="Record" {...a11yProps(1)} />
                <Tab label="Files" {...a11yProps(2)} />
                <Tab label="OutPut" {...a11yProps(3)} />
            </Tabs>
            <TabPanel value={value} index={0}>
                <LoginFrom ChangeInfo={ChangeInfo} id={Info.id} username={Info.username} message={Info.message}/>
            </TabPanel>
            <TabPanel value={value} index={1}>
                <Record id={Info.id} message={Info.message}/>
            </TabPanel>
            <TabPanel value={value} index={2}>
                <Files id={Info.id} message={Info.message}/>
            </TabPanel>
            <TabPanel value={value} index={3}>
                <OutPut id={Info.id} message={Info.message}/>
            </TabPanel>
        </Box>
    );
}