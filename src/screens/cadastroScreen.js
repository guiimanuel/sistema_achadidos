import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { colors } from '../components/colors.js';

function registerScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const auth = getAuth();
    const registerUser = () => {
        const emailLimpo = email.trim().toLowerCase();
        if (!emailLimpo.endsWith('@discente.ifpe.edu.br')) {
            alert('É permitido apenas e-mail institucional (@discente.ifpe.edu.br)');
            return;
        }
        createUserWithEmailAndPassword(auth, emailLimpo, senha)
            .then((userCredential) => {
                navigation.goBack();
            })
            .catch((error) => {
                console.log(error.code, error.message);
                alert('Erro ao cadastrar usuário');
            });
    };
    return (
    <View style={styles.container}>
        <StatusBar style="auto" />

        <Text style={styles.title}>CRIAR CONTA</Text>
        <Text style={styles.title1}>Preencha os dados pra se cadastrar</Text>
        <Text style={styles.title3}>*Apenas email institucional</Text>

        <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Novo email..."
            placeholderTextColor={colors.placeholder}
        />

        <TextInput
            style={styles.input}
            value={senha}
            onChangeText={setSenha}
            placeholder="Nova senha..."
            placeholderTextColor={colors.placeholder}
            secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={registerUser}>
            <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.link}>Voltar para login</Text>
        </TouchableOpacity>
    </View>
    );
}
export default registerScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white_background,
        justifyContent: 'center',
        padding: 65,
    },
    title: {
        textAlign: 'center',
        color: colors.green_primary,
        fontSize: 35,
        marginBottom: 10,
        fontWeight: 'bold',

    },
    title1: {
        textAlign: 'center',
        color: colors.green_primary,
        fontSize: 17,
        marginBottom: 100,
    },
    title3: {
        justifyContent: 'center',
        color: colors.gray_placeholder,
        fontSize: 14,
        marginBottom: 2,
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
        marginBottom: 1,
        marginTop: 30,
        borderRadius: 8,
    },
    buttonText: {
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    link: {
        textAlign: 'center',
        marginTop: 10,
        color: colors.green_primary
    }
});