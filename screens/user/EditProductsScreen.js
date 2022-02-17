import React, { useState, useCallback, useEffect, useReducer} from 'react';
import {View, StyleSheet, ScrollView, Platform, Alert, KeyboardAvoidingView, ActivityIndicator} from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { useSelector, useDispatch } from 'react-redux';

import HeaderButton from '../../components/UI/HeaderButton';
import * as productsActions from '../../store/actions/products';
import Input from '../../components/UI/Input';
import Colors from '../../constants/Colors';

const FORM_INPUT_UPDATE = 'FORM_INPUT_UPDATE';

const formReducer = (state, action) => {
    if(action.type === 'FORM_INPUT_UPDATE'){
        const updatedValues = {
            ...state.inputValues,
            [action.input] : action.value
        };
        const updatedValidities = {
            ...state.inputValidities,
            [action.input] : action.isValid
        };
        let updatedFormIsValid = true;
        for (const key in updatedValidities){
            updatedFormIsValid = updatedFormIsValid && updatedValidities[key];
        }
        return {
            formIsValid: updatedFormIsValid,
            inputValidities: updatedValidities,
            inputValues: updatedValues
        };
    }
    return state;
}

//used outside of function component to avoid unnecessary recreation of that function and avoid to use useCallBack function so it won't rebuild with every render cycle
// Also beacause it doesn't depends on props

const EditProductScreen = props => {
    const [ isLoading, setIsLoading ] = useState(false);
    const [ error, setError ] = useState();

    const prodId = props.navigation.getParam('productId');

    const editedProduct = useSelector(state => 
        state.products.userProducts.find(prod => prod.id === prodId)
    );

    const dispatch = useDispatch();

    const [formState, dispatchFormState] = useReducer(formReducer, {
        inputValues: {
            title: editedProduct ? editedProduct.title : '',
            imageUrl: editedProduct ? editedProduct.imageUrl : '' ,
            description: editedProduct ? editedProduct.description : '',
            price: '',
        },

        inputValidities: {
            title: editedProduct ? true : false,
            imageUrl: editedProduct ? true : false,
            description: editedProduct ? true : false,
            price: editedProduct ? true : false,
        },
        
        formIsValid: editedProduct ? true : false
    });

    // const [titleIsValid, setTitileIsValid] = useState(false);
    // const [title, setTitle] = useState(editedProduct ? editedProduct.title : '');
    // const [imageUrl, setImageUrl] = useState( editedProduct ? editedProduct.imageUrl : '');
    // const [price, setPrice] = useState('');
    // const [description, setDescription] = useState(editedProduct ? editedProduct.description : '');

    // replaced useState with useReducer above


    useEffect(()=>{
        if(error) {
            Alert.alert('An error occured!', error, [{ text:'Okay'}])
        }
    }, [error]);

    const submitHandler = useCallback( async () => {
       // console.log('submitting')
       if(!formState.formIsValid){
           Alert.alert('Wrong Input!', 'Please check the errors in the form.', [{text:'Okay'}])
           return;
       }

       setError(null);
       setIsLoading(true);

       try{
        if(editedProduct){
            await dispatch(
                productsActions.updateProduct(
                   prodId, 
                   formState.inputValues.title, 
                   formState.inputValues.description,
                   formState.inputValues.imageUrl
            )
           )
       } else {
            await dispatch(
                productsActions.createProduct( 
                   formState.inputValues.title,
                   formState.inputValues.description, 
                   formState.inputValues.imageUrl, 
                   +formState.inputValues.price
                )
           );
          }
          props.navigation.goBack();
       } catch (err) {
           setError(err.message);
       }
       
       setIsLoading(false);

    }, [dispatch, prodId,formState] );

    useEffect(()=>{
        props.navigation.setParams({submit: submitHandler})
    }, [submitHandler])
    
    //to connect Header and component use setParams



    const inputChangeHandler = useCallback((inputIdentifier , inputValue, inputValidity) => {
        // let isValid = false;
        // if(text.trim().length > 0){
        //     isValid = true;
        //     // setTitileIsValid(true);
        // } 
        //.trim means white space is also not valid

        //setTitle(text);
        dispatchFormState({ 
            type: FORM_INPUT_UPDATE, 
            value: inputValue, 
            isValid: inputValidity,
            input: inputIdentifier
        })
    },[dispatchFormState])
    //to validate the input

    if(isLoading) {
        return <View style= {styles.centered}> 
                    <ActivityIndicator size='large' color={Colors.primary}/> 
                </View>
    }

    return(
        <KeyboardAvoidingView  behavior='padding' keyboardVerticalOffset={100}>
            <ScrollView>
            <View style={styles.form}>

            <Input
                id='title'
                label='Title'
                errorText = 'Please enter a valid title!'                
                keyboardType='default'
                autoCapitalize='sentences'
                autoCorrect
                returnKeyType='next'
                onInputChange = {inputChangeHandler}
                initialValue = {editedProduct ? editedProduct.title : ''}
                initiallyValid = {!!editedProduct}
                required
            />

            <Input
                id='imageUrl'
                label='Image URL'
                errorText = 'Please enter a valid image Url!'                
                keyboardType='default'
                returnKeyType='next'
                onInputChange = {inputChangeHandler}
                initialValue = {editedProduct ? editedProduct.imageUrl : ''}
                initiallyValid = {!!editedProduct}
                required
            />
         
            {editedProduct ? null : (
            <Input
                id='price'
                label='Price'
                errorText = 'Please enter a valid Price!'                
                keyboardType='decimal-pad'
                returnKeyType='next'
                onInputChange = {inputChangeHandler}
                required
                min = {0.1}
            />
            )}

             <Input
                id='description'
                label='Description'
                errorText = 'Please enter a valid Description!'                
                keyboardType='default'
                autoCapitalize='sentences'
                autoCorrect
                multiline
                numberOfLines={3}
                onInputChange = {inputChangeHandler}
                initialValue = {editedProduct ? editedProduct.description : ''}
                initiallyValid = {!!editedProduct}
                required
                minLength = {5}
            />
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
        
    )

    
};

EditProductScreen.navigationOptions = navData => {
    const submitFn = navData.navigation.getParam('submit');
    return {
        headerTitle: navData.navigation.getParam('productId')
        ? 'Edit Product'
        : 'Add Product',

        headerRight:()=>(
            <HeaderButtons HeaderButtonComponent={HeaderButton}>
                <Item
                    title = "Save"
                    iconName={Platform.OS === 'android' ? 'md-checkmark' : 'ios-checkmark'}
                    onPress = {submitFn}
                />
            </HeaderButtons>
        ),
    }
}

const styles = StyleSheet.create({
    form:{
        margin:20
    },
    centered:{
        flex:1,
        justifyContent: 'center',
        alignItems:'center'
    }
    
});

export default EditProductScreen;

///useReducer() is a function, that takes input and splits out an output
// it helps in state management when we have bunch of states to use using useState
