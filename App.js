import React, { useState } from 'react';
import { View } from 'react-native';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import { Provider } from 'react-redux';
import AppLoading from 'expo-app-loading';
//import {AppLoading} from 'expo';
import * as Font from 'expo-font';
//import { composeWithDevTools } from 'redux-devtools-extension';

import productsReducer from './store/reducers/products';
// import ShopNavigator from './navigation/ShopNavigator';
import cartReducer from './store/reducers/cart';
import orderReducer from './store/reducers/orders';
import authReducer from './store/reducers/auth';
import NavigationContainer from './navigation/NavigationContainer';

const rootReducer = combineReducers({
  products: productsReducer,
  cart: cartReducer,
  orders: orderReducer,
  auth: authReducer //it will allow to access the token 
});

//const store = createStore(rootReducer, composeWithDevTools());
const store = createStore(rootReducer, applyMiddleware(ReduxThunk));

const fetchFonts = () =>{
  return Font.loadAsync({
    'open-sans-bold': require('./assets/fonts/OpenSans-Bold.ttf'),
    'open-sans':require('./assets/fonts/OpenSans-Regular.ttf')
  })
}


export default function App() {
  const [fontLoaded, setFontLoaded] = useState(false);

  if(!fontLoaded){
    return(
      <AppLoading 
        startAsync = {fetchFonts} 
        onFinish = {() => setFontLoaded(true)} 
        onError={() => console.log('error')} 
      />
    )
  }

  return (
   <Provider store={store}>
     <NavigationContainer/>
   </Provider>
  );
}


//test git