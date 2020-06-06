import { Request, Response } from 'express'

import knex from '../database/connection'

export default class PointsController {

    async index(request: Request, response: Response) {

        const { city, uf, items } = request.query,
            parsedItems = String(items).split(',').map(item => Number(item.trim())),
            points = await knex('points')
                .join('point_items', 'points.id', '=', 'point_items.point_id')
                .whereIn('point_items.item_id', parsedItems)
                .where('city', String(city))
                .where('uf', String(uf))
                .select('points.*')
                .distinct()

        const serializedPoints = points.map(point => {
            return {
                ...point,
                image_url: `http://localhost:3333/uploads/${point.image}`,
            }
        })

        return response.json(serializedPoints)
    }

    async show(request: Request, response: Response) {

        const { id } = request.params,
            point = await knex('points').where('id', id).first()

        if (!point) return response.status(400).json({ message: 'Point not found.' })

        const serializedPoints = { ...point, image_url: `http://localhost:3333/uploads/${point.image}` }

        const items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id)
            .select('items.title')

        return response.json({ point: serializedPoints, items })
    }

    async create(request: Request, response: Response) {

        const { longitude, latitude, whatsapp, email, items, name, city, uf, } = request.body,
            trx = await knex.transaction(),
            insertedIds = await trx('points').insert({
                image: request.file.filename,
                longitude,
                latitude,
                whatsapp,
                email,
                name,
                city,
                uf,
            }), pointItems = items.split(',').map((item_id: number) => {
                return { item_id, point_id: insertedIds[0] }
            })

        await trx('point_items').insert(pointItems)

        await trx.commit()

        return response.json({ success: true })
    }
}