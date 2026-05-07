import AntDesign from '@expo/vector-icons/AntDesign';
import axios from 'axios';
import { useEffect, useState } from 'react';

import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

function getFlagUrl(code) {

    const map = {
        USD: 'us',
        EUR: 'eu',
        GBP: 'gb',
        JPY: 'jp',
        AUD: 'au',
        CAD: 'ca',
        CHF: 'ch',
        CNY: 'cn',
        ARS: 'ar',
        MXN: 'mx'
    };

    const country = map[code];

    if (!country) return null;

    return `https://flagcdn.com/w80/${country}.png`;
}

export default function InitialScreen() {

    const [cotacoes, setCotacoes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState('--:--');

    async function consultarDados() {

        try {

            setLoading(true);

            const response = await axios({
                method: 'GET',
                url: 'https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,GBP-BRL,JPY-BRL',
                timeout: 15000
            });

            console.log('API OK:', response.data);

            const lista = Object.values(response.data).map((item) => ({
                code: item.code,
                name: item.name,
                value: item.bid,
                variation: item.pctChange
            }));

            setCotacoes(lista);

            const hora = new Date().toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });

            setLastUpdate(hora);

        } catch (error) {

            console.log('ERRO COMPLETO:', error);

            Alert.alert(
                'Erro',
                'Não foi possível carregar as cotações.'
            );

        } finally {

            setLoading(false);
        }
    }

    useEffect(() => {
        consultarDados();
    }, []);

    function formatBrl(value) {

        const numero = Number(value);

        if (isNaN(numero)) {
            return 'R$ --';
        }

        return `R$ ${numero.toFixed(2).replace('.', ',')}`;
    }

    function getColor(value) {

        const numero = Number(value);

        if (numero > 0) return 'green';

        if (numero < 0) return 'red';

        return 'gray';
    }

    function getIcon(value) {

        const numero = Number(value);

        if (numero > 0) {
            return (
                <AntDesign
                    name="caret-up"
                    size={14}
                    color="green"
                />
            );
        }

        if (numero < 0) {
            return (
                <AntDesign
                    name="caret-down"
                    size={14}
                    color="red"
                />
            );
        }

        return (
            <AntDesign
                name="minus"
                size={14}
                color="gray"
            />
        );
    }

    return (

        <View style={{
            flex: 1,
            backgroundColor: '#ececec'
        }}>

            {/* HEADER */}
            <View style={{
                backgroundColor: '#2F6FDB',
                height: 180,
                borderBottomLeftRadius: 100,
                borderBottomRightRadius: 100,
                alignItems: 'center'
            }}>

                <View style={{
                    marginTop: 45,
                    alignItems: 'center'
                }}>

                    <Text style={{
                        color: '#fff',
                        fontSize: 32,
                        fontWeight: 'bold'
                    }}>
                        Conversor de
                    </Text>

                    <Text style={{
                        color: '#fff',
                        fontSize: 32,
                        fontWeight: 'bold'
                    }}>
                        Moedas
                    </Text>

                </View>

                <View style={{
                    backgroundColor: '#fff',
                    width: 330,
                    height: 75,
                    marginTop: 20,
                    borderRadius: 15,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>

                    <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold'
                    }}>
                        Cotação Atual
                    </Text>

                    <Text>
                        Última atualização: {lastUpdate}
                    </Text>

                </View>

            </View>

            {/* LISTA */}
            <ScrollView
                contentContainerStyle={{
                    alignItems: 'center',
                    paddingBottom: 40
                }}
            >

                {cotacoes.map((item, index) => (

                    <View
                        key={index}
                        style={{
                            backgroundColor: '#fff',
                            width: 340,
                            height: 95,
                            marginTop: 20,
                            borderRadius: 15,
                            justifyContent: 'center'
                        }}
                    >

                        {/* BANDEIRAS */}
                        <View style={{
                            flexDirection: 'row',
                            marginLeft: 10
                        }}>

                            {getFlagUrl(item.code) && (
                                <Image
                                    source={{
                                        uri: getFlagUrl(item.code)
                                    }}
                                    style={{
                                        width: 40,
                                        height: 40
                                    }}
                                />
                            )}

                            <Image
                                source={require('../../assets/images/br.png')}
                                style={{
                                    width: 30,
                                    height: 30,
                                    marginLeft: -10,
                                    marginTop: 10
                                }}
                            />

                        </View>

                        {/* TEXTO */}
                        <View style={{
                            position: 'absolute',
                            left: 80
                        }}>

                            <Text style={{
                                fontSize: 18,
                                fontWeight: 'bold'
                            }}>
                                {item.code}/BRL
                            </Text>

                            <Text
                                numberOfLines={1}
                                style={{
                                    width: 160
                                }}
                            >
                                {item.name}
                            </Text>

                        </View>

                        {/* VALOR */}
                        <View style={{
                            position: 'absolute',
                            right: 12
                        }}>

                            <Text style={{
                                fontSize: 18,
                                fontWeight: 'bold'
                            }}>
                                {formatBrl(item.value)}
                            </Text>

                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}>

                                {getIcon(item.variation)}

                                <Text style={{
                                    marginLeft: 4,
                                    color: getColor(item.variation)
                                }}>
                                    {Number(item.variation) > 0 ? '+' : ''}
                                    {Math.abs(
                                        Number(item.variation)
                                    ).toFixed(2)}%
                                </Text>

                            </View>

                        </View>

                    </View>

                ))}

                {/* BOTÃO */}
                <TouchableOpacity
                    onPress={consultarDados}
                    disabled={loading}
                    style={{
                        backgroundColor: '#2F6FDB',
                        width: 340,
                        height: 60,
                        borderRadius: 30,
                        marginTop: 35,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >

                    <Text style={{
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: 18
                    }}>
                        Atualizar Cotações
                    </Text>

                    {loading && (
                        <ActivityIndicator
                            color="#fff"
                            style={{
                                position: 'absolute',
                                right: 20
                            }}
                        />
                    )}

                </TouchableOpacity>

            </ScrollView>

        </View>
    );
}