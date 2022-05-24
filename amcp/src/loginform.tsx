import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
const LoginForm = (props:any) => {
    function ChangeInfo(e1:any,e2:any) {
        return props.ChangeInfo(e1,e2)
    }
    const [Info,setInfo] = React.useState({
        id       : props.id,
        username : props.username,
        password : props.password,
        message  : props.message
    });
    const requestOptionsSignUp ={
        method: 'POST',
        headers:{'Content-Type': 'application/json'},
        body: JSON.stringify({username:Info.username,password:Info.password})
    };
    const requestOptionsLogin ={
        method: 'POST',
        headers:{'Content-Type': 'application/json'},
        body: JSON.stringify({username:Info.username,password:Info.password})
    };
    const onChanged1 = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInfo({
            ...Info,
            username : event.target.value,
        })
    };
    const onChanged2 = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInfo({
            ...Info,
            password : event.target.value,
        })
    };
    return (
        <Box
            component="form"
            sx={{
                '& > :not(style)': { m: 1, width: '25ch' },
            }}
            noValidate
            autoComplete="off"
        >
            <p>{Info.message}</p>
            <TextField 
                id="outlined-basic"
                label="Username" 
                variant="outlined" 
                value={Info.username}
                onChange={onChanged1}
            />
            <TextField
                id="outlined-password-input"
                label="Password"
                variant="outlined" 
                value={Info.password}
                type="password"
                autoComplete="current-password"
                onChange={onChanged2}
            />
            <p></p>
            <Button
                variant="contained"
                onClick={()=>{
                    fetch('http://localhost:8080/SIGNUP',requestOptionsSignUp)
                    .then((response)=> response.json())
                    .then((responseJson) =>{
                        ChangeInfo(responseJson.id,responseJson.name)
                    })
                    .catch(e=>{
                        console.log(e);
                    })
                }}
            >
                SignUp
            </Button>
            <Button
                variant="contained"
                onClick={()=>{
                    fetch("http://localhost:8080/LOGIN",requestOptionsLogin)
                    .then((response)=> response.json())
                    .then((responseJson) =>{
                        ChangeInfo(responseJson.id,responseJson.name)
                    })
                }}
            >
                Login
            </Button>
        </Box>
    );
}

export default LoginForm;