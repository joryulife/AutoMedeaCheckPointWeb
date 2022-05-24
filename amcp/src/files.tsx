import * as React from 'react';
import Box from '@mui/material/Box';
import { Button } from '@mui/material';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import 'react-dropzone-uploader/dist/styles.css'
import Dropzone , { IDropzoneProps, ILayoutProps } from 'react-dropzone-uploader'

function login (id:string) {
    if(id!==""){
        return false
    }else{
        return true
    }
}
export default function SelectTextFields(props:any) {
    const [Files,setFiles] = React.useState({
        movies : [],
        times  : []
    });
    const [open, setOpen] = React.useState({
        time : false,
        movie : false
    });
    const handleClick1 = () => {
        console.log(open);
        setOpen({
            ...open,
            time : !open.time,
            movie : open.movie
        });
        console.log(open);
    };
    const handleClick2 = () => {
        setOpen({
            ...open,
            time : open.time,
            movie : !open.movie
        });
    };
    var formData = new FormData()
    const requestOptionsFiles ={
        method: 'POST',
        body: formData
    };
    const Layout = ({ input, previews, submitButton, dropzoneProps, files, extra: { maxFiles } }: ILayoutProps) => {
        return (
            <div>
                {previews}
        
                <div {...dropzoneProps}>{files.length < maxFiles && input}</div>
        
                {files.length > 0 && submitButton}
            </div>
        )
    }
    const MyUploader = () => {
        const getUploadParams : IDropzoneProps['getUploadParams'] = () => { return { url: 'http://localhost:8080/MOVIEUPLOAD?ID='+props.id } }
        const handleSubmit: IDropzoneProps['onSubmit'] = (files, allFiles) => {
            console.log(files.map(f => f.meta))
            allFiles.forEach(f => f.remove())
        }
        return (
            <Dropzone
                getUploadParams={getUploadParams}
                LayoutComponent={Layout}
                onSubmit={handleSubmit}
                inputContent="Drug & Drop or Click here & Select"
                accept="image/*,video/*"
            />
        )
    }

    return (
        <Box
            component="form"
            sx={{
                '& .MuiTextField-root': { m: 1, width: '25ch' },
            }}
            noValidate
            autoComplete="off"
        >
            <p>{props.message}</p>
            <Button
                variant="contained"
                disabled={login(props.id)}
                onClick={()=>{
                    let url = "http://localhost:8080/FILES?ID="+props.id
                    fetch(url,requestOptionsFiles)
                    .then((response)=> response.json())
                    .then((responseJson) =>{
                        console.log(responseJson);
                        if(responseJson.movie == null && responseJson.time != null){
                            console.log(responseJson.movie);
                            setFiles({
                                ...Files,
                                times : responseJson.time,
                                movies : []
                            })
                        }else if(responseJson.movie != null && responseJson.time == null){
                            console.log(responseJson.time);
                            setFiles({
                                ...Files,
                                times : [],
                                movies : responseJson.movie
                            })
                        }else if(responseJson.movie != null && responseJson.time != null){
                            setFiles({
                                ...Files,
                                times : responseJson.time,
                                movies : responseJson.movie
                            })
                        }else{
                            setFiles({
                                ...Files,
                                times : [],
                                movies : []
                            })
                        }
                    })
                }}
            >
                一覧取得
            </Button>
            <div>
                <ListItemButton onClick={handleClick1}>
                    <ListItemText primary="TimeStampFile" />
                    {open.time ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                    <Collapse in={open.time} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {Files.times.map((n)=>(
                                <ListItemText primary={n} />
                            ))}
                        </List>
                    </Collapse>
                <ListItemButton onClick={handleClick2}>
                    <ListItemText primary="MovieFile" />
                    {open.movie ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                    <Collapse in={open.movie} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {Files.movies.map((n)=>(
                                <ListItemText primary={n} />
                            ))}
                        </List>
                    </Collapse>
            </div>
            <p>録画のアップロード</p>
            < MyUploader />
        </Box>
    );
}