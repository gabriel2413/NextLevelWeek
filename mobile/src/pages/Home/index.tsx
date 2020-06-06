import React, { useEffect, useState } from 'react'
import { View, ImageBackground, StyleSheet, Image, Text } from 'react-native'
import { RectButton } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native'
import RNPickerSelect from 'react-native-picker-select'

import { Feather as Icon } from '@expo/vector-icons'

import axios from 'axios'

interface IBGEUFResponse {
  nome: string
  sigla: string
}

interface IBGECITYResponse {
  nome: string
}

interface UFItems {
  key: string
  label: string,
  value: string
}

interface CITYItems {
  key: string
  label: string,
  value: string
}

const Home = () => {

  const navigation = useNavigation()

  const [ufItems, setUfItems] = useState<Array<UFItems>>([])
  const [selectedUf, setSelectedUf] = useState('0')

  const [cityItems, setCityItems] = useState<Array<CITYItems>>([])
  const [selectedCity, setSelectedCity] = useState('0')

  useEffect(() => {

    axios.get<Array<IBGEUFResponse>>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(response => {
        const ufs = response.data.map(uf => ({
          key: uf.nome,
          label: uf.nome,
          value: uf.sigla
        }))

        setUfItems(ufs)
      })
  }, [])

  useEffect(() => {
    
    if (selectedUf === '0') return

    axios.get<Array<IBGECITYResponse>>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
      .then(response => {
        const cities = response.data.map(city => ({
          key: city.nome,
          label: city.nome,
          value: city.nome
        }))

        setCityItems(cities)
      })
  }, [selectedUf])

  function handleNavigateToPoints() {
    
    navigation.navigate('Points', {
      uf: selectedUf,
      city: selectedCity
    })
  }

  return (
    <ImageBackground
      source={require('../../assets/home-background.png')}
      imageStyle={{ width: 274, height: 368 }}
      style={styles.container}
    >
      <View style={styles.main}>
        <Image source={require('../../assets/logo.png')} />
        <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
        <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente</Text>
      </View>

      <View style={styles.footer}>
        <RNPickerSelect
          onValueChange={(value) => setSelectedUf(value)}
          useNativeAndroidPickerStyle={false}
          style={pickerStyle}
          value={selectedUf}
          items={ufItems}
          placeholder={{
            label: 'Selecione um Estado',
            value: '',
          }}
          Icon={() => {
            return <Icon name="arrow-down-left" size={24} color="#322153" />
          }}
        />
        <RNPickerSelect
          onValueChange={(value) => setSelectedCity(value)}
          useNativeAndroidPickerStyle={false}
          style={pickerStyle}
          value={selectedCity}
          items={cityItems}
          placeholder={{ label: 'Selecione uma Cidade', value: '' }}
          Icon={() => {
            return <Icon name="arrow-down-left" size={24} color="#322153" />
          }}
        />

        <RectButton style={styles.button} onPress={handleNavigateToPoints}>
          <View style={styles.buttonIcon}>
            <Icon name="arrow-right" color="#FFF" size={24} />
          </View>
          <Text style={styles.buttonText}>
            Entrar
          </Text>
        </RectButton>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {},

  input: {
    fontFamily:'Ubuntu_700Bold',
    backgroundColor: '#FFF',
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#322153",
    borderRadius: 8,
    paddingRight: 30, // to ensure the text is never behind the icon
  },

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  }
})

const pickerStyle = {
  inputIOS: styles.input,
  inputAndroid: styles.input,
  iconContainer: {
    top: 14,
    right: 12,
  },
}

export default Home