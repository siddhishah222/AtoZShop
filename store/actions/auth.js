import AsyncStorage from '@react-native-async-storage/async-storage';
import { set } from 'react-native-reanimated';

// export const SIGNUP = 'SIGNUP';
// export const LOGIN = 'LOGIN';
export const AUTHENTICATE = 'AUTHENTICATE';
export const LOGOUT = 'LOGOUT';

let timer;

export const authenticate = (userId, token, expiryTime) => {
    return dispatch =>{
        dispatch(setLogoutTimer(expiryTime));
        dispatch( {
            type: AUTHENTICATE,
            userId: userId,
            token: token
        })
    }
}

export const signup = (email, password) => {
    return async dispatch => {
        const response = await fetch(
            'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCYR3ipp9pDKeb2qccK2qQexiivn6G_L68',
            {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    returnSecureToken: true
                })
            }
        );

        if( !response.ok ) {
            const errorResData = await response.json();
            //console.log(errorResData)
            const errorId = errorResData.error.message;

            let message = 'Something went wrong!';
            if( errorId === 'EMAIL_EXISTS') {
                message = 'This email already exists!';
            }
            throw new Error(message);
        }

        const resData = await response.json();
        console.log(resData);
        dispatch(authenticate(resData.localId, resData.idToken, parseInt(resData.expiresIn) * 1000));
        const expirationDate = new Date (
            new Date().getTime() + parseInt( resData.expiresIn ) * 1000
        );
        saveDataToSTorage(resData.idToken, resData.localId, expirationDate); 
    }
}

export const login = (email, password) => {
    return async dispatch => {
        const response = await fetch(
            'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCYR3ipp9pDKeb2qccK2qQexiivn6G_L68',
            {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    returnSecureToken: true
                })
            }
        );

        if( !response.ok ) {
            const errorResData = await response.json();
            //console.log(errorResData)
            const errorId = errorResData.error.message;

            let message = 'Something went wrong!';
            if( errorId === 'EMAIL_NOT_FOUND') {
                message = 'This email could not be found!';
            } else if (errorId === 'INVALID_PASSWORD'){
                message = 'This password is not valid!';
            }
            throw new Error(message);
        }

        const resData = await response.json();
        console.log(resData);
        //dispatch({ type:LOGIN, token:resData.idToken , userId: resData.localId });
        dispatch(authenticate(resData.localId, resData.idToken , parseInt(resData.expiresIn) * 1000));
        const expirationDate = new Date (
            new Date().getTime() + parseInt( resData.expiresIn ) * 1000
        );
        saveDataToSTorage(resData.idToken, resData.localId, expirationDate); 
        //auto login if authenticated user reload app
        //ParseInt to convert string into integer, *1000 to convert from sec to ms
        //new Date()-> is wrapped to convert it back from a huge ms number to a concrete timeStamo date object
    }
}

export const logout = () => {
    clearLogoutTimer();
    AsyncStorage.removeItem('userData');
    return {
        type: LOGOUT
    }
};

const clearLogoutTimer = () =>{
    if(timer){
        clearTimeout(timer);
    }
}

const setLogoutTimer = expirationTime => {
    return dispatch => {
        timer = setTimeout(()=>{
            dispatch(logout())
        } , expirationTime);
    }
}

const saveDataToSTorage = (token, userId, expirationDate) => {
    AsyncStorage.setItem('userData', JSON.stringify({
        token: token,
        userId: userId,
        expiryDate: expirationDate.toISOString()
    }))
};
//auto login if authenticated user reload app

//toISOString() will convert it to a string in a standarized format 
