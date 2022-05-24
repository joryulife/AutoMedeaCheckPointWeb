import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';

function toTime(t : number){
    let mod = t%3600;
    let h = (t-mod)/3600;
    mod = (t-h*3600)%60;
    let m = (t-h*3600-mod)/60;
    let s = (t-h*3600-m*60);
    let sh,sm,ss;
    if(Math.round(h)<10){
        sh = "0" + h.toString();
    }else{
        sh = h.toString();
    }
    if(Math.round(m)<10){
        sm = "0" + m.toString();
    }else{
        sm = m.toString();
    }
    if(Math.round(s)<10){
        ss = "0" + s.toFixed(0);
    }else{
        ss = s.toFixed(0);
    }
    let timeString = sh+":"+sm+":"+ss;
    return timeString;
}

export default function ContainedButtons(props:any) {
    const [recordState, setState] = React.useState({
        start: false,
        break: true,
        stop:  true,
        save:  true
    });
    const [startButtonMessage,setMessage] = React.useState({
        Message:"スタート",
        state:0
    })
    const [date,setDate] = React.useState({
        t: new Date()
    });
    let timeArray: number[] = [];
    let flagArray: boolean[] = [];
    const [timestamp, setStamp] = React.useState({
        time : timeArray,
        flag : flagArray
    });
    const [filenameState,setFilename] = React.useState({
        filename: "",
        setName: false
    })
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilename({
            ...filenameState,
            filename: event.target.value
        });
    };
    const requestOptionsTIMESTAMP ={
        method: 'POST',
        headers:{'Content-Type': 'application/json'},
        body: JSON.stringify({"filename":filenameState.filename,"timeArray":timestamp.time,"flagArray":timestamp.flag})
    };

    return (
        <Box>
            <Box
                component="form"
                sx={{
                    '& > :not(style)': { m: 1, width: '50ch' },
                }}
                noValidate
                autoComplete="off"
                >
                <p>{props.message}</p>
                <p>雑談、休憩など解析に含めない時間は一時停止を押してください。本題に戻る時スタートで再開できます。</p>
                <TextField 
                    id="outlined-basic" 
                    label="保存するファイル名を指定してください。(拡張子は不要)"
                    variant="outlined" 
                    onChange={handleChange}
                />
                <p></p>
                <Button
                    variant="contained"
                    onClick={()=>{
                        console.log(filenameState.filename);
                        setFilename({
                            ...filenameState,
                            setName: true
                        })
                    }}
                >
                    File Name Set
                </Button>
            </Box>
            <p></p>
            <Stack direction="row" spacing={2}>
                <Button 
                    variant="contained"
                    onClick={()=>{
                        if(startButtonMessage.state==0){
                            let copyList = [...timestamp.time];
                            let copyListF = [...timestamp.flag];
                            if(copyList.length === 0){
                                copyList.push(0);
                                copyListF.push(true);
                            }else{
                                let tl = timestamp.time.length;
                                let nt = new Date();
                                let ott = date.t.getTime();
                                let ntt = nt.getTime();
                                copyList.push((timestamp.time[tl-1] + (ntt-ott)/1000));
                                copyListF.push(true);
                            }
                            setStamp({
                                ...timestamp,
                                time : copyList,
                                flag : copyListF
                            })
                            setState({
                                ...recordState,
                                start: false,
                                break: false,
                                stop:  false,
                                save:  true
                            });
                            setMessage({
                                ...startButtonMessage,
                                Message:"タイムスタンプ",
                                state:1
                            })
                            setDate({
                                ...date,
                                t : new Date()
                            })
                        }else if(startButtonMessage.state==1){
                            let copyList = [...timestamp.time];
                            let copyListF = [...timestamp.flag];
                            let tl = timestamp.time.length;
                            let nt = new Date();
                            let ott = date.t.getTime();
                            let ntt = nt.getTime();
                            copyList.push((timestamp.time[tl-1] + (ntt-ott)/1000));
                            copyListF.push(true);
                            setStamp({
                                ...timestamp,
                                time : copyList,
                                flag : copyListF
                            })
                            setState({
                                ...recordState,
                                start: false,
                                break: false,
                                stop:  false,
                                save:  true
                            });
                            setDate({
                                ...date,
                                t : new Date()
                            })
                        }else if(startButtonMessage.state==2){
                            let copyList = [...timestamp.time];
                            let copyListF = [...timestamp.flag];
                            let tl = timestamp.time.length;
                            let nt = new Date();
                            let ott = date.t.getTime();
                            let ntt = nt.getTime();
                            copyList.push((timestamp.time[tl-1] + (ntt-ott)/1000));
                            copyListF.push(true);
                            setStamp({
                                ...timestamp,
                                time : copyList,
                                flag : copyListF
                            })
                            setState({
                                ...recordState,
                                start: false,
                                break: false,
                                stop:  false,
                                save:  true
                            });
                            setMessage({
                                ...startButtonMessage,
                                Message:"タイムスタンプ",
                                state:1
                            })
                            setDate({
                                ...date,
                                t : new Date()
                            })
                        }
                        
                    }}
                    disabled={recordState.start}
                >
                    {startButtonMessage.Message}
                </Button>
                <Button
                    variant="contained"

                    onClick={()=>{
                        let copyList = [...timestamp.time];
                        let copyListF = [...timestamp.flag];
                        let tl = timestamp.time.length;
                        let nt = new Date();
                        let ott = date.t.getTime();
                        let ntt = nt.getTime();
                        copyList.push((timestamp.time[tl-1] + (ntt-ott)/1000));
                        copyListF.push(false);
                        setStamp({
                            ...timestamp,
                            time : copyList,
                            flag : copyListF
                        })
                        setState({
                            ...recordState,
                            start: false,
                            break: true,
                            stop:  false,
                            save:  true
                        });
                        setMessage({
                            ...startButtonMessage,
                            Message:"再開&タイムスタンプ",
                            state:2
                        })
                        setDate({
                            ...date,
                            t: new Date()
                        })
                    }}
                    disabled={recordState.break}
                >
                    一時中断
                </Button>
                <Button 
                    variant="contained"
                    onClick={()=>{
                        setState({
                            ...recordState,
                            start: true,
                            break: true,
                            stop:  true,
                            save:  false
                        });
                        let copyList = [...timestamp.time];
                        let copyListF = [...timestamp.flag];
                        let tl = timestamp.time.length;
                        let nt = new Date();
                        let ott = date.t.getTime();
                        let ntt = nt.getTime();
                        copyList.push((timestamp.time[tl-1] + (ntt-ott)/1000));
                        copyListF.push(false);
                        setStamp({
                            ...timestamp,
                            time : copyList,
                            flag : copyListF
                        })
                        setMessage({
                            ...startButtonMessage,
                            Message:"スタート",
                            state:0
                        })
                    }}
                    disabled={recordState.stop}
                >
                    停止
                </Button>
                <Button
                    variant="contained"
                    onClick={()=>{
                        var url = "http://localhost:8080/SAVESTAMP?ID="+props.id
                        console.log(url);
                        fetch(url,requestOptionsTIMESTAMP)
                        .then((response)=> response.json())
                        .then((responseJson) =>{
                        console.log(responseJson)
                        })
                        .catch(e=>{
                            console.log(e);
                        })
                        if(filenameState.setName){
                            setState({
                                ...recordState,
                                start: false,
                                break: true,
                                stop:  true,
                                save:  true
                            });
                        }

                    }}
                    disabled={recordState.save}
                >
                    保存
                </Button>
                <Button 
                    variant="contained"
                    onClick={()=>{
                        let copyList : any = [];
                        let copyListF : any = [];
                        setState({
                            ...recordState,
                            start: false,
                            break: true,
                            stop:  true,
                            save:  true
                        });
                        setMessage({
                            ...startButtonMessage,
                            Message:"スタート",
                            state:0
                        })
                        setStamp({
                            ...timestamp,
                            time : copyList,
                            flag : copyListF
                        })
                    }}
                >
                    リセット※記録は破棄されます
                </Button>
            </Stack>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>時刻</TableCell>
                            <TableCell >フラグ</TableCell>
                            <TableCell >区間時間</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {timestamp.time.map((item,index) => {
                            let interval = timestamp.time[index+1]-item;
                            if(timestamp.flag[index]){
                                return(
                                    <TableRow
                                        key={index}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {toTime(item)}~
                                        </TableCell>
                                        <TableCell >解析区間</TableCell>
                                        <TableCell >{toTime(interval)}</TableCell>
                                    </TableRow>
                                )
                            }else{
                                return(
                                    <TableRow
                                        key={index}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {toTime(item)}~
                                        </TableCell>
                                        <TableCell >中断区間</TableCell>
                                        <TableCell >{toTime(interval)}</TableCell>
                                    </TableRow>
                                )
                            }
                            
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}