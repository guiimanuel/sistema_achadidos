import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, Image, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { colors } from '../components/colors.js';
function loginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const auth = getAuth();

    const signInUser = () => {
        signInWithEmailAndPassword(auth, email, senha)
            .then((userCredential) => {
                const user = userCredential.user;
                navigation.navigate('Home', user);
            })
            .catch(() => {
                alert('Email ou senha inválidos!');
            });
    };

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />


            <Image
                style={styles.image}
                source={require('../../assets/images/caixa.png')}
            />
            <Text style={styles.title}>BEM VINDO</Text>
            
            <Text style={styles.titlemini}>Faça o seu login com{" "}
            <Text style={styles.titlemini2}>email e senha</Text>
            </Text>

            <TextInput
                placeholder="Email institucional..."
                style={styles.input}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor={colors.gray_placeholder}
            />

            <TextInput
                placeholder="Senha..."
                secureTextEntry
                style={styles.input}
                value={senha}
                onChangeText={setSenha}
                placeholderTextColor={colors.gray_placeholder}
            />

            <TouchableOpacity style={styles.button} onPress={signInUser}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
                <Text style={styles.link}>Ainda não tem conta? {" "}
                <Text style={styles.link2}>Cadastre-se</Text>
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('AlterarSenhaScreen')}>
                <Text style={styles.link}>Esqueceu a senha? {" "}
                <Text style={styles.link2}>Alterar</Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
}
export default loginScreen;

const styles = StyleSheet.create({
    container: {
        backgroundColor: white_background,
        flex: 1,
        justifyContent: 'center',
        padding: 65
    },
    title: {
        fontSize: 34,
        textAlign: 'center',
        fontWeight: 'bold',
        color: colors.green_primary,
    },
    titlemini: {
        fontSize: 17,
        marginBottom:100,
        textAlign: 'center',
        color: colors.green_primary,
    },
    titlemini2: {
        fontSize: 17,
        marginBottom:100,
        textAlign: 'center',
        color: colors.green_primary
    },
    image: {
        width: 250,
        height: 184,
        alignSelf: 'center',
    },
    input: {
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        borderColor: colors.blue_border,
        borderWidth: 1,
    },
    button: {
        backgroundColor: colors.green_primary, 
        padding: 12,
        marginBottom: 11,
        marginTop: 30,
        borderRadius: 8
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    link: {
        textAlign: 'left',
    },
    link2: {
        textAlign: 'left',
        color: colors.green_primary,
        fontSize: 15,
    }
});