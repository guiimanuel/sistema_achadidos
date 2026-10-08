import { AppAlert as Alert } from '../services/alerts.js';
import * as React from "react";
import { Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { colors } from '../styles/colors.js';
import { criarConta, salvarNomeUsuario } from "../services/auth.js";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

function CadastroScreen({ navigation }) {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [cadastrando, setCadastrando] = useState(false);
    const [usuarioPendente, setUsuarioPendente] = useState(null);

    const registerUser = async () => {
        if (cadastrando) return;
        const nomeLimpo = nome.trim();
        const emailLimpo = email.trim().toLowerCase();
        if (!nomeLimpo) {
            Alert.alert('Aviso', 'Informe seu nome para se cadastrar');
            return;
        }
        if (!emailLimpo.endsWith('@discente.ifpe.edu.br')) {
            Alert.alert('Aviso', 'É permitido apenas e-mail institucional (@discente.ifpe.edu.br)');
            return;
        }
        setCadastrando(true);
        try {
            if (usuarioPendente) {
                await salvarNomeUsuario(usuarioPendente, nomeLimpo);
            } else {
                await criarConta(emailLimpo, senha, nomeLimpo);
            }
            navigation.goBack();
        } catch (error) {
            console.log(error.code, error.message);
            if (error.usuarioCriado || usuarioPendente) {
                setUsuarioPendente(error.usuarioCriado || usuarioPendente);
                Alert.alert('Aviso', 'Sua conta foi criada, mas não foi possível salvar o nome. Toque em Concluir cadastro para tentar novamente.');
            } else {
                Alert.alert('Aviso', 'Erro ao cadastrar usuário');
            }
        } finally {
            setCadastrando(false);
        }
    };
    return (
    <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
    >
        <Text style={styles.title}>CRIAR CONTA</Text>
        <Text style={styles.title1}>Preencha os dados pra se cadastrar</Text>


        <Text style={styles.titulop}>Nome completo</Text>
        <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Digite seu nome completo..."
            placeholderTextColor={colors.gray_placeholder}
            autoCapitalize="words"
            autoComplete="name"
            accessibilityLabel="Nome"
            editable={!cadastrando}
        />

         <Text style={styles.titulop}>
                Email
              </Text>
               <Text style={styles.title3}>*Apenas email institucional</Text>

        <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!cadastrando && !usuarioPendente}
            placeholder="Digite seu email..."
            placeholderTextColor={colors.gray_placeholder}
        />
         <Text style={styles.titulop}>
                Senha
              </Text>

        <TextInput
            style={styles.input}
            value={senha}
            onChangeText={setSenha}
            placeholder="Digite sua senha..."
            placeholderTextColor={colors.gray_placeholder}
            secureTextEntry
            editable={!cadastrando && !usuarioPendente}
        />

        <TouchableOpacity
            style={[styles.button, cadastrando && styles.buttonDisabled]}
            onPress={registerUser}
            disabled={cadastrando}
        >
            <Text style={styles.buttonText}>
                {cadastrando ? 'Salvando...' : usuarioPendente ? 'Concluir cadastro' : 'Cadastrar'}
            </Text>
        </TouchableOpacity>

        <TouchableOpacity disabled={cadastrando} onPress={() => navigation.goBack()}>
            <Text style={styles.link}>Voltar para login</Text>
        </TouchableOpacity>
    </KeyboardAwareScrollView>
    );
}
export default CadastroScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white_background,
    },
    contentContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 32,
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
        marginBottom: 40,
    },
    title3: {
        justifyContent: 'center',
        color: colors.gray_placeholder,
        fontSize: 12,
        marginBottom: 2,
    },
    input: {
        backgroundColor: colors.white,
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        borderColor: colors.blue_border,
        borderWidth: 1,
    },

     titulop:  {
    fontSize: 15,
    marginBottom: 4,
    color: '#101010',
    fontFamily: 'MontserratMedium',
  },

    button: {
        backgroundColor: colors.green_primary,
        padding: 12,
        marginBottom: 1,
        marginTop: 30,
        borderRadius: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        fontWeight: 'bold',
        color: colors.white,
        textAlign: 'center',
    },
    link: {
        textAlign: 'center',
        marginTop: 10,
        color: colors.green_primary
    }
});
