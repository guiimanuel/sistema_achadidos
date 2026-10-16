import { AppAlert as Alert } from '../services/alerts.js';
import * as React from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { useState } from "react";

import { colors } from '../styles/colors.js';
import { enviarRedefinicaoDeSenha } from "../services/auth.js";
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

function AlterarSenhaScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const recuperarSenha = () => {
        if (!email) {
            Alert.alert('Aviso', "Digite seu e-mail.");
            return;
        }

        enviarRedefinicaoDeSenha(email)
            .then(() => {
                Alert.toast('E-mail enviado', "Confira sua caixa de entrada para recuperar a senha.");
                navigation.goBack();
            })
            .catch((error) => {
                Alert.alert('Aviso', "Erro ao enviar e-mail de recuperação.", undefined, { variant: 'error' });
                console.log(error);
            });
    };

    return (
        <KeyboardAwareScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            bottomOffset={24}
            keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <Text accessibilityRole="header" style={styles.title}>Recupere sua senha</Text>
            <Text style={styles.subtitle}>
                Informe seu e-mail para receber um link de recuperação.
            </Text>


      <Text style={styles.titulop}>
        Email
      </Text>
            <TextInput
                placeholder="Digite seu e-mail..."
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                accessibilityLabel="E-mail da sua conta"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor={colors.gray_placeholder}
            />

            <TouchableOpacity style={styles.button} onPress={recuperarSenha}>
                <Text style={styles.buttonText}>Enviar E-mail</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                <Text style={styles.link}>Voltar para o mural</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
    );
}

export default AlterarSenhaScreen;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white_background,
    },
    contentContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 56,
        paddingHorizontal: 24,
    },
    form: {
        width: '100%',
        maxWidth: 380,
        alignSelf: 'center',
    },
    title: {
        fontSize: 28,
        lineHeight: 36,
        letterSpacing: -0.5,
        textAlign: 'center',
        color: colors.green_dark,
        fontFamily: 'MontserratBold',
        marginBottom: 8,
        maxWidth: 380,
        alignSelf: 'center',
    },
    subtitle: {
        textAlign: "center",
        marginBottom: 32,
        fontSize: 15,
        lineHeight: 23,
        color: colors.text_secondary,
        fontFamily: 'MontserratRegular',
        maxWidth: 340,
        alignSelf: 'center',
    },
    input: {
        backgroundColor: colors.white,
        width: '100%',
        height: 55,
        paddingHorizontal: 16,
        paddingVertical: 0,
        fontFamily: 'MontserratRegular',
        fontSize: 14,
        lineHeight: 22,
        textAlignVertical: 'center',
        includeFontPadding: false,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.blue_border,
        marginBottom: 10,
    },
    button: {
        backgroundColor: colors.green_primary,
        padding: 12,
        width: '100%',
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginBottom: 5,
        marginTop: 30,
    },

    titulop:  {
    fontSize: 15,
    marginBottom: 4,
    color: '#101010',
    fontFamily: 'MontserratMedium',
  },
    buttonText: {
        color: colors.white,
        textAlign: "center",
      fontFamily: 'MontserratBold',
        fontSize: 14
    },
    link: {
        textAlign: "center",
        marginTop: 10,
        color: colors.green_primary,
      fontFamily: 'MontserratMedium',
        fontSize: 14
    },
});
