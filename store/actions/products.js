import Product from '../../models/product';

export const DELETE_PRODUCT = 'DELETE_PRODUCT';
export const CREATE_PRODUCT = 'CREATE_PRODUCT';
export const UPDATE_PRODUCT = 'UPDATE_PRODUCT';
export const SET_PRODUCTS = 'SET_PRODUCTS';

export const fetchProducts = () => {
    return async (dispatch, getState) => {
        const userId = getState().auth.userId;
        try{
            const response = await fetch('https://a2z-items-default-rtdb.firebaseio.com/products.json')
        
            if(!response.ok){
                throw new Error ('Something went wrong!');
            } 
            //if response is in 200 status code range
            //if it is in diff range-> ex, becoz you are not authenticated, then fetch API by default will not throw an error
            // to throuw error in >200 range, we use catch method below

            const resData = await response.json();
            const loadedProducts = [];
    
            for (const key in resData){
                loadedProducts.push(
                    new Product(
                        key, 
                        resData[key].ownerId, 
                        resData[key].title, 
                        resData[key].imageUrl, 
                        resData[key].description, 
                       
                        resData[key].price
                    ) //order of title, des, image , price is imp here
                );
    
            }
            //console.log(resData);
            dispatch({ 
                type: SET_PRODUCTS, 
                products:loadedProducts, 
                userProducts: loadedProducts.filter(prod => prod.ownerId === userId)
            })
    
            //for GET request= we don't need method as GET is default method for fetch, header and body
        } catch (err) {
            //send to custom analytics server
            throw err;
        }
        
    }// FETCHING PRODUCTS FROM SERVER CODE
}

export const deleteProduct = productId => {
    return async (dispatch, getState) => {
        const token = getState().auth.token;
        const response = await fetch(`https://a2z-items-default-rtdb.firebaseio.com/products/${productId}.json?auth=${token}`, {
            method: 'DELETE',                  //describe any HTTP methods like PUT, POST, GET
        })

        if(!response.ok){
            throw new Error('Something is wrong!')
        }

        dispatch({ type: DELETE_PRODUCT, pid: productId })
    }
}

export const createProduct = (title, description, imageUrl, price) => {
    return async (dispatch, getState) => {
        //can write here any ASYNC code you want

        const token = getState().auth.token;
        const userId = getState().auth.userId;

        //fetch is used for getting requesting, posting, putting request and any http request
        const response = await fetch(`https://a2z-items-default-rtdb.firebaseio.com/products.json?auth=${token}`, {
            method: 'POST',                  //describe any HTTP methods like PUT, POST, GET
            headers:{
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({           //stringify converts JS arrays or object into a string
                title,
                description,
                imageUrl,
                price,
                ownerId: userId
            })
        })
        // .then(response => { })
        //instead we can use ASNC dispatch and AWAIT which is similar to .then
        
        const resData = await response.json();

        //console.log(resData);

        dispatch({ 
            type: CREATE_PRODUCT, 
            productData: {
                id: resData.name,
                title,
                description,
                imageUrl, 
                price,
                ownerId: userId
            }
        });
    };
    //replace below code with above code - instead of just returning, return dispatch=>{dispatch({ })} that code to send it to server

    // return{
    //     type: CREATE_PRODUCT, 
    //     productData: {
    //         title,
    //         description,
    //         imageUrl, 
    //         price
    //     }
    // }
    
}

export const updateProduct = (id, title, description, imageUrl) => {
    return async (dispatch, getState)  => { 
         console.log(getState())
        const token = getState().auth.token;
        const response = await fetch( `https://a2z-items-default-rtdb.firebaseio.com/products/${id}.json?auth=${token}`, {
            method: 'PATCH',                  //describe any HTTP methods like PUT, POST, GET
            headers:{
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({           //stringify converts JS arrays or object into a string
                title,
                imageUrl,
                description,
            })
        })

        if(!response.ok){
            throw new Error('Something is wrong!')
        }

        dispatch({
            type: UPDATE_PRODUCT, 
            pid: id,
            productData: {
                title,
                imageUrl, 
                description,
            }
        })
    }
}