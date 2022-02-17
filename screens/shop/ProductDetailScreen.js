import React from 'react';
import {View, Text, StyleSheet, Button, ScrollView, Image} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import * as cartActions from '../../store/actions/cart';
import Colors from '../../constants/Colors';

const ProductDetailScreen = props => {
    const productId = props.navigation.getParam('productId');
    const selectedProduct = useSelector( state => 
        state.products.availableProducts.find(prod => prod.id === productId) 
    );

    const dispatch = useDispatch();

    return (
       <ScrollView>
           <Image style={styles.image} source={{uri:selectedProduct.imageUrl}}/>

           <View style={styles.buttonCOntainer}>
                <Button color={Colors.primary} title="Add to cart" onPress={()=>{
                    dispatch(cartActions.addToCart(selectedProduct))
                }}/>
           </View>
           
           <Text style={styles.price}>${selectedProduct.price.toFixed(2)}</Text>
           <Text style={styles.description}>{selectedProduct.description}</Text>
       </ScrollView>
    )
};

ProductDetailScreen.navigationOptions = navData => {
    return{
        headerTitle: navData.navigation.getParam('productTitle')
    }
}

const styles = StyleSheet.create({
    image:{
        width:'100%',
        height:300
    },
    buttonCOntainer:{
        marginVertical:20,
        alignItems:'center'
    },
    price:{
        fontSize:20,
        color:'#888',
        textAlign:'center',
        //marginVertical:20,
        marginTop:10,
        marginBottom:20,
        fontFamily:'open-sans-bold'
    },
    description:{
        fontSize:14,
        textAlign:'center',
        marginHorizontal:25,
        fontFamily:'open-sans'
    }
})

export default ProductDetailScreen;