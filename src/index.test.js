import app from "./app.js"
import supertest from "supertest"
import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const request = supertest(app)

describe("Testing tests", () => {

    it("should test that true is true", () => {
        expect(true).toBe(true)
    })

})

describe("Testing endpoints", () => {

    beforeAll(done => {
        mongoose.connect(`${process.env.ATLAS_URL}/test`, () => {
            console.log("Connected to Atlas!")
            done()
        })
    })

    it("should test that the /test endpoint is returning 200 and a success message", async () => {
        const response = await request.get("/test")

        expect(response.status).toBe(200)
        expect(response.body.message).toBe("Test success!")
    })

    it("should test that the /products endpoint is returning a list of products", async () => {

        const response = await request.get("/products")

        expect(response.status).toBe(200)
        expect(response.body.length).toBeDefined()
    })

    const validProduct = {
        name: "iPhone",
        price: 900
    }

    const validGetProduct = {
        name: "Harry Potter Book",
        price: 50
    }

    const updateProduct ={
        name: "new product",
        price: 6000
    }

    const deleteProduct = {
        name: "samsung",
        price: 600
    }

    it("should test that the /products endpoint is letting POST a new product", async () => {
        const response = await request.post("/products").send(validProduct)

        expect(response.status).toBe(201)
        expect(response.body.name).toBe(validProduct.name)
    })

    it("should test that the /products endpoint is returning one product with the correct id", async () => {
        const response = await request.post("/products").send(validGetProduct)

        expect(response.status).toBe(201)
        expect(response.body.name).toBe(validGetProduct.name)

        const _id = response.body._id

        const getResponse = await request.get(`/products/${_id}`)
        expect(getResponse.body.name).toBe(validGetProduct.name)

    })

    it("should test that the /products/:id endpoint is returning updated data", async () => {
        const response = await request.post("/products").send(updateProduct)

        expect(response.status).toBe(201)
        expect(response.body.name).toBe(updateProduct.name)

        const _id = response.body._id

        const updateResponse = await request.put(`/products/${_id}`).send({name : "updated name"})
        expect(updateResponse.body.name).toBe("updated name")
        expect(typeof updateResponse.body.name).toBe("string")

    })

    it("should return a 404 at endpoint /products/:id if product with the id does not exist", async () => {

        const getResponse = await request.get(`/products/12545`)
        expect(getResponse.status).toBe(404)

    })

    it("should return a 204 at endpoint /products/:id when product is deleted", async () => {

        const response = await request.post("/products").send(deleteProduct)
        expect(response.status).toBe(201)
        expect(response.body.name).toBe(deleteProduct.name)

        const _id = response.body._id

        const deleteResponse = await request.delete(`/products/${_id}`)
        expect(deleteResponse.status).toBe(204)

    })

    afterAll(done => {
        mongoose.connection.dropDatabase().then(() => {
            mongoose.connection.close()
            done()
        })
    })

})