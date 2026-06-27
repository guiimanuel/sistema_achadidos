import React from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../components/colors.js';

const logoImage = require('../assets/images/mural-caixa.png');
const bottleImage = require('../assets/images/garrafa.png');
const notebookImage = require('../assets/images/caderno.png');
const caseImage = require('../assets/images/estojo.png');
const INSTITUTION_EMAIL = 'daee@jaboatao.ifpe.edu.br';

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

  if (text.includes('garrafa')) {
    return bottleImage;
  }

  if (text.includes('estojo')) {
    return caseImage;
  }

  if (text.includes('caderno')) {
    return notebookImage;
  }

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
  if (directDate) {
    return directDate;
  }

  const value = item?.createdAt || item?.updatedAt;
  if (!value) {
    return '';
  }

  const date =
    typeof value.toDate === 'function'
      ? value.toDate()
      : typeof value.seconds === 'number'
        ? new Date(value.seconds * 1000)
        : null;

  if (!date) {
    return '';
  }

  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(
    2,
    '0'
  )}/${date.getFullYear()}`;
}

function buildGmailComposeUrl({ to, subject, body }) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    to
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function InfoRow({ icon, label, value }) {
  if (!value) {
    return null;
  }

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

  async function openGmailContact(recipientEmail) {
    if (!recipientEmail) {
      Alert.alert('Contato', 'Procure a DAEE para solicitar mais informações sobre este item.');
      return;
    }

    const subject = `Sobre o item "${title}" no Achados e Perdidos`;
    const isInstitutionContact = recipientEmail === INSTITUTION_EMAIL;
    const body = [
      isInstitutionContact ? 'Ola, equipe da DAEE,' : 'Ola,',
      '',
      isInstitutionContact
        ? `Vi uma publicacao no app Achados e Perdidos sobre o item "${title}" e gostaria de pedir orientacao.`
        : `Vi sua publicacao no app Achados e Perdidos e gostaria de entrar em contato sobre o item "${title}".`,
      category ? `Categoria: ${category}` : null,
      location ? `Local informado: ${location}` : null,
      '',
      isInstitutionContact
        ? 'Voces podem me orientar sobre como proceder?'
        : 'Voce ainda esta com esse item?',
      '',
      'Obrigado.',
    ]
      .filter((line) => line !== null)
      .join('\n');

    try {
      await Linking.openURL(buildGmailComposeUrl({ to: recipientEmail, subject, body }));
    } catch (error) {
      console.log('Erro ao abrir Gmail:', error);
      Alert.alert('Contato', 'Não foi possível abrir o Gmail. Tente novamente.');
    }
  }

  function handlePublisherContactPress() {
    openGmailContact(ownerEmail);
  }

  function handleInstitutionContactPress() {
    openGmailContact(INSTITUTION_EMAIL);
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
          <Ionicons name="arrow-back" size={22} color="#ffffff" />
        </Pressable>
        <Text style={styles.missingTitle}>Publicação não encontrada</Text>
        <Text style={styles.missingText}>Volte para o mural e escolha outro item.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
            <Ionicons name="arrow-back" size={22} color="#ffffff" />
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

          <View style={styles.infoPanel}>
            <InfoRow icon="pricetag-outline" label="Categoria" value={category} />
            <InfoRow icon="calendar-outline" label="Publicado em" value={dateText} />
            <InfoRow icon="location-outline" label="Local" value={location} />
            <InfoRow icon="mail-outline" label="Contato" value={ownerEmail} />
          </View>

          <View style={styles.contactArea}>
            <Text style={styles.helpText}>
              Esse item é seu? Entre em contato com quem publicou ou fale com a DAEE.
            </Text>
            <Pressable
              accessibilityRole="button"
              style={styles.contactButton}
              onPress={handlePublisherContactPress}
            >
              <Ionicons name="mail-outline" size={21} color="#ffffff" />
              <Text style={styles.contactButtonText}>Contatar publicador</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              style={[styles.contactButton, styles.institutionButton]}
              onPress={handleInstitutionContactPress}
            >
              <Ionicons name="business-outline" size={21} color={colors.green_primary} />
              <Text style={[styles.contactButtonText, styles.institutionButtonText]}>
                Contatar DAEE
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default ItemFullScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f2',
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
    top: 18,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.46)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPill: {
    position: 'absolute',
    left: 18,
    bottom: 18,
    maxWidth: '82%',
    minHeight: 36,
    borderRadius: 10,
    backgroundColor: colors.green_primary,
    justifyContent: 'center',
    paddingHorizontal: 13,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'MontserratSemiBold',
  },
  details: {
    paddingHorizontal: 18,
    paddingTop: 22,
    gap: 18,
  },
  title: {
    color: '#142018',
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
    color: '#2e352f',
    fontSize: 16,
    lineHeight: 23,
    fontFamily: 'MontserratMedium',
  },
  infoPanel: {
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dfe7db',
    backgroundColor: '#ffffff',
    boxShadow: '0 6px 14px rgba(36, 51, 37, 0.08)',
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
  contactArea: {
    gap: 14,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dfe7db',
    backgroundColor: '#ffffff',
    boxShadow: '0 6px 14px rgba(36, 51, 37, 0.08)',
  },
  helpText: {
    color: '#2e352f',
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 21,
    fontFamily: 'MontserratSemiBold',
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
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: colors.green_primary,
  },
  contactButtonText: {
    color: '#ffffff',
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
    backgroundColor: '#f6f7f2',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
  },
  missingBackButton: {
    position: 'absolute',
    top: 18,
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
});
