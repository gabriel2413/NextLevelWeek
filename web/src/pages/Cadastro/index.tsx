import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet'
import { Link, useHistory } from 'react-router-dom'
import { LeafletMouseEvent } from 'leaflet'
import axios from 'axios'

import Dropzone from '../../components/Dropzone'
import logo from '../../assets/logo.svg'
import api from '../../services/api'
import './styles.css'

interface Item {
    id: number
    title: string
    image_url: string
}

interface IBGEUFResponse {
    sigla: string
}

interface IBGECITYResponse {
    nome: string
}

const Cadastro = () => {

    const [items, setItems] = useState<Array<Item>>([])
    const [selectedItems, setSelectItems] = useState<Array<number>>([])

    const [ufs, setUfs] = useState<Array<string>>([])
    const [selectedUf, setSelectedUf] = useState('0')

    const [cities, setCities] = useState<Array<string>>([])
    const [selectedCity, setSelectedCity] = useState('0')

    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0])
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0])

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    })

    const [pointCreated, setPoinCreated] = useState<boolean>(false)

    const [selectedFile, setSelectedFile] = useState<File>()

    const history = useHistory()

    useEffect(() => { api.get('items').then(response => setItems(response.data)) }, [])

    useEffect(() => {

        axios.get<Array<IBGEUFResponse>>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
            .then(response => setUfs(response.data.map(uf => uf.sigla)))
    }, [])

    useEffect(() => {

        navigator.geolocation.getCurrentPosition(position => setInitialPosition([position.coords.latitude, position.coords.longitude]))
    }, [])

    useEffect(() => {

        if (selectedUf !== '0') axios.get<Array<IBGECITYResponse>>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
            .then(response => setCities(response.data.map(city => city.nome)))
    }, [selectedUf])

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {

        setSelectedUf(event.target.value)
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {

        setSelectedCity(event.target.value)
    }

    function handleMapClick(event: LeafletMouseEvent) {

        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng,
        ])
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {

        setFormData({ ...formData, [event.target.name]: event.target.value })
    }

    function handleSelectItem(id: number) {

        const alreadySelected = selectedItems.findIndex(item => item === id)

        if (alreadySelected >= 0) {
            const filteredItems = selectedItems.filter(item => item !== id)

            setSelectItems(filteredItems)
        } else {

            setSelectItems([...selectedItems, id])
        }
    }

    async function handleSubmit(event: FormEvent) {

        event.preventDefault()

        const [latitude, longitude] = selectedPosition,
            { name, email, whatsapp } = formData,
            items = selectedItems,
            city = selectedCity,
            uf = selectedUf,
            data = new FormData()

        data.append('name', name)
        data.append('email', email)
        data.append('whatsapp', whatsapp)
        data.append('uf', uf)
        data.append('city', city)
        data.append('latitude', String(latitude))
        data.append('longitude', String(longitude))
        data.append('items', items.join(','))

        if (selectedFile) data.append('image', selectedFile)

        await api.post('points', data)

        setPoinCreated(true)

        setTimeout(() => {
            history.push('/')
        }, 2000)
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"></img>

                <Link to="/">
                    <FiArrowLeft />
                        Voltar para a home
                    </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br /> ponto de coleta</h1>

                <Dropzone onFileUploaded={setSelectedFile} />

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">

                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>

                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">
                                Estado (UF)
                            </label>
                            <select name="uf" id="uf" value={selectedUf} onChange={handleSelectUf}>
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">
                                Cidade
                            </label>
                            <select name="city" id="city" value={selectedCity} onChange={handleSelectCity}>
                                <option value="0">Selecione uma Cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítems de coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li
                                key={item.id}
                                onClick={() => handleSelectItem(item.id)}
                                className={selectedItems.includes(item.id) ? 'selected' : ''}
                            >
                                <img src={item.image_url} alt={item.title} />
                                <span>{item.title}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>

                <button type="submit">Cadastrar ponto de coleta</button>
            </form>

            {pointCreated && (
                <div id="success-message">
                    <FiCheckCircle color="#34CB79" size={32} />
                    <h2>Cadastro concluído!</h2>
                </div>
            )}
        </div>
    )
}

export default Cadastro