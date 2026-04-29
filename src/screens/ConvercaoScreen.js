import AntDesign from '@expo/vector-icons/AntDesign';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Text,
    TouchableOpacity,
    View,
    ScrollView
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

function initialScreen() {
    const fontePlayfairBold = { fontFamily: 'PlayfairDisplay-Bold' };

    const [cotacoes, setCotacoes] = useState([]);
    const [lastUpdate, setLastUpdate] = useState('--:--');
    const [loading, setLoading] = useState(false);

    function formatBrl(value) {
        const numberValue = Number(value);
        if (Number.isNaN(numberValue)) return 'R$ --';

        return numberValue.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    function formatVariation(value) {
        const numberValue = Number(value);
        if (Number.isNaN(numberValue)) return '0,00%';

        return Math.abs(numberValue).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + '%';
    }

    function getVariationColor(value) {
        const numberValue = Number(value);
        if (numberValue > 0) return 'green';
        if (numberValue < 0) return 'red';
        return '#6b7280';
    }

    function getVariationIcon(value) {
        const numberValue = Number(value);

        if (numberValue > 0) {
            return <AntDesign name="caret-up" size={16} color="green" />;
        }
        if (numberValue < 0) {
            return <AntDesign name="caret-down" size={16} color="red" />;
        }
        return <AntDesign name="minus" size={16} color="gray" />;
    }

    async function consultarDados() {
        try {
            setLoading(true);

            const response = await axios.get(
                'https://economia.awesomeapi.com.br/json/all'
            );

            const lista = Object.values(response.data).map((item) => ({
                code: item.code,
                codein: item.codein,
                name: item.name,
                value: item.bid,
                variation: item.pctChange
            }));

            setCotacoes(lista);

            setLastUpdate(
                new Date().toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            );

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        consultarDados();
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: '#e6e5e5' }}>

            {/* HEADER */}
            <View style={{
                backgroundColor: '#2F6FDB',
                height: 180,
                width: '100%',
                borderBottomRightRadius: 100,
                borderBottomLeftRadius: 100,
                alignItems: 'center'
            }}>

                <View style={{ marginTop: 40, alignItems: 'center' }}>
                    <Text style={[{ color: '#fff', fontSize: 34 }, fontePlayfairBold]}>
                        Conversor de
                    </Text>
                    <Text style={[{ color: '#fff', fontSize: 34 }, fontePlayfairBold]}>
                        Moedas <Text style={{ color: '#de0000' }}>Pro</Text>
                    </Text>
                </View>

                <View style={{
                    backgroundColor: '#fff',
                    width: 340,
                    height: 80,
                    marginTop: 25,
                    borderRadius: 15,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                        Cotação Atual
                    </Text>
                    <Text style={{ fontSize: 15 }}>
                        Última Atualização: {lastUpdate}
                    </Text>
                </View>
            </View>

         
            <ScrollView
                contentContainerStyle={{
                    alignItems: 'center',
                    paddingBottom: 40
                }}
            >

                {/* LISTA */}
                {cotacoes.map((item, index) => (
                    <View key={index} style={{
                        backgroundColor: '#fff',
                        width: 340,
                        height: 90,
                        borderRadius: 15,
                        marginTop: 20,
                        justifyContent: 'center'
                    }}>

                        {/* FLAGS */}
                        <View style={{ flexDirection: 'row', marginLeft: 10 }}>
                            {getFlagUrl(item.code) && (
                                <Image
                                    source={{ uri: getFlagUrl(item.code) }}
                                    style={{ width: 40, height: 40 }}
                                />
                            )}

                            <Image
                                source={require('../../assets/images/br.png')}
                                style={{ width: 30, height: 30, marginLeft: -10, marginTop: 10 }}
                            />
                        </View>

                     
                        <View style={{ position: 'absolute', left: 80 }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>
                                {item.code}/BRL
                            </Text>
                            <Text numberOfLines={1} style={{ width: 180 }}>
                                {item.name}
                            </Text>
                        </View>

                        {/* Estilo do valor anterior */}
                        <View style={{ position: 'absolute', right: 12 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                                {formatBrl(item.value)}
                            </Text>

                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {getVariationIcon(item.variation)}
                                <Text style={{
                                    marginLeft: 4,
                                    color: getVariationColor(item.variation)
                                }}>
                                    {Number(item.variation) > 0 ? '+' : ''}
                                    {formatVariation(item.variation)}
                                </Text>
                            </View>
                        </View>

                    </View>
                ))}

                
                <TouchableOpacity
                    style={{
                        backgroundColor: '#2F6FDB',
                        width: 360,
                        height: 60,
                        borderRadius: 30,
                        marginTop: 40,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onPress={consultarDados}
                    disabled={loading}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>
                        Atualizar Cotações
                    </Text>

                    {loading && (
                        <ActivityIndicator
                            size="small"
                            color="#fff"
                            style={{ position: 'absolute', right: 20 }}
                        />
                    )}
                </TouchableOpacity>

            </ScrollView>

        </View>
    );
}

export default initialScreen;
