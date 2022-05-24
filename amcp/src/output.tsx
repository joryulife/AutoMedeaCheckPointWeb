import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';


export default function OutPut(props:any) {

    const tutorial = "開始時間~ キーワード群\nの順に表示されます。\n\n"

    const index: string[] = [
        "00:00:00~ 解析区間外\n",
        "00:00:21~ マイナス * 行 席 数 成分 横 普通 かけ 今日\n",
        "00:17:21~ 解析区間外\n",
        "00:17:46~ ベクトル * 一次 平面 二つ ケース 平行 組 場合 高校\n",
        "00:31:15~ 解析区間外\n",
        "00:32:25~ マイナス 計算 * 行列式 因子 AI プラス −1 注目 部分\n",
        "00:59:47~ 解析区間外\n",
        "01:00:05~ 行列 独立 変換 計算 X 全部 固有値 一次 対角化 固有ベクトル\n"
    ]
    /*const handleChange = (t : string[]) => {
        let IndexText = "";
        for(let T of t){
            IndexText+=T;
        }
        setIndex({
            ...Index,
            IndexT:IndexText
        })
    };*/
    const [Files,setFiles] = React.useState({
        movies : [],
        times  : []
    });
    const [indexText,setIndex] = React.useState({
        IndexT : ""
    });
    const [selectFile,setFile] = React.useState({
        time : "",
        movie : "",
    });
    const handleChange1 = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFile({
            ...selectFile,
            time:event.target.value
        });
    };
    const handleChange2 = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFile({
            ...selectFile,
            movie:event.target.value
        });
    };
    function login (id:string) {
        if(id!==""){
            return false
        }else{
            return true
        }
    }
    var formData = new FormData()
    const requestOptionsFiles ={
        method: 'POST',
        body: formData
    };
    return (
        <Box
            sx={{
                '& .MuiTextField-root': { m: 1, width: '70ch' },
            }}
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
                ファイル取得
            </Button>
            <Box
                component="form"
                sx={{
                    '& .MuiTextField-root': { m: 1, width: '25ch' },
                }}
                noValidate
                autoComplete="off"
            >
                <div>
                    <TextField
                        id="outlined-select-currency"
                        select
                        label="your MovieFiles"
                        value={selectFile.time}
                        helperText=""
                        onChange={handleChange1}
                    >
                        {Files.times.map((value) => (
                            <MenuItem key={value} value={value}>
                                {value}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        id="outlined-select-currency"
                        select
                        label="your TimeFiles"
                        value={selectFile.movie}
                        helperText=""
                        onChange={handleChange2}
                    >
                        {Files.movies.map((value) => (
                            <MenuItem key={value} value={value}>
                                {value}
                            </MenuItem>
                        ))}
                    </TextField>
                </div>
            </Box>
            <Stack direction="row" spacing={2}>
                <Button 
                    variant="contained"
                    onClick={()=>{
                        const requestOptions ={
                            method: 'POST',
                            headers:{'Content-Type': 'application/json'},
                            body: JSON.stringify({
                                time: selectFile.time,
                                movie: selectFile.movie
                            })
                        };
                        var url = "http://localhost:8080/MAKEINDEX?id="+props.id
                        fetch(url,requestOptions)
                        .then((response)=> response.json())
                        .then((responseJson) =>{
                            console.log(responseJson);
                            let IndexText = tutorial;
                            for(let T of index){
                                IndexText+=T;
                            }
                            IndexText+=responseJson.output
                            setTimeout(()=>{
                                setIndex({
                                    ...indexText,
                                    IndexT:IndexText
                                })
                            },5000)
                        })
                    }}
                >
                    作成
                </Button>
            </Stack>
            <TextField
                id="outlined-multiline-flexible"
                multiline
                fullWidth
                label={tutorial}
                value={indexText.IndexT}
            >
            </TextField>
        </Box>
    );
}