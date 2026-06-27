import * as React from "react";
import { StatusBar } from "expo-status-bar";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { colors } from '../components/colors.js';
import { auth } from "../utils/firebase.js";

function AlterarSenhaScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const recuperarSenha = () => {
        if (!email) {
            alert("Digite seu e-mail.");
            return;
        }

        sendPasswordResetEmail(auth, email)
            .then(() => {
                alert("E-mail de recuperação enviado com sucesso!");
                navigation.goBack();
            })
            .catch((error) => {
                alert("Erro ao enviar e-mail de recuperação.");
                console.log(error);
            });
    };

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
        
            <Text style={styles.title}>ALTERAR SENHA</Text>
            <Text style={styles.subtitle}>
                Digite o e-mail da sua conta para receber o link de recuperação.
            </Text>

            <TextInput
                placeholder="Email institucional..."
                style={styles.input}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor={colors.gray}
            />
    
            <TouchableOpacity style={styles.button} onPress={recuperarSenha}>
                <Text style={styles.buttonText}>Enviar E-mail</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.link}>Voltar para o Login</Text>
            </TouchableOpacity>
        </View>
    );
}

export default AlterarSenhaScreen;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 65,
        backgroundColor: colors.white_background,
    },
    title: {
        fontSize: 30,
        fontWeight: "bold",
        textAlign: "center",
        color: colors.green_primary,
        marginBottom: 20,
    },
    subtitle: {
        textAlign: "center",
        marginBottom: 30,
        fontSize: 16,
    },
    input: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.blue_border,
        marginBottom: 50,
    },
    button: {
        backgroundColor: colors.green_primary,
        padding: 15,
        borderRadius: 8,
        marginBottom: 3,
    },
    buttonText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "bold",
    },
    link: {
        textAlign: "center",
        marginTop: 10,
        color: colors.green_primary,
    },
});
