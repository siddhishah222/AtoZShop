import Order from "../../models/order";

export const ADD_ORDER = 'ADD_ORDER';
export const SET_ORDERS = 'SET_ORDERS';

export const fetchOrders = () => {
    return async (dispatch, getState) => {
        const userId = getState().auth.userId;
        try{
            const response = await fetch(`https://a2z-items-default-rtdb.firebaseio.com/orders/${userId}.json`)
        
            if(!response.ok){
                throw new Error ('Something went wrong!');
            } 
            //if response is in 200 status code range
            //if it is in diff range-> ex, becoz you are not authenticated, then fetch API by default will not throw an error
            // to throuw error in >200 range, we use catch method below

            const resData = await response.json();
            const loadedOrders = [];
    
            for (const key in resData){
                loadedOrders.push(
                    new Order(
                       key,
                       resData[key].cartItems,
                       resData[key].totalAmount,
                       new Date(resData[key].date)
                    ) 
                );
    
            }

        dispatch({ type: SET_ORDERS, orders: loadedOrders})
    } catch (err) {
        throw err;
    }
    }
};

export const addOrder = (cartItems, totalAmount) => {
    return async (dispatch, getState) => {
        const token = getState().auth.token;
        const userId = getState().auth.userId;
        const date = new Date();

        const response = await fetch(`https://a2z-items-default-rtdb.firebaseio.com/orders/${userId}.json?auth=${token}`, {
            method: 'POST',                  //describe any HTTP methods like PUT, POST, GET
            headers:{
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({           //stringify converts JS arrays or object into a string
                cartItems,
                totalAmount,
                date: date. toISOString()
            })
        })
        // .then(response => { })
        //instead we can use ASNC dispatch and AWAIT which is similar to .then
        
        if(!response.ok) {
            throw new Error ('Something went wrong!')
        }

        const resData = await response.json();

        dispatch({
            type: ADD_ORDER, 
            orderData: {
                id: resData.name,
                items: cartItems, 
                amount: totalAmount,
                date: date
            }
        })
    }
};