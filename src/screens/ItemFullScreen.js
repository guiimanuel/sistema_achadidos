import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors.js';

const logoImage = require('../assets/images/mural-caixa.png');
const bottleImage = require('../assets/images/garrafa.png');
const notebookImage = require('../assets/images/caderno.png');
const caseImage = require('../assets/images/estojo.png');
const INSTITUTION_EMAIL = 'daee@jaboatao.ifpe.edu.br';

// CREDENCIAIS DO EMAILJS (Substitua pelos dados da sua conta se for usar em produção)
const EMAILJS_SERVICE_ID = 'SEU_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'SEU_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY = 'SUA_PUBLIC_KEY';

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function firstValue(item, keys, fallback = '') {
  for (const key of keys) {
    const value = item?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return fallback;
}

function getFallbackImage(item) {
  const text = normalizeText(
    `${firstValue(item, ['title', 'titulo', 'nome'])} ${firstValue(item, [
      'category',
      'categoria',
      'filtro',
    ])}`
  );

  if (text.includes('garrafa')) return bottleImage;
  if (text.includes('estojo')) return caseImage;
  if (text.includes('caderno')) return notebookImage;

  return logoImage;
}

function getImageSource(item) {
  const imageUrl = firstValue(item, ['imageUrl', 'imagem', 'fotoUrl', 'photoUrl', 'image', 'foto']);

  if (/^(https?:|file:|data:image\/)/i.test(imageUrl)) {
    return { uri: imageUrl };
  }

  return getFallbackImage(item);
}

function formatDateFromItem(item) {
  const directDate = firstValue(item, ['dateText', 'data', 'createdAtText', 'updatedAtText']);
  if (directDate) return directDate;

  const value = item?.createdAt || item?.updatedAt;
  if (!value) return '';

  const date =
    typeof value.toDate === 'function'
      ? value.toDate()
      : typeof value.seconds === 'number'
        ? new Date(value.seconds * 1000)
        : null;

  if (!date) return '';

  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(
    2,
    '0'
  )}/${date.getFullYear()}`;
}

function InfoRow({ icon, label, value }) {
  if (!value) return null;

  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={colors.green_primary} />
      </View>
      <View style={styles.infoTextWrap}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text selectable style={styles.infoValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function ItemFullScreen({ navigation, route }) {
  const item = route?.params?.item;

  const title = firstValue(item, ['title', 'titulo', 'nome', 'name'], 'Item sem título');
  const description = firstValue(
    item,
    ['description', 'descricao', 'texto', 'text', 'detalhes'],
    'Sem descrição informada.'
  );
  const category = firstValue(item, ['category', 'categoria', 'filtro', 'tipo']);
  const location = firstValue(item, ['location', 'local', 'lugar']);
  const dateText = formatDateFromItem(item);
  const ownerEmail = firstValue(item, ['ownerEmail', 'userEmail', 'email', 'usuarioEmail']);

  // Estados do Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  function openEmailModal(recipientEmail, isInstitution = false) {
    if (!recipientEmail) {
      Alert.alert('Aviso', 'E-mail de destino não encontrado.');
      return;
    }
    setIsSuccess(false); // Garante que abre o formulário
    setTargetEmail(recipientEmail);
    setSubject(`Sobre o item "${title}" - Achados e Perdidos`);
    setMessage(
      isInstitution
        ? `Olá equipe da DAEE,\n\nGostaria de obter mais detalhes sobre o item "${title}" encontrado no mural.`
        : `Olá,\n\nAcredito que o item "${title}" publicado no mural seja meu.`
    );
    setModalVisible(true);
  }

  async function handleSendEmail() {
    if (!message.trim()) {
      Alert.alert('Atenção', 'Por favor, escreva uma mensagem antes de enviar.');
      return;
    }

    setIsSending(true);

    try {
      // Se não houver chaves reais configuradas ainda, simula o envio com sucesso para testes do app
      if (EMAILJS_SERVICE_ID === 'SEU_SERVICE_ID') {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setIsSuccess(true);
        setMessage('');
        setSenderName('');
        return;
      }

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            to_email: targetEmail,
            from_name: senderName || 'Usuário do App',
            item_title: title,
            subject: subject,
            message: message,
          },
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        setMessage('');
        setSenderName('');
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Falha na resposta do serviço de envio.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro ao enviar', 'Não foi possível enviar o e-mail. Verifique a conexão ou as chaves da API.');
    } finally {
      setIsSending(false);
    }
  }

  if (!item) {
    return (
      <View style={styles.missingContainer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          style={styles.missingBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </Pressable>
        <Text style={styles.missingTitle}>Publicação não encontrada</Text>
        <Text style={styles.missingText}>Volte para o mural e escolha outro item.</Text>
      </View>
    );
  }

  return (
    <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        style={styles.container}> 
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.hero}>
          <Image source={getImageSource(item)} style={styles.heroImage} resizeMode="cover" />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </Pressable>
        </View>

        <View style={styles.details}>
          <Text selectable style={styles.title}>
            {title}
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text selectable style={styles.description}>
              {description}
            </Text>
          </View>

          <View style={styles.card}>
            <InfoRow icon="pricetag-outline" label="Categoria" value={category} />
            <InfoRow icon="calendar-outline" label="Publicado em" value={dateText} />
            <InfoRow icon="location-outline" label="Local" value={location} />
            <InfoRow icon="mail-outline" label="Contato" value={ownerEmail} />
          </View>

          <View style={styles.card}>
            <Text style={styles.helpText}>
              Esse item é seu? Entre em contato com quem publicou ou fale com a DAEE.
            </Text>

            <Pressable
              accessibilityRole="button"
              style={styles.contactButton}
              onPress={() => openEmailModal(ownerEmail, false)}
            >
              <Ionicons name="mail-outline" size={21} color={colors.white} />
              <Text style={styles.contactButtonText}>Contatar publicador</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              style={[styles.contactButton, styles.institutionButton]}
              onPress={() => openEmailModal(INSTITUTION_EMAIL, true)}
            >
              <Ionicons name="business-outline" size={21} color={colors.green_primary} />
              <Text style={[styles.contactButtonText, styles.institutionButtonText]}>
                Contatar DAEE
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* MODAL COM FORMULÁRIO OU TELA DE SUCESSO */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {isSuccess ? (
              /* AVISO DIRETO NA TELA */
              <View style={styles.successWrapper}>
                <Ionicons name="checkmark-circle" size={72} color={colors.green_primary} />
                <Text style={styles.successTitle}>E-mail enviado com sucesso!</Text>
                <Text style={styles.successDescription}>
                  Sua mensagem foi enviada para{' '}
                  <Text style={styles.modalBold}>{targetEmail}</Text>.
                </Text>

                <Pressable
                  style={styles.successBtn}
                  onPress={() => {
                    setModalVisible(false);
                    setIsSuccess(false);
                  }}
                >
                  <Text style={styles.successBtnText}>Concluir</Text>
                </Pressable>
              </View>
            ) : (
              /* FORMULÁRIO */
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Enviar Mensagem</Text>
                  <Pressable onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color={colors.text_primary} />
                  </Pressable>
                </View>

                <Text style={styles.modalSub}>
                  Destinatário: <Text style={styles.modalBold}>{targetEmail}</Text>
                </Text>

                <Text style={styles.inputLabel}>Seu Nome / Matrícula</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Maria Clara"
                  value={senderName}
                  onChangeText={setSenderName}
                  placeholderTextColor={colors.gray_placeholder}
                />

                <Text style={styles.inputLabel}>Assunto</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Assunto"
                  value={subject}
                  onChangeText={setSubject}
                  placeholderTextColor={colors.gray_placeholder}
                />

                <Text style={styles.inputLabel}>Mensagem</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Escreva sua mensagem aqui..."
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  placeholderTextColor={colors.gray_placeholder}
                />

                <View style={styles.modalActions}>
                  <Pressable
                    style={[styles.actionBtn, styles.cancelBtn]}
                    onPress={() => setModalVisible(false)}
                    disabled={isSending}
                  >
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.actionBtn, styles.sendBtn]}
                    onPress={handleSendEmail}
                    disabled={isSending}
                  >
                    {isSending ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <Text style={styles.sendBtnText}>Enviar</Text>
                    )}
                  </Pressable>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

export default ItemFullScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screen_background,
  },
  content: {
    paddingBottom: 32,
  },
  hero: {
    width: '100%',
    height: 310,
    backgroundColor: '#e5ebe1',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 24,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.46)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  details: {
    paddingHorizontal: 18,
    paddingTop: 22,
    gap: 18,
  },
  title: {
    color: colors.text_title,
    fontSize: 28,
    lineHeight: 34,
    fontFamily: 'MontserratExtraBold',
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: colors.green_primary,
    fontSize: 16,
    fontFamily: 'MontserratBold',
  },
  description: {
    color: colors.text_body,
    fontSize: 16,
    lineHeight: 23,
    fontFamily: 'MontserratMedium',
  },
  card: {
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dfe7db',
    backgroundColor: colors.white,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow_green,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 6px 14px rgba(36, 51, 37, 0.08)',
      },
    }),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 44,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#edf6ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextWrap: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    color: '#6b7568',
    fontSize: 12,
    fontFamily: 'MontserratSemiBold',
  },
  infoValue: {
    color: '#1f2b22',
    fontSize: 15,
    lineHeight: 20,
    fontFamily: 'MontserratMedium',
  },
  helpText: {
    color: colors.text_body,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 21,
    fontFamily: 'MontserratSemiBold',
    marginBottom: 4,
  },
  contactButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: 10,
    backgroundColor: colors.green_primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
  },
  institutionButton: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.green_primary,
  },
  contactButtonText: {
    color: colors.white,
    fontSize: 17,
    lineHeight: 22,
    textAlign: 'center',
    fontFamily: 'MontserratBold',
  },
  institutionButtonText: {
    color: colors.green_primary,
  },
  missingContainer: {
    flex: 1,
    backgroundColor: colors.screen_background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
  },
  missingBackButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 24,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.green_primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingTitle: {
    color: colors.green_primary,
    fontSize: 22,
    textAlign: 'center',
    fontFamily: 'MontserratBold',
  },
  missingText: {
    color: '#5f695d',
    fontSize: 15,
    textAlign: 'center',
    fontFamily: 'MontserratMedium',
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 22,
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'MontserratBold',
    color: colors.green_primary,
  },
  modalSub: {
    fontSize: 13,
    color: colors.text_secondary,
    marginBottom: 16,
  },
  modalBold: {
    fontFamily: 'MontserratBold',
    color: colors.text_title,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: 'MontserratSemiBold',
    color: colors.text_primary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dcdcdc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    fontFamily: 'MontserratMedium',
    fontSize: 14,
    backgroundColor: '#fafafa',
    color: colors.text_primary,
  },
  textArea: {
    minHeight: 110,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  actionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#eaeaea',
  },
  cancelBtnText: {
    color: '#444',
    fontFamily: 'MontserratSemiBold',
  },
  sendBtn: {
    backgroundColor: colors.green_primary,
  },
  sendBtnText: {
    color: colors.white,
    fontFamily: 'MontserratBold',
  },

  /* Card de Sucesso exibido no Modal */
  successWrapper: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  successTitle: {
    fontSize: 22,
    fontFamily: 'MontserratBold',
    color: colors.green_primary,
    marginTop: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  successDescription: {
    fontSize: 15,
    fontFamily: 'MontserratMedium',
    color: colors.text_secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  successBtn: {
    backgroundColor: colors.green_primary,
    paddingVertical: 13,
    paddingHorizontal: 36,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  successBtnText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: 'MontserratBold',
  },
});
