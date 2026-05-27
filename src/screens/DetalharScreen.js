import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';

import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  View,
  TouchableOpacity
} from 'react-native';

export default function DetailsScreen({ route }) {

  const navigation = useNavigation();

  const { countryName } = route.params;

  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);

  async function getCountryDetails() {

    try {

      const response = await axios.get(
        `https://restcountries.com/v3.1/name/${countryName}`
      );

      setCountry(response.data[0]);

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getCountryDetails();
  }, []);

  if (loading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <ActivityIndicator
          size="large"
          color="#2F6FDB"
        />
      </View>
    );
  }

  return (

    <ScrollView style={{
      flex: 1,
      backgroundColor: '#F3F6FB'
    }}>

     <TouchableOpacity
  onPress={() => navigation.goBack()}
  style={{
    position:'absolute',
    top:50,
    left:20,
    zIndex:10,
    backgroundColor:'rgba(0,0,0,0.4)',
    width:40,
    height:40,
    borderRadius:20,
    justifyContent:'center',
    alignItems:'center'
  }}
>

  <AntDesign
    name="left"
    size={22}
    color="#fff"
  />



      </TouchableOpacity>

      {/* IMAGEM GRANDE */}
      <Image
        source={{
          uri: country.flags.png
        }}
        style={{
          width: '100%',
          height: 250
        }}
      />

      {/* CARD */}
      <View style={{
        backgroundColor: '#fff',
        margin: 15,
        borderRadius: 20,
        padding: 20,
        elevation: 4
      }}>

        {/* BANDEIRA */}
        <Image
          source={{
            uri: country.flags.png
          }}
          style={{
            width: 60,
            height: 40,
            borderRadius: 5
          }}
        />

        {/* NOME */}
        <Text style={{
          fontSize: 30,
          fontWeight: 'bold',
          marginTop: 15
        }}>
          {country.name.common}
        </Text>

        {/* NOME OFICIAL */}
        <Text style={{
          color: 'gray',
          marginBottom: 25
        }}>
          {country.name.official}
        </Text>

  <Info
  icon="pushpin"
  label="Capital"
  value={country.capital?.[0]}
/>

<Info
  icon="earth"
  label="Região"
  value={country.region}
/>

<Info
  icon="global"
  label="Sub-região"
  value={country.subregion}
/>

<Info
  icon="clockcircle"
  label="Fuso horário"
  value={country.timezones?.[0]}
/>

      </View>

    </ScrollView>
  );
}

function Info({ icon, label, value }) {

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 18
    }}>

      <AntDesign
        name={icon}
        size={18}
        color="gray"
      />

      <Text style={{
        marginLeft: 10,
        flex: 1,
        color: 'gray'
      }}>
        {label}
      </Text>

      <Text style={{
        fontWeight: 'bold'
      }}>
        {value || '-'}
      </Text>

    </View>
  );
}