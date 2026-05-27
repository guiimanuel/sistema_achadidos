import AntDesign from '@expo/vector-icons/AntDesign';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {ActivityIndicator,Image,ScrollView,Text,TextInput,TouchableOpacity,View} from 'react-native';

export default function InitialScreen() {

  const navigation = useNavigation();

  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);

  async function getCountries() {

    try {

      setLoading(true);

      const response = await axios.get(
        'https://restcountries.com/v3.1/all?fields=name,capital,flags'
      );

      const lista = response.data.sort((a, b) =>
        a.name.common.localeCompare(b.name.common)
      );

      setCountries(lista);

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getCountries();
  }, []);

  return (

    <View style={{
      flex: 1,
      backgroundColor: '#F3F6FB'
    }}>

      <View style={{
        backgroundColor: '#2F6FDB',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 25,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30
      }}>

        <Text style={{
          color: '#fff',
          fontSize: 26,
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          Países
        </Text>

        <View style={{
          backgroundColor: '#fff',
          height: 45,
          borderRadius: 12,
          marginTop: 20,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12
        }}>

          <AntDesign
            name="search1"
            size={18}
            color="gray"
          />

          <TextInput
            placeholder="Pesquisar país..."
            style={{
              marginLeft: 10,
              flex: 1
            }}
          />

        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('AlterarSenhaScreen')}
        >
          <Text style={{
            color: '#fff',
            marginTop: 15,
            textAlign: 'center'
          }}>
            Esqueceu a senha?{" "}

            <Text style={{
              fontWeight: 'bold',
              textDecorationLine: 'underline'
            }}>
              Clique aqui
            </Text>

          </Text>
        </TouchableOpacity>

      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 15
        }}
      >

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#2F6FDB"
          />
        ) : (

          countries.map((item, index) => (

            <TouchableOpacity
              key={index}
              style={{
                backgroundColor: '#fff',
                height: 80,
                borderRadius: 18,
                marginBottom: 15,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 15,
                elevation: 2
              }}
            >

              <Image
                source={{
                  uri: item.flags.png
                }}
                style={{
                  width: 50,
                  height: 35,
                  borderRadius: 5
                }}
              />

              <View style={{
                marginLeft: 15,
                flex: 1
              }}>

                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold'
                }}>
                  {item.name.common}
                </Text>

                <Text style={{
                  color: 'gray'
                }}>
                  Capital: {item.capital?.[0] || 'Sem capital'}
                </Text>

              </View>

              <AntDesign
                name="right"
                size={18}
                color="gray"
              />

            </TouchableOpacity>

          ))
        )}

      </ScrollView>

    </View>
  );
}