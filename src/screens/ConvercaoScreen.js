import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, Image, ActivityIndicator } from 'react-native';
import api from '../services/api';
import AntDesign from '@expo/vector-icons/AntDesign';

function initialScreen({ navigation }) {
    const fontePlayfairBold = { fontFamily: 'PlayfairDisplay-Bold' };

    const [cotacoes, setCotacoes] = useState({
        usd: { valor: 'R$ 0,00', variacao: 0 },
        eur: { valor: 'R$ 0,00', variacao: 0 },
        mxn: { valor: 'R$ 0,00', variacao: 0 }
    });
    const [lastUpdate, setLastUpdate] = useState('--:--');
    const [loading, setLoading] = useState(false);

    function formatBrl(value) {
        const numberValue = Number(value);
        if (Number.isNaN(numberValue)) {
            return 'R$ --';
        }
        return numberValue.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    function formatTime(value) {
        if (!value) {
            return '--:--';
        }
        const parsedDate = new Date(value.replace(' ', 'T'));
        if (Number.isNaN(parsedDate.getTime())) {
            return '--:--';
        }
        return parsedDate.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatVariation(value) {
        const numberValue = Number(value);

        if (Number.isNaN(numberValue)) {
            return '0,00%';
        }

        const absoluteFormatted = Math.abs(numberValue).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        if (numberValue > 0) {
            return <Text style={{ color: 'green', fontSize: 15 }}>+{absoluteFormatted}%</Text>;
        }

        if (numberValue < 0) {
            return <Text style={{ color: 'red', fontSize: 15 }}>-{absoluteFormatted}%</Text>;
        }

        return '0,00%';
    }

    function getVariationColor(value) {
        const numberValue = Number(value);

        if (numberValue > 0) {
            return '#00b309';
        }

        if (numberValue < 0) {
            return '#b30000';
        }

        return '#6b7280';
    }

    function getVariationIcon(value) {
        const numberValue = Number(value);
        if (numberValue > 0) {
            return <AntDesign name="caret-up" size={20} color="green" />;
        }
        if (numberValue < 0) {
            return <AntDesign name="caret-down" size={20} color="red" />;
        }
        return <AntDesign name="minus" size={20} color="black" />;
    }

    async function atualizaCotacoes() {
        try {
            setLoading(true);
            const response = await api.get('/last/USD-BRL,EUR-BRL,MXN-BRL');
            const { USDBRL, EURBRL, MXNBRL } = response.data;
            setCotacoes({
                usd: { valor: formatBrl(USDBRL?.bid), variacao: Number(USDBRL?.pctChange ?? 0) },
                eur: { valor: formatBrl(EURBRL?.bid), variacao: Number(EURBRL?.pctChange ?? 0) },
                mxn: { valor: formatBrl(MXNBRL?.bid), variacao: Number(MXNBRL?.pctChange ?? 0) }
            });
            setLastUpdate(
                new Date().toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            );
        } catch (error) {
            console.log('Erro ao atualizar cotações:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        atualizaCotacoes();
    }, []);

    return (
        <View style={{ flex: 1, height: '100%', width: '100%', backgroundColor: '#e6e5e5', alignItems: 'center' }}> 
            
            <View style={{ backgroundColor: '#2F6FDB', height: 180, width: '100%', borderBottomRightRadius: 100, borderBottomLeftRadius: 100, alignItems: 'center' }}>
                
                <View style={{ width: '100%', marginTop: 40, alignItems: 'center' }}>
                    <Text style={[{ color: '#ffffff', fontSize: 34, textAlign: 'center', lineHeight: 34 }, fontePlayfairBold]}>Conversor de</Text>
                    <Text style={[{ color: '#ffffff', fontSize: 34, textAlign: 'center', lineHeight: 34 }, fontePlayfairBold]}>
                        Moedas <Text style={[{ color: '#de0000' }, fontePlayfairBold]}>Pro</Text>
                    </Text>
                </View>

                {/* Cotacao atual */}

                <View style={{ backgroundColor: '#ffffff', width: 340, height: 80, marginTop: 25, borderRadius: 15, justifyContent: 'center', alignItems: 'center', shadowRadius: 8 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Cotação Atual</Text>
                    <Text style={{ fontSize: 15 }}>Ultima Atualização: {lastUpdate}</Text>
                </View>

            </View>

            {/* Conversão de dólar para real*/}

            <View style={{ backgroundColor: '#ffffff', width: 340, height: 90, borderRadius: 15, marginTop: 60,marginBottom: 25, shadowRadius: 8 }}>
                <View style={{ height: 50, width: 50, borderRadius: 20, marginBottom: -25, marginTop: 20, marginLeft: 10, overflow: 'hidden' }}>
                    <Image source={require('../../assets/images/us.png')} style={{ width: '100%', height: '100%' }} />
                </View>
                <View style={{ height: 40, width: 40, borderRadius: 20, marginLeft: 30, overflow: 'hidden' }}>
                    <Image source={require('../../assets/images/br.png')} style={{ width: '100%', height: '100%' }} />
                </View>
                <View style={{ position: 'absolute', left: 83, top: 18 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 20 }}>USD/BRL</Text>
                    <Text style={{ fontSize: 15 }}>1 Dólar americano</Text>
                </View>
                <View style={{ position: 'absolute', right: 12, top: 18 }}>
                    <Text style={{ alignItems: 'flex-end', fontSize: 18, fontWeight: 'bold' }}>{cotacoes.usd.valor}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 2 }}>
                        <Text style={{ color: getVariationColor(cotacoes.usd.variacao), fontSize: 13, fontWeight: 'bold', marginRight: 4 }}>{getVariationIcon(cotacoes.usd.variacao)}</Text>
                        <Text style={{ color: getVariationColor(cotacoes.usd.variacao), fontSize: 13, fontWeight: 'bold' }}>{formatVariation(cotacoes.usd.variacao)}</Text>
                    </View>
                </View>
            </View>

            {/* Conversão de euro para real*/}

            <View style={{ backgroundColor: '#ffffff', width: 340, height: 90, borderRadius: 15, shadowRadius: 8, marginTop: 11,marginBottom: 25  }}>
                <View style={{ height: 50, width: 50, borderRadius: 20, marginBottom: -25, marginTop: 20, marginLeft: 10, overflow: 'hidden' }}>
                    <Image source={require('../../assets/images/eu.png')} style={{ width: '100%', height: '100%' }} />
                </View>
                <View style={{ height: 40, width: 40, borderRadius: 20, marginLeft: 30, overflow: 'hidden' }}>
                    <Image source={require('../../assets/images/br.png')} style={{ width: '100%', height: '100%' }} />
                </View>
                <View style={{ position: 'absolute', left: 83, top: 18 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 20 }}>EUR/BRL</Text>
                    <Text style={{ fontSize: 15 }}>1 Euro</Text>
                </View>
                <View style={{ position: 'absolute', right: 12, top: 18 }}>
                    <Text style={{ alignItems: 'flex-end', fontSize: 18, fontWeight: 'bold' }}>{cotacoes.eur.valor}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 2 }}>
                        <Text style={{ color: getVariationColor(cotacoes.eur.variacao), fontSize: 13, fontWeight: 'bold', marginRight: 4 }}>{getVariationIcon(cotacoes.eur.variacao)}</Text>
                        <Text style={{ color: getVariationColor(cotacoes.eur.variacao), fontSize: 13, fontWeight: 'bold' }}>{formatVariation(cotacoes.eur.variacao)}</Text>
                    </View>
                </View>
            </View>

            {/* conversão de peso mexicano para real */}

            <View style={{ backgroundColor: '#ffffff', width: 340, height: 90, borderRadius: 15, shadowRadius: 8, marginTop: 11, marginBottom: 25 }}>
                <View style={{ height: 50, width: 50, borderRadius: 20, marginBottom: -25, marginTop: 20, marginLeft: 10, overflow: 'hidden' }}>
                    <Image source={require('../../assets/images/mxn.png')} style={{ width: '100%', height: '100%' }} />
                </View>
                <View style={{ height: 40, width: 40, borderRadius: 20, marginLeft: 30, overflow: 'hidden' }}>
                    <Image source={require('../../assets/images/br.png')} style={{ width: '100%', height: '100%' }} />
                </View>
                <View style={{ position: 'absolute', left: 83, top: 18 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 20 }}>MXN/BRL</Text>
                    <Text style={{ fontSize: 15 }}>1 Peso mexicano</Text>
                </View>
                <View style={{ position: 'absolute', right: 12, top: 18 }}>
                    <Text style={{ alignItems: 'flex-end', fontSize: 18, fontWeight: 'bold' }}>{cotacoes.mxn.valor}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 2 }}>
                        <Text style={{ color: getVariationColor(cotacoes.mxn.variacao), fontSize: 13, fontWeight: 'bold', marginRight: 4 }}>{getVariationIcon(cotacoes.mxn.variacao)}</Text>
                        <Text style={{ color: getVariationColor(cotacoes.mxn.variacao), fontSize: 13, fontWeight: 'bold' }}>{formatVariation(cotacoes.mxn.variacao)}</Text>
                    </View>
                </View>
            </View>

            {/* Atualizar Cotações */}

            <TouchableOpacity
                style={{ backgroundColor: '#2F6FDB', width: 360, height: 60, borderRadius: 30, marginTop: 80, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.4, shadowColor: '#3a2000' }}
                onPress={atualizaCotacoes}
                disabled={loading}
                activeOpacity={0.9}
            >
                <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 19 }}>Atualizar Cotações</Text>
                    {loading ? (
                        <View style={{ position: 'absolute', right: 18, top: 0, bottom: 0, justifyContent: 'center' }}>
                            <ActivityIndicator size="small" color="#fff" />
                        </View>
                    ) : null}
                </View>
            </TouchableOpacity>

        </View>
    )
};
export default initialScreen;
